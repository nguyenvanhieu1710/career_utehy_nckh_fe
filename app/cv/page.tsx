"use client";

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { useEffect, useState } from 'react';
import CVCanvas, { ImageState, ShapeElement } from './components/Canvas_v2';
import { ArrowDownWideNarrow, FilePlus, Loader2, Upload, Layers, Check, X } from 'lucide-react';
import { cvAPI } from '@/services/cv';
import { cvTemplateAPI } from '@/services/cvTemplate';
import Loader from '@/components/ui/Loader';
import { CVProfile } from '@/types/cv';
import { Section, SectionItem } from './components/ToolBox';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const guideItem = (text: string): SectionItem => ({
    text, editing: false, tempText: "",
    style: { bold: false, italic: false, underline: false, color: "#000000" },
    children: [], expanded: true,
});

// ─── Default sections (fallback khi CV chưa có template) ─────────────────────
export const DEFAULT_SECTIONS_VI: Section[] = [
    { id: "about",      title: "Giới thiệu",          open: true, items: [guideItem("Viết vài dòng mô tả ngắn gọn về bản thân.")], adding: false, editingIndex: null, x: 270, y: 140,  size: { width: 500, height: 170 } },
    { id: "contact",    title: "Thông tin liên hệ",    open: true, items: [guideItem("email@example.com"), guideItem("0123 456 789"), guideItem("Thành phố, Quốc gia")], adding: false, editingIndex: null, x: 20, y: 310,  size: { width: 200, height: 200 } },
    { id: "experience", title: "Kinh nghiệm làm việc", open: true, items: [guideItem("Vị trí, tên công ty, thời gian làm việc.")], adding: false, editingIndex: null, x: 270, y: 310,  size: { width: 500, height: 400 } },
    { id: "education",  title: "Học vấn",              open: true, items: [guideItem("Tên trường, chuyên ngành, năm tốt nghiệp.")], adding: false, editingIndex: null, x: 270, y: 710,  size: { width: 500, height: 550 } },
    { id: "language",   title: "Ngôn ngữ",             open: true, items: [guideItem("Tiếng Anh – Trung cấp"), guideItem("Tiếng Việt – Bản ngữ")], adding: false, editingIndex: null, x: 20, y: 510,  size: { width: 200, height: 200 } },
    { id: "skills",     title: "Kỹ năng",              open: true, items: [guideItem("JavaScript, React, giao tiếp, làm việc nhóm")], adding: false, editingIndex: null, x: 20, y: 710,  size: { width: 200, height: 200 } },
];

export const DEFAULT_SECTIONS = DEFAULT_SECTIONS_VI; // alias

const INITIAL_IMAGE_STATE: ImageState = {
    x: 50, y: 18, width: 160, height: 160,
    rotation: 0, scale: 1, offsetX: 0, offsetY: 0,
};

// ─── Template data shape ──────────────────────────────────────────────────────
interface TemplateInfo {
    id: string;
    name: string;
    primary_color: string;
    design_data: string;       // JSON string → ShapeElement[]
    default_sections: string;  // JSON string → Section[]
    category?: string;
}

