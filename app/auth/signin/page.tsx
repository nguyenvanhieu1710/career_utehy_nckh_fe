"use client";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

export default function LoginPage() {
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value.trim();
    setAuthForm((prev) => ({ ...prev, email: value }));

    if (errors.email) {
      const error = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: error }));
    }
  };
  const validateEmail = (email: string) => {
    if (!email) {
      return "Vui lòng nhập địa chỉ email";
    }

    if (email.length > 255) {
      return "Email không được vượt quá 255 ký tự";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Vui lòng nhập địa chỉ email hợp lệ";
    }

    return "";
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setAuthForm((prev) => ({ ...prev, password: value }));

    if (errors.password) {
      const error = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: error }));
    }
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Vui lòng nhập mật khẩu";
    }

    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (password.length > 100) {
      return "Mật khẩu không được vượt quá 100 ký tự";
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const emailError = validateEmail(authForm.email);
    const passwordError = validatePassword(authForm.password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        email: authForm.email,
        password: authForm.password
      });
      
      toast.success('Đăng nhập thành công!');
      
      router.push('/');
      
    } catch (error: any) {
      let errorMessage = 'Đã có lỗi xảy ra khi đăng nhập';
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        
        if (status === 401) {
          errorMessage = data?.message || 'Email hoặc mật khẩu không chính xác';
        } else if (status === 403) {
          errorMessage = 'Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa';
        } else if (status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ';
        } else if (status === 429) {
          errorMessage = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ít phút';
        } else if (status === 500) {
          errorMessage = 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl flex flex-col md:flex-row p-6 md:p-10 w-[900px] max-w-full"
      >
        {/* Left side - Illustration */}
        <div className="md:w-1/2 flex items-center justify-center">
          <img
            src="../signin_slide.jpg"
            alt="Login Illustration"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>

        {/* Right side - Form */}
        <div className="md:w-1/2 flex flex-col justify-center p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
            ĐĂNG NHẬP
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <TextField
                type="email"
                value={authForm.email}
                placeholder="Email"
                borderRadius={10}
                border={errors.email ? "1px solid #ef4444" : "1px solid #777"}
                backgroundColor="white"
                onChange={handleEmailChange}
                onBlur={() => {
                  const error = validateEmail(authForm.email);
                  setErrors((prev) => ({ ...prev, email: error }));
                }}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
            <div>
              <div className="relative">
                <TextField
                  type={showPassword ? "text" : "password"}
                  value={authForm.password}
                  placeholder="Mật khẩu"
                  borderRadius={10}
                  border={
                    errors.password ? "1px solid #ef4444" : "1px solid #777"
                  }
                  backgroundColor="white"
                  onChange={handlePasswordChange}
                  onBlur={() => {
                    const error = validatePassword(authForm.password);
                    setErrors((prev) => ({ ...prev, password: error }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              value={isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              disable={isLoading}
            />
          </form>

          <div className="flex items-center justify-center m-4 text-gray-500">
            <span className="border-t w-16"></span>
            <span className="mx-2 text-sm">--- Hoặc ---</span>
            <span className="border-t w-16"></span>
          </div>

          <Button
            backgroundColor="white"
            color="#0C6A4E"
            border="2px solid #0C6A4E"
            value="Đăng nhập bằng Google"
            iconLeft={
              <img src="../google.png" alt="Google" width={20} height={20} />
            }
          />

          <p className="text-center text-sm mt-4 text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <Link href="/auth/signup" className="text-green-700 font-semibold">
              Đăng ký
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
