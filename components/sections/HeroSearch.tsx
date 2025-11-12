"use client";

import Button from "@/components/ui/Button";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TitleId = 'job' | 'studient' | 'company';

const studentAvatars = [
  "/avatars/avatar-1.jpeg",
  "/avatars/avatar-2.jpg",
  "/avatars/avatar-3.jpg",
  "/avatars/avatar-4.jpg",
  "/avatars/avatar-5.jpg",
  "/avatars/avatar-6.jpg",
];

const heroTitles: { id: TitleId; data: { amount: string; verd: string; sub: string } }[] = [
  {
    id: "studient",
    data: {
      amount: "{amount}+",
      verd: "SINH VIÊN",
      sub: "ĐANG XIN VIỆC",
    },
  },
  {
    id: "company",
    data: {
      amount: "{amount}+",
      verd: "CÔNG TY",
      sub: "ĐANG TUYỂN DỤNG",
    },
  },
  {
    id: "job",
    data: {
      amount: "{amount}+",
      verd: "VIỆC LÀM",
      sub: "ĐANG ĐĂNG TUYỂN",
    },
  },
];

export function HeroSearch() {
  const [titleDataIndex, setTitleDataIndex] = useState(0);
  const [titleAmountData] = useState<Record<TitleId, number>>({
    job: 24043,
    studient: 92395,
    company: 2357,
  });

  // --- Auto change title every 3s ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleDataIndex((prev) => {
        const next = prev + 1;
        return next > 2 ? 0 : next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentTitle = heroTitles[titleDataIndex];

  return (
    <section className="flex gap-3 h-screen bg-white py-12 p-3">
      <div className="flex-1 container mx-auto px-4 mb-20">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 md:mb-4 flex flex-wrap items-center gap-2 md:gap-3">
          <span>CÓ</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentTitle.id + "-amount"}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[#5959EB] inline-block"
            >
              {currentTitle.data.amount.replace(
                "{amount}",
                titleAmountData[currentTitle.id]?.toLocaleString("vi-VN")
              )}
            </motion.span>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.span
              key={currentTitle.id + "-verd"}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              {currentTitle.data.verd}
            </motion.span>
          </AnimatePresence>
        </h1>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#000000] mb-6 md:mb-8">
          ĐANG{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={currentTitle.id + "-sub"}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              {currentTitle.data.sub.replace("ĐANG ", "")}
            </motion.span>
          </AnimatePresence>
        </h2>

        <p className="text-gray-700 text-base md:text-lg lg:text-xl mb-8 md:mb-12 max-w-2xl">
          Hệ thống thu thập và gợi ý việc làm cho sinh viên
        </p>

        {/* Avatars */}
        <div className="flex items-center mb-10 md:mb-14">
          <div className="flex">
            {studentAvatars.map((_, i) => (
              <div 
                key={i} 
                className="relative"
                style={{
                  marginLeft: i === 0 ? 0 : '-1rem',
                  zIndex: studentAvatars.length - i
                }}
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-4 border-white shadow-md hover:scale-110 transition-transform duration-300 hover:z-10"
                  style={{
                    zIndex: studentAvatars.length - i,
                  }}
                >
                  <img src={_} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
            <div 
              className="relative"
              style={{
                marginLeft: '-1rem',
                zIndex: 0
              }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-green-100 border-4 border-white flex items-center justify-center shadow-md">
                <span className="text-green-700 font-bold text-sm sm:text-base md:text-lg">+99</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Nhập tên công việc, công ty..."
                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5959EB] focus:border-transparent text-gray-700 text-sm sm:text-base"
              />
            </div>

            <Button flex={1} value="Tìm việc" color="white" height="56px" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["Địa điểm", "Ngành nghề", "Loại hình", "Mức lương", "Cấp bậc", "Kinh nghiệm"].map(
              (item, i) => (
                  <select
                  key={i}
                  className="bg-[#ECECEC] px-4 py-3 rounded-lg border border-gray-300 text-gray-600 text-sm"
                  >
                    <option>Tất cả {item}</option>
                  </select>
              )
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative min-h-[400px] lg:min-h-0">
        <img
          src={"./peoplescareer.jpg"}
          className="absolute inset-0 w-full h-full object-cover lg:object-contain rounded-lg"
          alt="People in career"
        />
      </div>
    </section>
  );
}
