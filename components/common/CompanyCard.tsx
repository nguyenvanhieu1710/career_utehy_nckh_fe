// components/common/CompanyCard.tsx
"use client";
import Image from "next/image";
import { Link } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface CompanyCardProps {
  logo: string;
  name: string;
  jobsCount: number;
  index?: number;
}

export default function CompanyCard({
  logo,
  name,
  jobsCount,
  index = 0,
}: CompanyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Pre-generate random values to avoid Math.random() in render
  const particlePositions = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        initialX: 50 + i * 60,
        initialY: 100 + i * 40,
        moveX: [-5, 0, 5][i],
        moveX2: [-10, 0, 10][i],
      })),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-pointer min-h-[280px]"
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-emerald-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {/* Logo with hover animation */}
        <motion.div
          className="mb-6 w-32 h-20 relative flex items-center justify-center"
          whileHover={{
            scale: 1.05,
            rotate: [0, -2, 2, 0],
            transition: { duration: 0.5 },
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHovered ? 0.3 : 0,
              scale: isHovered ? 1.1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
          />
          <Image
            src={logo}
            alt={name}
            fill
            className="object-contain relative z-10 transition-all duration-300"
          />
        </motion.div>

        {/* Company name with gradient text on hover */}
        <motion.h3
          className={`text-xl font-bold transition-all duration-300 text-center mb-4 ${
            isHovered
              ? "bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              : "text-gray-900"
          }`}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {name}
        </motion.h3>

        {/* Jobs count with enhanced styling */}
        <motion.div
          className={`flex items-center justify-center gap-1 w-36 px-4 py-2 rounded-lg transition-all duration-300 mb-3 ${
            isHovered
              ? "bg-gradient-to-r from-green-100 to-emerald-100 shadow-md"
              : "bg-gray-100"
          }`}
          whileHover={{ scale: 1.05 }}
          animate={{ y: isHovered ? -2 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className={`font-semibold transition-colors duration-300 ${
              isHovered ? "text-green-600" : "text-gray-600"
            }`}
            animate={{ scale: isHovered ? 1.1 : 1 }}
          >
            {jobsCount}
          </motion.span>
          <span
            className={`text-sm transition-colors duration-300 ${
              isHovered ? "text-emerald-600" : "text-gray-500"
            }`}
          >
            việc làm
          </span>
        </motion.div>

        {/* Link button with enhanced hover effects */}
        <motion.button
          className={`flex items-center justify-center gap-2 w-36 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
            isHovered
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-600"
          }`}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
          whileTap={{ scale: 0.98 }}
          animate={{ y: isHovered ? -2 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="font-medium">Link</span>
          <motion.div
            animate={{
              x: isHovered ? [0, 3, 0] : 0,
              rotate: isHovered ? [0, 15, 0] : 0,
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <Link className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* Floating particles effect */}
      {isHovered && (
        <>
          {particlePositions.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full"
              initial={{
                opacity: 0,
                x: particle.initialX,
                y: particle.initialY,
              }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -30, -60],
                x: [0, particle.moveX, particle.moveX2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
