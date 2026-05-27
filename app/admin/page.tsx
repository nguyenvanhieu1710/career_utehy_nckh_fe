"use client";

import {
  Building2,
  Briefcase,
  Users,
  ChevronDown,
  Loader2,
  ArrowRight,
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
import Link from "next/link";
import { publicAPI, SystemStats } from "@/services/public";
import { adminAPI, DashboardChartData } from "@/services/admin";
import { jobAPI } from "@/services/job";
import { userAPI } from "@/services/user";
import { Job } from "@/types/job";
import { User } from "@/types/user";
import BehaviorAnalyticsSection from "@/components/admin/BehaviorAnalyticsSection";

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
  
  // New states for lists
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [newUsers, setNewUsers] = useState<User[]>([]);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [listLoading, setListLoading] = useState(false);

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

  // Fetch recent jobs, new users, and pending jobs
  useEffect(() => {
    const fetchLists = async () => {
      setListLoading(true);
      try {
        // Fetch recent approved jobs (sorted by date descending)
        const jobsRes = await jobAPI.getJobs({
          status: "approved",
          page: 1,
          row: 5,
        });
        if (jobsRes.data) {
          setRecentJobs(jobsRes.data);
        }

        // Fetch recent registered users
        const usersRes = await userAPI.getUsers({
          page: 1,
          row: 5,
        });
        if (usersRes.data?.data) {
          setNewUsers(usersRes.data.data);
        }

        // Fetch pending jobs waiting for approval
        const pendingRes = await jobAPI.getJobsByStatus("pending", {
          page: 1,
          row: 5,
        });
        if (pendingRes.data) {
          setPendingJobs(pendingRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard lists:", error);
      } finally {
        setListLoading(false);
      }
    };

    fetchLists();
  }, []);

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

      {/* Behavior analytics — Big Data overview */}
      <div className="mt-8">
        <BehaviorAnalyticsSection mode="overview" />
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Công việc mới đăng
            </h2>
            <Link
              href="/admin/job-management"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {listLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-1">
                        {job.title}
                      </p>
                      <p className="text-sm text-gray-600">{job.company.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {job.location}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded ml-2 flex-shrink-0">
                      {job.job_type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Chưa có công việc mới
              </p>
            )}
          </div>
        </div>

        {/* New Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Thành viên mới
            </h2>
            <Link
              href="/admin/user-management"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {listLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : newUsers.length > 0 ? (
              newUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-purple-700">
                        {user.fullname?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {user.fullname || user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex-shrink-0">
                      {user.roles && user.roles.length > 0 ? "Member" : "User"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Chưa có thành viên mới
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Công việc chờ duyệt
          </h2>
          <Link
            href="/admin/job-management"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            Quản lý
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Tiêu đề
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Công ty
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Địa điểm
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Loại
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : pendingJobs.length > 0 ? (
                pendingJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800 max-w-xs truncate">
                      {job.title}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {job.company.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{job.location}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {job.job_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        Chờ duyệt
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Không có công việc chờ duyệt
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
