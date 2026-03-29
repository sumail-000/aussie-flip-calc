"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Crown,
  ArrowLeft,
  Save,
  Shield,
} from "lucide-react";

export default function ProfilePage() {
  const { user, profile, isPro, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync state when profile loads
  if (
    profile &&
    !saving &&
    firstName === "" &&
    lastName === "" &&
    phone === ""
  ) {
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setPhone(profile.phone);
  }

  if (loading)
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
      })
      .eq("id", user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleManageSubscription = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-8 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-tx-muted hover:text-tx mb-6 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Calculator
      </Link>

      <h1 className="text-2xl font-bold text-tx mb-6">Profile</h1>

      {/* Subscription status */}
      <div
        className={`mb-6 p-4 rounded-xl border ${
          isPro
            ? "bg-amber-500/5 border-amber-500/20"
            : "bg-surface-2/50 border-edge"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPro ? "bg-amber-500/15" : "bg-surface-2"
              }`}
            >
              {isPro ? (
                <Crown className="w-5 h-5 text-amber-500" />
              ) : (
                <Shield className="w-5 h-5 text-tx-muted" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-tx">
                {isPro ? "Pro Plan" : "Free Plan"}
              </p>
              <p className="text-xs text-tx-muted">
                {isPro
                  ? "All features unlocked"
                  : "Upgrade for full access"}
              </p>
            </div>
          </div>
          {isPro ? (
            <button
              onClick={handleManageSubscription}
              className="px-4 py-2 text-xs font-medium text-tx-secondary border border-edge rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Manage Subscription
            </button>
          ) : (
            <Link
              href="/pricing"
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-surface-1 border border-edge rounded-2xl p-6 shadow-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-tx-secondary mb-1.5">
                <User className="w-3 h-3" /> First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-input-bg border border-input-border text-sm text-tx focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-tx-secondary mb-1.5">
                <User className="w-3 h-3" /> Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-input-bg border border-input-border text-sm text-tx focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-tx-secondary mb-1.5">
              <Mail className="w-3 h-3" /> Email
            </label>
            <input
              type="email"
              value={profile?.email ?? ""}
              disabled
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2/50 border border-edge text-sm text-tx-muted cursor-not-allowed"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-tx-secondary mb-1.5">
              <Phone className="w-3 h-3" /> Contact Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-input-bg border border-input-border text-sm text-tx focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-accent to-cyan-500 rounded-lg hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
