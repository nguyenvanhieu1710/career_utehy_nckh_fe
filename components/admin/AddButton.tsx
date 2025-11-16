'use client';

import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export function AddButton() {
  return (
    <Button type='button' iconLeft={<Plus size={18} className="mr-2" />} />
  );
}