"use client";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import TextField from "@/components/ui/TextField";
import { setTokenCookie, setUserStorage } from "@/services/auth";
import { sendVerifyEmail, verifyEmail } from "@/services/email";
import { motion } from "framer-motion";
import { Check, ChevronLeft, MailCheck, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from 'next/router'
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";

export default function VerifyPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verifyState, setVerifyState] = useState('loading');
    const [nextSecond, setNextSecond] = useState(5);
    const { token } = useParams()
    useEffect(() => {
        if (verifyState == "ok") {
            const interval = setInterval(() => {
                setNextSecond((prev) => {
                    const next = prev - 1;
                    if (next <= 0){
                        window.location.href = "/";
                        return 0;
                    }
                    return next;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [verifyState]);
    useEffect(() => {
        setIsSubmitting(true);
        setVerifyState("loading")
        verifyEmail(token as string).then(res => {
            const resData = res.data;
            if (resData.status == 'success') {
                setVerifyState('ok')
                toast.success(resData.message);
                const userData = resData.data;
                setTokenCookie(userData.access_token);
                setUserStorage(userData.email, userData.user_name, userData.user_id, userData.fullname)
            } else if (resData.status == 'failed') {
                toast.error(resData.message);
                setVerifyState('error')

            }
        }).catch(err => {

        }).finally(() => setIsSubmitting(false))
    }, []);



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
            {isSubmitting ? <Loader /> : <></>}
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
                        src="../../verify_slide.jpg"
                        alt="Login Illustration"
                        width={400}
                        height={400}
                        className="object-contain"
                    />
                </div>

                {/* Right side - Form */}
                <div className="md:w-1/2 flex flex-col justify-center p-6">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
                        XÁC THỰC EMAIL
                    </h2>

                    {verifyState == 'ok' ? <>
                        <div className="flex flex-col items-center text-green-800">
                            <Check color="#0C6A4E" size={100} strokeWidth={1} />
                            <div>
                                Xác thực thành công !
                            </div>
                            <div>
                                Chào mừng <strong>{localStorage.getItem("fullname")}</strong> đã tham gia
                            </div>
                            <div className="text-orange-400">
                                Trở về trang chủ sau <strong>{nextSecond}</strong> giây
                            </div>
                        </div>
                    </> :
                        verifyState == 'error' ? <>
                            <div className="flex flex-col items-center text-red-800">
                                <X color="#bd0300ff" size={100} strokeWidth={1} />
                                <div className="font-bold">
                                    Xác thực không thành công !
                                </div>
                                <div className="">
                                    Thư xác thực đã hết hạn hoặc đã được sử dụng, vui lòng đăng ký lại <Link href={"/auth/signup"} className="text-green-700 underline cursor-pointer">Đăng ký</Link>
                                </div>
                                <div>
                                    <Button value="Thử lại" iconLeft={<RotateCcw />} backgroundColor="#e8980eff" />
                                </div>
                            </div>
                        </> :
                            <>
                                <div className="flex flex-col items-center text-green-800">
                                    <div>
                                        Đang xác thực...
                                    </div>
                                </div>
                            </>
                    }
                </div>
            </motion.div>
        </div>
    );
}
