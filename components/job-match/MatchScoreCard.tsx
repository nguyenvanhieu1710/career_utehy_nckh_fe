"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface MatchBreakdown {
  [key: string]: {
    score: number;
    label: string;
  };
}

interface MatchScoreCardProps {
  overallScore: number;
  status: string;
  statusColor: string;
  breakdown: MatchBreakdown;
  className?: string;
}

export function MatchScoreCard({
  overallScore,
  status,
  statusColor,
  breakdown,
  className = "",
}: MatchScoreCardProps) {
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">
          <span className="text-blue-600 font-bold text-lg">
            PHÂN TÍCH ĐỘ PHÙ HỢP
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Overall Score Circle */}
          <div className="flex-shrink-0 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Background Circle */}
              <svg
                className="w-32 h-32 transform -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress Circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 50 * (1 - overallScore / 100)
                  }`}
                  className={`${getScoreColor(
                    overallScore
                  )} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      overallScore
                    )}`}
                  >
                    {overallScore}%
                  </div>
                  <div className="text-xs text-gray-600">Phù hợp</div>
                </div>
              </div>
            </div>
            <Badge className={`${statusColor} text-white px-4 py-1`}>
              {status}
            </Badge>
          </div>

          <Separator orientation="vertical" className="hidden lg:block h-32" />

          {/* Breakdown Scores */}
          <div className="flex-1 w-full">
            <h3 className="font-semibold text-gray-900 mb-4">
              Chi tiết phân tích
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(breakdown).map(([key, data]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {data.label}
                    </span>
                    <span
                      className={`text-sm font-bold ${getScoreColor(
                        data.score
                      )}`}
                    >
                      {data.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                        data.score
                      )}`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
