-- CivicPulse AI — Seed Data
-- Realistic Pune demonstration dataset (NOT official municipal data)
-- VIT Pune Academic Prototype

-- ============================================================
-- USERS
-- ============================================================

INSERT INTO users (id, name, email, password_hash, role, ward, phone) VALUES
  -- Admin users (password: Admin@2025)
  ('a0000001-0000-0000-0000-000000000001', 'Rajesh Patil', 'admin@civicpulse.in',
   '$2b$10$rI5F9pLJvNUzq7Q3nR8MfeKXQG1TPlDNJEh3V9ZAhT4RVsE8hS3Vy', 'admin', 'Ward 14 - Kothrud', '+91-9876543210'),
  ('a0000001-0000-0000-0000-000000000002', 'Sunita Deshmukh', 'supervisor@civicpulse.in',
   '$2b$10$rI5F9pLJvNUzq7Q3nR8MfeKXQG1TPlDNJEh3V9ZAhT4RVsE8hS3Vy', 'supervisor', 'Ward 09 - Shivajinagar', '+91-9876543211'),
  -- Citizens (password: Citizen@2025)
  ('c0000001-0000-0000-0000-000000000001', 'Aditya Kulkarni', 'aditya@example.com',
   '$2b$10$YxE9KhxmFHv7T4P8m2cRDeZXHj3UmQhLP5nIy9LV7M1JoFQNnRwCy', 'citizen', 'Ward 14 - Kothrud', '+91-9876500001'),
  ('c0000001-0000-0000-0000-000000000002', 'Priya Joshi', 'priya@example.com',
   '$2b$10$YxE9KhxmFHv7T4P8m2cRDeZXHj3UmQhLP5nIy9LV7M1JoFQNnRwCy', 'citizen', 'Ward 21 - Hadapsar', '+91-9876500002'),
  ('c0000001-0000-0000-0000-000000000003', 'Rahul Sharma', 'rahul@example.com',
   '$2b$10$YxE9KhxmFHv7T4P8m2cRDeZXHj3UmQhLP5nIy9LV7M1JoFQNnRwCy', 'citizen', 'Ward 08 - Aundh', '+91-9876500003'),
  ('c0000001-0000-0000-0000-000000000004', 'Meera Rao', 'meera@example.com',
   '$2b$10$YxE9KhxmFHv7T4P8m2cRDeZXHj3UmQhLP5nIy9LV7M1JoFQNnRwCy', 'citizen', 'Ward 02 - Baner', '+91-9876500004'),
  ('c0000001-0000-0000-0000-000000000005', 'Vikram Singh', 'vikram@example.com',
   '$2b$10$YxE9KhxmFHv7T4P8m2cRDeZXHj3UmQhLP5nIy9LV7M1JoFQNnRwCy', 'citizen', 'Ward 16 - Kasba Peth', '+91-9876500005');

-- ============================================================
-- INCIDENTS (Realistic Pune Locations)
-- ============================================================

INSERT INTO incidents (
  id, incident_code, title, description, category, priority, status,
  latitude, longitude, address, ward,
  ai_category_suggestion, ai_priority_suggestion, ai_confidence_score, ai_analysis_notes,
  reporter_id, assigned_dept, severity_score, recurrence_count, priority_score, overdue_flag
) VALUES

