"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize, Move } from "lucide-react";
import { Section } from "../[cv_id]/page";
import jsPDF from "jspdf";
import { cvAPI } from "@/services/cv";
import { toast } from "sonner";

interface CVTemplate {
  id: string;
  name: string;
  backgroundElements: ShapeElement[]; // Các hình khối kéo thả
  layoutType: 'split' | 'single' | 'modern'; 
  defaultSections: Section[]; // Các section nội dung mặc định
}

interface ShapeElement {
  type: 'rect' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  isBackground: boolean;
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

// ─── Inline editing overlay state ────────────────────────────────────────────
interface EditingOverlay {
    sectionIndex: number;
    itemPath: number[];          // e.g. [2] = items[2], [2,1] = items[2].children[1]
    text: string;
    // Screen-space position (fixed, not scaled with zoom)
    screenX: number;
    screenY: number;
    screenWidth: number;
    lineHeight: number;          // px on screen
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
    onItemTextChange?: (data: {
        sectionIndex: number;
        itemPath: number[];
        newText: string;
    }) => void;
}

type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;

interface DragState {
    sectionIndex: number;
    offsetX: number;
    offsetY: number;
}

interface ResizeState {
    sectionIndex: number;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    startLayout: SectionLayout;
}

interface ImageResizeState {
    handle: ResizeHandle;
    startX: number;
    startY: number;
    startState: ImageState;
}

export const getFullCVState = (
    cvTitle: string,
    cvSubTitle: string,
    primaryColor: string,
    imageURL: string | undefined,
    imageState: ImageState,
    sections: Section[],
    projectName: string
): CVState => ({
    cvTitle,
    cvSubTitle,
    primaryColor,
    imageURL,
    imageState,
    sections: sections.map((s) => ({ ...s, items: JSON.parse(JSON.stringify(s.items)) })),
    projectName,
});

// Default image: centered in 260px sidebar, near the top header area
export const INITIAL_IMAGE_STATE: ImageState = {
    x: 50,           // (260 - 160) / 2 = 50 → centered in sidebar
    y: 18,
    width: 160,
    height: 160,
    rotation: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
};

// Default section positions for the new sidebar layout
// Sidebar sections: x < 260, right panel sections: x >= 260
export const DEFAULT_SIDEBAR_SECTION_SIZE = { width: 228, height: 200 };
export const DEFAULT_RIGHT_SECTION_SIZE = { width: 470, height: 200 };
export const DEFAULT_SIDEBAR_SECTION_X = 16;
export const DEFAULT_RIGHT_SECTION_X = 292; // 260 (sidebar) + 32 (pad)

export const generatePDFFromState = (state: CVState): void => {
    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;

    const canvas = document.createElement("canvas");
    canvas.width = A4_WIDTH;
    canvas.height = A4_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const applyTextStyle = (style: TextStyle, fontSize: number) => {
        ctx.font = `${style.italic ? "italic" : "normal"} ${style.bold ? "bold" : "normal"} ${fontSize}px Arial`;
        ctx.fillStyle = style.color;
    };

    const drawTextWithUnderline = (text: string, x: number, y: number, underline: boolean) => {
        ctx.fillText(text, x, y);
        if (underline) {
            const w = ctx.measureText(text).width;
            ctx.beginPath();
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1;
            ctx.moveTo(x, y + 2);
            ctx.lineTo(x + w, y + 2);
            ctx.stroke();
        }
    };

    const drawItem = (item: SectionItem, x: number, y: number, maxWidth: number, depth = 0): number => {
        const indent = depth * 20;
        const bulletX = x + indent;
        if (bulletX + 10 > x + maxWidth) return y + 25;
        ctx.fillStyle = state.primaryColor;
        ctx.beginPath();
        ctx.arc(bulletX, y - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        applyTextStyle(item.style, 14);
        const textX = bulletX + 10;
        const available = maxWidth - indent - 10;
        const words = item.text.split(" ");
        let line = "";
        let lineY = y;
        for (let i = 0; i < words.length; i++) {
            const test = line + words[i] + " ";
            if (ctx.measureText(test).width > available && i > 0) {
                drawTextWithUnderline(line.trim(), textX, lineY, item.style.underline);
                line = words[i] + " ";
                lineY += 20;
            } else {
                line = test;
            }
        }
        drawTextWithUnderline(line.trim(), textX, lineY, item.style.underline);
        let curY = lineY + 25;
        item.children?.forEach((c) => { curY = drawItem(c, x, curY, maxWidth, depth + 1); });
        return curY;
    };

    const SIDEBAR_W = 260;
    const RIGHT_PAD = 32;

    // ── WHITE BACKGROUND ─────────────────────────────────────────────────────
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

    // ── SIDEBAR ──────────────────────────────────────────────────────────────
    ctx.fillStyle = state.primaryColor;
    ctx.fillRect(0, 0, SIDEBAR_W, A4_HEIGHT);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, SIDEBAR_W, A4_HEIGHT); ctx.clip();
    ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 18;
    for (let i = -A4_HEIGHT; i < A4_WIDTH + A4_HEIGHT; i += 36) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + A4_HEIGHT, A4_HEIGHT); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(SIDEBAR_W - 6, 0, 6, A4_HEIGHT);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) {
        ctx.beginPath(); ctx.arc(18 + col * 14, A4_HEIGHT - 60 + row * 12, 2, 0, Math.PI * 2); ctx.fill();
    }

    // ── HEADER (right side) ───────────────────────────────────────────────────
    ctx.fillStyle = "#111827";
    ctx.font = "bold 34px Arial";
    ctx.fillText(state.cvTitle || "Your Name", SIDEBAR_W + RIGHT_PAD, 68);
    ctx.fillStyle = state.primaryColor;
    ctx.font = "15px Arial";
    ctx.fillText(state.cvSubTitle || "Professional Title", SIDEBAR_W + RIGHT_PAD, 94);
    ctx.fillStyle = "rgba(0,0,0,0.09)";
    ctx.fillRect(SIDEBAR_W + RIGHT_PAD, 108, A4_WIDTH - SIDEBAR_W - RIGHT_PAD * 2, 1);

    // ── IMAGE ─────────────────────────────────────────────────────────────────
    const drawRounded = (img: HTMLImageElement) => {
        const s = state.imageState;
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x + s.width / 2, s.y + s.height / 2, Math.min(s.width, s.height) / 2, 0, Math.PI * 2);
        ctx.clip();
        if (img.complete) {
            ctx.save();
            ctx.translate(s.x + s.width / 2, s.y + s.height / 2);
            ctx.rotate((s.rotation * Math.PI) / 180);
            ctx.drawImage(img, -s.width * s.scale / 2 + s.offsetX, -s.height * s.scale / 2 + s.offsetY, s.width * s.scale, s.height * s.scale);
            ctx.restore();
        } else {
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillRect(s.x, s.y, s.width, s.height);
        }
        ctx.restore();
        ctx.beginPath();
        ctx.arc(s.x + s.width / 2, s.y + s.height / 2, Math.min(s.width, s.height) / 2, 0, Math.PI * 2);
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.stroke();
    };

    // ── SECTIONS ─────────────────────────────────────────────────────────────
    const drawSections = () => {
        if (!ctx) return;
        state.sections.forEach((section) => {
            const sx = section.x, sy = section.y, sw = section.size.width;
            const isSidebarSection = sx < SIDEBAR_W - 10;
            ctx.save();
            ctx.beginPath(); ctx.rect(sx, sy, sw, section.size.height); ctx.clip();

            if (isSidebarSection) {
                ctx.fillStyle = "rgba(255,255,255,0.15)";
                ctx.beginPath();
                (ctx as any).roundRect(sx + 8, sy, sw - 16, 24, 5);
                ctx.fill();
                ctx.fillStyle = "rgba(255,255,255,0.95)";
                ctx.font = "bold 11px Arial";
                ctx.fillText(section.title.toUpperCase(), sx + 18, sy + 15);
                let iy = sy + 34;
                section.items.forEach((item) => {
                    ctx.fillStyle = "rgba(255,255,255,0.55)";
                    ctx.fillRect(sx + 10, iy - 4, 7, 1.5);
                    ctx.fillStyle = "rgba(255,255,255,0.93)";
                    ctx.font = "13px Arial";
                    const availW = sw - 28;
                    const words = item.text.split(" ");
                    let line = "", lineY = iy;
                    for (let w = 0; w < words.length; w++) {
                        const test = line + words[w] + " ";
                        if (ctx.measureText(test).width > availW && w > 0) { ctx.fillText(line.trim(), sx + 22, lineY); line = words[w] + " "; lineY += 17; } else { line = test; }
                    }
                    ctx.fillText(line.trim(), sx + 22, lineY);
                    iy = lineY + 20;
                });
            } else {
                ctx.fillStyle = state.primaryColor;
                ctx.beginPath(); ctx.arc(sx + 6, sy + 11, 4, 0, Math.PI * 2); ctx.fill();
                ctx.font = "bold 13px Arial";
                ctx.fillText(section.title.toUpperCase(), sx + 18, sy + 15);
                ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fillRect(sx, sy + 22, sw, 1);
                ctx.fillStyle = state.primaryColor; ctx.fillRect(sx, sy + 22, 32, 2);
                let iy = sy + 42;
                section.items.forEach((item) => { iy = drawItem(item, sx + 10, iy, sw - 20, 0); });
            }
            ctx.restore();
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        pdf.addImage(imgData, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.save(`${state.projectName}.pdf`);
    };

    if (state.imageURL) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { drawRounded(img); drawSections(); };
        img.onerror = drawSections;
        img.src = state.imageURL;
    } else {
        drawSections();
    }
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function CVCanvas({
    primaryColor = "#1d7057ff",
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
}: CVCanvasProps) {
    const iconRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // ── Inline text editing ──
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
    const ITEM_LINE_HEIGHT = 20; // px in canvas space
    const ITEM_SECTION_OFFSET_Y = 55; // from section.y to first item

    useEffect(() => {
        if (!imageURL) return;
        const img = new Image();
        img.onload = () => setLoadedImage(img);
        img.onerror = () => console.error("Failed to load image");
        img.src = imageURL;
    }, [imageURL]);

    // ── Draw ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = isIcon ? iconRef.current : canvasRef?.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const container = containerRef.current;
        if (container) { canvas.width = container.clientWidth; canvas.height = container.clientHeight; }
        drawCanvas(ctx, canvas.width, canvas.height);

        const onKey = (e: KeyboardEvent) => {
            if (!isSavable) return;
            if (e.ctrlKey && e.key === "s") { e.preventDefault(); handleSave(); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [primaryColor, zoom, pan, cvTitle, cvSubTitle, sections, hoveredSection, sectionLayouts, hoveredHandle, imageState, loadedImage, hoveredImage, hoveredImageHandle, editingOverlay]);

    useEffect(() => {
        if (sections.length === 0) return;
        const newLayouts = new Map<number, SectionLayout>();
        sections.forEach((section, index) => {
            newLayouts.set(index, {
                id: section.id,
                x: section.x,
                y: section.y,
                width: section.size.width,
                height: section.size.height,
            });
        });
        setSectionLayouts(newLayouts);
    }, [sections]);

    useEffect(() => {
        if (!isIcon) {
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [hoveredImage, isEditingImageInside]);

    // Auto-resize textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [editingOverlay?.text]);

    const handleSave = () => {
        cvAPI.update({ id: cv_id, primary_color: primaryColor, sections: JSON.stringify(sections), title: cvTitle, subtitle: cvSubTitle, name: projectName })
            .then(() => toast.success("Saved!"))
            .catch(() => { });
    };

    const getA4Bounds = () => {
        const container = containerRef.current;
        if (!container) return null;
        return {
            centerX: (container.clientWidth / zoom - A4_WIDTH) / 2,
            centerY: 50,
        };
    };

    // ── Canvas drawing helpers ───────────────────────────────────────────────
    const drawCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        if (!isIcon) drawGrid(ctx, 1000 / zoom, 1000 / zoom);
        drawA4Paper(ctx);
        drawPattern(ctx);
        drawCVContent(ctx);
        ctx.restore();
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.strokeStyle = "#E5E7EB";
        ctx.lineWidth = 0.5;
        const ox = zoom % GRID_SIZE, oy = zoom % GRID_SIZE;
        for (let x = ox; x < width; x += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
        for (let y = oy; y < height; y += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    };

    const drawA4Paper = (ctx: CanvasRenderingContext2D) => {
        const b = getA4Bounds(); if (!b) return;
        ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#FFFFFF"; ctx.fillRect(b.centerX, b.centerY, A4_WIDTH, A4_HEIGHT);
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
        ctx.strokeStyle = "#D1D5DB"; ctx.lineWidth = 1;
        ctx.strokeRect(b.centerX, b.centerY, A4_WIDTH, A4_HEIGHT);
    };

    const applyTextStyle = (ctx: CanvasRenderingContext2D, style: TextStyle, size: number) => {
        ctx.font = `${style.italic ? "italic" : "normal"} ${style.bold ? "bold" : "normal"} ${size}px Arial`;
        ctx.fillStyle = style.color;
    };

    const drawTextUnderline = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, ul: boolean) => {
        ctx.fillText(text, x, y);
        if (ul) {
            const w = ctx.measureText(text).width;
            ctx.beginPath(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1;
            ctx.moveTo(x, y + 2); ctx.lineTo(x + w, y + 2); ctx.stroke();
        }
    };

    const drawItem = (ctx: CanvasRenderingContext2D, item: SectionItem, x: number, y: number, maxWidth: number, depth = 0, isEditing = false): number => {
        const indent = depth * 20;
        const bulletX = x + indent;
        if (bulletX + 10 > x + maxWidth) return y + 25;

        // Dim the item being edited (textarea takes over visually)
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
            if (ctx.measureText(test).width > available && i > 0) {
                lines.push(line.trim()); line = words[i] + " "; lineY += 20;
            } else { line = test; }
        }
        lines.push(line.trim());

        const spaceW = ctx.measureText(" ").width;
        lines.forEach((ln, idx) => {
            const isLast = idx === lines.length - 1;
            const dy = y + idx * 20;
            if (isLast) { drawTextUnderline(ctx, ln, textX, dy, item.style.underline); return; }
            const ws = ln.split(" ");
            if (ws.length <= 1) { drawTextUnderline(ctx, ln, textX, dy, item.style.underline); return; }
            const extra = (available - ctx.measureText(ln).width) / (ws.length - 1);
            let xx = textX;
            ws.forEach((w) => { drawTextUnderline(ctx, w, xx, dy, item.style.underline); xx += ctx.measureText(w).width + spaceW + extra; });
        });

        if (isEditing) ctx.globalAlpha = 1;

        let curY = y + lines.length * 20 + 5;
        item.children?.forEach((child) => { curY = drawItem(ctx, child, x, curY, maxWidth, depth + 1); });
        return curY;
    };

    const drawPattern = (ctx: CanvasRenderingContext2D) => {
        const b = getA4Bounds(); if (!b) return;
        const { centerX: cx, centerY: cy } = b;

        // ── LEFT SIDEBAR (full height, 260px wide) ──────────────────────────
        const SIDEBAR_W = 260;

        // Sidebar base fill
        ctx.fillStyle = primaryColor;
        ctx.fillRect(cx, cy, SIDEBAR_W, A4_HEIGHT);

        // Subtle diagonal stripe overlay on sidebar (semi-transparent dark)
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx, cy, SIDEBAR_W, A4_HEIGHT);
        ctx.clip();
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 18;
        for (let i = -A4_HEIGHT; i < A4_WIDTH + A4_HEIGHT; i += 36) {
            ctx.beginPath();
            ctx.moveTo(cx + i, cy);
            ctx.lineTo(cx + i + A4_HEIGHT, cy + A4_HEIGHT);
            ctx.stroke();
        }
        ctx.restore();

        // Accent rectangle: top-right corner of sidebar → thin bright strip
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(cx + SIDEBAR_W - 6, cy, 6, A4_HEIGHT);

        // ── DECORATIVE CIRCLE (top-left of sidebar) ─────────────────────────
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx + SIDEBAR_W / 2, cy + 100, 88, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fill();
        ctx.restore();

        // Bottom decorative dot cluster on sidebar
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 5; col++) {
                ctx.beginPath();
                ctx.arc(cx + 18 + col * 14, cy + A4_HEIGHT - 60 + row * 12, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };

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
        } else { ctx.fillStyle = "#E5E7EB"; ctx.fillRect(x, y, state.width, state.height); }
        ctx.restore();
        ctx.beginPath(); ctx.arc(x + state.width / 2, y + state.height / 2, Math.min(state.width, state.height) / 2, 0, Math.PI * 2);
        ctx.lineWidth = 1; ctx.strokeStyle = primaryColor; ctx.stroke();
    };

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

    const drawCVContent = (ctx: CanvasRenderingContext2D) => {
        const b = getA4Bounds(); if (!b) return;
        const { centerX: cx, centerY: cy } = b;

        const SIDEBAR_W = 260;
        const RIGHT_PAD = 32;
        const RIGHT_START = cx + SIDEBAR_W + RIGHT_PAD;

        // ── HEADER: Name + subtitle on the right content area ──────────────
        ctx.fillStyle = "#111827";
        ctx.font = "bold 34px Arial";
        ctx.fillText(cvTitle || "Your Name", RIGHT_START, cy + 68);

        ctx.fillStyle = primaryColor;
        ctx.font = "15px Arial";
        ctx.fillText(cvSubTitle || "Professional Title", RIGHT_START, cy + 94);

        // Thin divider under header area
        ctx.fillStyle = "rgba(0,0,0,0.09)";
        ctx.fillRect(RIGHT_START, cy + 108, A4_WIDTH - SIDEBAR_W - RIGHT_PAD * 2, 1);

        // ── SIDEBAR: Avatar image (rendered by drawRoundedImage) ───────────
        drawRoundedImage(ctx, loadedImage, imageState, cx, cy);
        if (!isIcon && (hoveredImage || imageDragState || imageResizeState)) drawImageHandles(ctx, imageState, cx, cy);

        // ── Helper: sidebar pill-label ──────────────────────────────────────
        const drawSidebarSectionHeader = (title: string, sx: number, sy: number, width: number) => {
            // Frosted pill background
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.beginPath();
            const ph = 24, pr = 5;
            ctx.roundRect(sx + 8, sy, width - 16, ph, pr);
            ctx.fill();

            // White text
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            ctx.font = "bold 11px Arial";
            ctx.letterSpacing = "1px";
            ctx.fillText(title.toUpperCase(), sx + 18, sy + 15);
            ctx.letterSpacing = "0px";
        };

        // ── Helper: right-panel section header ─────────────────────────────
        const drawRightSectionHeader = (title: string, sx: number, sy: number, width: number) => {
            // Colored dot
            ctx.fillStyle = primaryColor;
            ctx.beginPath();
            ctx.arc(sx + 6, sy + 11, 4, 0, Math.PI * 2);
            ctx.fill();

            // Title text
            ctx.fillStyle = "#111827";
            ctx.font = "bold 13px Arial";
            ctx.fillText(title.toUpperCase(), sx + 18, sy + 15);

            // Full-width rule
            ctx.fillStyle = "rgba(0,0,0,0.08)";
            ctx.fillRect(sx, sy + 22, width, 1);

            // Accent left border on rule
            ctx.fillStyle = primaryColor;
            ctx.fillRect(sx, sy + 22, 32, 2);
        };

        // ── SECTIONS ──────────────────────────────────────────────────────
        sections.forEach((section, index) => {
            const layout = sectionLayouts.get(index);
            if (!layout) return;
            const isHov = hoveredSection === index;
            const isDrag = dragSection?.sectionIndex === index;
            const isRes = resizeState?.sectionIndex === index;
            const sx = cx + layout.x;
            const sy = cy + layout.y;

            // Hover/drag/resize outline
            if (!isIcon && (isHov || isDrag || isRes)) {
                ctx.fillStyle = "rgba(174,174,174,0.06)";
                ctx.fillRect(sx - 6, sy - 6, layout.width + 12, layout.height + 12);
                ctx.strokeStyle = primaryColor; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
                ctx.strokeRect(sx - 6, sy - 6, layout.width + 12, layout.height + 12);
                ctx.setLineDash([]);
            }

            ctx.save();
            ctx.beginPath(); ctx.rect(sx, sy, layout.width, layout.height); ctx.clip();

            const isSidebarSection = layout.x < SIDEBAR_W - 10;

            if (isSidebarSection) {
                // ── SIDEBAR SECTION ────────────────────────────────────────
                drawSidebarSectionHeader(section.title, sx, sy, layout.width);

                let itemY = sy + 34;
                section.items.forEach((item, itemIdx) => {
                    const isEditingThis =
                        editingOverlay !== null &&
                        editingOverlay.sectionIndex === index &&
                        editingOverlay.itemPath.length === 1 &&
                        editingOverlay.itemPath[0] === itemIdx;

                    if (isEditingThis) ctx.globalAlpha = 0.22;

                    // Dash bullet
                    ctx.fillStyle = "rgba(255,255,255,0.55)";
                    ctx.fillRect(sx + 10, itemY - 4, 7, 1.5);

                    // Item text (white, slightly smaller)
                    ctx.fillStyle = "rgba(255,255,255,0.93)";
                    ctx.font = `${item.style.italic ? "italic" : "normal"} ${item.style.bold ? "bold" : "normal"} 13px Arial`;
                    const availW = layout.width - 28;
                    const words = item.text.split(" ");
                    let line = "", lineY = itemY;
                    for (let w = 0; w < words.length; w++) {
                        const test = line + words[w] + " ";
                        if (ctx.measureText(test).width > availW && w > 0) {
                            ctx.fillText(line.trim(), sx + 22, lineY);
                            line = words[w] + " "; lineY += 17;
                        } else { line = test; }
                    }
                    ctx.fillText(line.trim(), sx + 22, lineY);
                    if (isEditingThis) ctx.globalAlpha = 1;

                    itemY = lineY + 20;

                    // Children
                    item.children?.forEach((child) => {
                        ctx.globalAlpha = 0.7;
                        ctx.fillStyle = "rgba(255,255,255,0.8)";
                        ctx.font = "12px Arial";
                        ctx.fillText("  – " + child.text, sx + 22, itemY);
                        ctx.globalAlpha = 1;
                        itemY += 17;
                    });
                });
            } else {
                // ── RIGHT PANEL SECTION ────────────────────────────────────
                drawRightSectionHeader(section.title, sx, sy, layout.width);

                let itemY = sy + 42;
                section.items.forEach((item, itemIdx) => {
                    const isEditingThis =
                        editingOverlay !== null &&
                        editingOverlay.sectionIndex === index &&
                        editingOverlay.itemPath.length === 1 &&
                        editingOverlay.itemPath[0] === itemIdx;
                    itemY = drawItem(ctx, item, sx + 10, itemY, layout.width - 20, 0, isEditingThis);
                });
            }

            // Guide lines
            if (guideLines.x !== null) {
                ctx.strokeStyle = "#ff7b38"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(cx + guideLines.x, cy); ctx.lineTo(cx + guideLines.x, cy + A4_HEIGHT); ctx.stroke();
            }
            if (guideLines.y !== null) {
                ctx.strokeStyle = "#3f7cff"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(cx, cy + guideLines.y); ctx.lineTo(cx + A4_WIDTH, cy + guideLines.y); ctx.stroke();
            }

            ctx.restore();
            if (isHov || isDrag || isRes) drawResizeHandles(ctx, layout, cx, cy, isHov);
        });
    };

    // ── Coordinate helpers ────────────────────────────────────────────────────
    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef?.current; if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const b = getA4Bounds(); if (!b) return { x: 0, y: 0 };
        return {
            x: (e.clientX - rect.left - pan.x) / zoom - b.centerX,
            y: (e.clientY - rect.top - pan.y) / zoom - b.centerY,
        };
    };

    /** Convert a canvas-space point (relative to A4 origin) to screen-space (px, fixed) */
    const canvasToScreen = (canvasX: number, canvasY: number) => {
        const canvas = canvasRef?.current; if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const b = getA4Bounds(); if (!b) return { x: 0, y: 0 };
        return {
            x: (b.centerX + canvasX) * zoom + pan.x + rect.left,
            y: (b.centerY + canvasY) * zoom + pan.y + rect.top,
        };
    };

    const getResizeHandle = (x: number, y: number, layout: SectionLayout): ResizeHandle => {
        const pts = [
            { x: layout.x, y: layout.y, p: "nw" as ResizeHandle },
            { x: layout.x + layout.width, y: layout.y, p: "ne" as ResizeHandle },
            { x: layout.x, y: layout.y + layout.height, p: "sw" as ResizeHandle },
            { x: layout.x + layout.width, y: layout.y + layout.height, p: "se" as ResizeHandle },
            { x: layout.x + layout.width / 2, y: layout.y, p: "n" as ResizeHandle },
            { x: layout.x + layout.width / 2, y: layout.y + layout.height, p: "s" as ResizeHandle },
            { x: layout.x, y: layout.y + layout.height / 2, p: "w" as ResizeHandle },
            { x: layout.x + layout.width, y: layout.y + layout.height / 2, p: "e" as ResizeHandle },
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
            if (x >= layout.x - 5 && x <= layout.x + layout.width + 5 && y >= layout.y - 5 && y <= layout.y + layout.height + 5)
                return idx;
        }
        return null;
    };

    const getImageAtPoint = (x: number, y: number) =>
        x >= imageState.x - 5 && x <= imageState.x + imageState.width + 5 &&
        y >= imageState.y - 5 && y <= imageState.y + imageState.height + 5;

    // ── Inline editing: find which item was clicked ───────────────────────────
    /**
     * Walk the section's items in draw-order to find which item contains clickY.
     * Returns { path, text, canvasItemY } or null.
     * canvasItemY = the baseline Y in canvas-space (relative to A4 origin) of that item.
     */
    const findItemAtCanvasPoint = (
        sectionIndex: number,
        clickX: number,  // relative to A4
        clickY: number,
    ): { path: number[]; text: string; canvasItemY: number; canvasItemX: number; canvasWidth: number } | null => {
        const layout = sectionLayouts.get(sectionIndex);
        if (!layout) return null;

        // Offscreen canvas for text measuring (same font as drawItem)
        const mc = document.createElement("canvas").getContext("2d")!;
        mc.font = "normal normal 14px Arial";

        const sectionX = layout.x + 10;
        const maxWidth = layout.width - 20;
        let curY = layout.y + ITEM_SECTION_OFFSET_Y; // canvas-space Y baseline of first item

        const walk = (
            items: SectionItem[],
            depth: number,
            path: number[],
        ): { path: number[]; text: string; canvasItemY: number; canvasItemX: number; canvasWidth: number } | null => {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const indent = depth * 20;
                const textX = sectionX + indent + 10;
                const available = maxWidth - indent - 10;
                const baseY = curY;

                // Measure how many lines this item takes
                mc.font = `${item.style.italic ? "italic" : "normal"} ${item.style.bold ? "bold" : "normal"} 14px Arial`;
                const words = item.text.split(" ");
                let line = "", lineCount = 1;
                for (let w = 0; w < words.length; w++) {
                    const test = line + words[w] + " ";
                    if (mc.measureText(test).width > available && w > 0) { line = words[w] + " "; lineCount++; } else { line = test; }
                }
                const itemCanvasHeight = lineCount * ITEM_LINE_HEIGHT + 5;

                // Hit test: click within vertical band of this item
                if (clickY >= baseY - 15 && clickY <= baseY + itemCanvasHeight - 5) {
                    return { path: [...path, i], text: item.text, canvasItemY: baseY, canvasItemX: textX - 10, canvasWidth: available + 10 };
                }

                curY += itemCanvasHeight;

                if (item.children?.length) {
                    const found = walk(item.children, depth + 1, [...path, i]);
                    if (found) return found;
                }
            }
            return null;
        };

        const section = sections[sectionIndex];
        return walk(section.items, 0, []);
    };

    /** Open the inline textarea overlay for a given item */
    const openEditingOverlay = (sectionIndex: number, itemPath: number[], text: string, canvasItemY: number, canvasItemX: number, canvasWidth: number) => {
        const layout = sectionLayouts.get(sectionIndex);
        if (!layout) return;

        // Screen coordinates of the text start
        const screenPos = canvasToScreen(canvasItemX, canvasItemY - 13); // -13 to align top of textarea with text top

        setEditingOverlay({
            sectionIndex,
            itemPath,
            text,
            screenX: screenPos.x,
            screenY: screenPos.y,
            screenWidth: canvasWidth * zoom,
            lineHeight: ITEM_LINE_HEIGHT * zoom,
        });

        // Focus after paint
        setTimeout(() => textareaRef.current?.focus(), 0);
    };

    const commitEdit = () => {
        if (!editingOverlay) return;
        onItemTextChange?.({
            sectionIndex: editingOverlay.sectionIndex,
            itemPath: editingOverlay.itemPath,
            newText: editingOverlay.text,
        });
        setEditingOverlay(null);
    };

    // ── Mouse handlers ────────────────────────────────────────────────────────
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
        lastClickTime.current = now;
        lastClickSection.current = sIdx;

        if (!isDoubleClick || sIdx === null) return;

        // ── Double-click on a section → try to find item ──
        const found = findItemAtCanvasPoint(sIdx, pos.x, pos.y);
        if (!found) return;

        // Cancel any drag/pan state
        setDragSection(null);
        setResizeState(null);
        setIsPanning(false);

        openEditingOverlay(sIdx, found.path, found.text, found.canvasItemY, found.canvasItemX, found.canvasWidth);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isIcon || editingOverlay) return;

        const pos = getMousePos(e);

        if (imageInternalDragState && isEditingImageInside) {
            const dx = pos.x - imageInternalDragState.startX, dy = pos.y - imageInternalDragState.startY;
            setImageState((p) => ({ ...p, offsetX: p.offsetX + dx, offsetY: p.offsetY + dy }));
            setImageInternalDragState({ startX: pos.x, startY: pos.y });
            return;
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
            setImageState((p) => ({ ...p, x: pos.x - imageDragState.offsetX, y: pos.y - imageDragState.offsetY }));
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
                if (sIdx !== null) {
                    const layout = sectionLayouts.get(sIdx);
                    setHoveredHandle(layout ? getResizeHandle(pos.x, pos.y, layout) : null);
                } else { setHoveredHandle(null); }
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
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setImageState((p) => ({ ...p, scale: Math.max(0.5, Math.min(3, p.scale + delta)) }));
            return;
        }
        e.preventDefault();
        setZoom((p) => Math.max(0.3, Math.min(3, p + (e.deltaY > 0 ? -0.05 : 0.05))));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (isIcon) return;
        if (hoveredImage && e.key.toLowerCase() === "r") { e.preventDefault(); setImageState((p) => ({ ...p, rotation: (p.rotation + 15) % 360 })); }
        if (hoveredImage && e.key.toLowerCase() === "l") { e.preventDefault(); setImageState((p) => ({ ...p, rotation: (p.rotation - 15 + 360) % 360 })); }
    };

    // ── Snap helpers ─────────────────────────────────────────────────────────
    const getSnappedPosition = (idx: number, nx: number, ny: number) => {
        let sx = nx, sy = ny, guideX: number | null = null, guideY: number | null = null;
        const cur = sectionLayouts.get(idx); if (!cur) return { x: nx, y: ny, guideX, guideY };
        for (const [i, l] of sectionLayouts.entries()) {
            if (i === idx) continue;
            const { x: lx, y: ly, width: lw, height: lh } = l;
            if (Math.abs(nx - lx) < SNAP_THRESHOLD) { sx = lx; guideX = lx; }
            if (Math.abs(nx - lx - lw) < SNAP_THRESHOLD) { sx = lx + lw; guideX = lx + lw; }
            if (Math.abs(nx + cur.width - lx - lw) < SNAP_THRESHOLD) { sx = lx + lw - cur.width; guideX = lx + lw; }
            if (Math.abs(nx + cur.width - lx) < SNAP_THRESHOLD) { sx = lx - cur.width; guideX = lx; }
            if (Math.abs(ny - ly) < SNAP_THRESHOLD) { sy = ly; guideY = ly; }
            if (Math.abs(ny - ly - lh) < SNAP_THRESHOLD) { sy = ly + lh; guideY = ly + lh; }
            if (Math.abs(ny + cur.height - ly - lh) < SNAP_THRESHOLD) { sy = ly + lh - cur.height; guideY = ly + lh; }
            if (Math.abs(ny + cur.height - ly) < SNAP_THRESHOLD) { sy = ly - cur.height; guideY = ly; }
        }
        return { x: sx, y: sy, guideX, guideY };
    };

    const getSnappedEdges = (idx: number, edges: { left: number; right: number; top: number; bottom: number }) => {
        let snapLeft: number | null = null, snapRight: number | null = null, snapTop: number | null = null, snapBottom: number | null = null;
        let guideX: number | null = null, guideY: number | null = null;
        for (const [i, l] of sectionLayouts.entries()) {
            if (i === idx) continue;
            const { x: lx, y: ly, width: lw, height: lh } = l;
            if (Math.abs(edges.left - lx) < SNAP_THRESHOLD) { snapLeft = lx; guideX = lx; }
            if (Math.abs(edges.left - lx - lw) < SNAP_THRESHOLD) { snapLeft = lx + lw; guideX = lx + lw; }
            if (Math.abs(edges.right - lx) < SNAP_THRESHOLD) { snapRight = lx; guideX = lx; }
            if (Math.abs(edges.right - lx - lw) < SNAP_THRESHOLD) { snapRight = lx + lw; guideX = lx + lw; }
            if (Math.abs(edges.top - ly) < SNAP_THRESHOLD) { snapTop = ly; guideY = ly; }
            if (Math.abs(edges.top - ly - lh) < SNAP_THRESHOLD) { snapTop = ly + lh; guideY = ly + lh; }
            if (Math.abs(edges.bottom - ly) < SNAP_THRESHOLD) { snapBottom = ly; guideY = ly; }
            if (Math.abs(edges.bottom - ly - lh) < SNAP_THRESHOLD) { snapBottom = ly + lh; guideY = ly + lh; }
        }
        return { snapLeft, snapRight, snapTop, snapBottom, guideX, guideY };
    };

    // ── Cursor ────────────────────────────────────────────────────────────────
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

    const handleZoomIn = () => setZoom((p) => Math.min(p + 0.1, 3));
    const handleZoomOut = () => setZoom((p) => Math.max(p - 0.1, 0.3));

    // ── Render ────────────────────────────────────────────────────────────────
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
                height={260}
                width={200}
            />

            {/* ── Inline text editing overlay (Canva/PowerPoint style) ── */}
            {editingOverlay && (
                <>
                    {/* Scrim to catch outside clicks */}
                    <div
                        className="fixed inset-0 z-40"
                        onMouseDown={(e) => { e.preventDefault(); commitEdit(); }}
                    />

                    {/* Selection highlight ring */}
                    <div
                        className="fixed z-50 pointer-events-none rounded-sm"
                        style={{
                            left: editingOverlay.screenX - 2,
                            top: editingOverlay.screenY - 2,
                            width: editingOverlay.screenWidth + 4,
                            height: "auto",
                            outline: `2px solid ${primaryColor}`,
                            outlineOffset: 0,
                            boxShadow: `0 0 0 4px ${primaryColor}22`,
                        }}
                    />

                    {/* Toolbar (fixed, above textarea) */}
                    <div
                        className="fixed z-50 flex items-center gap-1 rounded-lg px-2 py-1.5 shadow-xl"
                        style={{
                            left: editingOverlay.screenX,
                            top: editingOverlay.screenY - 44,
                            background: "#1e1e1e",
                            border: "1px solid #333",
                            fontSize: 12,
                            color: "#fff",
                            userSelect: "none",
                            whiteSpace: "nowrap",
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <span style={{ color: "#aaa", fontSize: 11 }}>Double-click to edit</span>
                        <div style={{ width: 1, height: 14, background: "#444", margin: "0 4px" }} />
                        <kbd
                            style={{ background: "#333", borderRadius: 4, padding: "1px 5px", fontSize: 11, color: "#ccc", fontFamily: "monospace" }}
                        >Enter</kbd>
                        <span style={{ color: "#aaa", fontSize: 11 }}>confirm</span>
                        <div style={{ width: 1, height: 14, background: "#444", margin: "0 4px" }} />
                        <kbd
                            style={{ background: "#333", borderRadius: 4, padding: "1px 5px", fontSize: 11, color: "#ccc", fontFamily: "monospace" }}
                        >Esc</kbd>
                        <span style={{ color: "#aaa", fontSize: 11 }}>cancel</span>
                    </div>

                    {/* The actual textarea */}
                    <textarea
                        ref={textareaRef}
                        value={editingOverlay.text}
                        onChange={(e) => setEditingOverlay((prev) => prev ? { ...prev, text: e.target.value } : null)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(); }
                            if (e.key === "Escape") { setEditingOverlay(null); }
                            e.stopPropagation();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                            position: "fixed",
                            left: editingOverlay.screenX,
                            top: editingOverlay.screenY,
                            width: editingOverlay.screenWidth,
                            // Font size is always 14px (canvas native), NOT scaled by zoom
                            fontSize: "14px",
                            fontFamily: "Arial, sans-serif",
                            lineHeight: `${ITEM_LINE_HEIGHT}px`,
                            color: "#111",
                            background: "rgba(255,255,255,0.97)",
                            border: "none",
                            outline: "none",
                            resize: "none",
                            padding: "2px 4px",
                            zIndex: 50,
                            minHeight: `${ITEM_LINE_HEIGHT}px`,
                            overflow: "hidden",
                            boxSizing: "border-box",
                            borderRadius: 2,
                            // Subtle text-cursor caret matching primary color
                            caretColor: primaryColor,
                        }}
                        // Auto-grow
                        rows={1}
                        onInput={(e) => {
                            const el = e.currentTarget;
                            el.style.height = "auto";
                            el.style.height = el.scrollHeight + "px";
                        }}
                    />
                </>
            )}

            {/* ── Zoom Controls ── */}
            {!isIcon && (
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                    <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded transition-all text-gray-700" title="Zoom In"><ZoomIn size={20} /></button>
                    <div className="h-px bg-gray-200" />
                    <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded transition-all text-gray-700" title="Zoom Out"><ZoomOut size={20} /></button>
                    <div className="h-px bg-gray-200" />
                    <div className="px-2 py-1 text-xs text-gray-600 text-center">{Math.round(zoom * 100)}%</div>
                </div>
            )}

            {/* ── A4 Info badge ── */}
            {!isIcon && (
                <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">A4 Paper</span> • 794 × 1123 px
                    </p>
                </div>
            )}

            {/* ── Image editing hints ── */}
            {!isIcon && isEditingImageInside && hoveredImage && (
                <div className="absolute top-20 left-6 bg-white rounded-lg shadow-lg border border-[#0C6A4E] px-4 py-2">
                    <h3 className="font-semibold text-[#0C6A4E] text-sm mb-2">Editing Image Inside</h3>
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
                    <div className="text-sm text-[#0C6A4E] mt-1">R / L: Rotate image</div>
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