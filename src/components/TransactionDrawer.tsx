import React, { useState, useEffect } from "react";
import {
  X,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Building,
  CreditCard,
  User,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { AnalyzedTransaction, AIRecommendation } from "../types";

interface TransactionDrawerProps {
  transaction: AnalyzedTransaction | null;
  onClose: () => void;
  language: "id" | "en";
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transaction,
  onClose,
  language,
}) => {
  const isId = language === "id";

  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!transaction) return;

    let isMounted = true;
    setIsLoadingAI(true);
    setRecommendation(null);

    fetch("/api/gemini/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction,
        role: "Financial Auditor",
        language,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.recommendation) {
          setRecommendation(data.recommendation);
        }
      })
      .catch((err) => {
        console.error("AI recommendation error:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingAI(false);
      });

    return () => {
      isMounted = false;
    };
  }, [transaction?.transaction_id, language]);

  if (!transaction) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopySummary = () => {
    if (!recommendation) return;
    const text = `
CATATAN PEMERIKSAAN TRANSAKSI - ${transaction.transaction_id}
Vendor: ${transaction.vendor_name}
Nominal: ${formatCurrency(transaction.amount)}
Status: ${transaction.risk_priority}

RINGKASAN MASALAH:
${recommendation.riskSummary}

LANGKAH PEMERIKSAAN:
${recommendation.investigationChecklist.map((s, i) => `${i + 1}. ${s}`).join("\n")}

PERTANYAAN UNTUK DIKLARIFIKASI:
${recommendation.interviewQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200/60 dark:border-slate-800/60 flex flex-col overflow-hidden">
        {/* Apple-style Drawer Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-semibold text-slate-400">
                {transaction.transaction_id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  transaction.risk_priority === "Critical"
                    ? "bg-rose-500 text-white"
                    : transaction.risk_priority === "High"
                    ? "bg-orange-500 text-white"
                    : transaction.risk_priority === "Medium"
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {transaction.risk_priority === "Critical"
                  ? isId
                    ? "Perlu Diperiksa (Kritis)"
                    : "Critical"
                  : transaction.risk_priority === "High"
                  ? isId
                    ? "Waspada (Tinggi)"
                    : "High Risk"
                  : transaction.risk_priority === "Medium"
                  ? isId
                    ? "Perhatian (Sedang)"
                    : "Medium Risk"
                  : isId
                  ? "Aman & Normal"
                  : "Verified Safe"}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {transaction.vendor_name}
            </h2>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 tracking-tight">
              {formatCurrency(transaction.amount)}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Card: Mengapa Ditandai? (Human explanation) */}
          <div className="rounded-3xl p-5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-3">
            <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>{isId ? "Kenapa Transaksi Ini Perlu Ditinjau?" : "Why was this flagged?"}</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
              {transaction.risk_reasons.map((r, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span className="leading-relaxed font-medium">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card: Rincian Transaksi */}
          <div className="rounded-3xl p-5 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isId ? "Informasi Tagihan" : "Invoice Information"}
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[11px]">{isId ? "Nomor Invoice:" : "Invoice ID:"}</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {transaction.invoice_id}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[11px]">{isId ? "Departemen:" : "Department:"}</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {transaction.department}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[11px]">{isId ? "Tanggal Pengajuan:" : "Date:"}</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {transaction.date}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[11px]">{isId ? "Pengaju (PIC):" : "Employee:"}</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {transaction.employee_id}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-xs">
              <span className="text-slate-400 text-[11px]">{isId ? "Uraian / Deskripsi:" : "Description:"}</span>
              <p className="text-slate-800 dark:text-slate-200 mt-0.5 italic">
                "{transaction.description}"
              </p>
            </div>
          </div>

          {/* Card: Rekomendasi Solusi AI (Personalized Action Plan) */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isId ? "Saran Langkah dari Asisten AI" : "AI Suggested Action Plan"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isId ? "Solusi praktis dan mudah dijalankan" : "Practical step-by-step guidance"}
                </p>
              </div>
            </div>

            {isLoadingAI ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">
                  {isId ? "Menyiapkan saran solusi terbaik untuk Anda..." : "Preparing guidance..."}
                </p>
              </div>
            ) : recommendation ? (
              <div className="space-y-4 text-xs">
                {/* Summary */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-indigo-100 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {recommendation.riskSummary}
                </div>

                {/* Steps Checklist */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isId ? "Apa yang Harus Anda Lakukan?" : "What Should You Do?"}</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {recommendation.investigationChecklist.map((step, idx) => (
                      <li
                        key={idx}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-start space-x-2"
                      >
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clarification questions */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {isId ? "Pertanyaan untuk Ditanyakan ke Vendor / Tim:" : "Clarification Questions:"}
                  </h4>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 italic">
                    {recommendation.interviewQuestions.map((q, idx) => (
                      <li key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                        "{q}"
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopySummary}
                  className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>{isId ? "Tersalin ke Clipboard!" : "Copied to Clipboard!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isId ? "Salin Catatan Tindakan Ini" : "Copy Action Plan"}</span>
                    </>
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            {isId ? "Tutup" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