-- KOTHRUD WARD 14
(
  'i0000001-0000-0000-0000-000000000001',
  'PUN-2025-0001',
  'Large pothole on Karve Road near Nal Stop',
  'Dangerous pothole approximately 30cm deep and 60cm wide at Karve Road Nal Stop junction. Multiple vehicles have been damaged. The road surface has been eroding for 3 weeks since heavy rainfall.',
  'pothole', 'critical', 'in_progress',
  18.5074, 73.8340, 'Karve Road, Nal Stop Junction, Kothrud, Pune 411038', 'Ward 14 - Kothrud',
  'pothole', 'critical', 0.92,
  'High-confidence pothole detection. Category: Road Surface Damage. Priority elevated due to arterial road location and multiple reports from same cluster.',
  'c0000001-0000-0000-0000-000000000001', 'roads', 9, 14, 8.9, TRUE
),
(
  'i0000001-0000-0000-0000-000000000002',
  'PUN-2025-0002',
  'Garbage dump near PMC school Kothrud',
  'Large accumulation of household garbage near PMC school on Paud Road. The garbage has been there for 5 days and is causing a foul smell and health hazard for school children.',
  'garbage', 'high', 'assigned',
  18.5076, 73.8077, 'Paud Road near PMC Primary School, Kothrud, Pune 411038', 'Ward 14 - Kothrud',
  'garbage', 'high', 0.87,
  'Garbage accumulation detected. Near school zone - priority elevated. Category confirmed: Solid Waste.',
  'c0000001-0000-0000-0000-000000000002', 'solid_waste', 7, 3, 7.2, FALSE
),
(
  'i0000001-0000-0000-0000-000000000003',
  'PUN-2025-0003',
  'Street light broken near Kothrud depot',
  'Three streetlights not working near Kothrud Bus Depot on Mumbai-Pune Road. Area is very dark at night causing safety concerns for pedestrians and motorists.',
  'streetlight', 'medium', 'reported',
  18.5042, 73.8198, 'Mumbai-Pune Highway, near Kothrud Bus Depot, Pune 411038', 'Ward 14 - Kothrud',
  'streetlight', 'high', 0.78,
  'Streetlight outage in public transit area. Night safety risk elevated. Category: Street Lighting Infrastructure.',
  'c0000001-0000-0000-0000-000000000001', 'street_lighting', 6, 1, 6.1, FALSE
),
(
  'i0000001-0000-0000-0000-000000000004',
  'PUN-2025-0004',
  'Water pipe burst on Prabhat Road',
  'Underground water pipe has burst on Prabhat Road near Deccan Gymkhana. Water is gushing out and flooding the road. Residents on both sides have no water supply since morning.',
  'water_leakage', 'critical', 'under_review',
  18.5204, 73.8395, 'Prabhat Road, near Deccan Gymkhana, Pune 411004', 'Ward 09 - Shivajinagar',
  'water_leakage', 'critical', 0.95,
  'Water infrastructure emergency. Supply disruption confirmed. Priority: CRITICAL. Immediate plumbing department deployment required.',
  'c0000001-0000-0000-0000-000000000003', 'water_supply', 10, 1, 9.5, FALSE
),

-- HADAPSAR WARD 21
(
  'i0000001-0000-0000-0000-000000000005',
  'PUN-2025-0005',
  'Drainage clogged causing waterlogging in Hadapsar',
  'Storm drain completely clogged with debris on Pune Solapur Road near Phursungi. Water stagnates here every rain causing traffic jams and mosquito breeding.',
  'drainage', 'high', 'in_progress',
  18.4967, 73.9388, 'Pune Solapur Road, near Phursungi junction, Hadapsar, Pune 411028', 'Ward 21 - Hadapsar',
  'drainage', 'high', 0.83,
  'Drainage obstruction with waterlogging pattern. Recurrent hotspot identified in DBSCAN cluster #07. Category: Storm Water Drainage.',
  'c0000001-0000-0000-0000-000000000002', 'storm_water', 8, 7, 8.3, TRUE
),
(
  'i0000001-0000-0000-0000-000000000006',
  'PUN-2025-0006',
  'Large pothole Hadapsar Magarpatta Road',
  'Deep pothole on Magarpatta City Road near Eon Free Zone. Many two-wheelers have met with accidents here. The pothole is about 40cm deep.',
  'pothole', 'high', 'resolved',
  18.5073, 73.9312, 'Magarpatta City Road, near Eon Free Zone, Hadapsar, Pune 411028', 'Ward 21 - Hadapsar',
  'pothole', 'high', 0.89,
  'Pothole confirmed. High accident risk location. Category: Road Damage.',
  'c0000001-0000-0000-0000-000000000004', 'roads', 8, 4, 7.8, FALSE
),

