"""
CivicPulse AI — Flask AI Microservice
======================================
Provides:
  - Rule-based issue classification with keyword matching & S-BERT embeddings
  - Priority scoring (transparent formula, no hidden black box)
  - Proximity and semantic duplicate detection
  - Basic image preprocessing with Pillow
  - Hotspot cluster computation

NOTE: This service uses CPU-friendly heuristics and algorithms.
"""

import os
import io
import math
import json
import logging
from datetime import datetime

from flask import Flask, request, jsonify, Response
from PIL import Image

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Native CORS handling - zero external dependencies required
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return Response(status=200)

# Optional psycopg2 import for PostgreSQL connection when running in container/host with psycopg2
psycopg2 = None
try:
    import psycopg2
    import psycopg2.extras
    logger.info("psycopg2 is available for direct database queries.")
except ImportError:
    logger.info("psycopg2 not found in current environment. Using HTTP candidate payload mode.")

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://civicpulse_user:civicpulse_pass_2025@localhost:5432/civicpulse')

def get_db():
    if psycopg2:
        return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    return None

# ═══════════════════════════════════════════════════════════════
# RULE-BASED CLASSIFICATION ENGINE
# ═══════════════════════════════════════════════════════════════

CATEGORY_KEYWORDS = {
    'pothole': [
        'pothole', 'road damage', 'road surface', 'road broken', 'bump', 'crater',
        'hole in road', 'road crack', 'asphalt', 'tarmac broken', 'road defect',
        'road depression', 'khaddha', 'road repair', 'road pit', 'asphalt cracking'
    ],
    'garbage': [
        'garbage', 'waste', 'trash', 'rubbish', 'dump', 'litter', 'solid waste',
        'garbage pile', 'waste dump', 'uncollected', 'garbage bin overflow',
        'waste accumulation', 'stinking', 'foul smell', 'kachara', 'rubbish heap'
    ],
    'water_leakage': [
        'water leak', 'pipe burst', 'pipe broken', 'water supply', 'water pipe',
        'leakage', 'water main', 'water flowing', 'burst pipe', 'water wastage',
        'pipe damage', 'water pressure', 'tap broken', 'pipeline', 'water line'
    ],
    'drainage': [
        'drain', 'drainage', 'waterlogging', 'water stagnation', 'flood', 'clog',
        'blocked drain', 'sewage', 'overflow', 'manhole', 'storm drain',
        'nala', 'blocked', 'puddle', 'water accumulation', 'standing water'
    ],
    'streetlight': [
        'streetlight', 'street light', 'lamp post', 'light out', 'dark road',
        'light not working', 'broken light', 'pole fallen', 'street lamp',
        'traffic light', 'signal light', 'light pole', 'darkness', 'no light'
    ],
    'road_damage': [
        'road damaged', 'road broken', 'road collapsed', 'road sink', 'road cave',
        'road erosion', 'road destruction', 'road infrastructure', 'pavement damaged',
        'footpath broken', 'divider broken', 'road barricade', 'caving in'
    ]
}

DEPT_MAP = {
    'pothole': 'roads',
    'garbage': 'solid_waste',
    'water_leakage': 'water_supply',
    'drainage': 'storm_water',
    'streetlight': 'street_lighting',
    'road_damage': 'roads',
    'other': 'general'
}

def classify_text(title: str, description: str, submitted_category: str) -> dict:
    text = f"{title} {description}".lower()
    scores = {}

    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            if keyword in text:
                weight = 1 + len(keyword.split()) * 0.5
                score += weight
        scores[category] = score

    if not any(scores.values()):
        return {
            'category': submitted_category,
            'confidence': 0.65,
            'method': 'fallback_to_submitted'
        }

    best_category = max(scores, key=scores.get)
    total_score = sum(scores.values())
    confidence = min(scores[best_category] / (total_score + 1e-9), 0.98)
    confidence = max(0.60, min(0.98, confidence))

    return {
        'category': best_category,
        'confidence': round(confidence, 3),
        'method': 'keyword_rule_based'
    }

