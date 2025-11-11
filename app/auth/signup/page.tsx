"use client";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const validatePassword = (password: string) => {
    if (password.length < 8 || password.trim().includes(" ")) {
        return {
            status: false,
            message: "Mật khẩu phải trên 8 ký tự và không chứa khoảng trống"
        }
    } else if (password.includes("*")) {
        return {
            status: false,
            message: "Mật khẩu không được chứa dấu *"
        }
    } else if (password == "") {
        return {
            status: false,
            message: "Mật khẩu không được trống"
        }
    }
    return {
        status: true,
    }
}

export default function LoginPage() {
    const [signUpForm, setSignUpForm] = useState({
        fullname: "",
        email: "",
        password: "",
        re_password: "",
    })
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
                        src="../signup_slide.jpg"
                        alt="Login Illustration"
                        width={400}
                        height={400}
                        className="object-contain"
                    />
                </div>

                {/* Right side - Form */}
                <div className="md:w-1/2 flex flex-col justify-center p-6">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">ĐĂNG NHẬP</h2>

                    <form className="space-y-4">
                        <div>
                            <TextField type="text"
                                value={signUpForm.fullname}
                                error={signUpForm.fullname == ""}
                                labelError="Họ tên không được trống"
                                placeholder="Họ tên"
                                borderRadius={10}
                                border="1px solid #777"
                                backgroundColor="white"
                                onChange={(e) => setSignUpForm(prev => ({ ...prev, fullname: e.target.value }))}
                            />
                        </div>
                        <div>
                            <TextField type="email"
                                value={signUpForm.email}
                                error={signUpForm.email == ""}
                                labelError=""
                                placeholder="Email"
                                borderRadius={10}
                                border="1px solid #777"
                                backgroundColor="white"
                                onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}

                            />
                        </div>
                        <div>
                            <TextField type="password"
                                value={signUpForm.password}
                                error={!validatePassword(signUpForm.password).status}
                                labelError={validatePassword(signUpForm.password).message}
                                placeholder="Password"
                                borderRadius={10}
                                border="1px solid #777"
                                backgroundColor="white"
                                onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}

                            />
                        </div>
                        <div>
                            <TextField type="password"
                                value={signUpForm.re_password}
                                error={(signUpForm.re_password != signUpForm.password)}
                                labelError="Mật khẩu không khớp"
                                placeholder="Confirm Password"
                                borderRadius={10}
                                border="1px solid #777"
                                backgroundColor="white"
                                onChange={(e) => setSignUpForm(prev => ({ ...prev, re_password: e.target.value }))}

                            />
                        </div>
                        <Button type="submit" value="Đăng nhập" />
                    </form>

                    <div className="flex items-center justify-center m-4 text-gray-500">
                        <span className="border-t w-16"></span>
                        <span className="mx-2 text-sm">--- Hoặc ---</span>
                        <span className="border-t w-16"></span>
                    </div>

                    <Button backgroundColor="white" color="#0C6A4E" border="2px solid #0C6A4E" value="Đăng nhập bằng Google"
                        iconLeft={<img
                            src="../google.png"
                            alt="Google"
                            width={20}
                            height={20}
                        />} />

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
