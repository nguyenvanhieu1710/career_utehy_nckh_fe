"use client";

import Button from "@/components/ui/Button";
import { Search } from "lucide-react";

const studentAvatars = [
  "/avatars/1.jpg",
  "/avatars/2.jpg",
  "/avatars/3.jpg",
  "/avatars/4.jpg",
  "/avatars/5.jpg",
  "/avatars/6.jpg",
  "/avatars/7.jpg",
  "/avatars/8.jpg",
];

export function HeroSearch() {
  return (
    <section className="flex gap-3 h-screen bg-white py-12 p-3">
      <div className="flex-1 container mx-auto px-4">
        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          Có <span className="text-green-600">24.558+</span> Công ty
        </h1>
        <h2 className="text-4xl font-bold text-green-700 mb-4">ĐANG TUYỂN DỤNG</h2>
        <p className="text-gray-600 text-lg mb-8">
          Hệ thống thu thập và gợi ý việc làm cho sinh viên
        </p>

        {/* Avatars */}
        <div className="flex items-center flex-wrap gap-2 mb-10">
          {studentAvatars.map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md -ml-4 first:ml-0"
            >
              <img src={_} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="w-16 h-16 rounded-full bg-green-100 border-4 border-white flex items-center justify-center -ml-4 shadow-md">
            <span className="text-green-700 font-bold text-lg">+99</span>
          </div>
        </div>

        {/* Search Bar - GIỐNG HỆT ẢNH */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Input */}
            <div className="flex-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Nhập tên công việc, công ty..."
                className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:border-green-600 text-gray-700"
              />
            </div>

            {/* Button Tìm việc */}
            <Button
              flex={1}
              value="Tìm việc"
              color="white"
              height="56px"
            // className="px-10 font-semibold rounded-lg"
            />
          </div>

          {/* Filters - GIỐNG HỆT ẢNH */}
          <div className="grid grid-cols-2 gap-3">
            <select className="bg-[#ECECEC] px-4 py-3 rounded-lg border border-gray-300 text-gray-600 text-sm">
              <option>Tất cả địa điểm</option>
            </select>
            <select className="bg-[#ECECEC] px-4 py-3 rounded-lg border border-gray-300 text-gray-600 text-sm">
              <option>Tất cả ngành nghề</option>
            </select>
            <select className="bg-[#ECECEC] px-4 py-3 rounded-lg border border-gray-300 text-gray-600 text-sm">
              <option>Tất cả loại hình</option>
            </select>
            <select className="bg-[#ECECEC] px-4 py-3 rounded-lg border border-gray-300 text-gray-600 text-sm">
              <option>Tất cả mức lương</option>
            </select>
            <select className="bg-[#ECECEC] px-4 py-3 rounded-lg border border-gray-300 text-gray-600 text-sm">
              <option>Tất cả cấp bậc</option>
            </select>
            <select className="bg-[#ECECEC] px-4 py-3 rounded-lg border border-gray-300 text-gray-600 text-sm">
              <option>Tất cả mức lương</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <img src={'./peoplescareer.jpg'} className="w-full object-contain h-full rounded-lg" />
      </div>
    </section>
  );
}