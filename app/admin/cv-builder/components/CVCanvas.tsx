"use client";

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ShapeType = "rect" | "circle" | "line" | "icon";

export interface BgElement {
    id: string;
    type: ShapeType;
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
    rotation?: number;
    // SVG icon fields
    iconSrc?: string;      // path trong /public, e.g. "/icons/email.svg"
    iconId?: string;       // id định danh icon (từ ICON_LIBRARY)
    iconColor?: string;    // tint color
}

export interface SectionItem {
    text: string;
    editing: boolean;
    tempText: string;
    style: {
        bold: boolean;
        italic: boolean;
        underline: boolean;
        color: string;
    };
    children: SectionItem[];
    expanded: boolean;
} 
export interface CVSection {
    id: string;
    title: string;
    items: SectionItem[];
    x: number;
    y: number;
    size: { width: number; height: number };
}

export interface TemplateData {
    name: string;
    primaryColor: string;
    backgroundElements: BgElement[];
    sections: CVSection[];
}

interface CVCanvasProps {
    data: TemplateData;
    mode?: "admin" | "preview";
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onChange: (patch: Partial<TemplateData>) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const A4_W = 794;
const A4_H = 1123;
const HANDLE_SIZE = 8;
const SNAP = 8;
type ResizeHandle = "nw"|"n"|"ne"|"e"|"se"|"s"|"sw"|"w"|null;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const hexToRgba = (hex: string, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
};

const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
};

const getHandleRects = (x: number, y: number, w: number, h: number) => {
    const hs = HANDLE_SIZE;
    const hw = hs / 2;
    return {
        nw: { x: x - hw, y: y - hw, w: hs, h: hs },
        n:  { x: x + w / 2 - hw, y: y - hw, w: hs, h: hs },
        ne: { x: x + w - hw, y: y - hw, w: hs, h: hs },
        e:  { x: x + w - hw, y: y + h / 2 - hw, w: hs, h: hs },
        se: { x: x + w - hw, y: y + h - hw, w: hs, h: hs },
        s:  { x: x + w / 2 - hw, y: y + h - hw, w: hs, h: hs },
        sw: { x: x - hw, y: y + h - hw, w: hs, h: hs },
        w:  { x: x - hw, y: y + h / 2 - hw, w: hs, h: hs },
    } as Record<string, { x: number; y: number; w: number; h: number }>;
};

const hitHandle = (mx: number, my: number, x: number, y: number, w: number, h: number): ResizeHandle => {
    const handles = getHandleRects(x, y, w, h);
    for (const [key, r] of Object.entries(handles)) {
        if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return key as ResizeHandle;
    }
    return null;
};

