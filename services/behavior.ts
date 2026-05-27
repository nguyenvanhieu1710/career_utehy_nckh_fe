import api from "@/cores/api";

/**
 * Frontend client for the behavior-tracking pipeline.
 *
 * Every meaningful user action should be logged through here so the
 * Big-Data analytics tables on the backend stay populated. All calls
 * accept partial payloads — the helpers below auto-fill page context,
 * session ID, referrer, etc. before hitting the API.
 */

const SESSION_KEY = "career_utehy_session_id";

function ensureSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = window.localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function pageContext() {
  if (typeof window === "undefined") {
    return { page_url: "", page_path: "", page_title: "", referrer: "" };
  }
  return {
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer || "",
  };
}

async function safePost(path: string, body: Record<string, unknown>) {
  try {
    const session_id = ensureSessionId();
    await api.post(path, { session_id, ...body }, {
      headers: { "x-session-id": session_id },
    });
  } catch {
    // Behavior tracking must never break the user flow.
  }
}

// --------------------------------------------------------------------- //
//  Public API
// --------------------------------------------------------------------- //

export interface TrackEventPayload {
  event_category: string;   // navigation | engagement | search | conversion | system
  event_action: string;     // page_view | click | scroll | hover | download | share | ...
  event_label?: string;
  target_type?: string;
  target_id?: string;
  target_value?: string;
  event_value?: number;
  duration_ms?: number;
  metadata_json?: Record<string, unknown>;
}

export interface TrackJobViewPayload {
  job_id: string;
  job_title?: string;
  job_source?: string;       // 'sql' | 'mongo'
  company_id?: string;
  company_name?: string;
  category_id?: string;
  category_slug?: string;
  category_title?: string;
  action?: string;           // view | click_apply | save_favorite | share | print | scroll_complete
  source?: string;           // search | recommend_auto | category_browse | direct | homepage_hot
  search_keyword?: string;
  filter_snapshot?: Record<string, unknown>;
  view_duration_ms?: number;
  scroll_depth?: number;
}

export interface TrackCVUsagePayload {
  cv_id: string;
  cv_type: "profile" | "uploaded";
  cv_name?: string;
  is_primary?: boolean;
  action: string;            // create | update | delete | set_primary | clear_primary | analyze_match | recommend | download | print
  job_id?: string;
  job_title?: string;
  category_id?: string;
  result_score?: number;
  result_count?: number;
  mode?: string;
  success?: boolean;
  error_message?: string;
  duration_ms?: number;
  metadata_json?: Record<string, unknown>;
}

export interface TrackCategoryPayload {
  interaction_type: string;  // view_list | view_detail | filter | search_within | recommended_in | apply_click_in
  category_id?: string;
  category_slug?: string;
  category_title?: string;
  related_job_id?: string;
  related_job_title?: string;
  keyword?: string;
  source?: string;
  duration_ms?: number;
  metadata_json?: Record<string, unknown>;
}

export interface TrackSearchPayload {
  keyword: string;
  scope?: string;            // job | company | category | chatbot | cv_template
  filter_snapshot?: Record<string, unknown>;
  result_count?: number;
  clicked_target_type?: string;
  clicked_target_id?: string;
  duration_ms?: number;
}

export const behaviorAPI = {
  ensureSessionId,

  startSession: (
    landing_path?: string,
    utm?: { utm_source?: string; utm_medium?: string; utm_campaign?: string },
  ) => {
    if (typeof window === "undefined") return Promise.resolve();
    return safePost("/behavior/track/session-start", {
      session_id: ensureSessionId(),
      landing_path: landing_path || window.location.pathname,
      referrer: document.referrer || "",
      screen_size: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      ...(utm || {}),
    });
  },

  trackEvent: (payload: TrackEventPayload) =>
    safePost("/behavior/track/event", {
      ...pageContext(),
      ...payload,
    }),

  trackPageView: (extra?: Partial<TrackEventPayload>) =>
    safePost("/behavior/track/event", {
      event_category: "navigation",
      event_action: "page_view",
      ...pageContext(),
      ...(extra || {}),
    }),

  trackJobView: (payload: TrackJobViewPayload) =>
    safePost("/behavior/track/job-view", {
      ...payload,
      page_url:
        typeof window !== "undefined" ? window.location.href : undefined,
      referrer: typeof window !== "undefined" ? document.referrer : undefined,
      action: payload.action || "view",
    }),

  trackCVUsage: (payload: TrackCVUsagePayload) =>
    safePost("/behavior/track/cv-usage", payload),

  trackCategory: (payload: TrackCategoryPayload) =>
    safePost("/behavior/track/category", {
      page_path:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      referrer: typeof window !== "undefined" ? document.referrer : undefined,
      ...payload,
    }),

  trackSearch: (payload: TrackSearchPayload) =>
    safePost("/behavior/track/search", payload),
};

