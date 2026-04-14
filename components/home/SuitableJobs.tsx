"use client";
import { Card } from "@/components/ui/card";
import { Heart, Link2, Eye, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SectionTitle from "../common/SectionTitle";
import { useAuth } from "@/hooks/useAuth";
import { LoginRequired } from "@/components/auth/LoginRequired";
import { cvAPI } from "@/services/cv";
import { recommendationAPI } from "@/services/recommendation";
import { getUserStorage } from "@/services/auth";
import { prepareRecommendationPayload } from "@/utils/cvExtractor";
import { CVProfile, Section } from "@/types/cv";
import { DEFAULT_SECTIONS_VI } from "@/app/cv/page";
import { Loader2, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";

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
          "bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group",
        )}
      >
        {/* Animated gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
          {/* Logo + Info */}
          <div className="flex items-start gap-4 flex-1 w-full">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 sm:w-25 sm:h-25 shrink-0 rounded-xl bg-white shadow-md flex items-center justify-center p-2 border border-gray-100"
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
                className="font-semibold text-lg text-gray-900 group-hover:text-[#0C6A4E] transition-colors duration-300"
              >
                {title}
              </motion.h3>
              <p className="text-sm text-gray-600">{company}</p>
              <p className="text-sm text-gray-400 mt-1">{location}</p>

              <motion.div className="flex items-center gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0C6A4E] transition-colors duration-300 cursor-pointer"
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
            className="w-full sm:w-auto text-center sm:text-right space-y-3 shrink-0"
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
                compatibility >= 50 ? "text-green-600" : "text-red-500",
              )}
            >
              {compatibility}%
            </motion.div>
            <motion.p
              className={clsx(
                "text-xs uppercase tracking-wider font-medium",
                compatibility >= 50 ? "text-green-600" : "text-red-500",
              )}
            >
              Tỷ lệ phù hợp
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={twMerge(
                "mt-3 rounded-lg font-medium px-4 py-2.5 text-sm flex items-center justify-center sm:justify-start w-full sm:w-auto cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md",
                compatibility >= 50
                  ? "text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
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
    <section className="py-16 px-7">
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noCv, setNoCv] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      setNoCv(false);

      try {
        const { user_id } = getUserStorage();
        if (!user_id) return;

        // 1. Fetch User CVs
        const cvRes = await cvAPI.getForUser({});
        const userCvs = cvRes.data?.data as CVProfile[];

        if (!userCvs || userCvs.length === 0) {
          setNoCv(true);
          setLoading(false);
          return;
        }

        // Take the latest CV
        const latestCv = userCvs[0];
        let sections: Section[] = [];

        try {
          sections =
            latestCv.sections === "NONE"
              ? DEFAULT_SECTIONS_VI
              : JSON.parse(latestCv.sections);
        } catch (e) {
          console.error("Failed to parse CV sections", e);
          sections = DEFAULT_SECTIONS_VI;
        }

        // 2. Prepare Payload and Call AI Recommendation API
        const payload = prepareRecommendationPayload(user_id, sections);
        const recRes = await recommendationAPI.getRecommendations(payload);

        // 3. Map Response to UI Data Structure
        const mappedJobs = recRes.recommendations.map((rec) => ({
          id: rec.job_id,
          logo: "/logo/default-company.png", // Fallback logo
          title: rec.job_title,
          company: rec.company_name,
          location: `${rec.location_district}, ${rec.location_city}`,
          compatibility: Math.round(rec.final_score * 100),
          // Store all scores for potential use in detail page
          scores: {
            sim_title: rec.sim_title,
            sim_tech: rec.sim_tech,
            sim_mota: rec.sim_mota,
            loc_score: rec.loc_score,
            exp_score: rec.exp_score,
          },
        }));

        setJobs(mappedJobs);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Không thể lấy dữ liệu gợi ý việc làm lúc này.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated]);

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
  if (authLoading || loading) {
    return (
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col justify-center items-center py-20 space-y-4"
        >
          <Loader2 className="h-12 w-12 text-[#0C6A4E] animate-spin" />
          <p className="text-gray-500 font-medium">
            AI đang phân tích hồ sơ và tìm việc phù hợp cho bạn...
          </p>
        </motion.div>
      </section>
    );
  }

  // Show login required if not authenticated
  if (!isAuthenticated) {
    return <LoginRequiredSection />;
  }

  // Show status if no CV found
  if (noCv) {
    return (
      <section className="py-16 px-7">
        <SectionTitle title="CÔNG VIỆC PHÙ HỢP VỚI BẠN" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-100 rounded-3xl p-10 text-center max-w-3xl mx-auto mt-8"
        >
          <div className="bg-white w-20 h-20 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-[#0C6A4E]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Bạn chưa có CV trên hệ thống
          </h3>
          <p className="text-gray-600 mb-8">
            Hãy tạo một chiếc CV chuyên nghiệp để hệ thống AI của chúng tôi có
            thể phân tích và gợi ý những công việc phù hợp nhất với năng lực của
            bạn.
          </p>
          <Link
            href="/cv"
            className="inline-flex items-center justify-center bg-[#0C6A4E] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0a5441] transition-all shadow-lg shadow-green-100"
          >
            Tạo CV ngay bây giờ
          </Link>
        </motion.div>
      </section>
    );
  }

  // Show error if API fails
  if (error) {
    return (
      <section className="py-16 px-7">
        <SectionTitle title="CÔNG VIỆC PHÙ HỢP VỚI BẠN" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-100 rounded-3xl p-10 text-center max-w-2xl mx-auto mt-8"
        >
          <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-[#0C6A4E]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Hệ thống AI đang bận một chút
          </h3>
          <p className="text-gray-600 mb-6">
            Dường như có một chút gián đoạn nhỏ khi kết nối với bộ não AI của
            chúng tôi. Bạn hãy thử làm mới trang hoặc quay lại sau giây lát nhé!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center bg-[#0C6A4E] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#0a5441] transition-all shadow-md shadow-green-100 cursor-pointer"
          >
            Thử lại ngay
          </button>
        </motion.div>
      </section>
    );
  }

  // Show suitable jobs if authenticated
  return (
    <section className="py-16 px-7">
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
        {jobs.slice(0, visibleCount).map((job, idx) => (
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

      {jobs.length > visibleCount && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <button
            onClick={() => setVisibleCount(jobs.length)}
            className="group flex items-center gap-2 px-8 py-3 bg-white border-2 border-[#0C6A4E] text-[#0C6A4E] font-bold rounded-2xl hover:bg-[#0C6A4E] hover:text-white transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
          >
            Xem tất cả ({jobs.length} công việc)
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-5 h-5 group-hover:scale-110" />
            </motion.div>
          </button>
        </motion.div>
      )}
    </section>
  );
}
