import api from "@/cores/api";

export const cvAPI = {
    save: (data: {id?: string, title?: string, subtitle?: string, primary_color?: string, sections?: string}) => api.post(`/cv/save`, data),    
};