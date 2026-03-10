import api from "@/cores/api";

export interface UpdateScheduleRequest {
  frequency?: string;
  cron_expression?: string;
  timezone?: string;
  status?: string;
}

export interface ScheduleResponse {
  source_id: string;
  frequency: string;
  cron_expression: string;
  timezone: string;
  status: string;
  last_scheduled_at: string | null;
  is_scheduled: boolean;
}

export interface ScheduledJob {
  id: string;
  name: string;
  source_id: string;
  next_run_time: string | null;
  trigger: string;
}

export const schedulerAPI = {
  // Update crawl schedule
  updateSchedule: async (
    sourceId: string,
    data: UpdateScheduleRequest,
  ): Promise<ScheduleResponse> => {
    const response = await api.put(`/data-sources/${sourceId}/schedule`, data);
    return response.data;
  },

  // Get crawl schedule
  getSchedule: async (sourceId: string): Promise<ScheduleResponse> => {
    const response = await api.get(`/data-sources/${sourceId}/schedule`);
    return response.data;
  },

  // Trigger crawl immediately
  triggerCrawl: async (sourceId: string): Promise<any> => {
    const response = await api.post(`/data-sources/${sourceId}/trigger-crawl`);
    return response.data;
  },

  // Get all scheduled jobs
  getScheduledJobs: async (): Promise<{
    jobs: ScheduledJob[];
    total: number;
  }> => {
    const response = await api.get("/scheduled-jobs");
    return response.data;
  },

  // Get scheduler health
  getSchedulerHealth: async (): Promise<any> => {
    const response = await api.get("/scheduler/health");
    return response.data;
  },

  // Get scheduler monitor
  getSchedulerMonitor: async (): Promise<any> => {
    const response = await api.get("/scheduler/monitor");
    return response.data;
  },
};