-- AUNDH WARD 08
(
  'i0000001-0000-0000-0000-000000000007',
  'PUN-2025-0007',
  'Garbage dumping near Aundh market',
  'Residents are illegally dumping garbage near the Aundh municipal market entrance on ITI Road. The PMC garbage collection has been irregular in this area.',
  'garbage', 'medium', 'verified',
  18.5620, 73.8077, 'ITI Road near Aundh Municipal Market, Aundh, Pune 411007', 'Ward 08 - Aundh',
  'garbage', 'medium', 0.76,
  'Illegal dumping pattern detected. Category: Solid Waste. Location: Commercial zone.',
  'c0000001-0000-0000-0000-000000000003', 'solid_waste', 5, 2, 5.5, FALSE
),
(
  'i0000001-0000-0000-0000-000000000008',
  'PUN-2025-0008',
  'Street caving in near Baner road',
  'Road surface is sinking near a construction site on Baner-Balewadi Highway. A portion of about 2 metres has caved in slightly and poses danger to heavy vehicles.',
  'road_damage', 'critical', 'assigned',
  18.5635, 73.7876, 'Baner-Balewadi Highway, near Orchid Hotel, Baner, Pune 411045', 'Ward 02 - Baner',
  'road_damage', 'critical', 0.91,
  'Structural road failure detected. CRITICAL priority: arterial highway compromise. Category: Road Infrastructure Damage.',
  'c0000001-0000-0000-0000-000000000005', 'roads', 10, 1, 9.8, FALSE
),

-- SHIVAJINAGAR WARD 09
(
  'i0000001-0000-0000-0000-000000000009',
  'PUN-2025-0009',
  'Water leakage at FC Road near MIT College',
  'Continuous water leakage from supply pipe at Fergusson College Road near MIT College. Water is wasted for several days. Ground is becoming soggy.',
  'water_leakage', 'medium', 'reported',
  18.5290, 73.8390, 'Fergusson College Road, near MIT College, Shivajinagar, Pune 411005', 'Ward 09 - Shivajinagar',
  'water_leakage', 'medium', 0.82,
  'Minor pipe leak detected. Water wastage concern. Category: Water Supply Infrastructure.',
  'c0000001-0000-0000-0000-000000000001', 'water_supply', 6, 1, 5.8, FALSE
),
(
  'i0000001-0000-0000-0000-000000000010',
  'PUN-2025-0010',
  'Multiple potholes on JM Road',
  'JM Road near Nal Stop has developed multiple potholes after monsoon. At least 5-6 potholes visible causing major traffic slowdown.',
  'pothole', 'high', 'in_progress',
  18.5204, 73.8367, 'JM Road, near Nal Stop, Pune 411004', 'Ward 09 - Shivajinagar',
  'pothole', 'high', 0.88,
  'Multiple pothole cluster detected. Spatial proximity to PUN-2025-0001 hotspot zone. Category: Road Surface Damage.',
  'c0000001-0000-0000-0000-000000000002', 'roads', 7, 6, 7.5, FALSE
),

