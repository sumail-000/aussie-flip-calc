"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Trash2,
  Eye,
  User,
} from "lucide-react";

interface AdminProject {
  id: string;
  user_id: string;
  name: string;
  property_address: string | null;
  purchase_price: number;
  sale_price: number;
  profit: number;
  roi: number;
  deal_rating: string;
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function ratingColor(rating: string): string {
  if (rating?.includes("Excellent")) return "text-green-400";
  if (rating?.includes("Great")) return "text-green-300";
  if (rating?.includes("Good")) return "text-blue-400";
  if (rating?.includes("Marginal")) return "text-yellow-400";
  if (rating?.includes("Risky")) return "text-orange-400";
  return "text-red-500";
}

export default function AdminProjectsPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase
      .from("saved_projects")
      .select(
        "id, user_id, name, property_address, purchase_price, sale_price, profit, roi, deal_rating, created_at, updated_at, profiles(first_name, last_name, email)"
      )
      .order("updated_at", { ascending: false });
    if (data) setProjects(data as unknown as AdminProject[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from("saved_projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const filtered = projects.filter(
    (p) =>
      (p.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.property_address ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.profiles?.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.profiles?.first_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-tx">All Projects</h1>
          <p className="text-sm text-tx-muted mt-0.5">
            {projects.length} projects across all users
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-muted" />
        <input
          type="text"
          placeholder="Search by property, name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-tx placeholder:text-tx-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {/* Projects table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-tx-muted text-sm">No projects found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-edge text-[11px] text-tx-muted uppercase tracking-wider">
                <th className="pb-2 pr-4">Property</th>
                <th className="pb-2 pr-4">User</th>
                <th className="pb-2 pr-4 text-right">Purchase</th>
                <th className="pb-2 pr-4 text-right">Sale</th>
                <th className="pb-2 pr-4 text-right">Profit</th>
                <th className="pb-2 pr-4">Rating</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge/50">
              {filtered.map((p) => {
                const isProfit = p.profit >= 0;
                return (
                  <tr key={p.id} className="hover:bg-surface-2/30 transition-colors group">
                    <td className="py-3 pr-4">
                      <div className="max-w-[180px]">
                        <p className="text-sm font-medium text-tx truncate">{p.name}</p>
                        {p.property_address && (
                          <p className="text-[11px] text-tx-muted truncate flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {p.property_address}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="max-w-[140px]">
                        <p className="text-xs text-tx-secondary truncate flex items-center gap-1">
                          <User className="w-3 h-3 shrink-0 text-tx-muted" />
                          {p.profiles?.first_name} {p.profiles?.last_name}
                        </p>
                        <p className="text-[11px] text-tx-muted truncate">{p.profiles?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-xs font-mono text-tx-secondary">{fmt(p.purchase_price)}</span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-xs font-mono text-tx-secondary">{fmt(p.sale_price)}</span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`text-xs font-mono font-semibold flex items-center gap-0.5 justify-end ${isProfit ? "text-green-400" : "text-red-400"}`}>
                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {fmt(Math.abs(p.profit))}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold ${ratingColor(p.deal_rating)}`}>
                        {p.deal_rating || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[11px] text-tx-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(p.updated_at).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/projects/${p.id}`}
                          className="p-1.5 rounded-lg text-tx-muted hover:text-accent hover:bg-accent/10"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="p-1.5 rounded-lg text-tx-muted hover:text-red-500 hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
