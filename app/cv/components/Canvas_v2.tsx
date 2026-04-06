"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize, Move } from "lucide-react";
import { Section } from "../[cv_id]/page";
import jsPDF from "jspdf";
import { cvAPI } from "@/services/cv";
import { toast } from "sonner";

// ─── Shape element (comes from template.design_data) ─────────────────────────
export interface ShapeElement {
    id: string;
    type: "rect" | "circle" | "line" | "icon";
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    borderRadius?: number;
    zIndex?: number;
    iconSrc?: string;
    iconChar?: string;   // legacy emoji fallback
    iconColor?: string;
}

export interface TextStyle {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    color: string;
}

export interface SectionItem {
    text: string;
    editing: boolean;
    tempText: string;
    style: TextStyle;
    children: SectionItem[];
    expanded: boolean;
}

interface SectionLayout {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
}

export interface CVState {
    cvTitle: string;
    cvSubTitle: string;
    primaryColor: string;
    imageURL?: string;
    imageState: ImageState;
    sections: Section[];
    projectName: string;
    backgroundElements?: ShapeElement[];
}

export interface ImageState {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scale: number;
    offsetX: number;
    offsetY: number;
}

interface EditingOverlay {
    sectionIndex: number;
    itemPath: number[];
    text: string;
    screenX: number;
    screenY: number;
    screenWidth: number;
    lineHeight: number;
}

interface CVCanvasProps {
    cv_id?: string;
    imageURL?: string;
    cvTitle?: string;
    cvSubTitle?: string;
    sections?: Section[];
    onSectionDrag?: (data: { id: string; x: number; y: number }) => void;
    primaryColor?: string;
    isIcon?: boolean;
    defaultZoom?: number;
    canvasRef?: React.RefObject<HTMLCanvasElement | null>;
    onSectionResize?: (data: { id: string; width: number; height: number }) => void;
    imageState: ImageState;
    setImageState: Dispatch<SetStateAction<ImageState>>;
    isSavable: boolean;
    projectName: string;
    onItemTextChange?: (data: { sectionIndex: number; itemPath: number[]; newText: string }) => void;
    // ── Template design data ────────────────────────────────────────────────
    // Mảng các shape từ template.design_data (đã parse JSON).
    // Canvas sẽ vẽ các shape này trước, rồi render sections lên trên.
    backgroundElements?: ShapeElement[];
}

type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;

interface DragState { sectionIndex: number; offsetX: number; offsetY: number; }
interface ResizeState { sectionIndex: number; handle: ResizeHandle; startX: number; startY: number; startLayout: SectionLayout; }
interface ImageResizeState { handle: ResizeHandle; startX: number; startY: number; startState: ImageState; }

// ─── Exports / helpers ────────────────────────────────────────────────────────
export const INITIAL_IMAGE_STATE: ImageState = {
    x: 50, y: 18, width: 160, height: 160,
    rotation: 0, scale: 1, offsetX: 0, offsetY: 0,
};

export const getFullCVState = (
    cvTitle: string, cvSubTitle: string, primaryColor: string,
    imageURL: string | undefined, imageState: ImageState,
    sections: Section[], projectName: string,
    backgroundElements?: ShapeElement[],
): CVState => ({
    cvTitle, cvSubTitle, primaryColor, imageURL, imageState,
    sections: sections.map(s => ({ ...s, items: JSON.parse(JSON.stringify(s.items)) })),
    projectName, backgroundElements,
});

// ─── Round rect helper ────────────────────────────────────────────────────────
const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
};

