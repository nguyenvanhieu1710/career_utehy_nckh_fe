"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, Check, X, PanelLeftClose, PanelLeftOpen, Bold, Italic, Underline, Palette, Layers } from "lucide-react";
import Button from "@/components/ui/Button";
import { SectionSize } from "../[cv_id]/page";
import { Input } from "@/components/ui/input";
import { ImageState } from "./Canvas";
import Link from "next/link";
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

export interface Section {
    id: string;
    title: string;
    /** Optional override for the section title color on the canvas. */
    titleColor?: string;
    open: boolean;
    items: SectionItem[];
    adding: boolean;
    editingIndex: number | null;
    x: number;
    y: number;
    size: SectionSize;
}

interface CVToolBoxProps {
    cv_id: string;
    // Kept for type-compat with [cv_id]/page.tsx — the right info panel is now
    // the authoritative editor for these. We accept them so the parent doesn't
    // need a separate prop split; we just don't render UI for them.
    cvTitle?: string;
    cvSubTitle?: string;
    onImageSelected?: (url: string) => void;
    onCVColorChange?: (color: string) => void;
    cvColor?: string;
    titleStyle?: string;
    subtitleStyle?: string;
    hasAvatar?: boolean;
    setHasAvatar?: Dispatch<SetStateAction<boolean>>;
    avatarStyle?: string;
    imageURL?: string;
    setCvTitle?: Dispatch<SetStateAction<string>>;
    setCvSubTitle?: Dispatch<SetStateAction<string>>;
    projectName?: string;
    setProjectName?: Dispatch<SetStateAction<string>>;
    cvCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
    imageState?: ImageState;
    // Used by this slim toolbox:
    onSectionLocationChange: (data: { id: string, field: string, value: number }) => void;
    sections: Section[];
    setSections: Dispatch<SetStateAction<Section[]>>;
}