// ─── Template Picker Modal ────────────────────────────────────────────────────
function TemplatePicker({
    templates,
    onSelect,
    onClose,
    loading,
}: {
    templates: TemplateInfo[];
    onSelect: (t: TemplateInfo) => void;
    onClose: () => void;
    loading: boolean;
}) {
    const [selected, setSelected] = useState<TemplateInfo | null>(null);
    const [creating, setCreating] = useState(false);

    const handleConfirm = async () => {
        if (!selected) return;
        setCreating(true);
        onSelect(selected);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Chọn Template</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Template sẽ xác định bố cục và thiết kế cho CV của bạn</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Layers size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Chưa có template nào. Hãy tạo template trước!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {templates.map(tpl => {
                                let bgEls: ShapeElement[] = [];
                                let secs: Section[] = [];
                                try { bgEls = JSON.parse(tpl.design_data); } catch {}
                                try { secs = JSON.parse(tpl.default_sections); } catch {}
                                const isSelected = selected?.id === tpl.id;

                                return (
                                    <div
                                        key={tpl.id}
                                        onClick={() => setSelected(tpl)}
                                        className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${isSelected ? "border-[#0C6A4E] shadow-lg shadow-green-100" : "border-gray-200 hover:border-gray-300"}`}
                                    >
                                        {/* Mini preview canvas */}
                                        <div className="w-full aspect-[3/4] bg-gray-50 overflow-hidden pointer-events-none">
                                            <CVCanvas
                                                projectName={tpl.name}
                                                isSavable={false}
                                                isIcon
                                                imageState={INITIAL_IMAGE_STATE}
                                                setImageState={() => {}}
                                                defaultZoom={0.21}
                                                cvTitle="Your Name"
                                                cvSubTitle="Professional Title"
                                                primaryColor={tpl.primary_color}
                                                sections={secs}
                                                backgroundElements={bgEls}
                                            />
                                        </div>

                                        {/* Selected checkmark */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#0C6A4E] rounded-full flex items-center justify-center">
                                                <Check size={14} color="white" strokeWidth={2.5} />
                                            </div>
                                        )}

                                        <div className="px-2 py-1.5 bg-white">
                                            <p className="text-[12px] font-semibold text-gray-700 truncate">{tpl.name}</p>
                                            {tpl.category && <p className="text-[10px] text-gray-400">{tpl.category}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-400">
                        {selected ? <span className="text-gray-700 font-medium">Đã chọn: {selected.name}</span> : "Chưa chọn template nào"}
                    </p>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-200 transition-colors">Huỷ</button>
                        <button
                            disabled={!selected || creating}
                            onClick={handleConfirm}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#0C6A4E] text-white hover:bg-[#0a5441] disabled:opacity-40 transition-colors"
                        >
                            {creating ? <Loader2 size={14} className="animate-spin" /> : <FilePlus size={14} />}
                            Tạo CV với template này
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── CVManager (main page) ────────────────────────────────────────────────────
export default function CVManager() {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [cvs, setCvs] = useState<CVProfile[]>([]);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Ngày cập nhật');

    // Templates
    const [templates, setTemplates] = useState<TemplateInfo[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);

    // ── Load CVs ──
    useEffect(() => {
        cvAPI.getForUser({}).then(res => setCvs(res.data?.data)).catch(console.error);
    }, []);

    // ── Load Templates ──
    useEffect(() => {
        setTemplatesLoading(true);
        cvTemplateAPI.getTemplates({ page: 1, row: 20 })
            .then(res => setTemplates(res.data?.data || []))
            .catch(console.error)
            .finally(() => setTemplatesLoading(false));
    }, []);

    const sortedFilteredCvs = cvs
        .filter(cv => cv.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (selectedSort === 'Tên CV') return a.name.localeCompare(b.name);
            return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        });

    // ── Create blank CV (no template) ──
    const handleCreateBlankCV = () => {
        setLoading(true);
        cvAPI.create({ name: "New CV", id: undefined, primary_color: "#0C6A4E", sections: "NONE", design_data: "[]" })
            .then(res => { location.href = `/cv/${res.data.id}`; })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    // ── Create CV from selected template ──
    const handleCreateFromTemplate = async (tpl: TemplateInfo) => {
        setLoading(true);
        setShowTemplatePicker(false);
        try {
            // sections từ template default_sections
            const secs = tpl.default_sections || "NONE";
            // design_data (backgroundElements) từ template
            const designData = tpl.design_data || "[]";

            const res = await cvAPI.create({
                name: "New CV",
                id: undefined,
                primary_color: tpl.primary_color,
                sections: secs,
                template_id: tpl.id,
            });
            location.href = `/cv/${res.data.id}`;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            {loading && <Loader />}
            {showTemplatePicker && (
                <TemplatePicker
                    templates={templates}
                    loading={templatesLoading}
                    onSelect={handleCreateFromTemplate}
                    onClose={() => setShowTemplatePicker(false)}
                />
            )}

            <div className="min-h-screen p-6">
                <div className="max-w-8xl mx-auto">

                    {/* ── Page title ── */}
                    <h1 className="text-3xl font-bold text-[#0C6A4E] text-center mb-8">TẤT CẢ CV CỦA BẠN</h1>

                    {/* ── Search bar ── */}
                    <div className="flex gap-4 mb-5">
                        <input
                            type="text"
                            placeholder="Nhập tên CV để tìm kiếm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 text-gray-700 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* ── CV section ── */}
                    <section>
                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 font-medium">Sắp xếp theo</span>
                                <div className="relative">
                                    <button
                                        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-gray-700">{selectedSort}</span>
                                        <ArrowDownWideNarrow className="ml-2 text-gray-400" size={14} />
                                    </button>
                                    {sortDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                            <div className="py-1">
                                                {["Ngày cập nhật", "Tên CV"].map(opt => (
                                                    <button key={opt} onClick={() => { setSelectedSort(opt); setSortDropdownOpen(false); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button className="inline-flex items-center gap-2 rounded-lg bg-[#0C6A4E] px-4 py-2 text-white cursor-pointer hover:bg-[#0a5441] transition-colors">
                                <Upload className="h-4 w-4" />
                                Upload CV
                            </button>
                        </div>

                        <h2 className="mt-3 text-2xl font-semibold text-gray-800 mb-6">Gần đây</h2>

                        {/* CV Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            {/* Create blank CV card */}
                            <div className="bg-white rounded-xl p-4 cursor-pointer" onClick={handleCreateBlankCV}>
                                <div className="w-full aspect-[3/4] bg-gray-50 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 gap-2 transition-colors">
                                    {loading
                                        ? <Loader2 color="white" fill="#89aea3ff" size={56} strokeWidth={1} />
                                        : <FilePlus color="white" fill="#89aea3ff" size={56} strokeWidth={1} />
                                    }
                                    <span className="text-xs text-gray-400">CV trống</span>
                                </div>
                            </div>

                            {/* Existing CVs */}
                            {sortedFilteredCvs?.map(cv => {
                                let sections: Section[] = [];
                                let bgEls: ShapeElement[] = [];
                                try { sections = cv.sections === "NONE" ? DEFAULT_SECTIONS_VI : JSON.parse(cv.sections); } catch {}
                                try { bgEls = cv.design_data && cv.design_data !== "[]" ? JSON.parse(cv.design_data) : []; } catch {}

                                return (
                                    <div key={cv.id} className="bg-white rounded-xl p-4 cursor-pointer" onClick={() => location.href = `/cv/${cv.id}`}>
                                        <div className="w-full aspect-[3/4] overflow-hidden rounded-lg bg-gray-50">
                                            <CVCanvas
                                                projectName={cv.name}
                                                isSavable={false}
                                                isIcon
                                                imageState={INITIAL_IMAGE_STATE}
                                                setImageState={() => {}}
                                                defaultZoom={0.21}
                                                cvTitle={cv.title || ""}
                                                primaryColor={cv.primary_color || "#0C6A4E"}
                                                sections={sections}
                                                backgroundElements={bgEls}
                                            />
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-sm mt-2 mb-1 truncate">{cv.name}</h3>
                                        <div className="text-gray-500 text-xs">Cập nhật: {new Date(cv.updated_at || cv.created_at).toLocaleDateString("vi-VN")}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ─── Template section ────────────────────────────────────────────── */}
                    <section className="mt-14">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800">Bắt đầu từ Template</h2>
                                <p className="text-sm text-gray-400 mt-1">Chọn một bố cục có sẵn để tạo CV nhanh hơn</p>
                            </div>
                            <button
                                onClick={() => setShowTemplatePicker(true)}
                                className="text-sm font-medium text-[#0C6A4E] hover:underline flex items-center gap-1"
                            >
                                Xem tất cả <span>→</span>
                            </button>
                        </div>

                        {templatesLoading ? (
                            <div className="flex items-center gap-3 text-gray-400 py-6">
                                <Loader2 size={20} className="animate-spin" />
                                <span className="text-sm">Đang tải template…</span>
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl">
                                <Layers size={48} className="mb-3 opacity-40" />
                                <p className="text-sm">Chưa có template nào.</p>
                                <p className="text-xs mt-1">Vào trang quản trị để tạo template đầu tiên.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {/* Show first 5, then "See all" */}
                                {templates.slice(0, 5).map(tpl => {
                                    let bgEls: ShapeElement[] = [];
                                    let secs: Section[] = [];
                                    try { bgEls = JSON.parse(tpl.design_data); } catch {}
                                    try { secs = JSON.parse(tpl.default_sections); } catch {}

                                    return (
                                        <div
                                            key={tpl.id}
                                            onClick={() => handleCreateFromTemplate(tpl)}
                                            className="bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:border-[#0C6A4E] hover:shadow-md hover:shadow-green-50 transition-all group"
                                        >
                                            <div className="w-full aspect-[3/4] overflow-hidden bg-gray-50 pointer-events-none">
                                                <CVCanvas
                                                    projectName={tpl.name}
                                                    isSavable={false}
                                                    isIcon
                                                    imageState={INITIAL_IMAGE_STATE}
                                                    setImageState={() => {}}
                                                    defaultZoom={0.21}
                                                    cvTitle="Your Name"
                                                    cvSubTitle="Professional Title"
                                                    primaryColor={tpl.primary_color}
                                                    sections={secs}
                                                    backgroundElements={bgEls}
                                                />
                                            </div>
                                            <div className="px-3 py-2">
                                                <p className="text-[12px] font-semibold text-gray-700 truncate">{tpl.name}</p>
                                                <p className="text-[10px] text-[#0C6A4E] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Dùng template này →</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* See all card */}
                                {templates.length > 5 && (
                                    <div
                                        onClick={() => setShowTemplatePicker(true)}
                                        className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#0C6A4E] hover:bg-green-50 transition-all flex flex-col items-center justify-center gap-2 aspect-[3/4]"
                                    >
                                        <Layers size={28} className="text-gray-300" />
                                        <span className="text-[11px] text-gray-400 font-medium">+{templates.length - 5} khác</span>
                                        <span className="text-[10px] text-[#0C6A4E]">Xem tất cả</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}