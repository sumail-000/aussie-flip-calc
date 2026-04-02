"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  calculate,
  calculateStampDuty,
  calculateLMI,
  STATE_DATA,
  type CalculatorInputs,
  type CalculatorResults,
  type AdditionalCosts,
  type SalesMarketingCosts,
  type PrivateFunding,
  type PrivateFundingIncludes,
} from "@/lib/calculator";
import { useAuth } from "@/components/AuthProvider";
import ProGate from "@/components/ProGate";
import RenovationBudget from "@/components/RenovationBudget";
import {
  DEFAULT_SECTIONS,
  grandTotal,
  type RenovationSection,
} from "@/lib/renovation-categories";
import {
  Home as HomeIcon,
  Hammer,
  Landmark,
  BarChart3,
  Receipt,
  Wrench,
  Banknote,
  ShieldAlert,
  Shield,
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
  Wallet,
  List,
  FileText,
  Download,
  Mail,
  DollarSign,
  HandCoins,
  ClipboardList,
  Megaphone,
  Crown,
  Lock,
  Save,
  Check,
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

// ── Address Autocomplete ─────────────────────────────────────────────────────

function AddressInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      setLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "au" },
      types: ["address"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
      }
    });
  }, [loaded, onChange]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-tx-secondary flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-tx-muted" />
        Property Address
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing an Australian address..."
        className="w-full bg-input-bg border border-input-border rounded-lg py-2.5 px-3 text-sm text-tx placeholder:text-tx-muted focus:outline-none focus:ring-2 focus:ring-input-focus/40 focus:border-input-focus"
      />
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <p className="text-[11px] text-tx-muted">
          Tip: Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local for address autocomplete
        </p>
      )}
    </div>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEPOSIT_OPTIONS = [5, 10, 15, 20] as const;

const DEFAULT_ADDITIONAL_COSTS: AdditionalCosts = {
  buildingAndPest: 0,
  settlementFee: 0,
  projectManagementFee: 0,
  siteDueDiligenceFee: 0,
  brokerageFee: 0,
  councilRates: 0,
  waterRates: 0,
  power: 0,
  insurance: 0,
};

const DEFAULT_SALES_MARKETING: SalesMarketingCosts = {
  settlementCosts: 0,
  stagingCosts: 0,
  photosAndListing: 0,
  agentCommissionPercent: 2.0,
  otherCosts: 0,
};

const DEFAULT_PRIVATE_FUNDING: PrivateFunding = {
  enabled: false,
  includes: {
    deposit: false,
    stampDuty: false,
    renovation: false,
    additionalCosts: false,
    interestCosts: false,
    otherAmount: 0,
  },
  interestRate: 10,
  timeFrameMonths: 6,
};

const DEFAULT_INPUTS: CalculatorInputs = {
  propertyAddress: "",
  purchasePrice: 500000,
  state: "NSW",
  renovationCost: 50000,
  contingencyPercent: 10,
  expectedSalePrice: 700000,
  depositPercent: 20,
  interestRate: 6.5,
  holdingPeriodMonths: 6,
  additionalCosts: { ...DEFAULT_ADDITIONAL_COSTS },
  salesMarketing: { ...DEFAULT_SALES_MARKETING },
  privateFunding: { ...DEFAULT_PRIVATE_FUNDING },
};

// ── PDF Generation ───────────────────────────────────────────────────────────

