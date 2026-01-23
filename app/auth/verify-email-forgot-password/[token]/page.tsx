"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendForgotPasswordEmail } from "@/services/email";
import Loader from "@/components/ui/Loader";
import TextField from "@/components/ui/TextField";
import { authAPI } from "@/services/auth";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { authLogger } from "@/lib/logger";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sendState, setSendState] = useState("");
  const { token } = useParams()

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirm_password: ""
  })

  const validatePassword = (password: string) => {
    if (!password) {
      return {
        status: false,
        message: "Mật khẩu không được để trống",
      };
    } else if (password.length < 8) {
      return {
        status: false,
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      };
    } else if (password.includes(" ")) {
      return {
        status: false,
        message: "Mật khẩu không được chứa khoảng trắng",
      };
    } else if (!/[A-Z]/.test(password)) {
      return {
        status: false,
        message: "Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)",
      };
    } else if (!/[a-z]/.test(password)) {
      return {
        status: false,
        message: "Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)",
      };
    } else if (!/[0-9]/.test(password)) {
      return {
        status: false,
        message: "Mật khẩu phải chứa ít nhất 1 số (0-9)",
      };
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
      return {
        status: false,
        message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)",
      };
    }
    return {
      status: true,
    };
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      const response = await authAPI.updatePassword(token as string, passwordData.password);
      setSendState(response.data?.status)
      toast.success("Đổi mật khẩu thành công");
      window.location.href = "/auth/signin"
    } catch (error) {
      authLogger.error("Reset password request failed", error);
      setMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2">
      {isLoading ? <Loader /> : <></>}
      <div className="hidden md:flex items-center justify-center bg-gray-50">
        <img
          src="/signin_slide.jpg"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex items-center justify-center p-8 text-gray-700">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-4xl font-extrabold uppercase text-center text-gray-900">
            ĐẶT LẠI MẬT KHẨU
          </h1>


          <p className="text-center text-gray-500">
            Nhập mật khẩu mới của bạn
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <TextField
                label="Mật khẩu mới"
                placeholder="Mật khẩu mới"
                value={passwordData.password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                borderRadius={10}
                type="password"
                error={!validatePassword(passwordData.password).status}
                labelError={validatePassword(passwordData.password).message}
              />
              <TextField
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                borderRadius={10}
                error={passwordData.confirm_password != passwordData.password}
                type="password"
                labelError="Mật khẩu nhập lại không chính xác"
              />
            </div>

            <Button
              type="submit"
              value="Xác nhận"
              border="10px"
              disable={isLoading}
            />
          </form>
          <div className="flex justify-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-green-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
