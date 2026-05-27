"use client";

import {
  Building2,
  Briefcase,
  Users,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { publicAPI, SystemStats } from "@/services/public";
import { adminAPI, DashboardChartData } from "@/services/admin";

// Stats configuration with icons and colors
const statsConfig = [
  {
    id: "company",
    title: "CÔNG TY",
    icon: Building2,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "job",
    title: "CÔNG VIỆC",
    icon: Briefcase,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "student",
    title: "SINH VIÊN",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
];

export default function DashboardPage() {
  const [statsData, setStatsData] = useState<SystemStats | null>(null);
  const [chartData, setChartData] = useState<DashboardChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await publicAPI.getStats();
        if (res.status === "success" && res.data) {
          setStatsData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const res = await adminAPI.getDashboardStats(days);
        if (res.status === "success" && res.data) {
          setChartData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, [days]);

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsConfig.map((stat) => {
          let val = "0+";
          if (statsData) {
            if (stat.id === "company")
              val = `${statsData.company_count?.toLocaleString("vi-VN")}+`;
            if (stat.id === "job")
              val = `${statsData.job_count?.toLocaleString("vi-VN")}+`;
            if (stat.id === "student")
              val = `${statsData.user_count?.toLocaleString("vi-VN")}+`;
          }

          return (
            <div
              key={stat.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center"
            >
              <div className={`p-3 rounded-lg ${stat.color} mr-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">CÓ {stat.title}</p>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-2xl font-bold">{val}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Thống kê dữ liệu theo thời gian
          </h2>
          {/* Preset Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>7 ngày gần nhất</option>
              <option value={30}>30 ngày gần nhất</option>
              <option value={90}>90 ngày gần nhất</option>
            </select>
            <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="h-80 w-full relative">
          {chartLoading && (
            <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center rounded-lg">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="website_visits"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Lượt truy cập Website"
              />
              <Line
                type="monotone"
                dataKey="jobs_crawled"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Lượng công việc thu thập"
              />
              <Line
                type="monotone"
                dataKey="registered_students"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Lượng sinh viên đăng ký"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
