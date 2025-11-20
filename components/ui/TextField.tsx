import React, { forwardRef } from "react";

type TextFieldProps = {
  value: any;
  onChange?: (e: React.ChangeEvent<any>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  backgroundColor?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  borderRadius?: number | string;
  placeholder?: string;
  width?: string | number;
  border?: string;
  type?: string;
  flex?: number | string;
  mutiline?: boolean;
  name?: string;
  textAlign?: "start" | "center" | "end" | "left" | "right";
  error?: boolean;
  label?: string;
  id?: string;
  disabled?: boolean;
  labelError?: string;
  maxLength?: number;
  max?: number | string;
  min?: number | string;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  labelSize?: number[]
};

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(({
  value,
  onClick,
  backgroundColor = "#ECECEC",
  iconLeft,
  iconRight,
  borderRadius,
  placeholder,
  width,
  border,
  type = "text",
  onChange,
  flex,
  mutiline = false,
  name,
  textAlign = "start",
  error = false,
  label,
  id,
  disabled = false,
  labelError,
  maxLength,
  max,
  min,
  onFocus,
  onBlur,
  labelSize = [12, 12],
}, ref) => {
  return (
    <div style={{ width: width || "100%" }}>
      {label !== "none" && (
        <label
          style={{ fontSize: labelSize?.[0] }}
        >
          {label}
        </label>
      )}
      <div
        ref={ref}
        onClick={onClick}
        style={{
          flex: flex || 1,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
          backgroundColor: backgroundColor || "#ECECEC)",
          border: border || "none",
          boxShadow: "none",
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
        {mutiline ? (
          <textarea
            disabled={disabled}
            id={id}
            rows={4}
            maxLength={maxLength || 1720000}
            style={{
              cursor: disabled ? "not-allowed" : "text",
              maxHeight: "300px",
              width: "100%",
              color: "rgba(67, 67, 67, 1)",
              fontSize: "14px",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
            }}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
          />
        ) : (
          <input
            onFocus={onFocus}
            onBlurCapture={onBlur}
            max={max}
            min={min}
            disabled={disabled}
            id={id}
            maxLength={maxLength || 1720000}
            style={{
              textAlign: textAlign,
              cursor: disabled ? "not-allowed" : "text",
              width: "100%",
              height: "25px",
              color: "rgba(67, 67, 67, 1)",
              fontSize: "14px",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
            }}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={(e) => {
              if (error) {
                e.target.parentElement!.style.border =
                  "2px solid rgb(228, 0, 0)";
                e.target.parentElement!.style.boxShadow =
                  "0px 0px 5px rgba(228, 0, 0, 0.39)";
              } else {
                e.target.parentElement!.style.border =
                  border || "1px solid rgba(236, 236, 236, 1)";
                e.target.parentElement!.style.boxShadow = "none";
              }
            }}
          />
        )}
        {iconRight}
      </div>
      {labelError !== "none" && (
        <label style={{
          color: "red",
          fontSize: labelSize?.[1]
        }}>{error == true ? labelError : ""}</label>
      )}
    </div>
  );
});

export default TextField;
