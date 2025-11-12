"use client";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";

const validateFullName = (name: string) => {
  if (!name.trim()) {
    return {
      status: false,
      message: "Họ tên không được để trống",
    };
  } else if (name.trim().length < 2) {
    return {
      status: false,
      message: "Họ tên phải có ít nhất 2 ký tự",
    };
  } else if (!/^[\p{L}\s]+$/u.test(name)) {
    return {
      status: false,
      message: "Họ tên chỉ được chứa chữ cái và khoảng trắng",
    };
  }
  return {
    status: true,
  };
};

const validateEmail = (email: string) => {
  if (!email.trim()) {
    return {
      status: false,
      message: "Email không được để trống",
    };
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      status: false,
      message: "Vui lòng nhập đúng định dạng email (ví dụ: example@domain.com)",
    };
  }
  return {
    status: true,
  };
};

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

const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) {
    return {
      status: false,
      message: "Vui lòng xác nhận mật khẩu",
    };
  } else if (password !== confirmPassword) {
    return {
      status: false,
      message: "Mật khẩu xác nhận không khớp",
    };
  }
  return {
    status: true,
  };
};

export default function SignUpPage() {
  const [signUpForm, setSignUpForm] = useState({
    fullname: "",
    email: "",
    password: "",
    re_password: "",
  });
  const [errors, setErrors] = useState({
    fullname: "",
    email: "",
    password: "",
    re_password: "",
  });

  const [touched, setTouched] = useState({
    fullname: false,
    email: false,
    password: false,
    re_password: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "bg-gray-200",
  });

  const calculatePasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "", color: "bg-gray-200" };

    let score = 0;
    // Length check
    if (password.length >= 8) score += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) score += 1;
    // Contains number
    if (/[0-9]/.test(password)) score += 1;
    // Contains special char
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) score += 1;

    const strength = {
      score,
      label:
        ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"][
          Math.min(score - 1, 4)
        ] || "",
      color:
        [
          "bg-red-400",
          "bg-orange-400",
          "bg-yellow-400",
          "bg-blue-400",
          "bg-green-400",
        ][Math.min(score - 1, 4)] || "bg-gray-200",
    };

    return strength;
  };

  useEffect(() => {
    if (signUpForm.password) {
      setPasswordStrength(calculatePasswordStrength(signUpForm.password));
    } else {
      setPasswordStrength({ score: 0, label: "", color: "bg-gray-200" });
    }
  }, [signUpForm.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
    setTouched({
      fullname: true,
      email: true,
      password: true,
      re_password: true,
    });

    // Validate all fields
    const isFullNameValid = validateFullName(signUpForm.fullname).status;
    const isEmailValid = validateEmail(signUpForm.email).status;
    const isPasswordValid = validatePassword(signUpForm.password).status;
    const isConfirmPasswordValid = validateConfirmPassword(
      signUpForm.password,
      signUpForm.re_password
    ).status;

    if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return; // Stop if any validation fails
    }

    try {
      setIsSubmitting(true);
      // Here you would typically make an API call to register the user
      // For example:
      // await registerUser(signUpForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast.success('Đăng ký thành công!', {
        description: 'Bạn có thể đăng nhập ngay bây giờ',
        duration: 3000,
      });
      
      // Reset form
      setSignUpForm({
        fullname: '',
        email: '',
        password: '',
        re_password: ''
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Đăng ký thất bại', {
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      {/* Sonner Toaster */}
      <div className="fixed top-4 right-4 z-50">
        <Toaster richColors position="top-right" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl flex flex-col md:flex-row p-6 md:p-10 w-[900px] max-w-full"
      >
        {/* Left side - Illustration */}
        <div className="md:w-1/2 flex items-center justify-center">
          <img
            src="../signup_slide.jpg"
            alt="Login Illustration"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>

        {/* Right side - Form */}
        <div className="md:w-1/2 flex flex-col justify-center p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
            ĐĂNG KÝ
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <TextField
                type="text"
                value={signUpForm.fullname}
                error={
                  !validateFullName(signUpForm.fullname).status &&
                  touched.fullname
                }
                labelError={
                  touched.fullname
                    ? validateFullName(signUpForm.fullname).message
                    : ""
                }
                placeholder="Họ tên"
                borderRadius={10}
                border="1px solid #777"
                backgroundColor="white"
                onChange={(e) =>
                  setSignUpForm((prev) => ({
                    ...prev,
                    fullname: e.target.value,
                  }))
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, fullname: true }))
                }
              />
            </div>
            <div>
              <TextField
                type="email"
                value={signUpForm.email}
                error={!validateEmail(signUpForm.email).status && touched.email}
                labelError={
                  touched.email ? validateEmail(signUpForm.email).message : ""
                }
                placeholder="Email"
                borderRadius={10}
                border="1px solid #777"
                backgroundColor="white"
                onChange={(e) =>
                  setSignUpForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              />
            </div>
            <div className="w-full">
              <TextField
                type="password"
                value={signUpForm.password}
                error={
                  !validatePassword(signUpForm.password).status &&
                  touched.password
                }
                labelError={
                  touched.password
                    ? validatePassword(signUpForm.password).message
                    : ""
                }
                placeholder="Mật khẩu"
                borderRadius={10}
                border="1px solid #777"
                backgroundColor="white"
                onChange={(e) =>
                  setSignUpForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, password: true }))
                }
              />
            </div>
            <div>
              <TextField
                type="password"
                value={signUpForm.re_password}
                error={
                  !validateConfirmPassword(
                    signUpForm.password,
                    signUpForm.re_password
                  ).status && touched.re_password
                }
                labelError={
                  touched.re_password
                    ? validateConfirmPassword(
                        signUpForm.password,
                        signUpForm.re_password
                      ).message
                    : ""
                }
                placeholder="Xác nhận mật khẩu"
                borderRadius={10}
                border="1px solid #777"
                backgroundColor="white"
                onChange={(e) =>
                  setSignUpForm((prev) => ({
                    ...prev,
                    re_password: e.target.value,
                  }))
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, re_password: true }))
                }
              />
            </div>
            <Button 
              type="submit" 
              value={isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
              disable={isSubmitting}
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
            value="Đăng ký bằng Google"
            iconLeft={
              <img src="../google.png" alt="Google" width={20} height={20} />
            }
          />

          <p className="text-center text-sm mt-4 text-gray-600">
            Bạn đã có tài khoản?{" "}
            <Link href="/auth/signin" className="text-green-700 font-semibold">
              Đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
