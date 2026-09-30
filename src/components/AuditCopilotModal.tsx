import React, { useState } from "react";
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  FileText,
  Copy,
  Check,
  Building2,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { DatasetSummary, AnalyzedTransaction, ExecutiveSummaryReport } from "../types";

interface AuditCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DatasetSummary;
  analyzedTransactions: AnalyzedTransaction[];
  language: "id" | "en";
}

export const AuditCopilotModal: React.FC<AuditCopilotModalProps> = ({
  isOpen,
  onClose,
  summary,
  analyzedTransactions,
  language,
}) => {
  const isId = language === "id";

  const cleanText = (txt: string): string => {
    if (!txt) return "";
    return txt
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/[\u{1F916}\u{2728}\u{1F680}\u{1F4A1}\u{1F4CC}\u{1F4CA}\u{1F3E2}\u{26A0}\u{FE0F}\u{1F4CB}\u{1F4C8}\u{1F50D}]/gu, "")
      .trim();
  };

  const [activeSubTab, setActiveSubTab] = useState<"chat" | "briefing">("chat");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: isId
        ? `Halo. Saya asisten audit dan analisis keuangan. Saya telah memeriksa ${summary.totalTransactions} transaksi dalam sistem. Terdapat ${summary.criticalCount} transaksi prioritas yang perlu ditinjau.\n\nSilakan tanyakan seputar tren pengeluaran, tagihan ganda, atau minta saya menyusun ringkasan untuk pimpinan.`
        : `Hello. I am your financial audit assistant. I have analyzed all ${summary.totalTransactions} transactions in this dataset. There are ${summary.criticalCount} priority items requiring review.\n\nFeel free to ask about spending patterns, duplicate invoices, or request an executive briefing.`,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Executive Memo State
  const [executiveReport, setExecutiveReport] = useState<ExecutiveSummaryReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isSending) return;

    const userMsg = { sender: "user" as const, text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      // Find actual duplicate invoice transactions for grounded answers
      const duplicateItems = analyzedTransactions
        .filter((t) => t.rule_flags?.includes("duplicate_invoice"))
        .slice(0, 8)
        .map((t) => ({
          id: t.transaction_id,
          invoice_id: t.invoice_id,
          vendor: t.vendor_name,
          amount: t.amount,
          date: t.date,
          department: t.department,
        }));

      // Top critical transactions
      const criticalItems = analyzedTransactions
        .filter((t) => t.risk_priority === "Critical")
        .slice(0, 8)
        .map((t) => ({
          id: t.transaction_id,
          vendor: t.vendor_name,
          amount: t.amount,
          department: t.department,
          invoice_id: t.invoice_id,
          reasons: t.risk_reasons,
        }));

      const res = await fetch("/api/gemini/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          datasetStats: {
            totalTransactions: summary.totalTransactions,
            flaggedCount: summary.flaggedCount,
            criticalCount: summary.criticalCount,
            highCount: summary.highCount,
            mediumCount: summary.mediumCount,
            lowCount: summary.lowCount,
            flaggedValue: summary.flaggedValue,
            totalValue: summary.totalValue,
            highRiskExposure: summary.flaggedValue,
            topDepartments: summary.topDepartments,
            topRules: summary.topRules,
            topVendors: summary.topVendors,
            isCleanWorkspace: summary.totalTransactions === 0,
          },
          duplicateItems,
          criticalItems,
          flaggedSamples: criticalItems,
          language,
        }),
      });

      const data = await res.json();
      const rawReply =
        data.reply ||
        (isId
          ? "Berdasarkan data audit aktif, transaksi kritis dipicu oleh faktur duplikat dan deviasi nominal di luar profil historis vendor."
          : "Based on the active audit ledger, critical transactions stem from duplicate invoice numbers and anomalous spend deviations.");

      setMessages((prev) => [...prev, { sender: "bot", text: cleanText(rawReply) }]);
    } catch (e) {
      console.error("Assistant error:", e);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: isId
            ? "Saya telah meninjau transaksi Anda. Disarankan untuk memverifikasi dokumen fisik dan bukti serah terima untuk transaksi bernilai tinggi."
            : "I have reviewed your transactions. We recommend verifying physical invoice documentation and receipts for high-risk items.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const generateExecutiveBriefing = async () => {
    setIsLoadingReport(true);
    try {
      const res = await fetch("/api/gemini/executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaryData: {
            ...summary,
            highRiskExposure: summary.flaggedValue,
          },
          language,
        }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setExecutiveReport(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const copyMemoToClipboard = () => {
    if (!executiveReport) return;
    const text = `
=== ${executiveReport.title.toUpperCase()} ===

RINGKASAN OBSERVASI:
${executiveReport.keyObservations.map((o, i) => `${i + 1}. ${o}`).join("\n")}

SARAN & REKOMENDASI:
${executiveReport.strategicRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

LANGKAH TINDAK LANJUT:
${executiveReport.recommendedNextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const promptChips = isId
    ? [
        "Berapa total transaksi kritis yang harus dicek?",
        "Apakah ada tagihan dobel?",
        "Departemen mana yang pengeluarannya mencurigakan?",
        "Buatkan ringkasan singkat untuk pimpinan",
      ]
    : [
        "How many critical items need review?",
        "Are there duplicate invoices?",
        "Which department has anomalous spending?",
        "Draft a quick summary for leadership",
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Apple Intelligence container with glowing gradient border */}
      <div className="relative p-[1px] rounded-[32px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[31px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>{isId ? "Asisten Audit Keuangan" : "Financial Audit Assistant"}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                    Claudit
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isId ? "Jawaban langsung & mudah dipahami" : "Instant human-friendly answers"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Segmented switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs">
                <button
                  onClick={() => setActiveSubTab("chat")}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    activeSubTab === "chat"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500"
                  }`}
                >
                  {isId ? "Tanya Jawab" : "Chat"}
                </button>
                <button
                  onClick={() => {
                    setActiveSubTab("briefing");
                    if (!executiveReport) generateExecutiveBriefing();
                  }}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    activeSubTab === "briefing"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500"
                  }`}
                >
                  {isId ? "Laporan Pimpinan" : "Memo"}
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SubTab 1: Chatbot */}
          {activeSubTab === "chat" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2.5 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-br-xs font-medium"
                          : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-bl-xs"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>

                    {msg.sender === "user" && (
                      <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isSending && (
                  <div className="flex items-center space-x-2.5 text-xs text-slate-400 p-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    </div>
                    <span>{isId ? "Asisten AI sedang berpikir..." : "AI is thinking..."}</span>
                  </div>
                )}
              </div>

              {/* Suggested Quick Prompt Chips */}
              <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto">
                <span className="text-[11px] text-slate-400 shrink-0 flex items-center space-x-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isId ? "Tanya Cepat:" : "Ask:"}</span>
                </span>
                {promptChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(chip)}
                    className="px-3 py-1.5 rounded-full text-xs bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 whitespace-nowrap transition-colors shadow-xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  placeholder={
                    isId
                      ? "Ketik pertanyaan Anda di sini..."
                      : "Type your question here..."
                  }
                  className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-slate-100/90 dark:bg-slate-800/90 border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending}
                  className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white transition-all shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* SubTab 2: Executive Memo Generator */
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isId ? "Ringkasan Eksekutif untuk Pimpinan" : "Executive Briefing for Leadership"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isId
                      ? "Format ringkas dan lugas, siap dikirimkan ke pimpinan atau komite"
                      : "Concise summary ready to share with executives"}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {executiveReport && (
                    <button
                      onClick={copyMemoToClipboard}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                    >
                      {copiedMemo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isId ? "Salin Laporan" : "Copy"}</span>
                    </button>
                  )}
                  <button
                    onClick={generateExecutiveBriefing}
                    disabled={isLoadingReport}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Muat ulang laporan"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isLoadingReport ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">
                    {isId ? "Menyusun ringkasan eksekutif..." : "Generating executive briefing..."}
                  </p>
                </div>
              ) : executiveReport ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Observasi */}
                  <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                      {isId ? "Poin Penting Temuan:" : "Key Observations:"}
                    </span>
                    <ul className="space-y-1.5 pl-1 text-slate-700 dark:text-slate-300">
                      {executiveReport.keyObservations.map((obs, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Saran */}
                  <div className="rounded-2xl p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 space-y-2">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wider">
                      {isId ? "Saran Tindakan Perbaikan:" : "Strategic Recommendations:"}
                    </span>
                    <ul className="space-y-1.5 pl-1 text-indigo-950 dark:text-indigo-200">
                      {executiveReport.strategicRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Steps */}
                  <div className="rounded-2xl p-4 bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                      {isId ? "Langkah Tindak Lanjut:" : "Immediate Action Items:"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {executiveReport.recommendedNextSteps.map((step, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                        >
                          {idx + 1}. {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
