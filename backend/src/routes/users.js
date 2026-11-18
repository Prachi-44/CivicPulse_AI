const express = require('express');
const pool = require('../utils/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/users/me ─────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, ward, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/users — list all users (admin) ───────────────────
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, ward, phone, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
