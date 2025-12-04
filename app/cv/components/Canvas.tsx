"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Move, Maximize } from "lucide-react";
import { Section, SectionSize } from "../[cv_id]/page";
import jsPDF from "jspdf";
import { cvAPI } from "@/services/cv";
import { toast } from "sonner";
import { title } from "process";

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

interface CVCanvasProps {
    cv_id?: string;
    imageURL?: string;
    cvTitle?: string;
    cvSubTitle?: string;
    sections?: Section[];
    onSectionDrag?: (data: { id: string, x: number, y: number }) => void;
    primaryColor?: string;
    isIcon?: boolean;
    defaultZoom?: number;
    canvasRef?: React.RefObject<HTMLCanvasElement | null>;
    onSectionResize?: (data: { id: string, width: number, height: number }) => void;
    imageState: ImageState,
    setImageState: Dispatch<SetStateAction<ImageState>>;
    isSavable: boolean;
    projectName: string
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

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
): CVState => {
    return {
        cvTitle,
        cvSubTitle,
        primaryColor,
        imageURL,
        imageState,
        sections: sections.map(section => ({
            ...section,
            items: JSON.parse(JSON.stringify(section.items))
        })),
        projectName
    };
};


const INITIAL_IMAGE_STATE: ImageState = {
    x: 40,
    y: 140,
    width: 160,
    height: 160,
    rotation: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0
};

