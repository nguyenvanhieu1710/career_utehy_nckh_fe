"use client";

import { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Đổi mật khẩu");
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
            <Input
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 py-3 rounded-xl border-gray-300"
              required
            />
          </motion.div>

          {/* NEW PASSWORD */}
          <motion.div variants={itemVariants}>
            <Label className="text-gray-700 font-bold">Mật khẩu mới</Label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 py-3 rounded-xl border-gray-300"
              required
            />
          </motion.div>

          {/* CONFIRM PASSWORD */}
          <motion.div variants={itemVariants}>
            <Label className="text-gray-700 font-bold">
              Xác nhận mật khẩu mới
            </Label>
            <Input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 py-3 rounded-xl border-gray-300"
              required
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between pt-4"
          >
            <Link href="/profile">
              <button
                type="button"
                className="px-8 py-3 border border-green-700 text-green-700 rounded-xl font-medium hover:bg-green-50 cursor-pointer"
              >
                Hủy
              </button>
            </Link>

            <button
              type="submit"
              className="px-8 py-3 bg-green-800 text-white rounded-xl font-medium hover:bg-green-600 cursor-pointer"
            >
              Đổi mật khẩu
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
