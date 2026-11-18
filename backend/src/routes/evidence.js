const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const pool = require('../utils/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `evidence_${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only JPG, PNG and WebP images are accepted.'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ── POST /api/evidence/:incidentId — upload evidence ─────────
router.post('/:incidentId', authenticate, upload.single('image'), [
  body('notes').optional().trim(),
  body('evidence_type').optional().isIn(['resolution_photo','before_photo','after_photo','inspection_photo'])
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ errors: errors.array() });
  }
  if (!req.file) return res.status(400).json({ error: 'Image file required.' });

  try {
    const incident = await pool.query('SELECT id, status FROM incidents WHERE id = $1', [req.params.incidentId]);
    if (!incident.rows.length) return res.status(404).json({ error: 'Incident not found.' });

    const imagePath = `/uploads/${req.file.filename}`;
    const { notes, evidence_type = 'resolution_photo' } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO resolution_evidence (incident_id, uploaded_by, image_path, notes, evidence_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.incidentId, req.user.id, imagePath, notes || null, evidence_type]
    );

    res.status(201).json({ message: 'Evidence uploaded.', evidence: rows[0] });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(err);
  }
});

// ── GET /api/evidence/:incidentId — list evidence ────────────
router.get('/:incidentId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT re.*, u.name as uploaded_by_name
       FROM resolution_evidence re
       LEFT JOIN users u ON u.id = re.uploaded_by
       WHERE re.incident_id = $1 ORDER BY re.created_at DESC`,
      [req.params.incidentId]
    );
    res.json({ evidence: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