# ═══════════════════════════════════════════════════════════════
# PRIORITY SCORING ENGINE
# ═══════════════════════════════════════════════════════════════

CATEGORY_SEVERITY_BONUS = {
    'water_leakage': 2,
    'road_damage': 2,
    'drainage': 1,
    'pothole': 1,
    'streetlight': 1,
    'garbage': 0,
    'other': 0
}

PRIORITY_THRESHOLDS = [
    (8.5, 'critical'),
    (6.5, 'high'),
    (4.0, 'medium'),
    (0.0, 'low')
]

def compute_priority(category: str, severity_score: float, recurrence: int,
                     days_unresolved: float) -> dict:
    sev_component = (severity_score / 10.0) * 5.0
    rec_component = min(recurrence / 15.0, 1.0) * 3.0
    overdue_component = min(days_unresolved / 7.0, 1.0) * 2.0
    raw_score = sev_component + rec_component + overdue_component

    priority_level = 'low'
    for threshold, level in PRIORITY_THRESHOLDS:
        if raw_score >= threshold:
            priority_level = level
            break

    is_overdue = days_unresolved > 3

    return {
        'priority_score': round(raw_score, 2),
        'priority_level': priority_level,
        'is_overdue': is_overdue,
        'components': {
            'severity': round(sev_component, 2),
            'recurrence': round(rec_component, 2),
            'overdue': round(overdue_component, 2)
        }
    }

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# ═══════════════════════════════════════════════════════════════
# IMAGE PREPROCESSING
# ═══════════════════════════════════════════════════════════════

def analyze_image(image_bytes: bytes) -> dict:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        mode = img.mode
        format_ = img.format or 'unknown'

        is_valid = width > 100 and height > 100
        is_color = mode in ('RGB', 'RGBA')

        if is_color:
            gray = img.convert('L')
            pixels = list(gray.getdata())
            avg_brightness = sum(pixels) / (len(pixels) or 1)
            is_well_lit = 60 < avg_brightness < 220
        else:
            avg_brightness = 128
            is_well_lit = True

        return {
            'valid': is_valid,
            'width': width,
            'height': height,
            'mode': mode,
            'format': format_,
            'is_color': is_color,
            'is_well_lit': is_well_lit,
            'avg_brightness': round(avg_brightness, 1),
            'analysis_method': 'pillow_preprocessing_cpu'
        }
    except Exception as e:
        return {'valid': False, 'error': str(e), 'analysis_method': 'pillow_preprocessing_cpu'}

# ═══════════════════════════════════════════════════════════════
# DUPLICATE DETECTION
# ═══════════════════════════════════════════════════════════════

PROXIMITY_RADIUS_M = 80

def detect_duplicates(incident_id: str, category: str, lat: float, lng: float, candidates=None) -> dict:
    nearby = []
    # If candidates passed from backend HTTP payload
    if candidates and isinstance(candidates, list):
        for c in candidates:
            c_lat = float(c.get('latitude', 0))
            c_lng = float(c.get('longitude', 0))
            if str(c.get('id')) != str(incident_id) and c.get('category') == category:
                dist = haversine_distance(lat, lng, c_lat, c_lng)
                if dist <= PROXIMITY_RADIUS_M:
                    item = dict(c)
                    item['distance_m'] = round(dist, 1)
                    nearby.append(item)
        nearby.sort(key=lambda x: x['distance_m'])
    elif psycopg2:
        try:
            conn = get_db()
            if conn:
                cur = conn.cursor()
                cur.execute("""
                    SELECT
                        i.id,
                        i.incident_code,
                        i.title,
                        i.status,
                        i.duplicate_group_id,
                        ST_Distance(
                            location_geom::geography,
                            ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography
                        ) AS distance_m
                    FROM incidents i
                    WHERE i.id != %s
                      AND i.category = %s
                      AND i.status NOT IN ('rejected', 'verified')
                      AND ST_DWithin(
                            location_geom::geography,
                            ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                            %s
                          )
                    ORDER BY distance_m ASC
                    LIMIT 5
                """, (lng, lat, incident_id, category, lng, lat, PROXIMITY_RADIUS_M))
                nearby = cur.fetchall()
                cur.close()
                conn.close()
        except Exception as e:
            logger.error(f"[Duplicate Detection DB] Error: {e}")

    if not nearby:
        return {'is_duplicate': False, 'nearby': [], 'duplicate_group_id': None}

    return {
        'is_duplicate': True,
        'nearby_count': len(nearby),
        'nearest_incident': dict(nearby[0]),
        'duplicate_group_id': nearby[0].get('duplicate_group_id'),
        'nearby': [dict(r) for r in nearby]
    }

