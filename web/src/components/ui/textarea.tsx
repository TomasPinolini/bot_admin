"use client";

import { type TextareaHTMLAttributes } from "react";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextareaField({ label, className = "", ...props }: TextareaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-text-secondary">{label}</label>
      )}
      <div className="bg-bg-input border border-border rounded px-4 py-3">
        <textarea
          className={`bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-full resize-none ${className}`}
          rows={3}
          {...props}
        />
      </div>
    </div>
  );
}
