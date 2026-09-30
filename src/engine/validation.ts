import { Transaction, ValidationReport } from "../types";

export const REQUIRED_COLUMNS = [
  "transaction_id",
  "date",
  "vendor_id",
  "vendor_name",
  "invoice_id",
  "category",
  "amount",
  "employee_id",
  "department",
  "payment_method",
  "account",
  "description",
];

export function validateDataset(data: any[]): ValidationReport {
  const report: ValidationReport = {
    isValid: true,
    totalRows: data.length,
    missingColumns: [],
    missingValuesCount: 0,
    duplicateIdsCount: 0,
    invalidDatesCount: 0,
    negativeAmountsCount: 0,
    warnings: [],
    errors: [],
  };

  if (!Array.isArray(data) || data.length === 0) {
    report.isValid = false;
    report.errors.push("Dataset kosong atau format tidak valid.");
    return report;
  }

  // Check columns present in first row
  const firstRow = data[0];
  const presentKeys = Object.keys(firstRow || {});
  const missingCols = REQUIRED_COLUMNS.filter((col) => !presentKeys.includes(col));

  if (missingCols.length > 0) {
    report.isValid = false;
    report.missingColumns = missingCols;
    report.errors.push(`Kolom wajib tidak ditemukan: ${missingCols.join(", ")}`);
  }

  const seenIds = new Set<string>();

  data.forEach((row, idx) => {
    // Duplicate ID check
    if (row.transaction_id) {
      if (seenIds.has(row.transaction_id)) {
        report.duplicateIdsCount++;
      } else {
        seenIds.add(row.transaction_id);
      }
    } else {
      report.missingValuesCount++;
    }

    // Amount check
    const amt = Number(row.amount);
    if (isNaN(amt) || row.amount === null || row.amount === undefined || row.amount === "") {
      report.missingValuesCount++;
    } else if (amt < 0) {
      report.negativeAmountsCount++;
    }

    // Date check
    if (row.date) {
      const parsedDate = new Date(row.date);
      if (isNaN(parsedDate.getTime())) {
        report.invalidDatesCount++;
      }
    } else {
      report.missingValuesCount++;
    }

    // Key fields null check
    if (!row.vendor_name || !row.invoice_id || !row.department) {
      report.missingValuesCount++;
    }
  });

  if (report.duplicateIdsCount > 0) {
    report.warnings.push(`Terdeteksi ${report.duplicateIdsCount} transaksi dengan ID duplikat.`);
  }

  if (report.negativeAmountsCount > 0) {
    report.warnings.push(`Ditemukan ${report.negativeAmountsCount} transaksi bernilai negatif (kredit/retur).`);
  }

  if (report.invalidDatesCount > 0) {
    report.warnings.push(`Ditemukan ${report.invalidDatesCount} format tanggal tidak standar.`);
  }

  if (report.missingValuesCount > 0) {
    report.warnings.push(`Ditemukan ${report.missingValuesCount} cell data kosong/null.`);
  }

  // If there are fatal errors (e.g. missing columns or 0 rows), invalid
  if (report.missingColumns.length > 0) {
    report.isValid = false;
  }

  return report;
}

export function parseCSVToTransactions(csvContent: string): { data: Transaction[]; error?: string } {
  try {
    const lines = csvContent
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return { data: [], error: "File CSV harus memiliki baris header dan minimal 1 baris data." };
    }

    // Parse header row
    const headers = parseCSVLine(lines[0]).map((h) => h.trim());

    const result: Transaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue;

      const obj: any = {};
      headers.forEach((h, colIdx) => {
        let val: any = values[colIdx] ?? "";
        if (h === "amount") {
          val = parseFloat(val.replace(/[^0-9.-]/g, "")) || 0;
        } else if (h === "is_injected_anomaly") {
          val = val === "true" || val === "1" || val === true;
        }
        obj[h] = val;
      });

      result.push(obj as Transaction);
    }

    return { data: result };
  } catch (err: any) {
    return { data: [], error: `Gagal mem-parsing CSV: ${err.message}` };
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function exportTransactionsToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = [
    "transaction_id",
    "date",
    "vendor_id",
    "vendor_name",
    "invoice_id",
    "category",
    "amount",
    "employee_id",
    "department",
    "payment_method",
    "account",
    "rule_score",
    "ml_anomaly_score",
    "risk_score",
    "risk_priority",
    "rule_flags",
    "risk_reasons",
    "description",
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return "";
    let str = String(val);
    if (Array.isArray(val)) {
      str = val.join(" | ");
    }
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows: string[] = [];
  csvRows.push(headers.join(","));

  data.forEach((row) => {
    const values = headers.map((h) => escapeCSV(row[h]));
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}
