"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
import {
    Wrench,
    ImageUp,
    Save,
    Download,
    Type,
    Palette,
    Edit2,
    Check,
    X,
    FileText,
    Bold,
} from "lucide-react";
import { CVProfile, Section } from "@/types/cv";
import { ImageState } from "./Canvas_v2";
import CVCanvas from "./Canvas_v2";

// ─── Font-style JSON helpers ──────────────────────────────────────────────────
// titleStyle / subtitleStyle are stored as serialized JSON on the CV record:
//   { x, y, font_size, font_family, font_weight, color }
// We parse with a defensive fallback so a corrupt blob doesn't blank the UI.
export interface HeaderTextStyle {
    x: number;
    y: number;
    font_size: number;
    font_family: string;
    font_weight: "normal" | "bold";
    color: string;
}

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

const FONT_FAMILIES = [
    "Arial",
    "Inter",
    "Roboto",
    "Times New Roman",
    "Georgia",
    "Tahoma",
    "Verdana",
    "Courier New",
] as const;

const PRIMARY_SWATCHES = [
    "#0C6A4E",
    "#1d7057",
    "#0F766E",
    "#1D4ED8",
    "#7C3AED",
    "#DC2626",
    "#EA580C",
    "#0EA5E9",
    "#111827",
];

const parseStyle = (raw: string | undefined, fallback: HeaderTextStyle): HeaderTextStyle => {
    if (!raw) return fallback;
    try {
        const p = JSON.parse(raw);
        return {
            x: Number(p?.x ?? fallback.x),
            y: Number(p?.y ?? fallback.y),
            font_size: Number(p?.font_size ?? fallback.font_size),
            font_family: p?.font_family || fallback.font_family,
            font_weight: p?.font_weight === "bold" ? "bold" : "normal",
            color: p?.color || fallback.color,
        };
    } catch {
        return fallback;
    }
};

const stringifyStyle = (s: HeaderTextStyle) => JSON.stringify(s);

interface CVInfoPanelProps {
    cv_id: string;
    cvs: CVProfile[];
    // Project name
    projectName: string;
    setProjectName: Dispatch<SetStateAction<string>>;
    editingName: boolean;
    setEditingName: Dispatch<SetStateAction<boolean>>;
    tempProjectName: string;
    setTempProjectName: Dispatch<SetStateAction<string>>;
    // Primary color (theme)
    cvColor: string;
    onCVColorChange: (c: string) => void;
    // Avatar
    hasAvatar: boolean;
    setHasAvatar: Dispatch<SetStateAction<boolean>>;
    onImageSelected: (url: string) => void;
    // Header text (title + subtitle)
    cvTitle: string;
    setCvTitle: Dispatch<SetStateAction<string>>;
    cvSubTitle: string;
    setCvSubTitle: Dispatch<SetStateAction<string>>;
    titleStyle?: string;
    setTitleStyle: Dispatch<SetStateAction<string>>;
    subtitleStyle?: string;
    setSubtitleStyle: Dispatch<SetStateAction<string>>;
    // Actions
    onSave: () => void;
    onDownload: () => void;
    // Section data for the small CV cards
    handleItemTextChange: (data: { sectionIndex: number; itemPath: number[]; newText: string }) => void;
    defaultSectionsForFallback: Section[];
    // Image state passthrough for the CV card previews
    initialImageState: ImageState;
}

/**
 * Right-side "Toolbox / Thông tin CV" panel.
 *
 * Houses every CV-LEVEL knob (project name, primary color, avatar, title +
 * subtitle text + per-text font controls, Save/Download), then lists the
 * user's other CVs underneath. The left ToolBox is now solely focused on the
 * section editor.
 */
