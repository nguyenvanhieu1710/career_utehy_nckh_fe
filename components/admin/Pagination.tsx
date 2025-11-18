'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export function Pagination({
  amountOfRecord
}: { amountOfRecord: number }) {
  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-600">Tổng {amountOfRecord} bản ghi</p>
      <div className="flex items-center gap-2">
        <Button type='button' iconLeft={<ChevronLeft size={16} />} />
        <div>1</div>
        <Button type='button' iconLeft={<ChevronRight size={16} />} />
      </div>
    </div>
  );
}