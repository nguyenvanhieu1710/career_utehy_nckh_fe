"use client";

import { User, Type, Image as ImageIcon, PlusSquare } from "lucide-react";
import Button from "@/components/ui/Button";

export const SidebarContent = ({ data, onUpdate }: any) => {
  const sections = data?.sections || [];
  const addUniqueSection = (type: string) => {
    // Kiểm tra xem đã tồn tại chưa
    const exists = sections.find((s: any) => s.type === type);
    if (exists) return alert("Thành phần này đã tồn tại!");

    const newSection = {
      id: `section-${type}`,
      type: type,
      content: type === "avatar" ? "" : "Nhập nội dung...",
      position: { x: 100, y: 100 },
      zIndex: 100
    };

    onUpdate({ sections: [...(sections || []), newSection] });
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-500 uppercase">Quản lý nội dung</h3>
      
      <div className="grid grid-cols-1 gap-2">
        <Button 
          backgroundColor="#f0f7ff"
          color="#0066cc"
          value={sections.some((s: any) => s.type === 'avatar') ? "Đã có Ảnh" : "Tạo vùng chứa Ảnh"}
          iconLeft={<ImageIcon size={18} />}
          onClick={() => addUniqueSection('avatar')}
        />

        <Button 
          backgroundColor="#f0f7ff"
          color="#0066cc"
          value={sections.some((s: any) => s.type === 'name') ? "Đã có Tên" : "Tạo nơi chứa Tên"}
          iconLeft={<User size={18} />}
          onClick={() => addUniqueSection('name')}
        />

        <Button 
          backgroundColor="#f0f7ff"
          color="#0066cc"
          value="Thêm Section mới"
          iconLeft={<PlusSquare size={18} />}
          onClick={() => {/* Logic thêm section nội dung chung */}}
        />
      </div>
    </div>
  );
};