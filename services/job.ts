import api from "@/cores/api";
import { GetSchema } from "@/types/base";
import { Job, JobCreate, JobUpdate } from "@/types/job";

export const jobAPI = {
  // Get all jobs with pagination and search
  getJobs: async (filters: GetSchema) => {
    const response = await api.post("/job/get-jobs", filters);
    return response.data;
  },

  // Get job by ID
  getJobById: async (jobId: string) => {
    const response = await api.get(`/job/get-job/${jobId}`);
    return response.data;
  },

  // Create new job
  createJob: async (data: unknown) => {
    const response = await api.post("/job/create-job", data);
    return response.data;
  },

  // Update job
  updateJob: async (jobId: string, data: unknown) => {
    const response = await api.put(`/job/update-job/${jobId}`, data);
    return response.data;
  },

  // Delete job (soft delete)
  deleteJob: async (jobId: string) => {
    const response = await api.delete(`/job/delete-job/${jobId}`);
    return response.data;
  },

  // Approve job (pending -> approved)
  approveJob: async (jobId: string) => {
    const response = await api.put(`/job/approve-job/${jobId}`);
    return response.data;
  },

  // Reject job (pending -> rejected)
  rejectJob: async (jobId: string) => {
    const response = await api.put(`/job/reject-job/${jobId}`);
    return response.data;
  },

  // Get jobs by status (pending, approved, rejected)
  getJobsByStatus: async (status: string, filters: GetSchema) => {
    const response = await api.post(
      `/job/get-jobs-by-status/${status}`,
      filters
    );
    return response.data;
  },

  // Get companies for dropdown in job form
  getCompaniesDropdown: async () => {
    const response = await api.get("/job/get-companies-dropdown");
    return response.data;
  },

  // Bulk approve jobs
  bulkApproveJobs: async (jobIds: string[]) => {
    const promises = jobIds.map((id) => jobAPI.approveJob(id));
    return Promise.all(promises);
  },

  // Bulk reject jobs
  bulkRejectJobs: async (jobIds: string[]) => {
    const promises = jobIds.map((id) => jobAPI.rejectJob(id));
    return Promise.all(promises);
  },

  // Bulk delete jobs
  bulkDeleteJobs: async (jobIds: string[]) => {
    const promises = jobIds.map((id) => jobAPI.deleteJob(id));
    return Promise.all(promises);
  },
};

export default jobAPI;
