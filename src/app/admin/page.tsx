"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Crown, FolderOpen, DollarSign } from "lucide-react";

interface Stats {
  totalUsers: number;
  proUsers: number;
  totalProjects: number;
  recentSignups: { email: string; created_at: string }[];
}

export default function AdminDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, proRes, projectsRes, recentRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_pro", true),
        supabase.from("saved_projects").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("email, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      setStats({
        totalUsers: usersRes.count ?? 0,
        proUsers: proRes.count ?? 0,
        totalProjects: projectsRes.count ?? 0,
        recentSignups: recentRes.data ?? [],
      });
      setLoading(false);
    };
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-tx mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-accent" },
          { label: "Pro Users", value: stats?.proUsers ?? 0, icon: Crown, color: "text-amber-500" },
          { label: "Saved Projects", value: stats?.totalProjects ?? 0, icon: FolderOpen, color: "text-cyan-400" },
          {
            label: "Conversion Rate",
            value: stats && stats.totalUsers > 0 ? `${((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}%` : "0%",
            icon: DollarSign,
            color: "text-green-400",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-surface-1 border border-edge rounded-xl p-5"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-tx font-mono">{value}</p>
            <p className="text-xs text-tx-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent signups */}
      <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
        <h2 className="text-sm font-bold text-tx mb-4">Recent Signups</h2>
        {stats?.recentSignups.length === 0 ? (
          <p className="text-tx-muted text-sm">No users yet.</p>
        ) : (
          <div className="divide-y divide-edge">
            {stats?.recentSignups.map((u, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-tx">{u.email}</span>
                <span className="text-xs text-tx-muted">
                  {new Date(u.created_at).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
