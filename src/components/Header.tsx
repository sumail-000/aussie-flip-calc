"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import {
  Calculator,
  Sun,
  Moon,
  User,
  LogOut,
  Crown,
  Menu,
  X,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";

export default function Header() {
  const { user, profile, isPro, isAdmin, loading, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = profile
    ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() || "U"
    : "";

  return (
    <header className="sticky top-0 z-50 bg-surface-1/80 backdrop-blur-xl border-b border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Calculator className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-tx text-sm sm:text-base tracking-tight">
              Aussie Flip Calc
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-medium text-tx-secondary hover:text-tx hover:bg-surface-2 rounded-lg transition-colors"
            >
              Calculator
            </Link>
            {user && (
              <Link
                href="/projects"
                className="px-3 py-1.5 text-sm font-medium text-tx-secondary hover:text-tx hover:bg-surface-2 rounded-lg transition-colors"
              >
                My Projects
              </Link>
            )}
            {!isPro && user && (
              <Link
                href="/pricing"
                className="px-3 py-1.5 text-sm font-medium text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors flex items-center gap-1"
              >
                <Crown className="w-3.5 h-3.5" />
                Upgrade
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-tx-muted hover:text-tx hover:bg-surface-2 transition-colors cursor-pointer"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-surface-2 animate-pulse" />
            ) : user ? (
              /* Profile dropdown */
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${
                      isPro
                        ? "bg-gradient-to-br from-amber-500 to-orange-500"
                        : "bg-gradient-to-br from-accent to-cyan-500"
                    }`}
                  >
                    {initials}
                  </div>
                  <ChevronDown className="w-3 h-3 text-tx-muted" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-surface-1 border border-edge rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-edge">
                        <p className="text-sm font-semibold text-tx truncate">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-xs text-tx-muted truncate">
                          {profile?.email}
                        </p>
                        {isPro && (
                          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500">
                            <Crown className="w-2.5 h-2.5" /> PRO
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-tx-secondary hover:text-tx hover:bg-surface-2 transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          Profile
                        </Link>
                        {!isPro && (
                          <Link
                            href="/pricing"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            Upgrade to Pro
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Auth buttons */
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-medium text-tx-secondary hover:text-tx hover:bg-surface-2 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-accent to-cyan-500 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                  Sign Up Free
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-tx-muted hover:text-tx hover:bg-surface-2 transition-colors cursor-pointer"
            >
              {menuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-edge bg-surface-1 px-4 pb-4 pt-2 space-y-1">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-tx-secondary hover:text-tx hover:bg-surface-2 rounded-lg"
          >
            Calculator
          </Link>
          {user && (
            <Link
              href="/projects"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-tx-secondary hover:text-tx hover:bg-surface-2 rounded-lg"
            >
              My Projects
            </Link>
          )}
          {!isPro && user && (
            <Link
              href="/pricing"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-amber-500 hover:bg-amber-500/10 rounded-lg"
            >
              Upgrade to Pro
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              Admin Panel
            </Link>
          )}
          {!user && (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-tx-secondary hover:text-tx hover:bg-surface-2 rounded-lg"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/10 rounded-lg"
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
