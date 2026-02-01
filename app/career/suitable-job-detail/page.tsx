"use client";

import { useState, Suspense } from "react";

import { useAuth } from "@/hooks/useAuth";
import { LoginRequired } from "@/components/auth/LoginRequired";
import {
  JobOverviewCard,
  SkillsAnalysis,
  MatchVisualization,
  ImprovementSuggestions,
  EnhancedMatchScoreCard,
} from "@/components/job-match";
import {
  mockJobData,
  mockMatchData,
  mockSkillsData,
  mockChartData,
  mockSuggestions,
} from "@/mocks/mockSuitableJobData";

function SuitableJobDetailContent() {
  const { isAuthenticated, isLoading } = useAuth();

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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-center text-3xl sm:text-4xl font-bold tracking-wide text-indigo-600 mb-6">
          PHÂN TÍCH ĐỘ PHÙ HỢP
        </h1>

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

        <div className="space-y-6 mb-6">
          <SkillsAnalysis skills={mockSkillsData} className="bg-white" />

          <ImprovementSuggestions suggestions={mockSuggestions} className="bg-white" />

          <MatchVisualization
            data={mockChartData}
            title="Biểu đồ phân tích trực quan"
            className="bg-white"
          />
        </div>        
      </div>
    </div>
  );
}

export default function SuitableJobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <SuitableJobDetailContent />
    </Suspense>
  );
}
