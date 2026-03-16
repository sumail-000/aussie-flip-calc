"use client";

import { useState, useCallback, useRef } from "react";
import {
  calculate,
  STATE_DATA,
  type CalculatorInputs,
  type CalculatorResults,
} from "@/lib/calculator";
import { useTheme } from "@/components/ThemeProvider";
import {
  Home as HomeIcon,
  Hammer,
  Landmark,
  BarChart3,
  Receipt,
  Wrench,
  Banknote,
  ShieldAlert,
  Calculator,
  Sun,
  Moon,
  Info,
  RotateCcw,
  Target,
  Gauge,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  ExternalLink,
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

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step,
  min,
  max,
  tooltip,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-tx-secondary flex items-center gap-1.5">
        {label}
        {tooltip && (
          <span className="group relative cursor-help">
            <Info className="w-3.5 h-3.5 text-tx-muted" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs bg-surface-3 text-tx rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg border border-edge-light">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step || 1}
          min={min}
          max={max}
          className={`w-full bg-input-bg border border-input-border rounded-lg py-2.5 text-sm text-tx placeholder:text-tx-muted focus:outline-none focus:ring-2 focus:ring-input-focus/40 focus:border-input-focus ${
            prefix ? "pl-8" : "pl-3"
          } ${suffix ? "pr-14" : "pr-3"}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-muted text-xs font-medium pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtext,
  icon,
  color,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-surface-1 border border-edge rounded-xl p-4 sm:p-5" style={{ boxShadow: "var(--card-shadow)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-tx-muted">{icon}</span>
        <p className="text-xs font-semibold text-tx-muted uppercase tracking-wider">{label}</p>
      </div>
      <p className={`font-bold text-xl sm:text-2xl ${color || "text-tx"}`}>{value}</p>
      {subtext && <p className="text-xs text-tx-muted mt-1">{subtext}</p>}
    </div>
  );
}

function SectionHeader({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <h3 className="text-base font-semibold text-tx flex items-center gap-2.5 mb-4">
      <span className="text-accent">{icon}</span>
      {children}
    </h3>
  );
}

function CostLine({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className={`text-sm ${bold ? "font-semibold text-tx" : "text-tx-secondary"}`}>
        {label}
      </span>
      <span className={`text-sm font-mono ${bold ? "font-bold text-tx" : "text-tx-secondary"}`}>
        {value}
      </span>
    </div>
  );
}

const DEFAULT_INPUTS: CalculatorInputs = {
  purchasePrice: 500000,
  state: "NSW",
  renovationCost: 50000,
  contingencyPercent: 10,
  expectedSalePrice: 700000,
  loanLVR: 80,
  interestRate: 6.5,
  holdingPeriodMonths: 6,
  agentCommissionPercent: 2.0,
  marketingCost: 5000,
};

export default function Home() {
  const { theme, toggle } = useTheme();
  const [inputs, setInputs] = useState<CalculatorInputs>({ ...DEFAULT_INPUTS });
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const selectedState = STATE_DATA.find((s) => s.code === inputs.state);

  const update = useCallback(
    (field: keyof CalculatorInputs, value: number | string) => {
      setInputs((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleCalculate = useCallback(() => {
    const r = calculate(inputs);
    setResults(r);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [inputs]);

  const handleReset = useCallback(() => {
    setInputs({ ...DEFAULT_INPUTS });
    setResults(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ───── Header ───── */}
      <header
        className="border-b border-edge sticky top-0 z-50 backdrop-blur-md"
        style={{ background: "color-mix(in srgb, var(--surface-1) 85%, transparent)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-tx leading-tight tracking-tight">
                Aussie Flip Calc
              </h1>
              <p className="text-[11px] text-tx-muted hidden sm:block">
                Property Renovation Calculator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-edge hover:bg-surface-2 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-tx-secondary" />
              ) : (
                <Moon className="w-4 h-4 text-tx-secondary" />
              )}
            </button>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/10 text-accent font-semibold tracking-wide border border-accent/20">
              v1.0
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* ───── Input Cards ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {/* Property Details */}
          <div className="bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--card-shadow)" }}>
            <SectionHeader icon={<HomeIcon className="w-4.5 h-4.5" />}>Property Details</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Purchase Price"
                value={inputs.purchasePrice}
                onChange={(v) => update("purchasePrice", v)}
                prefix="$"
                step={10000}
                min={0}
                tooltip="Expected purchase price of the property"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-tx-secondary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-tx-muted" />
                  State / Territory
                </label>
                <select
                  value={inputs.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="w-full bg-input-bg border border-input-border rounded-lg py-2.5 px-3 text-sm text-tx focus:outline-none focus:ring-2 focus:ring-input-focus/40 focus:border-input-focus cursor-pointer"
                >
                  {STATE_DATA.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {selectedState && (
                  <p className="text-[11px] text-tx-muted flex items-center gap-1 mt-0.5">
                    <ExternalLink className="w-3 h-3" />
                    Rates from {selectedState.source} (eff. {selectedState.effectiveDate})
                    {selectedState.foreignSurcharge > 0 && (
                      <span className="ml-1 text-amber-500">
                        +{selectedState.foreignSurcharge}% foreign surcharge
                      </span>
                    )}
                  </p>
                )}
              </div>
              <InputField
                label="Expected Sale Price"
                value={inputs.expectedSalePrice}
                onChange={(v) => update("expectedSalePrice", v)}
                prefix="$"
                step={10000}
                min={0}
                tooltip="What you expect to sell for after renovation"
              />
              <InputField
                label="Holding Period"
                value={inputs.holdingPeriodMonths}
                onChange={(v) => update("holdingPeriodMonths", v)}
                suffix="months"
                step={1}
                min={1}
                max={60}
                tooltip="Total time from purchase to sale"
              />
            </div>
          </div>

          {/* Renovation */}
          <div className="bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--card-shadow)" }}>
            <SectionHeader icon={<Hammer className="w-4.5 h-4.5" />}>Renovation Costs</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Renovation Budget"
                value={inputs.renovationCost}
                onChange={(v) => update("renovationCost", v)}
                prefix="$"
                step={5000}
                min={0}
                tooltip="Total renovation spend before contingency"
              />
              <InputField
                label="Contingency Buffer"
                value={inputs.contingencyPercent}
                onChange={(v) => update("contingencyPercent", v)}
                suffix="%"
                step={1}
                min={0}
                max={50}
                tooltip="Buffer for unexpected costs (10-15% recommended)"
              />
            </div>
          </div>

          {/* Financing */}
          <div className="bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--card-shadow)" }}>
            <SectionHeader icon={<Landmark className="w-4.5 h-4.5" />}>Financing</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Loan LVR"
                value={inputs.loanLVR}
                onChange={(v) => update("loanLVR", v)}
                suffix="%"
                step={5}
                min={0}
                max={95}
                tooltip="Loan-to-Value Ratio — borrowing % of property value"
              />
              <InputField
                label="Interest Rate"
                value={inputs.interestRate}
                onChange={(v) => update("interestRate", v)}
                suffix="% p.a."
                step={0.1}
                min={0}
                max={20}
                tooltip="Annual interest rate on your loan"
              />
            </div>
          </div>

          {/* Selling Costs */}
          <div className="bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--card-shadow)" }}>
            <SectionHeader icon={<BarChart3 className="w-4.5 h-4.5" />}>Selling Costs</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Agent Commission"
                value={inputs.agentCommissionPercent}
                onChange={(v) => update("agentCommissionPercent", v)}
                suffix="%"
                step={0.1}
                min={0}
                max={10}
                tooltip="Real estate agent commission on sale price"
              />
              <InputField
                label="Marketing Cost"
                value={inputs.marketingCost}
                onChange={(v) => update("marketingCost", v)}
                prefix="$"
                step={500}
                min={0}
                tooltip="Optional advertising/marketing spend"
              />
            </div>
          </div>
        </div>

        {/* ───── Action Buttons ───── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button
            onClick={handleCalculate}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] cursor-pointer text-sm"
          >
            <Calculator className="w-4 h-4" />
            Calculate Flip Profit
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-2 hover:bg-surface-3 text-tx-secondary font-medium rounded-xl border border-edge cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* ───── Results ───── */}
        {results && (
          <div ref={resultsRef} className="space-y-6">
            {/* KPI Row */}
            <div className="animate-fade-in grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Estimated Profit"
                value={fmt(results.estimatedProfit)}
                icon={<TrendingUp className="w-4 h-4" />}
                color={results.estimatedProfit >= 0 ? "text-emerald-500" : "text-red-500"}
              />
              <KpiCard
                label="Profit Margin"
                value={pct(results.profitMargin)}
                icon={<Gauge className="w-4 h-4" />}
                color={
                  results.profitMargin >= 10
                    ? "text-emerald-500"
                    : results.profitMargin >= 0
                    ? "text-amber-500"
                    : "text-red-500"
                }
              />
              <KpiCard
                label="Return on Cash"
                value={pct(results.roi)}
                subtext={`Annualised: ${pct(results.annualisedROI)}`}
                icon={<Target className="w-4 h-4" />}
              />
              <KpiCard
                label="Deal Rating"
                value={results.dealRating}
                icon={<ShieldAlert className="w-4 h-4" />}
                color={results.dealRatingColor}
              />
            </div>

            {/* Max Offer Banner */}
            <div
              className="animate-fade-in animate-fade-in-delay-1 glow-pulse rounded-2xl p-6 sm:p-8 text-center border border-accent/20"
              style={{ background: "color-mix(in srgb, var(--accent) 8%, var(--surface-1))" }}
            >
              <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Recommended Maximum Offer Price
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-tx tracking-tight">
                {fmt(results.maxOfferPrice)}
              </p>
              <p className="text-xs text-tx-muted mt-2">
                Based on a target 15% profit margin after all costs
              </p>
            </div>

            {/* Detailed Breakdown */}
            <div className="animate-fade-in animate-fade-in-delay-2 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Buying */}
              <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
                <SectionHeader icon={<Receipt className="w-4.5 h-4.5" />}>Buying Costs</SectionHeader>
                <div className="space-y-2.5">
                  <CostLine label="Purchase Price" value={fmt(inputs.purchasePrice)} />
                  <CostLine label={`Stamp Duty (${inputs.state})`} value={fmt(results.stampDuty)} />
                  <CostLine label="Legal / Conveyancing" value={fmt(results.legalCostsBuy)} />
                  <div className="border-t border-edge pt-2.5 mt-2.5">
                    <CostLine
                      label="Total Buying"
                      value={fmt(inputs.purchasePrice + results.stampDuty + results.legalCostsBuy)}
                      bold
                    />
                  </div>
                </div>
              </div>

              {/* Renovation + Holding */}
              <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
                <SectionHeader icon={<Wrench className="w-4.5 h-4.5" />}>Renovation & Holding</SectionHeader>
                <div className="space-y-2.5">
                  <CostLine label="Renovation Budget" value={fmt(inputs.renovationCost)} />
                  <CostLine label={`Contingency (${inputs.contingencyPercent}%)`} value={fmt(results.contingencyAmount)} />
                  <CostLine label="Total Renovation" value={fmt(results.totalRenovationCost)} bold />
                  <div className="border-t border-edge my-2.5" />
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-tx-muted" />
                    <span className="text-[11px] font-medium text-tx-muted uppercase tracking-wider">
                      Holding ({inputs.holdingPeriodMonths} months)
                    </span>
                  </div>
                  <CostLine label="Loan Interest" value={fmt(results.totalInterestCost)} />
                  <CostLine label="Insurance" value={fmt(results.holdingCostsInsurance)} />
                  <CostLine label="Council Rates" value={fmt(results.holdingCostsCouncilRates)} />
                  <CostLine label="Utilities" value={fmt(results.holdingCostsUtilities)} />
                  <div className="border-t border-edge pt-2.5 mt-2.5">
                    <CostLine label="Total Holding" value={fmt(results.totalHoldingCosts)} bold />
                  </div>
                </div>
              </div>

              {/* Selling + Summary */}
              <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
                <SectionHeader icon={<Banknote className="w-4.5 h-4.5" />}>Selling & Summary</SectionHeader>
                <div className="space-y-2.5">
                  <CostLine label={`Agent (${inputs.agentCommissionPercent}%)`} value={fmt(results.agentCommission)} />
                  <CostLine label="Marketing" value={fmt(results.marketingCost)} />
                  <CostLine label="Legal / Conveyancing" value={fmt(results.legalCostsSell)} />
                  <div className="border-t border-edge pt-2.5 mt-2.5">
                    <CostLine label="Total Selling" value={fmt(results.totalSellingCosts)} bold />
                  </div>
                  <div className="border-t border-edge my-2.5" />
                  <CostLine label="Loan Amount" value={fmt(results.loanAmount)} />
                  <CostLine label="Cash Invested" value={fmt(results.cashInvested)} />
                  <div className="border-t border-edge pt-2.5 mt-2.5">
                    <CostLine label="Total Project Cost" value={fmt(results.totalProjectCost)} bold />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Analysis */}
            <div
              className="animate-fade-in animate-fade-in-delay-3 bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <SectionHeader icon={<ShieldAlert className="w-4.5 h-4.5" />}>
                Risk Analysis — Sale Price Sensitivity
              </SectionHeader>
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-tx-muted border-b border-edge">
                      <th className="py-3 pr-4 font-semibold">Scenario</th>
                      <th className="py-3 pr-4 font-semibold">Sale Price</th>
                      <th className="py-3 pr-4 font-semibold">Profit</th>
                      <th className="py-3 pr-4 font-semibold">ROI</th>
                      <th className="py-3 font-semibold">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.riskAnalysis.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-edge/50 hover:bg-surface-2/50 ${
                          row.scenario === "Expected" ? "bg-surface-2/40" : ""
                        }`}
                      >
                        <td className="py-3 pr-4 font-medium text-tx-secondary flex items-center gap-1.5">
                          {row.profit >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          )}
                          {row.scenario}
                        </td>
                        <td className="py-3 pr-4 text-tx-secondary font-mono text-xs">
                          {fmt(row.salePrice)}
                        </td>
                        <td
                          className={`py-3 pr-4 font-semibold font-mono text-xs ${
                            row.profit >= 0 ? "text-emerald-500" : "text-red-500"
                          }`}
                        >
                          {fmt(row.profit)}
                        </td>
                        <td className="py-3 pr-4 text-tx-secondary font-mono text-xs">
                          {pct(row.roi)}
                        </td>
                        <td className={`py-3 font-medium text-xs ${row.color}`}>
                          {row.outcome}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-surface-2/50 border border-edge rounded-xl p-4 text-[11px] text-tx-muted leading-relaxed">
              <strong className="text-tx-secondary">Disclaimer:</strong> This calculator provides estimates
              only. Stamp duty brackets are sourced from official state revenue offices for the 2025-26
              financial year (general/investor rates) and may not reflect recent indexation, concessions,
              or exemptions. Holding costs (insurance ~$150/mo, council rates ~$200/mo, utilities ~$100/mo)
              are national averages. Always consult a qualified accountant, conveyancer, or financial advisor
              before making investment decisions. This tool does not constitute financial advice.
            </div>
          </div>
        )}
      </main>

      {/* ───── Footer ───── */}
      <footer className="border-t border-edge py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-tx-muted">
            Aussie Flip Calc v1.0 — Built for Australian property investors.
          </p>
          <p className="text-[11px] text-tx-muted mt-1">
            Not financial advice. Consult professionals before investing. Stamp duty sources verified Jan 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
