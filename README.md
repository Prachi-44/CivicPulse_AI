# CivicPulse AI — Autonomous Urban Civic Infrastructure Monitoring Platform

> **VIT Pune AI & Data Science Prototype • Municipal Telemetry Intelligence**  
> *Demonstration Platform for Pune Municipal Corporation (PMC) Metropolitan Area*

---

## 🏛️ Project Objective

CivicPulse AI empowers citizens and municipal authorities to collaboratively monitor, triage, and resolve urban infrastructure defects:
- **Potholes & Damaged Road Surfaces**
- **Solid Waste & Garbage Accumulation**
- **Water Pipeline Ruptures & Potable Supply Losses**
- **Stormwater Drainage Blockages & Monsoon Waterlogging**
- **Broken Streetlights & Electrical Hazards**

The platform integrates real-time citizen reporting with **Computer Vision Preprocessing**, **NLP Issue Classification**, **Spatial Proximity Duplicate Detection**, and a **Tamper-Proof Resolution Verification Lifecycle**.

---

## 🎨 Visual Identity & Design System (CivicPulse CyberNavy)

Built in accordance with the Stitch CivicPulse AI specifications:
- **Atmosphere:** Tactical maritime dark navy operations center.
- **Background Canvas:** Deep Navy (`#0d1322`)
- **Containers & Surfaces:** Slate Glass (`#151b2b` and `#191f2f`)
- **Primary Telemetry Accent:** Photonic Cyan (`#06b6d4` / `#4cd7f6`)
- **Chromatic Status Tiers:**
  - 🟢 **Verified / Resolved:** Emerald (`#10b981`)
  - 🟡 **System Warning / Traffic Congestion:** Amber (`#f59e0b`)
  - 🔴 **Critical Incident Emergency:** Crimson Coral (`#ef4444`)
- **Typography:**
  - Strategic Titles: **Space Grotesk**
  - Body & Operations: **Plus Jakarta Sans**
  - Telemetry & Coordinates: **JetBrains Mono** (`tnum` tabular figures)

---

## 🏗️ Technical Architecture

### 1. Frontend (`/frontend`)
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Custom CyberNavy design tokens)
- **Interactive Maps:** MapLibre GL JS + Carto Dark Matter raster tiles
- **Analytics & Telemetry:** Recharts (responsive bar and trend line charts)
- **Routing:** React Router v6

### 2. Backend REST API Gateway (`/backend`)
- **Runtime:** Node.js + Express
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Security:** Helmet, CORS, Express-Rate-Limit, Express-Validator
- **Dual-Engine Database Layer:**
  - Primary: **PostgreSQL 15 + PostGIS**
  - Graceful Fallback: Local persistent file-based JSON store with Haversine spatial calculations (`backend/data/civicpulse_db.json`)
  - Seamless operation across Docker and local development environments without zero downtime.

### 3. AI & Telemetry Microservice (`/ai-service`)
- **Framework:** Python Flask
- **Image Preprocessing:** Pillow (CPU-friendly, no GPU required)
- **Issue Classification:** Keyword matching & heuristic scoring
- **Duplicate Triage:** Spatial proximity radius (80m) matching active reports
- **Priority Algorithm:** Transparent composite scoring formula based on defect severity (1-10), cluster recurrence count, and days unresolved.

---

## 🚀 Quick Start (Local Machine)

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### Option A: 1-Click Launch (PowerShell)
```powershell
# From the CivicPulse-AI directory:
.\start-all.ps1
```

### Option B: Manual Service Launch

#### 1. AI Service
```bash
cd ai-service
python app.py
# Runs on http://localhost:5001
```

#### 2. Backend API
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

#### 3. Frontend App
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## 🐳 Docker Deployment

The platform is container-ready:
```bash
docker-compose up --build
```
This orchestrates:
- `postgres`: PostGIS 15 database initialized with schema and seed data
- `backend`: Node.js Express service
- `ai-service`: Python Flask microservice
- `frontend`: Vite React production preview

---

## 🔐 Evaluation Credentials (1-Click Fill in UI)

| Role | Email Identifier | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **PMC Ward 14 Lead** | `admin@civicpulse.in` | `Admin@2025` | Authority Dashboard, Status Changes, Evidence Upload |
| **QRT Field Lead** | `supervisor@civicpulse.in` | `Admin@2025` | Dispatch Triage, Squad Operations |
| **Verified Citizen** | `aditya@example.com` | `Citizen@2025` | Issue Reporting, GPS Pinning, Resolution Feedback |

---

## 🔄 End-to-End Workflow

```
1. Citizen Submits Report
   ├── GPS Location locked (Map picker or manual coordinates)
   ├── Category selected + photographic evidence attached
   └── Instant AI Triage preview triggered
            │
            ▼
2. Backend Ingestion & Python AI Analysis
   ├── Validates payload & saves incident
   ├── Predicts issue category & assigns severity index
   ├── Calculates priority score (0.0 - 10.0)
   └── Detects duplicates within 80m proximity zone
            │
            ▼
3. Cartographic & Operations Synchronization
   ├── Incident marker renders on MapLibre GL live map
   ├── PostGIS / Haversine hotspot cluster metrics updated
   └── Incident queues in Municipal Command Center deck
            │
            ▼
4. Municipal Authority Review & Dispatch
   ├── Official assigns municipal department (Roads, Solid Waste, Water, etc.)
   ├── Lifecycle progression: Reported ➔ Under Review ➔ Assigned ➔ In Progress ➔ Resolved
   └── Contractor uploads photographic proof-of-work resolution evidence
            │
            ▼
5. Citizen Verification & Co-Audit
   ├── Citizen inspects contractor resolution photos
   ├── Submits 1-5 star verification rating
   └── Optional: Challenges closure if problem persists
```

---

## 📡 API Endpoints Summary

### Auth
- `POST /api/auth/register` — Register citizen account
- `POST /api/auth/login` — Sign in with email and passkey
- `GET /api/auth/me` — Get current authenticated user profile

### Incidents
- `GET /api/incidents` — List all incidents (filters: status, category, priority, ward, search)
- `POST /api/incidents` — Submit new incident report (multipart with photo)
- `GET /api/incidents/:id` — Inspect incident, timeline history, evidence, and feedback
- `PATCH /api/incidents/:id` — Update status, priority, department, and log remarks
- `GET /api/incidents/my/list` — List authenticated citizen's submitted reports

### Geospatial & Map
- `GET /api/map/incidents` — Returns GeoJSON FeatureCollection of Pune incidents
- `GET /api/map/hotspots` — Returns recurring spatial clusters
- `GET /api/map/nearby` — Proximity lookup (Haversine / ST_DWithin)

### Dashboard
- `GET /api/dashboard/kpis` — Aggregate intake, triage queue, critical breaches, resolved rate
- `GET /api/dashboard/analytics` — 14-day trend, category resolution latency

### Evidence & Feedback
- `POST /api/evidence/:incidentId` — Upload contractor photo proof-of-work
- `GET /api/evidence/:incidentId` — Retrieve uploaded evidence photos
- `POST /api/feedback/:incidentId` — Citizen 1-5 star rating and challenge submission
- `GET /api/feedback/:incidentId` — Citizen audit reviews

---

## ⚠️ Important Disclaimer

- This application is an **academic prototype and engineering demonstration** developed in connection with VIT Pune.
- All incidents, coordinates, and metrics represent a simulated Pune demonstration dataset and do not reflect official live PMC municipal records.
- Machine learning models run in lightweight CPU-friendly mode (using keyword heuristics, spatial clustering, and image preprocessing) and do not depend on external paid cloud APIs or GPUs.
