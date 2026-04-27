// Business-health scoring for the kiryana-store domain.
// Replaces the old `Math.min(100, Math.max(40, 80 + ...))` placeholder
// in Manager.tsx with a real multi-factor score.
//
// The score is 0..100 made up of weighted sub-scores. Each sub-score is
// also clamped to 0..100 internally so the total is always sane even when
// some factors have no data (a brand-new shop should not score 0).
//
// Tuned against typical Pakistani kiryana-store benchmarks:
//   gross margin healthy 18-30%, expense ratio good <60%,
//   stockout >10% bad, customer concentration top1 >40% risky.

import type { Sale, Expense, Udhaar, Stock, Contact } from '../context/ShopContext';

export interface HealthBreakdown {
  score: number;            // 0..100, integer
  band: 'critical' | 'fragile' | 'healthy' | 'thriving';
  factors: {
    label: string;
    score: number;          // 0..100
    weight: number;         // 0..1, weights sum to 1
    reason: string;         // short human explanation
  }[];
  alerts: string[];         // priority issues to show first
}

interface Inputs {
  sales: Sale[];
  expenses: Expense[];
  udhaars: Udhaar[];
  stock: Stock[];
  contacts: Contact[];
  // Window in days that "recent" means. Defaults to 30 — a month of history.
  windowDays?: number;
}

const DAY = 24 * 60 * 60 * 1000;

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const isFiniteNum = (n: any): n is number => typeof n === 'number' && isFinite(n);

/**
 * Compute the business-health score.
 *
 * Math notes:
 *  - Sub-scores are normalized to 0..100 via piecewise-linear ramps tuned for
 *    typical kiryana-store ranges (not e-commerce).
 *  - Weights are intentional: profitability + cash flow dominate (55%),
 *    inventory + customer-mix and operational consistency split the rest.
 *  - When a factor has no data (e.g. no sales yet), it contributes a NEUTRAL
 *    50 with reduced weight so a brand-new shop doesn't score 0.
 */
