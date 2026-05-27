"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";

// ─── Row ─────────────────────────────
export const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center min-h-[26px] border-b border-gray-100">
        <div className="w-[110px] shrink-0 text-[11px] text-gray-500 font-medium pl-2 py-0.5 bg-gray-50 border-r border-gray-100 select-none">
            {label}
        </div>
        <div className="flex-1 px-1.5 py-0.5">{children}</div>
    </div>
);

// ─── Number Input ────────────────────
export const NumInput = ({
    value,
    onChange,
    min,
    max,
    step = 1,
}: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
}) => (
    <input
        type="number"
        value={Math.round(value ?? 0)}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full text-[12px] border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 py-0 h-[22px] tabular-nums"
    />
);

// ─── Color Input ─────────────────────
export const ColorInput = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) => (
    <div className="flex items-center gap-1.5">
        <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-[22px] h-[22px] p-0 border-0 rounded cursor-pointer bg-transparent"
        />
        <span className="text-[11px] font-mono text-gray-400">
            {value || "#000000"}
        </span>
    </div>
);

// ─── Slider ──────────────────────────
export const SliderInput = ({
    value,
    onChange,
    min = 0,
    max = 100,
}: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
}) => (
    <div className="flex items-center gap-1.5">
        <input
            type="range"
            value={value ?? max}
            min={min}
            max={max}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-1 accent-blue-500"
        />
        <span className="text-[11px] w-[28px] text-right tabular-nums text-gray-500">
            {value ?? max}
        </span>
    </div>
);

// ─── Select ──────────────────────────
export const SelectInput = ({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
}) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[12px] border-0 bg-transparent focus:outline-none h-[22px]"
    >
        {options.map((o) => (
            <option key={o.value} value={o.value}>
                {o.label}
            </option>
        ))}
    </select>
);

// ─── Group Header ────────────────────
export const GroupHeader = ({
    label,
    open,
    onToggle,
}: {
    label: string;
    open: boolean;
    onToggle: () => void;
}) => (
    <button
        onClick={onToggle}
        className="w-full flex items-center gap-1 bg-[#e8edf5] hover:bg-[#dce3ef] px-2 py-1 text-[11px] font-bold text-[#3a4a6b] uppercase tracking-wide border-b border-[#c8d0e0] select-none"
    >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        {label}
    </button>
);