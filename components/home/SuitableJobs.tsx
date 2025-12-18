"use client";
import { Card } from "@/components/ui/card";
import { Heart, Link2, Eye } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import SectionTitle from "../common/SectionTitle";
import { useAuth } from "@/hooks/useAuth";
import { LoginRequired } from "@/components/auth/LoginRequired";

interface JobItemProps {
  job_id?: string | number;
  logo: string;
  title: string;
  company: string;
  location?: string;
  compatibility: number;
  index?: number;
}

const JobItem = ({
  job_id,
  logo,
  title,
  company,
  location,
  compatibility,
  index = 0,
}: JobItemProps) => {
  const router = useRouter();
  const [isHeartFilled, setIsHeartFilled] = useState(false);

  const handleViewDetail = () => {
    if (job_id) {
      router.push(`/career/suitable-job-detail`);
    }
  };

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        ease: "easeOut",
      }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Card
        className={twMerge(
          "bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
        )}
      >
        {/* Animated gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10 flex items-start justify-between gap-6">
          {/* Logo + Info */}
          <div className="flex items-start gap-4 flex-1">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="w-25 h-25 shrink-0 rounded-xl bg-white shadow-md flex items-center justify-center p-2 border border-gray-100"
            >
              <img
                src={logo}
                alt={company}
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>

            <div className="space-y-2 flex-1">
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.1 }}
                className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300"
              >
                {title}
              </motion.h3>
              <p className="text-sm text-gray-600">{company}</p>
              <p className="text-sm text-gray-400 mt-1">{location}</p>

              <motion.div className="flex items-center gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300 cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Link</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleHeartClick}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors duration-300 cursor-pointer"
                >
                  <motion.div
                    animate={{ scale: isHeartFilled ? [1, 1.3, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isHeartFilled ? "fill-red-600 text-red-600" : ""
                      }`}
                    />
                  </motion.div>
                  <span>Yêu thích</span>
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Compatibility */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 + 0.2, duration: 0.5 }}
            className="text-right space-y-3 shrink-0"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={clsx(
                "text-4xl font-bold transition-all duration-300",
                compatibility >= 50 ? "text-green-600" : "text-red-500"
              )}
            >
              {compatibility}%
            </motion.div>
            <motion.p
              className={clsx(
                "text-xs uppercase tracking-wider font-medium",
                compatibility >= 50 ? "text-green-600" : "text-red-500"
              )}
            >
              Tỷ lệ phù hợp
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={twMerge(
                "mt-3 rounded-lg font-medium px-4 py-2.5 text-sm flex items-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md",
                compatibility >= 50
                  ? "text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              )}
              onClick={handleViewDetail}
            >
              <motion.div
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Eye className="w-4 h-4 mr-1.5" />
              </motion.div>
              Xem chi tiết
            </motion.button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

// Login Required Section Component
const LoginRequiredSection = () => {
  return (
    <section className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="flex justify-between items-center mb-8"
      >
        <SectionTitle title="CÔNG VIỆC PHÙ HỢP VỚI BẠN" />
      </motion.div>

      <LoginRequired
        title="Đăng nhập để xem công việc phù hợp"
        description="Hệ thống sẽ phân tích hồ sơ của bạn và gợi ý những công việc phù hợp nhất. Đăng nhập ngay để khám phá cơ hội nghề nghiệp dành riêng cho bạn!"
        showSignup={true}
      />
    </section>
  );
};

export default function SuitableJobs() {
  const { isAuthenticated, isLoading } = useAuth();

  const jobs = [
    {
      id: 1,
      logo: "/logo/kyna-english.png",
      title: "Giáo viên Tiếng Anh online",
      company: "Công ty cổ phần Dream Viet Education - Kyna English",
      location: "Toàn quốc",
      compatibility: 82,
    },
    {
      id: 2,
      logo: "/logo/avepoint.png",
      title: "Intern/Junior/Middle QA/Tester",
      company: 'Công ty TNHH AveOint "Hà Nội, Đà Nẵng"',
      compatibility: 20,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-20"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </motion.div>
      </section>
    );
  }

  // Show login required if not authenticated
  if (!isAuthenticated) {
    return <LoginRequiredSection />;
  }

  // Show suitable jobs if authenticated
  return (
    <section className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="flex justify-between items-center mb-8"
      >
        <SectionTitle title="CÔNG VIỆC PHÙ HỢP VỚI BẠN" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="space-y-6"
      >
        {jobs.map((job, idx) => (
          <JobItem
            key={idx}
            index={idx}
            job_id={job.id}
            logo={job.logo}
            title={job.title}
            company={job.company}
            location={job.location}
            compatibility={job.compatibility}
          />
        ))}
      </motion.div>
    </section>
  );
}
