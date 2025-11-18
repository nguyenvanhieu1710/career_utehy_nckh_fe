'use client';

import Button from '@/components/ui/Button';
import { Ban, Edit, Trash2, View } from 'lucide-react';

interface ActionTypeProps {
  type: "edit" | "view" | "delete" | "ban",
  onClick?: () => void
}

export function ActionButtons({ type, onClick }: ActionTypeProps) {
  return (
    <Button type='button'
      onClick={onClick}
      iconLeft={type == "edit" ? <Edit size={16} /> : type == "delete" ? <Trash2 size={16} /> : type == "ban" ? <Ban size={16} /> : <View size={16} />}
      backgroundColor={`${type == "edit" ? "#275c99ff" : type == "delete" || type == "ban" ? "#b60000ff" : "#2f7733ff"}`}
    />
  );
}