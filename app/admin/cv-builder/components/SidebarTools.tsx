"use client";

import React, { useState, useEffect, useRef } from "react";
import { TemplateData } from "./CVCanvas";

interface SidebarToolsProps {
    primaryColor: string;
    data: TemplateData;
    onAddElement: (el: any) => void;
}

// ─── SVG Icon definition ──────────────────────────────────────────────────────
// Đặt file SVG vào /public/icons/
// Ví dụ: /public/icons/email.svg, /public/icons/phone.svg ...
export interface SvgIconDef {
    id: string;
    src: string;       // path từ /public, e.g. "/icons/email.svg"
    label: string;
    category: string;
}

export const ICON_LIBRARY: SvgIconDef[] = [
    // Contact
    { id: "email-1",        src: "/icons/email-1.svg",        label: "Email",        category: "Contact" },
    { id: "phone-1",        src: "/icons/phone-1.svg",        label: "Phone",        category: "Contact" },
    { id: "location-1",     src: "/icons/location-1.svg",     label: "Location",     category: "Contact" },
    { id: "website-1",      src: "/icons/website-1.svg",      label: "Website",      category: "Contact" },
    { id: "linkedin-1",     src: "/icons/linkedin-1.svg",     label: "LinkedIn",     category: "Contact" },
    { id: "github-1",       src: "/icons/github-1.svg",       label: "GitHub",       category: "Contact" },
    // Career
    { id: "work-1",         src: "/icons/work-1.svg",         label: "Work",         category: "Career" },
    { id: "education-1",    src: "/icons/education-1.svg",    label: "Education",    category: "Career" },
    { id: "award-1",        src: "/icons/award-1.svg",        label: "Award",        category: "Career" },
    { id: "language-1",     src: "/icons/language-1.svg",     label: "Language",     category: "Career" },
    { id: "skill-1",        src: "/icons/skill-1.svg",        label: "Skill",        category: "Career" },
    // Decorative
    { id: "star-1",         src: "/icons/star-1.svg",         label: "Star",         category: "Decor" },
    { id: "check-1",        src: "/icons/check-1.svg",        label: "Check",        category: "Decor" },
    { id: "arrow-right-1",  src: "/icons/arrow-right-1.svg",  label: "Arrow",        category: "Decor" },
    { id: "diamond-1",      src: "/icons/diamond-1.svg",      label: "Diamond",      category: "Decor" },
    { id: "dot-1",          src: "/icons/dot-1.svg",          label: "Dot",          category: "Decor" },
];

// ─── SVG Icon preview (loads file, tints với primaryColor) ───────────────────
const SvgIconPreview = ({
    src, color, size = 22,
}: { src: string; color: string; size?: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setFailed(false);
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);

            // Tint: recolor mọi pixel không trong suốt sang primaryColor
            const hex = color.replace("#", "");
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            const imageData = ctx.getImageData(0, 0, size, size);
            const d = imageData.data;
            for (let i = 0; i < d.length; i += 4) {
                if (d[i + 3] > 10) {
                    d[i]     = r;
                    d[i + 1] = g;
                    d[i + 2] = b;
                    // giữ nguyên alpha để icon giữ hình dạng
                }
            }
            ctx.putImageData(imageData, 0, 0);
        };

        img.onerror = () => setFailed(true);

        // Thêm cache-bust nhỏ để tránh CORS cache cũ
        img.src = src;
    }, [src, color, size]);

    if (failed) {
        // Fallback: hiện chữ cái đầu của tên file
        const name = src.split("/").pop()?.replace(".svg", "") ?? "?";
        return (
            <div
                style={{ width: size, height: size, color, fontSize: size * 0.48, fontWeight: 700 }}
                className="flex items-center justify-center opacity-60 select-none uppercase"
            >
                {name.charAt(0)}
            </div>
        );
    }

    return <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />;
};

// ─── Drag wrapper ─────────────────────────────────────────────────────────────
const Draggable = ({
    payload, children, title,
}: { payload: any; children: React.ReactNode; title?: string }) => {
    const onDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("application/cv-element", JSON.stringify(payload));
        e.dataTransfer.effectAllowed = "copy";
    };
    return (
        <div
            draggable
            onDragStart={onDragStart}
            title={title}
            className="flex flex-col items-center justify-center p-1.5 rounded-md border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all select-none"
            style={{ minHeight: 52 }}
        >
            {children}
        </div>
    );
};

