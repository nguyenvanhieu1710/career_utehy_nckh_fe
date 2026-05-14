"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CVCanvas,
  CVSection,
  SectionItem,
  TemplateData,
} from "../components/CVCanvas";
import { SidebarTools } from "../components/SidebarTools";
import { PropertyEditor } from "../components/PropertyEditor";
import { cvTemplateAPI } from "@/services/cvTemplate";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Download,
  Palette,
  FileText,
  ArrowLeft,
} from "lucide-react";

export default function TemplateEditPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [data, setData] = useState<TemplateData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<{ toDataURL: () => string }>(null);

  // ── Load Template Data ──────────────────────────────────────────────────
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        const res = await cvTemplateAPI.getTemplateById(templateId);
        const tpl = res.data.data;

        setData({
          name: tpl.name,
          category: tpl.category || "Chung",
          primaryColor: tpl.primary_color || "#1d7057",
          backgroundElements: JSON.parse(tpl.design_data || "[]"),
          sections: JSON.parse(tpl.default_sections || "[]"),
        });
      } catch (err) {
        toast.error("Không thể tải dữ liệu mẫu CV");
        router.push("/admin/cv-templates");
      } finally {
        setLoading(false);
      }
    };
    if (templateId) loadTemplate();
  }, [templateId, router]);

  // ── Patch data ────────────────────────────────────────────────────────────
  const handleChange = useCallback((patch: Partial<TemplateData>) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            ...patch,
            backgroundElements:
              patch.backgroundElements ?? prev.backgroundElements,
            sections: patch.sections ?? prev.sections,
          }
        : null,
    );
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

  const handleAddElement = (el: any) => {
    if (!data) return;
    const newId = el.id || `el-${Date.now()}`;
    if (el.type === "section") {
      const sec: CVSection = {
        id: `section-${Date.now()}`,
        title: el.title || "Section",
        items: (el.items || ["New item"]).map((t: any) =>
          createDefaultItem(typeof t === "string" ? t : t.text || ""),
        ),
        x: el.x ?? 300,
        y: el.y ?? 200,
        size: {
          width: el.width || 400,
          height: el.height || 200,
        },
      };
      setData((prev) =>
        prev ? { ...prev, sections: [...prev.sections, sec] } : null,
      );
      setSelectedId(sec.id);
    } else {
      const newEl = {
        ...el,
        id: newId,
        x: el.x ?? 300,
        y: el.y ?? 200,
        zIndex: data.backgroundElements.length + 1,
      };
      setData((prev) =>
        prev
          ? { ...prev, backgroundElements: [...prev.backgroundElements, newEl] }
          : null,
      );
      setSelectedId(newId);
    }
  };

  const handleDelete = (id: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            backgroundElements: prev.backgroundElements.filter(
              (e) => e.id !== id,
            ),
            sections: prev.sections.filter((s) => s.id !== id),
          }
        : null,
    );
    setSelectedId(null);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const cvData = {
        name: data.name,
        category: data.category,
        design_data: JSON.stringify(data.backgroundElements),
        default_sections: JSON.stringify(data.sections),
        primary_color: data.primaryColor,
      };

      await cvTemplateAPI.updateTemplateDesign(templateId, cvData);
      toast.success("Đã cập nhật thiết kế!");
    } catch (err) {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const dataUrl = canvasRef.current?.toDataURL();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${data?.name || "template"}.png`;
    a.click();
  };

  const handlePrimaryColor = (newColor: string) => {
    if (!data) return;
    const oldColor = data.primaryColor;
    setData((prev) =>
      prev
        ? {
            ...prev,
            primaryColor: newColor,
            backgroundElements: prev.backgroundElements.map((el) =>
              el.fill === oldColor ? { ...el, fill: newColor } : el,
            ),
          }
        : null,
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-500 font-medium">Đang tải thiết kế...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
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
          <button
            onClick={() => router.push("/admin/cv-templates")}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors mr-1"
          >
            <ArrowLeft size={16} />
          </button>

          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange({ name: e.target.value })}
            className="text-[13px] font-bold text-gray-800 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-44"
            placeholder="Tên mẫu CV..."
          />

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <select
            value={data.category}
            onChange={(e) => handleChange({ category: e.target.value })}
            className="text-[12px] text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="Chung">Chung</option>
            <option value="IT">Công nghệ thông tin</option>
            <option value="Marketing">Marketing</option>
            <option value="Design">Thiết kế</option>
          </select>

          <div className="flex-1" />

          {/* Primary color */}
          <label
            className="flex items-center gap-1.5 cursor-pointer"
            title="Màu chủ đạo"
          >
            <Palette size={14} className="text-gray-400" />
            <input
              type="color"
              value={data.primaryColor}
              onChange={(e) => handlePrimaryColor(e.target.value)}
              className="w-6 h-6 p-0 border border-gray-200 rounded cursor-pointer overflow-hidden"
            />
          </label>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Export */}
          <button
            onClick={handleExport}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
            title="Xuất ảnh PNG"
          >
            <Download size={16} />
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-2 bg-[#1a3060] hover:bg-[#2a4580] text-white rounded-md disabled:opacity-50 transition-all shadow-sm flex items-center justify-center"
            title="Lưu thiết kế"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
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
          <span className="text-[11px] font-bold text-[#1a3060] uppercase tracking-wide">
            Thuộc tính
          </span>
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
