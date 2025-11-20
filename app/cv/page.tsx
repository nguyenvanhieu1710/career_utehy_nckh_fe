"use client";

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { useEffect, useState } from 'react';
import CVCanvas, { CVState, ImageState } from './components/Canvas';
import { FilePlus, Loader2, PlusCircle, PlusSquare } from 'lucide-react';
import { cvAPI } from '@/services/cv';
import Loader from '@/components/ui/Loader';
import { CVProfile } from '@/types/cv';
import { defaultSections } from './[cv_id]/page';
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
            guideItem("Email: your.email@example.com"),
            guideItem("Phone: (+84) 0123 456 789"),
            guideItem("Address: City, Country"),
            guideItem("Website / LinkedIn (optional)"),
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

    useEffect(() => {
        cvAPI.getForUser({}).then(res => {
            setCvs(res.data?.data)
        }).catch(err => { })
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

        }).finally(() => {
            setLoading(false);
        })
    }
    return (
        <>
            <Header />
            {loading ? <Loader /> : <></>}
            <div className="min-h-screen p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <h1 className="text-3xl font-bold text-[#0C6A4E] text-center mb-8">
                        TẤT CẢ CV CỦA BẠN
                    </h1>

                    {/* Search and Create Section */}
                    <div className="flex gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Nhập tên CV để tìm kiếm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 text-gray-700 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Update Info */}
                    <div className="mb-8">
                        <p className="text-lg text-gray-700">
                            Ngày cập nhật <strong>Tạo CV</strong>
                        </p>
                    </div>

                    {/* Recent CVs Section */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gần đây</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div
                                className="bg-white rounded-xl p-6 cursor-pointer"
                                onClick={handleCreateNewCV}
                            >
                                <div className='w-full h-full bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100'>
                                    {loading ? <Loader2 fill='#89aea3ff' size={76} strokeWidth={1} /> : <FilePlus fill='#89aea3ff' size={76} strokeWidth={1} />}
                                </div>
                            </div>
                            {cvs?.map(cv => {
                                let sections = [];
                                if (cv.sections == 'NONE') {
                                    sections = DEFAULT_SECTIONS;
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
                                            isIcon
                                            imageState={INITIAL_IMAGE_STATE}
                                            defaultZoom={0.21}
                                            cvTitle={cv.title || ""}
                                            key={cv.id}
                                            primaryColor={cv.primary_color || "#0C6A4E"}
                                            sections={sections}
                                        />

                                        <h3 className="font-bold text-gray-800 text-lg mb-3 truncate">
                                            {cv.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Cập nhật: {new Date(cv.created_at).toLocaleString()}
                                        </p>
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