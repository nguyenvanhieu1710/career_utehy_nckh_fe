"use client";

import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/Button";

type TitleId = "job" | "studient" | "company";

const studentAvatars = [
  "/avatars/avatar-1.jpeg",
  "/avatars/avatar-2.jpg",
  "/avatars/avatar-3.jpg",
  "/avatars/avatar-4.jpg",
  "/avatars/avatar-5.jpg",
  "/avatars/avatar-6.jpg",
];

// Search data
const searchData = {
  locations: [
    "Hà Nội",
    "TP.HCM",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Bình Dương",
    "Đồng Nai",
    "Khánh Hòa",
  ],
  industries: [
    "IT - Phần mềm",
    "Marketing - PR",
    "Kế toán - Kiểm toán",
    "Nhân sự",
    "Bán hàng",
    "Thiết kế",
    "Giáo dục",
    "Y tế",
  ],
  job_types: [
    "Toàn thời gian",
    "Bán thời gian",
    "Thực tập",
    "Freelance",
    "Hợp đồng",
  ],
  salaries: [
    "Dưới 10 triệu",
    "10-15 triệu",
    "15-25 triệu",
    "25-40 triệu",
    "40-60 triệu",
    "Trên 60 triệu",
  ],
  levels: ["Thực tập sinh", "Nhân viên", "Trưởng nhóm", "Quản lý", "Giám đốc"],
  experiences: [
    "Không yêu cầu",
    "Dưới 1 năm",
    "1-3 năm",
    "3-5 năm",
    "5-10 năm",
    "Trên 10 năm",
  ],
};

const filterIcons = {
  location: MapPin,
  industry: Briefcase,
  jobType: Clock,
  salary: DollarSign,
  level: TrendingUp,
  experience: Award,
};

const heroTitles: {
  id: TitleId;
  data: { amount: string; verd: string; sub: string };
}[] = [
  {
    id: "studient",
    data: {
      amount: "{amount}+",
      verd: "SINH VIÊN",
      sub: "ĐANG XIN VIỆC",
    },
  },
  {
    id: "company",
    data: {
      amount: "{amount}+",
      verd: "CÔNG TY",
      sub: "ĐANG TUYỂN DỤNG",
    },
  },
  {
    id: "job",
    data: {
      amount: "{amount}+",
      verd: "VIỆC LÀM",
      sub: "ĐANG ĐĂNG TUYỂN",
    },
  },
];

