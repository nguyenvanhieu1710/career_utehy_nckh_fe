"use client";

import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, Check, X, Download, Eye, PanelLeftClose, PanelLeftOpen, Bold, Italic, Underline, Palette, ImageUp, PaintBucket, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { SectionSize } from "../[cv_id]/page";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import TextField from "@/components/ui/TextField";
import { jsPDF } from 'jspdf'
import { generatePDFFromState, getFullCVState, ImageState } from "./Canvas";
import { cvAPI } from "@/services/cv";
import { toast } from "sonner";
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
    cvTitle: string;
    cvSubTitle: string;
    onImageSelected: (url: string) => void;
    onCVColorChange: (color: string) => void;
    cvColor: string,
    imageURL?: string,
    onSectionLocationChange: (data: { id: string, field: string, value: number }) => void;
    setCvTitle: Dispatch<SetStateAction<string>>;
    setCvSubTitle: Dispatch<SetStateAction<string>>;
    projectName: string;
    setProjectName: Dispatch<SetStateAction<string>>;
    sections: Section[];
    setSections: Dispatch<SetStateAction<Section[]>>;
    cvCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    imageState: ImageState
}

export default function CVToolBox({
    cv_id,
    cvTitle,
    cvColor,
    imageURL,
    onImageSelected,
    onCVColorChange,
    cvSubTitle,
    setCvTitle,
    setCvSubTitle,
    projectName,
    setProjectName,
    sections,
    setSections,
    onSectionLocationChange,
    cvCanvasRef,
    imageState,
}: CVToolBoxProps) {
    const [editingName, setEditingName] = useState<boolean>(false);
    const [tempProjectName, setTempProjectName] = useState<string>("");
    const [extend, setExtend] = useState<boolean>(true);
    const [showColorPicker, setShowColorPicker] = useState<{ sectionIndex: number, itemIndex: number[], show: boolean } | null>(null);

    const defaultStyle: TextStyle = {
        bold: false,
        italic: false,
        underline: false,
        color: "#374151"
    };



    const handleStartEditName = (): void => {
        setTempProjectName(projectName);
        setEditingName(true);
    };

    const handleSaveProjectName = (): void => {
        if (tempProjectName.trim()) {
            setProjectName(tempProjectName);
        }
        setEditingName(false);
        handleSave();
    };

    const handleCancelEditName = (): void => {
        setTempProjectName("");
        setEditingName(false);
    };

    const createNewItem = (): SectionItem => ({
        text: "",
        editing: false,
        tempText: "",
        style: { ...defaultStyle },
        children: [],
        expanded: true
    });

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
        handleSave();

    };

    const getItemByPath = (sectionIndex: number, itemPath: number[]) => {
        let item = sections[sectionIndex].items[itemPath[0]];
        for (let i = 1; i < itemPath.length; i++) {
            item = item.children[itemPath[i]];
        }
        return item;
    };

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        onImageSelected(url);
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
        handleSave();
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

    const changeCVColor = (color: string): void => {
        onCVColorChange(color);
    };


    const toggleSection = (index: number): void => {
        sections[index].open = !sections[index].open;
        setSections([...sections]);
    };

    const handleDownload = (): void => {
        const cvState = getFullCVState(
            cvTitle,
            cvSubTitle,
            cvColor,
            imageURL,
            imageState,
            sections,
            projectName
        );
        generatePDFFromState(cvState);
    };
    const handleSave = (): void => {
        const cvState = getFullCVState(
            cvTitle,
            cvSubTitle,
            cvColor,
            imageURL,
            imageState,
            sections,
            projectName
        );

        cvAPI.update({
            id: cv_id,
            primary_color: cvState.primaryColor,
            sections: JSON.stringify(cvState.sections),
            title: cvState.cvTitle,
            subtitle: cvState.cvSubTitle,
            name: cvState.projectName
        }).then(res => {
            toast.success('Saved!')
        }).catch(err => { })
    };

    const renderItem = (item: SectionItem, sectionIndex: number, itemPath: number[], depth: number = 0) => {
        const hasChildren = item.children.length > 0;
        const textStyle = {
            fontWeight: item.style.bold ? 'bold' : 'normal',
            fontStyle: item.style.italic ? 'italic' : 'normal',
            textDecoration: item.style.underline ? 'underline' : 'none',
            color: item.style.color
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
                                className={`p-1.5 rounded transition-all ${item.style.bold ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="Bold"
                            >
                                <Bold size={12} />
                            </button>
                            <button
                                onClick={() => toggleStyle(sectionIndex, itemPath, 'italic')}
                                className={`p-1.5 rounded transition-all ${item.style.italic ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="Italic"
                            >
                                <Italic size={12} />
                            </button>
                            <button
                                onClick={() => toggleStyle(sectionIndex, itemPath, 'underline')}
                                className={`p-1.5 rounded transition-all ${item.style.underline ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
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
                    <img className="w-[70%]" src={"/logo/header_logo.jpg"} alt="Logo" />
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

            {extend ? <>
                {/* ----- PROJECT NAME ----- */}
                <div className="flex bg-gray-50 border border-gray-200 p-3 rounded-lg items-center shadow-sm hover:shadow-md transition-all">
                    <div className="flex-1">
                        {editingName ? (
                            <div className="relative flex items-center gap-2">
                                <input
                                    className="flex-1 bg-white border border-gray-300 outline-none px-3 py-2 rounded-md text-gray-800 placeholder-gray-400 focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20 transition-all"
                                    value={tempProjectName}
                                    onChange={(e) => { setTempProjectName(e.target.value); }}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") { handleSaveProjectName(); handleSave() };
                                        if (e.key === "Escape") { handleCancelEditName(); handleSave() };
                                    }}
                                />
                                <button
                                    onClick={handleSaveProjectName}
                                    className="absolute right-1 p-1.5 text-green-600 hover:bg-green-50 rounded transition-all"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    onClick={handleCancelEditName}
                                    className="absolute right-6 p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {projectName}
                                </h2>
                                <button
                                    onClick={handleStartEditName}
                                    className="p-1.5 text-[#0C6A4E] hover:bg-[#0C6A4E]/10 rounded transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ----- CV TITLE INPUT ----- */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Ảnh CV</label>
                    <div className="flex gap-1 border border-gray-300 px-3 py-2 rounded-md text-gray-800 placeholder-gray-400 focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20 outline-none transition-all">
                        <ImageUp />
                        <input
                            type="file"
                            className="w-full bg-white "
                            onChange={handleUploadImage}
                            accept="image/*"
                        />
                    </div>
                </div>
                <div className="w-full mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex gap-1 items-center">
                    {['#374151', '#0C6A4E', '#DC2626', '#2563EB', '#7C3AED', '#EA580C'].map(color => (
                        <button
                            key={color}
                            onClick={() => changeCVColor(color)}
                            className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 transition-all"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    <div className="flex gap-1 items-center border rounded shadow-sm pl-1 pr-1">
                        <input
                            type="color"
                            className="w-9 h-8 border-none outline-none"
                            onChange={(e) => changeCVColor(e.target.value)}
                        />
                        <PaintBucket size={16} />

                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Tiêu đề CV</label>
                    <input
                        type="text"
                        className="w-full bg-white border border-gray-300 px-3 py-2 rounded-md text-gray-800 placeholder-gray-400 focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20 outline-none transition-all"
                        placeholder="Nhập tiêu đề CV của bạn..."
                        value={cvTitle}
                        onChange={(e) => setCvTitle(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Tiêu đề phụ</label>
                    <input
                        type="text"
                        className="w-full bg-white border border-gray-300 px-3 py-2 rounded-md text-gray-800 placeholder-gray-400 focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20 outline-none transition-all"
                        placeholder="Nhập tiêu đề phụ..."
                        value={cvSubTitle}
                        onChange={(e) => setCvSubTitle(e.target.value)}
                    />
                </div>
                {/* ----- ACTION BUTTONS ----- */}
                <div className="flex gap-3">
                    <Button
                        flex={2}
                        onClick={handleSave}
                        value="Lưu"
                        iconLeft={<Save size={18} />}
                        border="2px solid #0C6A4E"
                        backgroundColor="white"
                        color="#0C6A4E"
                    />
                    <div className="flex flex-3 bg-[#0C6A4E] rounded-lg">
                        <Button
                            flex={3}
                            onClick={handleDownload}
                            iconLeft={<Download size={18} />}
                            backgroundColor="transparent"
                            border="none"
                            value="Tải về"
                        />
                        <Button
                            iconLeft={<ChevronDown size={18} />}
                            backgroundColor="transparent"
                            border="none"
                            flex={1}
                        />
                    </div>
                </div>

                {/* ----- SECTIONS LIST ----- */}
                <div className="flex flex-col gap-4">
                    {sections.map((section, index) => (
                        <div key={index} className="flex flex-col bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                            <div
                                className="flex items-center justify-between cursor-pointer group"
                                onClick={() => toggleSection(index)}
                            >
                                <h3 className="font-semibold text-base text-[#0C6A4E] group-hover:text-[#0A5940] transition-colors">
                                    {section.title}
                                </h3>

                                {section.open ? (
                                    <ChevronDown size={20} className="text-gray-500 group-hover:text-[#0C6A4E] transition-colors" />
                                ) : (
                                    <ChevronRight size={20} className="text-gray-500 group-hover:text-[#0C6A4E] transition-colors" />
                                )}
                            </div>

                            {section.open && (
                                <div className="mt-3 flex flex-col gap-2">
                                    <div>
                                        <div className="flex gap-1">
                                            <div className="flex items-center"><label className="text-[11px]">X:</label><Input type="number" value={section.x.toFixed(2)} onChange={(event) => handleSectionEditLocation(section.id, 'x', Number(event.target.value))} /></div>
                                            <div className="flex items-center"><label className="text-[11px]">Y:</label><Input type="number" value={section.y.toFixed(2)} onChange={(event) => handleSectionEditLocation(section.id, 'y', Number(event.target.value))} /></div>
                                        </div>
                                    </div>
                                    {section.items.map((item, i) =>
                                        renderItem(item, index, [i], 0)
                                    )}

                                    {!section.adding ? (
                                        <button
                                            onClick={() => handleAddLine(index)}
                                            className="flex items-center gap-2 text-sm pl-2 py-2 text-gray-600 hover:bg-white rounded transition-all group"
                                        >
                                            <span className="group-hover:text-[#0C6A4E]">Add item</span>
                                            <div className="flex w-5 h-5 rounded-full bg-gray-200 items-center justify-center group-hover:bg-[#0C6A4E]/10 transition-all">
                                                <Plus size={14} className="text-gray-600 group-hover:text-[#0C6A4E]" />
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="pl-2">
                                            <textarea
                                                className="w-full bg-white border border-gray-300 px-3 py-1.5 text-sm rounded-md text-gray-800 placeholder-gray-400 focus:border-[#0C6A4E] focus:ring-2 focus:ring-[#0C6A4E]/20 outline-none transition-all"
                                                placeholder="Enter content..."
                                                autoFocus
                                                onBlur={(e) => handleSaveLine(index, e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleSaveLine(index, (e.target as HTMLInputElement).value);
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
                </div>
            </> : <></>}
        </div>
    );
}