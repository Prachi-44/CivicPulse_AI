const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { body, query, param, validationResult } = require('express-validator');
const pool = require('../utils/db');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── Multer Storage ────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only JPG, PNG and WebP images are accepted.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }
});

// ── Helper: generate incident code ───────────────────────────
async function generateIncidentCode() {
  const year = new Date().getFullYear();
  const { rows } = await pool.query('SELECT COUNT(*) FROM incidents WHERE incident_code LIKE $1', [`PUN-${year}-%`]);
  const seq = parseInt(rows[0].count) + 1;
  return `PUN-${year}-${String(seq).padStart(4, '0')}`;
}

// ── POST /api/incidents — submit new incident ─────────────────
router.post('/', authenticate, upload.single('image'), [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['pothole','garbage','water_leakage','drainage','streetlight','road_damage','other']),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('address').optional().trim(),
  body('ward').optional().trim()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, category, latitude, longitude, address, ward } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  const incidentCode = await generateIncidentCode();

  try {
    // Insert incident
    const { rows } = await pool.query(
      `INSERT INTO incidents (
        incident_code, title, description, category, latitude, longitude, address, ward,
        reporter_id, image_path, status, priority
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'reported','medium')
       RETURNING *`,
      [incidentCode, title, description, category, latitude, longitude, address, ward, req.user.id, imagePath]
    );
    const incident = rows[0];

    // Insert initial status history
    await pool.query(
      `INSERT INTO status_history (incident_id, to_status, changed_by, remark)
       VALUES ($1, 'reported', $2, 'Incident submitted by citizen')`,
      [incident.id, req.user.id]
    );

    // Async AI Analysis — don't block the response
    analyzeIncidentAsync(incident, req.file?.path).catch(err =>
      console.error('[AI] Analysis failed:', err.message)
    );

    res.status(201).json({
      message: 'Incident submitted successfully.',
      incident: {
        id: incident.id,
        incident_code: incident.incident_code,
        status: incident.status,
        category: incident.category
      }
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path).catch(() => {});
    next(err);
  }
});

