"use client";

import { type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function InputField({ label, className = "", ...props }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-text-secondary">{label}</label>
      )}
      <div className="flex items-center bg-bg-input border border-border rounded px-4 py-3">
        <input
          className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-full"
          {...props}
        />
      </div>
    </div>
  );
}
