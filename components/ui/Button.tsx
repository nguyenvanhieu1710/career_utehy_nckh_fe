import { useRef, ReactNode } from 'react';
import './ui.css';
import { cva, type VariantProps } from "class-variance-authority"

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  value?: string;
  height?: number | string;
  onClick?: () => void;
  backgroundColor?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  color?: string;
  border?: string;
  disable?: boolean;
  flex?: number;
}

const Button: React.FC<ButtonProps> = ({
  type,
  value = '',
  onClick,
  backgroundColor,
  iconLeft,
  iconRight,
  height = "40px",
  color,
  border,
  disable = false,
  flex,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current && !disable) {
      buttonRef.current.click();
    }
  };

  return (
    <div
      className="btn-ui-carrer"
      onClick={handleClick}
      style={{
        height: height || 40,
        opacity: disable ? 0.5 : 1,
        backgroundColor: backgroundColor || '#0C6A4E',
        border: border || '2px solid rgba(255, 255, 255, 1)',
        outline: 'none',
        cursor: disable ? 'not-allowed' : 'pointer',
        borderRadius: '10px',
        color: color || 'rgba(255, 255, 255, 1)',
        fontSize: '13px',
        fontWeight: 510,
        padding: '5px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        flex: flex || "none",
        justifyContent: 'center',
      }}
    >
      {iconLeft}
      {value}
      {iconRight}
      <button
        type={type}
        ref={buttonRef}
        onClick={onClick}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Button;

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)