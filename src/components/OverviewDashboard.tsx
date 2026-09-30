import React, { useState } from "react";
import {
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Building,
  Calendar,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Search,
  Cloud,
  Server,
  Cpu,
  Radio,
  Zap,
  ChevronDown,
} from "lucide-react";
import { DatasetSummary, AnalyzedTransaction } from "../types";

interface OverviewDashboardProps {
  summary: DatasetSummary;
  analyzedTransactions: AnalyzedTransaction[];
  onSelectPriorityFilter: (priority: string) => void;
  onOpenCopilot: () => void;
  onSelectTransaction: (tx: AnalyzedTransaction) => void;
  onNavigateTab?: (tab: "overview" | "findings" | "realtime" | "data") => void;
  language: "id" | "en";
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  summary,
  analyzedTransactions,
  onSelectPriorityFilter,
  onOpenCopilot,
  onSelectTransaction,
  onNavigateTab,
  language,
}) => {
  const isId = language === "id";

  const safeCount = Math.max(0, summary.totalTransactions - summary.flaggedCount);
  const healthScore =
    summary.totalTransactions > 0
      ? Math.round((safeCount / summary.totalTransactions) * 100)
      : 100;

  const formatCurrency = (val: number) => {
    if (!isId) {
      if (val >= 1_000_000_000) {
        return `IDR ${(val / 1_000_000_000).toFixed(1)}B`;
      }
      if (val >= 1_000_000) {
        return `IDR ${(val / 1_000_000).toFixed(1)}M`;
      }
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(1)} M`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(1)} Jt`;
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Top 3 most urgent transactions for immediate review
  const urgentTransactions = React.useMemo(() => {
    return [...analyzedTransactions]
      .filter((t) => t.risk_priority === "Critical" || t.risk_priority === "High")
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 3);
  }, [analyzedTransactions]);

  // Clean friendly explanation for non-IT users
  const getSimpleReason = (tx: AnalyzedTransaction) => {
    if (tx.rule_flags.includes("duplicate_invoice")) {
      return isId ? "Terdeteksi nomor faktur tagihan ganda (dobel)" : "Duplicate invoice number detected";
    }
    if (tx.rule_flags.includes("unusual_vendor_amount")) {
      return isId
        ? `Nilai transfer ${tx.vendor_amount_ratio}x lebih tinggi dari riwayat biasa`
        : `Transfer is ${tx.vendor_amount_ratio}x higher than typical vendor average`;
    }
    if (tx.rule_flags.includes("large_amount")) {
      return isId ? "Nominal pengeluaran sangat besar" : "Unusually large transaction amount";
    }
    return isId ? "Pola transaksi perlu diverifikasi" : "Transaction pattern requires review";
  };

  const [showCloudDetails, setShowCloudDetails] = useState(false);

  return (
    <div className="space-y-6">
      {/* Cloud Architecture & Deployment Status Banner */}
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg shadow-indigo-950/20 border border-indigo-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm tracking-tight">
                  {isId ? "Arsitektur Cloud Aktif" : "Cloud Native Architecture"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Google Cloud Run (asia-southeast1)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini Flash AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {isId
                  ? "Pemrosesan audit, deteksi anomali real-time, dan inferensi AI berjalan sepenuhnya di infrastruktur cloud tanpa beban di komputer lokal."
                  : "Audit analytics, real-time telemetry ingestion, and AI reasoning execute entirely on secure cloud infrastructure."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCloudDetails(!showCloudDetails)}
            className="self-start md:self-auto px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center space-x-1.5 transition-colors shrink-0"
          >
            <span>{isId ? (showCloudDetails ? "Tutup Rincian" : "Rincian Cloud") : (showCloudDetails ? "Hide Specs" : "Cloud Specs")}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCloudDetails ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Expanded Cloud Infrastructure Details */}
        {showCloudDetails && (
          <div className="mt-4 pt-4 border-t border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                <Server className="w-3.5 h-3.5" />
                <span>Hosting & Compute</span>
              </div>
              <p className="text-slate-200 font-medium">Google Cloud Run</p>
              <p className="text-[11px] text-slate-400">Serverless container auto-scaling in asia-southeast1 region</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Cloud AI Service</span>
              </div>
              <p className="text-slate-200 font-medium">Gemini 2.5 Flash API</p>
              <p className="text-[11px] text-slate-400">Server-side LLM inference for audit briefings & investigations</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                <Radio className="w-3.5 h-3.5" />
                <span>Continuous Ingestion</span>
              </div>
              <p className="text-slate-200 font-medium">Cloud Stream Gateway</p>
              <p className="text-[11px] text-slate-400">REST & Webhook ingestion ready for SAP, NetSuite & Oracle Cloud</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Data Security</span>
              </div>
              <p className="text-slate-200 font-medium">Zero Key Exposure</p>
              <p className="text-[11px] text-slate-400">Reverse-proxied secrets & enterprise cloud sandboxing</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty State when Clean Account has 0 transactions */}
      {summary.totalTransactions === 0 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center max-w-2xl mx-auto space-y-4 my-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isId ? "Ruang Kerja Audit Bersih Siap Digunakan" : "Clean Audit Workspace Ready"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {isId
                ? "Akun ini berada dalam mode kanvas bersih (0 transaksi awal). Data audit dan skor risiko akan langsung aktif setelah Anda mengunggah file pembukuan atau menghubungkan aliran streaming."
                : "This workspace is completely blank (0 initial records). Anomaly detection and analytics will instantly process as soon as you upload a ledger CSV or stream live transactions."}
            </p>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigateTab?.("data")}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95 flex items-center space-x-2"
            >
              <span>{isId ? "Unggah File Ledger (CSV)" : "Upload Ledger CSV"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab?.("realtime")}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center space-x-2"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isId ? "Buka Pantau Langsung" : "Open Live Stream"}</span>
            </button>

            <button
              onClick={onOpenCopilot}
              className="px-4 py-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-colors"
            >
              {isId ? "Konsultasi Asisten AI" : "Ask AI Assistant"}
            </button>
          </div>
        </div>
      )}

      {/* Apple-style Bento Grid Top: Health Score + Quick Stats (Only if data exists) */}
      {summary.totalTransactions > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Card 1: Apple Health Ring / Overall Security Score (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle colorful background blur */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {isId ? "Kesehatan Transaksi" : "Transaction Health"}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center space-x-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isId ? "Status Baik" : "Healthy"}</span>
              </span>
            </div>

            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              {/* Circular Progress Indicator */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100 dark:text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-emerald-500 dark:text-emerald-400 transition-all duration-1000 ease-out"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - healthScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {healthScore}%
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">
                    {isId ? "Aman" : "Safe"}
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {isId ? "Mayoritas Transaksi Wajar" : "Mostly Healthy Finances"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {isId
                    ? `${safeCount} dari ${summary.totalTransactions} transaksi berjalan normal tanpa kejanggalan.`
                    : `${safeCount} of ${summary.totalTransactions} transactions show completely normal activity.`}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {summary.flaggedCount} {isId ? "transaksi perlu ditinjau" : "transactions to review"}
            </span>
            <button
              onClick={() => onSelectPriorityFilter("Critical")}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 shrink-0 ml-2"
            >
              <span>{isId ? "Tinjau Kritis" : "Review Critical"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: 3 Friendly Stat Pills (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Stat A: Total Nilai Uang */}
          <div className="rounded-3xl p-4 sm:p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {isId ? "Total Perputaran" : "Total Audited"}
              </span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="my-2.5 sm:my-3 min-w-0">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {formatCurrency(summary.totalValue)}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {summary.totalTransactions} {isId ? "transaksi tercatat" : "total transactions"}
              </p>
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
              ✓ 100% {isId ? "terindeks sistem" : "indexed"}
            </div>
          </div>

          {/* Stat B: Perlu Dicek (Kritis) */}
          <div
            onClick={() => onSelectPriorityFilter("Critical")}
            className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-rose-50/70 to-white dark:from-rose-950/30 dark:to-slate-900/80 backdrop-blur-xl border border-rose-200/80 dark:border-rose-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between cursor-pointer hover:border-rose-300 transition-all active:scale-[0.98] min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 truncate">
                {isId ? "Perlu Dicek" : "Needs Review"}
              </span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 shrink-0">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="my-2.5 sm:my-3 min-w-0">
              <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight truncate">
                {summary.criticalCount}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                {isId ? "transaksi mendesak" : "urgent items"}
              </p>
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>{isId ? "Buka Sekarang" : "View Now"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Stat C: Total Potensi Risiko */}
          <div className="rounded-3xl p-4 sm:p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {isId ? "Nilai Perhatian" : "Flagged Value"}
              </span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="my-2.5 sm:my-3 min-w-0">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight truncate">
                {formatCurrency(summary.flaggedValue)}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {summary.flaggedCount} {isId ? "total yang ditandai" : "total flagged items"}
              </p>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
              {isId ? "Dapat diklarifikasi" : "Resolvable with review"}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Interactive Apple Intelligence Banner */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl overflow-hidden">
        {/* Soft glowing ambient orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shrink-0">
              <Sparkles className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isId ? "Bingung membaca data? Tanya Asisten AI langsung!" : "Questions about your data? Ask the AI Assistant!"}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                {isId
                  ? "Asisten cerdas kami dapat merangkum temuan mencurigakan, menjelaskan alasan tagihan ganda, atau menyiapkan laporan ringkas untuk pimpinan dengan bahasa yang sangat mudah dipahami."
                  : "Our intelligent assistant explains flagged transactions, duplicate bills, and drafts executive summaries in simple, human language."}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCopilot}
            className="self-start md:self-auto px-5 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-all duration-200 shadow-md active:scale-95 flex items-center space-x-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{isId ? "Buka Tanya Jawab AI" : "Start Chat with AI"}</span>
          </button>
        </div>

        {/* Quick prompt suggestions right on the card */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-400 shrink-0">{isId ? "Coba tanyakan:" : "Suggested:"}</span>
          {[
            isId ? "Berapa transaksi kritis yang harus dicek?" : "How many critical items need review?",
            isId ? "Apakah ada tagihan dobel?" : "Are there duplicate invoices?",
            isId ? "Departemen mana yang pengeluarannya mencurigakan?" : "Which department has anomalies?",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={onOpenCopilot}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Urgent Action Section: Top Items Requiring Review (Only if urgent items exist) */}
      {urgentTransactions.length > 0 && (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {isId ? "Transaksi Prioritas yang Memerlukan Pemeriksaan" : "Priority Items Requiring Your Review"}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              {isId
                ? "Daftar transaksi teratas yang memerlukan konfirmasi bukti fisik atau persetujuan"
                : "Top priority transactions that need document verification or approval confirmation"}
            </p>
          </div>

          <button
            onClick={() => onSelectPriorityFilter("ALL")}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 shrink-0 self-start sm:self-auto"
          >
            <span>
              {isId
                ? `Lihat Semua (${summary.totalTransactions} Transaksi)`
                : `View All (${summary.totalTransactions} Records)`}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {urgentTransactions.map((tx) => (
            <div
              key={tx.transaction_id}
              onClick={() => onSelectTransaction(tx)}
              className="rounded-3xl p-4 sm:p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] sm:text-xs font-semibold text-slate-400">
                    {tx.transaction_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    {isId ? "Prioritas Kritis" : "Critical Priority"}
                  </span>
                </div>

                <div className="mt-2.5 sm:mt-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tx.vendor_name}
                  </h4>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1 break-words">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(tx.amount)}
                  </div>
                </div>

                {/* Friendly explanation pill */}
                <div className="mt-3 p-2 sm:p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{getSimpleReason(tx)}</span>
                </div>
              </div>

              <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] sm:text-xs">
                <span className="text-slate-400 truncate max-w-[120px]">{tx.department}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                  <span>{isId ? "Periksa Transaksi" : "Investigate"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};
