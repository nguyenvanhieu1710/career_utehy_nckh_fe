"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CircularProgress, AnimatedProgress } from "./AnimatedProgress";
import { InteractiveTooltip } from "./InteractiveTooltip";

interface MatchBreakdown {
  [key: string]: {
    score: number;
    label: string;
    trend?: "up" | "down" | "stable";
    improvement?: number;
    description?: string;
  };
}

interface EnhancedMatchScoreCardProps {
  overallScore: number;
  status: string;
  statusColor: string;
  breakdown: MatchBreakdown;
  previousScore?: number;
  className?: string;
}

export function EnhancedMatchScoreCard({
  overallScore,
  status,
  statusColor,
  breakdown,
  previousScore,
  className = "",
}: EnhancedMatchScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  // Initialize animation delay directly instead of using useEffect
  const animationDelay = 500;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      case "stable":
        return <Minus className="h-3 w-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (score: number) => {
    if (score >= 80) return "🎯";
    if (score >= 60) return "⚡";
    return "🔧";
  };

  const scoreDifference = previousScore ? overallScore - previousScore : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <span className="text-green-900 font-bold text-3xl">
              CHI TIẾT PHÂN TÍCH
            </span>
            <InteractiveTooltip
              content={
                <div className="space-y-2">
                  <p className="font-medium">Độ phù hợp được tính dựa trên:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Kỹ năng chuyên môn (30%)</li>
                    <li>• Kinh nghiệm làm việc (25%)</li>
                    <li>• Học vấn (20%)</li>
                    <li>• Kỹ năng mềm (15%)</li>
                    <li>• Chứng chỉ (10%)</li>
                  </ul>
                </div>
              }
            >
              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </InteractiveTooltip>
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Overall Score Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0 text-center"
          >
            <CircularProgress
              value={overallScore}
              size={140}
              strokeWidth={10}
              color={
                overallScore >= 80
                  ? "#22c55e"
                  : overallScore >= 60
                  ? "#f59e0b"
                  : "#ef4444"
              }
              delay={300}
              duration={2}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-4 space-y-2"
            >
              <Badge className={`${statusColor} text-white px-4 py-1`}>
                <span className="mr-1">{getStatusIcon(overallScore)}</span>
                {status}
              </Badge>

              {scoreDifference !== null && (
                <div
                  className={`text-sm flex items-center justify-center gap-1 ${
                    scoreDifference > 0
                      ? "text-green-600"
                      : scoreDifference < 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {getTrendIcon(
                    scoreDifference > 0
                      ? "up"
                      : scoreDifference < 0
                      ? "down"
                      : "stable"
                  )}
                  <span>
                    {scoreDifference > 0 ? "+" : ""}
                    {scoreDifference}% so với lần trước
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>

          <Separator orientation="vertical" className="hidden lg:block h-32" />

          {/* Breakdown Scores */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Chi tiết phân tích
              </h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(breakdown).map(([key, data], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: animationDelay / 1000 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {data.label}
                      </span>
                      {data.trend && getTrendIcon(data.trend)}
                      {data.description && (
                        <InteractiveTooltip content={data.description}>
                          <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                        </InteractiveTooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${getScoreColor(
                          data.score
                        )}`}
                      >
                        {data.score}%
                      </span>
                      {data.improvement && (
                        <span className="text-xs text-green-600">
                          +{data.improvement}%
                        </span>
                      )}
                    </div>
                  </div>

                  <AnimatedProgress
                    value={data.score}
                    color={getProgressColor(data.score)}
                    delay={animationDelay + index * 100}
                    duration={0.8}
                    height="h-2"
                  />

                  {showDetails && data.description && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-gray-600 mt-1"
                    >
                      {data.description}
                    </motion.p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-600">
                {
                  Object.values(breakdown).filter((item) => item.score >= 80)
                    .length
                }
              </div>
              <div className="text-xs text-gray-600">Điểm mạnh</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-yellow-600">
                {
                  Object.values(breakdown).filter(
                    (item) => item.score >= 60 && item.score < 80
                  ).length
                }
              </div>
              <div className="text-xs text-gray-600">Tốt</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-red-600">
                {
                  Object.values(breakdown).filter((item) => item.score < 60)
                    .length
                }
              </div>
              <div className="text-xs text-gray-600">Cần cải thiện</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(
                  Object.values(breakdown).reduce(
                    (sum, item) => sum + item.score,
                    0
                  ) / Object.values(breakdown).length
                )}
                %
              </div>
              <div className="text-xs text-gray-600">Trung bình</div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