// ─── PDF generation ───────────────────────────────────────────────────────────
export const generatePDFFromState = (state: CVState): void => {
    const A4_W = 794, A4_H = 1123;
    const canvas = document.createElement("canvas");
    canvas.width = A4_W; canvas.height = A4_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const applyStyle = (style: TextStyle, size: number) => {
        ctx.font = `${style?.italic ? "italic" : "normal"} ${style?.bold ? "bold" : "normal"} ${size}px Arial`;
        ctx.fillStyle = style?.color;
    };
    const drawUnderline = (text: string, x: number, y: number, ul: boolean) => {
        ctx.fillText(text, x, y);
        if (ul) { const w = ctx.measureText(text).width; ctx.beginPath(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.moveTo(x, y + 2); ctx.lineTo(x + w, y + 2); ctx.stroke(); }
    };
    const drawItemPDF = (item: SectionItem, x: number, y: number, maxW: number, depth = 0): number => {
        const bx = x + depth * 20; if (bx + 10 > x + maxW) return y + 25;
        ctx.fillStyle = state.primaryColor; ctx.beginPath(); ctx.arc(bx, y - 3, 2, 0, Math.PI * 2); ctx.fill();
        applyStyle(item.style, 14);
        const tx = bx + 10; const avail = maxW - depth * 20 - 10;
        const words = item.text.split(" "); let line = "", lineY = y;
        for (let i = 0; i < words.length; i++) {
            const test = line + words[i] + " ";
            if (ctx.measureText(test).width > avail && i > 0) { drawUnderline(line.trim(), tx, lineY, item.style?.underline); line = words[i] + " "; lineY += 20; } else { line = test; }
        }
        drawUnderline(line.trim(), tx, lineY, item.style?.underline);
        let cy2 = lineY + 25;
        item.children?.forEach(c => { cy2 = drawItemPDF(c, x, cy2, maxW, depth + 1); });
        return cy2;
    };

    // White base
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, A4_W, A4_H);

    // Background elements (template shapes)
    const els = [...(state.backgroundElements || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    for (const el of els) {
        ctx.save();
        ctx.globalAlpha = el.opacity ?? 1;
        if (el.type === "rect") {
            roundRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius || 0);
            if (el.fill) { ctx.fillStyle = el.fill; ctx.fill(); }
            if (el.stroke && (el.strokeWidth || 0) > 0) { ctx.strokeStyle = el.stroke; ctx.lineWidth = el.strokeWidth!; ctx.stroke(); }
        } else if (el.type === "circle") {
            ctx.beginPath(); ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
            if (el.fill) { ctx.fillStyle = el.fill; ctx.fill(); }
            if (el.stroke && (el.strokeWidth || 0) > 0) { ctx.strokeStyle = el.stroke; ctx.lineWidth = el.strokeWidth!; ctx.stroke(); }
        } else if (el.type === "line") {
            ctx.beginPath(); ctx.moveTo(el.x, el.y + el.height / 2); ctx.lineTo(el.x + el.width, el.y + el.height / 2);
            ctx.strokeStyle = el.fill || "#000"; ctx.lineWidth = el.strokeWidth || 2; ctx.stroke();
        } else if (el.type === "icon" && el.iconChar) {
            ctx.font = "28px serif"; ctx.fillStyle = el.iconColor || "#333";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(el.iconChar, el.x + el.width / 2, el.y + el.height / 2);
        }
        ctx.restore();
    }

    // Header text
    ctx.fillStyle = "#111827"; ctx.font = "bold 34px Arial";
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(state.cvTitle || "Your Name", 292, 68);
    ctx.fillStyle = state.primaryColor; ctx.font = "15px Arial";
    ctx.fillText(state.cvSubTitle || "Professional Title", 292, 94);

    const drawSections = () => {
        state.sections.forEach(sec => {
            const { x: sx, y: sy, size: { width: sw, height: sh } } = sec;
            const isSidebar = sx < 250;
            ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
            if (isSidebar) {
                ctx.fillStyle = "rgba(255,255,255,0.15)";
                ctx.beginPath(); (ctx as any).roundRect(sx + 8, sy, sw - 16, 24, 5); ctx.fill();
                ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.font = "bold 11px Arial";
                ctx.textAlign = "left"; ctx.fillText(sec.title.toUpperCase(), sx + 18, sy + 15);
                let iy = sy + 34;
                sec.items.forEach(item => {
                    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fillRect(sx + 10, iy - 4, 7, 1.5);
                    ctx.fillStyle = "rgba(255,255,255,0.93)"; ctx.font = "13px Arial";
                    const words = item.text.split(" "); let line = "", lineY = iy;
                    for (let w = 0; w < words.length; w++) {
                        const test = line + words[w] + " ";
                        if (ctx.measureText(test).width > sw - 28 && w > 0) { ctx.fillText(line.trim(), sx + 22, lineY); line = words[w] + " "; lineY += 17; } else { line = test; }
                    }
                    ctx.fillText(line.trim(), sx + 22, lineY); iy = lineY + 20;
                });
            } else {
                ctx.fillStyle = state.primaryColor;
                ctx.beginPath(); ctx.arc(sx + 6, sy + 11, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#111827"; ctx.font = "bold 13px Arial";
                ctx.textAlign = "left"; ctx.fillText(sec.title.toUpperCase(), sx + 18, sy + 15);
                ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fillRect(sx, sy + 22, sw, 1);
                ctx.fillStyle = state.primaryColor; ctx.fillRect(sx, sy + 22, 32, 2);
                let iy = sy + 42;
                sec.items.forEach(item => { iy = drawItemPDF(item, sx + 10, iy, sw - 20); });
            }
            ctx.restore();
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        pdf.addImage(imgData, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.save(`${state.projectName}.pdf`);
    };

    // Draw avatar
    const doRender = (img?: HTMLImageElement) => {
        if (img) {
            const s = state.imageState;
            ctx.save();
            ctx.beginPath(); ctx.arc(s.x + s.width / 2, s.y + s.height / 2, Math.min(s.width, s.height) / 2, 0, Math.PI * 2); ctx.clip();
            ctx.save();
            ctx.translate(s.x + s.width / 2, s.y + s.height / 2);
            ctx.rotate((s.rotation * Math.PI) / 180);
            ctx.drawImage(img, -s.width * s.scale / 2 + s.offsetX, -s.height * s.scale / 2 + s.offsetY, s.width * s.scale, s.height * s.scale);
            ctx.restore(); ctx.restore();
            ctx.beginPath(); ctx.arc(s.x + s.width / 2, s.y + s.height / 2, Math.min(s.width, s.height) / 2, 0, Math.PI * 2);
            ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.stroke();
        }
        drawSections();
    };

    if (state.imageURL) {
        const img = new Image(); img.crossOrigin = "anonymous";
        img.onload = () => doRender(img); img.onerror = () => doRender(); img.src = state.imageURL;
    } else { doRender(); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Canvas Component ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function CVCanvas({
    primaryColor = "#1d7057",
    imageURL,
    cvTitle = "",
    cvSubTitle = "",
    sections = [],
    onSectionDrag,
    onSectionResize,
    isIcon = false,
    defaultZoom = 1,
    canvasRef,
    imageState,
    setImageState,
    isSavable,
    cv_id,
    projectName,
    onItemTextChange,
    backgroundElements = [],
}: CVCanvasProps) {
    const iconRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // SVG icon image cache
    const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());

    const [zoom, setZoom] = useState(defaultZoom);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const [dragSection, setDragSection] = useState<DragState | null>(null);
    const [resizeState, setResizeState] = useState<ResizeState | null>(null);
    const [hoveredSection, setHoveredSection] = useState<number | null>(null);
    const [hoveredHandle, setHoveredHandle] = useState<ResizeHandle>(null);
    const [sectionLayouts, setSectionLayouts] = useState<Map<number, SectionLayout>>(new Map());
    const [guideLines, setGuideLines] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

    const [hoveredImage, setHoveredImage] = useState(false);
    const [hoveredImageHandle, setHoveredImageHandle] = useState<ResizeHandle>(null);
    const [imageDragState, setImageDragState] = useState<DragState | null>(null);
    const [imageResizeState, setImageResizeState] = useState<ImageResizeState | null>(null);
    const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
    const [imageInternalDragState, setImageInternalDragState] = useState<{ startX: number; startY: number } | null>(null);
    const [isEditingImageInside, setIsEditingImageInside] = useState(false);

    const [editingOverlay, setEditingOverlay] = useState<EditingOverlay | null>(null);
    const lastClickTime = useRef<number>(0);
    const lastClickSection = useRef<number | null>(null);

    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;
    const GRID_SIZE = 20;
    const MIN_SECTION_WIDTH = 100;
    const MIN_SECTION_HEIGHT = 60;
    const HANDLE_SIZE = 8;
    const SNAP_THRESHOLD = 8;
    const ITEM_LINE_HEIGHT = 20;
    const ITEM_SECTION_OFFSET_Y = 42;

    // ── Preload avatar ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!imageURL) return;
        const img = new Image();
        img.onload = () => setLoadedImage(img);
        img.onerror = () => {};
        img.src = imageURL;
    }, [imageURL]);

    // ── Preload SVG icons from backgroundElements ─────────────────────────────
    useEffect(() => {
        for (const el of backgroundElements) {
            if (el.type === "icon" && el.iconSrc && !imgCache.current.has(el.iconSrc)) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => { imgCache.current.set(el.iconSrc!, img); triggerRedraw(); };
                img.src = el.iconSrc;
            }
        }
    }, [backgroundElements]);

    const triggerRedraw = () => {
        const canvas = isIcon ? iconRef.current : canvasRef?.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawCanvas(ctx, canvas.width, canvas.height);
    };

    // ── Sync section layouts ──────────────────────────────────────────────────
    useEffect(() => {
        if (sections.length === 0) return;
        const m = new Map<number, SectionLayout>();
        sections.forEach((s, i) => m.set(i, { id: s.id, x: s.x, y: s.y, width: s.size.width, height: s.size.height }));
        setSectionLayouts(m);
    }, [sections]);

    // ── Key listeners ─────────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!isSavable) return;
            if (e.ctrlKey && e.key === "s") { e.preventDefault(); handleSave(); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isSavable, sections, cvTitle, cvSubTitle, primaryColor, projectName, cv_id]);

    useEffect(() => {
        if (!isIcon) {
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [hoveredImage, isEditingImageInside]);

    // ── Main draw effect ──────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = isIcon ? iconRef.current : canvasRef?.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const container = containerRef.current;
        if (container) { canvas.width = container.clientWidth; canvas.height = container.clientHeight; }
        drawCanvas(ctx, canvas.width, canvas.height);
    }, [primaryColor, zoom, pan, cvTitle, cvSubTitle, sections, hoveredSection,
        sectionLayouts, hoveredHandle, imageState, loadedImage, hoveredImage,
        hoveredImageHandle, editingOverlay, backgroundElements]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [editingOverlay?.text]);

    const handleSave = () => {
        cvAPI.update({
            id: cv_id, primary_color: primaryColor,
            sections: JSON.stringify(sections), title: cvTitle, subtitle: cvSubTitle, name: projectName,
        }).then(() => toast.success("Saved!")).catch(() => {});
    };

    const getA4Bounds = () => {
        const container = containerRef.current;
        if (!container) return null;
        return { centerX: (container.clientWidth / zoom - A4_WIDTH) / 2, centerY: 50 };
    };

    // ─── drawCanvas ──────────────────────────────────────────────────────────
    const drawCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        if (!isIcon) drawGrid(ctx, 1000 / zoom, 1000 / zoom);
        drawA4Paper(ctx);
        drawBackgroundElements(ctx);   // ← dynamic template shapes
        drawCVContent(ctx);
        ctx.restore();
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
        ctx.strokeStyle = "#E5E7EB"; ctx.lineWidth = 0.5;
        const ox = zoom % GRID_SIZE, oy = zoom % GRID_SIZE;
        for (let x = ox; x < w; x += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = oy; y < h; y += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    };

    const drawA4Paper = (ctx: CanvasRenderingContext2D) => {
        const b = getA4Bounds(); if (!b) return;
        ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#FFFFFF"; ctx.fillRect(b.centerX, b.centerY, A4_WIDTH, A4_HEIGHT);
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
        ctx.strokeStyle = "#D1D5DB"; ctx.lineWidth = 1;
        ctx.strokeRect(b.centerX, b.centerY, A4_WIDTH, A4_HEIGHT);
    };

    // ─── Draw template background elements dynamically ────────────────────────
    const drawBackgroundElements = (ctx: CanvasRenderingContext2D) => {
        const b = getA4Bounds(); if (!b) return;
        const { centerX: cx, centerY: cy } = b;
        const sorted = [...backgroundElements].sort((a, b2) => (a.zIndex || 0) - (b2.zIndex || 0));

        for (const el of sorted) {
            ctx.save();
            ctx.globalAlpha = el.opacity ?? 1;
            const ex = cx + el.x, ey = cy + el.y;

            if (el.type === "rect") {
                const r = el.borderRadius || 0;
                roundRect(ctx, ex, ey, el.width, el.height, r);
                if (el.fill) { ctx.fillStyle = el.fill; ctx.fill(); }
                if (el.stroke && (el.strokeWidth || 0) > 0) { ctx.strokeStyle = el.stroke; ctx.lineWidth = el.strokeWidth!; ctx.stroke(); }

            } else if (el.type === "circle") {
                ctx.beginPath();
                ctx.ellipse(ex + el.width / 2, ey + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
                if (el.fill) { ctx.fillStyle = el.fill; ctx.fill(); }
                if (el.stroke && (el.strokeWidth || 0) > 0) { ctx.strokeStyle = el.stroke; ctx.lineWidth = el.strokeWidth!; ctx.stroke(); }

            } else if (el.type === "line") {
                ctx.beginPath();
                ctx.moveTo(ex, ey + el.height / 2);
                ctx.lineTo(ex + el.width, ey + el.height / 2);
                ctx.strokeStyle = el.fill || "#000"; ctx.lineWidth = el.strokeWidth || 2; ctx.stroke();

            } else if (el.type === "icon") {
                if (el.iconSrc) {
                    // SVG icon — tinted
                    const cached = imgCache.current.get(el.iconSrc);
                    if (cached) {
                        const off = document.createElement("canvas");
                        off.width = el.width; off.height = el.height;
                        const octx = off.getContext("2d")!;
                        octx.drawImage(cached, 0, 0, el.width, el.height);
                        const hex = (el.iconColor || primaryColor).replace("#", "");
                        const tr = parseInt(hex.slice(0, 2), 16), tg = parseInt(hex.slice(2, 4), 16), tb = parseInt(hex.slice(4, 6), 16);
                        const imgData = octx.getImageData(0, 0, el.width, el.height);
                        const d = imgData.data;
                        for (let pi = 0; pi < d.length; pi += 4) { if (d[pi + 3] > 10) { d[pi] = tr; d[pi + 1] = tg; d[pi + 2] = tb; } }
                        octx.putImageData(imgData, 0, 0);
                        ctx.drawImage(off, ex, ey, el.width, el.height);
                    }
                } else if (el.iconChar) {
                    // Emoji / char fallback
                    ctx.font = "28px serif"; ctx.fillStyle = el.iconColor || primaryColor;
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText(el.iconChar, ex + el.width / 2, ey + el.height / 2);
                }
            }
            ctx.restore();
        }
    };

    // ─── Text helpers ─────────────────────────────────────────────────────────
    const applyTextStyle = (ctx: CanvasRenderingContext2D, style: TextStyle, size: number) => {
        ctx.font = `${style?.italic ? "italic" : "normal"} ${style?.bold ? "bold" : "normal"} ${size}px Arial`;
        ctx.fillStyle = style?.color;
    };

    const drawTextUnderline = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, ul: boolean) => {
        ctx.fillText(text, x, y);
        if (ul) { const w = ctx.measureText(text).width; ctx.beginPath(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.moveTo(x, y + 2); ctx.lineTo(x + w, y + 2); ctx.stroke(); }
    };

    const drawItem = (ctx: CanvasRenderingContext2D, item: SectionItem, x: number, y: number, maxWidth: number, depth = 0, isEditing = false): number => {
        const indent = depth * 20;
        const bulletX = x + indent;
        if (bulletX + 10 > x + maxWidth) return y + 25;
        if (isEditing) ctx.globalAlpha = 0.25;
        ctx.fillStyle = primaryColor;
        ctx.beginPath(); ctx.arc(bulletX, y - 3, 2, 0, Math.PI * 2); ctx.fill();
        applyTextStyle(ctx, item.style, 14);
        const textX = bulletX + 10;
        const available = maxWidth - indent - 10;
        const words = item.text.split(" ");
        let line = "", lineY = y;
        const lines: string[] = [];
        for (let i = 0; i < words.length; i++) {
            const test = line + words[i] + " ";
            if (ctx.measureText(test).width > available && i > 0) { lines.push(line.trim()); line = words[i] + " "; lineY += 20; } else { line = test; }
        }
        lines.push(line.trim());
        const spaceW = ctx.measureText(" ").width;
        lines.forEach((ln, idx) => {
            const isLast = idx === lines.length - 1;
            const dy = y + idx * 20;
            if (isLast) { drawTextUnderline(ctx, ln, textX, dy, item.style?.underline); return; }
            const ws = ln.split(" ");
            if (ws.length <= 1) { drawTextUnderline(ctx, ln, textX, dy, item.style?.underline); return; }
            const extra = (available - ctx.measureText(ln).width) / (ws.length - 1);
            let xx = textX;
            ws.forEach(w => { drawTextUnderline(ctx, w, xx, dy, item.style?.underline); xx += ctx.measureText(w).width + spaceW + extra; });
        });
        if (isEditing) ctx.globalAlpha = 1;
        let curY = y + lines.length * 20 + 5;
        item.children?.forEach(child => { curY = drawItem(ctx, child, x, curY, maxWidth, depth + 1); });
        return curY;
    };

    // ─── Rounded avatar ───────────────────────────────────────────────────────
    const drawRoundedImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, state: ImageState, ox: number, oy: number) => {
        const x = ox + state.x, y = oy + state.y;
        ctx.save();
        ctx.beginPath(); ctx.arc(x + state.width / 2, y + state.height / 2, Math.min(state.width, state.height) / 2, 0, Math.PI * 2); ctx.clip();
        if (img?.complete) {
            ctx.save();
            ctx.translate(x + state.width / 2, y + state.height / 2);
            ctx.rotate((state.rotation * Math.PI) / 180);
            ctx.drawImage(img, -state.width * state.scale / 2 + state.offsetX, -state.height * state.scale / 2 + state.offsetY, state.width * state.scale, state.height * state.scale);
            ctx.restore();
        } else { ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillRect(x, y, state.width, state.height); }
        ctx.restore();
        ctx.beginPath(); ctx.arc(x + state.width / 2, y + state.height / 2, Math.min(state.width, state.height) / 2, 0, Math.PI * 2);
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.stroke();
    };

    // ─── Resize handles ───────────────────────────────────────────────────────
    const drawResizeHandles = (ctx: CanvasRenderingContext2D, layout: SectionLayout, ox: number, oy: number, hovered: boolean) => {
        if (!hovered && !resizeState) return;
        const pts = [
            { x: layout.x, y: layout.y, p: "nw" }, { x: layout.x + layout.width, y: layout.y, p: "ne" },
            { x: layout.x, y: layout.y + layout.height, p: "sw" }, { x: layout.x + layout.width, y: layout.y + layout.height, p: "se" },
            { x: layout.x + layout.width / 2, y: layout.y, p: "n" }, { x: layout.x + layout.width / 2, y: layout.y + layout.height, p: "s" },
            { x: layout.x, y: layout.y + layout.height / 2, p: "w" }, { x: layout.x + layout.width, y: layout.y + layout.height / 2, p: "e" },
        ];
        pts.forEach(({ x, y, p }) => {
            ctx.fillStyle = hoveredHandle === p ? primaryColor : "#FFFFFF";
            ctx.strokeStyle = primaryColor; ctx.lineWidth = 2;
            ctx.fillRect(ox + x - HANDLE_SIZE / 2, oy + y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
            ctx.strokeRect(ox + x - HANDLE_SIZE / 2, oy + y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
        });
    };

    const drawImageHandles = (ctx: CanvasRenderingContext2D, state: ImageState, ox: number, oy: number) => {
        if (!hoveredImage && !imageResizeState && !imageDragState) return;
        const pts = [
            { x: state.x, y: state.y, p: "nw" }, { x: state.x + state.width, y: state.y, p: "ne" },
            { x: state.x, y: state.y + state.height, p: "sw" }, { x: state.x + state.width, y: state.y + state.height, p: "se" },
            { x: state.x + state.width / 2, y: state.y, p: "n" }, { x: state.x + state.width / 2, y: state.y + state.height, p: "s" },
            { x: state.x, y: state.y + state.height / 2, p: "w" }, { x: state.x + state.width, y: state.y + state.height / 2, p: "e" },
        ];
        pts.forEach(({ x, y, p }) => {
            ctx.fillStyle = hoveredImageHandle === p ? primaryColor : "#FFFFFF";
            ctx.strokeStyle = primaryColor; ctx.lineWidth = 2;
            ctx.fillRect(ox + x - HANDLE_SIZE / 2, oy + y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
            ctx.strokeRect(ox + x - HANDLE_SIZE / 2, oy + y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
        });
    };

    // ─── drawCVContent: title + avatar + sections ─────────────────────────────
    const drawCVContent = (ctx: CanvasRenderingContext2D) => {
        const b = getA4Bounds(); if (!b) return;
        const { centerX: cx, centerY: cy } = b;

        // Detect sidebar width from backgroundElements (largest rect at x=0)
        const sidebarEl = backgroundElements
            .filter(el => el.type === "rect" && el.x === 0 && el.y === 0 && el.height > 500)
            .sort((a, b) => b.width - a.width)[0];
        const SIDEBAR_W = sidebarEl?.width ?? 260;
        const RIGHT_PAD = 32;
        const RIGHT_START = cx + SIDEBAR_W + RIGHT_PAD;

        // ── Name + subtitle ────────────────────────────────────────────────
        ctx.fillStyle = "#111827";
        ctx.font = "bold 34px Arial";
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText(cvTitle || "Your Name", RIGHT_START, cy + 68);
        ctx.fillStyle = primaryColor;
        ctx.font = "15px Arial";
        ctx.fillText(cvSubTitle || "Professional Title", RIGHT_START, cy + 94);
        ctx.fillStyle = "rgba(0,0,0,0.09)";
        ctx.fillRect(RIGHT_START, cy + 108, A4_WIDTH - SIDEBAR_W - RIGHT_PAD * 2, 1);

        // ── Avatar ─────────────────────────────────────────────────────────
        drawRoundedImage(ctx, loadedImage, imageState, cx, cy);
        if (!isIcon && (hoveredImage || imageDragState || imageResizeState)) drawImageHandles(ctx, imageState, cx, cy);

        // ── Sections ───────────────────────────────────────────────────────
        const drawSidebarHeader = (title: string, sx: number, sy: number, width: number) => {
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.beginPath(); (ctx as any).roundRect(sx + 8, sy, width - 16, 24, 5); ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            ctx.font = "bold 11px Arial";
            ctx.textAlign = "left";
            ctx.fillText(title.toUpperCase(), sx + 18, sy + 15);
        };

        const drawRightHeader = (title: string, sx: number, sy: number, width: number) => {
            ctx.fillStyle = primaryColor;
            ctx.beginPath(); ctx.arc(sx + 6, sy + 11, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#111827"; ctx.font = "bold 13px Arial";
            ctx.textAlign = "left";
            ctx.fillText(title.toUpperCase(), sx + 18, sy + 15);
            ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fillRect(sx, sy + 22, width, 1);
            ctx.fillStyle = primaryColor; ctx.fillRect(sx, sy + 22, 32, 2);
        };

        sections.forEach((section, index) => {
            const layout = sectionLayouts.get(index);
            if (!layout) return;
            const isHov = hoveredSection === index;
            const isDrag = dragSection?.sectionIndex === index;
            const isRes = resizeState?.sectionIndex === index;
            const sx = cx + layout.x, sy = cy + layout.y;

            if (!isIcon && (isHov || isDrag || isRes)) {
                ctx.fillStyle = "rgba(174,174,174,0.06)";
                ctx.fillRect(sx - 6, sy - 6, layout.width + 12, layout.height + 12);
                ctx.strokeStyle = primaryColor; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
                ctx.strokeRect(sx - 6, sy - 6, layout.width + 12, layout.height + 12);
                ctx.setLineDash([]);
            }

            ctx.save();
            ctx.beginPath(); ctx.rect(sx, sy, layout.width, layout.height); ctx.clip();

            // Is this section in the sidebar zone?
            const isSidebarSection = layout.x < SIDEBAR_W - 10;

            if (isSidebarSection) {
                drawSidebarHeader(section.title, sx, sy, layout.width);
                let itemY = sy + 34;
                section.items.forEach((item, itemIdx) => {
                    const isEditingThis = editingOverlay?.sectionIndex === index && editingOverlay.itemPath.length === 1 && editingOverlay.itemPath[0] === itemIdx;
                    if (isEditingThis) ctx.globalAlpha = 0.22;
                    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fillRect(sx + 10, itemY - 4, 7, 1.5);
                    ctx.fillStyle = "rgba(255,255,255,0.93)";
                    ctx.font = `${item.style?.italic ? "italic" : "normal"} ${item.style?.bold ? "bold" : "normal"} 13px Arial`;
                    const availW = layout.width - 28;
                    const words = item.text.split(" "); let line = "", lineY = itemY;
                    for (let w = 0; w < words.length; w++) {
                        const test = line + words[w] + " ";
                        if (ctx.measureText(test).width > availW && w > 0) { ctx.fillText(line.trim(), sx + 22, lineY); line = words[w] + " "; lineY += 17; } else { line = test; }
                    }
                    ctx.fillText(line.trim(), sx + 22, lineY);
                    if (isEditingThis) ctx.globalAlpha = 1;
                    itemY = lineY + 20;
                    item.children?.forEach(child => {
                        ctx.globalAlpha = 0.7; ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.font = "12px Arial";
                        ctx.fillText("  – " + child.text, sx + 22, itemY); ctx.globalAlpha = 1; itemY += 17;
                    });
                });
            } else {
                drawRightHeader(section.title, sx, sy, layout.width);
                let itemY = sy + 42;
                section.items.forEach((item, itemIdx) => {
                    const isEditingThis = editingOverlay?.sectionIndex === index && editingOverlay.itemPath.length === 1 && editingOverlay.itemPath[0] === itemIdx;
                    itemY = drawItem(ctx, item, sx + 10, itemY, layout.width - 20, 0, isEditingThis);
                });
            }

            if (guideLines.x !== null) { ctx.strokeStyle = "#ff7b38"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + guideLines.x, cy); ctx.lineTo(cx + guideLines.x, cy + A4_HEIGHT); ctx.stroke(); }
            if (guideLines.y !== null) { ctx.strokeStyle = "#3f7cff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy + guideLines.y); ctx.lineTo(cx + A4_WIDTH, cy + guideLines.y); ctx.stroke(); }
            ctx.restore();
            if (isHov || isDrag || isRes) drawResizeHandles(ctx, layout, cx, cy, isHov);
        });
    };

    // ─── Mouse helpers ────────────────────────────────────────────────────────
    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef?.current; if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const b = getA4Bounds(); if (!b) return { x: 0, y: 0 };
        return { x: (e.clientX - rect.left - pan.x) / zoom - b.centerX, y: (e.clientY - rect.top - pan.y) / zoom - b.centerY };
    };

    const canvasToScreen = (cx2: number, cy2: number) => {
        const canvas = canvasRef?.current; if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const b = getA4Bounds(); if (!b) return { x: 0, y: 0 };
        return { x: (b.centerX + cx2) * zoom + pan.x + rect.left, y: (b.centerY + cy2) * zoom + pan.y + rect.top };
    };

    const getResizeHandle = (x: number, y: number, layout: SectionLayout): ResizeHandle => {
        const pts = [
            { x: layout.x, y: layout.y, p: "nw" as ResizeHandle }, { x: layout.x + layout.width, y: layout.y, p: "ne" as ResizeHandle },
            { x: layout.x, y: layout.y + layout.height, p: "sw" as ResizeHandle }, { x: layout.x + layout.width, y: layout.y + layout.height, p: "se" as ResizeHandle },
            { x: layout.x + layout.width / 2, y: layout.y, p: "n" as ResizeHandle }, { x: layout.x + layout.width / 2, y: layout.y + layout.height, p: "s" as ResizeHandle },
            { x: layout.x, y: layout.y + layout.height / 2, p: "w" as ResizeHandle }, { x: layout.x + layout.width, y: layout.y + layout.height / 2, p: "e" as ResizeHandle },
        ];
        for (const h of pts) if (Math.hypot(x - h.x, y - h.y) <= HANDLE_SIZE) return h.p;
        return null;
    };

    const getImageResizeHandle = (x: number, y: number, s: ImageState): ResizeHandle => {
        const pts = [
            { x: s.x, y: s.y, p: "nw" as ResizeHandle }, { x: s.x + s.width, y: s.y, p: "ne" as ResizeHandle },
            { x: s.x, y: s.y + s.height, p: "sw" as ResizeHandle }, { x: s.x + s.width, y: s.y + s.height, p: "se" as ResizeHandle },
            { x: s.x + s.width / 2, y: s.y, p: "n" as ResizeHandle }, { x: s.x + s.width / 2, y: s.y + s.height, p: "s" as ResizeHandle },
            { x: s.x, y: s.y + s.height / 2, p: "w" as ResizeHandle }, { x: s.x + s.width, y: s.y + s.height / 2, p: "e" as ResizeHandle },
        ];
        for (const h of pts) if (Math.hypot(x - h.x, y - h.y) <= HANDLE_SIZE) return h.p;
        return null;
    };

    const getSectionAtPoint = (x: number, y: number): number | null => {
        for (const [idx, layout] of sectionLayouts.entries()) {
            if (x >= layout.x - 5 && x <= layout.x + layout.width + 5 && y >= layout.y - 5 && y <= layout.y + layout.height + 5) return idx;
        }
        return null;
    };
    const getImageAtPoint = (x: number, y: number) =>
        x >= imageState.x - 5 && x <= imageState.x + imageState.width + 5 &&
        y >= imageState.y - 5 && y <= imageState.y + imageState.height + 5;

    // ─── Inline text editing ──────────────────────────────────────────────────
    const findItemAtCanvasPoint = (sectionIndex: number, _clickX: number, clickY: number) => {
        const layout = sectionLayouts.get(sectionIndex); if (!layout) return null;
        const mc = document.createElement("canvas").getContext("2d")!;
        mc.font = "normal normal 14px Arial";
        const isSidebar = layout.x < 250;
        let curY = layout.y + (isSidebar ? 34 : ITEM_SECTION_OFFSET_Y);

        const walk = (items: SectionItem[], depth: number, path: number[]): any => {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const indent = depth * 20;
                const textX = layout.x + indent + (isSidebar ? 22 : 26);
                const available = layout.width - (isSidebar ? 28 : indent + 16);
                mc.font = `${item.style?.italic ? "italic" : "normal"} ${item.style?.bold ? "bold" : "normal"} ${isSidebar ? 13 : 14}px Arial`;
                const words = item.text.split(" ");
                let line = "", lineCount = 1;
                for (let w = 0; w < words.length; w++) {
                    const test = line + words[w] + " ";
                    if (mc.measureText(test).width > available && w > 0) { line = words[w] + " "; lineCount++; } else { line = test; }
                }
                const itemH = lineCount * (isSidebar ? 17 : ITEM_LINE_HEIGHT) + 5;
                if (clickY >= curY - 15 && clickY <= curY + itemH - 5) {
                    return { path: [...path, i], text: item.text, canvasItemY: curY, canvasItemX: textX - 10, canvasWidth: available + 10 };
                }
                curY += itemH;
                if (item.children?.length) { const found = walk(item.children, depth + 1, [...path, i]); if (found) return found; }
            }
            return null;
        };
        return walk(sections[sectionIndex].items, 0, []);
    };

    const openEditingOverlay = (sectionIndex: number, itemPath: number[], text: string, canvasItemY: number, canvasItemX: number, canvasWidth: number) => {
        const screenPos = canvasToScreen(canvasItemX, canvasItemY - 13);
        setEditingOverlay({ sectionIndex, itemPath, text, screenX: screenPos.x, screenY: screenPos.y, screenWidth: canvasWidth * zoom, lineHeight: ITEM_LINE_HEIGHT * zoom });
        setTimeout(() => textareaRef.current?.focus(), 0);
    };

    const commitEdit = () => {
        if (!editingOverlay) return;
        onItemTextChange?.({ sectionIndex: editingOverlay.sectionIndex, itemPath: editingOverlay.itemPath, newText: editingOverlay.text });
        setEditingOverlay(null);
    };

    // ─── Mouse event handlers ─────────────────────────────────────────────────
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isIcon) return;
        if (editingOverlay) { commitEdit(); return; }
        const pos = getMousePos(e);
        if (getImageAtPoint(pos.x, pos.y)) {
            setHoveredImage(true);
            const handle = getImageResizeHandle(pos.x, pos.y, imageState);
            if (handle) setImageResizeState({ handle, startX: pos.x, startY: pos.y, startState: { ...imageState } });
            else if (!isEditingImageInside) setImageDragState({ sectionIndex: -1, offsetX: pos.x - imageState.x, offsetY: pos.y - imageState.y });
            else setImageInternalDragState({ startX: pos.x, startY: pos.y });
            return;
        }
        const sIdx = getSectionAtPoint(pos.x, pos.y);
        if (sIdx !== null) {
            const layout = sectionLayouts.get(sIdx);
            if (layout) {
                const handle = getResizeHandle(pos.x, pos.y, layout);
                if (handle) setResizeState({ sectionIndex: sIdx, handle, startX: pos.x, startY: pos.y, startLayout: { ...layout } });
                else setDragSection({ sectionIndex: sIdx, offsetX: pos.x - layout.x, offsetY: pos.y - layout.y });
            }
        } else {
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isIcon || editingOverlay) return;
        const now = Date.now();
        const pos = getMousePos(e);
        const sIdx = getSectionAtPoint(pos.x, pos.y);
        const isDoubleClick = now - lastClickTime.current < 400 && lastClickSection.current === sIdx;
        lastClickTime.current = now; lastClickSection.current = sIdx;
        if (!isDoubleClick || sIdx === null) return;
        const found = findItemAtCanvasPoint(sIdx, pos.x, pos.y);
        if (!found) return;
        setDragSection(null); setResizeState(null); setIsPanning(false);
        openEditingOverlay(sIdx, found.path, found.text, found.canvasItemY, found.canvasItemX, found.canvasWidth);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isIcon || editingOverlay) return;
        const pos = getMousePos(e);

        if (imageInternalDragState && isEditingImageInside) {
            const dx = pos.x - imageInternalDragState.startX, dy = pos.y - imageInternalDragState.startY;
            setImageState(p => ({ ...p, offsetX: p.offsetX + dx, offsetY: p.offsetY + dy }));
            setImageInternalDragState({ startX: pos.x, startY: pos.y }); return;
        }
        if (imageResizeState) {
            const dx = pos.x - imageResizeState.startX, dy = pos.y - imageResizeState.startY;
            const s = { ...imageResizeState.startState };
            switch (imageResizeState.handle) {
                case "se": s.width = Math.max(60, s.width + dx); s.height = Math.max(60, s.height + dy); break;
                case "sw": s.x += dx; s.width = Math.max(60, s.width - dx); s.height = Math.max(60, s.height + dy); break;
                case "ne": s.y += dy; s.width = Math.max(60, s.width + dx); s.height = Math.max(60, s.height - dy); break;
                case "nw": s.x += dx; s.y += dy; s.width = Math.max(60, s.width - dx); s.height = Math.max(60, s.height - dy); break;
                case "n": s.y += dy; s.height = Math.max(60, s.height - dy); break;
                case "s": s.height = Math.max(60, s.height + dy); break;
                case "e": s.width = Math.max(60, s.width + dx); break;
                case "w": s.x += dx; s.width = Math.max(60, s.width - dx); break;
            }
            setImageState(s);
        } else if (imageDragState) {
            setImageState(p => ({ ...p, x: pos.x - imageDragState.offsetX, y: pos.y - imageDragState.offsetY }));
        } else if (resizeState) {
            const dx = pos.x - resizeState.startX, dy = pos.y - resizeState.startY;
            let nl = { ...resizeState.startLayout };
            switch (resizeState.handle) {
                case "e": nl.width = Math.max(MIN_SECTION_WIDTH, nl.width + dx); break;
                case "w": nl.x += dx; nl.width = Math.max(MIN_SECTION_WIDTH, nl.width - dx); break;
                case "s": nl.height = Math.max(MIN_SECTION_HEIGHT, nl.height + dy); break;
                case "n": nl.y += dy; nl.height = Math.max(MIN_SECTION_HEIGHT, nl.height - dy); break;
                case "se": nl.width = Math.max(MIN_SECTION_WIDTH, nl.width + dx); nl.height = Math.max(MIN_SECTION_HEIGHT, nl.height + dy); break;
                case "sw": nl.x += dx; nl.width = Math.max(MIN_SECTION_WIDTH, nl.width - dx); nl.height = Math.max(MIN_SECTION_HEIGHT, nl.height + dy); break;
                case "ne": nl.y += dy; nl.height = Math.max(MIN_SECTION_HEIGHT, nl.height - dy); nl.width = Math.max(MIN_SECTION_WIDTH, nl.width + dx); break;
                case "nw": nl.x += dx; nl.y += dy; nl.width = Math.max(MIN_SECTION_WIDTH, nl.width - dx); nl.height = Math.max(MIN_SECTION_HEIGHT, nl.height - dy); break;
            }
            const snapped = getSnappedEdges(resizeState.sectionIndex, { left: nl.x, right: nl.x + nl.width, top: nl.y, bottom: nl.y + nl.height });
            const sr = resizeState.startLayout.x + resizeState.startLayout.width;
            const sb = resizeState.startLayout.y + resizeState.startLayout.height;
            if (resizeState.handle?.includes("w") && snapped.snapLeft != null) { nl.x = snapped.snapLeft; nl.width = sr - snapped.snapLeft; }
            if (resizeState.handle?.includes("e") && snapped.snapRight != null) { nl.width = snapped.snapRight - nl.x; }
            if (resizeState.handle?.includes("n") && snapped.snapTop != null) { nl.y = snapped.snapTop; nl.height = sb - snapped.snapTop; }
            if (resizeState.handle?.includes("s") && snapped.snapBottom != null) { nl.height = snapped.snapBottom - nl.y; }
            const newLayouts = new Map(sectionLayouts); newLayouts.set(resizeState.sectionIndex, nl); setSectionLayouts(newLayouts);
            onSectionResize?.({ id: nl.id, width: nl.width, height: nl.height });
            setGuideLines({ x: snapped.guideX, y: snapped.guideY });
        } else if (dragSection) {
            const tryX = pos.x - dragSection.offsetX, tryY = pos.y - dragSection.offsetY;
            const snapped = getSnappedPosition(dragSection.sectionIndex, tryX, tryY);
            const layout = sectionLayouts.get(dragSection.sectionIndex);
            if (layout) {
                const nl = new Map(sectionLayouts); nl.set(dragSection.sectionIndex, { ...layout, x: snapped.x, y: snapped.y }); setSectionLayouts(nl);
                onSectionDrag?.({ id: layout.id, x: snapped.x, y: snapped.y });
                setGuideLines({ x: snapped.guideX, y: snapped.guideY });
            }
        } else if (isPanning) {
            setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        } else {
            const overImg = getImageAtPoint(pos.x, pos.y);
            if (overImg) {
                setHoveredImage(true);
                setHoveredImageHandle(getImageResizeHandle(pos.x, pos.y, imageState));
                setHoveredSection(null); setHoveredHandle(null);
            } else {
                setHoveredImage(false); setHoveredImageHandle(null);
                const sIdx = getSectionAtPoint(pos.x, pos.y);
                setHoveredSection(sIdx);
                if (sIdx !== null) { const layout = sectionLayouts.get(sIdx); setHoveredHandle(layout ? getResizeHandle(pos.x, pos.y, layout) : null); }
                else { setHoveredHandle(null); }
            }
        }
    };

    const handleMouseUp = () => {
        if (isIcon) return;
        setIsPanning(false); setDragSection(null); setResizeState(null);
        setImageDragState(null); setImageResizeState(null); setImageInternalDragState(null);
        setGuideLines({ x: null, y: null });
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        if (isIcon) return;
        if (isEditingImageInside && hoveredImage) {
            e.preventDefault();
            setImageState(p => ({ ...p, scale: Math.max(0.5, Math.min(3, p.scale + (e.deltaY > 0 ? -0.1 : 0.1))) })); return;
        }
        e.preventDefault();
        setZoom(p => Math.max(0.3, Math.min(3, p + (e.deltaY > 0 ? -0.05 : 0.05))));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (isIcon) return;
        if (hoveredImage && e.key.toLowerCase() === "r") { e.preventDefault(); setImageState(p => ({ ...p, rotation: (p.rotation + 15) % 360 })); }
        if (hoveredImage && e.key.toLowerCase() === "l") { e.preventDefault(); setImageState(p => ({ ...p, rotation: (p.rotation - 15 + 360) % 360 })); }
    };

    // ─── Snap ─────────────────────────────────────────────────────────────────
    const getSnappedPosition = (idx: number, nx: number, ny: number) => {
        let sx = nx, sy = ny, guideX: number | null = null, guideY: number | null = null;
        const cur = sectionLayouts.get(idx); if (!cur) return { x: nx, y: ny, guideX, guideY };
        for (const [i, l] of sectionLayouts.entries()) {
            if (i === idx) continue;
            if (Math.abs(nx - l.x) < SNAP_THRESHOLD) { sx = l.x; guideX = l.x; }
            if (Math.abs(nx - l.x - l.width) < SNAP_THRESHOLD) { sx = l.x + l.width; guideX = l.x + l.width; }
            if (Math.abs(nx + cur.width - l.x - l.width) < SNAP_THRESHOLD) { sx = l.x + l.width - cur.width; guideX = l.x + l.width; }
            if (Math.abs(nx + cur.width - l.x) < SNAP_THRESHOLD) { sx = l.x - cur.width; guideX = l.x; }
            if (Math.abs(ny - l.y) < SNAP_THRESHOLD) { sy = l.y; guideY = l.y; }
            if (Math.abs(ny - l.y - l.height) < SNAP_THRESHOLD) { sy = l.y + l.height; guideY = l.y + l.height; }
            if (Math.abs(ny + cur.height - l.y - l.height) < SNAP_THRESHOLD) { sy = l.y + l.height - cur.height; guideY = l.y + l.height; }
            if (Math.abs(ny + cur.height - l.y) < SNAP_THRESHOLD) { sy = l.y - cur.height; guideY = l.y; }
        }
        return { x: sx, y: sy, guideX, guideY };
    };

    const getSnappedEdges = (idx: number, edges: { left: number; right: number; top: number; bottom: number }) => {
        let snapLeft: number | null = null, snapRight: number | null = null, snapTop: number | null = null, snapBottom: number | null = null;
        let guideX: number | null = null, guideY: number | null = null;
        for (const [i, l] of sectionLayouts.entries()) {
            if (i === idx) continue;
            if (Math.abs(edges.left - l.x) < SNAP_THRESHOLD) { snapLeft = l.x; guideX = l.x; }
            if (Math.abs(edges.left - l.x - l.width) < SNAP_THRESHOLD) { snapLeft = l.x + l.width; guideX = l.x + l.width; }
            if (Math.abs(edges.right - l.x) < SNAP_THRESHOLD) { snapRight = l.x; guideX = l.x; }
            if (Math.abs(edges.right - l.x - l.width) < SNAP_THRESHOLD) { snapRight = l.x + l.width; guideX = l.x + l.width; }
            if (Math.abs(edges.top - l.y) < SNAP_THRESHOLD) { snapTop = l.y; guideY = l.y; }
            if (Math.abs(edges.top - l.y - l.height) < SNAP_THRESHOLD) { snapTop = l.y + l.height; guideY = l.y + l.height; }
            if (Math.abs(edges.bottom - l.y) < SNAP_THRESHOLD) { snapBottom = l.y; guideY = l.y; }
            if (Math.abs(edges.bottom - l.y - l.height) < SNAP_THRESHOLD) { snapBottom = l.y + l.height; guideY = l.y + l.height; }
        }
        return { snapLeft, snapRight, snapTop, snapBottom, guideX, guideY };
    };

    // ─── Cursor ───────────────────────────────────────────────────────────────
    const getCursor = (): string => {
        if (isIcon) return "pointer";
        if (editingOverlay) return "text";
        if (imageDragState) return "grabbing";
        const rmap: Record<string, string> = { nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize", n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize" };
        if (imageResizeState) return rmap[imageResizeState.handle!] ?? "default";
        if (hoveredImageHandle) return rmap[hoveredImageHandle] ?? "default";
        if (hoveredImage) return "move";
        if (dragSection) return "grabbing";
        if (resizeState) return rmap[resizeState.handle!] ?? "default";
        if (hoveredHandle) return rmap[hoveredHandle] ?? "default";
        if (hoveredSection !== null) return "move";
        if (isPanning) return "grabbing";
        return "grab";
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className={`${isIcon ? "" : "flex-1"} relative bg-[#F9FAFB]`} ref={containerRef}>
            <canvas
                ref={isIcon ? iconRef : canvasRef}
                style={{ cursor: getCursor() }}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                height={260} width={200}
            />

            {/* ── Inline text editing overlay ── */}
            {editingOverlay && (
                <>
                    <div className="fixed inset-0 z-40" onMouseDown={e => { e.preventDefault(); commitEdit(); }} />
                    <div className="fixed z-50 pointer-events-none rounded-sm" style={{ left: editingOverlay.screenX - 2, top: editingOverlay.screenY - 2, width: editingOverlay.screenWidth + 4, outline: `2px solid ${primaryColor}`, boxShadow: `0 0 0 4px ${primaryColor}22` }} />
                    <div className="fixed z-50 flex items-center gap-1 rounded-lg px-2 py-1.5 shadow-xl" style={{ left: editingOverlay.screenX, top: editingOverlay.screenY - 44, background: "#1e1e1e", border: "1px solid #333", fontSize: 12, color: "#fff", userSelect: "none", whiteSpace: "nowrap" }} onMouseDown={e => e.preventDefault()}>
                        <span style={{ color: "#aaa", fontSize: 11 }}>Double-click to edit</span>
                        <div style={{ width: 1, height: 14, background: "#444", margin: "0 4px" }} />
                        <kbd style={{ background: "#333", borderRadius: 4, padding: "1px 5px", fontSize: 11, color: "#ccc" }}>Enter</kbd>
                        <span style={{ color: "#aaa", fontSize: 11 }}>confirm</span>
                        <div style={{ width: 1, height: 14, background: "#444", margin: "0 4px" }} />
                        <kbd style={{ background: "#333", borderRadius: 4, padding: "1px 5px", fontSize: 11, color: "#ccc" }}>Esc</kbd>
                        <span style={{ color: "#aaa", fontSize: 11 }}>cancel</span>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={editingOverlay.text}
                        onChange={e => setEditingOverlay(prev => prev ? { ...prev, text: e.target.value } : null)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(); } if (e.key === "Escape") setEditingOverlay(null); e.stopPropagation(); }}
                        onMouseDown={e => e.stopPropagation()}
                        style={{ position: "fixed", left: editingOverlay.screenX, top: editingOverlay.screenY, width: editingOverlay.screenWidth, fontSize: "14px", fontFamily: "Arial, sans-serif", lineHeight: `${ITEM_LINE_HEIGHT}px`, color: "#111", background: "rgba(255,255,255,0.97)", border: "none", outline: "none", resize: "none", padding: "2px 4px", zIndex: 50, minHeight: `${ITEM_LINE_HEIGHT}px`, overflow: "hidden", boxSizing: "border-box", borderRadius: 2, caretColor: primaryColor }}
                        rows={1}
                        onInput={e => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }}
                    />
                </>
            )}

            {/* ── Zoom Controls ── */}
            {!isIcon && (
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                    <button onClick={() => setZoom(p => Math.min(p + 0.1, 3))} className="p-2 hover:bg-gray-100 rounded transition-all text-gray-700"><ZoomIn size={20} /></button>
                    <div className="h-px bg-gray-200" />
                    <button onClick={() => setZoom(p => Math.max(p - 0.1, 0.3))} className="p-2 hover:bg-gray-100 rounded transition-all text-gray-700"><ZoomOut size={20} /></button>
                    <div className="h-px bg-gray-200" />
                    <div className="px-2 py-1 text-xs text-gray-600 text-center">{Math.round(zoom * 100)}%</div>
                </div>
            )}

            {/* ── A4 Info ── */}
            {!isIcon && (
                <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2">
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">A4 Paper</span> • 794 × 1123 px</p>
                </div>
            )}

            {/* ── Image editing hints ── */}
            {!isIcon && isEditingImageInside && hoveredImage && (
                <div className="absolute top-20 left-6 bg-white rounded-lg shadow-lg border border-[#0C6A4E] px-4 py-2">
                    <h3 className="font-semibold text-[#0C6A4E] text-sm mb-2">Editing Image</h3>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E]"><Move size={16} /><span>Move</span></div>
                    <div className="text-sm text-[#0C6A4E] mt-1">Scroll to zoom</div>
                    <div className="text-sm text-[#0C6A4E] mt-1">R / L: Rotate</div>
                    <button onClick={() => setIsEditingImageInside(false)} className="mt-3 w-full px-3 py-2 bg-[#0C6A4E] text-white rounded text-xs hover:bg-opacity-90 font-medium">Done</button>
                </div>
            )}
            {!isIcon && !isEditingImageInside && hoveredImage && (
                <div className="absolute top-20 left-6 bg-white rounded-lg shadow-lg border border-[#0C6A4E] px-4 py-2">
                    <h3 className="font-semibold text-[#0C6A4E] text-sm mb-2">Edit Frame</h3>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E]"><Move size={16} /><span>Move</span></div>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E] mt-1"><Maximize size={16} /><span>Resize</span></div>
                    <button onClick={() => setIsEditingImageInside(true)} className="mt-3 w-full px-3 py-2 bg-[#0C6A4E] text-white rounded text-xs hover:bg-opacity-90 font-medium">Edit Image Inside</button>
                </div>
            )}
            {!isIcon && hoveredSection !== null && !dragSection && !resizeState && !editingOverlay && (
                <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg border border-[#0C6A4E] px-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E]"><Move size={16} /><span className="font-medium">Drag to move</span></div>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E] mt-1"><Maximize size={16} /><span className="font-medium">Handles to resize</span></div>
                    <div className="text-sm text-[#0C6A4E] mt-1 font-medium">Double-click text to edit</div>
                </div>
            )}
        </div>
    );
}