export default function CVToolBox({
    projectName,
    sections,
    setSections,
    onSectionLocationChange,
}: CVToolBoxProps) {
    const [extend, setExtend] = useState<boolean>(true);
    const [showColorPicker, setShowColorPicker] = useState<{ sectionIndex: number, itemIndex: number[], show: boolean } | null>(null);

    const defaultStyle: TextStyle = {
        bold: false,
        italic: false,
        underline: false,
        color: "#374151"
    };

    const createNewItem = (): SectionItem => ({
        text: "",
        editing: false,
        tempText: "",
        style: { ...defaultStyle },
        children: [],
        expanded: true
    });

    // ── Section-level CRUD ───────────────────────────────────────────────
    // Build a slug-style id that won't collide with existing sections.
    const makeSectionId = (base: string, existing: Section[]): string => {
        const slug = (base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) || "section";
        const taken = new Set(existing.map(s => s.id));
        if (!taken.has(slug)) return slug;
        let n = 2;
        while (taken.has(`${slug}-${n}`)) n++;
        return `${slug}-${n}`;
    };

    const handleAddSection = (): void => {
        setSections(prev => {
            // Stack new sections at the bottom of the right column by default
            // so they don't land on top of the existing content. Right-column
            // x = 270 mirrors `defaultSections` in [cv_id]/page.tsx.
            const bottomY = prev.reduce((max, s) => Math.max(max, s.y + s.size.height), 140);
            const title = "Mục mới";
            const newSection: Section = {
                id: makeSectionId(title, prev),
                title,
                open: true,
                items: [],
                adding: false,
                editingIndex: null,
                x: 270,
                y: bottomY + 20,
                size: { width: 500, height: 200 },
            };
            return [...prev, newSection];
        });
    };

    const handleDeleteSection = (sectionIndex: number): void => {
        const section = sections[sectionIndex];
        if (!section) return;
        const ok = typeof window === "undefined"
            ? true
            : window.confirm(`Xóa mục "${section.title}"? Toàn bộ nội dung trong mục sẽ bị xóa.`);
        if (!ok) return;
        setSections(prev => prev.filter((_, i) => i !== sectionIndex));
    };

    const handleAddLine = (index: number): void => {
        const newSections = [...sections];
        newSections[index].adding = true;
        setSections(newSections);
    };

    const handleAddChild = (sectionIndex: number, itemPath: number[]): void => {
        const newSections = [...sections];
        let targetItem = newSections[sectionIndex].items[itemPath[0]];

        for (let i = 1; i < itemPath.length; i++) {
            targetItem = targetItem.children[itemPath[i]];
        }

        const newChild = createNewItem();
        newChild.editing = true;
        targetItem.children.push(newChild);
        targetItem.expanded = true;

        setSections(newSections);
    };

    const handleSaveLine = (index: number, value: string): void => {
        if (!value.trim()) {
            sections[index].adding = false;
            setSections([...sections]);
            return;
        }

        const newItem = createNewItem();
        newItem.text = value;
        sections[index].items.push(newItem);
        sections[index].adding = false;
        setSections([...sections]);
    };

    const getItemByPath = (sectionIndex: number, itemPath: number[]) => {
        let item = sections[sectionIndex].items[itemPath[0]];
        for (let i = 1; i < itemPath.length; i++) {
            item = item.children[itemPath[i]];
        }
        return item;
    };

    const handleSectionEditLocation = (id: string, field: string, value: number) => {
        onSectionLocationChange({ id, field, value });
    };

    const handleStartEditLine = (sectionIndex: number, itemPath: number[]): void => {
        const newSections = [...sections];
        const item = getItemByPath(sectionIndex, itemPath);
        item.tempText = item.text;
        item.editing = true;
        setSections(newSections);
    };

    const handleSaveEditLine = (sectionIndex: number, itemPath: number[], value: string): void => {
        const newSections = [...sections];
        const item = getItemByPath(sectionIndex, itemPath);
        if (value.trim()) {
            item.text = value;
        }
        item.editing = false;
        item.tempText = "";
        setSections(newSections);
    };

    const handleCancelEditLine = (sectionIndex: number, itemPath: number[]): void => {
        const newSections = [...sections];
        const item = getItemByPath(sectionIndex, itemPath);
        item.editing = false;
        item.tempText = "";
        setSections(newSections);
    };

    const handleDeleteLine = (sectionIndex: number, itemPath: number[]): void => {
        const newSections = [...sections];

        if (itemPath.length === 1) {
            newSections[sectionIndex].items.splice(itemPath[0], 1);
        } else {
            let parentItem = newSections[sectionIndex].items[itemPath[0]];
            for (let i = 1; i < itemPath.length - 1; i++) {
                parentItem = parentItem.children[itemPath[i]];
            }
            parentItem.children.splice(itemPath[itemPath.length - 1], 1);
        }

        setSections(newSections);
    };

    const toggleItemExpanded = (sectionIndex: number, itemPath: number[]): void => {
        const newSections = [...sections];
        const item = getItemByPath(sectionIndex, itemPath);
        item.expanded = !item.expanded;
        setSections(newSections);
    };

    const toggleStyle = (sectionIndex: number, itemPath: number[], styleType: 'bold' | 'italic' | 'underline'): void => {
        const newSections = [...sections];
        const item = getItemByPath(sectionIndex, itemPath);
        item.style[styleType] = !item.style[styleType];
        setSections(newSections);
    };

    const changeColor = (sectionIndex: number, itemPath: number[], color: string): void => {
        const newSections = [...sections];
        const item = getItemByPath(sectionIndex, itemPath);
        item.style.color = color;
        setSections(newSections);
        setShowColorPicker(null);
    };

    const toggleSection = (index: number): void => {
        sections[index].open = !sections[index].open;
        setSections([...sections]);
    };

    const renderItem = (item: SectionItem, sectionIndex: number, itemPath: number[], depth: number = 0) => {
        const hasChildren = item.children?.length > 0;
        const textStyle = {
            fontWeight: item.style?.bold ? 'bold' : 'normal',
            fontStyle: item.style?.italic ? 'italic' : 'normal',
            textDecoration: item.style?.underline ? 'underline' : 'none',
            color: item.style?.color
        };

        return (
            <div key={itemPath.join('-')} className="group">
                {item.editing ? (
                    <div className="flex flex-col gap-2 pl-2">
                        <textarea
                            className="flex-1 bg-white border border-gray-300 px-3 py-1.5 text-sm rounded-md text-gray-800 placeholder-gray-400 focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20 outline-none transition-all"
                            value={item.tempText}
                            onChange={(e) => {
                                const newSections = [...sections];
                                const targetItem = getItemByPath(sectionIndex, itemPath);
                                targetItem.tempText = e.target.value;
                                setSections(newSections);
                            }}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSaveEditLine(sectionIndex, itemPath, item.tempText);
                                }
                                if (e.key === "Escape") {
                                    handleCancelEditLine(sectionIndex, itemPath);
                                }
                            }}
                        />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleSaveEditLine(sectionIndex, itemPath, item.tempText)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-all"
                            >
                                <Check size={14} />
                            </button>
                            <button
                                onClick={() => handleCancelEditLine(sectionIndex, itemPath)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-between pl-2 py-1.5 hover:bg-white transition-all group-hover:[border-left:2px_dashed_#777777ff]">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="text-sm flex-1" style={textStyle}>
                                <span className="text-[#0C6A4E] mr-2">•</span>
                                {item.text}
                            </div>
                            {hasChildren && (
                                <button
                                    onClick={() => toggleItemExpanded(sectionIndex, itemPath)}
                                    className="p-0.5 hover:bg-gray-200 rounded"
                                >
                                    {item.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Style buttons */}
                            <button
                                onClick={() => toggleStyle(sectionIndex, itemPath, 'bold')}
                                className={`p-1.5 rounded transition-all ${item.style?.bold ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="Bold"
                            >
                                <Bold size={12} />
                            </button>
                            <button
                                onClick={() => toggleStyle(sectionIndex, itemPath, 'italic')}
                                className={`p-1.5 rounded transition-all ${item.style?.italic ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="Italic"
                            >
                                <Italic size={12} />
                            </button>
                            <button
                                onClick={() => toggleStyle(sectionIndex, itemPath, 'underline')}
                                className={`p-1.5 rounded transition-all ${item.style?.underline ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="Underline"
                            >
                                <Underline size={12} />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowColorPicker({ sectionIndex, itemIndex: itemPath, show: true })}
                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-all"
                                    title="Color"
                                >
                                    <Palette size={12} />
                                </button>
                                {showColorPicker?.sectionIndex === sectionIndex &&
                                    JSON.stringify(showColorPicker.itemIndex) === JSON.stringify(itemPath) &&
                                    showColorPicker.show && (
                                        <div className="w-20 absolute right-0 mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex gap-1 flex-wrap">
                                            {['#374151', '#0C6A4E', '#DC2626', '#2563EB', '#7C3AED', '#EA580C', "#FFF"].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => changeColor(sectionIndex, itemPath, color)}
                                                    className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 transition-all"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <button
                                                onClick={() => setShowColorPicker(null)}
                                                className="ml-1 p-1 hover:bg-gray-100 rounded"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                            </div>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button
                                onClick={() => handleAddChild(sectionIndex, itemPath)}
                                className="p-1.5 text-[#0C6A4E] hover:bg-[#0C6A4E]/10 rounded transition-all"
                                title="Add child"
                            >
                                <Plus size={12} />
                            </button>
                            <button
                                onClick={() => handleStartEditLine(sectionIndex, itemPath)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                            >
                                <Edit2 size={12} />
                            </button>
                            <button
                                onClick={() => handleDeleteLine(sectionIndex, itemPath)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Render children */}
                {hasChildren && item.expanded && (
                    <div className="ml-1">
                        {item.children.map((child, childIndex) =>
                            renderItem(child, sectionIndex, [...itemPath, childIndex], depth + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`${extend ? "flex-3" : "w-20"} border-r border-gray-200 p-6 flex flex-col gap-6 ${extend ? "bg-white" : "bg-[#0C6A4E]"} h-screen text-gray-800 overflow-y-auto transition-all`}>

            <div className="flex items-center justify-between">
                {extend ? <div>
                    <Link href={"/"}>
                        <img className="w-[70%]" src={"/logo/header_logo.jpg"} alt="Logo" />
                    </Link>
                </div> : <></>}
                <div>
                    <Button
                        backgroundColor="transparent"
                        iconLeft={extend ? <PanelLeftClose color="#0C6A4E" /> : <PanelLeftOpen color="#ffffff" />}
                        onClick={() => setExtend(!extend)}
                        border="none"
                    />
                </div>
            </div>

            {extend ? (
                <>
                    {/* Header strip — context only; CV-level edits live in the right panel */}
                    <div className="flex items-center gap-2 bg-[#0C6A4E]/5 border border-[#0C6A4E]/10 rounded-lg px-3 py-2">
                        <div className="w-8 h-8 rounded-md bg-[#0C6A4E] text-white flex items-center justify-center">
                            <Layers size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                                Đang chỉnh
                            </p>
                            <p className="text-sm font-semibold text-gray-800 truncate">{projectName || "CV"}</p>
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed">
                        Đây là khu vực <strong>sắp xếp nội dung</strong> các mục trong CV. Tên CV, màu sắc, ảnh và tiêu đề
                        được chỉnh ở panel <span className="text-[#0C6A4E] font-medium">Thông tin CV</span> bên phải.
                    </p>

                    {/* ----- SECTIONS LIST ----- */}
                    <div className="flex flex-col gap-3">
                        {sections.map((section, index) => (
                            <div
                                key={section.id || index}
                                className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-1 group px-3 py-2 border-b border-gray-100">
                                    <button
                                        onClick={() => toggleSection(index)}
                                        className="flex-1 flex items-center justify-between text-left cursor-pointer"
                                    >
                                        <h3 className="font-semibold text-sm text-[#0C6A4E] group-hover:text-[#0A5940] transition-colors truncate">
                                            {section.title || "(Chưa đặt tên)"}
                                        </h3>
                                        {section.open ? (
                                            <ChevronDown
                                                size={18}
                                                className="text-gray-500 group-hover:text-[#0C6A4E] transition-colors"
                                            />
                                        ) : (
                                            <ChevronRight
                                                size={18}
                                                className="text-gray-500 group-hover:text-[#0C6A4E] transition-colors"
                                            />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSection(index)}
                                        className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                                        title="Xóa mục này"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {section.open && (
                                    <div className="px-3 py-3 flex flex-col gap-2">
                                        {/* Section meta — name + position (X / Y) */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <label className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase tracking-wider text-gray-500">
                                                    Tên
                                                </span>
                                                <Input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={(event) =>
                                                        setSections((prev) =>
                                                            prev.map((sec) =>
                                                                sec.id === section.id
                                                                    ? { ...sec, title: event.target.value }
                                                                    : sec,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase tracking-wider text-gray-500">X</span>
                                                <Input
                                                    type="number"
                                                    value={section.x.toFixed(2)}
                                                    onChange={(event) =>
                                                        handleSectionEditLocation(
                                                            section.id,
                                                            "x",
                                                            Number(event.target.value),
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase tracking-wider text-gray-500">Y</span>
                                                <Input
                                                    type="number"
                                                    value={section.y.toFixed(2)}
                                                    onChange={(event) =>
                                                        handleSectionEditLocation(
                                                            section.id,
                                                            "y",
                                                            Number(event.target.value),
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>

                                        {/* Section title color */}
                                        <div className=" items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
                                            <span className="text-[10px] uppercase tracking-wider text-gray-500 shrink-0">
                                                Màu tiêu đề
                                            </span>
                                            <div className="flex items-center gap-1 ml-auto">
                                                {["#111827", "#0C6A4E", "#DC2626", "#2563EB", "#7C3AED", "#EA580C", "#FFFFFF"].map((c) => {
                                                    const active = (section.titleColor || "").toLowerCase() === c.toLowerCase();
                                                    return (
                                                        <button
                                                            key={c}
                                                            onClick={() =>
                                                                setSections((prev) =>
                                                                    prev.map((sec) =>
                                                                        sec.id === section.id
                                                                            ? { ...sec, titleColor: c }
                                                                            : sec,
                                                                    ),
                                                                )
                                                            }
                                                            className={`w-5 h-5 rounded-full border transition-all ${
                                                                active
                                                                    ? "ring-2 ring-offset-1 ring-[#0C6A4E] border-white"
                                                                    : "border-gray-300 hover:scale-110"
                                                            }`}
                                                            style={{ backgroundColor: c }}
                                                            title={c}
                                                        />
                                                    );
                                                })}
                                                <input
                                                    type="color"
                                                    value={(section.titleColor || "#111827").slice(0, 7)}
                                                    onChange={(e) =>
                                                        setSections((prev) =>
                                                            prev.map((sec) =>
                                                                sec.id === section.id
                                                                    ? { ...sec, titleColor: e.target.value }
                                                                    : sec,
                                                            ),
                                                        )
                                                    }
                                                    className="w-6 h-6 rounded cursor-pointer bg-transparent border border-gray-200"
                                                    title="Chọn màu tùy chỉnh"
                                                />
                                                {section.titleColor && (
                                                    <button
                                                        onClick={() =>
                                                            setSections((prev) =>
                                                                prev.map((sec) =>
                                                                    sec.id === section.id
                                                                        ? { ...sec, titleColor: undefined }
                                                                        : sec,
                                                                ),
                                                            )
                                                        }
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                        title="Dùng màu mặc định"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {section.items.map((item, i) => renderItem(item, index, [i], 0))}

                                        {!section.adding ? (
                                            <button
                                                onClick={() => handleAddLine(index)}
                                                className="flex items-center gap-2 text-sm pl-2 py-2 text-gray-600 hover:bg-gray-50 rounded transition-all group"
                                            >
                                                <span className="group-hover:text-[#0C6A4E]">Thêm dòng</span>
                                                <div className="flex w-5 h-5 rounded-full bg-gray-100 items-center justify-center group-hover:bg-[#0C6A4E]/10 transition-all">
                                                    <Plus
                                                        size={14}
                                                        className="text-gray-600 group-hover:text-[#0C6A4E]"
                                                    />
                                                </div>
                                            </button>
                                        ) : (
                                            <div className="pl-2">
                                                <textarea
                                                    className="w-full bg-white border border-gray-300 px-3 py-1.5 text-sm rounded-md text-gray-800 placeholder-gray-400 focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20 outline-none transition-all"
                                                    placeholder="Nhập nội dung..."
                                                    autoFocus
                                                    onBlur={(e) => handleSaveLine(index, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            handleSaveLine(
                                                                index,
                                                                (e.target as HTMLInputElement).value,
                                                            );
                                                        }
                                                        if (e.key === "Escape") {
                                                            const newSections = [...sections];
                                                            newSections[index].adding = false;
                                                            setSections(newSections);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* ----- ADD NEW SECTION ----- */}
                        <button
                            onClick={handleAddSection}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border-2 border-dashed border-[#0C6A4E]/40 text-[#0C6A4E] bg-[#0C6A4E]/5 hover:bg-[#0C6A4E]/10 hover:border-[#0C6A4E] transition-all"
                        >
                            <Plus size={16} /> Thêm mục mới
                        </button>
                    </div>
                </>
            ) : (
                <></>
            )}
        </div>
    );
}