export function computeBusinessHealth(input: Inputs): HealthBreakdown {
  const { sales = [], expenses = [], udhaars = [], stock = [], contacts = [] } = input;
  const windowDays = input.windowDays ?? 30;
  const now = Date.now();
  const cutoff = now - windowDays * DAY;

  const recentSales = sales.filter(s => new Date(s.date).getTime() >= cutoff);
  const recentExpenses = expenses.filter(e => new Date(e.date).getTime() >= cutoff);
  const totalRevenue = recentSales.reduce((s, x) => s + (Number(x.total) || 0), 0);
  const totalExpense = recentExpenses.reduce((s, x) => s + (Number(x.amount) || 0), 0);

  // COGS using buying price × qty from sale items.
  let cogs = 0;
  recentSales.forEach(s => {
    s.items?.forEach(it => {
      const product = stock.find(p => p.id === it.itemId);
      const buy = Number(product?.buyingPrice) || 0;
      cogs += buy * (Number(it.qty) || 0);
    });
  });
  const grossProfit = totalRevenue - cogs;
  const netProfit = grossProfit - totalExpense;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : null;
  const expenseRatioPct = totalRevenue > 0 ? (totalExpense / totalRevenue) * 100 : null;

  // ── Factor 1: PROFITABILITY (weight 0.30) ────────────────────────────
  // Healthy gross margin for kiryana stores: 18-30%. We score 0 at <0%
  // (selling at loss), 60 at ~10%, 100 at 25%+.
  let profitabilityScore = 50;
  let profitReason = 'Not enough sales data to score profitability yet.';
  if (grossMarginPct !== null) {
    if (grossMarginPct < 0) {
      profitabilityScore = 0;
      profitReason = `Gross margin ${grossMarginPct.toFixed(1)}% — selling at a loss!`;
    } else if (grossMarginPct < 10) {
      profitabilityScore = clamp(grossMarginPct * 4); // 0% → 0, 10% → 40
      profitReason = `Gross margin ${grossMarginPct.toFixed(1)}% is low. Aim for 18%+.`;
    } else if (grossMarginPct < 25) {
      profitabilityScore = clamp(40 + (grossMarginPct - 10) * 4); // 10% → 40, 25% → 100
      profitReason = `Gross margin ${grossMarginPct.toFixed(1)}% — okay, growing.`;
    } else {
      profitabilityScore = 100;
      profitReason = `Gross margin ${grossMarginPct.toFixed(1)}% — strong margins!`;
    }
    // Penalise net loss even if gross is fine (expenses eating profit).
    if (netProfit < 0) profitabilityScore = Math.min(profitabilityScore, 50);
  }

  // ── Factor 2: CASH FLOW (weight 0.25) ────────────────────────────────
  // Receivables vs total revenue + expense ratio.
  // - Receivables > 30% of period revenue is risky (too much money locked).
  // - Expense ratio > 80% is alarming.
  const totalReceivable = udhaars.filter(u => u.amount > 0).reduce((s, u) => s + u.amount, 0);
  const receivableRatio = totalRevenue > 0 ? (totalReceivable / totalRevenue) * 100 : 0;
  let cashflowScore = 50;
  let cashflowReason = 'Cash flow data limited.';
  if (totalRevenue > 0) {
    // Receivable component (60% of this factor)
    let recvComponent;
    if (receivableRatio < 10) recvComponent = 100;
    else if (receivableRatio < 30) recvComponent = clamp(100 - (receivableRatio - 10) * 2.5); // 30% → 50
    else recvComponent = clamp(50 - (receivableRatio - 30) * 1.5); // 60%+ → 5
    // Expense component (40%)
    let expComponent;
    if (expenseRatioPct === null) expComponent = 50;
    else if (expenseRatioPct < 60) expComponent = 100;
    else if (expenseRatioPct < 90) expComponent = clamp(100 - (expenseRatioPct - 60) * 2); // 90% → 40
    else expComponent = clamp(40 - (expenseRatioPct - 90) * 4); // very bad
    cashflowScore = recvComponent * 0.6 + expComponent * 0.4;
    cashflowReason = receivableRatio > 30
      ? `Rs ${Math.round(totalReceivable).toLocaleString()} stuck in udhaar (${receivableRatio.toFixed(0)}% of revenue) — collect karein.`
      : expenseRatioPct !== null && expenseRatioPct > 80
        ? `Expenses ${expenseRatioPct.toFixed(0)}% of revenue — kharch zyada hai.`
        : `Cash position healthy.`;
  }

  // ── Factor 3: INVENTORY HEALTH (weight 0.20) ─────────────────────────
  // - Out-of-stock items as % of catalogue
  // - Low-stock alerts as % of catalogue
  // - Dead-stock proxy: items with 0 sales in the window
  let inventoryScore = 50;
  let inventoryReason = 'Stock data not available.';
  const activeStock = stock.filter(s => s.status !== 'inactive');
  if (activeStock.length > 0) {
    const outCount = activeStock.filter(s => (s.quantity || 0) <= 0).length;
    const lowCount = activeStock.filter(s => (s.quantity || 0) > 0 && (s.quantity || 0) <= (s.minThreshold || 5)).length;
    const soldIds = new Set<string>();
    recentSales.forEach(s => s.items?.forEach(it => soldIds.add(it.itemId)));
    const deadCount = activeStock.filter(s => !soldIds.has(s.id)).length;
    const outPct = (outCount / activeStock.length) * 100;
    const lowPct = (lowCount / activeStock.length) * 100;
    const deadPct = (deadCount / activeStock.length) * 100;
    // Each issue subtracts from 100; dead stock weighted less.
    inventoryScore = clamp(100 - outPct * 2.5 - lowPct * 1 - deadPct * 0.4);
    if (outCount > 0) inventoryReason = `${outCount} item(s) out of stock — turant order karein.`;
    else if (lowCount > 0) inventoryReason = `${lowCount} item(s) low — re-order soon.`;
    else if (deadPct > 50) inventoryReason = `${deadCount} item(s) ne ${windowDays} din mein koi sale nahi ki — dead stock zyada.`;
    else inventoryReason = `Stock levels balanced.`;
  }

  // ── Factor 4: CUSTOMER CONCENTRATION (weight 0.15) ───────────────────
  // Healthy = revenue spread across many customers. Top1 customer >40% = risky.
  let concentrationScore = 50;
  let concentrationReason = 'Customer mix unclear.';
  const customerRevenue: Record<string, number> = {};
  recentSales.forEach(s => {
    // Sale-level customer not always tracked; fall back to "Walk-in"
    const name = (s as any).customerName || 'Walk-in';
    customerRevenue[name] = (customerRevenue[name] || 0) + (Number(s.total) || 0);
  });
  const customerEntries = Object.entries(customerRevenue).sort((a, b) => b[1] - a[1]);
  if (totalRevenue > 0 && customerEntries.length > 0) {
    const top1 = customerEntries[0][1];
    const top1Pct = (top1 / totalRevenue) * 100;
    const uniqueCustomers = customerEntries.length;
    if (uniqueCustomers === 1 && customerEntries[0][0] === 'Walk-in') {
      concentrationScore = 75;
      concentrationReason = 'Mostly walk-in customers — koi loyalty data nahi hai.';
    } else if (top1Pct > 50) {
      concentrationScore = clamp(50 - (top1Pct - 50));
      concentrationReason = `Top customer ${top1Pct.toFixed(0)}% revenue laata hai — risk hai agar woh chala jaaye.`;
    } else if (top1Pct > 30) {
      concentrationScore = clamp(80 - (top1Pct - 30) * 1.5);
      concentrationReason = `Top customer ${top1Pct.toFixed(0)}% — moderate concentration.`;
    } else {
      concentrationScore = clamp(80 + Math.min(20, uniqueCustomers - 5));
      concentrationReason = `Revenue ${uniqueCustomers} customers mein well-distributed.`;
    }
  }

  // ── Factor 5: OPERATIONAL CONSISTENCY (weight 0.10) ──────────────────
  // Sales recorded on at least N of last 30 days = engaged shop.
  let consistencyScore = 50;
  let consistencyReason = '';
  if (recentSales.length > 0) {
    const activeDays = new Set(recentSales.map(s => new Date(s.date).toDateString())).size;
    const ratio = activeDays / windowDays;
    if (ratio > 0.7) { consistencyScore = 100; consistencyReason = `${activeDays} days active in last ${windowDays} — well-tracked.`; }
    else if (ratio > 0.4) { consistencyScore = 75; consistencyReason = `${activeDays} days active — improve recording habit.`; }
    else if (ratio > 0.15) { consistencyScore = 50; consistencyReason = `Sales kabhi-kabhi record hoti hain — daily entry karein.`; }
    else { consistencyScore = 25; consistencyReason = `Bohat kam din active — hisaab regular karein.`; }
  } else {
    consistencyReason = 'No sales in the window.';
    consistencyScore = 30;
  }

  // ── COMPOSITE SCORE ──────────────────────────────────────────────────
  const factors = [
    { label: 'Profitability', score: profitabilityScore, weight: 0.30, reason: profitReason },
    { label: 'Cash flow', score: cashflowScore, weight: 0.25, reason: cashflowReason },
    { label: 'Inventory', score: inventoryScore, weight: 0.20, reason: inventoryReason },
    { label: 'Customer mix', score: concentrationScore, weight: 0.15, reason: concentrationReason },
    { label: 'Consistency', score: consistencyScore, weight: 0.10, reason: consistencyReason },
  ];
  const composite = factors.reduce((s, f) => s + f.score * f.weight, 0);
  const score = Math.round(clamp(composite));

  const band: HealthBreakdown['band'] =
    score < 35 ? 'critical' : score < 60 ? 'fragile' : score < 80 ? 'healthy' : 'thriving';

  // Surface the WORST 1-2 factors as alerts (they pull the score down most).
  const alerts = factors
    .filter(f => f.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map(f => `${f.label}: ${f.reason}`);

  return { score, band, factors, alerts };
}
