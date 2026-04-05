"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Hammer,
  Clock,
  Banknote,
  Megaphone,
  HandCoins,
  Target,
  Gauge,
} from "lucide-react";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(n: number): string {
  return n.toFixed(1) + "%";
}

interface ProjectData {
  id: string;
  name: string;
  property_address: string | null;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  purchase_price: number;
  sale_price: number;
  profit: number;
  roi: number;
  deal_rating: string;
  created_at: string;
  updated_at: string;
}

function CostLine({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className={`text-sm ${bold ? "font-semibold text-tx" : "text-tx-secondary"}`}>{label}</span>
      <span className={`text-sm font-mono ${bold ? "font-bold text-tx" : "text-tx-secondary"}`}>{value}</span>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProject = async () => {
      const { data } = await supabase
        .from("saved_projects")
        .select("*")
        .eq("id", params.id)
        .single();
      if (data) setProject(data as ProjectData);
      setLoading(false);
    };
    fetchProject();
  }, [authLoading, user, params.id, supabase, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p className="text-tx-muted">Project not found.</p>
      </div>
    );
  }

  const r = project.results;
  const inp = project.inputs;
  const isProfit = project.profit >= 0;

  // Safe getters for nested result values
  const g = (key: string): number => (typeof r[key] === "number" ? (r[key] as number) : 0);
  const gs = (key: string): string => (typeof r[key] === "string" ? (r[key] as string) : "");

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-3 sm:px-4 py-4 sm:py-8 max-w-4xl mx-auto">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-tx-muted hover:text-tx mb-6 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to My Projects
      </Link>

      {/* Header */}
      <div className="bg-surface-1 border border-edge rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--card-shadow)" }}>
        <h1 className="text-xl font-bold text-tx">{project.name}</h1>
        {project.property_address && (
          <p className="text-sm text-tx-muted flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {project.property_address}
          </p>
        )}
        <p className="text-xs text-tx-muted mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Saved on{" "}
          {new Date(project.created_at).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface-1 border border-edge rounded-xl p-4 text-center">
          <DollarSign className="w-5 h-5 mx-auto mb-1 text-accent" />
          <p className="text-[10px] text-tx-muted uppercase mb-0.5">Purchase</p>
          <p className="text-sm font-bold text-tx font-mono">{fmt(project.purchase_price)}</p>
        </div>
        <div className="bg-surface-1 border border-edge rounded-xl p-4 text-center">
          <Target className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
          <p className="text-[10px] text-tx-muted uppercase mb-0.5">Sale</p>
          <p className="text-sm font-bold text-tx font-mono">{fmt(project.sale_price)}</p>
        </div>
        <div className="bg-surface-1 border border-edge rounded-xl p-4 text-center">
          {isProfit ? (
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-400" />
          ) : (
            <TrendingDown className="w-5 h-5 mx-auto mb-1 text-red-400" />
          )}
          <p className="text-[10px] text-tx-muted uppercase mb-0.5">Profit</p>
          <p className={`text-sm font-bold font-mono ${isProfit ? "text-green-400" : "text-red-400"}`}>
            {fmt(project.profit)}
          </p>
        </div>
        <div className="bg-surface-1 border border-edge rounded-xl p-4 text-center">
          <Gauge className="w-5 h-5 mx-auto mb-1 text-amber-400" />
          <p className="text-[10px] text-tx-muted uppercase mb-0.5">ROI</p>
          <p className="text-sm font-bold text-tx font-mono">{pct(project.roi)}</p>
        </div>
      </div>

      {/* Deal Rating */}
      <div className="bg-surface-1 border border-edge rounded-2xl p-5 mb-6 text-center" style={{ boxShadow: "var(--card-shadow)" }}>
        <p className="text-xs text-tx-muted uppercase tracking-wider mb-1">Deal Rating</p>
        <p className={`text-2xl font-bold ${gs("dealRatingColor") || "text-tx"}`}>
          {project.deal_rating}
        </p>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Buying Costs */}
        <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
          <h3 className="text-sm font-bold text-tx flex items-center gap-2 mb-3">
            <Receipt className="w-4 h-4 text-accent" /> Buying Costs
          </h3>
          <div className="space-y-1.5">
            <CostLine label="Purchase Price" value={fmt(project.purchase_price)} />
            <CostLine label="Stamp Duty" value={fmt(g("stampDuty"))} />
            <CostLine label="Registration of Transfer" value={fmt(g("transferRegistration"))} />
            <CostLine label="Registration of Mortgage" value={fmt(g("mortgageRegistration"))} />
            {g("lmi") > 0 && <CostLine label="LMI" value={fmt(g("lmi"))} />}
            <CostLine label="Legal / Conveyancing" value={fmt(g("legalCostsBuy"))} />
          </div>
        </div>

        {/* Renovation & Holding */}
        <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
          <h3 className="text-sm font-bold text-tx flex items-center gap-2 mb-3">
            <Hammer className="w-4 h-4 text-accent" /> Renovation & Holding
          </h3>
          <div className="space-y-1.5">
            <CostLine label="Renovation Cost" value={fmt(g("totalRenovationCost"))} />
            <CostLine label="Contingency" value={fmt(g("contingencyAmount"))} />
            <CostLine label="Loan Interest" value={fmt(g("totalInterestCost"))} />
            <CostLine label="Holding Costs" value={fmt(g("totalHoldingCosts") - g("totalInterestCost"))} />
            <div className="border-t border-edge pt-1 mt-1">
              <CostLine label="Total Holding" value={fmt(g("totalHoldingCosts"))} bold />
            </div>
          </div>
        </div>

        {/* Sales & Marketing */}
        <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
          <h3 className="text-sm font-bold text-tx flex items-center gap-2 mb-3">
            <Megaphone className="w-4 h-4 text-accent" /> Sales & Marketing
          </h3>
          <div className="space-y-1.5">
            <CostLine label="Agent Commission" value={fmt(g("agentCommission"))} />
            <CostLine label="Settlement Costs" value={fmt(g("settlementCosts"))} />
            <CostLine label="Staging" value={fmt(g("stagingCosts"))} />
            <CostLine label="Photos & Listing" value={fmt(g("photosAndListing"))} />
            <CostLine label="Other" value={fmt(g("otherSellingCosts"))} />
            <div className="border-t border-edge pt-1 mt-1">
              <CostLine label="Total Selling" value={fmt(g("totalSellingCosts"))} bold />
            </div>
          </div>
        </div>

        {/* Private Funding */}
        {g("privateFundingAmount") > 0 && (
          <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
            <h3 className="text-sm font-bold text-tx flex items-center gap-2 mb-3">
              <HandCoins className="w-4 h-4 text-accent" /> Private Funding
            </h3>
            <div className="space-y-1.5">
              <CostLine label="Funding Amount" value={fmt(g("privateFundingAmount"))} />
              <CostLine label="Private Money Interest" value={fmt(g("privateFundingInterest"))} bold />
            </div>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="mt-6 bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
        <h3 className="text-sm font-bold text-tx flex items-center gap-2 mb-3">
          <Banknote className="w-4 h-4 text-accent" /> Summary
        </h3>
        <div className="space-y-1.5">
          <CostLine label="Total Project Cost" value={fmt(g("totalProjectCost"))} bold />
          <CostLine label="Expected Sale Price" value={fmt(project.sale_price)} />
          <div className="border-t border-edge pt-2 mt-2">
            <CostLine
              label="Estimated Profit"
              value={fmt(project.profit)}
              bold
            />
            <CostLine label="ROI" value={pct(project.roi)} bold />
            <CostLine label="Annualised ROI" value={pct(g("annualisedROI"))} />
            <CostLine label="Cash Invested" value={fmt(g("cashInvested"))} />
          </div>
        </div>
      </div>
    </div>
  );
}
