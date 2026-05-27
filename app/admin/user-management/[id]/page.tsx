"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  User as UserIcon,
  ShieldCheck,
  Key,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { userAPI } from "@/services/user";
import { useRoles } from "@/contexts/RolesContext";
import { UserManagementGuard } from "@/components/auth/PermissionGuard";
import BehaviorAnalyticsSection from "@/components/admin/BehaviorAnalyticsSection";
import { AddButton } from "@/components/admin/AddButton";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { AccountDialog } from "@/components/admin/AccountDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { logger } from "@/lib/logger";
import { formatDate } from "@/utils/formatters";
import { User, Role } from "@/types/user";
import {
  AccountDialogSubmitData,
  DialogState,
} from "@/types/dialog";

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id as string;

  const { roles: availableRoles, loading: rolesLoading } = useRoles();

  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const loadUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [userRes, rolesRes] = await Promise.all([
        userAPI.getUserById(userId),
        userAPI.getUserRolesPermissions(userId).catch(() => null),
      ]);

      const fetchedUser = userRes.data?.data;
      if (!fetchedUser) {
        setError("Không tìm thấy người dùng.");
        return;
      }
      setUser(fetchedUser);

      if (rolesRes?.data?.data) {
        setUserRoles(rolesRes.data.data.roles || []);
        setUserPermissions(rolesRes.data.data.permissions || []);
      } else {
        setUserRoles([]);
        setUserPermissions([]);
      }
    } catch (err) {
      logger.error("Failed to load user detail", err);
      setError("Không thể tải thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleUpdate = async (data: AccountDialogSubmitData) => {
    if (!user) return;
    try {
      await userAPI.updateUser(user.id.toString(), {
        fullname: data.fullname,
        email: data.email,
        action_status: data.status,
        role_ids: data.roles || [],
      });
      setDialog({
        isOpen: true,
        title: "Cập nhật thành công",
        message: "Thông tin người dùng đã được cập nhật.",
        type: "success",
      });
      setIsEditOpen(false);
      loadUser();
    } catch {
      setDialog({
        isOpen: true,
        title: "Cập nhật thất bại",
        message: "Có lỗi xảy ra khi cập nhật người dùng.",
        type: "error",
      });
    }
  };

  const handleCreate = async (data: AccountDialogSubmitData) => {
    try {
      const created = await userAPI.createUser({
        email: data.email,
        username: data.email.split("@")[0],
        password: data.email.split("@")[0],
        fullname: data.fullname,
        role_ids: data.roles || [],
      });

      if (data.avatarFile && created.data?.data?.id) {
        try {
          await userAPI.uploadAvatar(
            created.data.data.id.toString(),
            data.avatarFile,
            true,
          );
        } catch (e) {
          logger.warn("Avatar upload failed after create", e);
        }
      }

      setDialog({
        isOpen: true,
        title: "Tạo người dùng thành công",
        message: `Đã tạo ${data.fullname}. Mật khẩu mặc định: ${data.email.split("@")[0]}`,
        type: "success",
      });
      setIsAddOpen(false);
    } catch {
      setDialog({
        isOpen: true,
        title: "Tạo người dùng thất bại",
        message: "Có lỗi xảy ra khi tạo người dùng.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await userAPI.deleteUser(user.id.toString());
      setIsDeleteOpen(false);
      setDialog({
        isOpen: true,
        title: "Xóa người dùng thành công",
        message: `Đã xóa ${user.fullname}. Đang quay về danh sách...`,
        type: "success",
      });
      setTimeout(() => router.push("/admin/user-management"), 1200);
    } catch {
      setDialog({
        isOpen: true,
        title: "Xóa thất bại",
        message: "Có lỗi xảy ra khi xóa người dùng.",
        type: "error",
      });
      setIsDeleteOpen(false);
    }
  };

  const roleChartData = useMemo(() => {
    if (userRoles.length === 0) {
      return [{ name: "Chưa gán vai trò", value: 1 }];
    }
    return userRoles.map((r) => ({ name: r.name, value: 1 }));
  }, [userRoles]);

  const permGroups = useMemo(() => {
    const groups = new Map<string, number>();
    userPermissions.forEach((p) => {
      const key = p.split(".")[0] || "khác";
      groups.set(key, (groups.get(key) || 0) + 1);
    });
    return Array.from(groups, ([name, value]) => ({ name, value }));
  }, [userPermissions]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-600 mb-4">{error || "Không có dữ liệu"}</p>
          <Link
            href="/admin/user-management"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <UserManagementGuard>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/user-management"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft size={16} /> Danh sách
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết người dùng
            </h1>
          </div>
          <div className="flex gap-2">
            <ActionButtons
              type="edit"
              permission="user.update"
              title="Chỉnh sửa"
              onClick={() => setIsEditOpen(true)}
            />
            <ActionButtons
              type="delete"
              permission="user.delete"
              title="Xóa người dùng"
              onClick={() => setIsDeleteOpen(true)}
            />
            <AddButton
              permission="user.create"
              onClick={() => setIsAddOpen(true)}
            />
          </div>
        </div>

        {/* Main info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-28 h-28 rounded-full border-2 border-emerald-200 overflow-hidden bg-gray-50 flex-shrink-0">
              <img
                src={userAPI.getAvatarUrl(user)}
                alt={user.fullname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-avatar.jpg";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.fullname}
                </h2>
                <StatusBadge
                  status={user.action_status || "active"}
                  size="sm"
                  showIcon
                />
              </div>
              <p className="text-sm text-gray-500 mb-3">
                ID: <span className="font-mono">{user.id}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-emerald-600" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon size={14} className="text-emerald-600" />
                  <span>@{user.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-600" />
                  <span>Tạo: {formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-600" />
                  <span>Cập nhật: {formatDate(user.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile + Roles grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile info */}
          <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
            <h3 className="text-base font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
              Thông tin cá nhân
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <InfoRow
                icon={<Calendar size={14} />}
                label="Ngày sinh"
                value={user.birthday}
              />
              <InfoRow
                icon={<UserIcon size={14} />}
                label="Giới tính"
                value={user.gender}
              />
              <InfoRow
                icon={<Phone size={14} />}
                label="Điện thoại"
                value={user.phone}
              />
              <InfoRow
                icon={<MapPin size={14} />}
                label="Địa chỉ"
                value={user.address}
              />
              <InfoRow
                icon={<GraduationCap size={14} />}
                label="Trường"
                value={user.unversity}
              />
              <InfoRow
                icon={<GraduationCap size={14} />}
                label="Chuyên ngành"
                value={user.major}
              />
              <InfoRow
                icon={<Calendar size={14} />}
                label="Năm tốt nghiệp"
                value={user.graduation_year}
              />
              <InfoRow
                icon={<Briefcase size={14} />}
                label="Kinh nghiệm"
                value={user.experience}
              />
            </dl>
            {user.bio && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Giới thiệu
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {user.bio}
                </p>
              </div>
            )}
          </div>

          {/* Roles & Permissions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" /> Vai trò
              </h3>
              {userRoles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userRoles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      title={role.description || role.name}
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa gán vai trò</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Key size={16} className="text-emerald-600" /> Quyền hạn
                <span className="ml-auto text-xs text-gray-500">
                  {userPermissions.length} quyền
                </span>
              </h3>
              {userPermissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {userPermissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa có quyền</p>
              )}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Phân bố vai trò
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name }) => name}
                  >
                    {roleChartData.map((_, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Phân tích quyền hạn theo nhóm
            </h3>
            <div className="h-72">
              {permGroups.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={permGroups}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10B981" name="Số quyền" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Chưa có dữ liệu quyền hạn
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Behavior analytics for this user */}
        <BehaviorAnalyticsSection
          mode="user"
          userId={user.id.toString()}
          title="Phân tích hành vi của người dùng"
        />

        {/* Dialogs */}
        <AccountDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          initialData={{
            fullname: user.fullname,
            email: user.email,
            role: userRoles[0]?.id || "",
            status: user.action_status === "active" ? "active" : "inactive",
            avatar: user.avatar_url,
          }}
          user={user}
          mode="edit"
          onSubmit={handleUpdate}
          availableRoles={availableRoles}
          rolesLoading={rolesLoading}
        />

        <AccountDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          mode="add"
          onSubmit={handleCreate}
          availableRoles={availableRoles}
          rolesLoading={rolesLoading}
        />

        <DeleteConfirmationDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDelete}
          title="Xác nhận xóa người dùng"
          description={`Bạn có chắc muốn xóa người dùng ${user.fullname}? Hành động này không thể hoàn tác.`}
        />

        <NotificationDialog
          open={dialog.isOpen}
          onOpenChange={(open) => setDialog({ ...dialog, isOpen: open })}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
        />
      </div>
    </UserManagementGuard>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-emerald-600 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-800 break-words">
          {value || <span className="text-gray-400">—</span>}
        </dd>
      </div>
    </div>
  );
}
