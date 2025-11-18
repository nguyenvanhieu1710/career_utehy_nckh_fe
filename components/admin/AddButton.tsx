'use client';

import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
interface AddButtonProps {
  onClick: () => void
}
export function AddButton({ onClick }: AddButtonProps) {
  return (
    <Button type='button' onClick={onClick} iconLeft={<Plus size={18} className="mr-2" />} value='ADD' />
  );
}