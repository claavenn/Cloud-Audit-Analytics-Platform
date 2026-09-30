import {
  Transaction,
  AnalyzedTransaction,
  ReviewPriority,
  AuditRulesConfig,
  DatasetSummary,
} from "../types";
import { RuleEvaluationResult, DEFAULT_RULES_CONFIG } from "./auditRules";

export function combineAndScorePipeline(
  transactions: Transaction[],
  ruleMap: Map<string, RuleEvaluationResult>,
  mlMap: Map<string, number>,
  config: AuditRulesConfig = DEFAULT_RULES_CONFIG
): AnalyzedTransaction[] {
  const ruleWeight = (config.ruleWeightPercentage ?? 60) / 100;
  const mlWeight = (config.mlWeightPercentage ?? 40) / 100;

  return transactions.map((tx) => {
    const r = ruleMap.get(tx.transaction_id) || {
      rule_score: 0,
      rule_flags: [],
      rule_reasons: [],
      vendor_historical_avg: tx.amount,
      vendor_amount_ratio: 1,
      department_avg: tx.amount,
      department_amount_ratio: 1,
      day_of_week: 1,
      is_weekend: false,
      is_month_end: false,
      invoice_frequency: 1,
    };

    const mlScore = mlMap.get(tx.transaction_id) || 10;

    // Weighted risk score calculation
    const rawScore = r.rule_score * ruleWeight + mlScore * mlWeight;
    const finalRiskScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Categorization
    let priority: ReviewPriority = "Low";
    if (finalRiskScore >= 80) {
      priority = "Critical";
    } else if (finalRiskScore >= 60) {
      priority = "High";
    } else if (finalRiskScore >= 30) {
      priority = "Medium";
    } else {
      priority = "Low";
    }

    // Hard audit rule guardrail: A confirmed duplicate invoice is never 'Low' (Safe)
    if (r.rule_flags.includes("duplicate_invoice") && priority === "Low") {
      priority = "Medium";
    }

    // Explainable Synthesis: Combining deterministic rule findings & ML signals
    const combinedReasons: string[] = [...r.rule_reasons];

    if (mlScore >= 75) {
      combinedReasons.push(
        `Model ML (Isolation Forest) mendeteksi deviasi multivariat signifikan (skor anomali ML ${mlScore}/100)`
      );
    } else if (mlScore >= 55 && combinedReasons.length === 0) {
      combinedReasons.push(
        `Pola transaksi menunjukkan keanehan statistik moderat menurut algoritma ML unsupervised (${mlScore}/100)`
      );
    }

    if (combinedReasons.length === 0) {
      combinedReasons.push("Transaksi berada dalam parameter historis normal");
    }

    return {
      ...tx,
      rule_score: r.rule_score,
      rule_flags: r.rule_flags,
      rule_reasons: r.rule_reasons,
      ml_anomaly_score: mlScore,
      risk_score: finalRiskScore,
      risk_priority: priority,
      risk_reasons: combinedReasons,
      vendor_historical_avg: r.vendor_historical_avg,
      vendor_amount_ratio: r.vendor_amount_ratio,
      department_avg: r.department_avg,
      department_amount_ratio: r.department_amount_ratio,
      day_of_week: r.day_of_week,
      is_weekend: r.is_weekend,
      is_month_end: r.is_month_end,
      invoice_frequency: r.invoice_frequency,
    };
  });
}

export function generateDatasetSummary(analyzed: AnalyzedTransaction[]): DatasetSummary {
  const totalTransactions = analyzed.length;
  if (totalTransactions === 0) {
    return {
      totalTransactions: 0,
      flaggedCount: 0,
      flaggedPercentage: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      totalValue: 0,
      averageValue: 0,
      flaggedValue: 0,
      topRules: [],
      topDepartments: [],
      topVendors: [],
    };
  }

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let totalValue = 0;
  let flaggedValue = 0;

  const ruleCounts = new Map<string, number>();
  const deptRisk = new Map<string, number>();
  const vendorRisk = new Map<string, number>();

  analyzed.forEach((tx) => {
    totalValue += tx.amount;

    if (tx.risk_priority === "Critical") {
      criticalCount++;
      flaggedValue += tx.amount;
    } else if (tx.risk_priority === "High") {
      highCount++;
      flaggedValue += tx.amount;
    } else if (tx.risk_priority === "Medium") {
      mediumCount++;
      flaggedValue += tx.amount;
    } else {
      lowCount++;
    }

    // Rules stats
    tx.rule_flags.forEach((flag) => {
      ruleCounts.set(flag, (ruleCounts.get(flag) || 0) + 1);
    });

    // High risk aggregates
    if (tx.risk_score >= 60) {
      deptRisk.set(tx.department, (deptRisk.get(tx.department) || 0) + 1);
      vendorRisk.set(tx.vendor_name, (vendorRisk.get(tx.vendor_name) || 0) + 1);
    }
  });

  const flaggedCount = criticalCount + highCount + mediumCount;
  const flaggedPercentage = Number(((flaggedCount / totalTransactions) * 100).toFixed(1));
  const averageValue = Math.round(totalValue / totalTransactions);

  // Sort top rules
  const topRules = Array.from(ruleCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([rule]) => rule);

  // Sort top departments
  const topDepartments = Array.from(deptRisk.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([dept]) => dept);

  // Sort top vendors
  const topVendors = Array.from(vendorRisk.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([vendor]) => vendor);

  return {
    totalTransactions,
    flaggedCount,
    flaggedPercentage,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    totalValue,
    averageValue,
    flaggedValue,
    topRules,
    topDepartments,
    topVendors,
  };
}