// ── Async AI Analysis ─────────────────────────────────────────
async function analyzeIncidentAsync(incident, imagePath) {
  try {
    const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    const FormData = require('form-data');
    const form = new FormData();
    form.append('incident_id', incident.id);
    form.append('title', incident.title);
    form.append('description', incident.description);
    form.append('category', incident.category);
    form.append('latitude', incident.latitude.toString());
    form.append('longitude', incident.longitude.toString());

    // Fetch candidate incidents for proximity duplicate matching
    try {
      const candidatesRes = await pool.query('SELECT * FROM incident_summary');
      const candidates = (candidatesRes.rows || []).map(c => ({
        id: c.id,
        incident_code: c.incident_code,
        title: c.title,
        category: c.category,
        latitude: c.latitude,
        longitude: c.longitude,
        status: c.status
      }));
      form.append('candidates', JSON.stringify(candidates));
    } catch (_) {}

    if (imagePath && fs.existsSync(imagePath)) {
      form.append('image', fs.createReadStream(imagePath));
    }

    const aiRes = await axios.post(`${AI_URL}/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const result = aiRes.data;

    // Update incident with AI results
    await pool.query(
      `UPDATE incidents SET
        ai_category_suggestion = $1,
        ai_priority_suggestion = $2,
        ai_confidence_score    = $3,
        ai_analysis_notes      = $4,
        priority               = $5,
        severity_score         = $6,
        priority_score         = $7,
        is_duplicate           = $8,
        duplicate_group_id     = $9,
        assigned_dept          = $10
       WHERE id = $11`,
      [
        result.category_suggestion,
        result.priority_suggestion,
        result.confidence_score,
        result.analysis_notes,
        result.priority_suggestion || incident.priority,
        result.severity_score || 5,
        result.priority_score || 5.0,
        result.is_duplicate || false,
        result.duplicate_group_id || null,
        result.assigned_dept || null,
        incident.id
      ]
    );

    // If duplicate found, update status to under_review
    if (result.is_duplicate) {
      await pool.query(
        `UPDATE incidents SET status = 'under_review' WHERE id = $1`,
        [incident.id]
      );
    }

    console.log(`[AI] Analysis complete for ${incident.incident_code}: priority=${result.priority_suggestion}, duplicate=${result.is_duplicate}`);
  } catch (err) {
    console.error('[AI] Analysis error:', err.message);
    // Don't fail silently — set fallback
    await pool.query(
      `UPDATE incidents SET
        ai_analysis_notes = 'AI service unavailable. Manual review required.',
        priority = 'medium'
       WHERE id = $1`,
      [incident.id]
    );
  }
}

// ── GET /api/incidents — list incidents ───────────────────────
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, status, category, priority, ward,
      mine, search, sort = 'created_at', order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let p = 1;

    if (status)   { conditions.push(`status = $${p++}`);   params.push(status); }
    if (category) { conditions.push(`category = $${p++}`); params.push(category); }
    if (priority) { conditions.push(`priority = $${p++}`); params.push(priority); }
    if (ward)     { conditions.push(`ward ILIKE $${p++}`); params.push(`%${ward}%`); }
    if (mine && req.user) {
      conditions.push(`reporter_id = $${p++}`);
      params.push(req.user.id);
    }
    if (search) {
      conditions.push(`(title ILIKE $${p} OR description ILIKE $${p} OR incident_code ILIKE $${p})`);
      params.push(`%${search}%`); p++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSorts = ['created_at','updated_at','priority_score','status'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortDir = order === 'asc' ? 'ASC' : 'DESC';

    const [countRes, dataRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM incident_summary ${where}`, params),
      pool.query(
        `SELECT * FROM incident_summary ${where}
         ORDER BY ${sortCol} ${sortDir}
         LIMIT $${p} OFFSET $${p+1}`,
        [...params, parseInt(limit), offset]
      )
    ]);

    res.json({
      data: dataRes.rows,
      pagination: {
        total: parseInt(countRes.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(parseInt(countRes.rows[0].count) / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/incidents/:id ────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM incident_summary WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Incident not found.' });

    // Fetch related data
    const [historyRes, evidenceRes, feedbackRes] = await Promise.all([
      pool.query(
        `SELECT sh.*, u.name as changed_by_name
         FROM status_history sh LEFT JOIN users u ON u.id = sh.changed_by
         WHERE sh.incident_id = $1 ORDER BY sh.created_at ASC`,
        [req.params.id]
      ),
      pool.query(
        `SELECT re.*, u.name as uploaded_by_name
         FROM resolution_evidence re LEFT JOIN users u ON u.id = re.uploaded_by
         WHERE re.incident_id = $1 ORDER BY re.created_at DESC`,
        [req.params.id]
      ),
      pool.query(
        'SELECT * FROM citizen_feedback WHERE incident_id = $1 ORDER BY created_at DESC',
        [req.params.id]
      )
    ]);

    res.json({
      incident: rows[0],
      status_history: historyRes.rows,
      evidence: evidenceRes.rows,
      feedback: feedbackRes.rows
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/incidents/:id — update status (admin) ─────────
router.patch('/:id', authenticate, requireAdmin, [
  body('status').optional().isIn(['reported','under_review','assigned','in_progress','resolved','verified','rejected']),
  body('priority').optional().isIn(['low','medium','high','critical']),
  body('assigned_dept').optional().isIn(['roads','solid_waste','water_supply','storm_water','street_lighting','general']),
  body('remark').optional().trim()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { status, priority, assigned_dept, remark } = req.body;
  try {
    const current = await pool.query('SELECT * FROM incidents WHERE id = $1', [req.params.id]);
    if (!current.rows.length) return res.status(404).json({ error: 'Incident not found.' });

    const incident = current.rows[0];
    const updates = [];
    const params = [];
    let p = 1;

    if (status)       { updates.push(`status = $${p++}`);       params.push(status); }
    if (priority)     { updates.push(`priority = $${p++}`);     params.push(priority); }
    if (assigned_dept){ updates.push(`assigned_dept = $${p++}`);params.push(assigned_dept); }

    if (updates.length) {
      await pool.query(
        `UPDATE incidents SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${p}`,
        [...params, req.params.id]
      );
    }

    // Log status change
    if (status && status !== incident.status) {
      await pool.query(
        `INSERT INTO status_history (incident_id, from_status, to_status, changed_by, remark)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.params.id, incident.status, status, req.user.id, remark || null]
      );
    }

    const { rows } = await pool.query('SELECT * FROM incident_summary WHERE id = $1', [req.params.id]);
    res.json({ message: 'Incident updated.', incident: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/incidents/my/list — citizen's own incidents ──────
router.get('/my/list', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM incident_summary WHERE reporter_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
