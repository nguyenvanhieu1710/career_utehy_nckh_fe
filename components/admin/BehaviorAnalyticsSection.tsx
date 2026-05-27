"use client";

/**
 * Shared "user behavior analytics" widget rendered on:
 *   - admin dashboard           (mode="overview")
 *   - admin user-detail page    (mode="user",     userId=...)
 *   - admin category-detail     (mode="category", categoryId or categorySlug)
 *
 * It pulls data from the /behavior/admin/* endpoints and renders a fairly
 * rich set of Recharts charts, KPI cards, top-N tables and a recent-event
 * timeline. The layout adapts to the mode but the visual language is
 * shared so admins can immediately recognise the data across screens.
 */

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Users,
  MousePointerClick,
  Briefcase,
  FileText,
  Sparkles,
  Tags,
  Search,
  ChevronDown,
  Loader2,
  Globe,
  Smartphone,
  Monitor as MonitorIcon,
  Clock,
} from "lucide-react";

import {
  behaviorAnalyticsAPI,
  BehaviorOverview,
  UserBehaviorAnalytics,
  CategoryBehaviorAnalytics,
} from "@/services/behavior";

const PALETTE = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
  "#F97316",
  "#22D3EE",
];

type Mode = "overview" | "user" | "category";

interface Props {
  mode: Mode;
  userId?: string;
  categoryId?: string;
  categorySlug?: string;
  title?: string;
  defaultDays?: number;
}

// --------------------------------------------------------------------- //
//  Helpers
// --------------------------------------------------------------------- //
function formatNumber(n: number | undefined | null): string {
  if (n == null) return "0";
  return Math.round(n).toLocaleString("vi-VN");
}

interface KPI {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ kpi }: { kpi: KPI }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-500 uppercase tracking-wide truncate">
          {kpi.label}
        </p>
        <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  height = 280,
}: {
  title: string;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      {message}
    </div>
  );
}

