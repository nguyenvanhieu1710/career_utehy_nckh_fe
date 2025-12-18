"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  User,
  Briefcase,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Job } from "@/types/job";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuickApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (applicationData: ApplicationData) => void;
}

interface ApplicationData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  coverLetter: string;
  cv: File | null;
}

interface ApplicationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  coverLetter?: string;
  cv?: string;
}

export const QuickApplyModal = ({
  job,
  isOpen,
  onClose,
  onSubmit,
}: QuickApplyModalProps) => {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ApplicationData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    experience: "",
    coverLetter: "",
    cv: null,
  });
  const [errors, setErrors] = useState<ApplicationErrors>({});

  if (!job) return null;

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ApplicationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          cv: "Chỉ chấp nhận file PDF, DOC, DOCX",
        }));
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          cv: "File không được vượt quá 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, cv: file }));
      setErrors((prev) => ({ ...prev, cv: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ApplicationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Vui lòng nhập địa chỉ";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Vui lòng nhập kinh nghiệm";
    }

    if (!formData.cv) {
      newErrors.cv = "Vui lòng tải lên CV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onSubmit?.(formData);
      setStep("success");
    } catch (error) {
      console.error("Application submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      location: "",
      experience: "",
      coverLetter: "",
      cv: null,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-white">
        {step === "form" ? (
          <>
            {/* Header */}
            <DialogHeader className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Ứng tuyển nhanh
                  </DialogTitle>
                  <p className="text-gray-600 mt-1">
                    {job.title} tại {job.company.name}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </DialogHeader>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(90vh-140px)]"
            >
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Thông tin cá nhân
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-gray-700">
                        Họ và tên *
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className={`mt-1 ${
                          errors.fullName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-700">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`mt-1 ${
                          errors.email
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                        }`}
                        placeholder="example@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-700">
                        Số điện thoại *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`mt-1 ${
                          errors.phone
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                        }`}
                        placeholder="0123456789"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-gray-700">
                        Địa chỉ *
                      </Label>
                      <Input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className={`mt-1 ${
                          errors.location
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                        }`}
                        placeholder="Hà Nội, Việt Nam"
                      />
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    Thông tin nghề nghiệp
                  </h3>

                  <div>
                    <Label htmlFor="experience" className="text-gray-700">
                      Kinh nghiệm làm việc *
                    </Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                      className={`mt-1 min-h-[100px] ${
                        errors.experience
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                      }`}
                      placeholder="Mô tả ngắn gọn về kinh nghiệm làm việc của bạn..."
                    />
                    {errors.experience && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.experience}
                      </p>
                    )}
                  </div>
                </div>

                {/* CV Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    CV/Resume
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      id="cv-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-1">
                        {formData.cv ? formData.cv.name : "Tải lên CV của bạn"}
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, DOCX (tối đa 5MB)
                      </p>
                    </label>
                  </div>
                  {errors.cv && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cv as string}
                    </p>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <Label htmlFor="coverLetter" className="text-gray-700">
                    Thư xin việc (tùy chọn)
                  </Label>
                  <Textarea
                    id="coverLetter"
                    value={formData.coverLetter}
                    onChange={(e) =>
                      handleInputChange("coverLetter", e.target.value)
                    }
                    className="mt-1 min-h-[120px] border-gray-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Viết vài dòng về lý do bạn muốn ứng tuyển vị trí này..."
                  />
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Bảo mật thông tin</p>
                      <p>
                        Thông tin của bạn sẽ được bảo mật và chỉ được chia sẻ
                        với nhà tuyển dụng. Chúng tôi cam kết không spam hoặc
                        chia sẻ thông tin với bên thứ ba.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Gửi hồ sơ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Hồ sơ đã được gửi thành công!
            </h3>

            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã ứng tuyển vị trí <strong>{job.title}</strong> tại{" "}
              <strong>{job.company.name}</strong>. Chúng tôi sẽ liên hệ với bạn
              trong thời gian sớm nhất.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-green-900 mb-2">
                Bước tiếp theo:
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Nhà tuyển dụng sẽ xem xét hồ sơ của bạn</li>
                <li>• Bạn sẽ nhận được email xác nhận trong 24h</li>
                <li>• Nếu phù hợp, HR sẽ liên hệ để sắp xếp phỏng vấn</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  // Navigate to more jobs or similar positions
                  handleClose();
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Xem thêm việc làm
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
