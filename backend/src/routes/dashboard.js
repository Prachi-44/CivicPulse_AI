const express = require('express');
const pool = require('../utils/db');

const router = express.Router();

// ── GET /api/dashboard/kpis ───────────────────────────────────
router.get('/kpis', async (req, res, next) => {
  try {
    const [kpiRes, catRes, wardRes, recentRes] = await Promise.all([
      pool.query('SELECT * FROM dashboard_kpis'),
      pool.query(`
        SELECT category, COUNT(*) as count,
          COUNT(*) FILTER (WHERE status NOT IN ('resolved','verified')) as open_count
        FROM incidents GROUP BY category ORDER BY count DESC
      `),
      pool.query(`
        SELECT ward, COUNT(*) as count,
          COUNT(*) FILTER (WHERE priority IN ('critical','high')) as critical_count,
          COUNT(*) FILTER (WHERE status IN ('resolved','verified')) as resolved_count
        FROM incidents WHERE ward IS NOT NULL
        GROUP BY ward ORDER BY count DESC LIMIT 10
      `),
      pool.query(`
        SELECT i.id, i.incident_code, i.title, i.category, i.priority, i.status,
               i.created_at, i.ward, u.name as reporter_name
        FROM incidents i LEFT JOIN users u ON u.id = i.reporter_id
        ORDER BY i.created_at DESC LIMIT 10
      `)
    ]);

    res.json({
      kpis: kpiRes.rows[0],
      category_distribution: catRes.rows,
      ward_breakdown: wardRes.rows,
      recent_activity: recentRes.rows
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/analytics ─────────────────────────────
router.get('/analytics', async (req, res, next) => {
  try {
    const [trendRes, resTimeRes, hotspotRes] = await Promise.all([
      // Daily trend (last 14 days)
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as reports,
          COUNT(*) FILTER (WHERE status IN ('resolved','verified')) as resolved
        FROM incidents
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY DATE(created_at) ORDER BY date ASC
      `),
      // Category resolution time
      pool.query(`
        SELECT i.category,
          ROUND(AVG(EXTRACT(EPOCH FROM (sh.created_at - i.created_at))/3600)::numeric, 1) as avg_resolution_hours
        FROM incidents i
        JOIN status_history sh ON sh.incident_id = i.id AND sh.to_status IN ('resolved','verified')
        GROUP BY i.category
      `),
      // Top hotspot clusters
      pool.query(`
        SELECT * FROM hotspot_clusters ORDER BY incident_count DESC LIMIT 5
      `)
    ]);

    res.json({
      daily_trend: trendRes.rows,
      resolution_times: resTimeRes.rows,
      hotspots: hotspotRes.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
