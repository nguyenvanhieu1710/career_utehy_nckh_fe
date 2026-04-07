"use client";

import React, { useState } from "react";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { BgElement, CVSection, TemplateData } from "./CVCanvas";

interface PropertyEditorProps {
    selectedId: string | null;
    data: TemplateData;
    onChange: (patch: Partial<TemplateData>) => void;
    onDelete: (id: string) => void;
}

// ─── Tiny UI atoms (WinForm-like) ───────────────────────────────────────────
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center min-h-[26px] border-b border-gray-100">
        <div className="w-[110px] shrink-0 text-[11px] text-gray-500 font-medium pl-2 py-0.5 bg-gray-50 border-r border-gray-100 select-none">
            {label}
        </div>
        <div className="flex-1 px-1.5 py-0.5">{children}</div>
    </div>
);

const NumInput = ({ value, onChange, min, max, step = 1 }: any) => (
    <input
        type="number" value={Math.round(value ?? 0)}
        min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full text-[12px] border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 py-0 h-[22px] tabular-nums"
    />
);

const ColorInput = ({ value, onChange }: any) => (
    <div className="flex items-center gap-1.5">
        <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
            className="w-[22px] h-[22px] p-0 border-0 rounded cursor-pointer bg-transparent" />
        <span className="text-[11px] font-mono text-gray-400">{value || "#000000"}</span>
    </div>
);

const SliderInput = ({ value, onChange, min = 0, max = 100, label }: any) => (
    <div className="flex items-center gap-1.5">
        <input type="range" value={value ?? max} min={min} max={max}
            onChange={e => onChange(Number(e.target.value))}
            className="flex-1 h-1 accent-blue-500" />
        <span className="text-[11px] w-[28px] text-right tabular-nums text-gray-500">{value ?? max}</span>
    </div>
);

const SelectInput = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full text-[12px] border-0 bg-transparent focus:outline-none h-[22px]">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

const GroupHeader = ({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) => (
    <button onClick={onToggle}
        className="w-full flex items-center gap-1 bg-[#e8edf5] hover:bg-[#dce3ef] px-2 py-1 text-[11px] font-bold text-[#3a4a6b] uppercase tracking-wide border-b border-[#c8d0e0] select-none">
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        {label}
    </button>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const PropertyEditor = ({ selectedId, data, onChange, onDelete }: PropertyEditorProps) => {
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        position: true, size: true, appearance: true, border: true, section: true
    });
    const toggle = (k: string) => setOpenGroups(g => ({ ...g, [k]: !g[k] }));

    if (!selectedId) return (
        <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 select-none">
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                <span className="text-2xl">⊹</span>
            </div>
            <p className="text-[12px] text-gray-400">Select an object to edit</p>
        </div>
    );

    const el = data.backgroundElements.find(e => e.id === selectedId) as BgElement | undefined;
    const sec = data.sections.find(s => s.id === selectedId) as CVSection | undefined;

    if (el) return <BgElementEditor el={el} openGroups={openGroups} toggle={toggle}
        onChange={(patch: any) => onChange({ backgroundElements: data.backgroundElements.map(e => e.id === selectedId ? { ...e, ...patch } : e) })}
        onDelete={() => { onDelete(selectedId); }} />;

    if (sec) return <SectionEditor sec={sec} openGroups={openGroups} toggle={toggle}
        primaryColor={data.primaryColor}
        onChange={(patch: any) => onChange({ sections: data.sections.map(s => s.id === selectedId ? { ...s, ...patch } : s) })}
        onDelete={() => { onDelete(selectedId); }} />;

    return null;
};