-- KASBA PETH WARD 16
(
  'i0000001-0000-0000-0000-000000000011',
  'PUN-2025-0011',
  'Broken streetlight on Laxmi Road',
  'Streetlight pole has fallen on Laxmi Road near Tambdi Jogeshwari Temple. It is a danger to pedestrians and traffic. The pole leans over the road.',
  'streetlight', 'critical', 'under_review',
  18.5155, 73.8562, 'Laxmi Road, near Tambdi Jogeshwari Temple, Kasba Peth, Pune 411011', 'Ward 16 - Kasba Peth',
  'streetlight', 'critical', 0.93,
  'Fallen streetlight infrastructure detected. CRITICAL safety hazard. Immediate physical hazard clearance required.',
  'c0000001-0000-0000-0000-000000000004', 'street_lighting', 9, 1, 9.2, FALSE
),
(
  'i0000001-0000-0000-0000-000000000012',
  'PUN-2025-0012',
  'Sewage overflow near Kasba Peth chowk',
  'Sewage is overflowing from a manhole near Kasba Peth chowk. The smell is unbearable and liquid is spreading on the road. Urgent sanitation work needed.',
  'drainage', 'critical', 'assigned',
  18.5160, 73.8574, 'Kasba Peth Chowk, Pune 411011', 'Ward 16 - Kasba Peth',
  'drainage', 'critical', 0.90,
  'Sewage overflow detected. High health risk. Category: Storm Water & Sewage. CRITICAL priority confirmed.',
  'c0000001-0000-0000-0000-000000000005', 'storm_water', 10, 2, 9.6, TRUE
),

-- Additional incidents for dashboard variety
(
  'i0000001-0000-0000-0000-000000000013',
  'PUN-2025-0013',
  'Garbage near bus stop Viman Nagar',
  'Uncollected garbage at Viman Nagar bus stop for 4 days causing health concerns for commuters.',
  'garbage', 'medium', 'resolved',
  18.5675, 73.9124, 'Viman Nagar Bus Stop, Pune 411014', 'Ward 03 - Viman Nagar',
  'garbage', 'medium', 0.80,
  'Garbage accumulation at transit point. Category: Solid Waste.',
  'c0000001-0000-0000-0000-000000000003', 'solid_waste', 5, 1, 5.2, FALSE
),
(
  'i0000001-0000-0000-0000-000000000014',
  'PUN-2025-0014',
  'Pothole on Pune-Nashik Highway approach',
  'Dangerous pothole on the approach road to Pune-Nashik Highway near Khed Circle. Heavy traffic zone.',
  'pothole', 'high', 'reported',
  18.6170, 73.8365, 'Pune-Nashik Highway, Khed Circle, Pune 411027', 'Ward 05 - Khed Shivapur',
  'pothole', 'high', 0.85,
  'Pothole on highway approach. High traffic volume. Priority elevated.',
  'c0000001-0000-0000-0000-000000000001', 'roads', 8, 2, 7.6, FALSE
),
(
  'i0000001-0000-0000-0000-000000000015',
  'PUN-2025-0015',
  'Water logging at Swargate bus stand area',
  'Severe waterlogging near Swargate MSRTC bus stand due to blocked drains. Commuters unable to board buses safely.',
  'drainage', 'high', 'in_progress',
  18.5004, 73.8591, 'Swargate Bus Stand, Pune 411042', 'Ward 15 - Swargate',
  'drainage', 'high', 0.86,
  'Drainage failure at high-traffic transit hub. Priority elevated. Category: Storm Water Drainage.',
  'c0000001-0000-0000-0000-000000000005', 'storm_water', 7, 5, 7.9, TRUE
);

-- ============================================================
-- STATUS HISTORY
-- ============================================================

