import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { categoryAPI } from "@/services/category";
import { Category } from "@/types/category";
import { logger } from "@/lib/logger";

interface CategoryDialogData {
  name?: string;
  description?: string;
  avatar_url?: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CategoryDialogData;
  category?: Category; // For edit mode to get category ID
  mode?: "add" | "edit";
  onSubmit?: (data: {
    name: string;
    description?: string;
    avatar_url?: string;
  }) => void;
}

export const CategoryDialog = ({
  open,
  onOpenChange,
  initialData,
  category,
  mode = "add",
  onSubmit,
}: CategoryDialogProps) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    avatar?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setDescription(initialData?.description ?? "");
      setCurrentAvatarUrl(initialData?.avatar_url ?? null);
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
    const validation = categoryAPI.validateAvatarFile(file);
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

  // Upload avatar for existing category
  const uploadAvatar = async (
    categoryId: string,
    file: File
  ): Promise<string | null> => {
    try {
      setIsUploading(true);
      const result = await categoryAPI.uploadAvatar(categoryId, file, true);
      return result.data.avatar_info.file_url;
    } catch (error) {
      logger.error("Avatar upload failed", error);
      setErrors({ ...errors, avatar: "Tải lên avatar thất bại" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; avatar?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Tên danh mục không được để trống";
    } else if (name.trim().length < 2) {
      newErrors.name = "Tên danh mục phải có ít nhất 2 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    let finalAvatarUrl = currentAvatarUrl;

    // If editing and there's a new avatar file, upload it first
    if (mode === "edit" && category && avatarFile) {
      const uploadedUrl = await uploadAvatar(
        category.id.toString(),
        avatarFile
      );
      if (uploadedUrl) {
        finalAvatarUrl = uploadedUrl;
      }
    }

    onSubmit?.({
      name: name.trim(),
      description: description.trim() || undefined,
      avatar_url: finalAvatarUrl || undefined,
      ...(mode === "add" && avatarFile ? { avatarFile } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-2 border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-900">
            {mode === "add" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}
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
                    <div className="w-20 h-20 rounded-lg border-2 border-green-200 overflow-hidden bg-gray-50">
                      <img
                        src={
                          avatarPreview ||
                          categoryAPI.getAvatarUrl({
                            avatar_url: currentAvatarUrl,
                          } as Category)
                        }
                        alt="Avatar preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
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
                      className="absolute -top-2 -left-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors cursor-pointer"
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
                    <div className="relative max-w-md max-h-md cursor-pointer">
                      <img
                        src={
                          avatarPreview ||
                          categoryAPI.getAvatarUrl({
                            avatar_url: currentAvatarUrl,
                          } as Category)
                        }
                        alt="Avatar preview"
                        width={400}
                        height={400}
                        className="max-w-full max-h-full rounded-lg"
                      />
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

          {/* Tên danh mục */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right text-green-900 pt-2">
              Tên danh mục
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Nhập tên danh mục"
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

          {/* Mô tả */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label
              htmlFor="description"
              className="text-right text-green-900 pt-2"
            >
              Mô tả
            </Label>
            <div className="col-span-3">
              <Textarea
                id="description"
                className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 min-h-[100px]"
                placeholder="Nhập mô tả (tùy chọn)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
