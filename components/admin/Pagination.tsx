'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PaginationProps {
  amountOfRecord: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  amountOfRecord,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: PaginationProps) {
  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (onPageChange && page !== currentPage) {
      onPageChange(page);
    }
  };

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-600">Tổng {amountOfRecord} bản ghi</p>
      <div className="flex items-center gap-2">
        <Button
          type='button'
          iconLeft={<ChevronLeft size={16} />}
          onClick={handlePrev}
          disable={isPrevDisabled}
        />
        <div className="px-2">{currentPage}</div>
        <Button
          type='button'
          iconLeft={<ChevronRight size={16} />}
          onClick={handleNext}
          disable={isNextDisabled}
        />
      </div>
    </div>
  );
}