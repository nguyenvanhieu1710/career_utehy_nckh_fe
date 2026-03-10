"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* 404 Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-8xl md:text-9xl font-bold text-green-700 opacity-20"
            >
              404
            </motion.div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 left-1/4 w-4 h-4 bg-green-400 rounded-full opacity-60"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute top-8 right-1/4 w-3 h-3 bg-emerald-400 rounded-full opacity-60"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Oops! Trang không tìm thấy
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Trang bạn đang tìm kiếm có thể đã bị di chuyển, xóa hoặc không tồn
            tại.
          </p>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link href="/">
            <motion.button
              className="px-8 py-4 bg-green-700 text-white rounded-xl font-semibold text-lg hover:bg-green-800 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Quay về trang chủ
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
