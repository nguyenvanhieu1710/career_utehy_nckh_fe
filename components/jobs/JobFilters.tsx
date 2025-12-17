"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  LucideIcon,
} from "lucide-react";
import { JobFilters as JobFiltersType } from "@/types/job";
import {
  JOB_TYPES,
  WORK_ARRANGEMENTS,
  SALARY_RANGES,
  POSTED_WITHIN,
  COMPANY_SIZES,
  EXPERIENCE_LEVELS,
} from "@/constants/job";
import { VIETNAM_CITIES, POPULAR_SKILLS } from "@/constants/job";

// FilterSection component moved outside to avoid recreation during render
interface FilterSectionProps {
  title: string;
  icon: LucideIcon;
  sectionKey: string;
  children: React.ReactNode;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}

const FilterSection = ({
  title,
  icon: Icon,
  sectionKey,
  children,
  expandedSections,
  toggleSection,
}: FilterSectionProps) => (
  <div className="border-b cursor-pointer border-gray-100 last:border-b-0">
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="h-4 w-4 text-gray-400" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-400" />
      )}
    </button>

    <AnimatePresence>
      {expandedSections[sectionKey] && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  onReset?: () => void;
  loading?: boolean;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const JobFilters = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
  className = "",
  isOpen = true,
  onToggle,
}: JobFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    location: true,
    jobType: true,
    workArrangement: true,
    salary: false,
    posted: false,
    skills: false,
    company: false,
    experience: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilters = (updates: Partial<JobFiltersType>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleJobTypeChange = (jobType: string, checked: boolean) => {
    const currentTypes = filters.job_types || [];
    const newTypes = checked
      ? [...currentTypes, jobType]
      : currentTypes.filter((type) => type !== jobType);
    updateFilters({ job_types: newTypes });
  };

  const handleWorkArrangementChange = (
    arrangement: string,
    checked: boolean
  ) => {
    const currentArrangements = filters.work_arrangements || [];
    const newArrangements = checked
      ? [...currentArrangements, arrangement]
      : currentArrangements.filter((arr) => arr !== arrangement);
    updateFilters({ work_arrangements: newArrangements });
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    const currentSkills = filters.skills || [];
    const newSkills = checked
      ? [...currentSkills, skill]
      : currentSkills.filter((s) => s !== skill);
    updateFilters({ skills: newSkills });
  };

  const handleCompanySizeChange = (size: string, checked: boolean) => {
    const currentSizes = filters.company_size || [];
    const newSizes = checked
      ? [...currentSizes, size]
      : currentSizes.filter((s) => s !== size);
    updateFilters({ company_size: newSizes });
  };

  const handleExperienceLevelChange = (level: string, checked: boolean) => {
    const currentLevels = filters.experience_level || [];
    const newLevels = checked
      ? [...currentLevels, level]
      : currentLevels.filter((l) => l !== level);
    updateFilters({ experience_level: newLevels });
  };

  const handleSalaryRangeChange = (min?: number, max?: number | null) => {
    updateFilters({
      salary_range: {
        min: min,
        max: max === null ? undefined : max,
      },
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.job_types?.length) count += filters.job_types.length;
    if (filters.work_arrangements?.length)
      count += filters.work_arrangements.length;
    if (filters.salary_range?.min || filters.salary_range?.max) count++;
    if (filters.posted_within) count++;
    if (filters.skills?.length) count += filters.skills.length;
    if (filters.company_size?.length) count += filters.company_size.length;
    if (filters.experience_level?.length)
      count += filters.experience_level.length;
    return count;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={onReset}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              title="Xóa tất cả bộ lọc"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          {onToggle && (
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Content */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto cursor-pointer">
        {/* Location */}
        <FilterSection
          title="Địa điểm"
          icon={MapPin}
          sectionKey="location"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <select
            value={filters.location || ""}
            onChange={(e) =>
              updateFilters({ location: e.target.value || undefined })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 bg-white cursor-pointer"
            disabled={loading}
          >
            <option value="">Tất cả địa điểm</option>
            {VIETNAM_CITIES.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </FilterSection>

        {/* Job Type */}
        <FilterSection
          title="Loại công việc"
          icon={Briefcase}
          sectionKey="jobType"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-2">
            {JOB_TYPES.map((type) => (
              <label
                key={type.value}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.job_types?.includes(type.value) || false}
                  onChange={(e) =>
                    handleJobTypeChange(type.value, e.target.checked)
                  }
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Work Arrangement */}
        <FilterSection
          title="Hình thức làm việc"
          icon={Users}
          sectionKey="workArrangement"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-2">
            {WORK_ARRANGEMENTS.map((arrangement) => (
              <label
                key={arrangement.value}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    filters.work_arrangements?.includes(arrangement.value) ||
                    false
                  }
                  onChange={(e) =>
                    handleWorkArrangementChange(
                      arrangement.value,
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {arrangement.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Salary Range */}
        <FilterSection
          title="Mức lương"
          icon={DollarSign}
          sectionKey="salary"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-2">
            {SALARY_RANGES.map((range, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="salaryRange"
                  checked={
                    filters.salary_range?.min === range.min &&
                    filters.salary_range?.max === range.max
                  }
                  onChange={() => handleSalaryRangeChange(range.min, range.max)}
                  className="border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Posted Within */}
        <FilterSection
          title="Thời gian đăng"
          icon={Clock}
          sectionKey="posted"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-2">
            {POSTED_WITHIN.map((option) => (
              <label
                key={option.value}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="postedWithin"
                  checked={filters.posted_within === option.value}
                  onChange={() =>
                    updateFilters({ posted_within: option.value })
                  }
                  className="border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="postedWithin"
                checked={!filters.posted_within}
                onChange={() => updateFilters({ posted_within: undefined })}
                className="border-gray-300 text-green-600 focus:ring-green-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-700">Tất cả</span>
            </label>
          </div>
        </FilterSection>

        {/* Skills */}
        <FilterSection
          title="Kỹ năng"
          icon={Briefcase}
          sectionKey="skills"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {POPULAR_SKILLS.map((skill) => (
              <label key={skill} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.skills?.includes(skill) || false}
                  onChange={(e) => handleSkillChange(skill, e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Company Size */}
        <FilterSection
          title="Quy mô công ty"
          icon={Users}
          sectionKey="company"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-2">
            {COMPANY_SIZES.map((size) => (
              <label
                key={size.value}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.company_size?.includes(size.value) || false}
                  onChange={(e) =>
                    handleCompanySizeChange(size.value, e.target.checked)
                  }
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">{size.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Experience Level */}
        <FilterSection
          title="Kinh nghiệm"
          icon={Briefcase}
          sectionKey="experience"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <label
                key={level.value}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    filters.experience_level?.includes(level.value) || false
                  }
                  onChange={(e) =>
                    handleExperienceLevelChange(level.value, e.target.checked)
                  }
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {level.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </motion.div>
  );
};
