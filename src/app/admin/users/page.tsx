"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Crown,
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_pro: boolean;
  is_admin: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  pro_expires_at: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const togglePro = async (userId: string, currentPro: boolean) => {
    setToggling(userId);
    await supabase
      .from("profiles")
      .update({ is_pro: !currentPro })
      .eq("id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_pro: !currentPro } : u))
    );
    setToggling(null);
  };

  const toggleAdmin = async (userId: string, currentAdmin: boolean) => {
    setToggling(userId);
    await supabase
      .from("profiles")
      .update({ is_admin: !currentAdmin })
      .eq("id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_admin: !currentAdmin } : u))
    );
    setToggling(null);
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-tx">Users</h1>
          <p className="text-sm text-tx-muted mt-0.5">
            {users.length} registered {users.length === 1 ? "user" : "users"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-muted" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-tx placeholder:text-tx-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filtered.map((u) => {
          const isExpanded = expandedUser === u.id;
          return (
            <div
              key={u.id}
              className="bg-surface-1 border border-edge rounded-xl overflow-hidden"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              {/* Main row */}
              <button
                onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2/50 transition-colors cursor-pointer text-left"
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                    u.is_admin
                      ? "bg-gradient-to-br from-red-500 to-red-600"
                      : u.is_pro
                      ? "bg-gradient-to-br from-amber-500 to-orange-500"
                      : "bg-gradient-to-br from-accent to-cyan-500"
                  }`}
                >
                  {(u.first_name?.[0] ?? "") + (u.last_name?.[0] ?? "") || "U"}
                </div>

                {/* Name & email */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-tx truncate">
                    {u.first_name} {u.last_name}
                    {!u.first_name && !u.last_name && (
                      <span className="text-tx-muted italic">No name</span>
                    )}
                  </p>
                  <p className="text-xs text-tx-muted truncate">{u.email}</p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {u.is_admin && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400">
                      ADMIN
                    </span>
                  )}
                  {u.is_pro && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                  {!u.is_pro && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-2 text-tx-muted">
                      FREE
                    </span>
                  )}
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-tx-muted shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-tx-muted shrink-0" />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-edge/50 bg-surface-2/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-tx-secondary">
                      <Mail className="w-3.5 h-3.5 text-tx-muted" />
                      {u.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-tx-secondary">
                      <Phone className="w-3.5 h-3.5 text-tx-muted" />
                      {u.phone || "Not provided"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-tx-secondary">
                      <Calendar className="w-3.5 h-3.5 text-tx-muted" />
                      Joined{" "}
                      {new Date(u.created_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    {u.stripe_customer_id && (
                      <div className="text-xs text-tx-muted font-mono truncate">
                        Stripe: {u.stripe_customer_id}
                      </div>
                    )}
                    {u.pro_expires_at && (
                      <div className="text-xs text-tx-muted">
                        Pro expires:{" "}
                        {new Date(u.pro_expires_at).toLocaleDateString("en-AU")}
                      </div>
                    )}
                  </div>

                  {/* Admin actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => togglePro(u.id, u.is_pro)}
                      disabled={toggling === u.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors disabled:opacity-50 ${
                        u.is_pro
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                          : "bg-surface-2 text-tx-secondary border-edge hover:bg-surface-3"
                      }`}
                    >
                      <Crown className="w-3 h-3" />
                      {u.is_pro ? "Revoke Pro" : "Grant Pro"}
                    </button>
                    <button
                      onClick={() => toggleAdmin(u.id, u.is_admin)}
                      disabled={toggling === u.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors disabled:opacity-50 ${
                        u.is_admin
                          ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                          : "bg-surface-2 text-tx-secondary border-edge hover:bg-surface-3"
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {u.is_admin ? "Revoke Admin" : "Grant Admin"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-tx-muted text-sm">No users match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
