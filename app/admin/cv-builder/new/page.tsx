"use client";

import { useState, useRef, useCallback } from "react";
import { CVCanvas, CVSection, SectionItem, TemplateData } from "../components/CVCanvas";
import { SidebarTools } from "../components/SidebarTools";
import { PropertyEditor } from "../components/PropertyEditor";
import { cvTemplateAPI } from "@/services/cvTemplate";
import { toast } from "sonner";
import { Save, Eye, EyeOff, Loader2, Download, Palette, FileText } from "lucide-react";

const DEFAULT_DATA: TemplateData = {
    name: "New Template",
    primaryColor: "#1d7057",
    backgroundElements: [
        { id: "init-sidebar", type: "rect", x: 0, y: 0, width: 260, height: 1123, fill: "#1d7057", opacity: 1, zIndex: 0 },
    ],
    sections: [],
};

interface PageProps {
    templateId?: string;      // if editing existing template
    initialData?: TemplateData;
}

export default function TemplateEditorPage({ templateId, initialData }: PageProps) {
    const [data, setData] = useState<TemplateData>(initialData ?? DEFAULT_DATA);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const canvasRef = useRef<{ toDataURL: () => string }>(null);

    // ── Patch data ────────────────────────────────────────────────────────────
    const handleChange = useCallback((patch: Partial<TemplateData>) => {
        setData(prev => ({
            ...prev,
            ...patch,
            backgroundElements: patch.backgroundElements ?? prev.backgroundElements,
            sections: patch.sections ?? prev.sections,
        }));
    }, []);
    const createDefaultItem = (text: string): SectionItem => ({
        text,
        editing: false,
        tempText: "",
        style: {
            bold: false,
            italic: false,
            underline: false,
            color: "#000000",
        },
        children: [],
        expanded: true,
    });
    // ── Add element ───────────────────────────────────────────────────────────
    const handleAddElement = (el: any) => {
        const newId = el.id || `el-${Date.now()}`;
        if (el.type === "section") {
            const sec: CVSection = {
                id: `section-${Date.now()}`,
                title: el.title || "Section",
                open: true,

                items: (el.items || ["New item"]).map((t: any) =>
                    typeof t === "string" ? createDefaultItem(t) : {
                        ...createDefaultItem(t.text || ""),
                        ...t,
                    }
                ),

                adding: false,
                editingIndex: null,

                x: el.x ?? 300,
                y: el.y ?? 200,
                size: {
                    width: el.width || 400,
                    height: el.height || 200,
                },
            };
            setData(prev => ({ ...prev, sections: [...prev.sections, sec] }));
            setSelectedId(sec.id);
        } else {
            const newEl = { ...el, id: newId, x: el.x ?? 300, y: el.y ?? 200, zIndex: (data.backgroundElements.length + 1) };
            setData(prev => ({ ...prev, backgroundElements: [...prev.backgroundElements, newEl] }));
            setSelectedId(newId);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = (id: string) => {
        setData(prev => ({
            ...prev,
            backgroundElements: prev.backgroundElements.filter(e => e.id !== id),
            sections: prev.sections.filter(s => s.id !== id),
        }));
        setSelectedId(null);
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const thumbnailB64 = canvasRef.current?.toDataURL();

            const cvData = {
                name: data.name,
                category: "General",
                design_data: JSON.stringify(data.backgroundElements),
                default_sections: JSON.stringify(data.sections),
                primary_color: data.primaryColor,
            };

            if (templateId) {
                await cvTemplateAPI.updateTemplateDesign(templateId, cvData, thumbnailB64);
                toast.success("Template saved!");
            } else {
                const res = await cvTemplateAPI.createTemplate(cvData);
                toast.success("Template created!");
            }
        } catch (err) {
            toast.error("Failed to save template");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // ── Export PNG ────────────────────────────────────────────────────────────
    const handleExport = () => {
        const dataUrl = canvasRef.current?.toDataURL();
        if (!dataUrl) return;
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${data.name || "template"}.png`;
        a.click();
    };

    // ── Primary color change → update all elements using old primary color ──
    const handlePrimaryColor = (newColor: string) => {
        const oldColor = data.primaryColor;
        setData(prev => ({
            ...prev,
            primaryColor: newColor,
            backgroundElements: prev.backgroundElements.map(el =>
                el.fill === oldColor ? { ...el, fill: newColor } : el
            ),
        }));
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">

            {/* ── Left sidebar ── */}
            <aside className="w-60 flex flex-col bg-white border-r border-gray-200 shadow-sm overflow-hidden">
                <SidebarTools
                    primaryColor={data.primaryColor}
                    data={data}
                    onAddElement={handleAddElement}
                />
            </aside>

            {/* ── Center canvas ── */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="h-11 flex items-center gap-2 px-4 bg-white border-b border-gray-200 shadow-sm shrink-0">
                    {/* Template name */}
                    <input
                        type="text" value={data.name}
                        onChange={e => handleChange({ name: e.target.value })}
                        className="text-[13px] font-semibold text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-44"
                    />

                    <div className="flex-1" />

                    {/* Primary color */}
                    <label className="flex items-center gap-1.5 cursor-pointer" title="Primary Color">
                        <Palette size={14} className="text-gray-400" />
                        <input type="color" value={data.primaryColor}
                            onChange={e => handlePrimaryColor(e.target.value)}
                            className="w-6 h-6 p-0 border border-gray-200 rounded cursor-pointer" />
                        <span className="text-[11px] font-mono text-gray-400 hidden sm:inline">{data.primaryColor}</span>
                    </label>

                    <div className="w-px h-5 bg-gray-200 mx-1" />

                    {/* Preview toggle */}
                    <button
                        onClick={() => { setPreviewMode(p => !p); setSelectedId(null); }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${previewMode ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}>
                        {previewMode ? <Eye size={13} /> : <EyeOff size={13} />}
                        {previewMode ? "Preview" : "Edit"}
                    </button>

                    {/* Export */}
                    <button onClick={handleExport}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                        <Download size={13} />
                        PNG
                    </button>

                    {/* Save */}
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold bg-[#1a3060] text-white hover:bg-[#162850] disabled:opacity-50 transition-colors">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>

                {/* Canvas area */}
                <div className="flex-1 overflow-hidden">
                    <CVCanvas
                        ref={canvasRef}
                        data={data}
                        mode={previewMode ? "preview" : "admin"}
                        selectedId={previewMode ? null : selectedId}
                        onSelect={setSelectedId}
                        onChange={handleChange}
                    />
                </div>
            </main>

            {/* ── Right property panel ── */}
            <aside className="w-64 flex flex-col bg-white border-l border-gray-200 shadow-sm overflow-hidden">
                <div className="px-3 py-2 bg-[#f0f4fa] border-b border-[#c8d0e0] flex items-center gap-2">
                    <FileText size={13} className="text-[#1a3060]" />
                    <span className="text-[11px] font-bold text-[#1a3060] uppercase tracking-wide">Properties</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <PropertyEditor
                        selectedId={selectedId}
                        data={data}
                        onChange={handleChange}
                        onDelete={handleDelete}
                    />
                </div>
            </aside>
        </div>
    );
}