"use client";

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { useEffect, useState } from 'react';
import CVCanvas, { ImageState } from './components/Canvas';
import { ArrowDownWideNarrow, FilePlus, Loader2, Upload } from 'lucide-react';
import { cvAPI } from '@/services/cv';
import Loader from '@/components/ui/Loader';
import { CVProfile } from '@/types/cv';
import { Section, SectionItem } from './components/ToolBox';
const guideItem = (text: string): SectionItem => ({
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
export const DEFAULT_SECTIONS: Section[] = [
    {
        id: "about",
        title: "About Me",
        open: true,
        items: [
            guideItem("Write a short introduction about yourself (2–3 sentences)."),
            guideItem("Example: A passionate frontend developer with 2+ years of experience..."),
        ],
        adding: false,
        editingIndex: null,
        x: 270,
        y: 140,
        size: { width: 500, height: 170 },
    },

    {
        id: "contact",
        title: "Contact",
        open: true,
        items: [
            guideItem("your.email@example.com"),
            guideItem("(+84) 0123 456 789"),
            guideItem("City, Country"),
            guideItem("Website"),
        ],
        adding: false,
        editingIndex: null,
        x: 20,
        y: 310,
        size: { width: 200, height: 200 },
    },

    {
        id: "experience",
        title: "Experience",
        open: true,
        items: [
            guideItem("Add your job experience in reverse chronological order:"),

            guideItem("• Position — Company — Time period"),
            guideItem("• Key responsibilities or achievements (2–4 bullet points)"),
        ],
        adding: false,
        editingIndex: null,
        x: 270,
        y: 310,
        size: { width: 500, height: 400 },
    },

    {
        id: "education",
        title: "Education",
        open: true,
        items: [
            guideItem("List your degrees or academic background:"),
            guideItem("• School / University name"),
            guideItem("• Major / Degree"),
            guideItem("• Duration (e.g., 2018–2022)"),
        ],
        adding: false,
        editingIndex: null,
        x: 270,
        y: 710,
        size: { width: 500, height: 550 },
    },

    {
        id: "language",
        title: "Language",
        open: true,
        items: [
            guideItem("List the languages you can speak, with proficiency levels:"),
            guideItem("• English — Intermediate"),
            guideItem("• Vietnamese — Native"),
        ],
        adding: false,
        editingIndex: null,
        x: 20,
        y: 510,
        size: { width: 200, height: 200 },
    },

    {
        id: "skills",
        title: "Skills",
        open: true,
        items: [
            guideItem("List your strongest skills:"),
            guideItem("• JavaScript, React, Node.js"),
            guideItem("• Problem solving, teamwork"),
        ],
        adding: false,
        editingIndex: null,
        x: 20,
        y: 710,
        size: { width: 200, height: 200 },
    },
];

export const DEFAULT_SECTIONS_VI: Section[] = [
    {
        id: "about",
        title: "Giới thiệu",
        open: true,
        items: [
            guideItem("Viết vài dòng mô tả ngắn gọn về bản thân."),
            guideItem("Ví dụ: Tôi là một lập trình viên frontend với hơn 2 năm kinh nghiệm…"),
        ],
        adding: false,
        editingIndex: null,
        x: 270,
        y: 140,
        size: { width: 500, height: 170 },
    },

    {
        id: "contact",
        title: "Thông tin liên hệ",
        open: true,
        items: [
            guideItem("your.email@example.com"),
            guideItem("0123 456 789"),
            guideItem("Thành phố, Quốc gia"),
            guideItem("Website hoặc LinkedIn"),
        ],
        adding: false,
        editingIndex: null,
        x: 20,
        y: 310,
        size: { width: 200, height: 200 },
    },

    {
        id: "experience",
        title: "Kinh nghiệm làm việc",
        open: true,
        items: [
            guideItem("Thêm các kinh nghiệm làm việc theo thứ tự từ gần nhất đến xa."),
            guideItem("Ghi rõ vị trí, tên công ty và thời gian làm việc."),
            guideItem("Mô tả những nhiệm vụ chính hoặc thành tựu nổi bật của bạn."),
        ],
        adding: false,
        editingIndex: null,
        x: 270,
        y: 310,
        size: { width: 500, height: 400 },
    },

    {
        id: "education",
        title: "Học vấn",
        open: true,
        items: [
            guideItem("Ghi tên trường hoặc cơ sở đào tạo."),
            guideItem("Ghi chuyên ngành, bằng cấp hoặc chương trình học."),
            guideItem("Thời gian học, ví dụ: 2018 – 2022."),
        ],
        adding: false,
        editingIndex: null,
        x: 270,
        y: 710,
        size: { width: 500, height: 550 },
    },

    {
        id: "language",
        title: "Ngôn ngữ",
        open: true,
        items: [
            guideItem("Liệt kê những ngôn ngữ bạn sử dụng."),
            guideItem("Ghi mức độ thành thạo, ví dụ: Tiếng Anh – Trung cấp."),
        ],
        adding: false,
        editingIndex: null,
        x: 20,
        y: 510,
        size: { width: 200, height: 200 },
    },

    {
        id: "skills",
        title: "Kỹ năng",
        open: true,
        items: [
            guideItem("Liệt kê các kỹ năng nổi bật của bạn."),
            guideItem("Ví dụ: JavaScript, React, giao tiếp, làm việc nhóm…"),
        ],
        adding: false,
        editingIndex: null,
        x: 20,
        y: 710,
        size: { width: 200, height: 200 },
    },
];



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
export default function CVManager() {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [cvs, setCvs] = useState<CVProfile[]>([]);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Ngày cập nhật');

    // Filter and sort CVs based on search term and selected sort option
    const sortedFilteredCvs = cvs
        .filter(cv => cv.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            switch (selectedSort) {
                case 'Tên CV':
                    return a.name.localeCompare(b.name);
                case 'Ngày cập nhật':
                default:
                    return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
            }
        });

    useEffect(() => {
        cvAPI.getForUser({}).then(res => {
            setCvs(res.data?.data)
        }).catch(err => {
            console.error(err);
        })
    }, [])
    const handleCreateNewCV = () => {
        setLoading(true);
        cvAPI.create({
            name: "New CV",
            id: undefined,
            primary_color: "#0C6A4E",
            sections: "NONE"
        }).then(res => {
            location.href = `/cv/${res.data.id}`
        }).catch(err => {
            console.error(err);
        }).finally(() => {
            setLoading(false);
        })
    }
    return (
        <>
            <Header />
            {loading ? <Loader /> : <></>}
            <div className="min-h-screen p-6">
                <div className="max-w-8xl mx-auto">
                    {/* Header */}
                    <h1 className="text-3xl font-bold text-[#0C6A4E] text-center mb-8">
                        TẤT CẢ CV CỦA BẠN
                    </h1>

                    {/* Search and Create Section */}
                    <div className="flex gap-4 mb-5">
                        <input
                            type="text"
                            placeholder="Nhập tên CV để tìm kiếm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 text-gray-700 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Recent CVs Section */}
                    <section>
                        <div className="flex items-center justify-between gap-4">
                            <div className='flex items-center gap-3'>
                                <span className='text-sm text-gray-500 font-medium'>
                                    Sắp xếp theo
                                </span>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-gray-700">
                                            {selectedSort}
                                        </span>
                                        <ArrowDownWideNarrow className='ml-2 text-gray-400' size={14} />
                                    </button>
                                    
                                    {sortDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                            <div className="py-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedSort('Ngày cập nhật');
                                                        setSortDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    Ngày cập nhật
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedSort('Tên CV');
                                                        setSortDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    Tên CV
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-lg bg-[#0C6A4E] px-4 py-2 text-white cursor-pointer hover:bg-[#0a5441] transition-colors"
                            >
                                <Upload className="h-4 w-4" />
                                Upload CV
                            </button>
                        </div>
                        <h2 className="mt-3 text-2xl font-semibold text-gray-800 mb-6">Gần đây</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-1">
                            <div
                                className="bg-white rounded-xl p-6 cursor-pointer"
                                onClick={handleCreateNewCV}
                            >
                                <div className='w-full aspect-[3/4] bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100'>
                                    {loading ? <Loader2 color='white' fill='#89aea3ff' size={76} strokeWidth={1} /> : <FilePlus color='white' fill='#89aea3ff' size={76} strokeWidth={1} />}
                                </div>
                            </div>
                            {sortedFilteredCvs?.map(cv => {
                                let sections = [];
                                if (cv.sections == 'NONE') {
                                    sections = DEFAULT_SECTIONS_VI;
                                } else {
                                    sections = JSON.parse(cv.sections);
                                }
                                return (
                                    <div
                                        key={cv.id}
                                        className="bg-white rounded-xl p-6 cursor-pointer"
                                        onClick={() => location.href = `/cv/${cv.id}`}
                                    >
                                        <CVCanvas
                                            projectName={cv.name}
                                            isSavable={false}
                                            isIcon
                                            imageState={INITIAL_IMAGE_STATE}
                                            setImageState={() => { }}
                                            defaultZoom={0.21}
                                            cvTitle={cv.title || ""}
                                            key={cv.id}
                                            primaryColor={cv.primary_color || "#0C6A4E"}
                                            sections={sections}
                                        />

                                        <h3 className="font-bold text-gray-800 text-lg mb-3 truncate">
                                            {cv.name}
                                        </h3>
                                        <div className="text-gray-600 text-sm">
                                            Ngày cập nhật: {new Date(cv.updated_at || cv.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}