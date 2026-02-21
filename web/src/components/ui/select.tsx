"use client";

import { type SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, options, className = "", ...props }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-text-secondary">{label}</label>
      )}
      <div className="flex items-center bg-bg-input border border-border rounded px-4 py-3">
        <select
          className={`bg-transparent text-sm text-text-primary outline-none w-full cursor-pointer ${className}`}
          {...props}
        >
          <option value="" className="bg-bg-input">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-input">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
