"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { type ReactNode } from "react";

const TABS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-red-400/50" />
          <p className="text-tx font-semibold">Access Denied</p>
          <p className="text-tx-muted text-sm mt-1">
            You don&apos;t have admin privileges.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mt-4 text-xs text-accent hover:text-accent/80"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Calculator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3rem)]">
      {/* Sub-nav tabs */}
      <div className="border-b border-edge bg-surface-1/50 px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          <ShieldAlert className="w-4 h-4 text-red-400 mr-2 shrink-0" />
          {TABS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  active
                    ? "bg-red-500/10 text-red-400"
                    : "text-tx-muted hover:text-tx hover:bg-surface-2"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}
