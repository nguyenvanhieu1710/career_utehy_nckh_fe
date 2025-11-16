"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Gọi API xử lý quên mật khẩu
      console.log("Email gửi yêu cầu:", email);

      // Giả lập gọi API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage(
        "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư."
      );
      setEmail("");
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      setMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center bg-gray-50">
        <img
          src="/forgot-password.jpg"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex items-center justify-center p-8 text-gray-700">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-4xl font-extrabold uppercase text-center text-gray-900">
            Quên mật khẩu
          </h1>

          <p className="text-center text-gray-500">
            Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Địa chỉ email
            </Label>

            <div className="relative">
              <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

              <Input
                id="email"
                type="email"
                className="pl-12 py-3 rounded-lg border-gray-300"
                placeholder="Email"
              />
            </div>

            <Button type="button" value="Gửi yêu cầu" border="10px" />
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
