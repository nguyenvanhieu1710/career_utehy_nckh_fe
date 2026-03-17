"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  Clock,
  Briefcase,
  Eye,
  EyeOff,
  Search,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface JobNotification {
  id: string;
  title: string;
  message: string;
  type: "new_job" | "job_match" | "application_update" | "system";
  isRead: boolean;
  createdAt: string;
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
}

interface JobNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onViewJob?: (jobId: string) => void;
  onRefresh?: () => void;
  onDeleteNotification?: (notificationId: string) => void;
  onDeleteAllRead?: () => void;
}

export const JobNotificationsModal = ({
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewJob,
  onRefresh,
  onDeleteNotification,
  onDeleteAllRead,
}: JobNotificationsModalProps) => {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "new_job" | "job_match" | "application_update" | "system"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">(
    "newest"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  // Mock notifications data
  const [notifications, setNotifications] = useState<JobNotification[]>([
    {
      id: "1",
      title: "Việc làm mới phù hợp với bạn",
      message:
        "Có 3 việc làm Frontend Developer mới tại Hà Nội phù hợp với hồ sơ của bạn",
      type: "new_job",
      isRead: false,
      createdAt: "2024-12-16T10:30:00Z",
      jobId: "job-1",
      jobTitle: "Frontend Developer",
      companyName: "Tech Company A",
    },
    {
      id: "2",
      title: "Cập nhật đơn ứng tuyển",
      message:
        "Đơn ứng tuyển của bạn cho vị trí React Developer đã được xem bởi nhà tuyển dụng",
      type: "application_update",
      isRead: false,
      createdAt: "2024-12-16T09:15:00Z",
      jobId: "job-2",
      jobTitle: "React Developer",
      companyName: "Startup XYZ",
    },
    {
      id: "3",
      title: "Việc làm phù hợp 85%",
      message:
        "Tìm thấy việc làm Backend Developer với độ phù hợp 85% tại TP.HCM",
      type: "job_match",
      isRead: true,
      createdAt: "2024-12-15T16:45:00Z",
      jobId: "job-3",
      jobTitle: "Backend Developer",
      companyName: "Enterprise Corp",
    },
    {
      id: "4",
      title: "Hệ thống bảo trì",
      message: "Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày 17/12/2024",
      type: "system",
      isRead: true,
      createdAt: "2024-12-15T14:20:00Z",
    },
    {
      id: "5",
      title: "Việc làm mới phù hợp",
      message: "Có 5 việc làm Full-stack Developer mới được đăng hôm nay",
      type: "new_job",
      isRead: false,
      createdAt: "2024-12-15T08:30:00Z",
    },
  ]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    onMarkAsRead?.(notificationId);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
    onMarkAllAsRead?.();
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onRefresh?.();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
    onDeleteNotification?.(notificationId);
  };

  const handleDeleteAllRead = () => {
    setNotifications((prev) =>
      prev.filter((notification) => !notification.isRead)
    );
    onDeleteAllRead?.();
    setShowConfirmDeleteAll(false);
  };

  const handleViewJob = (jobId?: string) => {
    if (jobId) {
      onViewJob?.(jobId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_job":
        return <Briefcase className="h-5 w-5 text-green-600" />;
      case "job_match":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "application_update":
        return <Eye className="h-5 w-5 text-orange-600" />;
      case "system":
        return <Bell className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "new_job":
        return "Việc làm mới";
      case "job_match":
        return "Phù hợp";
      case "application_update":
        return "Cập nhật đơn";
      case "system":
        return "Hệ thống";
      default:
        return "Thông báo";
    }
  };

  const getNotificationPriority = (type: string) => {
    switch (type) {
      case "application_update":
        return 4;
      case "job_match":
        return 3;
      case "new_job":
        return 2;
      case "system":
        return 1;
      default:
        return 0;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const filteredNotifications = notifications
    .filter((notification) => {
      // Filter by read status
      if (filter === "unread") return !notification.isRead;
      if (filter === "read") return notification.isRead;
      return true;
    })
    .filter((notification) => {
      // Filter by type
      if (typeFilter === "all") return true;
      return notification.type === typeFilter;
    })
    .filter((notification) => {
      // Filter by search query
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.jobTitle?.toLowerCase().includes(query) ||
        notification.companyName?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Sort notifications
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "priority":
          const priorityDiff =
            getNotificationPriority(b.type) - getNotificationPriority(a.type);
          if (priorityDiff !== 0) return priorityDiff;
          // If same priority, sort by newest
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] overflow-hidden p-0 bg-white flex flex-col mx-4 sm:mx-auto">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center relative">
                <Bell className="h-5 w-5 text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Thông báo
                </DialogTitle>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0
                    ? `${unreadCount} thông báo chưa đọc`
                    : "Tất cả thông báo đã được đọc"}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Search and Controls */}
        <div className="flex-shrink-0 border-b border-gray-200 p-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "all", label: "Tất cả", count: notifications.length },
                  { key: "unread", label: "Chưa đọc", count: unreadCount },
                  { key: "read", label: "Đã đọc", count: readCount },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() =>
                      setFilter(tab.key as "all" | "unread" | "read")
                    }
                    className={`px-2 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                      filter === tab.key
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value as
                      | "all"
                      | "new_job"
                      | "job_match"
                      | "application_update"
                      | "system"
                  )
                }
                className="text-xs text-gray-900 border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer"
              >
                <option value="all">Tất cả loại</option>
                <option value="new_job">Việc làm mới</option>
                <option value="job_match">Phù hợp</option>
                <option value="application_update">Cập nhật đơn</option>
                <option value="system">Hệ thống</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "oldest" | "priority")
                }
                className="text-xs text-gray-900 cursor-pointer border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="priority">Ưu tiên</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                title="Làm mới"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 whitespace-nowrap cursor-pointer"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}

              {readCount > 0 && (
                <button
                  onClick={() => setShowConfirmDeleteAll(true)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 whitespace-nowrap cursor-pointer"
                >
                  Xóa đã đọc
                </button>
              )}
            </div>
          </div>

          {/* Results Info */}
          {(searchQuery || typeFilter !== "all") && (
            <div className="text-xs text-gray-600">
              Hiển thị {filteredNotifications.length} / {notifications.length}{" "}
              thông báo
              {searchQuery && ` cho "${searchQuery}"`}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer group ${
                    !notification.isRead ? "bg-blue-50/30" : ""
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                    if (notification.jobId) {
                      handleViewJob(notification.jobId);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`font-medium line-clamp-2 ${
                                !notification.isRead
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <span className="text-xs text-blue-600 font-medium">
                            {getNotificationTypeLabel(notification.type)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span className="whitespace-nowrap">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {notification.message}
                      </p>

                      {/* Job Info */}
                      {notification.jobTitle && notification.companyName && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {notification.jobTitle}
                              </div>
                              <div className="text-gray-600 text-xs">
                                {notification.companyName}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {notification.jobId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewJob(notification.jobId);
                              }}
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              Xem việc làm
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className={`text-xs px-3 py-1 rounded-full cursor-pointer transition-colors ${
                              notification.isRead
                                ? "text-gray-500 hover:text-gray-700"
                                : "text-blue-600 hover:text-blue-700 bg-blue-50"
                            }`}
                          >
                            {notification.isRead ? (
                              <div className="flex items-center gap-1">
                                <EyeOff className="h-3 w-3" />
                                Đã đọc
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Đánh dấu đã đọc
                              </div>
                            )}
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : filter === "read"
                  ? "Không có thông báo đã đọc"
                  : "Chưa có thông báo nào"}
              </h3>
              <p className="text-gray-600">
                {filter === "unread"
                  ? "Tất cả thông báo đã được đọc"
                  : filter === "read"
                  ? "Chưa có thông báo nào được đọc"
                  : "Bạn sẽ nhận được thông báo về việc làm mới và cập nhật đơn ứng tuyển tại đây"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Confirmation Modal for Delete All Read */}
      {showConfirmDeleteAll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Xóa thông báo đã đọc
                </h3>
                <p className="text-gray-600 text-sm">
                  Bạn có chắc chắn muốn xóa tất cả {readCount} thông báo đã đọc?
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Hành động này không thể hoàn tác. Các thông báo đã xóa sẽ
                không thể khôi phục.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDeleteAll(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAllRead}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};