INSERT INTO status_history (incident_id, from_status, to_status, changed_by, remark) VALUES
  ('i0000001-0000-0000-0000-000000000001', NULL, 'reported', 'c0000001-0000-0000-0000-000000000001', 'Incident reported by citizen'),
  ('i0000001-0000-0000-0000-000000000001', 'reported', 'under_review', 'a0000001-0000-0000-0000-000000000001', 'AI triage complete. Under PMC review.'),
  ('i0000001-0000-0000-0000-000000000001', 'under_review', 'assigned', 'a0000001-0000-0000-0000-000000000001', 'Assigned to Roads & Infrastructure Dept — QRT Unit #04'),
  ('i0000001-0000-0000-0000-000000000001', 'assigned', 'in_progress', 'a0000001-0000-0000-0000-000000000001', 'Repair crew dispatched. Expected completion: 4 hours.'),

  ('i0000001-0000-0000-0000-000000000002', NULL, 'reported', 'c0000001-0000-0000-0000-000000000002', 'Incident reported by citizen'),
  ('i0000001-0000-0000-0000-000000000002', 'reported', 'under_review', 'a0000001-0000-0000-0000-000000000001', 'Reviewed. Health hazard near school confirmed.'),
  ('i0000001-0000-0000-0000-000000000002', 'under_review', 'assigned', 'a0000001-0000-0000-0000-000000000001', 'Solid waste team assigned.'),

  ('i0000001-0000-0000-0000-000000000005', NULL, 'reported', 'c0000001-0000-0000-0000-000000000002', 'Incident reported by citizen'),
  ('i0000001-0000-0000-0000-000000000005', 'reported', 'assigned', 'a0000001-0000-0000-0000-000000000001', 'Storm water team assigned for drain clearing.'),
  ('i0000001-0000-0000-0000-000000000005', 'assigned', 'in_progress', 'a0000001-0000-0000-0000-000000000001', 'Drain clearing in progress, estimated 6 hours.'),

  ('i0000001-0000-0000-0000-000000000006', NULL, 'reported', 'c0000001-0000-0000-0000-000000000004', 'Incident reported by citizen'),
  ('i0000001-0000-0000-0000-000000000006', 'reported', 'assigned', 'a0000001-0000-0000-0000-000000000001', 'Roads team assigned.'),
  ('i0000001-0000-0000-0000-000000000006', 'assigned', 'in_progress', 'a0000001-0000-0000-0000-000000000001', 'Pothole filling crew dispatched.'),
  ('i0000001-0000-0000-0000-000000000006', 'in_progress', 'resolved', 'a0000001-0000-0000-0000-000000000001', 'Pothole filled and compacted. Photo evidence uploaded.'),

  ('i0000001-0000-0000-0000-000000000007', NULL, 'reported', 'c0000001-0000-0000-0000-000000000003', 'Incident reported'),
  ('i0000001-0000-0000-0000-000000000007', 'reported', 'resolved', 'a0000001-0000-0000-0000-000000000001', 'Waste cleared. Regular collection schedule restored.'),
  ('i0000001-0000-0000-0000-000000000007', 'resolved', 'verified', 'a0000001-0000-0000-0000-000000000002', 'Citizen confirmed resolution via feedback. Verified.');

-- ============================================================
-- CITIZEN FEEDBACK
-- ============================================================

INSERT INTO citizen_feedback (incident_id, user_id, rating, feedback_text, is_satisfied, challenge_flag) VALUES
  ('i0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000004', 4,
   'Repair was done well but took longer than expected. The area is clean now.', TRUE, FALSE),
  ('i0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000003', 5,
   'Quick response from the PMC team! Waste cleared within 2 days of my report.', TRUE, FALSE),
  ('i0000001-0000-0000-0000-000000000013', 'c0000001-0000-0000-0000-000000000003', 3,
   'The garbage was eventually cleared but it took 6 days. Response time needs improvement.', FALSE, FALSE);

-- ============================================================
-- HOTSPOT CLUSTERS (pre-computed demonstration)
-- ============================================================

INSERT INTO hotspot_clusters (
  cluster_centroid, centroid_lat, centroid_lng, radius_meters,
  incident_count, dominant_category, severity_level, ward
) VALUES
  (ST_SetSRID(ST_MakePoint(73.8355, 18.5140), 4326), 18.5140, 73.8355, 150, 4, 'pothole', 'critical', 'Ward 09/14 - Karve/JM Road'),
  (ST_SetSRID(ST_MakePoint(73.9350, 18.5020), 4326), 18.5020, 73.9350, 100, 2, 'drainage', 'high', 'Ward 21 - Hadapsar'),
  (ST_SetSRID(ST_MakePoint(73.8565, 18.5157), 4326), 18.5157, 73.8565, 80,  2, 'drainage', 'critical', 'Ward 16 - Kasba Peth');
