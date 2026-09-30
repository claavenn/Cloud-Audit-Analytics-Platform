export type ReviewPriority = "Low" | "Medium" | "High" | "Critical";

export interface Transaction {
  transaction_id: string;
  date: string;
  vendor_id: string;
  vendor_name: string;
  invoice_id: string;
  category: string;
  amount: number;
  employee_id: string;
  department: string;
  payment_method: string;
  account: string;
  description: string;
  // Optional ground-truth test labels (used only for evaluation, not feature engineering)
  is_injected_anomaly?: boolean;
  anomaly_type?: string;
}

export interface RuleFlags {
  large_amount?: boolean;
  duplicate_invoice?: boolean;
  weekend_transaction?: boolean;
  period_end_transaction?: boolean;
  unusual_vendor_amount?: boolean;
  unusual_department_spending?: boolean;
}

export interface AnalyzedTransaction extends Transaction {
  rule_score: number;
  rule_flags: string[];
  rule_reasons: string[];
  ml_anomaly_score: number;
  risk_score: number;
  risk_priority: ReviewPriority;
  risk_reasons: string[];
  // Behavioral features calculated relative to dataset
  vendor_historical_avg?: number;
  vendor_amount_ratio?: number;
  department_avg?: number;
  department_amount_ratio?: number;
  day_of_week?: number;
  is_weekend?: boolean;
  is_month_end?: boolean;
  invoice_frequency?: number;
}

export interface ValidationReport {
  isValid: boolean;
  totalRows: number;
  missingColumns: string[];
  missingValuesCount: number;
  duplicateIdsCount: number;
  invalidDatesCount: number;
  negativeAmountsCount: number;
  warnings: string[];
  errors: string[];
}

export interface AuditRulesConfig {
  largeAmountThreshold: number; // e.g., 100,000,000 IDR
  vendorRatioThreshold: number; // e.g., 3.0x vendor average
  departmentRatioThreshold: number; // e.g., 2.5x department average
  weekendFlagEnabled: boolean;
  periodEndDays: number; // last N days of month (default 3)
  duplicateInvoiceWeight: number; // weight contribution
  ruleWeightPercentage: number; // e.g., 60%
  mlWeightPercentage: number; // e.g., 40%
}

export interface DatasetSummary {
  totalTransactions: number;
  flaggedCount: number;
  flaggedPercentage: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalValue: number;
  averageValue: number;
  flaggedValue: number;
  topRules: string[];
  topDepartments: string[];
  topVendors: string[];
}

export interface AIRecommendation {
  riskSummary: string;
  investigationChecklist: string[];
  interviewQuestions: string[];
  requiredDocuments: string[];
  controlImprovement: string;
}

export interface ExecutiveSummaryReport {
  title: string;
  keyObservations: string[];
  strategicRecommendations: string[];
  recommendedNextSteps: string[];
}

export type UserRole = "admin" | "user";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials?: string;
  avatarUrl?: string;
  workspaceName?: string;
  description?: string;
  isCleanAccount?: boolean;
  dataCount?: number;
}
