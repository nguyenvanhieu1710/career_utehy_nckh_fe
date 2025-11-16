'use client';

import Button from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';

export function ActionButtons() {
  return (
    <>
      <Button type='button' iconLeft={<Edit size={16} className="text-gray-600" />} />
      <Button type='button' iconLeft={<Trash2 size={16} className="text-gray-600" />} />
    </>
  );
}