async function generatePDF(inputs: CalculatorInputs, results: CalculatorResults) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  let y = 20;
  const lm = 14;
  const rm = w - 14;

  const addLine = (label: string, val: string, bold = false) => {
    if (bold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(label, lm, y);
    doc.text(val, rm, y, { align: "right" });
    y += 6;
  };

  const addSection = (title: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(title, lm, y);
    y += 2;
    doc.setDrawColor(37, 99, 235);
    doc.line(lm, y, rm, y);
    y += 6;
    doc.setTextColor(0, 0, 0);
  };

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, w, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Aussie Flip Calc", lm, 15);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Property Renovation Feasibility Report", lm, 24);
  if (inputs.propertyAddress) {
    doc.setFontSize(9);
    doc.text(inputs.propertyAddress, lm, 31);
  }
  doc.setTextColor(0, 0, 0);
  y = 45;

  // Deal summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const profitColor = results.estimatedProfit >= 0 ? [22, 163, 74] : [220, 38, 38];
  doc.setTextColor(profitColor[0], profitColor[1], profitColor[2]);
  doc.text(`Estimated Profit: ${fmt(results.estimatedProfit)}`, lm, y);
  y += 7;
  doc.setFontSize(11);
  doc.text(`Deal Rating: ${results.dealRating}`, lm, y);
  y += 7;
  doc.text(`Max Offer Price: ${fmt(results.maxOfferPrice)}`, lm, y);
  doc.setTextColor(0, 0, 0);
  y += 4;

  // KPIs
  addSection("Key Metrics");
  addLine("Profit Margin", pct(results.profitMargin));
  addLine("Return on Cash (ROI)", pct(results.roi));
  addLine("Annualised ROI", pct(results.annualisedROI));
  addLine("Cash Invested", fmt(results.cashInvested));

  // Buying Costs
  addSection("Buying Costs");
  addLine("Purchase Price", fmt(inputs.purchasePrice));
  addLine(`Stamp Duty (${inputs.state})`, fmt(results.stampDuty));
  addLine("Registration of Transfer", fmt(results.transferRegistration));
  addLine("Registration of Mortgage", fmt(results.mortgageRegistration));
  if (results.lmi > 0) addLine("LMI", fmt(results.lmi));
  addLine("Legal / Conveyancing", fmt(results.legalCostsBuy));

  // Additional Costs
  const ac = results.additionalCosts;
  const acItems = [
    ["Building & Pest", ac.buildingAndPest],
    ["Settlement Fee", ac.settlementFee],
    ["Project Management", ac.projectManagementFee],
    ["Site & Due Diligence", ac.siteDueDiligenceFee],
    ["Brokerage Fee", ac.brokerageFee],
  ] as const;
  const hasAdditional = acItems.some(([, v]) => v > 0);
  if (hasAdditional) {
    addSection("Additional Costs");
    for (const [label, val] of acItems) {
      if (val > 0) addLine(label, fmt(val));
    }
    addLine("Total Additional", fmt(results.totalAdditionalCosts), true);
  }

  // Renovation
  addSection("Renovation");
  addLine("Renovation Budget", fmt(results.totalRenovationCost - results.contingencyAmount));
  addLine(`Contingency (${inputs.contingencyPercent}%)`, fmt(results.contingencyAmount));
  addLine("Total Renovation", fmt(results.totalRenovationCost), true);

  // Holding Costs
  addSection("Holding Costs");
  addLine("Loan Interest", fmt(results.totalInterestCost));
  if (results.holdingCostsInsurance > 0) addLine("Insurance", fmt(results.holdingCostsInsurance));
  if (results.holdingCostsCouncilRates > 0) addLine("Council Rates", fmt(results.holdingCostsCouncilRates));
  if (results.holdingCostsWaterRates > 0) addLine("Water Rates", fmt(results.holdingCostsWaterRates));
  if (results.holdingCostsPower > 0) addLine("Power", fmt(results.holdingCostsPower));
  addLine("Total Holding", fmt(results.totalHoldingCosts), true);

  // Private Funding
  if (inputs.privateFunding.enabled && results.privateFundingInterest > 0) {
    addSection("Private Funding");
    addLine("Private Loan Amount", fmt(results.privateFundingAmount));
    addLine("Interest Rate", pct(inputs.privateFunding.interestRate));
    addLine("Term", `${inputs.privateFunding.timeFrameMonths} months`);
    addLine("Private Money Interest", fmt(results.privateFundingInterest), true);
  }

  // Sales & Marketing
  addSection("Sales & Marketing");
  addLine(`Agent Commission (${inputs.salesMarketing.agentCommissionPercent}%)`, fmt(results.agentCommission));
  if (results.settlementCosts > 0) addLine("Settlement Costs", fmt(results.settlementCosts));
  if (results.stagingCosts > 0) addLine("Staging", fmt(results.stagingCosts));
  if (results.photosAndListing > 0) addLine("Photos & Listing", fmt(results.photosAndListing));
  if (results.otherSellingCosts > 0) addLine("Other Costs", fmt(results.otherSellingCosts));
  addLine("Total Sales & Marketing", fmt(results.totalSellingCosts), true);

  // Summary
  addSection("Project Summary");
  addLine(`Deposit (${inputs.depositPercent}%)`, fmt(results.deposit));
  addLine("Base Loan", fmt(results.loanAmount));
  addLine("Effective Loan", fmt(results.effectiveLoan));
  addLine("Total Project Cost", fmt(results.totalProjectCost), true);
  addLine("Expected Sale Price", fmt(inputs.expectedSalePrice), true);
  addLine("ESTIMATED PROFIT", fmt(results.estimatedProfit), true);

  // Risk Analysis
  if (y > 220) { doc.addPage(); y = 20; }
  addSection("Risk Analysis");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Scenario", lm, y);
  doc.text("Sale Price", lm + 50, y);
  doc.text("Profit", lm + 90, y);
  doc.text("ROI", lm + 125, y);
  doc.text("Outcome", lm + 145, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  for (const row of results.riskAnalysis) {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(row.scenario, lm, y);
    doc.text(fmt(row.salePrice), lm + 50, y);
    const pColor = row.profit >= 0 ? [22, 163, 74] : [220, 38, 38];
    doc.setTextColor(pColor[0], pColor[1], pColor[2]);
    doc.text(fmt(row.profit), lm + 90, y);
    doc.setTextColor(0, 0, 0);
    doc.text(pct(row.roi), lm + 125, y);
    doc.text(row.outcome, lm + 145, y);
    y += 5;
  }

  // Disclaimer
  y += 6;
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Disclaimer: This report provides estimates only. Always consult qualified professionals before making investment decisions.",
    lm, y, { maxWidth: rm - lm }
  );

  return doc;
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const { user, isPro } = useAuth();
  const [inputs, setInputs] = useState<CalculatorInputs>({ ...DEFAULT_INPUTS });
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [renoMode, setRenoMode] = useState<"simple" | "detailed">("simple");
  const [renoSections, setRenoSections] = useState<RenovationSection[]>(
    () => JSON.parse(JSON.stringify(DEFAULT_SECTIONS))
  );

  // Email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const selectedState = STATE_DATA.find((s) => s.code === inputs.state);

  const depositAmount = Math.round(inputs.purchasePrice * (inputs.depositPercent / 100));
  const loanAmount = inputs.purchasePrice - depositAmount;
  const derivedLvr = inputs.purchasePrice > 0
    ? Math.round((loanAmount / inputs.purchasePrice) * 100)
    : 0;

  // Pre-compute values for private funding checkbox hints
  const stampDutyEstimate = calculateStampDuty(inputs.purchasePrice, inputs.state);

  const additionalCostsTotal =
    inputs.additionalCosts.buildingAndPest +
    inputs.additionalCosts.settlementFee +
    inputs.additionalCosts.projectManagementFee +
    inputs.additionalCosts.siteDueDiligenceFee +
    inputs.additionalCosts.brokerageFee +
    inputs.additionalCosts.councilRates +
    inputs.additionalCosts.waterRates +
    inputs.additionalCosts.power +
    inputs.additionalCosts.insurance;

  const effectiveRenoCost = (() => {
    const base = renoMode === "detailed" ? grandTotal(renoSections) : inputs.renovationCost;
    return base + base * (inputs.contingencyPercent / 100);
  })();

  const interestCostEstimate = (() => {
    const lmi = derivedLvr > 80 ? calculateLMI(loanAmount, derivedLvr) : 0;
    const effectiveLoan = loanAmount + lmi;
    const monthlyRate = inputs.interestRate / 100 / 12;
    return Math.round(effectiveLoan * monthlyRate * inputs.holdingPeriodMonths);
  })();

  const update = useCallback(
    (field: keyof CalculatorInputs, value: number | string) => {
      setInputs((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateAdditional = useCallback(
    (field: keyof AdditionalCosts, value: number) => {
      setInputs((prev) => ({
        ...prev,
        additionalCosts: { ...prev.additionalCosts, [field]: value },
      }));
    },
    []
  );

  const updateSalesMarketing = useCallback(
    (field: keyof SalesMarketingCosts, value: number) => {
      setInputs((prev) => ({
        ...prev,
        salesMarketing: { ...prev.salesMarketing, [field]: value },
      }));
    },
    []
  );

  const updatePrivateFunding = useCallback(
    (field: keyof PrivateFunding, value: number | boolean) => {
      setInputs((prev) => ({
        ...prev,
        privateFunding: { ...prev.privateFunding, [field]: value },
      }));
    },
    []
  );

  const updatePfIncludes = useCallback(
    (field: keyof PrivateFundingIncludes, value: boolean | number) => {
      setInputs((prev) => ({
        ...prev,
        privateFunding: {
          ...prev.privateFunding,
          includes: { ...prev.privateFunding.includes, [field]: value },
        },
      }));
    },
    []
  );

  const handleCalculate = useCallback(() => {
    const effectiveInputs = { ...inputs };
    if (renoMode === "detailed") {
      effectiveInputs.renovationCost = grandTotal(renoSections);
    }
    const r = calculate(effectiveInputs);
    setResults(r);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [inputs, renoMode, renoSections]);

  const handleReset = useCallback(() => {
    setInputs({ ...DEFAULT_INPUTS, additionalCosts: { ...DEFAULT_ADDITIONAL_COSTS }, salesMarketing: { ...DEFAULT_SALES_MARKETING }, privateFunding: { ...DEFAULT_PRIVATE_FUNDING } });
    setResults(null);
    setRenoMode("simple");
    setRenoSections(JSON.parse(JSON.stringify(DEFAULT_SECTIONS)));
  }, []);

  const getEffectiveResults = useCallback(() => {
    const effectiveInputs = { ...inputs };
    if (renoMode === "detailed") {
      effectiveInputs.renovationCost = grandTotal(renoSections);
    }
    return calculate(effectiveInputs);
  }, [inputs, renoMode, renoSections]);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleSaveProject = useCallback(async () => {
    if (!user || !isPro) return;
    setSaveStatus("saving");
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const r = results ?? getEffectiveResults();
    if (!results) setResults(r);

    const { data: savedProject } = await supabase.from("saved_projects").insert({
      user_id: user.id,
      name: inputs.propertyAddress || "Untitled Project",
      property_address: inputs.propertyAddress || null,
      inputs: inputs as unknown as Record<string, unknown>,
      results: r as unknown as Record<string, unknown>,
      reno_mode: renoMode,
      reno_sections: renoSections as unknown as Record<string, unknown>[],
      purchase_price: inputs.purchasePrice,
      sale_price: inputs.expectedSalePrice,
      profit: r.estimatedProfit,
      roi: r.roi,
      deal_rating: r.dealRating,
    }).select("id").single();

    // Auto-create a workspace board from renovation data
    if (savedProject && renoSections.length > 0) {
      await fetch("/api/boards/create-from-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: savedProject.id,
          projectName: inputs.propertyAddress || "Untitled Board",
          renoSections,
        }),
      });
    }

    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [user, isPro, inputs, results, renoMode, renoSections, getEffectiveResults]);

  const handleDownloadPDF = useCallback(async () => {
    const r = results ?? getEffectiveResults();
    if (!results) setResults(r);
    const doc = await generatePDF(inputs, r);
    const filename = inputs.propertyAddress
      ? `Flip-Report-${inputs.propertyAddress.split(",")[0].trim().replace(/\s+/g, "-")}.pdf`
      : "Flip-Report.pdf";
    doc.save(filename);
  }, [inputs, results, getEffectiveResults]);

  const handleEmailPDF = useCallback(async () => {
    if (!emailTo) return;
    const r = results ?? getEffectiveResults();
    if (!results) setResults(r);
    setEmailSending(true);
    setEmailError("");
    try {
      const doc = await generatePDF(inputs, r);
      const pdfBase64 = doc.output("datauristring");

      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo,
          propertyAddress: inputs.propertyAddress || "Property",
          pdfBase64,
        }),
      });

      if (res.ok) {
        setEmailSent(true);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSent(false);
          setEmailTo("");
        }, 2000);
      } else {
        setEmailError("Failed to send email. Please check SMTP configuration or download the PDF instead.");
      }
    } catch {
      setEmailError("Failed to send email. Please check SMTP configuration or download the PDF instead.");
    } finally {
      setEmailSending(false);
    }
  }, [inputs, results, emailTo, getEffectiveResults]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* ───── Input Cards ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {/* Property Details */}
          <div className="bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--card-shadow)" }}>
            <SectionHeader icon={<HomeIcon className="w-4.5 h-4.5" />}>Property Details</SectionHeader>
            <div className="space-y-4">
              <AddressInput
                value={inputs.propertyAddress}
                onChange={(v) => update("propertyAddress", v)}
              />
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
          </div>

          {/* Renovation */}
          <div className="bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--card-shadow)" }}>
            <SectionHeader icon={<Hammer className="w-4.5 h-4.5" />}>Renovation Costs</SectionHeader>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setRenoMode("simple")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border ${
                  renoMode === "simple"
                    ? "bg-accent/10 text-accent border-accent/30"
                    : "bg-surface-2/50 text-tx-muted border-edge hover:bg-surface-2"
                }`}
              >
                <FileText className="w-3 h-3" />
                Simple Budget
              </button>
              <button
                onClick={() => {
                  if (!isPro) return; // ProGate will show overlay
                  setRenoMode("detailed");
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border ${
                  renoMode === "detailed"
                    ? "bg-accent/10 text-accent border-accent/30"
                    : "bg-surface-2/50 text-tx-muted border-edge hover:bg-surface-2"
                } ${!isPro ? "opacity-60" : ""}`}
              >
                <List className="w-3 h-3" />
                Detailed Budget
                {!isPro && <Crown className="w-3 h-3 text-amber-500 ml-0.5" />}
              </button>
            </div>

            {renoMode === "simple" ? (
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
            ) : (
              <div className="space-y-4">
                <RenovationBudget sections={renoSections} onChange={setRenoSections} />
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
            )}
          </div>

          {/* Additional Costs */}
          <div className="bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--card-shadow)" }}>
            <SectionHeader icon={<ClipboardList className="w-4.5 h-4.5" />}>Additional Costs</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Building & Pest Fee" value={inputs.additionalCosts.buildingAndPest} onChange={(v) => updateAdditional("buildingAndPest", v)} prefix="$" step={100} min={0} />
              <InputField label="Settlement Fee" value={inputs.additionalCosts.settlementFee} onChange={(v) => updateAdditional("settlementFee", v)} prefix="$" step={100} min={0} />
              <InputField label="Project Management Fee" value={inputs.additionalCosts.projectManagementFee} onChange={(v) => updateAdditional("projectManagementFee", v)} prefix="$" step={100} min={0} />
              <InputField label="Site & Due Diligence Fee" value={inputs.additionalCosts.siteDueDiligenceFee} onChange={(v) => updateAdditional("siteDueDiligenceFee", v)} prefix="$" step={100} min={0} />
              <InputField label="Brokerage Fee" value={inputs.additionalCosts.brokerageFee} onChange={(v) => updateAdditional("brokerageFee", v)} prefix="$" step={100} min={0} />
              <InputField label="Council Rates" value={inputs.additionalCosts.councilRates} onChange={(v) => updateAdditional("councilRates", v)} prefix="$" step={100} min={0} tooltip="Total council rates for the holding period" />
              <InputField label="Water Rates" value={inputs.additionalCosts.waterRates} onChange={(v) => updateAdditional("waterRates", v)} prefix="$" step={100} min={0} tooltip="Total water rates for the holding period" />
              <InputField label="Power" value={inputs.additionalCosts.power} onChange={(v) => updateAdditional("power", v)} prefix="$" step={100} min={0} tooltip="Total power costs for the holding period" />
              <InputField label="Insurance" value={inputs.additionalCosts.insurance} onChange={(v) => updateAdditional("insurance", v)} prefix="$" step={100} min={0} tooltip="Total insurance for the holding period" />
            </div>
          </div>

          {/* Financing */}
          <div className="bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--card-shadow)" }}>
            <SectionHeader icon={<Landmark className="w-4.5 h-4.5" />}>Financing</SectionHeader>

            {/* Deposit Buttons */}
            <div className="mb-4">
              <label className="text-sm font-medium text-tx-secondary flex items-center gap-1.5 mb-2">
                <Wallet className="w-3.5 h-3.5 text-tx-muted" />
                Deposit
              </label>
              <div className="flex gap-2">
                {DEPOSIT_OPTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => update("depositPercent", p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer border transition-all ${
                      inputs.depositPercent === p
                        ? "bg-accent/15 text-accent border-accent/40 shadow-sm"
                        : "bg-surface-2/50 text-tx-muted border-edge hover:bg-surface-2 hover:text-tx-secondary"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              {/* Deposit / Loan summary */}
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                <span className="text-tx-muted">
                  Deposit: <strong className="text-tx-secondary font-mono">{fmt(depositAmount)}</strong>
                </span>
                <span className="text-tx-muted">
                  Loan: <strong className="text-tx-secondary font-mono">{fmt(loanAmount)}</strong>
                </span>
                <span className="text-tx-muted">
                  LVR: <strong className="text-tx-secondary font-mono">{derivedLvr}%</strong>
                </span>
                {derivedLvr > 80 && (
                  <span className="text-amber-500 flex items-center gap-0.5">
                    <Shield className="w-3 h-3 shrink-0" />
                    LMI applies
                  </span>
                )}
              </div>
            </div>

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

            {/* Private Funding */}
            <div className="mt-5 pt-4 border-t border-edge">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-tx-secondary flex items-center gap-1.5">
                  <HandCoins className="w-3.5 h-3.5 text-tx-muted" />
                  Private Funding
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updatePrivateFunding("enabled", false)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                      !inputs.privateFunding.enabled
                        ? "bg-accent/15 text-accent border-accent/40"
                        : "bg-surface-2/50 text-tx-muted border-edge hover:bg-surface-2"
                    }`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => updatePrivateFunding("enabled", true)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                      inputs.privateFunding.enabled
                        ? "bg-accent/15 text-accent border-accent/40"
                        : "bg-surface-2/50 text-tx-muted border-edge hover:bg-surface-2"
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {inputs.privateFunding.enabled && (
                <div className="animate-fade-in space-y-4">
                  {/* Checkbox items to include */}
                  <div>
                    <p className="text-xs font-medium text-tx-muted uppercase tracking-wider mb-2">Include in Private Funding</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {([
                        ["deposit", "Deposit", fmt(depositAmount)],
                        ["stampDuty", "Stamp Duty", fmt(stampDutyEstimate)],
                        ["renovation", "Renovation", fmt(effectiveRenoCost)],
                        ["additionalCosts", "Additional Costs", fmt(additionalCostsTotal)],
                        ["interestCosts", "Interest Costs on Loan", fmt(interestCostEstimate)],
                      ] as [keyof Omit<PrivateFundingIncludes, "otherAmount">, string, string][]).map(([key, label, hint]) => (
                        <label
                          key={key}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                            inputs.privateFunding.includes[key]
                              ? "bg-accent/10 border-accent/30 text-tx"
                              : "bg-surface-2/30 border-edge text-tx-secondary hover:bg-surface-2/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={inputs.privateFunding.includes[key] as boolean}
                            onChange={(e) => updatePfIncludes(key, e.target.checked)}
                            className="w-4 h-4 rounded border-input-border accent-accent cursor-pointer"
                          />
                          <span className="text-sm font-medium flex-1">{label}</span>
                          {hint && <span className="text-[11px] text-tx-muted font-mono">{hint}</span>}
                        </label>
                      ))}
                    </div>
                    {/* Other Amount */}
                    <div className="mt-2">
                      <InputField
                        label="Other Amount"
                        value={inputs.privateFunding.includes.otherAmount}
                        onChange={(v) => updatePfIncludes("otherAmount", v)}
                        prefix="$"
                        step={1000}
                        min={0}
                        tooltip="Any other amount to include in private funding"
                      />
                    </div>
                  </div>

                  {/* Interest rate & term */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Private Loan Interest Rate"
                      value={inputs.privateFunding.interestRate}
                      onChange={(v) => updatePrivateFunding("interestRate", v)}
                      suffix="% p.a."
                      step={0.5}
                      min={0}
                      max={30}
                    />
                    <InputField
                      label="Private Loan Term"
                      value={inputs.privateFunding.timeFrameMonths}
                      onChange={(v) => updatePrivateFunding("timeFrameMonths", v)}
                      suffix="months"
                      step={1}
                      min={1}
                      max={60}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sales & Marketing */}
          <div className="lg:col-span-2 bg-surface-1 border border-edge rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--card-shadow)" }}>
            <SectionHeader icon={<Megaphone className="w-4.5 h-4.5" />}>Sales & Marketing</SectionHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <InputField
                label="Settlement Costs"
                value={inputs.salesMarketing.settlementCosts}
                onChange={(v) => updateSalesMarketing("settlementCosts", v)}
                prefix="$"
                step={100}
                min={0}
              />
              <InputField
                label="Staging Costs"
                value={inputs.salesMarketing.stagingCosts}
                onChange={(v) => updateSalesMarketing("stagingCosts", v)}
                prefix="$"
                step={100}
                min={0}
              />
              <InputField
                label="Photos & Listing"
                value={inputs.salesMarketing.photosAndListing}
                onChange={(v) => updateSalesMarketing("photosAndListing", v)}
                prefix="$"
                step={100}
                min={0}
              />
              <InputField
                label="Agent Commission"
                value={inputs.salesMarketing.agentCommissionPercent}
                onChange={(v) => updateSalesMarketing("agentCommissionPercent", v)}
                suffix="%"
                step={0.1}
                min={0}
                max={10}
                tooltip="Real estate agent commission on sale price"
              />
              <InputField
                label="Other Costs"
                value={inputs.salesMarketing.otherCosts}
                onChange={(v) => updateSalesMarketing("otherCosts", v)}
                prefix="$"
                step={100}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* ───── Action Buttons ───── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          {user ? (
            <button
              onClick={handleCalculate}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] cursor-pointer text-sm"
            >
              <Calculator className="w-4 h-4" />
              Calculate Flip Profit
            </button>
          ) : (
            <a
              href="/signup"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] cursor-pointer text-sm"
            >
              <Lock className="w-4 h-4" />
              Sign Up Free to Calculate
            </a>
          )}
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-2 hover:bg-surface-3 text-tx-secondary font-medium rounded-xl border border-edge cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          {isPro ? (
            <>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-2 hover:bg-surface-3 text-tx-secondary font-medium rounded-xl border border-edge cursor-pointer text-sm"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-2 hover:bg-surface-3 text-tx-secondary font-medium rounded-xl border border-edge cursor-pointer text-sm"
              >
                <Mail className="w-4 h-4" />
                Email Report
              </button>
              <button
                onClick={handleSaveProject}
                disabled={saveStatus === "saving"}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-2 hover:bg-surface-3 text-tx-secondary font-medium rounded-xl border border-edge cursor-pointer text-sm disabled:opacity-50"
              >
                {saveStatus === "saving" ? (
                  <div className="w-4 h-4 border-2 border-tx-muted/30 border-t-tx-muted rounded-full animate-spin" />
                ) : saveStatus === "saved" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveStatus === "saved" ? "Saved!" : "Save Project"}
              </button>
            </>
          ) : (
            <>
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-2/50 text-tx-muted font-medium rounded-xl border border-edge text-sm opacity-60 cursor-not-allowed"
                title="Pro feature"
              >
                <Lock className="w-4 h-4" />
                Download PDF
                <Crown className="w-3 h-3 text-amber-500" />
              </button>
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-2/50 text-tx-muted font-medium rounded-xl border border-edge text-sm opacity-60 cursor-not-allowed"
                title="Pro feature"
              >
                <Lock className="w-4 h-4" />
                Email Report
                <Crown className="w-3 h-3 text-amber-500" />
              </button>
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-2/50 text-tx-muted font-medium rounded-xl border border-edge text-sm opacity-60 cursor-not-allowed"
                title="Pro feature"
              >
                <Lock className="w-4 h-4" />
                Save Project
                <Crown className="w-3 h-3 text-amber-500" />
              </button>
            </>
          )}
        </div>

        {/* ───── Email Modal ───── */}
        {showEmailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface-1 border border-edge rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-tx mb-1">Email Report</h3>
              <p className="text-sm text-tx-muted mb-4">
                Send the feasibility report as a PDF attachment.
              </p>
              {emailSent ? (
                <div className="text-center py-4">
                  <p className="text-green-500 font-semibold">Report sent successfully!</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-tx-secondary mb-1.5 block">Email Address</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full bg-input-bg border border-input-border rounded-lg py-2.5 px-3 text-sm text-tx placeholder:text-tx-muted focus:outline-none focus:ring-2 focus:ring-input-focus/40"
                    />
                  </div>
                  <div className="bg-surface-2/50 rounded-lg p-3 mb-4 text-xs text-tx-muted">
                    <p className="font-semibold text-tx-secondary mb-1">Email Preview:</p>
                    <p><strong>Subject:</strong> New Property Deal - {inputs.propertyAddress || "Property"}</p>
                    <p className="mt-1">We have just completed a preliminary feasibility on {inputs.propertyAddress || "this property"}, please see the report for more details.</p>
                  </div>
                  {emailError && (
                    <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500">
                      {emailError}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowEmailModal(false); setEmailTo(""); setEmailError(""); }}
                      className="flex-1 py-2.5 rounded-lg border border-edge text-tx-secondary font-medium text-sm cursor-pointer hover:bg-surface-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEmailPDF}
                      disabled={!emailTo || emailSending}
                      className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailSending ? "Sending..." : "Send Report"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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
              {/* Buying + Additional */}
              <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
                <SectionHeader icon={<Receipt className="w-4.5 h-4.5" />}>Buying Costs</SectionHeader>
                <div className="space-y-2.5">
                  <CostLine label="Purchase Price" value={fmt(inputs.purchasePrice)} />
                  <CostLine label={`Stamp Duty (${inputs.state})`} value={fmt(results.stampDuty)} />
                  <CostLine label="Registration of Transfer" value={fmt(results.transferRegistration)} />
                  <CostLine label="Registration of Mortgage" value={fmt(results.mortgageRegistration)} />
                  {results.lmi > 0 && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-sm text-amber-500 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        LMI (LVR {derivedLvr}%)
                      </span>
                      <span className="text-sm font-mono text-amber-500">
                        {fmt(results.lmi)}
                      </span>
                    </div>
                  )}
                  <CostLine label="Legal / Conveyancing" value={fmt(results.legalCostsBuy)} />

                  {/* Additional Costs breakdown */}
                  {results.totalAdditionalCosts > 0 && (
                    <>
                      <div className="border-t border-edge my-2.5" />
                      <div className="flex items-center gap-1.5 mb-1">
                        <ClipboardList className="w-3 h-3 text-tx-muted" />
                        <span className="text-[11px] font-medium text-tx-muted uppercase tracking-wider">
                          Additional Costs
                        </span>
                      </div>
                      {results.additionalCosts.buildingAndPest > 0 && <CostLine label="Building & Pest" value={fmt(results.additionalCosts.buildingAndPest)} />}
                      {results.additionalCosts.settlementFee > 0 && <CostLine label="Settlement Fee" value={fmt(results.additionalCosts.settlementFee)} />}
                      {results.additionalCosts.projectManagementFee > 0 && <CostLine label="Project Management" value={fmt(results.additionalCosts.projectManagementFee)} />}
                      {results.additionalCosts.siteDueDiligenceFee > 0 && <CostLine label="Site & Due Diligence" value={fmt(results.additionalCosts.siteDueDiligenceFee)} />}
                      {results.additionalCosts.brokerageFee > 0 && <CostLine label="Brokerage Fee" value={fmt(results.additionalCosts.brokerageFee)} />}
                    </>
                  )}

                  <div className="border-t border-edge pt-2.5 mt-2.5">
                    <CostLine
                      label="Total Buying"
                      value={fmt(inputs.purchasePrice + results.stampDuty + results.transferRegistration + results.mortgageRegistration + results.lmi + results.legalCostsBuy + results.totalAdditionalCosts - results.holdingCostsCouncilRates - results.holdingCostsWaterRates - results.holdingCostsPower - results.holdingCostsInsurance)}
                      bold
                    />
                  </div>
                </div>
              </div>

              {/* Renovation + Holding */}
              <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
                <SectionHeader icon={<Wrench className="w-4.5 h-4.5" />}>Renovation & Holding</SectionHeader>
                <div className="space-y-2.5">
                  <CostLine label="Renovation Budget" value={fmt(results.totalRenovationCost - results.contingencyAmount)} />
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
                  {results.holdingCostsInsurance > 0 && <CostLine label="Insurance" value={fmt(results.holdingCostsInsurance)} />}
                  {results.holdingCostsCouncilRates > 0 && <CostLine label="Council Rates" value={fmt(results.holdingCostsCouncilRates)} />}
                  {results.holdingCostsWaterRates > 0 && <CostLine label="Water Rates" value={fmt(results.holdingCostsWaterRates)} />}
                  {results.holdingCostsPower > 0 && <CostLine label="Power" value={fmt(results.holdingCostsPower)} />}
                  <div className="border-t border-edge pt-2.5 mt-2.5">
                    <CostLine label="Total Holding" value={fmt(results.totalHoldingCosts)} bold />
                  </div>

                  {/* Private Funding */}
                  {inputs.privateFunding.enabled && results.privateFundingInterest > 0 && (
                    <>
                      <div className="border-t border-edge my-2.5" />
                      <div className="flex items-center gap-1.5 mb-1">
                        <HandCoins className="w-3 h-3 text-tx-muted" />
                        <span className="text-[11px] font-medium text-tx-muted uppercase tracking-wider">
                          Private Funding
                        </span>
                      </div>
                      <CostLine label="Private Funding Amount" value={fmt(results.privateFundingAmount)} />
                      <CostLine label={`Interest @ ${pct(inputs.privateFunding.interestRate)} for ${inputs.privateFunding.timeFrameMonths}mo`} value={fmt(results.privateFundingInterest)} />
                      <CostLine label="Private Money Interest" value={fmt(results.privateFundingInterest)} bold />
                    </>
                  )}
                </div>
              </div>

              {/* Sales & Marketing + Summary */}
              <div className="bg-surface-1 border border-edge rounded-2xl p-5" style={{ boxShadow: "var(--card-shadow)" }}>
                <SectionHeader icon={<Megaphone className="w-4.5 h-4.5" />}>Sales & Marketing</SectionHeader>
                <div className="space-y-2.5">
                  <CostLine label={`Agent Commission (${inputs.salesMarketing.agentCommissionPercent}%)`} value={fmt(results.agentCommission)} />
                  {results.settlementCosts > 0 && <CostLine label="Settlement Costs" value={fmt(results.settlementCosts)} />}
                  {results.stagingCosts > 0 && <CostLine label="Staging" value={fmt(results.stagingCosts)} />}
                  {results.photosAndListing > 0 && <CostLine label="Photos & Listing" value={fmt(results.photosAndListing)} />}
                  {results.otherSellingCosts > 0 && <CostLine label="Other Costs" value={fmt(results.otherSellingCosts)} />}
                  <div className="border-t border-edge pt-2.5 mt-2.5">
                    <CostLine label="Total Sales & Marketing" value={fmt(results.totalSellingCosts)} bold />
                  </div>
                  <div className="border-t border-edge my-2.5" />
                  <CostLine label={`Deposit (${inputs.depositPercent}%)`} value={fmt(results.deposit)} />
                  <CostLine label="Base Loan" value={fmt(results.loanAmount)} />
                  {results.lmi > 0 && (
                    <CostLine label="+ LMI (capitalised)" value={fmt(results.lmi)} />
                  )}
                  <CostLine label="Effective Loan" value={fmt(results.effectiveLoan)} />
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
              or exemptions. LMI estimates are based on indicative insurer rates and vary by lender.
              Always consult a qualified accountant, conveyancer, or financial advisor
              before making investment decisions. This tool does not constitute financial advice.
            </div>
          </div>
        )}
      </div>

      {/* ───── Footer ───── */}
      <footer className="border-t border-edge py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-tx-muted">
            Aussie Flip Calc v2.0 — Built for Australian property investors.
          </p>
          <p className="text-[11px] text-tx-muted mt-1">
            Not financial advice. Consult professionals before investing. Stamp duty sources verified Jan 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
