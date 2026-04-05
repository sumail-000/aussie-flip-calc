"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  Trash2,
  ArrowLeft,
  MapPin,
  Clock,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Crown,
} from "lucide-react";

interface SavedProject {
  id: string;
  name: string;
  property_address: string | null;
  purchase_price: number;
  sale_price: number;
  profit: number;
  roi: number;
  deal_rating: string;
  created_at: string;
  updated_at: string;
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
  if (rating.includes("Excellent")) return "text-green-400";
  if (rating.includes("Great")) return "text-green-300";
  if (rating.includes("Good")) return "text-blue-400";
  if (rating.includes("Marginal")) return "text-yellow-400";
  if (rating.includes("Risky")) return "text-orange-400";
  return "text-red-500";
}

export default function ProjectsPage() {
  const { user, isPro, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_projects")
      .select(
        "id, name, property_address, purchase_price, sale_price, profit, roi, deal_rating, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading && user) fetchProjects();
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, fetchProjects, router]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from("saved_projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-3 sm:px-4 py-4 sm:py-8 max-w-5xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-tx-muted hover:text-tx mb-6 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Calculator
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-tx">My Projects</h1>
          <p className="text-sm text-tx-muted mt-0.5">
            {projects.length} saved {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-accent to-cyan-500 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </Link>
      </div>

      {!isPro && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
          <p className="text-sm text-tx-secondary">
            <Crown className="w-4 h-4 text-amber-500 inline mr-1 -mt-0.5" />
            Saving projects is a <strong className="text-amber-500">Pro</strong> feature.{" "}
            <Link href="/pricing" className="text-amber-500 underline hover:no-underline font-medium">
              Upgrade now
            </Link>
          </p>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-14 h-14 mx-auto mb-4 text-tx-muted/30" />
          <p className="text-tx-muted font-medium">No saved projects yet</p>
          <p className="text-tx-muted text-sm mt-1 mb-4">
            Calculate a property flip and save it to see it here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-accent to-cyan-500 rounded-lg hover:opacity-90 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Start a New Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const isProfit = p.profit >= 0;
            return (
              <div
                key={p.id}
                className="bg-surface-1 border border-edge rounded-2xl overflow-hidden hover:border-accent/30 transition-colors group"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                {/* Card header */}
                <div className="px-5 pt-4 pb-3 border-b border-edge/50">
                  <h3 className="text-sm font-bold text-tx truncate">{p.name}</h3>
                  {p.property_address && (
                    <p className="text-xs text-tx-muted flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {p.property_address}
                    </p>
                  )}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-px bg-edge/30">
                  <div className="bg-surface-1 px-4 py-3">
                    <p className="text-[10px] text-tx-muted uppercase tracking-wider mb-0.5">Purchase</p>
                    <p className="text-sm font-bold text-tx font-mono">{fmt(p.purchase_price)}</p>
                  </div>
                  <div className="bg-surface-1 px-4 py-3">
                    <p className="text-[10px] text-tx-muted uppercase tracking-wider mb-0.5">Sale</p>
                    <p className="text-sm font-bold text-tx font-mono">{fmt(p.sale_price)}</p>
                  </div>
                  <div className="bg-surface-1 px-4 py-3">
                    <p className="text-[10px] text-tx-muted uppercase tracking-wider mb-0.5">Profit</p>
                    <p className={`text-sm font-bold font-mono flex items-center gap-0.5 ${isProfit ? "text-green-400" : "text-red-400"}`}>
                      {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {fmt(Math.abs(p.profit))}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${ratingColor(p.deal_rating)}`}>
                      {p.deal_rating}
                    </span>
                    <span className="text-[11px] text-tx-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(p.updated_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/projects/${p.id}`}
                      className="p-1.5 rounded-lg text-tx-muted hover:text-accent hover:bg-accent/10 transition-colors"
                      title="View project"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="p-1.5 rounded-lg text-tx-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
