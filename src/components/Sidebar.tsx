"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import {
  Calculator,
  LayoutGrid,
  FolderOpen,
  Crown,
  ShieldAlert,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  DollarSign,
  MapPin,
  Settings,
  Zap,
} from "lucide-react";

interface BoardLink {
  id: string;
  name: string;
}

export default function Sidebar() {
  const { user, profile, isPro, isAdmin, loading, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [wsExpanded, setWsExpanded] = useState(true);
  const [boards, setBoards] = useState<BoardLink[]>([]);

  const fetchBoards = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("boards")
      .select("id, name")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);
    if (data) setBoards(data);
  }, [user, supabase]);

  useEffect(() => {
    if (user) fetchBoards();
  }, [user, fetchBoards]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initials = profile
    ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() || "U"
    : "";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinkClass = (href: string) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-accent/10 text-accent"
        : "text-tx-secondary hover:text-tx hover:bg-surface-2/60"
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center shadow-md">
            <Calculator className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-tx text-sm tracking-tight block leading-tight">
              Aussie Flip Calc
            </span>
            <span className="text-[10px] text-tx-muted leading-none">
              Property Calculator
            </span>
          </div>
        </Link>
      </div>

      <div className="border-b border-edge mx-3 mb-2" />

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <Link href="/" className={navLinkClass("/")}>
          <Calculator className="w-4 h-4" />
          Calculator
        </Link>

        {false && user && (
          <>
            {/* Workspace section — dev only */}
            <div className="mt-3">
              <button
                onClick={() => setWsExpanded(!wsExpanded)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-tx-muted uppercase tracking-wider hover:text-tx-secondary transition-colors cursor-pointer"
              >
                <span>Workspace</span>
                {wsExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>

              {wsExpanded && (
                <div className="space-y-0.5 mt-0.5">
                  <Link
                    href="/workspace"
                    className={navLinkClass("/workspace")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    All Boards
                  </Link>

                  {/* Board list */}
                  {boards.map((b) => (
                    <Link
                      key={b.id}
                      href={`/workspace/${b.id}`}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors truncate ${
                        pathname === `/workspace/${b.id}`
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-tx-muted hover:text-tx-secondary hover:bg-surface-2/40"
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0" />
                      <span className="truncate">{b.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/projects" className={navLinkClass("/projects")}>
              <FolderOpen className="w-4 h-4" />
              My Projects
            </Link>
          </>
        )}

        {false && !isPro && user && (
          <Link
            href="/pricing"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-amber-500 hover:bg-amber-500/10 transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Link>
        )}

        {isAdmin && (
          <>
            <div className="border-b border-edge my-2" />
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/admin")
                  ? "bg-red-500/10 text-red-400"
                  : "text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-edge mx-3 mt-2" />
      <div className="px-3 py-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-tx-muted hover:text-tx hover:bg-surface-2/60 transition-colors cursor-pointer w-full"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        {user ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-2/60 transition-colors"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                  isPro
                    ? "bg-gradient-to-br from-amber-500 to-orange-500"
                    : "bg-gradient-to-br from-accent to-cyan-500"
                }`}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-tx truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-[10px] text-tx-muted truncate">
                  {profile?.email}
                </p>
              </div>
              {isPro && (
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/15 px-1.5 py-0.5 rounded-full shrink-0">
                  PRO
                </span>
              )}
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </>
        ) : (
          <div className="space-y-1">
            <Link
              href="/login"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-tx-secondary hover:text-tx hover:bg-surface-2/60 transition-colors"
            >
              <User className="w-4 h-4" />
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-accent to-cyan-500 hover:opacity-90 transition-opacity"
            >
              <Zap className="w-3.5 h-3.5" />
              Sign Up Free
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 fixed left-0 top-0 bottom-0 border-r border-edge bg-surface-1 flex-col h-screen z-40 overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-50 bg-surface-1/90 backdrop-blur-xl border-b border-edge">
        <div className="flex items-center justify-between px-4 h-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-tx text-sm">Aussie Flip Calc</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-tx-muted hover:text-tx hover:bg-surface-2 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-12 bottom-0 w-64 bg-surface-1 border-r border-edge z-50 overflow-y-auto">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
