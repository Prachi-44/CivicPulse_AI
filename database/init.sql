-- CivicPulse AI — PostgreSQL + PostGIS Database Schema
-- VIT Pune Academic Prototype | Demonstration Dataset

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('citizen', 'admin', 'supervisor');

CREATE TYPE incident_status AS ENUM (
  'reported',
  'under_review',
  'assigned',
  'in_progress',
  'resolved',
  'verified',
  'rejected'
);

CREATE TYPE incident_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE issue_category AS ENUM (
  'pothole',
  'garbage',
  'water_leakage',
  'drainage',
  'streetlight',
  'road_damage',
  'other'
);

CREATE TYPE department_type AS ENUM (
  'roads',
  'solid_waste',
  'water_supply',
  'storm_water',
  'street_lighting',
  'general'
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role            user_role NOT NULL DEFAULT 'citizen',
  ward            VARCHAR(60),
  phone           VARCHAR(20),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================
-- INCIDENTS
-- ============================================================

CREATE TABLE incidents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_code       VARCHAR(30) UNIQUE NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  category            issue_category NOT NULL,
  priority            incident_priority NOT NULL DEFAULT 'medium',
  status              incident_status NOT NULL DEFAULT 'reported',

  -- Location
  latitude            DOUBLE PRECISION NOT NULL,
  longitude           DOUBLE PRECISION NOT NULL,
  address             TEXT,
  ward                VARCHAR(60),
  location_geom       GEOMETRY(Point, 4326),

  -- AI Analysis
  ai_category_suggestion   issue_category,
  ai_priority_suggestion   incident_priority,
  ai_confidence_score      FLOAT CHECK (ai_confidence_score BETWEEN 0 AND 1),
  ai_analysis_notes        TEXT,
  duplicate_group_id       UUID,
  is_duplicate             BOOLEAN NOT NULL DEFAULT FALSE,

  -- Meta
  reporter_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_dept       department_type,
  image_path          TEXT,

  -- Priority scoring factors
  severity_score      INTEGER DEFAULT 5 CHECK (severity_score BETWEEN 1 AND 10),
  recurrence_count    INTEGER DEFAULT 1,
  overdue_flag        BOOLEAN DEFAULT FALSE,
  priority_score      FLOAT DEFAULT 5.0,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-populate geometry from lat/lng
CREATE OR REPLACE FUNCTION sync_incident_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location_geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incident_geom
  BEFORE INSERT OR UPDATE OF latitude, longitude ON incidents
  FOR EACH ROW EXECUTE FUNCTION sync_incident_geom();

CREATE INDEX idx_incidents_status    ON incidents(status);
CREATE INDEX idx_incidents_category  ON incidents(category);
CREATE INDEX idx_incidents_priority  ON incidents(priority);
CREATE INDEX idx_incidents_reporter  ON incidents(reporter_id);
CREATE INDEX idx_incidents_ward      ON incidents(ward);
CREATE INDEX idx_incidents_geom      ON incidents USING GIST(location_geom);
CREATE INDEX idx_incidents_code      ON incidents(incident_code);

-- ============================================================
-- DUPLICATE GROUPS
-- ============================================================

CREATE TABLE duplicate_groups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STATUS HISTORY
-- ============================================================

CREATE TABLE status_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  from_status     incident_status,
  to_status       incident_status NOT NULL,
  changed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  remark          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_incident ON status_history(incident_id);

-- ============================================================
-- RESOLUTION EVIDENCE
-- ============================================================

CREATE TABLE resolution_evidence (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  image_path      TEXT NOT NULL,
  notes           TEXT,
  evidence_type   VARCHAR(30) DEFAULT 'resolution_photo',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_incident ON resolution_evidence(incident_id);

-- ============================================================
-- CITIZEN FEEDBACK
-- ============================================================

CREATE TABLE citizen_feedback (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text   TEXT,
  is_satisfied    BOOLEAN,
  challenge_flag  BOOLEAN DEFAULT FALSE,
  challenge_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_incident ON citizen_feedback(incident_id);

-- ============================================================
-- HOTSPOT ANALYSIS (cached results)
-- ============================================================

CREATE TABLE hotspot_clusters (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_centroid    GEOMETRY(Point, 4326),
  centroid_lat        DOUBLE PRECISION,
  centroid_lng        DOUBLE PRECISION,
  radius_meters       FLOAT DEFAULT 100,
  incident_count      INTEGER,
  dominant_category   issue_category,
  severity_level      incident_priority,
  ward                VARCHAR(60),
  computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hotspot_geom ON hotspot_clusters USING GIST(cluster_centroid);

-- ============================================================
-- REFRESH TIMESTAMP FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW incident_summary AS
SELECT
  i.id,
  i.incident_code,
  i.title,
  i.description,
  i.category,
  i.priority,
  i.status,
  i.latitude,
  i.longitude,
  i.address,
  i.ward,
  i.ai_category_suggestion,
  i.ai_priority_suggestion,
  i.ai_confidence_score,
  i.ai_analysis_notes,
  i.is_duplicate,
  i.duplicate_group_id,
  i.assigned_dept,
  i.image_path,
  i.severity_score,
  i.recurrence_count,
  i.priority_score,
  i.overdue_flag,
  i.created_at,
  i.updated_at,
  u.name  AS reporter_name,
  u.email AS reporter_email,
  u.ward  AS reporter_ward,
  (SELECT COUNT(*) FROM status_history sh WHERE sh.incident_id = i.id) AS history_count,
  (SELECT COUNT(*) FROM resolution_evidence re WHERE re.incident_id = i.id) AS evidence_count,
  (SELECT COUNT(*) FROM citizen_feedback cf WHERE cf.incident_id = i.id) AS feedback_count
FROM incidents i
LEFT JOIN users u ON u.id = i.reporter_id;

-- Dashboard KPI view
CREATE OR REPLACE VIEW dashboard_kpis AS
SELECT
  COUNT(*)                                                      AS total_reports,
  COUNT(*) FILTER (WHERE status IN ('reported', 'under_review')) AS open_incidents,
  COUNT(*) FILTER (WHERE priority = 'critical')                 AS critical_incidents,
  COUNT(*) FILTER (WHERE status = 'in_progress')                AS in_progress_incidents,
  COUNT(*) FILTER (WHERE status IN ('resolved', 'verified'))    AS resolved_incidents,
  COUNT(*) FILTER (WHERE overdue_flag = TRUE)                   AS overdue_incidents
FROM incidents;
