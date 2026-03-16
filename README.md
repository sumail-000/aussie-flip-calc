# Aussie Flip Calc — Australian Property Renovation Calculator

A free, no-login web calculator for Australian property investors to evaluate renovation flip deals. Calculates stamp duty (all 8 states/territories), holding costs, selling costs, profit, ROI, deal rating, recommended max offer price, and risk analysis.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Fonts:** Geist (via next/font)
- **No backend / no database / no auth required**

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles + Tailwind
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Main calculator UI (client component)
└── lib/
    └── calculator.ts     # All calculation logic (stamp duty, costs, profit, ROI, risk)
```

## Features

- **Inputs:** Purchase price, state/territory, renovation cost, contingency %, expected sale price, loan LVR, interest rate, holding period, agent commission, marketing cost
- **Outputs:** Stamp duty, holding costs, selling costs, total project cost, estimated profit, profit margin, ROI (annualised), deal rating, recommended max offer price
- **Risk Analysis:** Sensitivity table showing profit at ±5%, ±10%, ±15%, ±20% sale price variations
- **Responsive:** Works on desktop, tablet, and mobile
- **Dark theme:** Clean, modern UI

## Hosting on Vercel (Recommended)

1. Push this repo to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **"Add New Project"** → Import your repo
4. Vercel auto-detects Next.js — click **Deploy**
5. Your site is live at `your-project.vercel.app`

Auto-deploys on every push to `main`.

## Hosting on Netlify

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your repo
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Framework preset:** Next.js
6. Click **Deploy site**

Or use the Netlify CLI:

```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

## Updating the Calculator

- **Change stamp duty rates:** Edit `src/lib/calculator.ts` → `STAMP_DUTY_BRACKETS` object
- **Change holding cost estimates:** Edit the monthly estimates in the `calculate()` function (insurance $150/mo, council rates $200/mo, utilities $100/mo)
- **Change deal rating thresholds:** Edit the `dealRating` section in `calculate()`
- **Change max offer target margin:** Edit `targetProfitMargin` in `calculate()` (default: 15%)
- **UI changes:** Edit `src/app/page.tsx`

## Disclaimer

This calculator provides estimates only. Stamp duty brackets are based on 2025/2026 general investor rates. Always consult a qualified accountant or financial advisor before making investment decisions.
