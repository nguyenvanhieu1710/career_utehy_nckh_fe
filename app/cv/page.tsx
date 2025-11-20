"use client";

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { useState } from 'react';
import CVCanvas, { ImageState } from './components/Canvas';
import { PlusCircle, PlusSquare } from 'lucide-react';

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

    const cvList = [
        { id: 1, name: 'CV_DevOps_TranCamTu', updated: '22/10/2025' },
        { id: 2, name: 'CV_NhaSi_LeThiChien', updated: '17/11/2025' },
        { id: 3, name: 'CV_TroLy_ToAnXo', updated: '2 tiếng trước' },
        { id: 4, name: 'CV_GiaoVien_BuiThiAn', updated: '5/11/2025' },
    ];

    const filteredCVs = cvList.filter(cv =>
        cv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Header />
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
                            >
                                <div className='w-full h-full bg-gray-100 rounded-lg flex items-center justify-center'>
                                    <PlusSquare color='#1fad82ff' size={76}/>
                                </div>
                            </div>
                            {filteredCVs.map(cv => (
                                <div
                                    key={cv.id}
                                    className="bg-white rounded-xl p-6 cursor-pointer"
                                >
                                    <CVCanvas
                                        isIcon
                                        imageState={INITIAL_IMAGE_STATE}
                                        defaultZoom={0.21}
                                    />

                                    <h3 className="font-bold text-gray-800 text-lg mb-3 truncate">
                                        {cv.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Cập nhật: {cv.updated}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}