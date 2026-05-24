'use client';
import { Card } from '@/components/ui/card';
import {
  Heart,
  Link2,
  Eye,
  ChevronDown,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import SectionTitle from '../common/SectionTitle';
import { useAuth } from '@/hooks/useAuth';
import { LoginRequired } from '@/components/auth/LoginRequired';
import { cvAPI } from '@/services/cv';
import { jobAPI } from '@/services/job';
import Link from 'next/link';

interface JobItemProps {
  id?: string | number;
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
  skill_improvement_suggestions?: string[];
  explanation?: string;
  url_source?: string;
  salary?: string;
  image_url?: string;
  scores?: {
    sim_title: number;
    sim_tech: number;
    sim_mota: number;
    loc_score: number;
    exp_score: number;
  };
}

type RecommendationMatch = {
  job_id: string;
  logo_url?: string;
  logo?: string;
  image_url?: string;
  job_title: string;
  company: string;
  location?: string;
  location_city?: string;
  compatibility_score: number;
  experience_required?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  skill_improvement_suggestions?: string[];
  match_explanation?: string;
  url_source?: string;
  salary?: string;
  scores?: {
    sim_title: number;
    sim_tech: number;
    sim_mota: number;
    loc_score: number;
    exp_score: number;
  };
};

type FallbackJobResponse = {
  id: string;
  company?: {
    logo_url?: string;
    logo?: string;
    name?: string;
  };
  image_url?: string;
  title: string;
  location?: string;
  years_of_experience?: number;
  url_source?: string;
};

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
  skill_improvement_suggestions,
  explanation,
  salary,
  image_url,
  url_source,
  scores,
}: JobItemProps & { url_source?: string }) => {
  const router = useRouter();
  const [isHeartFilled, setIsHeartFilled] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !job_id) {
      return false;
    }

    try {
      const savedFavorites = localStorage.getItem('favorite_job_ids');
      if (!savedFavorites) return false;
      const favoriteIds = JSON.parse(savedFavorites);
      if (!Array.isArray(favoriteIds)) return false;
      return favoriteIds.includes(String(job_id));
    } catch {
      return false;
    }
  });

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
        skill_improvement_suggestions,
        explanation,
        url_source,
        salary,
        image_url,
        logo,
        scores,
      };
      // console.log("Saving job data to sessionStorage:", jobData);
      // Lưu toàn bộ dữ liệu vào sessionStorage thay vì nối vào URL
      sessionStorage.setItem('selected_job_detail', JSON.stringify(jobData));
      // console.log("Executing router.push to /career/suitable-job-detail");
      router.push(`/career/suitable-job-detail`);
    } else {
      console.error('handleViewDetail Failed: job_id is undefined or null', {
        job_id,
        title,
        company,
      });
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const savedFavorites = localStorage.getItem('favorite_job_ids');
    let favoriteIds: string[] = [];
    if (savedFavorites) {
      try {
        favoriteIds = JSON.parse(savedFavorites);
      } catch {
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

    localStorage.setItem('favorite_job_ids', JSON.stringify(nextFavorites));
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (url_source) {
      let finalUrl = url_source;
      if (!finalUrl.startsWith('http')) {
        finalUrl = 'https://' + finalUrl;
      }
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
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
        ease: 'easeOut',
      }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <Card
        className={twMerge(
          'bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group cursor-pointer'
        )}
        onClick={handleViewDetail}
      >
        <div className='absolute inset-0 bg-gradient-to-r from-green-50 via-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        <div className='relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6'>
          <div className='flex items-start gap-4 flex-1 w-full'>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className='w-16 h-16 sm:w-25 sm:h-25 shrink-0 rounded-xl bg-white shadow-md flex items-center justify-center p-2 border border-gray-100'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo || '/default-job.png'}
                alt={company}
                className='max-w-full max-h-full object-contain'
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('default-job.png')) {
                    target.src = '/default-job.png';
                  }
                }}
              />
            </motion.div>

            <div className='space-y-2 flex-1'>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-[#0C6A4E] transition-colors duration-300 line-clamp-1'>
                {title}
              </h3>
              <p className='text-sm text-gray-600 font-medium'>{company}</p>
              {location && location !== 'Chưa cập nhật' && (
                <p className='text-sm text-gray-400 mt-1 flex items-center gap-1'>
                  <span className='w-1 h-1 bg-gray-400 rounded-full inline-block'></span>
                  {location}
                </p>
              )}

              <div className='flex items-center gap-4 pt-2'>
                <button
                  onClick={handleLinkClick}
                  className='flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#0C6A4E] transition-colors duration-300 cursor-pointer'
                >
                  <Link2 className='w-4 h-4' />
                  <span>Link</span>
                </button>
                <button
                  onClick={handleHeartClick}
                  className='flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors duration-300 cursor-pointer'
                >
                  <Heart
                    className={`w-4 h-4 ${isHeartFilled ? 'fill-red-600 text-red-600' : ''}`}
                  />
                  <span>Yêu thích</span>
                </button>
              </div>
            </div>
          </div>

          <div className='w-full sm:w-auto text-center sm:text-right space-y-3 shrink-0'>
            <div
              className={clsx(
                'text-4xl font-bold transition-all duration-300',
                compatibility >= 50 ? 'text-green-600' : 'text-red-500'
              )}
            >
              {compatibility > 0 ? `${compatibility}%` : 'NEW'}
            </div>
            <p
              className={clsx(
                'text-xs uppercase tracking-wider font-medium',
                compatibility >= 50 ? 'text-green-600' : 'text-red-500'
              )}
            >
              {compatibility > 0 ? 'Tỷ lệ phù hợp' : 'Công việc mới'}
            </p>

            {compatibility > 0 ? (
              <button
                className='mt-3 rounded-lg font-medium px-4 py-2.5 text-sm flex items-center justify-center sm:justify-start w-full sm:w-auto cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                onClick={handleViewDetail}
              >
                <Eye className='w-4 h-4 mr-1.5' />
                Xem chi tiết
              </button>
            ) : (
              <button
                className='mt-3 rounded-lg font-medium px-4 py-2.5 text-sm flex items-center justify-center sm:justify-start w-full sm:w-auto cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md text-white bg-gradient-to-r from-[#0C6A4E] to-[#0a5441] hover:from-[#0a5441] hover:to-[#084233]'
                onClick={handleLinkClick}
              >
                <ExternalLink className='w-4 h-4 mr-1.5' />
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
    <section className='py-16 px-7'>
      <div className='flex justify-between items-center mb-8'>
        <SectionTitle title='CÔNG VIỆC PHÙ HỢP VỚI BẠN' />
      </div>
      <LoginRequired
        title='Đăng nhập để xem công việc phù hợp'
        description='Hệ thống sẽ phân tích hồ sơ của bạn và gợi ý những công việc phù hợp nhất. Đăng nhập ngay để khám phá cơ hội nghề nghiệp dành riêng cho bạn!'
        showSignup={true}
      />
    </section>
  );
};

export default function SuitableJobs() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<JobItemProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noCv, setNoCv] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);
  const [selectedSource, setSelectedSource] = useState<'profile' | 'file' | 'auto'>('profile');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchRecommendations = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated) return;

      const cacheKey = 'auto_recommendations_cache';

      // Check cache
      if (!forceRefresh) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setJobs(parsed.jobs);
            setNoCv(parsed.noCv);
            return; // Skip API call if we have cache
          } catch {
            console.error('Cache parsing error');
          }
        }
      }

      setLoading(true);
      setError(null);
      setNoCv(false);

      try {
        const res = await cvAPI.getAutoRecommendations(
          10,
          forceRefresh ? (selectedSource === 'auto' ? undefined : selectedSource) : undefined
        );
        // console.log("Recommend API Response:", res.data); // Added log for debugging

        if (res.data?.success) {
          const { matches, mode } = res.data;

          if (matches && matches.length > 0) {
            const mappedJobs = (matches as RecommendationMatch[]).map((rec) => ({
              id: rec.job_id,
              logo: rec.logo_url || rec.logo || rec.image_url || '/default-job.png',
              title: rec.job_title,
              company: rec.company,
              location: rec.location || rec.location_city,
              compatibility: Math.round(rec.compatibility_score),
              experience_required: rec.experience_required || 'Chưa cập nhật',
              matched_skills: rec.matched_skills,
              missing_skills: rec.missing_skills,
              skill_improvement_suggestions: rec.skill_improvement_suggestions,
              explanation: rec.match_explanation,
              url_source: rec.url_source,
              salary: rec.salary,
              image_url: rec.image_url,
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
                mode: mode || 'none',
                noCv: false,
              })
            );
          } else if (mode === 'none') {
            setNoCv(true);
            const fallbackRes = await jobAPI.getJobs({ page: 1, row: 10 });
            if (fallbackRes?.data) {
              const fallbackJobs = (fallbackRes.data as FallbackJobResponse[]).map((j) => ({
                id: j.id,
                logo: j.company?.logo_url || j.company?.logo || j.image_url || '/default-job.png',
                title: j.title,
                company: j.company?.name || 'Đang cập nhật',
                location: j.location,
                compatibility: 0,
                experience_required: j.years_of_experience
                  ? `${j.years_of_experience} năm`
                  : 'Chưa cập nhật',
                url_source: j.url_source,
              }));
              setJobs(fallbackJobs);

              // Save fallback to cache
              sessionStorage.setItem(
                cacheKey,
                JSON.stringify({
                  jobs: fallbackJobs,
                  mode: 'none',
                  noCv: true,
                })
              );
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Không thể kết nối với hệ thống AI lúc này.');
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, selectedSource]
  );

  useEffect(() => {
    fetchRecommendations(true);
  }, [fetchRecommendations]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  if (authLoading || loading) {
    return (
      <section className='py-16 px-4'>
        <div className='flex flex-col justify-center items-center py-20 space-y-4 text-center'>
          <Loader2 className='h-12 w-12 text-[#0C6A4E] animate-spin' />
          <p className='text-gray-500 font-medium'>
            AI đang phân tích hồ sơ và tìm việc phù hợp cho bạn...
          </p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) return <LoginRequiredSection />;

  if (error) {
    return (
      <section className='py-16 px-7 text-center'>
        <SectionTitle title='CÔNG VIỆC PHÙ HỢP VỚI BẠN' />
        <div className='mt-8 p-10 bg-red-50 border border-red-100 rounded-3xl max-w-2xl mx-auto'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-xl font-bold text-gray-900 mb-2'>Hệ thống bận</h3>
          <p className='text-gray-600 mb-6'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-[#0C6A4E] text-white px-8 py-2 rounded-xl cursor-pointer'
          >
            Thử lại
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className='py-16 px-7'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
        <SectionTitle title='CÔNG VIỆC PHÙ HỢP VỚI BẠN' />

        <div className='relative'>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className='flex items-center gap-2 px-4 py-2 bg-[#0C6A4E]/10 border border-[#0C6A4E]/20 rounded-full cursor-pointer hover:bg-[#0C6A4E]/20 transition-all duration-300'
          >
            <div className='flex h-2 w-2 relative'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0C6A4E] opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-[#0C6A4E]'></span>
            </div>
            <span className='text-xs font-bold text-[#0C6A4E] uppercase tracking-wider flex items-center gap-1'>
              AI Gợi ý từ:{' '}
              <span className='underline decoration-dotted underline-offset-4'>
                {selectedSource === 'profile'
                  ? 'CV Online'
                  : selectedSource === 'file'
                    ? 'CV PDF'
                    : 'Tự động'}
              </span>
              <ChevronDown
                className={clsx(
                  'w-3 h-3 transition-transform duration-300',
                  isDropdownOpen && 'rotate-180'
                )}
              />
            </span>
          </motion.div>

          {isDropdownOpen && (
            <>
              <div className='fixed inset-0 z-40' onClick={() => setIsDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className='absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden'
              >
                <div className='p-1'>
                  {[
                    {
                      id: 'profile' as const,
                      label: 'CV Online',
                      icon: <Eye className='w-4 h-4' />,
                    },
                    {
                      id: 'file' as const,
                      label: 'CV PDF',
                      icon: <FileText className='w-4 h-4' />,
                    },
                    {
                      id: 'auto' as const,
                      label: 'Tự động',
                      icon: <AlertCircle className='w-4 h-4' />,
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedSource(option.id);
                        setIsDropdownOpen(false);
                      }}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200',
                        selectedSource === option.id
                          ? 'bg-[#0C6A4E] text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {noCv && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-green-50 border border-green-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6'
        >
          <div className='flex items-center gap-4'>
            <div className='bg-white p-3 rounded-xl shadow-sm shrink-0'>
              <FileText className='h-6 w-6 text-[#0C6A4E]' />
            </div>
            <div>
              <h4 className='font-bold text-gray-900'>Nâng cao hiệu quả gợi ý của AI!</h4>
              <p className='text-sm text-gray-600'>
                Bạn chưa có CV. Hãy tạo CV để AI có thể phân tích và đưa ra các gợi ý việc làm chính
                xác nhất.
              </p>
            </div>
          </div>
          <Link
            href='/cv'
            className='bg-[#0C6A4E] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0a5441] transition-all shadow-md text-sm'
          >
            Tạo CV ngay
          </Link>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true }}
        className='grid grid-cols-1 lg:grid-cols-2 gap-6'
      >
        {jobs.slice(0, visibleCount).map((job, index) => (
          <JobItem key={job.id || index} job_id={job.id} {...job} index={index} />
        ))}
      </motion.div>

      {jobs.length > visibleCount && (
        <div className='flex justify-center mt-12'>
          <button
            onClick={() => setVisibleCount((prev) => prev + 2)}
            className='group flex items-center gap-2 bg-white border-2 border-gray-100 px-8 py-3 rounded-2xl font-bold text-gray-600 hover:border-[#0C6A4E] hover:text-[#0C6A4E] transition-all duration-300 shadow-sm cursor-pointer'
          >
            Xem thêm công việc
            <ChevronDown className='w-5 h-5 group-hover:translate-y-1 transition-transform duration-300' />
          </button>
        </div>
      )}
    </section>
  );
}
