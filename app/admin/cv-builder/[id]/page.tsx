"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import TemplateEditorPage from "../new/page";
import {
    AvatarStyle,
    CVSection,
    HeaderTextStyle,
    TemplateData,
} from "../components/CVCanvas";
import { cvTemplateAPI, CVTemplate } from "@/services/cvTemplate";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_TITLE_STYLE: HeaderTextStyle = {
    x: 292,
    y: 68,
    font_size: 34,
    font_family: "Arial",
    font_weight: "bold",
    color: "#111827",
};

const DEFAULT_SUBTITLE_STYLE: HeaderTextStyle = {
    x: 292,
    y: 94,
    font_size: 15,
    font_family: "Arial",
    font_weight: "normal",
    color: "#1d7057ff",
};

const DEFAULT_AVATAR_STYLE: AvatarStyle = {
    x: 50,
    y: 18,
    width: 160,
    height: 160,
    border_radius: 999,
    rotation: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
};

const parseJson = <T,>(raw: string | undefined, fallback: T): T => {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
};

const toNum = (value: unknown, fallback: number) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const parseHeaderStyle = (raw: string | undefined, fallback: HeaderTextStyle): HeaderTextStyle => {
    const parsed = parseJson<any>(raw, fallback);
    return {
        x: toNum(parsed?.x, fallback.x),
        y: toNum(parsed?.y, fallback.y),
        font_size: toNum(parsed?.font_size, fallback.font_size),
        font_family: parsed?.font_family || fallback.font_family,
        font_weight: parsed?.font_weight === "bold" ? "bold" : "normal",
        color: parsed?.color || fallback.color,
    };
};

const parseAvatarStyle = (raw: string | undefined, fallback: AvatarStyle): AvatarStyle => {
    const parsed = parseJson<any>(raw, fallback);
    return {
        x: toNum(parsed?.x, fallback.x),
        y: toNum(parsed?.y, fallback.y),
        width: toNum(parsed?.width, fallback.width),
        height: toNum(parsed?.height, fallback.height),
        border_radius: toNum(parsed?.border_radius, fallback.border_radius),
        rotation: toNum(parsed?.rotation, fallback.rotation),
        scale: toNum(parsed?.scale, fallback.scale),
        offsetX: toNum(parsed?.offsetX, fallback.offsetX),
        offsetY: toNum(parsed?.offsetY, fallback.offsetY),
    };
};

const mapTemplateToData = (tpl: CVTemplate): TemplateData => {
    return {
        name: tpl.name || "Template",
        primaryColor: tpl.primary_color || "#1d7057",
        defaultTitle: tpl.default_title || "Họ và Tên",
        defaultSubTitle: tpl.default_subtitle || "Vị trí ứng tuyển",
        titleStyle: parseHeaderStyle(tpl.title_style, DEFAULT_TITLE_STYLE),
        subTitleStyle: parseHeaderStyle(tpl.subtitle_style, DEFAULT_SUBTITLE_STYLE),
        hasAvatar: tpl.has_avatar ?? true,
        avatarStyle: parseAvatarStyle(tpl.avatar_style, DEFAULT_AVATAR_STYLE),
        backgroundElements: parseJson<any[]>(tpl.design_data, []),
        sections: parseJson<CVSection[]>(tpl.default_sections, []),
    };
};

export default function EditTemplatePage() {
    const { id } = useParams();
    const templateId = useMemo(() => (typeof id === "string" ? id : ""), [id]);
    const [initialData, setInitialData] = useState<TemplateData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!templateId) return;
        setLoading(true);
        cvTemplateAPI.getTemplateById(templateId)
            .then((res) => {
                const tpl = res.data?.data as CVTemplate;
                setInitialData(mapTemplateToData(tpl));
            })
            .catch((err) => {
                console.error(err);
                toast.error("Không thể tải template để chỉnh sửa");
            })
            .finally(() => setLoading(false));
    }, [templateId]);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 size={18} className="animate-spin" />
                    Đang tải template...
                </div>
            </div>
        );
    }

    if (!initialData || !templateId) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-50 text-gray-600">
                Không tìm thấy template để chỉnh sửa.
            </div>
        );
    }

    return <TemplateEditorPage templateId={templateId} initialData={initialData} />;
}

