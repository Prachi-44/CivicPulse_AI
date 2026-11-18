const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../utils/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/feedback/:incidentId ───────────────────────────
router.post('/:incidentId', authenticate, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('feedback_text').optional().trim(),
  body('is_satisfied').optional().isBoolean(),
  body('challenge_flag').optional().isBoolean(),
  body('challenge_reason').optional().trim()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const incident = await pool.query(
      'SELECT id, status FROM incidents WHERE id = $1', [req.params.incidentId]
    );
    if (!incident.rows.length) return res.status(404).json({ error: 'Incident not found.' });

    const { rating, feedback_text, is_satisfied, challenge_flag, challenge_reason } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO citizen_feedback
        (incident_id, user_id, rating, feedback_text, is_satisfied, challenge_flag, challenge_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.incidentId, req.user.id, rating || null, feedback_text || null,
       is_satisfied ?? null, challenge_flag || false, challenge_reason || null]
    );

    // If citizen challenged closure, revert to under_review
    if (challenge_flag) {
      await pool.query(
        `UPDATE incidents SET status = 'under_review', updated_at = NOW() WHERE id = $1
         AND status IN ('resolved', 'verified')`,
        [req.params.incidentId]
      );
      await pool.query(
        `INSERT INTO status_history (incident_id, from_status, to_status, changed_by, remark)
         VALUES ($1, $2, 'under_review', $3, $4)`,
        [req.params.incidentId, incident.rows[0].status, req.user.id, `Citizen challenge: ${challenge_reason || 'Issue not resolved'}`]
      );
    }

    res.status(201).json({ message: 'Feedback submitted.', feedback: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/feedback/:incidentId ────────────────────────────
router.get('/:incidentId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM citizen_feedback WHERE incident_id = $1 ORDER BY created_at DESC',
      [req.params.incidentId]
    );
    res.json({ feedback: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
