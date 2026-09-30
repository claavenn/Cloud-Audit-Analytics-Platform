import React, { useState } from "react";
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Sliders,
  Sparkles,
  Info,
  ShieldCheck,
} from "lucide-react";
import { ValidationReport, AuditRulesConfig, AnalyzedTransaction } from "../types";
import { parseCSVToTransactions, exportTransactionsToCSV } from "../engine/validation";

interface DataQualityViewProps {
  validationReport: ValidationReport;
  rulesConfig: AuditRulesConfig;
  onUpdateConfig: (newConfig: AuditRulesConfig) => void;
  onUploadDataset: (csvText: string) => void;
  onReloadSynthetic: () => void;
  analyzedTransactions: AnalyzedTransaction[];
  language: "id" | "en";
  userRole?: "admin" | "user";
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({
  validationReport,
  rulesConfig,
  onUpdateConfig,
  onUploadDataset,
  onReloadSynthetic,
  analyzedTransactions,
  language,
  userRole = "admin",
}) => {
  const isId = language === "id";

  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Model Evaluation metrics on synthetic test labels (Master Spec Section 23 & 24)
  const evalStats = React.useMemo(() => {
    let truePositives = 0; // Injected anomaly AND flagged High/Critical
    let falsePositives = 0; // NOT injected anomaly BUT flagged High/Critical
    let falseNegatives = 0; // Injected anomaly BUT NOT flagged High/Critical
    let trueNegatives = 0;

    const hasInjectedLabels = analyzedTransactions.some((t) => t.is_injected_anomaly !== undefined);
    if (!hasInjectedLabels) return null;

    analyzedTransactions.forEach((tx) => {
      const isGroundTruthAnomaly = tx.is_injected_anomaly === true;
      const isPredictedFlagged = tx.risk_priority === "Critical" || tx.risk_priority === "High";

      if (isGroundTruthAnomaly && isPredictedFlagged) truePositives++;
      else if (!isGroundTruthAnomaly && isPredictedFlagged) falsePositives++;
      else if (isGroundTruthAnomaly && !isPredictedFlagged) falseNegatives++;
      else trueNegatives++;
    });

    const precision = truePositives + falsePositives > 0 ? (truePositives / (truePositives + falsePositives)) * 100 : 0;
    const recall = truePositives + falseNegatives > 0 ? (truePositives / (truePositives + falseNegatives)) * 100 : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      truePositives,
      falsePositives,
      falseNegatives,
      trueNegatives,
      precision: precision.toFixed(1),
      recall: recall.toFixed(1),
      f1: f1.toFixed(1),
    };
  }, [analyzedTransactions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const readFile = (file: File) => {
    setUploadStatus(isId ? "Membaca file..." : "Reading file...");
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onUploadDataset(text);
        setUploadStatus(isId ? `Berhasil memuat ${file.name}` : `Successfully loaded ${file.name}`);
      }
    };
    reader.onerror = () => {
      setUploadStatus(isId ? "Gagal membaca file" : "Failed to read file");
    };
    reader.readAsText(file);
  };

  const downloadSampleTemplate = () => {
    const sample = `transaction_id,date,vendor_id,vendor_name,invoice_id,category,amount,employee_id,department,payment_method,account,description
TX000001,2026-05-12,VEN001,PT Solusi Cloud Nusantara,INV-2026001,IT Infrastructure,45000000,EMP102,IT & Engineering,Bank Transfer,Software & Tech Infrastructure,Server licenses
TX000002,2026-05-14,VEN002,PT Mitra Logistik Prima,INV-2026002,Logistics,18000000,EMP115,Operations,Bank Transfer,Freight & Delivery Operational Expense,Fleet shipping
TX000003,2026-05-31,VEN003,CV Sumber Berkah Mandiri,INV-2026003,Office Supplies,320000000,EMP104,Finance,Corporate Card,Stationery & Consumables,Urgent bulk replenishment
TX000004,2026-06-02,VEN003,CV Sumber Berkah Mandiri,INV-2026003,Office Supplies,320000000,EMP104,Finance,Corporate Card,Stationery & Consumables,Duplicate invoice payment`;

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_audit_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFullResults = () => {
    const csvContent = exportTransactionsToCSV(analyzedTransactions);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isId ? "Data Quality, Validasi & Konfigurasi Parameter Audit" : "Data Studio & Audit Settings"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isId
              ? "Unggah file CSV transaksi, verifikasi integritas data, dan sesuaikan bobot ambang batas aturan analitik"
              : "Upload transaction CSVs, validate data hygiene, and tune deterministic rules and ML thresholds"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReloadSynthetic}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isId ? "Muat Ulang Data Sampel (800 Data)" : "Reload Sample Dataset"}</span>
          </button>