// ─── Shape mini-preview ───────────────────────────────────────────────────────
const ShapeIcon = ({ type, color }: { type: string; color: string }) => {
    const s = { background: color };
    if (type === "rect")       return <div style={{ ...s, width: 26, height: 20, borderRadius: 2 }} />;
    if (type === "rect-round") return <div style={{ ...s, width: 26, height: 20, borderRadius: 8 }} />;
    if (type === "circle")     return <div style={{ ...s, width: 22, height: 22, borderRadius: "50%" }} />;
    if (type === "ellipse")    return <div style={{ ...s, width: 30, height: 18, borderRadius: "50%" }} />;
    if (type === "line")       return <div style={{ ...s, width: 30, height: 2, borderRadius: 1, marginTop: 10 }} />;
    if (type === "line-v")     return <div style={{ ...s, width: 2, height: 26, borderRadius: 1 }} />;
    return null;
};

// ─── Section presets ──────────────────────────────────────────────────────────
const SECTION_PRESETS = [
    { label: "Experience",     title: "Work Experience",   items: [{ text: "Company / Role / Dates" }, { text: "Achievement 1" }] },
    { label: "Education",      title: "Education",         items: [{ text: "University / Degree / Year" }] },
    { label: "Skills",         title: "Skills",            items: [{ text: "Skill 1" }, { text: "Skill 2" }, { text: "Skill 3" }] },
    { label: "Contact",        title: "Contact",           items: [{ text: "email@example.com" }, { text: "+84 000 000 000" }, { text: "City, Country" }] },
    { label: "Summary",        title: "Profile Summary",   items: [{ text: "Write a short professional summary here." }] },
    { label: "Languages",      title: "Languages",         items: [{ text: "English — Fluent" }, { text: "Vietnamese — Native" }] },
    { label: "Certifications", title: "Certifications",    items: [{ text: "Certificate Name — Issuer — Year" }] },
    { label: "References",     title: "References",        items: [{ text: "Available upon request." }] },
];

// ─── Layout presets ───────────────────────────────────────────────────────────
const layoutPresets = (c: string) => [
    { label: "Left Sidebar",     elements: [{ type: "rect", x: 0, y: 0, width: 260, height: 1123, fill: c, opacity: 1,    zIndex: 0 }] },
    { label: "Top Header",       elements: [{ type: "rect", x: 0, y: 0, width: 794, height: 160,  fill: c, opacity: 1,    zIndex: 0 }] },
    { label: "Header + Sidebar", elements: [
        { type: "rect", x: 0, y: 0,   width: 794, height: 140, fill: c, opacity: 1,    zIndex: 0 },
        { type: "rect", x: 0, y: 140, width: 250, height: 983, fill: c, opacity: 0.08, zIndex: 0 },
    ]},
    { label: "Accent Strip",     elements: [
        { type: "rect", x: 0, y: 0, width: 8,   height: 1123, fill: c, opacity: 1,    zIndex: 0 },
        { type: "rect", x: 0, y: 0, width: 794, height: 130,  fill: c, opacity: 0.06, zIndex: 0 },
    ]},
];

// ─── Collapsible group ────────────────────────────────────────────────────────
const Group = ({
    label, children, defaultOpen = true,
}: { label: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:bg-gray-50 flex items-center justify-between"
            >
                <span>{label}</span>
                <span className="text-gray-300 text-[8px]">{open ? "▲" : "▼"}</span>
            </button>
            {open && <div className="p-2">{children}</div>}
        </div>
    );
};

const ICON_CATEGORIES = ["All", ...Array.from(new Set(ICON_LIBRARY.map(i => i.category)))];

