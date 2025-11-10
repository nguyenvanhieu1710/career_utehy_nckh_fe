import { XCircle, LucideIcon } from "lucide-react";
import React from "react";

interface ChipTagProps {
  title: string;
  onRemove?: () => void;
  onClick?: () => void;
  icon?: React.ReactNode;
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  border?: string;
  width?: string;
  iconFill?: string;
  iconColor?: string;
}

const ChipTag: React.FC<ChipTagProps> = ({
  title,
  onRemove,
  onClick,
  icon,
  backgroundColor = "#eee",
  color = "#000",
  borderRadius = "50px",
  border = "1px solid #ccc",
  width = "auto",
  iconFill = "#737373ff",
  iconColor = "white",
}) => {
  return (
    <div
      className="chiptag"
      onClick={onClick}
      style={{
        maxWidth: "49%",
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        gap: "4px",
        backgroundColor,
        color,
        borderRadius,
        border,
        width,
        fontSize: "14px",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      {icon && <span className="chiptag-icon">{icon}</span>}
      <div
        style={{
          width: "90%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </div>
      {onRemove && (
        <div
          className="chiptag-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <XCircle color={iconColor} fill={iconFill} size={20} />
        </div>
      )}
    </div>
  );
};

export default ChipTag;
