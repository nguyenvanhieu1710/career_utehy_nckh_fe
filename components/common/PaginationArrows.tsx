// components/common/PaginationArrows.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationArrows() {
  return (
    <div className="flex gap-3">
      <button
        aria-label="Previous"
        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button
        aria-label="Next"
        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}