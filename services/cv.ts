import api from "@/cores/api";
import { GetSchema } from "@/types/base";
import { behaviorAPI } from "@/services/behavior";

const clearCvCache = () => {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem("auto_recommendations_cache");
    }
};

export const cvAPI = {
    create: async (data: { id?: string, title?: string, subtitle?: string, title_style?: string, subtitle_style?: string, has_avatar?: boolean, avatar_style?: string, primary_color?: string, sections?: string, name: string, template_id?: string }) => {
        clearCvCache();
        const res = await api.post(`/cv/create`, data);
        const cvId = (res?.data?.data?.id || res?.data?.id || data.id) as string | undefined;
        if (cvId) {
            behaviorAPI.trackCVUsage({
                cv_id: cvId,
                cv_type: "profile",
                cv_name: data.name,
                action: "create",
            });
        }
        return res;
    },
    update: async (data: { id?: string, title?: string, subtitle?: string, title_style?: string, subtitle_style?: string, has_avatar?: boolean, avatar_style?: string, primary_color?: string, sections?: string, name: string, template_id?: string }) => {
        clearCvCache();
        const res = await api.post(`/cv/update`, data);
        if (data.id) {
            behaviorAPI.trackCVUsage({
                cv_id: data.id,
                cv_type: "profile",
                cv_name: data.name,
                action: "update",
            });
        }
        return res;
    },
    getForUser: async (filters: GetSchema) => { return await api.post(`/cv/get-for-user`, filters); },
    delete: async (id: string) => {
        clearCvCache();
        behaviorAPI.trackCVUsage({
            cv_id: id,
            cv_type: "profile",
            action: "delete",
        });
        return await api.delete(`/cv/${id}`);
    },
    getRecommendations: async (id: string, top_k: number = 10) => { return await api.get(`/cv/recommendations/${id}`, { params: { top_k } }); },
    getRecommendationsFromFile: async (id: string, top_k: number = 10) => { return await api.get(`/cv/recommendations/file/${id}`, { params: { top_k } }); },
    getAutoRecommendations: async (top_k: number = 10, source?: string) => { return await api.get(`/cv/recommendations-auto`, { params: { top_k, source } }); },
    getHotJobs: async (top_k: number = 10) => { return await api.get(`/cv/hot-jobs`, { params: { top_k } }); },
    analyzeMatch: async (jobId: string, cvId?: string) => {
        if (cvId) {
            return await api.get(`/cv/analyze-match/${cvId}/${jobId}`);
        }
        return await api.get(`/cv/analyze-match-auto/${jobId}`);
    },

    // Primary / applied CV — drives the recommendation pipeline.
    getPrimary: async () => { return await api.get(`/cv/primary`); },
    setPrimary: async (id: string) => {
        clearCvCache();
        behaviorAPI.trackCVUsage({
            cv_id: id,
            cv_type: "profile",
            action: "set_primary",
            is_primary: true,
        });
        return await api.post(`/cv/set-primary/${id}`);
    },
    clearPrimary: async () => {
        clearCvCache();
        behaviorAPI.trackEvent({
            event_category: "engagement",
            event_action: "cv_clear_primary",
        });
        return await api.post(`/cv/clear-primary`);
    },
};

export interface PrimaryCvInfo {
    cv_type: "profile" | "uploaded" | null;
    cv: {
        id: string;
        name: string;
        title?: string | null;
        subtitle?: string | null;
        primary_color?: string | null;
        file_path?: string | null;
        updated_at?: string | null;
        created_at?: string | null;
    } | null;
}
