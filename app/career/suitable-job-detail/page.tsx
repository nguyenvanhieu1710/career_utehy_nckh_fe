"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { LoginRequired } from "@/components/auth/LoginRequired";
import {
  JobOverviewCard,
  SkillsAnalysis,
  MatchVisualization,
  RadarChart,
  ImprovementSuggestions,
  EnhancedMatchScoreCard,
  ExpandableSection,
  TabbedSection,
  InteractiveFilters,
  QuickFilters,
} from "@/components/job-match";
import {
  mockJobData,
  mockMatchData,
  mockSkillsData,
  mockChartData,
  mockRadarData,
  mockSuggestions,
  mockFilterGroups,
  mockQuickFilters,
} from "@/mocks/mockSuitableJobData";

export default function SuitableJobDetailPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");

  const [isSaved, setIsSaved] = useState(false);

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show login required if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginRequired
        title="Đăng nhập để xem phân tích độ phù hợp"
        description="Bạn cần đăng nhập để xem chi tiết phân tích độ phù hợp giữa hồ sơ của bạn và công việc này."
      />
    );
  }

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save job API call
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleApply = () => {
    // TODO: Implement apply functionality
    console.log("Apply for job:", jobId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Job Overview Card */}
        <JobOverviewCard
          job={mockJobData}
          onSave={handleSaveJob}
          onShare={handleShare}
          onApply={handleApply}
          isSaved={isSaved}
          className="mb-6 bg-white"
        />

        {/* Enhanced Match Score Section */}
        <EnhancedMatchScoreCard
          overallScore={mockMatchData.overallScore}
          status={mockMatchData.status}
          statusColor={mockMatchData.statusColor}
          breakdown={mockMatchData.breakdown}
          previousScore={78}
          className="mb-6 bg-white"
        />

        <TabbedSection
          tabs={[
            {
              id: "overview",
              label: "Tổng quan",
              content: (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SkillsAnalysis
                    skills={mockSkillsData}
                    className="bg-white"
                  />
                  <RadarChart data={mockRadarData} className="bg-white" />
                </div>
              ),
            },
            {
              id: "detailed",
              label: "Chi tiết",
              content: (
                <MatchVisualization
                  data={mockChartData}
                  title="Biểu đồ phân tích trực quan"
                  className="bg-white"
                />
              ),
            },
            {
              id: "suggestions",
              label: "Gợi ý",
              badge: (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {mockSuggestions.length}
                </span>
              ),
              content: (
                <ImprovementSuggestions
                  suggestions={mockSuggestions}
                  className="bg-white"
                />
              ),
            },
          ]}
          defaultTab="overview"
          className="mb-6"
        />

        {/* Interactive Filters */}
        <ExpandableSection
          title="Bộ lọc nâng cao"
          defaultExpanded={false}
          className="mb-6"
        >
          <div className="space-y-4">
            <QuickFilters
              filters={mockQuickFilters}
              onFilterClick={(filterId) =>
                console.log("Quick filter:", filterId)
              }
            />
            <InteractiveFilters
              filterGroups={mockFilterGroups}
              onFiltersChange={(filters) =>
                console.log("Filters changed:", filters)
              }
            />
          </div>
        </ExpandableSection>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className={`px-8 py-3 border-2 font-medium rounded-lg transition-colors cursor-pointer ${
              isSaved
                ? "border-green-600 text-green-600 hover:bg-green-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={handleSaveJob}
          >
            {isSaved ? "Đã lưu" : "Lưu công việc"}
          </button>
          <Link
            href={`/career/jobs/${jobId || "demo"}`}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors text-center"
          >
            Xem chi tiết công việc
          </Link>
        </div>
      </div>
    </div>
  );
}
