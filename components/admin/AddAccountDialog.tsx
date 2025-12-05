// components/admin/AddAccountDialog.tsx
import { useState } from "react";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!name || !email || !role) return;
    onSubmit?.({
      name,
      email,
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-green-900">
              Tên người dùng
            </Label>
            <Input
              id="name"
              className="col-span-3 border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300"
              placeholder="Nhập tên người dùng"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right text-green-900">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              className="col-span-3 border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Vai trò */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-green-900">Vai trò</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="col-span-3 border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900">
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
