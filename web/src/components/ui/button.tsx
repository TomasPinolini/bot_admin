"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({ variant = "primary", icon, children, className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-medium font-[family-name:var(--font-heading)] rounded transition-colors cursor-pointer";
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    secondary: "bg-transparent text-text-primary border border-border hover:bg-bg-card",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}