// ─── Background Element Editor ────────────────────────────────────────────────
const BgElementEditor = ({ el, openGroups, toggle, onChange, onDelete }: any) => (
    <div className="h-full flex flex-col text-[12px]">
        {/* Title bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#f0f4fa] border-b border-[#c8d0e0]">
            <div>
                <span className="font-bold text-[#1a3060] text-[13px]">{el.type.toUpperCase()}</span>
                <span className="text-[10px] text-gray-400 ml-2">#{el.id.slice(-6)}</span>
            </div>
            <button onClick={onDelete} title="Delete" className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={14} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto">
            {/* Position */}
            <GroupHeader label="Position" open={openGroups.position} onToggle={() => toggle("position")} />
            {openGroups.position && <>
                <Row label="X"><NumInput value={el.x} onChange={(v: number) => onChange({ x: v })} /></Row>
                <Row label="Y"><NumInput value={el.y} onChange={(v: number) => onChange({ y: v })} /></Row>
                <Row label="Z-Index"><NumInput value={el.zIndex} onChange={(v: number) => onChange({ zIndex: v })} /></Row>
            </>}

            {/* Size */}
            <GroupHeader label="Size" open={openGroups.size} onToggle={() => toggle("size")} />
            {openGroups.size && <>
                <Row label="Width"><NumInput value={el.width} min={4} onChange={(v: number) => onChange({ width: v })} /></Row>
                <Row label="Height"><NumInput value={el.height} min={4} onChange={(v: number) => onChange({ height: v })} /></Row>
                {el.type === "rect" && (
                    <Row label="Radius"><NumInput value={el.borderRadius ?? 0} min={0} max={Math.min(el.width, el.height) / 2} onChange={(v: number) => onChange({ borderRadius: v })} /></Row>
                )}
            </>}

            {/* Appearance */}
            <GroupHeader label="Appearance" open={openGroups.appearance} onToggle={() => toggle("appearance")} />
            {openGroups.appearance && <>
                {el.type !== "line" && (
                    <Row label="Fill"><ColorInput value={el.fill} onChange={(v: string) => onChange({ fill: v })} /></Row>
                )}
                <Row label="Opacity (%)"><SliderInput value={Math.round((el.opacity ?? 1) * 100)} min={0} max={100}
                    onChange={(v: number) => onChange({ opacity: v / 100 })} /></Row>
                {el.type === "icon" && <>
                    <Row label="Icon File">
                        <input type="text" value={el.iconSrc || ""}
                            placeholder="/icons/email.svg"
                            onChange={e => onChange({ iconSrc: e.target.value })}
                            className="w-full text-[11px] border-0 bg-transparent focus:outline-none h-[22px] px-1 font-mono" />
                    </Row>
                    <Row label="Icon Color"><ColorInput value={el.iconColor} onChange={(v: string) => onChange({ iconColor: v })} /></Row>
                </>}
                {el.type === "line" && (
                    <Row label="Color"><ColorInput value={el.fill} onChange={(v: string) => onChange({ fill: v })} /></Row>
                )}
            </>}

            {/* Border */}
            {(el.type === "rect" || el.type === "circle") && <>
                <GroupHeader label="Border" open={openGroups.border} onToggle={() => toggle("border")} />
                {openGroups.border && <>
                    <Row label="Stroke Color"><ColorInput value={el.stroke} onChange={(v: string) => onChange({ stroke: v })} /></Row>
                    <Row label="Stroke Width"><NumInput value={el.strokeWidth ?? 0} min={0} max={20}
                        onChange={(v: number) => onChange({ strokeWidth: v })} /></Row>
                </>}
            </>}
        </div>
    </div>
);

