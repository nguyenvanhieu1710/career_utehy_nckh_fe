import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  className?: string;
}

export default function SectionTitle({ title, className }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        "text-center text-3xl md:text-4xl font-bold text-[#5959EB] mb-12",
        className
      )}
    >
      {title}
    </h2>
  );
}