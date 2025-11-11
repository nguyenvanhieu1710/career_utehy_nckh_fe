"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SectionTitle from "@/components/common/SectionTitle";

const industries = [
  {
    image: "/logo/sales.jpg",
    title: "Kinh doanh/ Bán hàng/ Chăm sóc khách hàng",
  },
  {
    image: "/logo/finance.jpg",
    title: "Tài chính/ Kế toán",
  },
  {
    image: "/logo/hr.jpg",
    title: "Hành chính/ Nhân sự/ Trợ lý/ Biên phiên dịch",
  },
  {
    image: "/logo/it.jpg",
    title: "IT/ Phần mềm/ IOT/ Điện tử viễn thông",
  },
  {
    image: "/logo/education.jpg",
    title: "Giáo dục và Đào tạo",
  },
  {
    image: "/logo/healthcare.jpg",
    title: "Y tế/ Sức khỏe/ Làm đẹp",
  },
];

export default function TrendingIndustries() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="NGÀNH NGHỀ NỔI BẬT"
          className="text-4xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {industries.map((item, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -8 }}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-3xl hover:shadow-2xl transition-all duration-300 p-4 h-full flex flex-col">
                  <div className="w-full h-32 aspect-square relative mb-6">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight mt-auto">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}