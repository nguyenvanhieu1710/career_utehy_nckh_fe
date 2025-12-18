import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, X, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { userAPI } from "@/services/user";
import { User, Role } from "@/types/user";
import { EntityStatus } from "@/types/status";
import { useStatus } from "@/contexts/StatusContext";
import type {
  AccountDialogData,
  AccountDialogSubmitData,
} from "@/types/dialog";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AccountDialogData;
  user?: User; // For edit mode to get user ID
  mode?: "add" | "edit";
  onSubmit?: (data: AccountDialogSubmitData) => void;
  availableRoles?: Role[];
  rolesLoading?: boolean;
}

export const AccountDialog = ({
  open,
  onOpenChange,
  initialData,
  user,
  mode = "add",
  onSubmit,
  availableRoles = [],
  rolesLoading = false,
}: AccountDialogProps) => {
  // Get status options from context
  const { statusOptions, loading: statusLoading } = useStatus();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<EntityStatus>(EntityStatus.ACTIVE);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    fullname?: string;
    email?: string;
    role?: string;
    avatar?: string;
  }>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFullname(initialData?.fullname ?? "");
      setEmail(initialData?.email ?? "");
      setRole(initialData?.role ?? "");
      setStatus((initialData?.status as EntityStatus) ?? EntityStatus.ACTIVE);
      setCurrentAvatarUrl(initialData?.avatar ?? null);
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsUploading(false);
      setShowAvatarPreview(false);
      setErrors({});
    }
  }, [open, initialData]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = userAPI.validateAvatarFile(file);
    if (!validation.isValid) {
      setErrors({ ...errors, avatar: validation.errors.join(", ") });
      return;
    }

    setAvatarFile(file);
    setErrors({ ...errors, avatar: undefined });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setCurrentAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload avatar for existing user
  const uploadAvatar = async (
    userId: string,
    file: File
  ): Promise<string | null> => {
    try {
      setIsUploading(true);
      const result = await userAPI.uploadAvatar(userId, file, true);
      return result.data.avatar_info.file_url;
    } catch (error) {
      console.error("Avatar upload failed:", error);
      setErrors({ ...errors, avatar: "Tải lên avatar thất bại" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: {
      fullname?: string;
      email?: string;
      role?: string;
    } = {};

    if (!fullname.trim()) {
      newErrors.fullname = "Tên người dùng không được để trống";
    } else if (fullname.trim().length < 2) {
      newErrors.fullname = "Tên người dùng phải có ít nhất 2 ký tự";
    }

    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!role) {
      newErrors.role = "Vui lòng chọn vai trò";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    let finalAvatarUrl = currentAvatarUrl;

    // If editing and there's a new avatar file, upload it first
    if (mode === "edit" && user && avatarFile) {
      const uploadedUrl = await uploadAvatar(user.id.toString(), avatarFile);
      if (uploadedUrl) {
        finalAvatarUrl = uploadedUrl;
        // Use the uploaded URL for future reference
        console.log("Avatar uploaded successfully:", finalAvatarUrl);
      }
    }

    onSubmit?.({
      fullname: fullname.trim(),
      email: email.trim(),
      role,
      status,
      roles: role ? [role] : [], // Convert single role to array for backend
      ...(mode === "add" && avatarFile ? { avatarFile } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-2 border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-900">
            {mode === "add" ? "Thêm tài khoản" : "Chỉnh sửa tài khoản"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Avatar Upload */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right text-green-900 pt-2">Avatar</Label>
            <div className="col-span-3">
              <div className="space-y-4">
                {/* Current Avatar Display */}
                {(avatarPreview || currentAvatarUrl) && (
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-lg border-2 border-green-200 overflow-hidden bg-gray-50 relative">
                      <img
                        src={
                          avatarPreview ||
                          userAPI.getAvatarUrl({
                            avatar_url: currentAvatarUrl,
                          } as User)
                        }
                        alt="Avatar preview"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPreview(!showAvatarPreview)}
                      className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full p-1 hover:bg-green-700 transition-colors cursor-pointer"
                      title={showAvatarPreview ? "Ẩn xem trước" : "Xem trước"}
                    >
                      {showAvatarPreview ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -left-2 bg-red-600 text-white rounded-full p-1  hover:bg-red-700 transition-colors cursor-pointer"
                      title="Xóa avatar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        Đang tải lên...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {avatarPreview || currentAvatarUrl
                          ? "Thay đổi avatar"
                          : "Chọn avatar"}
                      </>
                    )}
                  </button>
                  {!avatarPreview && !currentAvatarUrl && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <ImageIcon className="w-4 h-4" />
                      <span>JPG, PNG, GIF tối đa 5MB</span>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errors.avatar && (
                  <p className="text-red-500 text-sm">{errors.avatar}</p>
                )}

                {/* Large Preview Modal */}
                {showAvatarPreview && (avatarPreview || currentAvatarUrl) && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowAvatarPreview(false)}
                  >
                    <div className="relative max-w-md max-h-md">
                      <div className="relative w-96 h-96">
                        <img
                          src={
                            avatarPreview ||
                            userAPI.getAvatarUrl({
                              avatar_url: currentAvatarUrl,
                            } as User)
                          }
                          alt="Avatar preview"
                          className="object-contain rounded-lg"
                        />
                      </div>
                      <button
                        onClick={() => setShowAvatarPreview(false)}
                        className="absolute -top-2 -right-2 bg-white text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tên người dùng */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label
              htmlFor="fullname"
              className="text-right text-green-900 pt-2"
            >
              Tên người dùng
            </Label>
            <div className="col-span-3">
              <Input
                id="fullname"
                className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 ${
                  errors.fullname
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Nhập tên người dùng"
                value={fullname}
                onChange={(e) => {
                  setFullname(e.target.value);
                  if (errors.fullname) {
                    setErrors({ ...errors, fullname: undefined });
                  }
                }}
              />
              {errors.fullname && (
                <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="email" className="text-right text-green-900 pt-2">
              Email
            </Label>
            <div className="col-span-3">
              <Input
                id="email"
                type="email"
                className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Nhập email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Vai trò */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right text-green-900 pt-2">Vai trò</Label>
            <div className="col-span-3">
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  if (errors.role) {
                    setErrors({ ...errors, role: undefined });
                  }
                }}
                disabled={rolesLoading}
              >
                <SelectTrigger
                  className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 ${
                    errors.role
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue
                    placeholder={
                      rolesLoading ? "Đang tải vai trò..." : "Lựa chọn vai trò"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((roleItem) => (
                    <SelectItem key={roleItem.id} value={roleItem.id}>
                      {roleItem.name}
                      {roleItem.description && (
                        <span className="text-gray-500 text-xs ml-2">
                          - {roleItem.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                  {availableRoles.length === 0 && !rolesLoading && (
                    <SelectItem value="" disabled>
                      Không có vai trò nào
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2 text-green-900">Trạng thái</Label>
            <div className="col-span-3">
              <Select
                value={status}
                onValueChange={(value: EntityStatus) => setStatus(value)}
                disabled={statusLoading}
              >
                <SelectTrigger className="w-full border-green-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue
                    placeholder={
                      statusLoading ? "Đang tải..." : "Chọn trạng thái"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((statusOption) => (
                    <SelectItem
                      key={statusOption.value}
                      value={statusOption.value}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            statusOption.color === "green"
                              ? "bg-green-500"
                              : statusOption.color === "yellow"
                              ? "bg-yellow-500"
                              : statusOption.color === "red"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        />
                        {statusOption.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            value={mode === "add" ? "Thêm" : "Lưu"}
            onClick={handleSubmit}
            disable={isUploading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
