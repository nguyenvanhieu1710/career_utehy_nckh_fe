"use client";

import * as Avatar from "@radix-ui/react-avatar";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Edit, Lock, UserRound } from "lucide-react";
import Button from "@/components/ui/Button";
// import { Label } from "@radix-ui/react-label";

export default function ProfileSidebar() {
  const [active, setActive] = useState({
    lookingJob: false,
    visibleForRecruiter: false,
  });
  const [isOn, setIsOn] = useState(false);

  return (
    <aside className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <Avatar.Root className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
        <Avatar.Image
          className="w-full h-full rounded-full object-cover"
          src="/avatars/avatar-7.jpg"
          alt="Avatar"
        />
        <Avatar.Fallback className="text-gray-500">A</Avatar.Fallback>
      </Avatar.Root>

      <p className="text-black-600">Chào bạn trở lại,</p>
      <h3 className="font-semibold text-lg mb-5">Ariana Greenblatt</h3>

      <div className="w-full space-y-3 mb-6">
        <Button iconLeft={<UserRound size={16} />} value="Thông tin cơ bản" />
        <Button iconLeft={<Edit size={16} />} value="Mong muốn của bạn" />
        <Button iconLeft={<Lock size={16} />} value="Đổi mật khẩu" />
      </div>

      <div className="flex items-center justify-between w-full">
        <div>
          <Switch
            id="lookingJob"
            checked={active.lookingJob}
            onCheckedChange={(v) =>
              setActive((prev) => ({ ...prev, lookingJob: v }))
            }
          />
          {/* <Label htmlFor="lookingJob">Đang tắt việc tức thì</Label> */}
          <p className="text-xs text-gray-500">
            Bật trạng thái ứng tuyển ngay để gia tăng cơ hội việc làm.
          </p>
        </div>
      </div>
    </aside>
  );
}
