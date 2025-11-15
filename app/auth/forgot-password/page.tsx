"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // TODO: Gọi API xử lý quên mật khẩu
            console.log('Email gửi yêu cầu:', email);

            // Giả lập gọi API
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage('Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.');
            setEmail('');
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
            setMessage('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 text-gray-700">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 ">Quên mật khẩu</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu
                    </p>
                </div>

                {message && (
                    <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">
                        {message}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Địa chỉ email
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Button type='submit' value={isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'} disable={isLoading} />
                    </div>
                </form>

                <div className="text-center">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}