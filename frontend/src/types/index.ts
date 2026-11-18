export type UserRole = 'citizen' | 'admin' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ward?: string;
  phone?: string;
  created_at: string;
}

export type IncidentCategory =
  | 'pothole'
  | 'garbage'
  | 'water_leakage'
  | 'drainage'
  | 'streetlight'
  | 'road_damage'
  | 'other';

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'reported'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'verified'
  | 'rejected';

export type DepartmentType =
  | 'roads'
  | 'solid_waste'
  | 'water_supply'
  | 'storm_water'
  | 'street_lighting'
  | 'general';

export interface Incident {
  id: string;
  incident_code: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  address?: string;
  ward?: string;
  ai_category_suggestion?: IncidentCategory;
  ai_priority_suggestion?: IncidentPriority;
  ai_confidence_score?: number;
  ai_analysis_notes?: string;
  is_duplicate?: boolean;
  duplicate_group_id?: string;
  reporter_id?: string;
  reporter_name?: string;
  assigned_dept?: DepartmentType;
  image_path?: string;
  severity_score?: number;
  recurrence_count?: number;
  priority_score?: number;
  overdue_flag?: boolean;
  created_at: string;
  updated_at: string;
  history_count?: number;
  evidence_count?: number;
  feedback_count?: number;
}

export interface StatusHistory {
  id: string;
  incident_id: string;
  from_status?: IncidentStatus;
  to_status: IncidentStatus;
  changed_by?: string;
  changed_by_name?: string;
  remark?: string;
  created_at: string;
}

export interface ResolutionEvidence {
  id: string;
  incident_id: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  image_path: string;
  notes?: string;
  evidence_type?: string;
  created_at: string;
}

export interface CitizenFeedback {
  id: string;
  incident_id: string;
  user_id?: string;
  rating?: number;
  feedback_text?: string;
  is_satisfied?: boolean;
  challenge_flag?: boolean;
  challenge_reason?: string;
  created_at: string;
}

export interface DashboardKPIs {
  total_reports: number;
  open_incidents: number;
  critical_incidents: number;
  in_progress_incidents: number;
  resolved_incidents: number;
  overdue_incidents: number;
}

export interface HotspotCluster {
  cluster_id: number;
  incident_count: number;
  centroid_lat: number;
  centroid_lng: number;
  dominant_category: IncidentCategory;
  dominant_priority: IncidentPriority;
  ward: string;
  incident_codes?: string[];
}
