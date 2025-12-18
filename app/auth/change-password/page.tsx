"use client";

import { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";
import { authAPI } from "@/services/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Eye toggle states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let strength: "weak" | "medium" | "strong" = "weak";
    let color = "bg-red-500";
    let textColor = "text-red-600";

    if (score >= 4) {
      strength = "strong";
      color = "bg-green-500";
      textColor = "text-green-600";
    } else if (score >= 3) {
      strength = "medium";
      color = "bg-yellow-500";
      textColor = "text-yellow-600";
    }

    return { requirements, score, strength, color, textColor };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const isPasswordMatch = confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    // Strong password validation
    const { requirements, score } = getPasswordStrength(newPassword);

    if (!requirements.minLength) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (!requirements.hasUppercase) {
      toast.error("Mật khẩu mới phải có ít nhất 1 chữ cái viết hoa");
      return;
    }

    if (!requirements.hasLowercase) {
      toast.error("Mật khẩu mới phải có ít nhất 1 chữ cái viết thường");
      return;
    }

    if (!requirements.hasNumber) {
      toast.error("Mật khẩu mới phải có ít nhất 1 chữ số");
      return;
    }

    if (!requirements.hasSpecialChar) {
      toast.error("Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt");
      return;
    }

    if (score < 4) {
      toast.error("Mật khẩu chưa đủ mạnh. Vui lòng đáp ứng tất cả yêu cầu");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.changePassword(
        currentPassword,
        newPassword
      );

      if (response.data.status === "success") {
        toast.success("Đổi mật khẩu thành công!");
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Redirect to profile after 1.5s
        setTimeout(() => {
          router.push("/career/profile");
        }, 1500);
      }
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      const errorMessage =
        err?.response?.data?.detail || "Đổi mật khẩu thất bại";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center p-4 bg-white"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg border border-gray-300 rounded-2xl p-8 shadow-sm"
      >
        {/* TITLE */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-bold text-center text-green-900 mb-8"
        >
          Đổi mật khẩu
        </motion.h1>

        {/* FORM */}
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {/* CURRENT PASSWORD */}
          <motion.div variants={itemVariants}>
            <Label className="text-gray-700 font-bold">Mật khẩu hiện tại</Label>
            <div className="relative mt-2">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentPassword(e.target.value)
                }
                className="py-3 pr-12 rounded-xl border-gray-300 text-gray-900"
                required
              />
              <motion.button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                tabIndex={-1}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: showCurrentPassword ? 0 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {showCurrentPassword ? (
                    <motion.div
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EyeOff className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Eye className="h-5 w-5" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.button>
            </div>
          </motion.div>

          {/* NEW PASSWORD */}
          <motion.div variants={itemVariants}>
            <Label className="text-gray-700 font-bold">Mật khẩu mới</Label>
            <div className="relative mt-2">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
                className={`py-3 pr-12 rounded-xl text-gray-900 transition-colors duration-200 ${
                  newPassword && passwordStrength.score >= 4
                    ? "border-green-500 focus:border-green-600"
                    : newPassword && passwordStrength.score >= 3
                    ? "border-yellow-500 focus:border-yellow-600"
                    : newPassword && passwordStrength.score > 0
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300"
                }`}
                required
              />
              <motion.button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                tabIndex={-1}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: showNewPassword ? 0 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {showNewPassword ? (
                    <motion.div
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EyeOff className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Eye className="h-5 w-5" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-3 space-y-3"
              >
                {/* Strength Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Độ mạnh mật khẩu
                    </span>
                    <span
                      className={`text-sm font-bold ${passwordStrength.textColor}`}
                    >
                      {passwordStrength.strength === "weak" && "Yếu"}
                      {passwordStrength.strength === "medium" && "Trung bình"}
                      {passwordStrength.strength === "strong" && "Mạnh"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${passwordStrength.color} transition-all duration-300`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    Yêu cầu mật khẩu:
                  </p>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    {[
                      { key: "minLength", text: "Ít nhất 8 ký tự" },
                      {
                        key: "hasUppercase",
                        text: "Có chữ cái viết hoa (A-Z)",
                      },
                      {
                        key: "hasLowercase",
                        text: "Có chữ cái viết thường (a-z)",
                      },
                      { key: "hasNumber", text: "Có chữ số (0-9)" },
                      {
                        key: "hasSpecialChar",
                        text: "Có ký tự đặc biệt (!@#$%^&*)",
                      },
                    ].map((req) => (
                      <motion.div
                        key={req.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{
                            scale: passwordStrength.requirements[
                              req.key as keyof typeof passwordStrength.requirements
                            ]
                              ? [1, 1.2, 1]
                              : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordStrength.requirements[
                            req.key as keyof typeof passwordStrength.requirements
                          ] ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                        </motion.div>
                        <span
                          className={
                            passwordStrength.requirements[
                              req.key as keyof typeof passwordStrength.requirements
                            ]
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {req.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* CONFIRM PASSWORD */}
          <motion.div variants={itemVariants}>
            <Label className="text-gray-700 font-bold">
              Xác nhận mật khẩu mới
            </Label>
            <div className="relative mt-2">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                className={`py-3 pr-12 rounded-xl text-gray-900 transition-colors duration-200 ${
                  confirmPassword && isPasswordMatch
                    ? "border-green-500 focus:border-green-600"
                    : confirmPassword && !isPasswordMatch
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300"
                }`}
                required
              />
              <motion.button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                tabIndex={-1}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: showConfirmPassword ? 0 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {showConfirmPassword ? (
                    <motion.div
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EyeOff className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Eye className="h-5 w-5" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.button>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 flex items-center gap-2"
              >
                <motion.div
                  animate={{
                    scale: isPasswordMatch ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isPasswordMatch ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </motion.div>
                <span
                  className={`text-sm ${
                    isPasswordMatch ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isPasswordMatch ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
                </span>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between pt-4"
          >
            <Link href="/career/profile">
              <button
                type="button"
                className="px-8 py-3 border border-green-700 text-green-700 rounded-xl font-medium hover:bg-green-50 cursor-pointer disabled:opacity-50"
                disabled={isLoading}
              >
                Hủy
              </button>
            </Link>

            <motion.button
              type="submit"
              className="px-8 py-3 bg-green-800 text-white rounded-xl font-medium hover:bg-green-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={
                isLoading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                passwordStrength.score < 4 ||
                !isPasswordMatch
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
