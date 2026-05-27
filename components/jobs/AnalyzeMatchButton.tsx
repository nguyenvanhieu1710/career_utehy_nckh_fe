"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AnalyzeMatchButtonProps {
  jobId: string;
  /**
   * Visual size.
   * - `sm`: inline action inside a card
   * - `md`: stand-alone CTA in a modal footer or page header
   */
  size?: "sm" | "md";
  /** Render only the icon (square) — used in tight card layouts. */
  iconOnly?: boolean;
  className?: string;
  /** Optional click handler invoked *before* navigation (e.g. analytics). */
  onClickBefore?: () => void;
}

/**
 * Prominent CTA that takes the user to /career/suitable-job-detail?jobId=...
 *
 * Visual treatment is deliberately loud:
 * - Indigo→fuchsia gradient with a soft outer glow (pulses on idle).
 * - Continuous gentle scale "breathe" so it draws the eye without spinning.
 * - Sparkle icon (single 4-pointed star) inside an animated wrapper.
 * - Diagonally-pinned "MỚI" badge in the top-right corner.
 *
 * The button is `stopPropagation()`-safe — placing it inside another
 * clickable surface (JobCard) is intentional.
 */
export const AnalyzeMatchButton = ({
  jobId,
  size = "sm",
  iconOnly = false,
  className = "",
  onClickBefore,
}: AnalyzeMatchButtonProps) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClickBefore?.();
    // Clear any stale cached payload so the destination page re-fetches
    // by id rather than rendering whatever was last clicked.
    try {
      sessionStorage.removeItem("selected_job_detail");
    } catch {
      /* sessionStorage may be unavailable */
    }
    router.push(`/career/suitable-job-detail?jobId=${encodeURIComponent(jobId)}`);
  };

  const sizeClasses =
    size === "md"
      ? "px-5 py-2.5 text-sm gap-2 rounded-xl"
      : "px-3 py-1.5 text-xs gap-1.5 rounded-lg";

  const iconClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <span className={`relative inline-flex ${className}`}>
      {/* Pulsing glow halo — pure CSS, doesn't capture clicks */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 opacity-60 blur-md animate-pulse"
      />

      <motion.button
        type="button"
        onClick={handleClick}
        title="Phân tích độ phù hợp với CV của bạn (AI)"
        aria-label="Phân tích độ phù hợp với CV"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        className={`
          relative cursor-pointer overflow-visible
          inline-flex items-center justify-center
          ${sizeClasses}
          font-semibold text-white
          bg-gradient-to-r from-green-500 via-white-500 to-green-600
          shadow-lg shadow-green-500/40
          ring-1 ring-white/30
          hover:from-green-600 hover:via-white-600 hover:to-green-700
          focus:outline-none focus:ring-2 focus:ring-green-300
          transition-colors
        `}
      >
        <motion.span
          animate={{ rotate: [0, 12, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex"
        >
          <Sparkles className={iconClass} strokeWidth={2.4} />
        </motion.span>
        {!iconOnly && (
          <span className="whitespace-nowrap">
            {size === "md" ? "Phân tích CV" : "Phân tích CV"}
          </span>
        )}

        {/* Diagonal "MỚI" ribbon */}
        <span
          aria-hidden
          className="
            pointer-events-none
            absolute -top-2 -right-3
            rotate-[18deg]
            text-[9px] font-extrabold tracking-wider
            text-rose-700 bg-yellow-300
            px-1.5 py-0.5 rounded-sm
            shadow-md ring-1 ring-rose-300
          "
          style={{
            transformOrigin: "center",
          }}
        >
          MỚI
        </span>
      </motion.button>
    </span>
  );
};