const resizeCursor: Record<string, string> = {
    nw: "nwse-resize", se: "nwse-resize",
    ne: "nesw-resize", sw: "nesw-resize",
    n: "ns-resize",  s: "ns-resize",
    e: "ew-resize",  w: "ew-resize",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const CVCanvas = forwardRef<{ toDataURL: () => string }, CVCanvasProps>(
    ({ data, mode = "admin", selectedId, onSelect, onChange }, ref) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 40, y: 40 });

    // interaction state
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ mx: 0, my: 0, px: 0, py: 0 });
    const [dragState, setDragState] = useState<{ id: string; ox: number; oy: number } | null>(null);
    const [resizeState, setResizeState] = useState<{
        id: string; handle: ResizeHandle;
        startMx: number; startMy: number;
        startX: number; startY: number; startW: number; startH: number;
    } | null>(null);
    const [cursor, setCursor] = useState("default");

    // ── Expose toDataURL ─────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
        toDataURL: () => {
            // Render at A4 size without transform
            const offscreen = document.createElement("canvas");
            offscreen.width = A4_W;
            offscreen.height = A4_H;
            const ctx = offscreen.getContext("2d")!;
            renderCV(ctx, 0, 0, 1, null);
            return offscreen.toDataURL("image/png");
        }
    }));

    // ── Coordinate helpers ───────────────────────────────────────────────────
    const screenToCanvas = useCallback((sx: number, sy: number) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: (sx - rect.left - pan.x) / zoom,
            y: (sy - rect.top  - pan.y) / zoom,
        };
    }, [pan, zoom]);

    // ── Find element at point ────────────────────────────────────────────────
    const findAt = useCallback((cx: number, cy: number): string | null => {
        // Sections (check in reverse for top-most)
        const secs = [...(data.sections || [])].reverse();
        for (const s of secs) {
            if (cx >= s.x && cx <= s.x + s.size.width && cy >= s.y && cy <= s.y + s.size.height) return s.id;
        }
        // Background elements sorted by zIndex desc
        const els = [...(data.backgroundElements || [])].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
        for (const el of els) {
            if (cx >= el.x && cx <= el.x + el.width && cy >= el.y && cy <= el.y + el.height) return el.id;
        }
        return null;
    }, [data]);

    const findElement = useCallback((id: string): BgElement | CVSection | null => {
        return data.backgroundElements.find(e => e.id === id)
            || data.sections.find(s => s.id === id)
            || null;
    }, [data]);

    const isBgEl = (el: any): el is BgElement => !el?.size;

    // ── SVG image cache ──────────────────────────────────────────────────────
    // Map: src → HTMLImageElement (loaded). Prevents re-loading every render frame.
    const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());

    const loadSvgImage = useCallback((src: string, onReady: (img: HTMLImageElement) => void) => {
        const cached = imgCache.current.get(src);
        if (cached) { onReady(cached); return; }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { imgCache.current.set(src, img); onReady(img); };
        img.onerror = () => {};
        img.src = src;
    }, []);

    // Preload all icon SVGs whenever backgroundElements change
    useEffect(() => {
        for (const el of data.backgroundElements) {
            if (el.type === "icon" && el.iconSrc && !imgCache.current.has(el.iconSrc)) {
                loadSvgImage(el.iconSrc, () => {
                    // Trigger redraw after icon loads
                    const canvas = canvasRef.current; if (!canvas) return;
                    const ctx = canvas.getContext("2d")!;
                    renderCV(ctx, pan.x, pan.y, zoom, selectedId);
                });
            }
        }
    }, [data.backgroundElements, loadSvgImage]);
    const snapPos = (nx: number, ny: number, ow: number, oh: number, skipId: string) => {
        const all = [
            ...data.backgroundElements.filter(e => e.id !== skipId).map(e => ({ x: e.x, y: e.y, w: e.width, h: e.height })),
            ...data.sections.filter(s => s.id !== skipId).map(s => ({ x: s.x, y: s.y, w: s.size.width, h: s.size.height })),
            { x: 0, y: 0, w: A4_W, h: A4_H }, // A4 edges
        ];
        let sx = nx, sy = ny;
        for (const el of all) {
            if (Math.abs(nx - el.x) < SNAP) sx = el.x;
            if (Math.abs(nx + ow - el.x - el.w) < SNAP) sx = el.x + el.w - ow;
            if (Math.abs(nx - el.x - el.w) < SNAP) sx = el.x + el.w;
            if (Math.abs(ny - el.y) < SNAP) sy = el.y;
            if (Math.abs(ny + oh - el.y - el.h) < SNAP) sy = el.y + el.h - oh;
            if (Math.abs(ny - el.y - el.h) < SNAP) sy = el.y + el.h;
        }
        return { x: sx, y: sy };
    };

    // ── Render ───────────────────────────────────────────────────────────────
    const renderCV = useCallback((ctx: CanvasRenderingContext2D, panX: number, panY: number, z: number, selId: string | null) => {
        const W = ctx.canvas.width;
        const H = ctx.canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Grid background
        ctx.save();
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 0.5;
        const gs = 20 * z;
        for (let x = panX % gs; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = panY % gs; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        ctx.restore();

        // A4 paper shadow
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.18)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = "#fff";
        ctx.fillRect(panX, panY, A4_W * z, A4_H * z);
        ctx.shadowColor = "transparent";
        ctx.restore();

        // Draw onto A4 space
        ctx.save();
        ctx.translate(panX, panY);
        ctx.scale(z, z);

        // Clip to A4
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, A4_W, A4_H);
        ctx.clip();

        // Background elements sorted by zIndex
        const sortedEls = [...(data.backgroundElements || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        for (const el of sortedEls) {
            ctx.save();
            ctx.globalAlpha = el.opacity ?? 1;
            if (el.type === "rect") {
                const r = el.borderRadius || 0;
                drawRoundRect(ctx, el.x, el.y, el.width, el.height, r);
                if (el.fill) { ctx.fillStyle = el.fill; ctx.fill(); }
                if (el.stroke && (el.strokeWidth || 0) > 0) {
                    ctx.strokeStyle = el.stroke;
                    ctx.lineWidth = el.strokeWidth!;
                    ctx.stroke();
                }
            } else if (el.type === "circle") {
                ctx.beginPath();
                ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
                if (el.fill) { ctx.fillStyle = el.fill; ctx.fill(); }
                if (el.stroke && (el.strokeWidth || 0) > 0) { ctx.strokeStyle = el.stroke; ctx.lineWidth = el.strokeWidth!; ctx.stroke(); }
            } else if (el.type === "line") {
                ctx.beginPath();
                ctx.moveTo(el.x, el.y + el.height / 2);
                ctx.lineTo(el.x + el.width, el.y + el.height / 2);
                ctx.strokeStyle = el.fill || "#000";
                ctx.lineWidth = el.strokeWidth || 2;
                ctx.stroke();
            } else if (el.type === "icon") {
                // SVG icon từ /public/icons/ — đã được cache trong imgCache
                const cachedImg = el.iconSrc ? imgCache.current.get(el.iconSrc) : null;
                if (cachedImg) {
                    // Vẽ vào offscreen canvas nhỏ để tint màu
                    const offscreen = document.createElement("canvas");
                    offscreen.width = el.width;
                    offscreen.height = el.height;
                    const octx = offscreen.getContext("2d")!;
                    octx.drawImage(cachedImg, 0, 0, el.width, el.height);

                    // Tint: thay tất cả pixel đục sang iconColor
                    const tintColor = el.iconColor || data.primaryColor || "#333";
                    const hex = tintColor.replace("#", "");
                    const tr = parseInt(hex.slice(0, 2), 16);
                    const tg = parseInt(hex.slice(2, 4), 16);
                    const tb = parseInt(hex.slice(4, 6), 16);
                    const imgData = octx.getImageData(0, 0, el.width, el.height);
                    const d = imgData.data;
                    for (let pi = 0; pi < d.length; pi += 4) {
                        if (d[pi + 3] > 10) { d[pi] = tr; d[pi + 1] = tg; d[pi + 2] = tb; }
                    }
                    octx.putImageData(imgData, 0, 0);
                    ctx.drawImage(offscreen, el.x, el.y, el.width, el.height);
                } else {
                    // Fallback placeholder khi chưa load xong
                    ctx.fillStyle = (el.iconColor || data.primaryColor || "#333") + "44";
                    ctx.fillRect(el.x, el.y, el.width, el.height);
                    ctx.fillStyle = el.iconColor || data.primaryColor || "#333";
                    ctx.font = `bold ${Math.min(el.width, el.height) * 0.5}px Arial`;
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    const name = (el.iconSrc || "?").split("/").pop()?.replace(".svg", "") ?? "?";
                    ctx.fillText(name.charAt(0).toUpperCase(), el.x + el.width / 2, el.y + el.height / 2);
                }
            }
            ctx.restore();
        }

        // Sections
        for (const section of data.sections || []) {
            const { x, y, size: { width: sw, height: sh } } = section;
            ctx.save();
            ctx.beginPath(); ctx.rect(x, y, sw, sh); ctx.clip();

            // Section header
            const ac = data.primaryColor || "#1d7057";
            ctx.fillStyle = ac;
            ctx.beginPath();
            ctx.arc(x + 6, y + 14, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#111827";
            ctx.font = "bold 13px Arial";
            ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
            ctx.fillText(section.title.toUpperCase(), x + 18, y + 18);
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.fillRect(x, y + 24, sw, 1);
            ctx.fillStyle = ac;
            ctx.fillRect(x, y + 24, 36, 2);

            // Items
            let iy = y + 44;
            for (const item of section.items || []) {
                ctx.fillStyle = ac;
                ctx.beginPath(); ctx.arc(x + 16, iy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
                const bold = item.style?.bold ? "bold " : "";
                const italic = item.style?.italic ? "italic " : "";
                ctx.font = `${italic}${bold}13px Arial`;
                ctx.fillStyle = item.style?.color || "#374151";
                ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
                const words = item.text.split(" ");
                let line = ""; let lineY = iy;
                const maxW = sw - 30;
                for (let wi = 0; wi < words.length; wi++) {
                    const test = line + words[wi] + " ";
                    if (ctx.measureText(test).width > maxW && wi > 0) {
                        ctx.fillText(line.trim(), x + 26, lineY);
                        line = words[wi] + " "; lineY += 18;
                    } else { line = test; }
                }
                ctx.fillText(line.trim(), x + 26, lineY);
                iy = lineY + 22;
            }
            ctx.restore();
        }

        ctx.restore(); // unclip A4

        // Selection handles + outline (drawn OUTSIDE clip so handles are visible at edges)
        if (selId) {
            const el = findElement(selId);
            if (el) {
                const ex = isBgEl(el) ? el.x : (el as CVSection).x;
                const ey = isBgEl(el) ? el.y : (el as CVSection).y;
                const ew = isBgEl(el) ? el.width : (el as CVSection).size.width;
                const eh = isBgEl(el) ? el.height : (el as CVSection).size.height;

                ctx.save();
                ctx.strokeStyle = "#2563EB";
                ctx.lineWidth = 1.5 / z;
                ctx.setLineDash([4 / z, 3 / z]);
                ctx.strokeRect(ex - 1 / z, ey - 1 / z, ew + 2 / z, eh + 2 / z);
                ctx.setLineDash([]);

                // Handles
                const handles = getHandleRects(ex, ey, ew, eh);
                for (const r of Object.values(handles)) {
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(r.x, r.y, r.w, r.h);
                    ctx.strokeStyle = "#2563EB";
                    ctx.lineWidth = 1 / z;
                    ctx.strokeRect(r.x, r.y, r.w, r.h);
                }
                ctx.restore();
            }
        }

        ctx.restore(); // un-translate
    }, [data, findElement]);

    // Redraw
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        renderCV(ctx, pan.x, pan.y, zoom, selectedId);
    }, [data, zoom, pan, selectedId, renderCV]);

    // Resize observer
    useEffect(() => {
        const container = containerRef.current; if (!container) return;
        const obs = new ResizeObserver(() => {
            const canvas = canvasRef.current; if (!canvas) return;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        });
        obs.observe(container);
        return () => obs.disconnect();
    }, []);

    // ── Mouse events ─────────────────────────────────────────────────────────
    const handleMouseDown = (e: React.MouseEvent) => {
        if (mode !== "admin") return;
        const { x, y } = screenToCanvas(e.clientX, e.clientY);
        e.preventDefault();

        // Middle mouse or space+click → pan
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            setIsPanning(true);
            setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y });
            return;
        }

        // Check resize handle on selected element first
        if (selectedId) {
            const el = findElement(selectedId);
            if (el) {
                const ex = isBgEl(el) ? el.x : (el as CVSection).x;
                const ey = isBgEl(el) ? el.y : (el as CVSection).y;
                const ew = isBgEl(el) ? el.width : (el as CVSection).size.width;
                const eh = isBgEl(el) ? el.height : (el as CVSection).size.height;
                const h = hitHandle(x, y, ex, ey, ew, eh);
                if (h) {
                    setResizeState({ id: selectedId, handle: h, startMx: x, startMy: y, startX: ex, startY: ey, startW: ew, startH: eh });
                    return;
                }
            }
        }

        // Drag existing element
        const hitId = findAt(x, y);
        if (hitId) {
            onSelect(hitId);
            const el = findElement(hitId);
            if (el) {
                const ex = isBgEl(el) ? el.x : (el as CVSection).x;
                const ey = isBgEl(el) ? el.y : (el as CVSection).y;
                setDragState({ id: hitId, ox: x - ex, oy: y - ey });
            }
            return;
        }

        onSelect(null);
        // Begin pan
        setIsPanning(true);
        setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { x, y } = screenToCanvas(e.clientX, e.clientY);

        if (isPanning) {
            setPan({ x: panStart.px + (e.clientX - panStart.mx), y: panStart.py + (e.clientY - panStart.my) });
            return;
        }

        if (resizeState) {
            const { id, handle, startMx, startMy, startX, startY, startW, startH } = resizeState;
            const dx = x - startMx, dy = y - startMy;
            let nx = startX, ny = startY, nw = startW, nh = startH;

            if (handle?.includes("e")) nw = Math.max(20, startW + dx);
            if (handle?.includes("s")) nh = Math.max(20, startH + dy);
            if (handle?.includes("w")) { nx = startX + dx; nw = Math.max(20, startW - dx); }
            if (handle?.includes("n")) { ny = startY + dy; nh = Math.max(20, startH - dy); }

            updateElPos(id, nx, ny, nw, nh);
            setCursor(resizeCursor[handle!] || "default");
            return;
        }

        if (dragState) {
            const { id, ox, oy } = dragState;
            const el = findElement(id);
            if (!el) return;
            const ew = isBgEl(el) ? el.width : (el as CVSection).size.width;
            const eh = isBgEl(el) ? el.height : (el as CVSection).size.height;
            const snapped = snapPos(x - ox, y - oy, ew, eh, id);
            updateElPos(id, snapped.x, snapped.y);
            setCursor("grabbing");
            return;
        }

        // Hover cursor
        if (selectedId) {
            const el = findElement(selectedId);
            if (el) {
                const ex = isBgEl(el) ? el.x : (el as CVSection).x;
                const ey = isBgEl(el) ? el.y : (el as CVSection).y;
                const ew = isBgEl(el) ? el.width : (el as CVSection).size.width;
                const eh = isBgEl(el) ? el.height : (el as CVSection).size.height;
                const h = hitHandle(x, y, ex, ey, ew, eh);
                if (h) { setCursor(resizeCursor[h]); return; }
            }
        }
        const hit = findAt(x, y);
        setCursor(hit ? "move" : "default");
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setDragState(null);
        setResizeState(null);
        setCursor("default");
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.08 : 0.08;
        const newZoom = Math.max(0.3, Math.min(3, zoom + delta));
        // Zoom toward mouse
        const rect = canvasRef.current!.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const factor = newZoom / zoom;
        setPan(p => ({ x: mx - factor * (mx - p.x), y: my - factor * (my - p.y) }));
        setZoom(newZoom);
    };

    // Handle drop from sidebar
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("application/cv-element");
        if (!raw) return;
        const shape = JSON.parse(raw);
        const { x, y } = screenToCanvas(e.clientX, e.clientY);
        const newEl: BgElement = {
            ...shape,
            id: `el-${Date.now()}`,
            x: Math.round(x - (shape.width || 100) / 2),
            y: Math.round(y - (shape.height || 100) / 2),
            zIndex: (data.backgroundElements?.length || 0) + 1,
        };
        if (shape.type === "section") {
            const newSec: CVSection = {
                id: `section-${Date.now()}`,
                title: shape.title || "New Section",
                x: newEl.x, y: newEl.y,
                size: { width: shape.width || 300, height: shape.height || 200 },
                items: shape.items || [{ text: "Default content..." }],
            };
            onChange({ sections: [...(data.sections || []), newSec] });
        } else {
            onChange({ backgroundElements: [...(data.backgroundElements || []), newEl] });
        }
    };

    // ── Update helpers ───────────────────────────────────────────────────────
    const updateElPos = (id: string, nx: number, ny: number, nw?: number, nh?: number) => {
        const isSection = data.sections.some(s => s.id === id);
        if (isSection) {
            onChange({
                sections: data.sections.map(s => s.id === id
                    ? { ...s, x: nx, y: ny, size: { width: nw ?? s.size.width, height: nh ?? s.size.height } }
                    : s)
            });
        } else {
            onChange({
                backgroundElements: data.backgroundElements.map(el => el.id === id
                    ? { ...el, x: nx, y: ny, width: nw ?? el.width, height: nh ?? el.height }
                    : el)
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!selectedId) return;
        if (e.key === "Delete" || e.key === "Backspace") {
            onChange({
                backgroundElements: data.backgroundElements.filter(el => el.id !== selectedId),
                sections: data.sections.filter(s => s.id !== selectedId),
            });
            onSelect(null);
        }
        if (e.key === "Escape") onSelect(null);
    };

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden focus:outline-none" tabIndex={0} onKeyDown={handleKeyDown}>
            {/* Zoom badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-white border border-gray-200 rounded-md shadow px-2 py-1 text-xs text-gray-500 select-none">
                <span className="font-mono font-medium text-gray-700">{Math.round(zoom * 100)}%</span>
                <span className="text-gray-300">|</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="hover:text-blue-600 px-0.5">+</button>
                <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="hover:text-blue-600 px-0.5">−</button>
                <button onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }); }} className="hover:text-blue-600 px-0.5 ml-1">⌂</button>
            </div>

            <canvas
                ref={canvasRef}
                style={{ cursor, display: "block", width: "100%", height: "100%" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
            />
        </div>
    );
});

CVCanvas.displayName = "CVCanvas";