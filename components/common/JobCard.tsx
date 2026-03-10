// components/common/JobCard.tsx
"use client";
import Image from "next/image";
import { Heart, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

interface JobCardProps {
  logo: string;
  title: string;
  company: string;
  location: string;
  job_id: string;
  index?: number;
}

export default function JobCard({
  logo,
  title,
  company,
  location,
  job_id,
  index = 0,
}: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartFilled, setIsHeartFilled] = useState(false);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartFilled(!isHeartFilled);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{
        y: -6,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-4 h-[210px] flex flex-col relative overflow-hidden group cursor-pointer"
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-emerald-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Main content area */}
      <div className="flex gap-4 flex-1 relative z-10">
        {/* Logo with hover animation */}
        <motion.div
          className="relative w-1/4 min-w-[70px] max-w-[90px] flex-shrink-0 flex items-start pt-1"
          whileHover={{
            scale: 1.05,
            rotate: [0, -1, 1, 0],
            transition: { duration: 0.4 },
          }}
        >
          <div className="w-full">
            <motion.div
              className="relative aspect-square"
              animate={{ scale: isHovered ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isHovered ? 0.3 : 0,
                  scale: isHovered ? 1.1 : 0.8,
                }}
                transition={{ duration: 0.3 }}
              />
              <Image
                src={logo}
                alt={company}
                fill
                className="object-contain rounded-lg relative z-10"
                sizes="(max-width: 768px) 25vw, 100px"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Content area with flexible layout */}
        <div className="flex-1 flex flex-col min-h-0">
          <Link href={`/career/job-detail?id=${job_id}`} className="flex-1">
            <motion.div
              className="flex-1 flex flex-col"
              animate={{ y: isHovered ? -2 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3
                className={`font-bold text-lg line-clamp-2 leading-tight break-words transition-all duration-300 mb-2 ${
                  isHovered
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                    : "text-[#852121]"
                }`}
                animate={{ scale: isHovered ? 1.02 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {title}
              </motion.h3>
              <motion.p
                className={`text-sm transition-colors duration-300 mb-1 ${
                  isHovered ? "text-gray-800" : "text-[#000000]"
                }`}
                animate={{ x: isHovered ? 2 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {company}
              </motion.p>
              <motion.p
                className={`text-sm transition-colors duration-300 ${
                  isHovered ? "text-gray-600" : "text-[#656565]"
                }`}
                animate={{ x: isHovered ? 2 : 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                {location}
              </motion.p>
            </motion.div>
          </Link>

          {/* Buttons area - always at bottom */}
          <motion.div
            className="mt-auto pt-4 border-t border-gray-100"
            animate={{ y: isHovered ? -2 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-3">
              <motion.button
                className={`flex-1 flex items-center justify-center gap-2 font-medium text-sm py-2.5 cursor-pointer rounded-lg transition-all duration-300 ${
                  isHovered
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    : "bg-[#E6E6E6] text-[#5C5C5C]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Link
                <motion.div
                  animate={{
                    x: isHovered ? [0, 2, 0] : 0,
                    rotate: isHovered ? [0, 10, 0] : 0,
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: isHovered ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.div>
              </motion.button>

              <motion.button
                className={`flex items-center justify-center gap-2 px-4 py-2.5 cursor-pointer rounded-lg transition-all duration-300 ${
                  isHovered
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 shadow-md"
                    : "bg-[#E6E6E6] text-[#5C5C5C]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleHeartClick}
              >
                <span className="text-sm font-medium">Yêu thích</span>
                <motion.div
                  animate={{ scale: isHeartFilled ? [1, 1.3, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isHeartFilled
                        ? "text-green-500 fill-green-500"
                        : isHovered
                          ? "text-green-400 fill-green-400"
                          : "text-[#5C5C5C] fill-[#5C5C5C]"
                    }`}
                  />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating sparkles effect */}
      {isHovered && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full"
              initial={{
                opacity: 0,
                x: 60 + i * 40,
                y: 80 + i * 30,
              }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -25, -50],
                x: [0, [-3, 0, 3][i], [-6, 0, 6][i]],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
