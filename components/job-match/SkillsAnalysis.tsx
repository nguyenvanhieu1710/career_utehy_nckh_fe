"use client";

import { CheckCircle, AlertCircle, XCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SkillMatch {
  name: string;
  required: boolean;
  userLevel: number; // 0-100
  requiredLevel: number; // 0-100
  status: "excellent" | "good" | "needs_improvement" | "missing";
  category: "technical" | "soft" | "language" | "certification";
}

interface SkillsAnalysisProps {
  skills: SkillMatch[];
  className?: string;
}

export function SkillsAnalysis({
  skills,
  className = "",
}: SkillsAnalysisProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "good":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "needs_improvement":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "missing":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-700 bg-green-50 border-green-200";
      case "good":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "needs_improvement":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "missing":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "needs_improvement":
        return "Cần cải thiện";
      case "missing":
        return "Chưa có";
      default:
        return "Không xác định";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "technical":
        return "Kỹ năng kỹ thuật";
      case "soft":
        return "Kỹ năng mềm";
      case "language":
        return "Ngoại ngữ";
      case "certification":
        return "Chứng chỉ";
      default:
        return "Khác";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return "💻";
      case "soft":
        return "🤝";
      case "language":
        return "🌐";
      case "certification":
        return "🏆";
      default:
        return "📋";
    }
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillMatch[]>);

  // Calculate category stats
  const getCategoryStats = (categorySkills: SkillMatch[]) => {
    const total = categorySkills.length;
    const excellent = categorySkills.filter(
      (s) => s.status === "excellent"
    ).length;
    const good = categorySkills.filter((s) => s.status === "good").length;
    const needsImprovement = categorySkills.filter(
      (s) => s.status === "needs_improvement"
    ).length;
    const missing = categorySkills.filter((s) => s.status === "missing").length;

    const matchRate = Math.round(((excellent + good) / total) * 100);

    return { total, excellent, good, needsImprovement, missing, matchRate };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Chi tiết phân tích kỹ năng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => {
          const stats = getCategoryStats(categorySkills);

          return (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <h3 className="font-semibold text-gray-900">
                    {getCategoryLabel(category)}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {stats.total} kỹ năng
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Độ phù hợp: {stats.matchRate}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.excellent + stats.good}/{stats.total} đạt yêu cầu
                  </div>
                </div>
              </div>

              {/* Category Progress */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.matchRate}%` }}
                />
              </div>

              {/* Skills List */}
              <div className="grid gap-3">
                {categorySkills.map((skill, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(
                      skill.status
                    )}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(skill.status)}
                        <span className="font-medium">{skill.name}</span>
                        {skill.required && (
                          <Badge variant="destructive" className="text-xs">
                            Bắt buộc
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(skill.status)}
                      </Badge>
                    </div>

                    {/* Skill Level Comparison */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Trình độ của bạn</span>
                        <span className="font-medium">{skill.userLevel}%</span>
                      </div>
                      <Progress value={skill.userLevel} className="h-2" />

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Yêu cầu công việc</span>
                        <span className="font-medium">
                          {skill.requiredLevel}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-400 h-2 rounded-full"
                          style={{ width: `${skill.requiredLevel}%` }}
                        />
                      </div>
                    </div>

                    {/* Gap Analysis */}
                    {skill.userLevel < skill.requiredLevel && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Cần cải thiện:</span> +
                        {skill.requiredLevel - skill.userLevel}% để đạt yêu cầu
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