// ─── Section Editor ────────────────────────────────────────────────────────────
const SectionEditor = ({ sec, openGroups, toggle, primaryColor, onChange, onDelete }: any) => {
    const [editItemIdx, setEditItemIdx] = useState<number | null>(null);

    const updateItem = (idx: number, patch: Partial<{ text: string; style: any }>) => {
        const newItems = sec.items.map((it: any, i: number) => i === idx ? { ...it, ...patch } : it);
        onChange({ items: newItems });
    };
    const addItem = () => onChange({ items: [...sec.items, { text: "New item", style: {} }] });
    const removeItem = (idx: number) => onChange({ items: sec.items.filter((_: any, i: number) => i !== idx) });

    return (
        <div className="h-full flex flex-col text-[12px]">
            <div className="flex items-center justify-between px-3 py-2 bg-[#f0f4fa] border-b border-[#c8d0e0]">
                <div>
                    <span className="font-bold text-[#1a3060] text-[13px]">SECTION</span>
                    <span className="text-[10px] text-gray-400 ml-2">#{sec.id.slice(-6)}</span>
                </div>
                <button onClick={onDelete} title="Delete" className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Position & Size */}
                <GroupHeader label="Position" open={openGroups.position} onToggle={() => toggle("position")} />
                {openGroups.position && <>
                    <Row label="X"><NumInput value={sec.x} onChange={(v: number) => onChange({ x: v })} /></Row>
                    <Row label="Y"><NumInput value={sec.y} onChange={(v: number) => onChange({ y: v })} /></Row>
                    <Row label="Width"><NumInput value={sec.size.width} min={60} onChange={(v: number) => onChange({ size: { ...sec.size, width: v } })} /></Row>
                    <Row label="Height"><NumInput value={sec.size.height} min={40} onChange={(v: number) => onChange({ size: { ...sec.size, height: v } })} /></Row>
                </>}

                {/* Section Style */}
                <GroupHeader label="Appearance" open={openGroups.section} onToggle={() => toggle("section")} />
                {openGroups.section && <>
                    <Row label="Title">
                        <input type="text" value={sec.title} onChange={e => onChange({ title: e.target.value })}
                            className="w-full text-[12px] border-0 bg-transparent focus:outline-none h-[22px] px-1" />
                    </Row>
                    <Row label="Accent Color"><ColorInput value={sec.accentColor || primaryColor} onChange={(v: string) => onChange({ accentColor: v })} /></Row>
                    <Row label="Title Color"><ColorInput value={sec.titleColor || "#111827"} onChange={(v: string) => onChange({ titleColor: v })} /></Row>
                    <Row label="Text Color"><ColorInput value={sec.textColor || "#374151"} onChange={(v: string) => onChange({ textColor: v })} /></Row>
                </>}

                {/* Items */}
                <GroupHeader label={`Items (${sec.items.length})`} open={openGroups.items ?? true} onToggle={() => toggle("items")} />
                {(openGroups.items ?? true) && (
                    <div className="p-2 flex flex-col gap-1">
                        {sec.items.map((item: any, idx: number) => (
                            <div key={idx} className="border border-gray-200 rounded">
                                <div className="flex items-center gap-1 px-1.5 py-1 bg-gray-50 cursor-pointer"
                                    onClick={() => setEditItemIdx(editItemIdx === idx ? null : idx)}>
                                    <span className="text-[10px] text-gray-400 w-4">{idx + 1}.</span>
                                    <span className="flex-1 text-[11px] truncate text-gray-700">{item.text}</span>
                                    <button onClick={e => { e.stopPropagation(); removeItem(idx); }}
                                        className="text-red-300 hover:text-red-500"><Trash2 size={10} /></button>
                                </div>
                                {editItemIdx === idx && (
                                    <div className="p-1.5 border-t border-gray-100 flex flex-col gap-1">
                                        <textarea value={item.text} rows={2}
                                            onChange={e => updateItem(idx, { text: e.target.value })}
                                            className="w-full text-[11px] border border-gray-200 rounded p-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-1 text-[10px]">
                                                <input type="checkbox" checked={!!item.style?.bold}
                                                    onChange={e => updateItem(idx, { style: { ...item.style, bold: e.target.checked } })} />
                                                <span className="font-bold">B</span>
                                            </label>
                                            <label className="flex items-center gap-1 text-[10px]">
                                                <input type="checkbox" checked={!!item.style?.italic}
                                                    onChange={e => updateItem(idx, { style: { ...item.style, italic: e.target.checked } })} />
                                                <span className="italic">I</span>
                                            </label>
                                            <input type="color" value={item.style?.color || "#374151"}
                                                onChange={e => updateItem(idx, { style: { ...item.style, color: e.target.value } })}
                                                className="w-[20px] h-[18px] border-0 p-0 cursor-pointer rounded" title="Text color" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button onClick={addItem}
                            className="mt-1 text-[11px] text-blue-500 hover:text-blue-700 border border-dashed border-blue-300 hover:border-blue-500 rounded py-1 transition-colors">
                            + Add item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};