import api from "@/cores/api";
import { GetSchema } from "@/types/base";

export const cvUploadedAPI = {
  upload: (file: File, name?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (name) formData.append("name", name);

    return api.post("/cv-uploaded/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getForUser: (filters: GetSchema) => {
    return api.post("/cv-uploaded/get-for-user", filters);
  },

  delete: (id: string) => {
    return api.delete(`/cv-uploaded/${id}`);
  },
};
