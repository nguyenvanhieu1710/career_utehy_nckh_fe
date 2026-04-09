export interface RecommendationRequest {
  user_id: string;
  cv_title: string;
  cv_tech: string;
  cv_mota: string;
  candidate_city: string;
  top_n: number;
}

export interface RecommendationJob {
  job_id: number;
  job_title: string;
  company_name: string;
  location_city: string;
  location_district: string;
  experience_required: string;
  exp_min: number;
  exp_max: number;
  sim_title: number;
  sim_tech: number;
  sim_mota: number;
  loc_score: number;
  exp_score: number;
  final_score: number;
}

export interface RecommendationResponse {
  user_id: string;
  recommendations: RecommendationJob[];
}
