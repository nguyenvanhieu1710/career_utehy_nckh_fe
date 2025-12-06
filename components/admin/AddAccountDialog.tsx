import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    name?: string;
    email?: string;
    role?: string;
    status?: "active" | "inactive";
    avatar?: string;
  };
  mode?: "add" | "edit";
  onSubmit?: (data: {
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
    avatarFile?: File;
  }) => void;
}

export const AddAccountDialog = ({
  open,
  onOpenChange,
  initialData,
  mode = "add",
  onSubmit,
}: AddAccountDialogProps) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [role, setRole] = useState(initialData?.role ?? "");
  const [status, setStatus] = useState<"active" | "inactive">(
    initialData?.status ?? "active"
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar ?? null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    role?: string;
  }>({});

  // Cleanup object URL to prevent memory leak
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(initialData?.avatar ?? null);
      setAvatarFile(null);
      setErrors({});
    }
  }, [open, initialData?.avatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous object URL if exists
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      role?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Tên người dùng không được để trống";
    } else if (name.trim().length < 2) {
      newErrors.name = "Tên người dùng phải có ít nhất 2 ký tự";
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

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit?.({
      name: name.trim(),
      email: email.trim(),
      role,
      status,
      avatarFile: avatarFile ?? undefined,
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
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Label className="text-right w-32 shrink-0 text-green-900">
              Ảnh đại diện
            </Label>
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview ?? ""} />
                <AvatarFallback className="text-lg">
                  {name.slice(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-green-700 transition-colors duration-200"
              >
                <Upload className="h-4 w-4" />
                <span>Chọn ảnh</span>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Tên người dùng */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right text-green-900 pt-2">
              Tên người dùng
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 ${
                  errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="Nhập tên người dùng"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
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
                  errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
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
              >
                <SelectTrigger
                  className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 ${
                    errors.role ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Lựa chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Quản trị viên</SelectItem>
                  <SelectItem value="lecturer">Giảng viên</SelectItem>
                  <SelectItem value="student">Sinh viên</SelectItem>
                  <SelectItem value="reviewer">Phản biện</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2 text-green-900">Trạng thái</Label>
            <RadioGroup
              value={status}
              onValueChange={(value: "active" | "inactive") => setStatus(value)}
              className="col-span-3 flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="active"
                  id="active"
                  className="border-green-600 text-green-600"
                />
                <Label
                  htmlFor="active"
                  className="font-normal cursor-pointer text-green-900"
                >
                  Còn hoạt động
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="inactive"
                  id="inactive"
                  className="border-green-600 text-green-600"
                />
                <Label
                  htmlFor="inactive"
                  className="font-normal cursor-pointer text-green-900"
                >
                  Ngừng hoạt động
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            value={mode === "add" ? "Thêm" : "Lưu"}
            onClick={handleSubmit}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
