"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Layers,
  Wrench,
  BookOpen,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Companies", icon: Building2, href: "/companies" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Blueprints", icon: Layers, href: "/blueprints" },
  { label: "Tools", icon: Wrench, href: "/tools" },
  { label: "Catalog", icon: BookOpen, href: "/catalog" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col justify-between w-60 h-screen bg-bg-sidebar border-r border-border py-6 shrink-0">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5">
          <div className="w-7 h-7 bg-accent rounded-md" />
          <span className="text-lg font-bold font-[family-name:var(--font-heading)] text-text-primary">
            Bot Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-bg-active text-text-primary font-medium"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {isActive && (
                  <div className="w-1 h-4 bg-accent rounded-sm -ml-1 mr-0" />
                )}
                <item.icon size={18} className={isActive ? "text-text-primary" : "text-text-muted"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 px-5">
        <div className="w-8 h-8 rounded-full bg-border" />
        <div className="flex flex-col">
          <span className="text-sm text-text-primary">User</span>
          <span className="text-xs text-text-muted">Bot Admin</span>
        </div>
      </div>
    </aside>
  );
}