export const generatePDFFromState = (state: CVState): void => {
    console.log(state.imageState)
    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;
    const PADDING = 60;

    const canvas = document.createElement('canvas');
    canvas.width = A4_WIDTH;
    canvas.height = A4_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const applyTextStyle = (style: TextStyle, fontSize: number) => {
        const weight = style.bold ? "bold" : "normal";
        const fontStyle = style.italic ? "italic" : "normal";
        ctx.font = `${fontStyle} ${weight} ${fontSize}px Arial`;
        ctx.fillStyle = style.color;
    };

    const drawTextWithUnderline = (text: string, x: number, y: number, underline: boolean) => {
        ctx.fillText(text, x, y);
        if (underline) {
            const textWidth = ctx.measureText(text).width;
            ctx.beginPath();
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1;
            ctx.moveTo(x, y + 2);
            ctx.lineTo(x + textWidth, y + 2);
            ctx.stroke();
        }
    };

    const drawItem = (item: SectionItem, x: number, y: number, maxWidth: number, depth: number = 0): number => {
        const indent = depth * 20;
        const bulletX = x + indent;

        if (bulletX + 10 > x + maxWidth) return y + 25;

        ctx.fillStyle = state.primaryColor;
        ctx.beginPath();
        ctx.arc(bulletX, y - 3, 2, 0, Math.PI * 2);
        ctx.fill();

        applyTextStyle(item.style, 14);

        const textX = bulletX + 10;
        const availableWidth = maxWidth - indent - 10;
        const words = item.text.split(' ');
        let line = '';
        let lineY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > availableWidth && i > 0) {
                drawTextWithUnderline(line.trim(), textX, lineY, item.style.underline);
                line = words[i] + ' ';
                lineY += 20;
            } else {
                line = testLine;
            }
        }
        drawTextWithUnderline(line.trim(), textX, lineY, item.style.underline);

        let currentY = lineY + 25;

        if (item.children && item.children.length > 0) {
            item.children.forEach((child) => {
                currentY = drawItem(child, x, currentY, maxWidth, depth + 1);
            });
        }

        return currentY;
    };

    const drawRoundedImageWithState = (img: HTMLImageElement) => {
        const imgState = state.imageState;
        const x = imgState.x;
        const y = imgState.y;

        ctx.save();

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(x + imgState.width / 2, y + imgState.height / 2, Math.min(imgState.width, imgState.height) / 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw image with transformations
        if (img && img.complete) {
            ctx.save();

            const centerX = x + imgState.width / 2;
            const centerY = y + imgState.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((imgState.rotation * Math.PI) / 180);

            const scaledWidth = imgState.width * imgState.scale;
            const scaledHeight = imgState.height * imgState.scale;

            ctx.drawImage(
                img,
                -scaledWidth / 2 + imgState.offsetX,
                -scaledHeight / 2 + imgState.offsetY,
                scaledWidth,
                scaledHeight
            );

            ctx.restore();
        } else {
            ctx.fillStyle = "#E5E7EB";
            ctx.fillRect(x, y, imgState.width, imgState.height);
        }

        ctx.restore();

        // Draw border
        ctx.beginPath();
        ctx.arc(x + imgState.width / 2, y + imgState.height / 2, Math.min(imgState.width, imgState.height) / 2, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = state.primaryColor;
        ctx.stroke();
    };

    // Vẽ nền trắng
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

    // Vẽ pattern (header màu)
    ctx.fillStyle = state.primaryColor;
    ctx.fillRect(0, 0, A4_WIDTH, 130);

    ctx.fillStyle = state.primaryColor;
    ctx.fillRect(245, 135, 2, A4_HEIGHT - 140);

    // Vẽ title
    ctx.fillStyle = "#ffffffff";
    ctx.font = "bold 32px Arial";
    ctx.fillText(state.cvTitle || "Tiêu đề CV", PADDING, PADDING);

    ctx.fillStyle = "#ffffffff";
    ctx.font = "18px Arial";
    ctx.fillText(state.cvSubTitle || "Tiêu đề phụ", PADDING, PADDING + 27);

    // Vẽ ảnh (nếu có)
    if (state.imageURL) {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            drawRoundedImageWithState(img);
            drawSectionsContent();
        };

        img.onerror = () => {
            // Placeholder
            const imgState = state.imageState;
            ctx.fillStyle = "#E5E7EB";
            ctx.beginPath();
            ctx.arc(imgState.x + imgState.width / 2, imgState.y + imgState.height / 2, Math.min(imgState.width, imgState.height) / 2, 0, Math.PI * 2);
            ctx.fill();

            drawSectionsContent();
        };

        img.src = state.imageURL;
    } else {
        drawSectionsContent();
    }

    function drawSectionsContent() {
        if (!ctx) return;

        // Vẽ sections với đủ thông tin width, height
        state.sections.forEach((section) => {
            const sectionX = section.x;
            const sectionY = section.y;
            const sectionWidth = section.size.width;
            const sectionHeight = section.size.height;

            ctx.save();
            ctx.beginPath();
            ctx.rect(sectionX, sectionY, sectionWidth, sectionHeight);
            ctx.clip();

             ctx.fillStyle = state.primaryColor;
            ctx.fillRect(sectionX, sectionY + 30, sectionWidth, 1);
            ctx.fillStyle = state.primaryColor;
            ctx.fillRect(sectionX, sectionY, 1, 30);
            ctx.fillStyle = state.primaryColor;
            ctx.fillRect(sectionX, sectionY, sectionWidth / 5, 1);

            ctx.fillStyle = state.primaryColor;
            ctx.font = "17px Arial";
            ctx.fillText(section.title, sectionX + 10, sectionY + 21);
            let itemY = sectionY + 55;


            // Vẽ items
            section.items.forEach((item) => {
                itemY = drawItem(item, sectionX + 10, itemY, sectionWidth - 20, 0);
            });

            ctx.restore();
        });

        // Lưu PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save(`${state.projectName}.pdf`);
    }
};
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
    projectName
}: CVCanvasProps) {
    const iconRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState<number>(defaultZoom);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [dragSection, setDragSection] = useState<DragState | null>(null);
    const [resizeState, setResizeState] = useState<ResizeState | null>(null);
    const [hoveredSection, setHoveredSection] = useState<number | null>(null);
    const [hoveredHandle, setHoveredHandle] = useState<ResizeHandle>(null);
    const [sectionLayouts, setSectionLayouts] = useState<Map<number, SectionLayout>>(new Map());
    const [guideLines, setGuideLines] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
    const [hoveredImage, setHoveredImage] = useState(false);
    const [hoveredImageHandle, setHoveredImageHandle] = useState<ResizeHandle>(null);
    const [imageDragState, setImageDragState] = useState<DragState | null>(null);
    const [imageResizeState, setImageResizeState] = useState<ImageResizeState | null>(null);
    const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
    const [imageInternalDragState, setImageInternalDragState] = useState<{ startX: number; startY: number } | null>(null);
    const [isEditingImageInside, setIsEditingImageInside] = useState(false);

    // Preload image
    useEffect(() => {
        if (imageURL) {
            const img = new Image();
            img.onload = () => setLoadedImage(img);
            img.onerror = () => console.error("Failed to load image");
            img.src = imageURL;
        }
    }, [imageURL]);

    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;
    const GRID_SIZE = 20;
    const PADDING = 60;
    const MIN_SECTION_WIDTH = 100;
    const MIN_SECTION_HEIGHT = 60;
    const HANDLE_SIZE = 8;
    const SNAP_THRESHOLD = 8;


    useEffect(() => {
        let canvas;
        if (isIcon) {
            canvas = iconRef.current;
        } else {
            canvas = canvasRef?.current;
        }
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const container = containerRef.current;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        drawCanvas(ctx, canvas.width, canvas.height);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isSavable) return;
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [primaryColor, zoom, pan, cvTitle, cvSubTitle, sections, hoveredSection, sectionLayouts, hoveredHandle, imageState, loadedImage, hoveredImage, hoveredImageHandle]);

    // Initialize default layouts
    useEffect(() => {
        if (sections.length === 0) return;

        const newLayouts = new Map<number, SectionLayout>();
        const bounds = getA4Bounds();
        if (!bounds) return;

        let yOffset = PADDING + 80;

        sections.forEach((section, index) => {
            const height = calculateSectionHeight(section);
            newLayouts.set(index, {
                id: section.id,
                x: section.x,
                y: section.y,
                width: section.size.width,
                height: section.size.height
            });
            yOffset += height + 20;
        });
        setSectionLayouts(newLayouts);
    }, [sections]);


    const handleSave = () => {
        cvAPI.update({
            id: cv_id,
            primary_color: primaryColor,
            sections: JSON.stringify(sections),
            title: cvTitle,
            subtitle: cvSubTitle,
            name: projectName
        }).then(res => {
            toast.success('Saved!')
        }).catch(err => { })
    };

    const getA4Bounds = () => {
        const container = containerRef.current;
        if (!container) return null;

        const centerX = (container.clientWidth / zoom - A4_WIDTH) / 2;
        const centerY = 50;

        return { centerX, centerY };
    };
    useEffect(() => {
        if (!isIcon) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [hoveredImage]);
    const drawCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);

        if (!isIcon) {
            drawGrid(ctx, 1000 / zoom, 1000 / zoom);
        }
        drawA4Paper(ctx);
        drawPattern(ctx)
        drawCVContent(ctx);

        ctx.restore();
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.strokeStyle = "#E5E7EB";
        ctx.lineWidth = 0.5;

        const offsetX = (zoom) % GRID_SIZE;
        const offsetY = (zoom) % GRID_SIZE;

        for (let x = offsetX; x < width; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = offsetY; y < height; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    };

    const drawA4Paper = (ctx: CanvasRenderingContext2D) => {
        const bounds = getA4Bounds();
        if (!bounds) return;

        const { centerX, centerY } = bounds;

        ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(centerX, centerY, A4_WIDTH, A4_HEIGHT);

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "#D1D5DB";
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX, centerY, A4_WIDTH, A4_HEIGHT);
    };

    const applyTextStyle = (ctx: CanvasRenderingContext2D, style: TextStyle, fontSize: number) => {
        const weight = style.bold ? "bold" : "normal";
        const fontStyle = style.italic ? "italic" : "normal";
        ctx.font = `${fontStyle} ${weight} ${fontSize}px Arial`;
        ctx.fillStyle = style.color;
    };

    const drawTextWithUnderline = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, underline: boolean) => {
        ctx.fillText(text, x, y);

        if (underline) {
            const textWidth = ctx.measureText(text).width;
            ctx.beginPath();
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1;
            ctx.moveTo(x, y + 2);
            ctx.lineTo(x + textWidth, y + 2);
            ctx.stroke();
        }
    };

    const calculateItemHeight = (item: SectionItem): number => {
        let height = 25;
        if (item.children && item.children.length > 0) {
            item.children.forEach(child => {
                height += calculateItemHeight(child);
            });
        }
        return height;
    };

    const calculateSectionHeight = (section: Section): number => {
        let height = 35;
        section.items.forEach(item => {
            height += calculateItemHeight(item);
        });
        return height + 20;
    };

    const drawPattern = (ctx: CanvasRenderingContext2D) => {
        const bounds = getA4Bounds();
        if (!bounds) return;

        const { centerX, centerY } = bounds;
        ctx.fillStyle = primaryColor;
        ctx.fillRect(centerX, centerY, A4_WIDTH, 130);

        ctx.fillStyle = primaryColor;
        ctx.fillRect(centerX + 245, centerY + 143, 2, A4_HEIGHT - 150);

        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(centerX + 246, centerY + 143, 5, 0, Math.PI * 2);
        ctx.arc(centerX + 246, A4_HEIGHT + 40, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    const drawItem = (
        ctx: CanvasRenderingContext2D,
        item: SectionItem,
        x: number,
        y: number,
        maxWidth: number,
        depth: number = 0
    ): number => {
        const indent = depth * 20;
        const bulletX = x + indent;

        if (bulletX + 10 > x + maxWidth) return y + 25;

        // Draw bullet
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(bulletX, y - 3, 2, 0, Math.PI * 2);
        ctx.fill();

        applyTextStyle(ctx, item.style, 14);

        const textX = bulletX + 10;
        const availableWidth = maxWidth - indent - 10;

        const words = item.text.split(" ");
        let line = "";
        let lineY = y;
        const lines: string[] = [];

        // --- WRAP TEXT ---
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + " ";
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > availableWidth && i > 0) {
                lines.push(line.trim());
                line = words[i] + " ";
                lineY += 20;
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        // --- DRAW WITH JUSTIFY ---
        const spaceWidth = ctx.measureText(" ").width;

        lines.forEach((ln, index) => {
            const isLast = index === lines.length - 1;
            const drawY = y + index * 20;

            if (isLast) {
                // Last line: normal left align
                drawTextWithUnderline(ctx, ln, textX, drawY, item.style.underline);
                return;
            }

            const wordsInLine = ln.split(" ");
            const wordCount = wordsInLine.length;
            if (wordCount <= 1) {
                drawTextWithUnderline(ctx, ln, textX, drawY, item.style.underline);
                return;
            }

            const lineWidth = ctx.measureText(ln).width;
            const extraSpace = (availableWidth - lineWidth) / (wordCount - 1);

            let xx = textX;

            wordsInLine.forEach((w) => {
                drawTextWithUnderline(ctx, w, xx, drawY, item.style.underline);

                xx += ctx.measureText(w).width + spaceWidth + extraSpace;
            });
        });

        // Next Y
        let currentY = y + lines.length * 20 + 5;

        if (item.children && item.children.length > 0) {
            item.children.forEach((child) => {
                currentY = drawItem(ctx, child, x, currentY, maxWidth, depth + 1);
            });
        }

        return currentY;
    };


    const drawResizeHandles = (ctx: CanvasRenderingContext2D, layout: SectionLayout, a4OffsetX: number, a4OffsetY: number, isHovered: boolean) => {
        if (!isHovered && !resizeState) return;

        const handles = [
            { x: layout.x, y: layout.y, pos: 'nw' },
            { x: layout.x + layout.width, y: layout.y, pos: 'ne' },
            { x: layout.x, y: layout.y + layout.height, pos: 'sw' },
            { x: layout.x + layout.width, y: layout.y + layout.height, pos: 'se' },
            { x: layout.x + layout.width / 2, y: layout.y, pos: 'n' },
            { x: layout.x + layout.width / 2, y: layout.y + layout.height, pos: 's' },
            { x: layout.x, y: layout.y + layout.height / 2, pos: 'w' },
            { x: layout.x + layout.width, y: layout.y + layout.height / 2, pos: 'e' },
        ];

        handles.forEach(handle => {
            const isHoveredHandle = hoveredHandle === handle.pos;
            ctx.fillStyle = isHoveredHandle ? primaryColor : "#FFFFFF";
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 2;

            ctx.fillRect(
                a4OffsetX + handle.x - HANDLE_SIZE / 2,
                a4OffsetY + handle.y - HANDLE_SIZE / 2,
                HANDLE_SIZE,
                HANDLE_SIZE
            );
            ctx.strokeRect(
                a4OffsetX + handle.x - HANDLE_SIZE / 2,
                a4OffsetY + handle.y - HANDLE_SIZE / 2,
                HANDLE_SIZE,
                HANDLE_SIZE
            );
        });
    };

    const drawImageResizeHandles = (ctx: CanvasRenderingContext2D, state: ImageState, a4OffsetX: number, a4OffsetY: number) => {
        if (!hoveredImage && !imageResizeState && !imageDragState) return;

        const handles = [
            { x: state.x, y: state.y, pos: 'nw' },
            { x: state.x + state.width, y: state.y, pos: 'ne' },
            { x: state.x, y: state.y + state.height, pos: 'sw' },
            { x: state.x + state.width, y: state.y + state.height, pos: 'se' },
            { x: state.x + state.width / 2, y: state.y, pos: 'n' },
            { x: state.x + state.width / 2, y: state.y + state.height, pos: 's' },
            { x: state.x, y: state.y + state.height / 2, pos: 'w' },
            { x: state.x + state.width, y: state.y + state.height / 2, pos: 'e' },
        ];

        handles.forEach(handle => {
            const isHoveredHandle = hoveredImageHandle === handle.pos;
            ctx.fillStyle = isHoveredHandle ? primaryColor : "#FFFFFF";
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 2;

            ctx.fillRect(
                a4OffsetX + handle.x - HANDLE_SIZE / 2,
                a4OffsetY + handle.y - HANDLE_SIZE / 2,
                HANDLE_SIZE,
                HANDLE_SIZE
            );
            ctx.strokeRect(
                a4OffsetX + handle.x - HANDLE_SIZE / 2,
                a4OffsetY + handle.y - HANDLE_SIZE / 2,
                HANDLE_SIZE,
                HANDLE_SIZE
            );
        });
    };

    const drawRoundedImageWithEdit = (
        ctx: CanvasRenderingContext2D,
        img: HTMLImageElement | null,
        state: ImageState,
        a4OffsetX: number,
        a4OffsetY: number
    ) => {
        const x = a4OffsetX + state.x;
        const y = a4OffsetY + state.y;

        ctx.save();

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(x + state.width / 2, y + state.height / 2, Math.min(state.width, state.height) / 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw image with transformations
        if (img && img.complete) {
            ctx.save();

            const centerX = x + state.width / 2;
            const centerY = y + state.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((state.rotation * Math.PI) / 180);

            const scaledWidth = state.width * state.scale;
            const scaledHeight = state.height * state.scale;

            ctx.drawImage(
                img,
                -scaledWidth / 2 + state.offsetX,
                -scaledHeight / 2 + state.offsetY,
                scaledWidth,
                scaledHeight
            );

            ctx.restore();
        } else {
            ctx.fillStyle = "#E5E7EB";
            ctx.fillRect(x, y, state.width, state.height);
        }

        ctx.restore();

        // Draw border
        ctx.beginPath();
        ctx.arc(x + state.width / 2, y + state.height / 2, Math.min(state.width, state.height) / 2, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = primaryColor;
        ctx.stroke();
    };

    const drawCVContent = (ctx: CanvasRenderingContext2D) => {
        const bounds = getA4Bounds();
        if (!bounds) return;

        const { centerX, centerY } = bounds;

        ctx.fillStyle = "#ffffffff";
        ctx.font = "bold 32px Arial";
        ctx.fillText(cvTitle || "Tiêu đề CV", centerX + PADDING, centerY + PADDING);
        ctx.fillStyle = "#ffffffff";
        ctx.font = "18px Arial";
        ctx.fillText(cvSubTitle || "Tiêu đề phụ", centerX + PADDING, centerY + PADDING + 27);

        drawRoundedImageWithEdit(ctx, loadedImage, imageState, centerX, centerY);

        if (!isIcon && (hoveredImage || imageDragState || imageResizeState)) {
            drawImageResizeHandles(ctx, imageState, centerX, centerY);
        }

        sections.forEach((section, index) => {
            const layout = sectionLayouts.get(index);
            if (!layout) return;
            const isHovered = hoveredSection === index;
            const isDragging = dragSection?.sectionIndex === index;
            const isResizing = resizeState?.sectionIndex === index;

            let sectionX = centerX + layout.x;
            let sectionY = centerY + layout.y;

            if (!isIcon && (isHovered || isDragging || isResizing)) {
                ctx.fillStyle = "rgba(174, 174, 174, 0.05)";
                ctx.fillRect(sectionX - 5, sectionY - 5, layout.width + 10, layout.height + 10);

                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(sectionX - 5, sectionY - 5, layout.width + 10, layout.height + 10);
                ctx.setLineDash([]);
            }

            ctx.save();
            ctx.beginPath();
            ctx.rect(sectionX, sectionY, layout.width, layout.height);
            ctx.clip();

            ctx.fillStyle = primaryColor;
            ctx.fillRect(sectionX, sectionY + 30, layout.width, 1);
            ctx.fillStyle = primaryColor;
            ctx.fillRect(sectionX, sectionY, 1, 30);
            ctx.fillStyle = primaryColor;
            ctx.fillRect(sectionX, sectionY, layout.width / 5, 1);

            ctx.fillStyle = primaryColor;
            ctx.font = "17px Arial";
            ctx.fillText(section.title, sectionX + 10, sectionY + 21);
            let itemY = sectionY + 55;

            section.items.forEach((item) => {
                itemY = drawItem(ctx, item, sectionX + 10, itemY, layout.width - 20, 0);
            });

            if (guideLines.x !== null) {
                ctx.strokeStyle = "#ff7b38ff";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(centerX + guideLines.x, centerY);
                ctx.lineTo(centerX + guideLines.x, centerY + A4_HEIGHT);
                ctx.stroke();
            }

            if (guideLines.y !== null) {
                ctx.strokeStyle = "#3f7cffff";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY + guideLines.y);
                ctx.lineTo(centerX + A4_WIDTH, centerY + guideLines.y);
                ctx.stroke();
            }

            ctx.restore();

            if (isHovered || isDragging || isResizing) {
                drawResizeHandles(ctx, layout, centerX, centerY, isHovered);
            }
        });
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
        const canvas = canvasRef?.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const bounds = getA4Bounds();
        if (!bounds) return { x: 0, y: 0 };

        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;

        return {
            x: mouseX - bounds.centerX,
            y: mouseY - bounds.centerY
        };
    };

    const getResizeHandle = (x: number, y: number, layout: SectionLayout): ResizeHandle => {
        const handles = [
            { x: layout.x, y: layout.y, pos: 'nw' as ResizeHandle },
            { x: layout.x + layout.width, y: layout.y, pos: 'ne' as ResizeHandle },
            { x: layout.x, y: layout.y + layout.height, pos: 'sw' as ResizeHandle },
            { x: layout.x + layout.width, y: layout.y + layout.height, pos: 'se' as ResizeHandle },
            { x: layout.x + layout.width / 2, y: layout.y, pos: 'n' as ResizeHandle },
            { x: layout.x + layout.width / 2, y: layout.y + layout.height, pos: 's' as ResizeHandle },
            { x: layout.x, y: layout.y + layout.height / 2, pos: 'w' as ResizeHandle },
            { x: layout.x + layout.width, y: layout.y + layout.height / 2, pos: 'e' as ResizeHandle },
        ];

        for (const handle of handles) {
            const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2));
            if (distance <= HANDLE_SIZE) {
                return handle.pos;
            }
        }

        return null;
    };

    const getImageResizeHandle = (x: number, y: number, state: ImageState): ResizeHandle => {
        const handles = [
            { x: state.x, y: state.y, pos: 'nw' as ResizeHandle },
            { x: state.x + state.width, y: state.y, pos: 'ne' as ResizeHandle },
            { x: state.x, y: state.y + state.height, pos: 'sw' as ResizeHandle },
            { x: state.x + state.width, y: state.y + state.height, pos: 'se' as ResizeHandle },
            { x: state.x + state.width / 2, y: state.y, pos: 'n' as ResizeHandle },
            { x: state.x + state.width / 2, y: state.y + state.height, pos: 's' as ResizeHandle },
            { x: state.x, y: state.y + state.height / 2, pos: 'w' as ResizeHandle },
            { x: state.x + state.width, y: state.y + state.height / 2, pos: 'e' as ResizeHandle },
        ];

        for (const handle of handles) {
            const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2));
            if (distance <= HANDLE_SIZE) {
                return handle.pos;
            }
        }

        return null;
    };

    const getSectionAtPoint = (x: number, y: number): number | null => {
        for (const [index, layout] of sectionLayouts.entries()) {
            if (
                x >= layout.x - 5 &&
                x <= layout.x + layout.width + 5 &&
                y >= layout.y - 5 &&
                y <= layout.y + layout.height + 5
            ) {
                return index;
            }
        }
        return null;
    };

    const getImageAtPoint = (x: number, y: number): boolean => {
        return (
            x >= imageState.x - 5 &&
            x <= imageState.x + imageState.width + 5 &&
            y >= imageState.y - 5 &&
            y <= imageState.y + imageState.height + 5
        );
    };

    const getCursorStyle = (): string => {
        if (isIcon) return 'pointer'
        if (imageDragState) return 'grabbing';
        if (imageResizeState) {
            const cursors: Record<string, string> = {
                'nw': 'nwse-resize', 'se': 'nwse-resize',
                'ne': 'nesw-resize', 'sw': 'nesw-resize',
                'n': 'ns-resize', 's': 'ns-resize',
                'e': 'ew-resize', 'w': 'ew-resize',
            };
            return cursors[imageResizeState.handle!] || 'default';
        }
        if (hoveredImageHandle) {
            const cursors: Record<string, string> = {
                'nw': 'nwse-resize', 'se': 'nwse-resize',
                'ne': 'nesw-resize', 'sw': 'nesw-resize',
                'n': 'ns-resize', 's': 'ns-resize',
                'e': 'ew-resize', 'w': 'ew-resize',
            };
            return cursors[hoveredImageHandle] || 'default';
        }
        if (hoveredImage) return 'move';
        if (dragSection) return 'grabbing';
        if (resizeState) {
            const cursors: Record<string, string> = {
                'nw': 'nwse-resize', 'se': 'nwse-resize',
                'ne': 'nesw-resize', 'sw': 'nesw-resize',
                'n': 'ns-resize', 's': 'ns-resize',
                'e': 'ew-resize', 'w': 'ew-resize',
            };
            return cursors[resizeState.handle!] || 'default';
        }
        if (hoveredHandle) {
            const cursors: Record<string, string> = {
                'nw': 'nwse-resize', 'se': 'nwse-resize',
                'ne': 'nesw-resize', 'sw': 'nesw-resize',
                'n': 'ns-resize', 's': 'ns-resize',
                'e': 'ew-resize', 'w': 'ew-resize',
            };
            return cursors[hoveredHandle] || 'default';
        }
        if (hoveredSection !== null) return 'move';
        if (isPanning) return 'grabbing';
        return 'grab';
    };

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.3));
    const handleResetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setSectionLayouts(new Map());
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isIcon) return;
        const pos = getMousePos(e);
        const isOverImage = getImageAtPoint(pos.x, pos.y);
        setHoveredImage(isOverImage);

        // Check image first
        if (getImageAtPoint(pos.x, pos.y)) {
            const handle = getImageResizeHandle(pos.x, pos.y, imageState);

            if (handle) {
                // Resize frame
                setImageResizeState({
                    handle,
                    startX: pos.x,
                    startY: pos.y,
                    startState: { ...imageState }
                });
            } else if (!isEditingImageInside) {
                // Drag frame (only if not editing inside)
                setImageDragState({
                    sectionIndex: -1,
                    offsetX: pos.x - imageState.x,
                    offsetY: pos.y - imageState.y
                });
            } else {
                // Drag image inside frame
                setImageInternalDragState({
                    startX: pos.x,
                    startY: pos.y
                });
            }
            return;
        }

        const sectionIndex = getSectionAtPoint(pos.x, pos.y);

        if (sectionIndex !== null) {
            const layout = sectionLayouts.get(sectionIndex);
            if (layout) {
                const handle = getResizeHandle(pos.x, pos.y, layout);

                if (handle) {
                    setResizeState({
                        sectionIndex,
                        handle,
                        startX: pos.x,
                        startY: pos.y,
                        startLayout: { ...layout }
                    });
                } else {
                    setDragSection({
                        sectionIndex,
                        offsetX: pos.x - layout.x,
                        offsetY: pos.y - layout.y
                    });
                }
            }
        } else {
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }

    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isIcon) return;

        const pos = getMousePos(e);

        // Handle image inside editing
        if (imageInternalDragState && isEditingImageInside) {
            const deltaX = pos.x - imageInternalDragState.startX;
            const deltaY = pos.y - imageInternalDragState.startY;

            setImageState(prev => ({
                ...prev,
                offsetX: prev.offsetX + deltaX,
                offsetY: prev.offsetY + deltaY
            }));

            setImageInternalDragState({
                startX: pos.x,
                startY: pos.y
            });
            return;
        }

        // Handle image resize
        if (imageResizeState) {
            const deltaX = pos.x - imageResizeState.startX;
            const deltaY = pos.y - imageResizeState.startY;
            const newState = { ...imageResizeState.startState };

            switch (imageResizeState.handle) {
                case 'se':
                    newState.width = Math.max(60, imageResizeState.startState.width + deltaX);
                    newState.height = Math.max(60, imageResizeState.startState.height + deltaY);
                    break;
                case 'sw':
                    newState.x = imageResizeState.startState.x + deltaX;
                    newState.width = Math.max(60, imageResizeState.startState.width - deltaX);
                    newState.height = Math.max(60, imageResizeState.startState.height + deltaY);
                    break;
                case 'ne':
                    newState.y = imageResizeState.startState.y + deltaY;
                    newState.width = Math.max(60, imageResizeState.startState.width + deltaX);
                    newState.height = Math.max(60, imageResizeState.startState.height - deltaY);
                    break;
                case 'nw':
                    newState.x = imageResizeState.startState.x + deltaX;
                    newState.y = imageResizeState.startState.y + deltaY;
                    newState.width = Math.max(60, imageResizeState.startState.width - deltaX);
                    newState.height = Math.max(60, imageResizeState.startState.height - deltaY);
                    break;
                case 'n':
                    newState.y = imageResizeState.startState.y + deltaY;
                    newState.height = Math.max(60, imageResizeState.startState.height - deltaY);
                    break;
                case 's':
                    newState.height = Math.max(60, imageResizeState.startState.height + deltaY);
                    break;
                case 'e':
                    newState.width = Math.max(60, imageResizeState.startState.width + deltaX);
                    break;
                case 'w':
                    newState.x = imageResizeState.startState.x + deltaX;
                    newState.width = Math.max(60, imageResizeState.startState.width - deltaX);
                    break;
            }

            setImageState(newState);
        } else if (imageDragState) {
            const newX = pos.x - imageDragState.offsetX;
            const newY = pos.y - imageDragState.offsetY;

            setImageState(prev => ({
                ...prev,
                x: newX,
                y: newY
            }));
        } else if (resizeState) {
            const deltaX = pos.x - resizeState.startX;
            const deltaY = pos.y - resizeState.startY;

            let newLayout = { ...resizeState.startLayout };

            switch (resizeState.handle) {
                case "e":
                    newLayout.width = Math.max(MIN_SECTION_WIDTH, resizeState.startLayout.width + deltaX);
                    break;

                case "w":
                    newLayout.x = resizeState.startLayout.x + deltaX;
                    newLayout.width = Math.max(MIN_SECTION_WIDTH, resizeState.startLayout.width - deltaX);
                    break;

                case "s":
                    newLayout.height = Math.max(MIN_SECTION_HEIGHT, resizeState.startLayout.height + deltaY);
                    break;

                case "n":
                    newLayout.y = resizeState.startLayout.y + deltaY;
                    newLayout.height = Math.max(MIN_SECTION_HEIGHT, resizeState.startLayout.height - deltaY);
                    break;

                case "se":
                    newLayout.width = Math.max(MIN_SECTION_WIDTH, resizeState.startLayout.width + deltaX);
                    newLayout.height = Math.max(MIN_SECTION_HEIGHT, resizeState.startLayout.height + deltaY);
                    break;

                case "sw":
                    newLayout.x = resizeState.startLayout.x + deltaX;
                    newLayout.width = Math.max(MIN_SECTION_WIDTH, resizeState.startLayout.width - deltaX);
                    newLayout.height = Math.max(MIN_SECTION_HEIGHT, resizeState.startLayout.height + deltaY);
                    break;

                case "ne":
                    newLayout.y = resizeState.startLayout.y + deltaY;
                    newLayout.height = Math.max(MIN_SECTION_HEIGHT, resizeState.startLayout.height - deltaY);
                    newLayout.width = Math.max(MIN_SECTION_WIDTH, resizeState.startLayout.width + deltaX);
                    break;

                case "nw":
                    newLayout.x = resizeState.startLayout.x + deltaX;
                    newLayout.y = resizeState.startLayout.y + deltaY;
                    newLayout.width = Math.max(MIN_SECTION_WIDTH, resizeState.startLayout.width - deltaX);
                    newLayout.height = Math.max(MIN_SECTION_HEIGHT, resizeState.startLayout.height - deltaY);
                    break;
            }

            const edges = {
                left: newLayout.x,
                right: newLayout.x + newLayout.width,
                top: newLayout.y,
                bottom: newLayout.y + newLayout.height,
            };

            const snapped = getSnappedEdges(resizeState.sectionIndex, edges);
            const startRight = resizeState.startLayout.x + resizeState.startLayout.width;
            const startBottom = resizeState.startLayout.y + resizeState.startLayout.height;
            if (resizeState.handle?.includes("w") && snapped.snapLeft != null) {
                newLayout.x = snapped.snapLeft;
                newLayout.width = startRight - snapped.snapLeft;
            }
            if (resizeState.handle?.includes("e") && snapped.snapRight != null) {
                newLayout.width = snapped.snapRight - newLayout.x;
            }
            if (resizeState.handle?.includes("n") && snapped.snapTop != null) {
                newLayout.y = snapped.snapTop;
                newLayout.height = startBottom - snapped.snapTop;
            }
            if (resizeState.handle?.includes("s") && snapped.snapBottom != null) {
                newLayout.height = snapped.snapBottom - newLayout.y;
            }

            const newLayouts = new Map(sectionLayouts);
            newLayouts.set(resizeState.sectionIndex, newLayout);
            setSectionLayouts(newLayouts);
            if (onSectionResize) {
                onSectionResize({
                    id: newLayout.id,
                    width: newLayout.width,
                    height: newLayout.height
                })
            }
            setGuideLines({
                x: snapped.guideX,
                y: snapped.guideY
            });
        } else if (dragSection) {
            const tryX = pos.x - dragSection.offsetX;
            const tryY = pos.y - dragSection.offsetY;

            const snapped = getSnappedPosition(dragSection.sectionIndex, tryX, tryY);

            const layout = sectionLayouts.get(dragSection.sectionIndex);
            if (layout) {
                const newLayouts = new Map(sectionLayouts);
                newLayouts.set(dragSection.sectionIndex, {
                    ...layout,
                    id: layout.id,
                    x: snapped.x,
                    y: snapped.y
                });
                setSectionLayouts(newLayouts);
                if (onSectionDrag) {
                    onSectionDrag({
                        id: layout.id,
                        x: snapped.x,
                        y: snapped.y
                    })
                }
                setGuideLines({ x: snapped.guideX, y: snapped.guideY });
            }
        } else if (isPanning) {
            setPan({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            });
        } else {
            // Check image hover
            const isOverImage = getImageAtPoint(pos.x, pos.y);

            if (isOverImage) {
                const handle = getImageResizeHandle(pos.x, pos.y, imageState);
                setHoveredImageHandle(handle);
                setHoveredSection(null);
                setHoveredHandle(null);
            } else {
                setHoveredImageHandle(null);
                const sectionIndex = getSectionAtPoint(pos.x, pos.y);
                setHoveredSection(sectionIndex);

                if (sectionIndex !== null) {
                    const layout = sectionLayouts.get(sectionIndex);
                    if (layout) {
                        const handle = getResizeHandle(pos.x, pos.y, layout);
                        setHoveredHandle(handle);
                    } else {
                        setHoveredHandle(null);
                    }
                } else {
                    setHoveredHandle(null);
                }
            }
        }
    };

    const handleMouseUp = () => {
        if (isIcon) return;
        setIsPanning(false);
        setDragSection(null);
        setResizeState(null);
        setImageDragState(null);
        setImageResizeState(null);
        setImageInternalDragState(null);
        setGuideLines({ x: null, y: null })
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        if (isIcon) return;
        // If editing inside image, zoom the image instead of canvas
        if (isEditingImageInside && hoveredImage) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newScale = Math.max(0.5, Math.min(3, imageState.scale + delta));

            setImageState(prev => ({
                ...prev,
                scale: newScale
            }));
            return;
        }

        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setZoom((prev) => Math.max(0.3, Math.min(3, prev + delta)));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (isIcon) return;
        if (hoveredImage && e.key.toLowerCase() === 'r') {
            e.preventDefault();
            setImageState(prev => ({
                ...prev,
                rotation: (prev.rotation + 15) % 360
            }));
        }
        if (hoveredImage && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            setImageState(prev => ({
                ...prev,
                rotation: (prev.rotation - 15 + 360) % 360
            }));
        }
    };

    const getSnappedPosition = (sectionIndex: number, newX: number, newY: number) => {
        let snapX = newX;
        let snapY = newY;

        let guideX: number | null = null;
        let guideY: number | null = null;

        const current = sectionLayouts.get(sectionIndex);
        if (!current) return { x: newX, y: newY, guideX, guideY };

        const currentLeft = newX;
        const currentRight = newX + current.width;
        const currentTop = newY;
        const currentBottom = newY + current.height;

        for (const [idx, layout] of sectionLayouts.entries()) {
            if (idx === sectionIndex) continue;

            const left = layout.x;
            const right = layout.x + layout.width;
            const top = layout.y;
            const bottom = layout.y + layout.height;

            if (Math.abs(currentLeft - left) < SNAP_THRESHOLD) {
                snapX = left;
                guideX = left;
            }
            if (Math.abs(currentLeft - right) < SNAP_THRESHOLD) {
                snapX = right;
                guideX = right;
            }
            if (Math.abs(currentRight - right) < SNAP_THRESHOLD) {
                snapX = right - current.width;
                guideX = right;
            }
            if (Math.abs(currentRight - left) < SNAP_THRESHOLD) {
                snapX = left - current.width;
                guideX = left;
            }

            if (Math.abs(currentTop - top) < SNAP_THRESHOLD) {
                snapY = top;
                guideY = top;
            }
            if (Math.abs(currentTop - bottom) < SNAP_THRESHOLD) {
                snapY = bottom;
                guideY = bottom;
            }
            if (Math.abs(currentBottom - bottom) < SNAP_THRESHOLD) {
                snapY = bottom - current.height;
                guideY = bottom;
            }
            if (Math.abs(currentBottom - top) < SNAP_THRESHOLD) {
                snapY = top - current.height;
                guideY = top;
            }
        }

        return { x: snapX, y: snapY, guideX, guideY };
    };
    const getSnappedEdges = (
        sectionIndex: number,
        edges: {
            left: number,
            right: number,
            top: number,
            bottom: number
        }
    ) => {
        let snapLeft: number | null = null;
        let snapRight: number | null = null;
        let snapTop: number | null = null;
        let snapBottom: number | null = null;

        let guideX: number | null = null;
        let guideY: number | null = null;

        for (const [idx, layout] of sectionLayouts.entries()) {
            if (idx === sectionIndex) continue;

            const left = layout.x;
            const right = layout.x + layout.width;
            const top = layout.y;
            const bottom = layout.y + layout.height;

            // ============================
            // LEFT edge snap
            // ============================
            if (Math.abs(edges.left - left) < SNAP_THRESHOLD) {
                snapLeft = left;
                guideX = left;
            }
            if (Math.abs(edges.left - right) < SNAP_THRESHOLD) {
                snapLeft = right;
                guideX = right;
            }

            // ============================
            // RIGHT edge snap
            // ============================
            if (Math.abs(edges.right - left) < SNAP_THRESHOLD) {
                snapRight = left;
                guideX = left;
            }
            if (Math.abs(edges.right - right) < SNAP_THRESHOLD) {
                snapRight = right;
                guideX = right;
            }

            // ============================
            // TOP edge snap
            // ============================
            if (Math.abs(edges.top - top) < SNAP_THRESHOLD) {
                snapTop = top;
                guideY = top;
            }
            if (Math.abs(edges.top - bottom) < SNAP_THRESHOLD) {
                snapTop = bottom;
                guideY = bottom;
            }

            // ============================
            // BOTTOM edge snap
            // ============================
            if (Math.abs(edges.bottom - top) < SNAP_THRESHOLD) {
                snapBottom = top;
                guideY = top;
            }
            if (Math.abs(edges.bottom - bottom) < SNAP_THRESHOLD) {
                snapBottom = bottom;
                guideY = bottom;
            }
        }

        return {
            snapLeft,
            snapRight,
            snapTop,
            snapBottom,
            guideX,
            guideY
        };
    };



    return (
        <div className={`${isIcon ? "" : "flex-1"} relative bg-[#F9FAFB]`} ref={containerRef}>
            <canvas
                ref={isIcon ? iconRef : canvasRef}
                style={{ cursor: getCursorStyle() }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                height={260}
                width={200}
            />

            {/* Zoom Controls */}
            {isIcon ? <></> : <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded transition-all text-gray-700" title="Zoom In">
                    <ZoomIn size={20} />
                </button>
                <div className="h-px bg-gray-200"></div>
                <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded transition-all text-gray-700" title="Zoom Out">
                    <ZoomOut size={20} />
                </button>
                <div className="h-px bg-gray-200"></div>
                <div className="px-2 py-1 text-xs text-gray-600 text-center">
                    {Math.round(zoom * 100)}%
                </div>
            </div>}

            {/* Info */}
            {isIcon ? <></> : <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2">
                <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">A4 Paper</span> • 794 × 1123 px
                </p>
            </div>}

            {/* Instructions */}
            {isEditingImageInside && !isIcon && hoveredImage && (
                <div className="absolute top-20 left-6 bg-white rounded-lg shadow-lg border border-[#0C6A4E] px-4 py-2">
                    <h3 className="font-semibold text-[#0C6A4E] text-sm mb-2">Editing Image Inside</h3>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E]">
                        <Move size={16} />
                        <span className="font-medium">Move</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E] mt-1">
                        <span className="font-medium">Scroll to zoom</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E] mt-1">
                        <span className="font-medium">R/L: Rotate</span>
                    </div>
                    <button
                        onClick={() => setIsEditingImageInside(false)}
                        className="mt-3 w-full px-3 py-2 bg-[#0C6A4E] text-white rounded text-xs hover:bg-opacity-90 font-medium"
                    >
                        Done
                    </button>
                </div>
            )}

            {!isEditingImageInside && hoveredImage && (
                <div className="absolute top-20 left-6 bg-white rounded-lg shadow-lg border border-[#0C6A4E] px-4 py-2">
                    <h3 className="font-semibold text-[#0C6A4E] text-sm mb-2">Edit Frame</h3>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E]">
                        <Move size={16} />
                        <span className="font-medium">Move</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E] mt-1">
                        <Maximize size={16} />
                        <span className="font-medium">Resize</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E] mt-1">
                        <span className="font-medium">R/L: Rotate image</span>
                    </div>
                    <button
                        onClick={() => setIsEditingImageInside(true)}
                        className="mt-3 w-full px-3 py-2 bg-[#0C6A4E] text-white rounded text-xs hover:bg-opacity-90 font-medium"
                    >
                        Edit Image Inside
                    </button>
                </div>
            )}

            {hoveredSection !== null && !dragSection && !resizeState && (
                <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg border border-[#0C6A4E] px-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E]">
                        <Move size={16} />
                        <span className="font-medium">Drag to move</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0C6A4E] mt-1">
                        <Maximize size={16} />
                        <span className="font-medium">Use handles to resize</span>
                    </div>
                </div>
            )}
        </div>
    );
}