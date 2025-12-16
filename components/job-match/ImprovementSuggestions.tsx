"use client";

import {
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Award,
  Users,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Suggestion {
  id: string;
  type: "strength" | "improvement" | "course" | "certification";
  category: "technical" | "soft" | "language" | "experience";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedTime?: string;
  resources?: {
    name: string;
    url: string;
    type: "course" | "book" | "practice" | "certification";
  }[];
}

interface ImprovementSuggestionsProps {
  suggestions: Suggestion[];
  className?: string;
}

export function ImprovementSuggestions({
  suggestions,
  className = "",
}: ImprovementSuggestionsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "improvement":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "course":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "certification":
        return <Award className="h-4 w-4 text-purple-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-500" />;
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
      case "experience":
        return "📈";
      default:
        return "📋";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "strength":
        return "bg-green-50 border-green-200 text-green-800";
      case "improvement":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "course":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "certification":
        return "bg-purple-50 border-purple-200 text-purple-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "strength":
        return "Điểm mạnh";
      case "improvement":
        return "Cần cải thiện";
      case "course":
        return "Khóa học đề xuất";
      case "certification":
        return "Chứng chỉ đề xuất";
      default:
        return "Gợi ý";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Ưu tiên cao";
      case "medium":
        return "Ưu tiên trung bình";
      case "low":
        return "Ưu tiên thấp";
      default:
        return "Bình thường";
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "course":
        return <BookOpen className="h-3 w-3" />;
      case "book":
        return <BookOpen className="h-3 w-3" />;
      case "practice":
        return <Users className="h-3 w-3" />;
      case "certification":
        return <Award className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  // Group suggestions by type
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.type]) {
      acc[suggestion.type] = [];
    }
    acc[suggestion.type].push(suggestion);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Tóm tắt đánh giá chi tiết
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedSuggestions).map(([type, typeSuggestions]) => (
          <div key={type} className="space-y-4">
            {/* Type Header */}
            <div className="flex items-center gap-2">
              {getTypeIcon(type)}
              <h3 className="font-semibold text-gray-900">
                {getTypeLabel(type)}
              </h3>
              <Badge variant="outline" className="text-xs">
                {typeSuggestions.length} mục
              </Badge>
            </div>

            {/* Suggestions List */}
            <div className="grid gap-4">
              {typeSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border ${getTypeColor(
                    suggestion.type
                  )}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getCategoryIcon(suggestion.category)}
                      </span>
                      <h4 className="font-medium">{suggestion.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPriorityColor(
                          suggestion.priority
                        )}`}
                      >
                        {getPriorityLabel(suggestion.priority)}
                      </Badge>
                      {suggestion.estimatedTime && (
                        <Badge variant="outline" className="text-xs">
                          {suggestion.estimatedTime}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm mb-3 leading-relaxed">
                    {suggestion.description}
                  </p>

                  {/* Resources */}
                  {suggestion.resources && suggestion.resources.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Tài nguyên đề xuất:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
                          >
                            {getResourceIcon(resource.type)}
                            <span>{resource.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Summary Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {groupedSuggestions.strength?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Điểm mạnh</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-600">
                {groupedSuggestions.improvement?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Cần cải thiện</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {groupedSuggestions.course?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Khóa học</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {groupedSuggestions.certification?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Chứng chỉ</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
