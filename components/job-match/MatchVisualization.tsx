"use client";

import { BarChart3, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

interface MatchVisualizationProps {
  data: ChartData[];
  title?: string;
  className?: string;
}

export function MatchVisualization({
  data,
  title = "Biểu đồ phân tích trực quan",
  className = "",
}: MatchVisualizationProps) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.maxValue)));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Horizontal Bar Chart */}
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-900">
                      {item.value}%
                    </span>
                    <span className="text-gray-500">/ {item.maxValue}%</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="relative w-full bg-gray-200 rounded-full h-6">
                  {/* Required Level (Background) */}
                  <div
                    className="absolute top-0 left-0 bg-gray-300 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.maxValue / maxValue) * 100}%` }}
                  >
                    <Target className="h-3 w-3 text-gray-600" />
                  </div>

                  {/* User Level (Foreground) */}
                  <div
                    className={`absolute top-0 left-0 h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  >
                    {item.value >= item.maxValue && (
                      <TrendingUp className="h-3 w-3 text-white" />
                    )}
                  </div>

                  {/* Percentage Label */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-800">
                      {item.value}%
                    </span>
                  </div>
                </div>

                {/* Gap Indicator */}
                {item.value < item.maxValue && (
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <span>Cần cải thiện:</span>
                    <span className="font-medium text-orange-600">
                      +{item.maxValue - item.value}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span className="text-xs text-gray-600">Yêu cầu công việc</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">Trình độ của bạn</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Radar Chart Component (Simple CSS-based)
interface RadarChartProps {
  data: {
    label: string;
    value: number;
  }[];
  className?: string;
}

export function RadarChart({ data, className = "" }: RadarChartProps) {
  const maxValue = 100;
  const centerX = 120;
  const centerY = 120;
  const radius = 80;
  const angleStep = (2 * Math.PI) / data.length;

  // Calculate points for the polygon
  const points = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const distance = (item.value / maxValue) * radius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    return { x, y, label: item.label, value: item.value };
  });

  // Create polygon path
  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Grid circles
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Biểu đồ radar - Tổng quan kỹ năng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <svg width="240" height="240" className="overflow-visible">
            {/* Grid circles */}
            {gridLevels.map((level, index) => (
              <circle
                key={index}
                cx={centerX}
                cy={centerY}
                r={(level / maxValue) * radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            {/* Grid lines */}
            {data.map((_, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const endX = centerX + radius * Math.cos(angle);
              const endY = centerY + radius * Math.sin(angle);
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={endX}
                  y2={endY}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            })}

            {/* Data polygon */}
            <polygon
              points={polygonPath}
              fill="rgba(34, 197, 94, 0.2)"
              stroke="#22c55e"
              strokeWidth="2"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#22c55e"
                stroke="#fff"
                strokeWidth="2"
              />
            ))}

            {/* Labels */}
            {data.map((item, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const labelDistance = radius + 20;
              const labelX = centerX + labelDistance * Math.cos(angle);
              const labelY = centerY + labelDistance * Math.sin(angle);

              return (
                <g key={index}>
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-gray-700"
                  >
                    {item.label}
                  </text>
                  <text
                    x={labelX}
                    y={labelY + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-bold fill-green-600"
                  >
                    {item.value}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
