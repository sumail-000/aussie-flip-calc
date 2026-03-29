"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import {
  Crown,
  Check,
  ArrowLeft,
  Calculator,
  Hammer,
  Download,
  Mail,
  Save,
  Zap,
} from "lucide-react";

const FREE_FEATURES = [
  "Basic calculator",
  "All Australian states",
  "Stamp duty & LMI calculations",
  "Registration fees",
  "Deal rating & risk analysis",
];

const PRO_FEATURES = [
  "Everything in Free, plus:",
  "Detailed renovation breakdown",
  "Download PDF reports",
  "Email reports to clients",
  "Save & manage projects",
  "Priority support",
];

export default function PricingPage() {
  const { user, isPro } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-tx-muted hover:text-tx mb-8 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Calculator
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-tx mb-2">
            Upgrade to Pro
          </h1>
          <p className="text-tx-muted max-w-md mx-auto">
            Unlock the full power of Aussie Flip Calc with detailed renovation
            budgets, PDF reports, and project management.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-surface-1 border border-edge rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-tx">Free</h2>
            </div>
            <p className="text-sm text-tx-muted mb-4">
              Get started with property flipping
            </p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-tx">$0</span>
              <span className="text-tx-muted text-sm"> / forever</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-tx-secondary">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {!user ? (
              <Link
                href="/signup"
                className="block text-center py-2.5 rounded-lg text-sm font-semibold text-accent border border-accent/30 hover:bg-accent/5 transition-colors"
              >
                Sign Up Free
              </Link>
            ) : (
              <div className="py-2.5 text-center text-sm font-medium text-tx-muted">
                Current Plan
              </div>
            )}
          </div>

          {/* Pro Plan */}
          <div className="bg-surface-1 border-2 border-amber-500/40 rounded-2xl p-6 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
              Most Popular
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-tx">Pro</h2>
            </div>
            <p className="text-sm text-tx-muted mb-4">
              Full toolkit for serious flippers
            </p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-tx">$29</span>
              <span className="text-tx-muted text-sm"> / month</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-tx-secondary">
                  <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="py-2.5 text-center text-sm font-bold text-amber-500">
                You&apos;re on Pro!
              </div>
            ) : user ? (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Get Pro Now
                  </>
                )}
              </button>
            ) : (
              <Link
                href="/signup"
                className="block text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition-opacity shadow-md"
              >
                Sign Up to Get Pro
              </Link>
            )}
          </div>
        </div>

        {/* Feature comparison icons */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { icon: Hammer, label: "Detailed Reno Budget", pro: true },
            { icon: Download, label: "PDF Reports", pro: true },
            { icon: Mail, label: "Email Reports", pro: true },
            { icon: Save, label: "Save Projects", pro: true },
          ].map(({ icon: Icon, label, pro }) => (
            <div
              key={label}
              className="text-center p-4 rounded-xl bg-surface-1 border border-edge"
            >
              <Icon className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <p className="text-xs font-medium text-tx-secondary">{label}</p>
              {pro && (
                <span className="inline-block mt-1 text-[10px] font-bold text-amber-500">
                  PRO
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