// --------------------------------------------------------------------- //
//  Component
// --------------------------------------------------------------------- //
export default function BehaviorAnalyticsSection({
  mode,
  userId,
  categoryId,
  categorySlug,
  title,
  defaultDays = mode === "overview" ? 7 : 30,
}: Props) {
  const [days, setDays] = useState<number>(defaultDays);
  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<BehaviorOverview | null>(null);
  const [userData, setUserData] = useState<UserBehaviorAnalytics | null>(null);
  const [categoryData, setCategoryData] =
    useState<CategoryBehaviorAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (mode === "overview") {
          const data = await behaviorAnalyticsAPI.getOverview(days);
          if (!cancelled) setOverview(data);
        } else if (mode === "user" && userId) {
          const data = await behaviorAnalyticsAPI.getUserBehavior(userId, days);
          if (!cancelled) setUserData(data);
        } else if (mode === "category" && (categoryId || categorySlug)) {
          const data = await behaviorAnalyticsAPI.getCategoryBehavior(
            { category_id: categoryId, category_slug: categorySlug },
            days,
          );
          if (!cancelled) setCategoryData(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Không tải được dữ liệu phân tích hành vi.");
          console.error(e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [mode, userId, categoryId, categorySlug, days]);

  const totals = useMemo(() => {
    if (mode === "overview" && overview) return overview.totals;
    if (mode === "user" && userData) return userData.totals;
    if (mode === "category" && categoryData) return categoryData.totals;
    return null;
  }, [mode, overview, userData, categoryData]);

  const timeline = useMemo(() => {
    if (mode === "overview") return overview?.timeline || [];
    if (mode === "user") return userData?.timeline || [];
    if (mode === "category") return categoryData?.timeline || [];
    return [];
  }, [mode, overview, userData, categoryData]);

  const breakdowns = useMemo(() => {
    if (mode === "overview") return overview?.breakdowns || {};
    if (mode === "user") return userData?.breakdowns || {};
    if (mode === "category") return categoryData?.breakdowns || {};
    return {};
  }, [mode, overview, userData, categoryData]);

  const hourly = useMemo(() => {
    if (mode === "user") return userData?.hourly_activity || [];
    if (mode === "category") return categoryData?.hourly_activity || [];
    return [];
  }, [mode, userData, categoryData]);

  const kpis: KPI[] = useMemo(() => {
    if (!totals) return [];
    if (mode === "overview") {
      const t = totals as BehaviorOverview["totals"];
      return [
        {
          label: "Lượt sự kiện",
          value: formatNumber(t.events_total),
          icon: <Activity className="h-5 w-5 text-blue-600" />,
          color: "bg-blue-100",
        },
        {
          label: "Phiên truy cập",
          value: formatNumber(t.sessions),
          icon: <Globe className="h-5 w-5 text-emerald-600" />,
          color: "bg-emerald-100",
        },
        {
          label: "Người dùng hoạt động",
          value: formatNumber(t.active_users),
          icon: <Users className="h-5 w-5 text-purple-600" />,
          color: "bg-purple-100",
        },
        {
          label: "Lượt xem trang",
          value: formatNumber(t.page_views),
          icon: <MousePointerClick className="h-5 w-5 text-amber-600" />,
          color: "bg-amber-100",
        },
        {
          label: "Lượt xem việc làm",
          value: formatNumber(t.job_views),
          icon: <Briefcase className="h-5 w-5 text-rose-600" />,
          color: "bg-rose-100",
        },
        {
          label: "Việc làm khác nhau",
          value: formatNumber(t.unique_jobs_viewed),
          icon: <Briefcase className="h-5 w-5 text-indigo-600" />,
          color: "bg-indigo-100",
        },
        {
          label: "Lượt dùng CV",
          value: formatNumber(t.cv_uses),
          icon: <FileText className="h-5 w-5 text-cyan-600" />,
          color: "bg-cyan-100",
        },
        {
          label: "Lượt đánh giá CV",
          value: formatNumber(t.cv_evaluations),
          icon: <Sparkles className="h-5 w-5 text-fuchsia-600" />,
          color: "bg-fuchsia-100",
        },
        {
          label: "Tương tác ngành",
          value: formatNumber(t.category_interactions),
          icon: <Tags className="h-5 w-5 text-lime-600" />,
          color: "bg-lime-100",
        },
        {
          label: "Lượt tìm kiếm",
          value: formatNumber(t.searches),
          icon: <Search className="h-5 w-5 text-orange-600" />,
          color: "bg-orange-100",
        },
        {
          label: "Điểm khớp CV TB",
          value: `${(t.avg_cv_score || 0).toFixed(1)}`,
          icon: <Activity className="h-5 w-5 text-pink-600" />,
          color: "bg-pink-100",
        },
      ];
    }
    if (mode === "user") {
      const t = totals as Record<string, number>;
      return [
        {
          label: "Sự kiện",
          value: formatNumber(t.events_total),
          icon: <Activity className="h-5 w-5 text-blue-600" />,
          color: "bg-blue-100",
        },
        {
          label: "Phiên truy cập",
          value: formatNumber(t.sessions),
          icon: <Globe className="h-5 w-5 text-emerald-600" />,
          color: "bg-emerald-100",
        },
        {
          label: "Lượt xem việc",
          value: formatNumber(t.job_views),
          icon: <Briefcase className="h-5 w-5 text-rose-600" />,
          color: "bg-rose-100",
        },
        {
          label: "Việc khác nhau",
          value: formatNumber(t.unique_jobs_viewed),
          icon: <Briefcase className="h-5 w-5 text-indigo-600" />,
          color: "bg-indigo-100",
        },
        {
          label: "Lượt dùng CV",
          value: formatNumber(t.cv_uses),
          icon: <FileText className="h-5 w-5 text-cyan-600" />,
          color: "bg-cyan-100",
        },
        {
          label: "Đánh giá CV",
          value: formatNumber(t.cv_evaluations),
          icon: <Sparkles className="h-5 w-5 text-fuchsia-600" />,
          color: "bg-fuchsia-100",
        },
        {
          label: "Tương tác ngành",
          value: formatNumber(t.category_interactions),
          icon: <Tags className="h-5 w-5 text-lime-600" />,
          color: "bg-lime-100",
        },
        {
          label: "Lượt tìm kiếm",
          value: formatNumber(t.searches),
          icon: <Search className="h-5 w-5 text-orange-600" />,
          color: "bg-orange-100",
        },
        {
          label: "Điểm CV TB",
          value: `${(t.avg_cv_score || 0).toFixed(1)}`,
          icon: <Activity className="h-5 w-5 text-pink-600" />,
          color: "bg-pink-100",
        },
        {
          label: "Điểm CV tốt nhất",
          value: `${(t.best_cv_score || 0).toFixed(1)}`,
          icon: <Activity className="h-5 w-5 text-amber-600" />,
          color: "bg-amber-100",
        },
      ];
    }
    if (mode === "category") {
      const t = totals as Record<string, number>;
      return [
        {
          label: "Lượt xem việc",
          value: formatNumber(t.job_views),
          icon: <Briefcase className="h-5 w-5 text-rose-600" />,
          color: "bg-rose-100",
        },
        {
          label: "Tương tác",
          value: formatNumber(t.interactions),
          icon: <Activity className="h-5 w-5 text-blue-600" />,
          color: "bg-blue-100",
        },
        {
          label: "Người dùng quan tâm",
          value: formatNumber(t.unique_visitors),
          icon: <Users className="h-5 w-5 text-purple-600" />,
          color: "bg-purple-100",
        },
        {
          label: "Việc khác nhau",
          value: formatNumber(t.unique_jobs_viewed),
          icon: <Briefcase className="h-5 w-5 text-indigo-600" />,
          color: "bg-indigo-100",
        },
        {
          label: "Đánh giá CV",
          value: formatNumber(t.cv_evaluations),
          icon: <Sparkles className="h-5 w-5 text-fuchsia-600" />,
          color: "bg-fuchsia-100",
        },
        {
          label: "Điểm CV TB",
          value: `${(t.avg_cv_score || 0).toFixed(1)}`,
          icon: <Activity className="h-5 w-5 text-pink-600" />,
          color: "bg-pink-100",
        },
      ];
    }
    return [];
  }, [mode, totals]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-12 flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 text-center text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            {title ||
              (mode === "overview"
                ? "Phân tích hành vi người dùng"
                : mode === "user"
                  ? "Phân tích hành vi cá nhân"
                  : "Phân tích hành vi theo ngành")}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Dữ liệu được tổng hợp từ hệ thống tracking hành vi: phiên truy cập,
            lượt xem trang, lượt xem việc làm, lượt dùng CV (PDF/hệ thống),
            đánh giá CV vs công việc, tương tác ngành, từ khoá tìm kiếm.
          </p>
        </div>
        <div className="relative">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>7 ngày gần nhất</option>
            <option value={14}>14 ngày gần nhất</option>
            <option value={30}>30 ngày gần nhất</option>
            <option value={90}>90 ngày gần nhất</option>
            <option value={180}>180 ngày gần nhất</option>
            <option value={365}>1 năm gần nhất</option>
          </select>
          <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <KpiCard kpi={k} key={k.label} />
        ))}
      </div>

      {/* Main timeline */}
      <ChartCard title="Diễn biến hoạt động theo ngày" height={320}>
        {timeline.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <defs>
                {(
                  [
                    ["events", PALETTE[0]],
                    ["job_views", PALETTE[1]],
                    ["cv_uses", PALETTE[4]],
                    ["cv_evaluations", PALETTE[2]],
                    ["category_interactions", PALETTE[6]],
                    ["searches", PALETTE[3]],
                    ["sessions", PALETTE[5]],
                    ["interactions", PALETTE[7]],
                  ] as const
                ).map(([k, c]) => (
                  <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {mode === "overview" && (
                <>
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke={PALETTE[0]}
                    fill="url(#grad-events)"
                    name="Sự kiện"
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke={PALETTE[5]}
                    fill="url(#grad-sessions)"
                    name="Phiên"
                  />
                  <Area
                    type="monotone"
                    dataKey="job_views"
                    stroke={PALETTE[1]}
                    fill="url(#grad-job_views)"
                    name="Xem việc"
                  />
                  <Area
                    type="monotone"
                    dataKey="cv_uses"
                    stroke={PALETTE[4]}
                    fill="url(#grad-cv_uses)"
                    name="Dùng CV"
                  />
                  <Area
                    type="monotone"
                    dataKey="cv_evaluations"
                    stroke={PALETTE[2]}
                    fill="url(#grad-cv_evaluations)"
                    name="Đánh giá CV"
                  />
                  <Area
                    type="monotone"
                    dataKey="category_interactions"
                    stroke={PALETTE[6]}
                    fill="url(#grad-category_interactions)"
                    name="Tương tác ngành"
                  />
                </>
              )}
              {mode === "user" && (
                <>
                  <Area type="monotone" dataKey="events" stroke={PALETTE[0]} fill="url(#grad-events)" name="Sự kiện" />
                  <Area type="monotone" dataKey="job_views" stroke={PALETTE[1]} fill="url(#grad-job_views)" name="Xem việc" />
                  <Area type="monotone" dataKey="cv_uses" stroke={PALETTE[4]} fill="url(#grad-cv_uses)" name="Dùng CV" />
                  <Area type="monotone" dataKey="cv_evaluations" stroke={PALETTE[2]} fill="url(#grad-cv_evaluations)" name="Đánh giá CV" />
                  <Area type="monotone" dataKey="category_interactions" stroke={PALETTE[6]} fill="url(#grad-category_interactions)" name="Tương tác ngành" />
                </>
              )}
              {mode === "category" && (
                <>
                  <Area type="monotone" dataKey="job_views" stroke={PALETTE[1]} fill="url(#grad-job_views)" name="Lượt xem việc" />
                  <Area type="monotone" dataKey="interactions" stroke={PALETTE[7]} fill="url(#grad-interactions)" name="Tương tác ngành" />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart message="Chưa có dữ liệu" />
        )}
      </ChartCard>

      {/* Breakdown row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mode === "overview" && (
          <>
            <PieBreakdown title="Phân bố thiết bị" data={breakdowns.device_split} />
            <PieBreakdown title="Phân bố trình duyệt" data={breakdowns.browser_split} />
            <PieBreakdown title="Phân bố hệ điều hành" data={breakdowns.os_split} />
            <BarBreakdown title="Nhóm sự kiện" data={breakdowns.event_category_split} />
            <BarBreakdown title="Hành động phổ biến" data={breakdowns.event_action_split} />
            <BarBreakdown
              title="Nguồn tới việc làm"
              data={breakdowns.job_view_source_split}
            />
            <BarBreakdown
              title="Hành động trên việc làm"
              data={breakdowns.job_view_action_split}
            />
            <PieBreakdown title="Loại CV được dùng" data={breakdowns.cv_type_split} />
            <BarBreakdown title="Hành động trên CV" data={breakdowns.cv_action_split} />
            <PieBreakdown title="Chế độ đánh giá CV" data={breakdowns.cv_eval_mode_split} />
          </>
        )}
        {mode === "user" && (
          <>
            <PieBreakdown title="Phân bố thiết bị" data={breakdowns.device} />
            <BarBreakdown title="Nhóm sự kiện" data={breakdowns.event_category} />
            <BarBreakdown title="Hành động việc làm" data={breakdowns.job_view_action} />
            <BarBreakdown title="Nguồn dẫn tới việc" data={breakdowns.job_view_source} />
            <PieBreakdown title="Loại CV được dùng" data={breakdowns.cv_type} />
            <BarBreakdown title="Hành động trên CV" data={breakdowns.cv_action} />
            <PieBreakdown title="Chế độ đánh giá CV" data={breakdowns.cv_eval_mode} />
          </>
        )}
        {mode === "category" && (
          <>
            <BarBreakdown title="Loại tương tác" data={breakdowns.interaction_type} />
            <PieBreakdown title="Nguồn truy cập ngành" data={breakdowns.source} />
            <PieBreakdown title="Phân bố thiết bị" data={breakdowns.device} />
            <BarBreakdown title="Nguồn tới việc làm" data={breakdowns.job_view_source} />
            <BarBreakdown title="Hành động trên việc" data={breakdowns.job_view_action} />
          </>
        )}
      </div>

      {/* Hour heatmap (user / category) */}
      {(mode === "user" || mode === "category") && hourly.length > 0 && (
        <ChartCard title="Khung giờ hoạt động" height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="events" name="Sự kiện" fill={PALETTE[0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Top lists row */}
      {mode === "overview" && overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopTable
            title="Việc làm được xem nhiều nhất"
            columns={["Việc làm", "Công ty", "Lượt xem", "Người"]}
            rows={overview.top_jobs.map((j) => [
              j.title || j.job_id,
              j.company || "—",
              formatNumber(j.views),
              formatNumber(j.unique_users),
            ])}
          />
          <TopTable
            title="Ngành nghề được quan tâm"
            columns={["Ngành", "Tương tác", "Người"]}
            rows={overview.top_categories.map((c) => [
              c.title || c.slug,
              formatNumber(c.interactions),
              formatNumber(c.unique_users),
            ])}
          />
          <TopTable
            title="Top từ khoá tìm kiếm"
            columns={["Từ khoá", "Lần", "Kết quả TB"]}
            rows={overview.top_keywords.map((k) => [
              k.keyword,
              formatNumber(k.hits),
              k.avg_results.toFixed(1),
            ])}
          />
          <TopTable
            title="Trang được xem nhiều nhất"
            columns={["Đường dẫn", "Lượt xem"]}
            rows={overview.top_pages.map((p) => [p.path, formatNumber(p.views)])}
          />
          <TopTable
            title="Người dùng hoạt động nhất"
            columns={["Họ tên", "Email", "Sự kiện"]}
            rows={overview.top_users.map((u) => [
              u.fullname || "—",
              u.email || "—",
              formatNumber(u.events),
            ])}
          />
        </div>
      )}

      {mode === "user" && userData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopTable
            title="Việc làm đã xem nhiều nhất"
            columns={["Việc làm", "Công ty", "Lượt xem", "Lần cuối"]}
            rows={userData.top_jobs.map((j) => [
              j.title || j.job_id,
              j.company || "—",
              formatNumber(j.views),
              j.last_at ? new Date(j.last_at).toLocaleString("vi-VN") : "—",
            ])}
          />
          <TopTable
            title="Ngành nghề quan tâm"
            columns={["Ngành", "Số lần tương tác"]}
            rows={userData.top_categories.map((c) => [
              c.title || c.slug,
              formatNumber(c.interactions),
            ])}
          />
          <div className="lg:col-span-2">
            <CVEvaluationTable rows={userData.cv_evaluation_history} />
          </div>
          <div className="lg:col-span-2">
            <SessionTable rows={userData.sessions} />
          </div>
          <div className="lg:col-span-2">
            <EventTimeline rows={userData.recent_events} />
          </div>
        </div>
      )}

      {mode === "category" && categoryData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopTable
            title="Việc làm được xem nhiều nhất trong ngành"
            columns={["Việc làm", "Công ty", "Lượt xem", "Người"]}
            rows={categoryData.top_jobs.map((j) => [
              j.title || j.job_id,
              j.company || "—",
              formatNumber(j.views),
              formatNumber(j.unique_users),
            ])}
          />
          <TopTable
            title="Người dùng quan tâm ngành nhất"
            columns={["Họ tên", "Email", "Lượt xem"]}
            rows={categoryData.top_users.map((u) => [
              u.fullname || "—",
              u.email || "—",
              formatNumber(u.views),
            ])}
          />
          <TopTable
            title="Top từ khoá khi xem trong ngành"
            columns={["Từ khoá", "Lần"]}
            rows={categoryData.top_keywords.map((k) => [
              k.keyword,
              formatNumber(k.hits),
            ])}
          />
        </div>
      )}
    </section>
  );
}

// --------------------------------------------------------------------- //
//  Sub-components
// --------------------------------------------------------------------- //
function PieBreakdown({
  title,
  data,
}: {
  title: string;
  data?: Array<{ name: string; count: number }>;
}) {
  return (
    <ChartCard title={title} height={240}>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart message="Chưa có dữ liệu" />
      )}
    </ChartCard>
  );
}

function BarBreakdown({
  title,
  data,
}: {
  title: string;
  data?: Array<{ name: string; count: number }>;
}) {
  return (
    <ChartCard title={title} height={240}>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} />
            <YAxis
              dataKey="name"
              type="category"
              width={110}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <Tooltip />
            <Bar dataKey="count" name="Số lần" fill={PALETTE[0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart message="Chưa có dữ liệu" />
      )}
    </ChartCard>
  );
}

function TopTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">Chưa có dữ liệu</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {r.map((cell, j) => (
                    <td
                      key={j}
                      className="px-3 py-2 text-gray-700 max-w-xs truncate"
                      title={String(cell)}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CVEvaluationTable({
  rows,
}: {
  rows: UserBehaviorAnalytics["cv_evaluation_history"];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-fuchsia-600" /> Lịch sử đánh giá CV vs công việc
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">Chưa có dữ liệu</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Thời gian
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Loại CV
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Việc làm
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Công ty
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Điểm
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Chế độ
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Độ tin cậy
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700">
                    {r.occurred_at
                      ? new Date(r.occurred_at).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded ${
                        r.cv_type === "profile"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {r.cv_type === "profile" ? "Hệ thống" : "PDF"}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2 text-gray-700 max-w-xs truncate"
                    title={r.job_title || r.job_id}
                  >
                    {r.job_title || r.job_id}
                  </td>
                  <td className="px-3 py-2 text-gray-700 max-w-xs truncate">
                    {r.company_name || "—"}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {r.score != null ? r.score.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded ${
                        r.mode === "ai"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.mode || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {r.reliability_level || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SessionTable({
  rows,
}: {
  rows: UserBehaviorAnalytics["sessions"];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-600" /> Phiên truy cập gần đây
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">Chưa có dữ liệu</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Bắt đầu
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Hoạt động cuối
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Thiết bị
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Trình duyệt
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  IP
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Sự kiện
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Trang
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700">
                    {s.started_at
                      ? new Date(s.started_at).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {s.last_activity_at
                      ? new Date(s.last_activity_at).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700 flex items-center gap-1">
                    {s.device_type === "mobile" ? (
                      <Smartphone className="h-3 w-3 text-gray-400" />
                    ) : (
                      <MonitorIcon className="h-3 w-3 text-gray-400" />
                    )}
                    {s.device_type || "—"} / {s.os || "?"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{s.browser || "—"}</td>
                  <td className="px-3 py-2 text-gray-700 font-mono text-[10px]">
                    {s.ip_address || "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{s.total_events}</td>
                  <td className="px-3 py-2 text-gray-700">
                    {s.total_page_views}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EventTimeline({
  rows,
}: {
  rows: UserBehaviorAnalytics["recent_events"];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-blue-600" /> Dòng thời gian sự kiện gần
        đây
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">Chưa có dữ liệu</p>
      ) : (
        <ol className="relative border-l border-gray-200 ml-3 space-y-3">
          {rows.map((e) => (
            <li key={e.id} className="ml-4">
              <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-blue-500"></span>
              <div className="text-[11px] text-gray-500">
                {e.occurred_at
                  ? new Date(e.occurred_at).toLocaleString("vi-VN")
                  : ""}
                {" · "}
                {e.device_type || "?"}
                {" · "}
                {e.browser || "?"}
                {" · "}
                <span className="font-mono">{e.ip_address || "—"}</span>
              </div>
              <div className="text-sm text-gray-800">
                <span className="inline-block bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded mr-1">
                  {e.event_category}
                </span>
                <span className="font-medium">{e.event_action}</span>
                {e.event_label && (
                  <span className="text-gray-500"> — {e.event_label}</span>
                )}
              </div>
              <div className="text-[11px] text-gray-500">
                {e.target_type && (
                  <>
                    Đối tượng:{" "}
                    <span className="font-mono">
                      {e.target_type}:{e.target_id || "—"}
                    </span>
                    {" · "}
                  </>
                )}
                {e.page_path && <>Trang: {e.page_path}</>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
