const express = require('express');
const pool = require('../utils/db');

const router = express.Router();

// ── GET /api/map/incidents — GeoJSON for map ─────────────────
router.get('/incidents', async (req, res, next) => {
  try {
    const { category, status, priority, ward } = req.query;

    const conditions = ['location_geom IS NOT NULL'];
    const params = [];
    let p = 1;

    if (category) { conditions.push(`category = $${p++}`); params.push(category); }
    if (status)   { conditions.push(`status = $${p++}`);   params.push(status); }
    if (priority) { conditions.push(`priority = $${p++}`); params.push(priority); }
    if (ward)     { conditions.push(`ward ILIKE $${p++}`); params.push(`%${ward}%`); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows } = await pool.query(
      `SELECT
        id, incident_code, title, description, category, priority, status,
        latitude, longitude, address, ward,
        ai_confidence_score, is_duplicate, severity_score,
        created_at, updated_at
       FROM incidents ${where}
       ORDER BY priority_score DESC LIMIT 500`,
      params
    );

    // Build GeoJSON FeatureCollection
    const geojson = {
      type: 'FeatureCollection',
      features: rows.map(row => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [row.longitude, row.latitude]
        },
        properties: {
          id: row.id,
          incident_code: row.incident_code,
          title: row.title,
          description: row.description,
          category: row.category,
          priority: row.priority,
          status: row.status,
          address: row.address,
          ward: row.ward,
          ai_confidence_score: row.ai_confidence_score,
          is_duplicate: row.is_duplicate,
          severity_score: row.severity_score,
          created_at: row.created_at,
          updated_at: row.updated_at
        }
      }))
    };

    res.json(geojson);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/map/hotspots — Hotspot clusters ─────────────────
router.get('/hotspots', async (req, res, next) => {
  try {
    // Compute live spatial clusters using PostGIS ST_DWithin
    const { rows } = await pool.query(`
      WITH clusters AS (
        SELECT
          ST_ClusterDBSCAN(location_geom, eps := 0.0009, minpoints := 2)
            OVER () AS cluster_id,
          id, incident_code, category, priority, latitude, longitude, ward
        FROM incidents
        WHERE location_geom IS NOT NULL
          AND status NOT IN ('resolved', 'verified', 'rejected')
      )
      SELECT
        cluster_id,
        COUNT(*) as incident_count,
        AVG(latitude) as centroid_lat,
        AVG(longitude) as centroid_lng,
        MODE() WITHIN GROUP (ORDER BY category) as dominant_category,
        MODE() WITHIN GROUP (ORDER BY priority) as dominant_priority,
        MODE() WITHIN GROUP (ORDER BY ward) as ward,
        ARRAY_AGG(incident_code) as incident_codes
      FROM clusters
      WHERE cluster_id IS NOT NULL
      GROUP BY cluster_id
      ORDER BY incident_count DESC
    `);

    res.json({ hotspots: rows });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/map/nearby — find nearby incidents ───────────────
router.get('/nearby', async (req, res, next) => {
  const { lat, lng, radius = 100, category } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  try {
    const conditions = [
      `ST_DWithin(location_geom::geography, ST_SetSRID(ST_MakePoint($1::float, $2::float), 4326)::geography, $3::float)`
    ];
    const params = [lng, lat, parseFloat(radius)];
    let p = 4;

    if (category) { conditions.push(`category = $${p++}`); params.push(category); }

    const { rows } = await pool.query(
      `SELECT id, incident_code, title, category, priority, status, latitude, longitude, address,
        ST_Distance(
          location_geom::geography,
          ST_SetSRID(ST_MakePoint($1::float, $2::float), 4326)::geography
        ) as distance_meters
       FROM incidents
       WHERE ${conditions.join(' AND ')}
         AND status NOT IN ('rejected')
       ORDER BY distance_meters ASC LIMIT 20`,
      params
    );

    res.json({ nearby: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
