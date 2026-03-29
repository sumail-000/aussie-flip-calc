"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Crown, Lock } from "lucide-react";
import Link from "next/link";

interface ProGateProps {
  children: ReactNode;
  feature: string; // e.g. "Detailed Renovation Breakdown"
}

export default function ProGate({ children, feature }: ProGateProps) {
  const { isPro, user } = useAuth();

  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      {/* Greyed-out content */}
      <div className="pointer-events-none select-none opacity-30 blur-[2px] filter saturate-0">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-surface-1/95 backdrop-blur-sm border border-edge rounded-2xl px-6 py-5 text-center max-w-xs shadow-xl">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-500/15 flex items-center justify-center">
            {user ? (
              <Crown className="w-5 h-5 text-amber-500" />
            ) : (
              <Lock className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <h3 className="text-sm font-bold text-tx mb-1">
            {user ? "Pro Feature" : "Sign Up Required"}
          </h3>
          <p className="text-xs text-tx-muted mb-3 leading-relaxed">
            {user
              ? `${feature} is available with a Pro subscription.`
              : `Create a free account to access the calculator. Upgrade to Pro for ${feature}.`}
          </p>
          {user ? (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              <Crown className="w-3 h-3" />
              Upgrade to Pro
            </Link>
          ) : (
            <div className="flex gap-2 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-accent to-cyan-500 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Sign Up Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-tx-secondary border border-edge rounded-lg hover:bg-surface-2 transition-colors"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
