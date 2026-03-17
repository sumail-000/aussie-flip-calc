// ============================================================================
// Australian Stamp Duty — General/Investor Rates (2025-26 Financial Year)
// NOT first home buyer concession rates. NOT foreign buyer rates.
//
// Sources (verified Jan 2026):
//   NSW: revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty
//   VIC: sro.vic.gov.au/rates-taxes-duties-and-levies/general-land-transfer-duty-property-current-rates
//   QLD: qro.qld.gov.au/duties/transfer-duty/calculate/rates/
//   SA:  revenuesa.sa.gov.au/stamp-duty/rate-of-stamp-duty
//   WA:  wa.gov.au/organisation/department-of-finance/transfer-duty-assessment
//   TAS: sro.tas.gov.au/property-transfer-duties/rates-of-duty (21 Oct 2013+)
//   ACT: revenue.act.gov.au/duties/conveyance-duty (2025-26 rates)
//   NT:  treasury.nt.gov.au/dtf/territory-revenue-office/stamp-duty
//
// IMPORTANT: Rates are indexed/updated periodically by each state government.
// Always verify with your conveyancer before relying on these figures.
// ============================================================================

export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'ACT' | 'NT';

export interface StateInfo {
  code: AustralianState;
  name: string;
  source: string;
  foreignSurcharge: number;
  effectiveDate: string;
}

export const STATE_DATA: StateInfo[] = [
  { code: 'NSW', name: 'New South Wales',              source: 'revenue.nsw.gov.au',      foreignSurcharge: 8,   effectiveDate: '1 Jul 2025' },
  { code: 'VIC', name: 'Victoria',                     source: 'sro.vic.gov.au',           foreignSurcharge: 8,   effectiveDate: '1 Jul 2025' },
  { code: 'QLD', name: 'Queensland',                   source: 'qro.qld.gov.au',           foreignSurcharge: 8,   effectiveDate: '1 Jul 2025' },
  { code: 'SA',  name: 'South Australia',              source: 'revenuesa.sa.gov.au',       foreignSurcharge: 7,   effectiveDate: '1 Jul 2025' },
  { code: 'WA',  name: 'Western Australia',            source: 'wa.gov.au',                 foreignSurcharge: 7,   effectiveDate: '1 Jul 2025' },
  { code: 'TAS', name: 'Tasmania',                     source: 'sro.tas.gov.au',            foreignSurcharge: 8,   effectiveDate: '21 Oct 2013' },
  { code: 'ACT', name: 'Australian Capital Territory', source: 'revenue.act.gov.au',        foreignSurcharge: 0,   effectiveDate: '1 Jul 2025' },
  { code: 'NT',  name: 'Northern Territory',           source: 'treasury.nt.gov.au',        foreignSurcharge: 0,   effectiveDate: '1 Jul 2025' },
];

interface StampDutyBracket {
  min: number;
  max: number;
  base: number;
  rate: number; // marginal rate per $100 above min
}

