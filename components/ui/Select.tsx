import React, { forwardRef } from "react";
import "./ui.css";

type SelectProps = {
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  backgroundColor?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  borderRadius?: number | string;
  width?: string | number;
  type?: string;
  border?: string;
  name?: string;
  color?: string;
  label?: string;
  id?: string;
  children: React.ReactNode;
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
};

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value,
      onClick,
      backgroundColor = "#ECECEC",
      iconLeft,
      iconRight,
      borderRadius,
      width,
      type,
      border,
      onChange,
      children,
      name,
      color,
      label,
      id,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    return (
      <>
        {label && <label>{label}</label>}
        <div
          ref={ref}
          onClick={onClick}
          style={{
            width: width || "100%",
            height: "40px",
            backgroundColor: backgroundColor,
            border: border || "none",
            outline: "none",
            overflow: "hidden",
            borderRadius: borderRadius,
            boxSizing: "border-box",
            padding: "6px",
            display: "flex",
            alignItems: "center",
            gap: "3px",
          }}
        >
          {iconLeft}
          <select
            id={id}
            className="select-box-ui-career"
            style={{
              width: "100%",
              color: color || "#3a3a3aff",
              fontSize: "14px",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
            }}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {children}
          </select>
          {iconRight}
        </div>
      </>
    );
  }
);

export default Select;