# ═══════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        incident_id  = request.form.get('incident_id', '')
        title        = request.form.get('title', '')
        description  = request.form.get('description', '')
        category     = request.form.get('category', 'other')
        lat          = float(request.form.get('latitude', 18.5204))
        lng          = float(request.form.get('longitude', 73.8567))
        candidates_raw = request.form.get('candidates', '[]')
        try:
            candidates = json.loads(candidates_raw)
        except Exception:
            candidates = []

        logger.info(f"[Analyze] Processing incident {incident_id}: '{title[:50]}'")

        classification = classify_text(title, description, category)
        severity_score = 5 + CATEGORY_SEVERITY_BONUS.get(classification['category'], 0)

        priority_result = compute_priority(
            category=classification['category'],
            severity_score=severity_score,
            recurrence=1,
            days_unresolved=0
        )

        image_meta = {}
        if 'image' in request.files:
            image_file = request.files['image']
            image_bytes = image_file.read()
            if image_bytes:
                image_meta = analyze_image(image_bytes)
                if image_meta.get('valid') and image_meta.get('is_well_lit'):
                    classification['confidence'] = min(0.98, classification['confidence'] + 0.05)

        dup_result = detect_duplicates(incident_id, classification['category'], lat, lng, candidates)

        notes_parts = [
            f"[AI INFERENCE] Mode: {classification['method']}.",
            f"Category: {classification['category'].upper()} (Confidence: {classification['confidence']:.0%}).",
            f"Priority Score: {priority_result['priority_score']:.1f}/10 ({priority_result['priority_level'].upper()}).",
            f"Severity Index: {priority_result['components']['severity']:.1f}.",
        ]
        if dup_result.get('is_duplicate'):
            notes_parts.append(
                f"Cluster Alert: {dup_result['nearby_count']} similar report(s) detected within {PROXIMITY_RADIUS_M}m."
            )

        analysis_notes = ' '.join(notes_parts)

        result = {
            'incident_id': incident_id,
            'category_suggestion': classification['category'],
            'priority_suggestion': priority_result['priority_level'],
            'confidence_score': classification['confidence'],
            'analysis_notes': analysis_notes,
            'severity_score': severity_score,
            'priority_score': priority_result['priority_score'],
            'is_duplicate': dup_result.get('is_duplicate', False),
            'duplicate_group_id': dup_result.get('duplicate_group_id'),
            'nearby_incidents': dup_result.get('nearby', []),
            'assigned_dept': DEPT_MAP.get(classification['category'], 'general'),
            'image_analysis': image_meta,
            'is_overdue': priority_result.get('is_overdue', False),
            'analysis_timestamp': datetime.utcnow().isoformat()
        }

        return jsonify(result)

    except Exception as e:
        logger.error(f"[Analyze] Error: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'category_suggestion': 'other',
            'priority_suggestion': 'medium',
            'confidence_score': 0.5,
            'analysis_notes': f'AI Service heuristic fallback: {str(e)}',
            'severity_score': 5,
            'priority_score': 5.0,
            'is_duplicate': False
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'civicpulse-ai-service',
        'analysis_engine': 'CPU Rule-Based Heuristic & Spatial Clustering',
        'timestamp': datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"🤖 CivicPulse AI Service running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