// ─── Main component ───────────────────────────────────────────────────────────
export const SidebarTools = ({ primaryColor, data, onAddElement }: SidebarToolsProps) => {
    const [iconCat, setIconCat] = useState("All");
    const mkId = () => `el-${Date.now()}`;

    const SHAPES = [
        { type: "rect",       label: "Rect",    payload: { type: "rect",   width: 120, height: 80,  fill: primaryColor, opacity: 1, zIndex: 10, borderRadius: 0  } },
        { type: "rect-round", label: "Rounded", payload: { type: "rect",   width: 120, height: 80,  fill: primaryColor, opacity: 1, zIndex: 10, borderRadius: 12 } },
        { type: "circle",     label: "Circle",  payload: { type: "circle", width: 80,  height: 80,  fill: primaryColor, opacity: 1, zIndex: 10 } },
        { type: "ellipse",    label: "Ellipse", payload: { type: "circle", width: 120, height: 70,  fill: primaryColor, opacity: 1, zIndex: 10 } },
        { type: "line",       label: "H-Line",  payload: { type: "line",   width: 200, height: 4,   fill: primaryColor, strokeWidth: 2, zIndex: 10 } },
        { type: "line-v",     label: "V-Line",  payload: { type: "line",   width: 4,   height: 200, fill: primaryColor, strokeWidth: 2, zIndex: 10 } },
    ];

    const visibleIcons = iconCat === "All"
        ? ICON_LIBRARY
        : ICON_LIBRARY.filter(ic => ic.category === iconCat);

    return (
        <div className="h-full overflow-y-auto flex flex-col text-[12px] bg-white">

            {/* Header */}
            <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
                <p className="font-bold text-[13px] text-gray-800">Template Builder</p>
                <p className="text-[10px] text-gray-400">Drag elements onto the canvas</p>
            </div>

            {/* Primary color indicator */}
            <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Primary</span>
                <div className="w-5 h-5 rounded border border-gray-200 shrink-0" style={{ background: primaryColor }} />
                <span className="text-[11px] font-mono text-gray-400">{primaryColor}</span>
            </div>

            {/* Shapes */}
            <Group label="Shapes">
                <div className="grid grid-cols-3 gap-1.5">
                    {SHAPES.map(s => (
                        <Draggable key={s.type} payload={s.payload} title={s.label}>
                            <ShapeIcon type={s.type} color={primaryColor} />
                            <span className="text-[9px] text-gray-400 mt-1">{s.label}</span>
                        </Draggable>
                    ))}
                </div>
            </Group>

            {/* SVG Icons */}
            <Group label="Icons">
                {/* Category tabs */}
                <div className="flex flex-wrap gap-1 mb-2">
                    {ICON_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setIconCat(cat)}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border transition-colors ${
                                iconCat === cat
                                    ? "border-blue-500 bg-blue-500 text-white"
                                    : "border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Icon grid */}
                <div className="grid grid-cols-4 gap-1">
                    {visibleIcons.map(ic => (
                        <Draggable
                            key={ic.id}
                            title={ic.label}
                            payload={{
                                type: "icon",
                                iconSrc: ic.src,      // /public path — dùng để load lên canvas
                                iconId: ic.id,
                                width: 32,
                                height: 32,
                                iconColor: primaryColor,
                                zIndex: 20,
                            }}
                        >
                            <SvgIconPreview src={ic.src} color={primaryColor} size={22} />
                            <span className="text-[8px] text-gray-400 mt-0.5 text-center leading-tight truncate w-full px-0.5">
                                {ic.label}
                            </span>
                        </Draggable>
                    ))}
                </div>

                <p className="text-[9px] text-gray-300 mt-2 text-center leading-snug">
                    Đặt SVG vào <code className="bg-gray-100 px-0.5 rounded font-mono">/public/icons/</code>
                </p>
            </Group>

            {/* Quick Layouts */}
            <Group label="Quick Layouts" defaultOpen={false}>
                <div className="flex flex-col gap-1.5">
                    {layoutPresets(primaryColor).map(lp => (
                        <button
                            key={lp.label}
                            onClick={() => lp.elements.forEach(el => onAddElement({ ...el, id: mkId() }))}
                            className="text-left px-3 py-2 text-[11px] border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center gap-2"
                        >
                            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: primaryColor, opacity: 0.8 }} />
                            {lp.label}
                        </button>
                    ))}
                </div>
            </Group>

            {/* Section Blocks */}
            <Group label="Section Blocks" defaultOpen={false}>
                <div className="flex flex-col gap-1">
                    {SECTION_PRESETS.map(sp => (
                        <Draggable
                            key={sp.label}
                            title={`Add ${sp.label} section`}
                            payload={{ type: "section", title: sp.title, width: 460, height: 160, items: sp.items }}
                        >
                            <div className="w-full flex items-center gap-2 px-1 py-0.5">
                                <span className="text-[10px] font-bold text-blue-600 uppercase">{sp.label}</span>
                                <span className="text-[9px] text-gray-300 ml-auto">{sp.items.length}</span>
                            </div>
                        </Draggable>
                    ))}
                </div>
            </Group>

            {/* Tips */}
            <div className="mx-2 my-3 bg-amber-50 border border-amber-200 rounded-md p-2.5 shrink-0">
                <p className="text-[10px] text-amber-700 leading-relaxed">
                    <strong>Tips</strong><br />
                    • Drag shapes &amp; icons onto the canvas<br />
                    • <kbd className="bg-amber-100 px-0.5 rounded text-[9px]">Delete</kbd> removes selected<br />
                    • Scroll = zoom &nbsp;·&nbsp; Alt+drag = pan<br />
                    • Snap guides appear while dragging
                </p>
            </div>
        </div>
    );
};