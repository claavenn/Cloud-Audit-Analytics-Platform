import { Transaction, AuditRulesConfig } from "../types";

export interface RuleEvaluationResult {
  rule_score: number;
  rule_flags: string[];
  rule_reasons: string[];
  vendor_historical_avg: number;
  vendor_amount_ratio: number;
  department_avg: number;
  department_amount_ratio: number;
  day_of_week: number;
  is_weekend: boolean;
  is_month_end: boolean;
  invoice_frequency: number;
}

export const DEFAULT_RULES_CONFIG: AuditRulesConfig = {
  largeAmountThreshold: 100000000, // 100M IDR
  vendorRatioThreshold: 3.2, // 3.2x vendor average
  departmentRatioThreshold: 2.8, // 2.8x department median
  weekendFlagEnabled: true,
  periodEndDays: 3, // last 3 days of month
  duplicateInvoiceWeight: 50, // Duplicate invoice is a direct risk, minimum 50 pts
  ruleWeightPercentage: 60,
  mlWeightPercentage: 40,
};

export function runAuditRules(
  transactions: Transaction[],
  config: AuditRulesConfig = DEFAULT_RULES_CONFIG
): Map<string, RuleEvaluationResult> {
  const results = new Map<string, RuleEvaluationResult>();

  // 1. Calculate Vendor Baselines
  const vendorTotals = new Map<string, { sum: number; count: number }>();
  const invoiceCounts = new Map<string, number>();
  const departmentTotals = new Map<string, { sum: number; count: number }>();

  transactions.forEach((tx) => {
    // Vendor stats
    const vKey = tx.vendor_id || tx.vendor_name;
    const vStat = vendorTotals.get(vKey) || { sum: 0, count: 0 };
    vStat.sum += tx.amount;
    vStat.count += 1;
    vendorTotals.set(vKey, vStat);

    // Invoice counts
    const invKey = tx.invoice_id?.trim().toUpperCase();
    if (invKey) {
      invoiceCounts.set(invKey, (invoiceCounts.get(invKey) || 0) + 1);
    }

    // Department stats
    const deptKey = tx.department || "Unknown";
    const deptStat = departmentTotals.get(deptKey) || { sum: 0, count: 0 };
    deptStat.sum += tx.amount;
    deptStat.count += 1;
    departmentTotals.set(deptKey, deptStat);
  });

  // Calculate Vendor Averages & Department Averages
  const vendorAverages = new Map<string, number>();
  vendorTotals.forEach((val, key) => {
    vendorAverages.set(key, val.sum / Math.max(1, val.count));
  });

  const departmentAverages = new Map<string, number>();
  departmentTotals.forEach((val, key) => {
    departmentAverages.set(key, val.sum / Math.max(1, val.count));
  });

  // 2. Evaluate Each Transaction
  transactions.forEach((tx) => {
    const flags: string[] = [];
    const reasons: string[] = [];
    let scoreAccumulator = 0;

    const vKey = tx.vendor_id || tx.vendor_name;
    const vendorAvg = vendorAverages.get(vKey) || tx.amount;
    const vendorRatio = vendorAvg > 0 ? tx.amount / vendorAvg : 1;

    const deptKey = tx.department || "Unknown";
    const deptAvg = departmentAverages.get(deptKey) || tx.amount;
    const deptRatio = deptAvg > 0 ? tx.amount / deptAvg : 1;

    const invKey = tx.invoice_id?.trim().toUpperCase();
    const invFreq = invoiceCounts.get(invKey) || 1;

    // Date calculations
    const txDate = new Date(tx.date);
    const dayOfWeek = isNaN(txDate.getTime()) ? 1 : txDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Month-end calculation
    let isMonthEnd = false;
    if (!isNaN(txDate.getTime())) {
      const year = txDate.getFullYear();
      const month = txDate.getMonth();
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const currentDay = txDate.getDate();
      isMonthEnd = currentDay > lastDayOfMonth - config.periodEndDays;
    }

    // Rule 1: Large Amount
    if (tx.amount >= config.largeAmountThreshold) {
      flags.push("large_amount");
      scoreAccumulator += 30;
      reasons.push(
        `Nilai transaksi (Rp ${tx.amount.toLocaleString("id-ID")}) melampaui batas ambang audit (Rp ${config.largeAmountThreshold.toLocaleString("id-ID")})`
      );
    }

    // Rule 2: Duplicate Invoice
    if (invFreq > 1) {
      flags.push("duplicate_invoice");
      scoreAccumulator += config.duplicateInvoiceWeight;
      reasons.push(
        `Nomor faktur "${tx.invoice_id}" tercatat ${invFreq} kali di sistem (indikasi potensi duplicate payment)`
      );
    }

    // Rule 3: Weekend Transaction
    if (config.weekendFlagEnabled && isWeekend) {
      flags.push("weekend_transaction");
      scoreAccumulator += 15;
      const dayName = dayOfWeek === 0 ? "Minggu" : "Sabtu";
      reasons.push(`Transaksi diproses pada hari ${dayName} di luar hari kerja operasional standar`);
    }

    // Rule 4: Period-End Transaction
    if (isMonthEnd) {
      flags.push("period_end_transaction");
      scoreAccumulator += 15;
      reasons.push(`Transaksi dicatat pada ${config.periodEndDays} hari menjelang cut-off tutup buku akhir bulan`);
    }

    // Rule 5: Unusual Vendor Amount Multiplier
    if (vendorRatio >= config.vendorRatioThreshold && vendorTotals.get(vKey)!.count >= 2) {
      flags.push("unusual_vendor_amount");
      scoreAccumulator += 25;
      reasons.push(
        `Nilai transaksi mencapai ${vendorRatio.toFixed(1)}x lipat dari rata-rata pengeluaran historis vendor ini (Rp ${Math.round(vendorAvg).toLocaleString("id-ID")})`
      );
    }

    // Rule 6: Unusual Department Spending
    if (deptRatio >= config.departmentRatioThreshold && departmentTotals.get(deptKey)!.count >= 3) {
      flags.push("unusual_department_spending");
      scoreAccumulator += 20;
      reasons.push(
        `Pengeluaran melebihi ${deptRatio.toFixed(1)}x rata-rata historis pengeluaran departemen ${tx.department}`
      );
    }

    // Cap score at 100
    const rule_score = Math.min(100, Math.round(scoreAccumulator));

    results.set(tx.transaction_id, {
      rule_score,
      rule_flags: flags,
      rule_reasons: reasons,
      vendor_historical_avg: Math.round(vendorAvg),
      vendor_amount_ratio: Number(vendorRatio.toFixed(2)),
      department_avg: Math.round(deptAvg),
      department_amount_ratio: Number(deptRatio.toFixed(2)),
      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      is_month_end: isMonthEnd,
      invoice_frequency: invFreq,
    });
  });

  return results;
}
