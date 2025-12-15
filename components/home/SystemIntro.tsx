"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

export default function SystemIntro() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const particlePositions = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        initialX: 100 + i * 150,
        initialY: 100 + i * 80,
        animateX: 200 + i * 120,
        animateY: 150 + i * 90,
        duration: 20 + i * 2,
      })),
    []
  );

  // Pre-generate sparkle positions with rounded values to avoid precision issues
  const sparklePositions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        baseX: Math.round(190 + Math.cos((i * 60 * Math.PI) / 180) * 200),
        baseY: Math.round(190 + Math.sin((i * 60 * Math.PI) / 180) * 200),
        offsetX: Math.round(Math.cos((i * 60 * Math.PI) / 180) * 20),
        offsetY: Math.round(Math.sin((i * 60 * Math.PI) / 180) * 20),
      })),
    []
  );

  // Handle client-side mounting
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateCV = () => {
    router.push("/cv");
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles - only render on client */}
        {isMounted &&
          particlePositions.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-30"
              suppressHydrationWarning={true}
              initial={{
                x: particle.initialX,
                y: particle.initialY,
              }}
              animate={{
                x: particle.animateX,
                y: particle.animateY,
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

        {/* Subtle geometric shapes */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 border border-blue-200 rounded-full opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 border border-green-200 rounded-full opacity-20"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Enhanced text with gradient and typing effect */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.p
                className="text-lg leading-relaxed text-justify bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-transparent font-medium"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                Hệ thống nhằm giúp các trường đại học điều phối hoạt động kết
                nối và tuyển dụng giữa sinh viên với các doanh nghiệp. Hệ thống
                được tích hợp công nghệ AI và BigData , được nhóm sinh viên Khoa
                CNTT của trường Đại học Sư phạm Kỹ thuật Hưng Yên phát triển với
                nhiều tính năng ưu việt.
              </motion.p>
            </motion.div>

            {/* Enhanced button with more effects */}
            <motion.button
              onClick={handleCreateCV}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(12, 106, 78, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0C6A4E] to-[#0F7A5A] text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
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
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <FileText className="w-5 h-5" />
              </motion.div>

              <span className="relative z-10">Tạo CV</span>

              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.4 }}
              />
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
              {/* Glow effect behind logo */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Rotating ring around logo */}
              <motion.div
                className="absolute inset-0 border-2 border-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.3), transparent, rgba(34, 197, 94, 0.3), transparent)",
                }}
              />

              {/* Logo with enhanced effects */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotate: [0, -2, 2, 0],
                }}
                transition={{ duration: 0.5 }}
                animate={{
                  y: [0, -10, 0],
                }}
                style={{
                  transition: "transform 4s ease-in-out infinite",
                }}
              >
                <Image
                  src="/logo/utehy.png"
                  alt="GHD - Hệ thống việc làm sinh viên UTEHY"
                  width={380}
                  height={380}
                  className="drop-shadow-2xl relative z-10"
                  priority
                />
              </motion.div>

              {/* Floating sparkles around logo - only render on client to avoid hydration issues */}
              {isMounted &&
                sparklePositions.map((sparkle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    suppressHydrationWarning={true}
                    initial={{
                      x: sparkle.baseX,
                      y: sparkle.baseY,
                      opacity: 0,
                    }}
                    animate={{
                      x: [
                        sparkle.baseX,
                        sparkle.baseX + sparkle.offsetX,
                        sparkle.baseX,
                      ],
                      y: [
                        sparkle.baseY,
                        sparkle.baseY + sparkle.offsetY,
                        sparkle.baseY,
                      ],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut",
                    }}
                  />
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