export function HeroSearch() {
  const router = useRouter();
  const MAX_QUERY_LENGTH = 255;
  const [titleDataIndex, setTitleDataIndex] = useState(0);
  const [titleAmountData] = useState<Record<TitleId, number>>({
    job: 24043,
    studient: 92395,
    company: 2357,
  });

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showMaxLengthDialog, setShowMaxLengthDialog] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    industry: "",
    jobType: "",
    salary: "",
    level: "",
    experience: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Popular search suggestions - moved to useMemo to fix dependency issue
  const popularSearches = useMemo(
    () => [
      "Frontend Developer",
      "Backend Developer",
      "Marketing Manager",
      "UI/UX Designer",
      "Data Analyst",
      "Product Manager",
    ],
    [],
  );

  // --- Auto change title every 3s ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleDataIndex((prev) => {
        const next = prev + 1;
        return next > 2 ? 0 : next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle search input change with suggestions - optimized to avoid cascading renders
  const filteredSuggestions = useMemo(() => {
    if (searchQuery.length > 2) {
      return popularSearches
        .filter((search) =>
          search.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 4);
    }
    return [];
  }, [searchQuery, popularSearches]);

  useEffect(() => {
    setSuggestions(filteredSuggestions);
  }, [filteredSuggestions]);

  // Handle search submission
  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim().slice(0, MAX_QUERY_LENGTH);
    if (!trimmedQuery && !Object.values(filters).some((f) => f)) return;

    setIsSearching(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Build query params
    const params = new URLSearchParams();
    if (trimmedQuery) params.set("query", trimmedQuery);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Navigate to jobs page
    router.push(`/career/jobs?${params.toString()}`);
    setIsSearching(false);
  };

  // Handle filter change
  const handleFilterChange = (
    filterType: keyof typeof filters,
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      location: "",
      industry: "",
      jobType: "",
      salary: "",
      level: "",
      experience: "",
    });
    setSearchQuery("");
  };

  const currentTitle = heroTitles[titleDataIndex];

  const triggerMaxLengthWarning = () => {
    setShowMaxLengthDialog(true);
  };

  return (
    <section className="flex gap-3 bg-white py-12 p-3 min-h-screen">
      <div className="flex-1 container mx-auto px-4 mb-20">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 md:mb-4 flex flex-wrap items-center gap-2 md:gap-3">
          <span>CÓ</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentTitle.id + "-amount"}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[#5959EB] inline-block"
            >
              {currentTitle.data.amount.replace(
                "{amount}",
                titleAmountData[currentTitle.id]?.toLocaleString("vi-VN"),
              )}
            </motion.span>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.span
              key={currentTitle.id + "-verd"}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              {currentTitle.data.verd}
            </motion.span>
          </AnimatePresence>
        </h1>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#000000] mb-6 md:mb-8">
          ĐANG{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={currentTitle.id + "-sub"}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              {currentTitle.data.sub.replace("ĐANG ", "")}
            </motion.span>
          </AnimatePresence>
        </h2>

        <p className="text-gray-700 text-base md:text-lg lg:text-xl mb-8 md:mb-12 max-w-2xl">
          Hệ thống thu thập và gợi ý việc làm cho sinh viên
        </p>

        {/* Avatars */}
        <div className="flex items-center mb-10 md:mb-14">
          <div className="flex">
            {studentAvatars.map((_, i) => (
              <div
                key={i}
                className="relative"
                style={{
                  marginLeft: i === 0 ? 0 : "-1rem",
                  zIndex: studentAvatars.length - i,
                }}
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-4 border-white shadow-md hover:scale-110 transition-transform duration-300 hover:z-10"
                  style={{
                    zIndex: studentAvatars.length - i,
                  }}
                >
                  <img src={_} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
            <div
              className="relative"
              style={{
                marginLeft: "-1rem",
                zIndex: 0,
              }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-green-100 border-4 border-white flex items-center justify-center shadow-md">
                <span className="text-green-700 font-bold text-sm sm:text-base md:text-lg">
                  +99
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            {/* Search Input with Suggestions */}
            <div className="relative flex-2">
              <motion.div
                className={`relative transition-all duration-300 ${
                  isSearchFocused ? "transform scale-[1.02]" : ""
                }`}
              >
                <motion.div
                  animate={{
                    x: isSearchFocused ? [0, -2, 2, 0] : 0,
                    scale: isSearchFocused ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 z-10"
                >
                  <Search />
                </motion.div>

                <input
                  type="text"
                  value={searchQuery}
                  maxLength={MAX_QUERY_LENGTH}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    if (nextValue.length > MAX_QUERY_LENGTH) {
                      const capped = nextValue.slice(0, MAX_QUERY_LENGTH);
                      e.currentTarget.value = capped;
                      setSearchQuery(capped);
                      triggerMaxLengthWarning();
                      return;
                    }
                    setSearchQuery(nextValue);
                  }}
                  onBeforeInput={(e) => {
                    if (isComposing) return;
                    if (searchQuery.length < MAX_QUERY_LENGTH) return;
                    e.preventDefault();
                    triggerMaxLengthWarning();
                  }}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={(e) => {
                    setIsComposing(false);
                    const composedValue = (e.currentTarget.value || "").slice(
                      0,
                      MAX_QUERY_LENGTH
                    );
                    if (composedValue.length < e.currentTarget.value.length) {
                      triggerMaxLengthWarning();
                    }
                    setSearchQuery(composedValue);
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text");
                    if (!pasted) return;
                    const nextLength = searchQuery.length + pasted.length;
                    if (nextLength <= MAX_QUERY_LENGTH) return;

                    e.preventDefault();
                    const remaining = Math.max(
                      0,
                      MAX_QUERY_LENGTH - searchQuery.length
                    );
                    if (remaining > 0) {
                      setSearchQuery((prev) =>
                        (prev + pasted.slice(0, remaining)).slice(
                          0,
                          MAX_QUERY_LENGTH
                        )
                      );
                    }
                    triggerMaxLengthWarning();
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSearchFocused(false), 200)
                  }
                  placeholder="Nhập tên công việc, công ty..."
                  className={`w-full pl-12 pr-4 py-3 sm:py-4 rounded-lg border transition-all duration-300 focus:outline-none text-gray-700 text-sm sm:text-base ${
                    isSearchFocused
                      ? "border-green-700 ring-2 ring-green-700/20 shadow-lg bg-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </motion.div>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setIsSearchFocused(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Search className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{suggestion}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Button */}
            <motion.button
              onClick={handleSearch}
              disabled={isSearching}
              className={`flex-1 sm:flex-none sm:px-8 py-3 sm:py-4 cursor-pointer rounded-lg font-semibold text-white transition-all duration-300 relative overflow-hidden group ${
                isSearching
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800 shadow-lg hover:shadow-xl"
              }`}
              whileHover={!isSearching ? { scale: 1.05 } : {}}
              whileTap={!isSearching ? { scale: 0.98 } : {}}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: isSearching ? "100%" : "-100%" }}
                transition={{ duration: 1, repeat: isSearching ? Infinity : 0 }}
              />

              <div className="relative flex items-center justify-center gap-2">
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tìm...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Tìm việc</span>
                  </>
                )}
              </div>

              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-lg"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>
          </div>

          {/* Enhanced Filter Dropdowns */}
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              {
                key: "location",
                label: "Địa điểm",
                data: searchData.locations,
                icon: filterIcons.location,
              },
              {
                key: "industry",
                label: "Ngành nghề",
                data: searchData.industries,
                icon: filterIcons.industry,
              },
              {
                key: "jobType",
                label: "Loại hình",
                data: searchData.job_types,
                icon: filterIcons.jobType,
              },
              {
                key: "salary",
                label: "Mức lương",
                data: searchData.salaries,
                icon: filterIcons.salary,
              },
              {
                key: "level",
                label: "Cấp bậc",
                data: searchData.levels,
                icon: filterIcons.level,
              },
              {
                key: "experience",
                label: "Kinh nghiệm",
                data: searchData.experiences,
                icon: filterIcons.experience,
              },
            ].map((filter, i) => {
              const IconComponent = filter.icon;
              return (
                <motion.div
                  key={filter.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                  className="relative"
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <IconComponent className="w-4 h-4 text-gray-500" />
                  </div>
                  <select
                    value={filters[filter.key as keyof typeof filters]}
                    onChange={(e) =>
                      handleFilterChange(
                        filter.key as keyof typeof filters,
                        e.target.value,
                      )
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border text-gray-600 text-sm transition-all duration-300 appearance-none cursor-pointer ${
                      filters[filter.key as keyof typeof filters]
                        ? "bg-[#5959EB]/10 border-[#5959EB] text-[#5959EB] font-medium"
                        : "bg-[#ECECEC] border-gray-300 hover:border-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <option value="">Tất cả {filter.label}</option>
                    {filter.data.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Clear Filters Button */}
          <AnimatePresence>
            {Object.values(filters).some((f) => f) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 text-center"
              >
                <motion.button
                  onClick={clearAllFilters}
                  className="text-[#5959EB] hover:text-[#4A4AE6] font-medium text-sm transition-colors duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Xóa tất cả bộ lọc
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="hidden lg:block flex-1 relative min-h-[400px] lg:min-h-0">
        <img
          src={"./peoplescareer.jpg"}
          className="absolute inset-0 w-full h-full object-cover lg:object-contain rounded-lg"
          alt="People in career"
        />
      </div>

      {/* Max Length Warning Dialog */}
      <Dialog open={showMaxLengthDialog} onOpenChange={setShowMaxLengthDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Giới hạn ký tự</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600">
            Bạn chỉ có thể nhập tối đa <span className="font-semibold">{MAX_QUERY_LENGTH}</span> ký tự cho tìm kiếm.
          </div>
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              value="Đóng"
              onClick={() => setShowMaxLengthDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
