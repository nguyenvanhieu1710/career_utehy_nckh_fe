"use client";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [authForm, setAuthForm] = useState({
        email: "",
        password: ""
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
                        src="../signin_slide.jpg"
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
                            <TextField type="email"
                                value={authForm.email}
                                placeholder="Email"
                                borderRadius={10}
                                border="1px solid #777"
                                backgroundColor="white"
                                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <TextField type="password"
                                value={authForm.password}
                                placeholder="Password"
                                borderRadius={10}
                                border="1px solid #777"
                                backgroundColor="white"
                                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}

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