// Marginal bracket tables — VIC and ACT have flat-rate overrides handled in calculateStampDuty()
const STAMP_DUTY_BRACKETS: Record<AustralianState, StampDutyBracket[]> = {
  // NSW: revenue.nsw.gov.au — standard transfer duty (from 1 Jul 2025, CPI-indexed annually)
  NSW: [
    { min: 0,       max: 17000,    base: 0,       rate: 1.25 },
    { min: 17001,   max: 36000,    base: 213,     rate: 1.50 },
    { min: 36001,   max: 97000,    base: 498,     rate: 1.75 },
    { min: 97001,   max: 364000,   base: 1566,    rate: 3.50 },
    { min: 364001,  max: 1212000,  base: 10914,   rate: 4.50 },
    { min: 1212001, max: 3636000,  base: 49074,   rate: 5.50 },
    { min: 3636001, max: Infinity, base: 182394,  rate: 7.00 },
  ],

  // VIC: sro.vic.gov.au — general (non-PPR) rates
  // NOTE: Above $960,000 the rate is 5.5% of the FULL dutiable value (not marginal).
  // The marginal brackets below only apply up to $960,000.
  VIC: [
    { min: 0,       max: 25000,    base: 0,     rate: 1.40 },
    { min: 25001,   max: 130000,   base: 350,   rate: 2.40 },
    { min: 130001,  max: 960000,   base: 2870,  rate: 6.00 },
  ],

  // QLD: qro.qld.gov.au — general transfer duty (verified via QRO example: $850k → $31,275)
  QLD: [
    { min: 0,       max: 5000,     base: 0,      rate: 0    },
    { min: 5001,    max: 75000,    base: 0,      rate: 1.50 },
    { min: 75001,   max: 540000,   base: 1050,   rate: 3.50 },
    { min: 540001,  max: 1000000,  base: 17325,  rate: 4.50 },
    { min: 1000001, max: Infinity, base: 38025,  rate: 5.75 },
  ],

  // SA: revenuesa.sa.gov.au — conveyance duty rates
  SA: [
    { min: 0,       max: 12000,    base: 0,      rate: 1.00 },
    { min: 12001,   max: 30000,    base: 120,    rate: 2.00 },
    { min: 30001,   max: 50000,    base: 480,    rate: 3.00 },
    { min: 50001,   max: 100000,   base: 1080,   rate: 3.50 },
    { min: 100001,  max: 200000,   base: 2830,   rate: 4.00 },
    { min: 200001,  max: 250000,   base: 6830,   rate: 4.25 },
    { min: 250001,  max: 300000,   base: 8955,   rate: 4.75 },
    { min: 300001,  max: 500000,   base: 11330,  rate: 5.00 },
    { min: 500001,  max: Infinity, base: 21330,  rate: 5.50 },
  ],

  // WA: wa.gov.au — transfer duty rates
  WA: [
    { min: 0,       max: 120000,   base: 0,      rate: 1.90 },
    { min: 120001,  max: 150000,   base: 2280,   rate: 2.85 },
    { min: 150001,  max: 360000,   base: 3135,   rate: 3.80 },
    { min: 360001,  max: 725000,   base: 11115,  rate: 5.15 },
    { min: 725001,  max: Infinity, base: 29910,  rate: 5.15 },
  ],

  // TAS: sro.tas.gov.au — property transfer duty (from 21 Oct 2013)
  TAS: [
    { min: 0,       max: 3000,     base: 50,     rate: 0    },
    { min: 3001,    max: 25000,    base: 50,     rate: 1.75 },
    { min: 25001,   max: 75000,    base: 435,    rate: 2.25 },
    { min: 75001,   max: 200000,   base: 1560,   rate: 3.50 },
    { min: 200001,  max: 375000,   base: 5935,   rate: 4.00 },
    { min: 375001,  max: 725000,   base: 12935,  rate: 4.25 },
    { min: 725001,  max: Infinity, base: 27810,  rate: 4.50 },
  ],

  // ACT: revenue.act.gov.au — conveyance duty (2025-26)
  // NOTE: Above $1,455,000 the rate is 4.54% of the FULL dutiable value (not marginal).
  // The marginal brackets below only apply up to $1,455,000.
  ACT: [
    { min: 0,       max: 260000,   base: 0,      rate: 1.20 },
    { min: 260001,  max: 300000,   base: 3120,   rate: 2.20 },
    { min: 300001,  max: 500000,   base: 4000,   rate: 3.40 },
    { min: 500001,  max: 750000,   base: 10800,  rate: 4.32 },
    { min: 750001,  max: 1000000,  base: 21600,  rate: 5.90 },
    { min: 1000001, max: 1455000,  base: 36350,  rate: 6.40 },
  ],

  // NT: treasury.nt.gov.au — handled entirely via formula in calculateStampDuty()
  NT: [],
};

export function calculateStampDuty(price: number, state: AustralianState): number {
  if (price <= 0) return 0;

  // --- NT: Unique two-part formula ---
  // Under $525k: D = 0.06571441 × V² + 15V   (V = price / 1000)
  // Over  $525k: D = price × 5.45%
  // Source: treasury.nt.gov.au — verified with worked example ($500k → $23,928.60)
  if (state === 'NT') {
    if (price <= 525000) {
      const V = price / 1000;
      return Math.round((0.06571441 * V * V + 15 * V) * 100) / 100;
    }
    return Math.round(price * 0.0545 * 100) / 100;
  }

  // --- VIC: Flat 5.5% on full value above $960,000 ---
  // Source: sro.vic.gov.au — "Over $960,000: 5.5% of the dutiable value"
  if (state === 'VIC' && price > 960000) {
    return Math.round(price * 0.055 * 100) / 100;
  }

  // --- ACT: Flat 4.54% on full value above $1,455,000 ---
  // Source: revenue.act.gov.au — "$1,455,001+ applies 4.54% to FULL dutiable value"
  if (state === 'ACT' && price > 1455000) {
    return Math.round(price * 0.0454 * 100) / 100;
  }

  // --- All other states: Standard marginal bracket calculation ---
  const brackets = STAMP_DUTY_BRACKETS[state];
  for (const bracket of brackets) {
    if (price >= bracket.min && price <= bracket.max) {
      const excess = price - bracket.min;
      const duty = bracket.base + (excess / 100) * bracket.rate;
      return Math.round(duty * 100) / 100;
    }
  }
  return 0;
}

