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
import { Textarea } from "@/components/ui/textarea";

interface CategoryDialogData {
  name?: string;
  description?: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CategoryDialogData;
  mode?: "add" | "edit";
  onSubmit?: (data: { name: string; description?: string }) => void;
}

export const CategoryDialog = ({
  open,
  onOpenChange,
  initialData,
  mode = "add",
  onSubmit,
}: CategoryDialogProps) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setDescription(initialData?.description ?? "");
      setErrors({});
    }
  }, [open, initialData]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Tên danh mục không được để trống";
    } else if (name.trim().length < 2) {
      newErrors.name = "Tên danh mục phải có ít nhất 2 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit?.({
      name: name.trim(),
      description: description.trim() || undefined,
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
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
