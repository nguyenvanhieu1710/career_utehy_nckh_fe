import api from "@/cores/api";
import { GetSchema } from "@/types/base";
import { Company, CompanyCreate, CompanyUpdate } from "@/types/company";

export const companyAPI = {
  // Get all companies with pagination and search
  getCompanies: async (filters: GetSchema) => {
    const response = await api.post("/company/get-companies", filters);
    return response.data;
  },

  // Get companies for dropdown/select options
  getCompaniesDropdown: async () => {
    const response = await api.get("/company/get-companies-dropdown");
    return response.data;
  },

  // Get company by ID
  getCompanyById: async (companyId: string) => {
    const response = await api.get(`/company/get-company/${companyId}`);
    return response.data;
  },

  // Create new company
  createCompany: async (data: CompanyCreate) => {
    const response = await api.post("/company/create-company", data);
    return response.data;
  },

  // Update company
  updateCompany: async (companyId: string, data: CompanyUpdate) => {
    const response = await api.put(
      `/company/update-company/${companyId}`,
      data
    );
    return response.data;
  },

  // Delete company (soft delete)
  deleteCompany: async (companyId: string) => {
    const response = await api.delete(`/company/delete-company/${companyId}`);
    return response.data;
  },
};

export default companyAPI;
