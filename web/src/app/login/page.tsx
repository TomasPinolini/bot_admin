"use client";

import { InputField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);
  const router = useRouter();

  return (
    <div className="flex h-screen">
      {/* Left Hero */}
      <div className="flex flex-col justify-between flex-1 bg-bg-sidebar p-15">
        <div className="flex flex-col gap-12">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded-md" />
            <span className="text-lg font-bold font-[family-name:var(--font-heading)] text-text-primary">
              Bot Admin
            </span>
          </div>

          <div className="flex flex-col gap-4 max-w-lg">
            <h1 className="text-[42px] font-bold font-[family-name:var(--font-heading)] text-text-primary leading-tight tracking-tight">
              Manage AI chatbot implementations at scale.
            </h1>
            <p className="text-base text-text-secondary leading-relaxed">
              Track companies, projects, blueprints and tools across your entire client portfolio.
            </p>
          </div>

          <div className="flex gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-semibold font-[family-name:var(--font-heading)] text-text-primary">500+</span>
              <span className="text-xs text-text-muted">Companies</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-semibold font-[family-name:var(--font-heading)] text-text-primary">2,400+</span>
              <span className="text-xs text-text-muted">Projects</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-semibold font-[family-name:var(--font-heading)] text-text-primary">99.9%</span>
              <span className="text-xs text-text-muted">Uptime</span>
            </div>
          </div>
        </div>

        <span className="text-xs text-text-muted">
          &copy; 2026 Bot Admin. All rights reserved.
        </span>
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center w-[520px] bg-bg-main p-15">
        <div className="flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold font-[family-name:var(--font-heading)] text-text-primary">
              Sign in
            </h2>
            <p className="text-sm text-text-secondary">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <InputField label="Email Address" type="email" placeholder="you@company.com" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-secondary">Password</label>
              <div className="flex items-center bg-bg-input border border-border rounded px-4 py-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input type="checkbox" className="accent-accent" />
                Remember me
              </label>
              <button
                className="text-sm text-accent hover:underline cursor-pointer"
                onClick={() => setForgotMsg(true)}
              >
                Forgot password?
              </button>
            </div>
            {forgotMsg && (
              <p className="text-sm text-text-secondary">Contact your administrator to reset your password.</p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Button variant="primary" className="w-full py-3" onClick={() => router.push("/")}>
              Sign in
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Button variant="secondary" className="w-full py-3" onClick={() => router.push("/")}>
              Continue with SSO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
