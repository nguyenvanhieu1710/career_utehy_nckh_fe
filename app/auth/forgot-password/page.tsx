"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendForgotPasswordEmail } from "@/services/email";
import Loader from "@/components/ui/Loader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sendState, setSendState] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Email gửi yêu cầu:", email);

      const response = await sendForgotPasswordEmail(email);
      setSendState(response.data?.status)

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
      {isLoading ? <Loader /> : <></>}
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

          {sendState == "success" ? <>
            <p className="text-center text-green-500">
              {message}
            </p>
          </> :
            <>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  value="Gửi yêu cầu"
                  border="10px"
                  disable={isLoading}
                />
              </form>
            </>
          }
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
