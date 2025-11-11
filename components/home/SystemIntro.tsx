"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

export default function SystemIntro() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <p className="text-lg leading-relaxed text-gray-700 text-justify">
              Hệ thống nhằm giúp các trường đại học điều phối hoạt động kết nối
              và tuyển dụng giữa sinh viên với các doanh nghiệp. Hệ thống được
              tích hợp công nghệ AI và BigData, được nhóm sinh viên Khoa CNTT
              của trường Đại học Sư phạm Kỹ thuật Hưng Yên phát triển với nhiều
              tính năng ưu việt.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-[#0C6A4E] text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Upload className="w-5 h-5" />
              Upload CV
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              <Image
                src="/logo/utehy.png"
                alt="GHD - Hệ thống việc làm sinh viên UTEHY"
                width={380}
                height={380}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
