import api from "@/cores/api";
import { GetSchema } from "@/types/base";

// --- Types cho CV Template ---
export interface ShapeElement {
    type: 'rect' | 'circle' | 'line';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    zIndex: number;
}

export interface CVTemplate {
    id: string;
    name: string;
    thumbnail: string;
    category: string;
    status: "active" | "draft";
    description?: string;
    primary_color: string;
    design_data: string;
    default_sections: string;
    created_at: string;
    updated_at: string;
}

export interface TemplateCreate {
    name: string;
    category: string;
    design_data: any;
    default_sections: string; // JSON string của mảng sections mặc định
    primary_color: string;
    
}

// --- Service API ---
export const cvTemplateAPI = {
    // Lấy danh sách mẫu (Có phân trang và filter)
    getTemplates: (filters: GetSchema & { category?: string; status?: string }) =>
        api.post<{
            total: number;
            page: number;
            max_page: number;
            data: CVTemplate[];
        }>("/cv-templates/get-all", filters),

    // Lấy chi tiết một mẫu để nạp vào Canvas Builder
    getTemplateById: (id: string) =>
        api.get<{ status: string; data: CVTemplate }>(`/cv-templates/${id}`),

    // Tạo mẫu mới (thường là tạo nháp trước rồi mới vào thiết kế)
    createTemplate: (data: TemplateCreate) =>
        api.post<{ status: string; data: CVTemplate; default_sections: string }>("/cv-templates/create", data),

    // Cập nhật thiết kế (Lưu từ trang Canvas)
    updateTemplateDesign: (id: string, designData: any, thumbnailBase64?: string) =>
        api.put<{ status: string; message: string }>(`/cv-templates/update-design/${id}`, {
            design_data: designData,
            thumbnail: thumbnailBase64, // Gửi ảnh chụp canvas để làm preview
        }),

    // Cập nhật thông tin cơ bản (Tên, danh mục, trạng thái)
    updateTemplateInfo: (id: string, data: Partial<CVTemplate>) =>
        api.put<{ status: string; data: CVTemplate }>(`/cv-templates/update-info/${id}`, data),

    // Xóa mẫu
    deleteTemplate: (id: string) =>
        api.delete<{ status: string; message: string }>(`/cv-templates/delete/${id}`),

    // Nhân bản mẫu (Clone)
    cloneTemplate: (id: string) =>
        api.post<{ status: string; data: CVTemplate }>(`/cv-templates/clone/${id}`),

    // Helper: Upload ảnh thumbnail riêng nếu cần
    uploadThumbnail: (id: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post(`/cv-templates/upload-thumbnail/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }
};