          <button
            onClick={downloadFullResults}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isId ? "Unduh audit_results.csv" : "Export audit_results.csv"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: CSV Upload & Validation Report */}
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            }`}
          >
            <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isId ? "Tarik & Letakkan File CSV Transaksi" : "Drag and drop your transaction CSV here"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isId ? "Mendukung skema standar 12 kolom audit" : "Conforms to 12 standard audit columns schema"}
            </p>

            <div className="mt-4 flex items-center justify-center space-x-3">
              <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-sm">
                <span>{isId ? "Pilih File CSV..." : "Browse CSV File..."}</span>
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              </label>

              <button
                onClick={downloadSampleTemplate}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                {isId ? "Unduh Template CSV" : "Download Sample CSV"}
              </button>
            </div>

            {uploadStatus && (
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-3 animate-fade-in">
                {uploadStatus}
              </p>
            )}
          </div>

          {/* Validation Checklist Report */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isId ? "Laporan Validasi Data (Hygiene Check)" : "Data Hygiene & Validation Report"}
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  validationReport.isValid
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                }`}
              >
                {validationReport.isValid
                  ? isId
                    ? "VALID UNTUK ANALISIS"
                    : "VALID FOR AUDIT"
                  : isId
                  ? "DATA TIDAK LENGKAP"
                  : "INVALID STRUCTURE"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">{isId ? "Baris Data:" : "Total Records:"}</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {validationReport.totalRows}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">{isId ? "ID Duplikat:" : "Duplicate IDs:"}</span>
                <div
                  className={`text-lg font-bold mt-0.5 ${
                    validationReport.duplicateIdsCount > 0 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {validationReport.duplicateIdsCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">{isId ? "Nilai Null/Kosong:" : "Missing Fields:"}</span>
                <div
                  className={`text-lg font-bold mt-0.5 ${
                    validationReport.missingValuesCount > 0 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {validationReport.missingValuesCount}
                </div>
              </div>
            </div>

            {/* Validation Messages */}
            <div className="space-y-2 text-xs">
              {validationReport.errors.map((err, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center space-x-2"
                >
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}

              {validationReport.warnings.map((warn, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 flex items-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}

              {validationReport.errors.length === 0 && validationReport.warnings.length === 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>
                    {isId
                      ? "Integritas seluruh 12 kolom lulus validasi (tidak ada data korup)."
                      : "All 12 required columns passed validation with zero critical schema errors."}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Configurable Audit Rules & Weights + Synthetic Evaluation */}
        <div className="space-y-6">
          {/* Rules Configuration */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isId ? "Parameter & Pembobotan Aturan Audit" : "Audit Rule Thresholds & Weights"}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {userRole === "user" ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {isId ? "Role User: Hanya Admin" : "User Role: Admin Only"}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">{isId ? "Dapat Disesuaikan" : "Configurable"}</span>
                )}
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Large Amount Threshold */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>{isId ? "Ambang Batas Nilai Besar (Rule 1):" : "Large Amount Threshold:"}</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    Rp {(rulesConfig.largeAmountThreshold / 1_000_000).toFixed(0)} Juta
                  </span>
                </div>
                <input
                  type="range"
                  min="50000000"
                  max="250000000"
                  step="10000000"
                  value={rulesConfig.largeAmountThreshold}
                  onChange={(e) =>
                    onUpdateConfig({ ...rulesConfig, largeAmountThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Vendor Ratio Multiplier */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>{isId ? "Kelipatan Rata-rata Vendor (Rule 5):" : "Vendor Amount Multiplier:"}</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {rulesConfig.vendorRatioThreshold.toFixed(1)}x lipat
                  </span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="5.0"
                  step="0.2"
                  value={rulesConfig.vendorRatioThreshold}
                  onChange={(e) =>
                    onUpdateConfig({ ...rulesConfig, vendorRatioThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Scoring Balance (Rule vs ML) */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>{isId ? "Bobot Skor Gabungan:" : "Combined Scoring Weight:"}</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {rulesConfig.ruleWeightPercentage}% Aturan • {rulesConfig.mlWeightPercentage}% ML
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  value={rulesConfig.ruleWeightPercentage}
                  onChange={(e) => {
                    const ruleW = Number(e.target.value);
                    onUpdateConfig({
                      ...rulesConfig,
                      ruleWeightPercentage: ruleW,
                      mlWeightPercentage: 100 - ruleW,
                    });
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Period End Cutoff Days */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>{isId ? "Hari Menjelang Tutup Buku Akhir Bulan:" : "Period-End Cut-off Days:"}</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {rulesConfig.periodEndDays} hari terakhir
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={rulesConfig.periodEndDays}
                  onChange={(e) =>
                    onUpdateConfig({ ...rulesConfig, periodEndDays: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Synthetic Anomaly Evaluation Metrics (Master Spec Section 23, 24, 25) */}
          {evalStats && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isId ? "Evaluasi Akurasi Pengujian Sintetis" : "Synthetic Benchmark Evaluation"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isId
                      ? "Metrik perbandingan terhadap ground truth anomali injeksi pengujian"
                      : "Precision, recall & F1 on injected test benchmark"}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  TEST BENCHMARK
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px]">Precision</span>
                  <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {evalStats.precision}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px]">Recall</span>
                  <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {evalStats.recall}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px]">F1 Score</span>
                  <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {evalStats.f1}%
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                {isId
                  ? "*Catatan Metodologi: Evaluasi pengujian dilakukan pada anomali sintetis untuk mengukur sensitivitas model. Dalam skenario audit dunia nyata, anomali yang tidak diinjeksi tetap memerlukan pertimbangan profesional auditor (professional skepticism)."
                  : "*Methodology note: Injected test anomalies serve solely to validate detection sensitivity. Real-world audits require professional skepticism as legitimate transactions can be statistically atypical."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