// ============================================================================
// LMI (Lenders Mortgage Insurance) — Simplified V1 Estimates
// LMI applies when LVR > 80%. Premium is a % of the base LOAN amount.
// LMI is capitalised (added to the loan), so interest accrues on it.
//
//   LVR 80%  → $0
//   LVR 85%  → 1.0% of loan
//   LVR 90%  → 2.0% of loan
//   LVR 95%  → 3.5% of loan
// ============================================================================

export function calculateLMI(loanAmount: number, lvr: number): number {
  if (lvr <= 80 || loanAmount <= 0) return 0;
  let rate = 0;
  if (lvr <= 85) rate = 0.01;
  else if (lvr <= 90) rate = 0.02;
  else rate = 0.035;
  return Math.round(loanAmount * rate);
}

export interface CalculatorInputs {
  purchasePrice: number;
  state: AustralianState;
  renovationCost: number;
  contingencyPercent: number;
  expectedSalePrice: number;
  depositPercent: number;  // 5, 10, 15, or 20 — deposit as % of purchase price
  interestRate: number;   // annual percentage, e.g. 6.5
  holdingPeriodMonths: number;
  agentCommissionPercent: number;
  marketingCost: number;
}

export interface CalculatorResults {
  // Costs
  stampDuty: number;
  lmi: number;
  legalCostsBuy: number;
  contingencyAmount: number;
  totalRenovationCost: number;
  deposit: number;
  loanAmount: number;       // base loan = purchasePrice - deposit
  effectiveLoan: number;    // loanAmount + LMI (interest accrues on this)
  monthlyInterest: number;
  totalInterestCost: number;
  holdingCostsInsurance: number;
  holdingCostsCouncilRates: number;
  holdingCostsUtilities: number;
  totalHoldingCosts: number;
  agentCommission: number;
  marketingCost: number;
  legalCostsSell: number;
  totalSellingCosts: number;
  totalProjectCost: number;

  // Returns
  estimatedProfit: number;
  profitMargin: number;
  roi: number;
  annualisedROI: number;
  cashInvested: number;

  // Advisory
  dealRating: string;
  dealRatingColor: string;
  maxOfferPrice: number;

  // Risk analysis
  riskAnalysis: RiskRow[];
}