export default function CVInfoPanel({
    cv_id,
    cvs,
    projectName,
    setProjectName,
    editingName,
    setEditingName,
    tempProjectName,
    setTempProjectName,
    cvColor,
    onCVColorChange,
    hasAvatar,
    setHasAvatar,
    onImageSelected,
    cvTitle,
    setCvTitle,
    cvSubTitle,
    setCvSubTitle,
    titleStyle,
    setTitleStyle,
    subtitleStyle,
    setSubtitleStyle,
    onSave,
    onDownload,
    handleItemTextChange,
    defaultSectionsForFallback,
    initialImageState,
}: CVInfoPanelProps) {
    // Parsed views so we can splice individual style fields without losing the
    // position/x/y values stored in the same JSON blob.
    const parsedTitle = useMemo(() => parseStyle(titleStyle, DEFAULT_TITLE_STYLE), [titleStyle]);
    const parsedSubtitle = useMemo(() => parseStyle(subtitleStyle, DEFAULT_SUBTITLE_STYLE), [subtitleStyle]);

    const updateTitleStyle = (patch: Partial<HeaderTextStyle>) =>
        setTitleStyle(stringifyStyle({ ...parsedTitle, ...patch }));
    const updateSubtitleStyle = (patch: Partial<HeaderTextStyle>) =>
        setSubtitleStyle(stringifyStyle({ ...parsedSubtitle, ...patch }));

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onImageSelected(URL.createObjectURL(file));
    };

    return (
        <aside className="w-[340px] flex-shrink-0 h-screen flex flex-col border-l border-gray-200 bg-gradient-to-b from-white to-gray-50">
            {/* ── Panel header ────────────────────────────────────────────── */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#0C6A4E]/10 text-[#0C6A4E] flex items-center justify-center">
                    <Wrench size={18} />
                </div>
                <div className="flex-1">
                    <h2 className="font-semibold text-gray-900 text-[15px] leading-tight">Thông tin CV</h2>
                    <p className="text-xs text-gray-500">Chỉnh sửa nhanh — không cần kỹ thuật</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* ── Project name ───────────────────────────────────────── */}
                <Card title="Tên dự án" icon={<FileText size={14} />}>
                    {editingName ? (
                        <div className="flex items-center gap-1.5">
                            <input
                                autoFocus
                                value={tempProjectName}
                                onChange={(e) => setTempProjectName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (tempProjectName.trim()) setProjectName(tempProjectName);
                                        setEditingName(false);
                                        onSave();
                                    }
                                    if (e.key === "Escape") setEditingName(false);
                                }}
                                className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md outline-none focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20"
                            />
                            <IconButton
                                color="green"
                                onClick={() => {
                                    if (tempProjectName.trim()) setProjectName(tempProjectName);
                                    setEditingName(false);
                                    onSave();
                                }}
                            >
                                <Check size={14} />
                            </IconButton>
                            <IconButton color="red" onClick={() => setEditingName(false)}>
                                <X size={14} />
                            </IconButton>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800 truncate">{projectName || "—"}</span>
                            <button
                                onClick={() => {
                                    setTempProjectName(projectName);
                                    setEditingName(true);
                                }}
                                className="p-1.5 text-[#0C6A4E] hover:bg-[#0C6A4E]/10 rounded transition-all"
                            >
                                <Edit2 size={14} />
                            </button>
                        </div>
                    )}
                </Card>

                {/* ── Primary color ──────────────────────────────────────── */}
                <Card title="Màu chủ đạo" icon={<Palette size={14} />}>
                    <p className="text-[11px] text-gray-500 mb-2">
                        Đổi màu sẽ áp dụng cho tất cả các khối hình cùng tone của mẫu CV.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {PRIMARY_SWATCHES.map((c) => {
                            const active = c.toLowerCase() === cvColor?.toLowerCase()?.replace(/ff$/, "");
                            return (
                                <button
                                    key={c}
                                    onClick={() => onCVColorChange(c)}
                                    className={`w-7 h-7 rounded-full border transition-all ${
                                        active
                                            ? "ring-2 ring-offset-2 ring-[#0C6A4E] border-white"
                                            : "border-gray-300 hover:scale-110"
                                    }`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            );
                        })}
                        <label
                            className="flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-gray-300 cursor-pointer hover:border-[#0C6A4E] hover:bg-[#0C6A4E]/5 transition-all"
                            title="Chọn màu tùy chỉnh"
                        >
                            <input
                                type="color"
                                className="w-5 h-5 border-none cursor-pointer bg-transparent"
                                value={cvColor?.slice(0, 7) || "#0C6A4E"}
                                onChange={(e) => onCVColorChange(e.target.value)}
                            />
                            <span className="text-[11px] text-gray-600">Tùy chỉnh</span>
                        </label>
                    </div>
                </Card>

                {/* ── Avatar ─────────────────────────────────────────────── */}
                <Card title="Ảnh đại diện" icon={<ImageUp size={14} />}>
                    <label className="flex items-center gap-2 mb-2 text-xs text-gray-700 select-none">
                        <input
                            type="checkbox"
                            className="accent-[#0C6A4E]"
                            checked={hasAvatar}
                            onChange={(e) => setHasAvatar(e.target.checked)}
                        />
                        Hiển thị ảnh trên CV
                    </label>
                    <label
                        className={`flex items-center gap-2 px-3 py-2 text-xs rounded-md border border-dashed cursor-pointer transition-all ${
                            hasAvatar
                                ? "border-gray-300 hover:border-[#0C6A4E] hover:bg-[#0C6A4E]/5 text-gray-700"
                                : "border-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        <ImageUp size={14} />
                        <span className="flex-1">{hasAvatar ? "Chọn ảnh từ máy" : "Đã ẩn ảnh"}</span>
                        <input
                            type="file"
                            className="hidden"
                            disabled={!hasAvatar}
                            accept="image/*"
                            onChange={handleUploadImage}
                        />
                    </label>
                </Card>

                {/* ── Title text + font ──────────────────────────────────── */}
                <Card title="Tiêu đề chính" icon={<Type size={14} />}>
                    <input
                        type="text"
                        placeholder="Họ và tên của bạn"
                        value={cvTitle}
                        onChange={(e) => setCvTitle(e.target.value)}
                        className="w-full mb-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20 transition-all"
                    />
                    <FontControls
                        style={parsedTitle}
                        onChange={updateTitleStyle}
                    />
                </Card>

                {/* ── Subtitle text + font ───────────────────────────────── */}
                <Card title="Tiêu đề phụ" icon={<Type size={14} />}>
                    <input
                        type="text"
                        placeholder="Vị trí ứng tuyển"
                        value={cvSubTitle}
                        onChange={(e) => setCvSubTitle(e.target.value)}
                        className="w-full mb-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20 transition-all"
                    />
                    <FontControls
                        style={parsedSubtitle}
                        onChange={updateSubtitleStyle}
                    />
                </Card>

                {/* ── Save / Download ────────────────────────────────────── */}
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={onSave}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border-2 border-[#0C6A4E] text-[#0C6A4E] bg-white hover:bg-[#0C6A4E]/5 transition-all"
                    >
                        <Save size={16} /> Lưu
                    </button>
                    <button
                        onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg bg-[#0C6A4E] text-white hover:bg-[#0A5940] transition-all"
                    >
                        <Download size={16} /> Tải PDF
                    </button>
                </div>

                {/* ── Other CVs ──────────────────────────────────────────── */}
                <div className="pt-3">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                            CV khác của bạn
                        </span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {cvs?.filter((c) => c.id !== cv_id).map((cv) => {
                            let sections: Section[] = [];
                            if (cv.sections === "NONE") {
                                sections = defaultSectionsForFallback;
                            } else {
                                try {
                                    sections = JSON.parse(cv.sections);
                                } catch {
                                    sections = defaultSectionsForFallback;
                                }
                            }
                            return (
                                <button
                                    key={cv.id}
                                    onClick={() => (location.href = `/cv/${cv.id}`)}
                                    className="group text-left bg-white rounded-xl border border-gray-200 hover:border-[#0C6A4E] hover:shadow-md transition-all overflow-hidden"
                                >
                                    <div className="bg-gray-50 border-b border-gray-100 overflow-hidden">
                                        <CVCanvas
                                            projectName={cv.name}
                                            isSavable={false}
                                            isIcon
                                            imageState={initialImageState}
                                            setImageState={() => {}}
                                            defaultZoom={0.21}
                                            cvTitle={cv.title || ""}
                                            cvSubTitle={cv.subtitle || ""}
                                            primaryColor={cv.primary_color || "#0C6A4E"}
                                            originalTemplatePrimary={cv.primary_color || undefined}
                                            sections={sections}
                                            onItemTextChange={handleItemTextChange}
                                            titleStyle={cv.title_style || undefined}
                                            subtitleStyle={cv.subtitle_style || undefined}
                                            hasAvatar={cv.has_avatar ?? true}
                                            avatarStyle={cv.avatar_style || undefined}
                                        />
                                    </div>
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#0C6A4E] transition-colors">
                                            {cv.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                            Cập nhật: {cv?.updated_at ? new Date(cv.updated_at).toLocaleString() : "—"}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                        {(!cvs || cvs.filter((c) => c.id !== cv_id).length === 0) && (
                            <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                                Chưa có CV nào khác.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}

// ─── Small inline UI helpers ─────────────────────────────────────────────────

interface CardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}
function Card({ title, icon, children }: CardProps) {
    return (
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <header className="px-3 py-2 border-b border-gray-100 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-gray-600">
                {icon}
                <span>{title}</span>
            </header>
            <div className="px-3 py-2.5">{children}</div>
        </section>
    );
}

interface IconButtonProps {
    color: "green" | "red" | "neutral";
    onClick: () => void;
    children: React.ReactNode;
}
function IconButton({ color, onClick, children }: IconButtonProps) {
    const colorClass =
        color === "green"
            ? "text-green-600 hover:bg-green-50"
            : color === "red"
              ? "text-red-600 hover:bg-red-50"
              : "text-gray-600 hover:bg-gray-100";
    return (
        <button onClick={onClick} className={`p-1.5 rounded transition-all ${colorClass}`}>
            {children}
        </button>
    );
}

interface FontControlsProps {
    style: HeaderTextStyle;
    onChange: (patch: Partial<HeaderTextStyle>) => void;
}
function FontControls({ style, onChange }: FontControlsProps) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 flex items-center gap-2">
                <label className="text-[11px] text-gray-600 w-12 shrink-0">Màu</label>
                <input
                    type="color"
                    value={style.color?.slice(0, 7) || "#111827"}
                    onChange={(e) => onChange({ color: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-200 cursor-pointer bg-transparent"
                />
                <input
                    type="text"
                    value={style.color}
                    onChange={(e) => onChange({ color: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs font-mono bg-white border border-gray-300 rounded outline-none focus:border-[#0C6A4E]"
                />
            </div>

            <div className="flex items-center gap-1.5">
                <label className="text-[11px] text-gray-600 w-12 shrink-0">Font</label>
                <select
                    value={style.font_family}
                    onChange={(e) => onChange({ font_family: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs bg-white border border-gray-300 rounded outline-none focus:border-[#0C6A4E]"
                >
                    {FONT_FAMILIES.map((f) => (
                        <option key={f} value={f}>
                            {f}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-1.5">
                <label className="text-[11px] text-gray-600 w-12 shrink-0">Size</label>
                <input
                    type="number"
                    min={8}
                    max={120}
                    value={style.font_size}
                    onChange={(e) => onChange({ font_size: Math.max(8, Math.min(120, Number(e.target.value) || 0)) })}
                    className="flex-1 px-2 py-1.5 text-xs bg-white border border-gray-300 rounded outline-none focus:border-[#0C6A4E]"
                />
            </div>

            <div className="col-span-2 flex items-center gap-2">
                <label className="text-[11px] text-gray-600 w-12 shrink-0">Đậm</label>
                <button
                    onClick={() =>
                        onChange({ font_weight: style.font_weight === "bold" ? "normal" : "bold" })
                    }
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-all flex items-center gap-1 ${
                        style.font_weight === "bold"
                            ? "bg-[#0C6A4E] text-white border-[#0C6A4E]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#0C6A4E]"
                    }`}
                >
                    <Bold size={12} />
                    {style.font_weight === "bold" ? "Bold" : "Regular"}
                </button>
            </div>
        </div>
    );
}
