"use client";
import { Card } from "@/components/ui/card";
import { Heart, Link2, Eye, ChevronDown, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SectionTitle from "../common/SectionTitle";
import { useAuth } from "@/hooks/useAuth";
import { LoginRequired } from "@/components/auth/LoginRequired";
import { cvAPI } from "@/services/cv";
import { jobAPI } from "@/services/job";
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
  experience_required?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  explanation?: string;
  scores?: {
    sim_title: number;
    sim_tech: number;
    sim_mota: number;
    loc_score: number;
    exp_score: number;
  };
}

const JobItem = ({
  job_id,
  logo,
  title,
  company,
  location,
  compatibility,
  index = 0,
  experience_required,
  matched_skills,
  missing_skills,
  explanation,
  url_source,
  scores,
}: JobItemProps & { url_source?: string }) => {
  const router = useRouter();
  const [isHeartFilled, setIsHeartFilled] = useState(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorite_job_ids");
    if (savedFavorites) {
      try {
        let favoriteIds = JSON.parse(savedFavorites);
        // Cleanup potential "undefined" or "null" strings from previous bugs
        if (Array.isArray(favoriteIds)) {
          const cleanFavorites = favoriteIds.filter(
            (id) => id && id !== "undefined" && id !== "null",
          );
          if (cleanFavorites.length !== favoriteIds.length) {
            localStorage.setItem(
              "favorite_job_ids",
              JSON.stringify(cleanFavorites),
            );
            favoriteIds = cleanFavorites;
          }
          setIsHeartFilled(!!job_id && favoriteIds.includes(String(job_id)));
        }
      } catch (e) {
        console.error("Error parsing favorites", e);
      }
    }
  }, [job_id]);

  const handleViewDetail = (e?: React.MouseEvent) => {
    // console.log(
    //   "handleViewDetail Triggered. job_id:",
    //   job_id,
    //   "Event exists:",
    //   !!e,
    // );
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (job_id) {
      const jobData = {
        job_id,
        title,
        company,
        location,
        compatibility,
        experience_required,
        matched_skills,
        missing_skills,
        explanation,
        url_source,
        scores,
      };
      // console.log("Saving job data to sessionStorage:", jobData);
      // Lưu toàn bộ dữ liệu vào sessionStorage thay vì nối vào URL
      sessionStorage.setItem("selected_job_detail", JSON.stringify(jobData));
      // console.log("Executing router.push to /career/suitable-job-detail");
      router.push(`/career/suitable-job-detail`);
    } else {
      console.error("handleViewDetail Failed: job_id is undefined or null", {
        job_id,
        title,
        company,
      });
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const savedFavorites = localStorage.getItem("favorite_job_ids");
    let favoriteIds: string[] = [];
    if (savedFavorites) {
      try {
        favoriteIds = JSON.parse(savedFavorites);
      } catch (e) {
        favoriteIds = [];
      }
    }

    const jobIdStr = String(job_id);
    let nextFavorites: string[];

    if (favoriteIds.includes(jobIdStr)) {
      nextFavorites = favoriteIds.filter((id) => id !== jobIdStr);
      setIsHeartFilled(false);
    } else {
      nextFavorites = [...favoriteIds, jobIdStr];
      setIsHeartFilled(true);
    }

    localStorage.setItem("favorite_job_ids", JSON.stringify(nextFavorites));
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (url_source) {
      let finalUrl = url_source;
      if (!finalUrl.startsWith("http")) {
        finalUrl = "https://" + finalUrl;
      }
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } else {
      handleViewDetail();
    }
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
          "bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group cursor-pointer",
        )}
        onClick={handleViewDetail}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
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
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#0C6A4E] transition-colors duration-300 line-clamp-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600 font-medium">{company}</p>
              {location && location !== "Chưa cập nhật" && (
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full inline-block"></span>
                  {location}
                </p>
              )}

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleLinkClick}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#0C6A4E] transition-colors duration-300 cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Link</span>
                </button>
                <button
                  onClick={handleHeartClick}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors duration-300 cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isHeartFilled ? "fill-red-600 text-red-600" : ""
                    }`}
                  />
                  <span>Yêu thích</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto text-center sm:text-right space-y-3 shrink-0">
            <div
              className={clsx(
                "text-4xl font-bold transition-all duration-300",
                compatibility >= 50 ? "text-green-600" : "text-red-500",
              )}
            >
              {compatibility > 0 ? `${compatibility}%` : "NEW"}
            </div>
            <p
              className={clsx(
                "text-xs uppercase tracking-wider font-medium",
                compatibility >= 50 ? "text-green-600" : "text-red-500",
              )}
            >
              {compatibility > 0 ? "Tỷ lệ phù hợp" : "Công việc mới"}
            </p>

            {compatibility > 0 ? (
              <button
                className="mt-3 rounded-lg font-medium px-4 py-2.5 text-sm flex items-center justify-center sm:justify-start w-full sm:w-auto cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={handleViewDetail}
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Xem chi tiết
              </button>
            ) : (
              <button
                className="mt-3 rounded-lg font-medium px-4 py-2.5 text-sm flex items-center justify-center sm:justify-start w-full sm:w-auto cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md text-white bg-gradient-to-r from-[#0C6A4E] to-[#0a5441] hover:from-[#0a5441] hover:to-[#084233]"
                onClick={handleLinkClick}
              >
                <ExternalLink className="w-4 h-4 mr-1.5" />
                Ứng tuyển ngay
              </button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const LoginRequiredSection = () => {
  return (
    <section className="py-16 px-7">
      <div className="flex justify-between items-center mb-8">
        <SectionTitle title="CÔNG VIỆC PHÙ HỢP VỚI BẠN" />
      </div>
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
  const [recommendationSource, setRecommendationSource] = useState<
    "profile" | "file" | "none"
  >("none");

  const fetchRecommendations = async (forceRefresh = false) => {
    if (!isAuthenticated) return;

    const cacheKey = "auto_recommendations_cache";

    // Check cache
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setJobs(parsed.jobs);
          setRecommendationSource(parsed.mode || "none");
          setNoCv(parsed.noCv);
          return; // Skip API call if we have cache
        } catch (e) {
          console.error("Cache parsing error", e);
        }
      }
    }

    setLoading(true);
    setError(null);
    setNoCv(false);

    try {
      const res = await cvAPI.getAutoRecommendations(10);
      // console.log("Recommend API Response:", res.data); // Added log for debugging

      if (res.data?.success) {
        const { matches, mode } = res.data;
        setRecommendationSource(mode || "none");

        if (matches && matches.length > 0) {
          const mappedJobs = matches.map((rec: any) => ({
            id: rec.job_id,
            logo: "/logo/default-company.png",
            title: rec.job_title,
            company: rec.company,
            location: rec.location || rec.location_city,
            compatibility: Math.round(rec.compatibility_score),
            experience_required: rec.experience_required || "Chưa cập nhật",
            matched_skills: rec.matched_skills,
            missing_skills: rec.missing_skills,
            explanation: rec.match_explanation,
            url_source: rec.url_source,
            scores: rec.scores || {
              sim_title: 0,
              sim_tech: 0,
              sim_mota: 0,
              loc_score: 0,
              exp_score: 0,
            },
          }));
          setJobs(mappedJobs);

          // Save to cache
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              jobs: mappedJobs,
              mode: mode || "none",
              noCv: false,
            }),
          );
        } else if (mode === "none") {
          setNoCv(true);
          const fallbackRes = await jobAPI.getJobs({ page: 1, row: 10 });
          if (fallbackRes?.data) {
            const fallbackJobs = fallbackRes.data.map((j: any) => ({
              id: j.id,
              logo: "/logo/default-company.png",
              title: j.title,
              company: j.company?.name || "Đang cập nhật",
              location: j.location,
              compatibility: 0,
              experience_required: j.years_of_experience
                ? `${j.years_of_experience} năm`
                : "Chưa cập nhật",
              url_source: j.url_source,
            }));
            setJobs(fallbackJobs);

            // Save fallback to cache
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                jobs: fallbackJobs,
                mode: "none",
                noCv: true,
              }),
            );
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError("Không thể kết nối với hệ thống AI lúc này.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  if (authLoading || loading) {
    return (
      <section className="py-16 px-4">
        <div className="flex flex-col justify-center items-center py-20 space-y-4 text-center">
          <Loader2 className="h-12 w-12 text-[#0C6A4E] animate-spin" />
          <p className="text-gray-500 font-medium">
            AI đang phân tích hồ sơ và tìm việc phù hợp cho bạn...
          </p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) return <LoginRequiredSection />;

  if (error) {
    return (
      <section className="py-16 px-7 text-center">
        <SectionTitle title="CÔNG VIỆC PHÙ HỢP VỚI BẠN" />
        <div className="mt-8 p-10 bg-red-50 border border-red-100 rounded-3xl max-w-2xl mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Hệ thống bận</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#0C6A4E] text-white px-8 py-2 rounded-xl cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <SectionTitle title="CÔNG VIỆC PHÙ HỢP VỚI BẠN" />

        {recommendationSource !== "none" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0C6A4E]/10 border border-[#0C6A4E]/20 rounded-full"
          >
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0C6A4E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0C6A4E]"></span>
            </div>
            <span className="text-xs font-bold text-[#0C6A4E] uppercase tracking-wider">
              AI Gợi ý từ:{" "}
              {recommendationSource === "profile" ? "CV Online" : "CV Upload"}
            </span>
          </motion.div>
        )}
      </div>

      {noCv && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl shadow-sm shrink-0">
              <FileText className="h-6 w-6 text-[#0C6A4E]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">
                Nâng cao hiệu quả gợi ý của AI!
              </h4>
              <p className="text-sm text-gray-600">
                Bạn chưa có CV. Hãy tạo CV để AI có thể phân tích và đưa ra các
                gợi ý việc làm chính xác nhất.
              </p>
            </div>
          </div>
          <Link
            href="/cv"
            className="bg-[#0C6A4E] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0a5441] transition-all shadow-md text-sm"
          >
            Tạo CV ngay
          </Link>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {jobs.slice(0, visibleCount).map((job, index) => (
          <JobItem
            key={job.id || index}
            job_id={job.id}
            {...job}
            index={index}
          />
        ))}
      </motion.div>

      {jobs.length > visibleCount && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setVisibleCount((prev) => prev + 2)}
            className="group flex items-center gap-2 bg-white border-2 border-gray-100 px-8 py-3 rounded-2xl font-bold text-gray-600 hover:border-[#0C6A4E] hover:text-[#0C6A4E] transition-all duration-300 shadow-sm cursor-pointer"
          >
            Xem thêm công việc
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      )}
    </section>
  );
}