export interface RiskRow {
  scenario: string;
  salePrice: number;
  profit: number;
  roi: number;
  outcome: string;
  color: string;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    purchasePrice,
    state,
    renovationCost,
    contingencyPercent,
    expectedSalePrice,
    depositPercent,
    interestRate,
    holdingPeriodMonths,
    agentCommissionPercent,
    marketingCost,
  } = inputs;

  // --- DEPOSIT & LOAN ---
  const deposit = Math.round(purchasePrice * (depositPercent / 100));
  const loanAmount = purchasePrice - deposit;              // base loan
  const lvr = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;

  // --- BUYING COSTS ---
  const stampDuty = calculateStampDuty(purchasePrice, state);
  const lmi = calculateLMI(loanAmount, lvr);               // LMI on base loan
  const effectiveLoan = loanAmount + lmi;                   // LMI capitalised
  const legalCostsBuy = 1500; // Estimated conveyancing/legal

  // --- RENOVATION COSTS ---
  const contingencyAmount = renovationCost * (contingencyPercent / 100);
  const totalRenovationCost = renovationCost + contingencyAmount;

  // --- HOLDING COSTS ---
  // Interest accrues on the effective loan (base loan + capitalised LMI)
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthlyInterest = effectiveLoan * monthlyInterestRate;
  const totalInterestCost = monthlyInterest * holdingPeriodMonths;

  // Estimated ongoing costs per month
  const holdingCostsInsurance = 150 * holdingPeriodMonths;
  const holdingCostsCouncilRates = 200 * holdingPeriodMonths;
  const holdingCostsUtilities = 100 * holdingPeriodMonths;

  const totalHoldingCosts =
    totalInterestCost +
    holdingCostsInsurance +
    holdingCostsCouncilRates +
    holdingCostsUtilities;

  // --- SELLING COSTS ---
  const agentCommission = expectedSalePrice * (agentCommissionPercent / 100);
  const legalCostsSell = 1200; // Estimated conveyancing/legal sell side
  const totalSellingCosts = agentCommission + marketingCost + legalCostsSell;

  // --- TOTALS ---
  const totalProjectCost =
    purchasePrice +
    stampDuty +
    lmi +
    legalCostsBuy +
    totalRenovationCost +
    totalHoldingCosts +
    totalSellingCosts;

  const cashInvested = totalProjectCost - effectiveLoan;

  // --- RETURNS ---
  const estimatedProfit = expectedSalePrice - totalProjectCost;
  const profitMargin = expectedSalePrice > 0 ? (estimatedProfit / expectedSalePrice) * 100 : 0;
  const roi = cashInvested > 0 ? (estimatedProfit / cashInvested) * 100 : 0;
  const annualisedROI = holdingPeriodMonths > 0 ? roi * (12 / holdingPeriodMonths) : 0;

  // --- DEAL RATING ---
  let dealRating: string;
  let dealRatingColor: string;
  if (profitMargin >= 20) {
    dealRating = 'Excellent Deal';
    dealRatingColor = 'text-green-400';
  } else if (profitMargin >= 15) {
    dealRating = 'Great Deal';
    dealRatingColor = 'text-green-300';
  } else if (profitMargin >= 10) {
    dealRating = 'Good Deal';
    dealRatingColor = 'text-blue-400';
  } else if (profitMargin >= 5) {
    dealRating = 'Marginal Deal';
    dealRatingColor = 'text-yellow-400';
  } else if (profitMargin >= 0) {
    dealRating = 'Risky Deal';
    dealRatingColor = 'text-orange-400';
  } else {
    dealRating = 'Loss-Making Deal';
    dealRatingColor = 'text-red-500';
  }

  // --- MAX OFFER PRICE ---
  // Target: 15% profit margin
  // maxOffer = expectedSalePrice * 0.85 - allCostsExceptPurchase
  const targetProfitMargin = 0.15;
  const costsExPurchase =
    totalRenovationCost +
    totalHoldingCosts +
    totalSellingCosts +
    legalCostsBuy +
    lmi;

  // We need to account for stamp duty which depends on purchase price
  // Approximate: maxOffer + stampDuty(maxOffer) + costsExPurchase = expectedSalePrice * (1 - targetProfitMargin)
  // Iterative approach for accuracy
  let maxOffer = expectedSalePrice * (1 - targetProfitMargin) - costsExPurchase;
  for (let i = 0; i < 10; i++) {
    const sd = calculateStampDuty(Math.max(0, maxOffer), state);
    maxOffer = expectedSalePrice * (1 - targetProfitMargin) - costsExPurchase - sd;
  }
  maxOffer = Math.max(0, Math.round(maxOffer));

  // --- RISK ANALYSIS ---
  const riskScenarios = [
    { scenario: 'Best Case (+10%)', priceMult: 1.10 },
    { scenario: 'Expected', priceMult: 1.00 },
    { scenario: 'Mild Drop (-5%)', priceMult: 0.95 },
    { scenario: 'Moderate Drop (-10%)', priceMult: 0.90 },
    { scenario: 'Worst Case (-15%)', priceMult: 0.85 },
    { scenario: 'Severe Drop (-20%)', priceMult: 0.80 },
  ];

  const riskAnalysis: RiskRow[] = riskScenarios.map((s) => {
    const sp = Math.round(expectedSalePrice * s.priceMult);
    const agComm = sp * (agentCommissionPercent / 100);
    const sellCosts = agComm + marketingCost + legalCostsSell;
    const totalCost =
      purchasePrice + stampDuty + lmi + legalCostsBuy + totalRenovationCost + totalHoldingCosts + sellCosts;
    const profit = sp - totalCost;
    const cash = totalCost - effectiveLoan;
    const r = cash > 0 ? (profit / cash) * 100 : 0;
    let outcome: string;
    let color: string;
    if (profit > 50000) { outcome = 'Strong Profit'; color = 'text-green-400'; }
    else if (profit > 20000) { outcome = 'Profitable'; color = 'text-green-300'; }
    else if (profit > 0) { outcome = 'Marginal'; color = 'text-yellow-400'; }
    else if (profit > -20000) { outcome = 'Minor Loss'; color = 'text-orange-400'; }
    else { outcome = 'Significant Loss'; color = 'text-red-500'; }

    return { scenario: s.scenario, salePrice: sp, profit, roi: r, outcome, color };
  });

  return {
    stampDuty,
    lmi,
    legalCostsBuy,
    contingencyAmount,
    totalRenovationCost,
    deposit,
    loanAmount,
    effectiveLoan,
    monthlyInterest,
    totalInterestCost,
    holdingCostsInsurance,
    holdingCostsCouncilRates,
    holdingCostsUtilities,
    totalHoldingCosts,
    agentCommission,
    marketingCost,
    legalCostsSell,
    totalSellingCosts,
    totalProjectCost,
    estimatedProfit,
    profitMargin,
    roi,
    annualisedROI,
    cashInvested,
    dealRating,
    dealRatingColor,
    maxOfferPrice: maxOffer,
    riskAnalysis,
  };
}
