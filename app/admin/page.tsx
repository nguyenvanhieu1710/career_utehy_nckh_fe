"use client";

import { Building2, Briefcase, Users, Calendar, ChevronDown } from "lucide-react";
import { format, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
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

const stats = [
  {
    id: 1,
    title: "CÔNG TY",
    value: "24.558+",
    icon: Building2,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "CÔNG VIỆC",
    value: "43.211+",
    icon: Briefcase,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 3,
    title: "SINH VIÊN",
    value: "92.473+",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
];

const chartData = [
  { name: "Tháng 1", visited_jobs: 4000, jobs_crawed: 2400, registered_students: 2400 },
  { name: "Tháng 2", visited_jobs: 3000, jobs_crawed: 1398, registered_students: 2210 },
  { name: "Tháng 3", visited_jobs: 2000, jobs_crawed: 9800, registered_students: 2290 },
  { name: "Tháng 4", visited_jobs: 2780, jobs_crawed: 3908, registered_students: 2000 },
  { name: "Tháng 5", visited_jobs: 1890, jobs_crawed: 4800, registered_students: 2181 },
  { name: "Tháng 6", visited_jobs: 2390, jobs_crawed: 3800, registered_students: 2500 },
  { name: "Tháng 7", visited_jobs: 3490, jobs_crawed: 4300, registered_students: 2100 },
];

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý nguồn dữ liệu
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center"
          >
            <div className={`p-3 rounded-lg ${stat.color} mr-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">CÓ {stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Thống kê dữ liệu theo thời gian
          </h2>
          {/* Date Range Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="7days"
              >
                <option value="7days">7 ngày gần nhất</option>
                <option value="30days">30 ngày gần nhất</option>
                <option value="90days">90 ngày gần nhất</option>
              </select>
              <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  defaultValue={format(subMonths(new Date(), 1), 'yyyy-MM-dd')}
                />
              </div>
              <span>đến</span>
              <div className="relative">
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                Lọc
              </button>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
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
                dataKey="visited_jobs"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Lượng truy cập"
              />
              <Line
                type="monotone"
                dataKey="jobs_crawed"
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
