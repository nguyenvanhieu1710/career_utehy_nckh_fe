"use client";

import * as Avatar from "@radix-ui/react-avatar";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Lock, LogOut, UserRound } from "lucide-react";
import Button from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { getUserStorage, logout } from "@/services/auth";

// Animation variants with proper TypeScript types
const containerVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
} as const;

export default function ProfileSidebar() {
  const [active, setActive] = useState({
    lookingJob: true,
    visibleForRecruiter: false,
  });
  const [userName, setUserName] = useState("");

  // Load user name from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStorage = getUserStorage();
      setUserName(userStorage.fullname || "");
    }
  }, []);

  return (
    <motion.aside
      className="bg-white rounded-xl shadow p-6 flex flex-col items-center"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div
        variants={itemVariants}
        className="w-full flex justify-center"
      >
        <motion.div
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden"
          whileHover={{
            scale: 1.02,
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 10,
              duration: 0.3,
            },
          }}
        >
          <Avatar.Root className="w-full h-full">
            <Avatar.Image
              className="w-full h-full object-cover"
              src="/avatars/avatar-7.jpg"
              alt="Avatar"
            />
            <Avatar.Fallback className="text-gray-500">A</Avatar.Fallback>
          </Avatar.Root>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center">
        <p className="text-black-600">Chào bạn trở lại,</p>
        <h3 className="font-semibold text-lg mb-5">{userName || "Guest"}</h3>
      </motion.div>

      <motion.div
        className="w-full space-y-3 mb-6"
        variants={{
          hidden: { opacity: 0, y: 10 },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              delay: 0.2,
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <Button iconLeft={<UserRound size={16} />} value="Thông tin cơ bản" />
        <Button
          iconLeft={<Lock size={16} />}
          value="Đổi mật khẩu"
          onClick={() => (window.location.href = "/auth/change-password")}
        />
        <Button
          iconLeft={<LogOut size={16} />}
          value="Đăng xuất"
          backgroundColor="#d50000ff"
          onClick={logout}
        />
      </motion.div>

      <motion.div className="w-full" variants={itemVariants}>
        <div className="flex items-center gap-2 mb-2">
          <Switch
            id="lookingJob"
            checked={active.lookingJob}
            onCheckedChange={(v) =>
              setActive((prev) => ({ ...prev, lookingJob: v }))
            }
          />
          <Label htmlFor="lookingJob">Đang tắt việc tức thì</Label>
        </div>
        <p className="text-xs text-black-500">
          Bật trạng thái ứng tuyển ngay để gia tăng cơ hội việc làm.
        </p>
      </motion.div>
    </motion.aside>
  );
}