// --------------------------------------------------------------------- //
//  Analytics read endpoints (admin)
// --------------------------------------------------------------------- //

export interface BehaviorTotalsDashboard {
  events_total: number;
  page_views: number;
  sessions: number;
  active_users: number;
  job_views: number;
  unique_jobs_viewed: number;
  cv_uses: number;
  cv_evaluations: number;
  category_interactions: number;
  searches: number;
  avg_cv_score: number;
}

export interface BehaviorTimelinePoint {
  name: string;
  full_date: string;
  events?: number;
  sessions?: number;
  job_views?: number;
  cv_uses?: number;
  cv_evaluations?: number;
  category_interactions?: number;
  searches?: number;
  interactions?: number;
}

export interface BehaviorBreakdown {
  name: string;
  count: number;
}

export interface BehaviorOverview {
  window_days: number;
  totals: BehaviorTotalsDashboard;
  timeline: BehaviorTimelinePoint[];
  breakdowns: Record<string, BehaviorBreakdown[]>;
  top_jobs: Array<{
    job_id: string;
    title?: string;
    company?: string;
    views: number;
    unique_users: number;
  }>;
  top_categories: Array<{
    slug: string;
    title?: string;
    interactions: number;
    unique_users: number;
  }>;
  top_pages: Array<{ path: string; views: number }>;
  top_keywords: Array<{ keyword: string; hits: number; avg_results: number }>;
  top_users: Array<{
    user_id: string;
    fullname?: string;
    email?: string;
    events: number;
  }>;
}

export interface UserBehaviorAnalytics {
  user_id: string;
  window_days: number;
  totals: Record<string, number>;
  timeline: BehaviorTimelinePoint[];
  breakdowns: Record<string, BehaviorBreakdown[]>;
  top_categories: Array<{ slug: string; title?: string; interactions: number }>;
  top_jobs: Array<{
    job_id: string;
    title?: string;
    company?: string;
    views: number;
    last_at?: string;
  }>;
  recent_events: Array<{
    id: string;
    event_category: string;
    event_action: string;
    event_label?: string;
    target_type?: string;
    target_id?: string;
    page_path?: string;
    device_type?: string;
    browser?: string;
    duration_ms?: number;
    ip_address?: string;
    occurred_at?: string;
  }>;
  cv_evaluation_history: Array<{
    id: string;
    cv_id: string;
    cv_type: string;
    cv_name?: string;
    job_id: string;
    job_title?: string;
    company_name?: string;
    category_slug?: string;
    score?: number;
    mode?: string;
    provider?: string;
    reliability_level?: string;
    occurred_at?: string;
  }>;
  sessions: Array<{
    id: string;
    session_id: string;
    ip_address?: string;
    device_type?: string;
    browser?: string;
    os?: string;
    country?: string;
    city?: string;
    started_at?: string;
    last_activity_at?: string;
    total_events: number;
    total_page_views: number;
    is_authenticated: boolean;
  }>;
  hourly_activity: Array<{ hour: number; events: number }>;
}

export interface CategoryBehaviorAnalytics {
  category_id?: string;
  category_slug?: string;
  window_days: number;
  totals: Record<string, number>;
  timeline: BehaviorTimelinePoint[];
  breakdowns: Record<string, BehaviorBreakdown[]>;
  top_jobs: Array<{
    job_id: string;
    title?: string;
    company?: string;
    views: number;
    unique_users: number;
  }>;
  top_users: Array<{
    user_id: string;
    fullname?: string;
    email?: string;
    views: number;
  }>;
  top_keywords: Array<{ keyword: string; hits: number }>;
  hourly_activity: Array<{ hour: number; events: number }>;
}

export const behaviorAnalyticsAPI = {
  getOverview: async (days = 7): Promise<BehaviorOverview> => {
    const res = await api.get<{ status: string; data: BehaviorOverview }>(
      "/behavior/admin/overview",
      { params: { days } },
    );
    return res.data.data;
  },

  getUserBehavior: async (
    userId: string,
    days = 30,
  ): Promise<UserBehaviorAnalytics> => {
    const res = await api.get<{ status: string; data: UserBehaviorAnalytics }>(
      `/behavior/admin/user/${userId}`,
      { params: { days } },
    );
    return res.data.data;
  },

  getCategoryBehavior: async (
    args: { category_id?: string; category_slug?: string },
    days = 30,
  ): Promise<CategoryBehaviorAnalytics> => {
    const res = await api.get<{
      status: string;
      data: CategoryBehaviorAnalytics;
    }>("/behavior/admin/category", {
      params: { ...args, days },
    });
    return res.data.data;
  },
};

export default behaviorAPI;
