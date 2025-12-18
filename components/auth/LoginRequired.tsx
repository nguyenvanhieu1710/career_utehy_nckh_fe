"use client";

import { motion } from "framer-motion";
import { Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface LoginRequiredProps {
  title?: string;
  description?: string;
  showSignup?: boolean;
  className?: string;
}

export function LoginRequired({
  title = "Đăng nhập để xem nội dung",
  description = "Bạn cần đăng nhập để truy cập tính năng này. Đăng nhập ngay để khám phá những cơ hội tuyệt vời dành riêng cho bạn!",
  showSignup = true,
  className = "",
}: LoginRequiredProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className={`max-w-2xl mx-auto ${className}`}
    >
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-sm text-center hover:shadow-lg transition-all duration-300">
        <motion.div
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4"
          whileHover={{ scale: 1.02 }}
        >
          {title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-gray-600 mb-8 leading-relaxed"
          whileHover={{ scale: 1.01 }}
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/auth/signin">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              {/* Animated background sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  x: [0, 2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="relative z-10"
              >
                <LogIn className="w-5 h-5" />
              </motion.div>
              <span className="relative z-10">Đăng nhập ngay</span>

              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-lg"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>
          </Link>

          {showSignup && (
            <Link href="/auth/signup">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  borderColor: "rgb(34, 197, 94)",
                  backgroundColor: "rgb(240, 253, 244)",
                }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-white text-green-600 font-semibold px-6 py-3 rounded-lg border-2 border-green-600 hover:bg-green-50 transition-all duration-300 relative overflow-hidden group cursor-pointer"
              >
                {/* Subtle background animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <span className="relative z-10">Tạo tài khoản</span>

                {/* Border glow effect */}
                <motion.div
                  className="absolute inset-0 border-2 border-green-400 rounded-lg opacity-0"
                  whileHover={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.button>
            </Link>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
}
