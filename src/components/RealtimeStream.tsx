import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Volume2,
  VolumeX,
  PlusCircle,
  Radio,
  Clock,
  Building,
  TrendingUp,
  Sliders,
} from "lucide-react";
import { AnalyzedTransaction, Transaction } from "../types";
import { runAuditRules } from "../engine/auditRules";
import { trainAndScoreAnomalies } from "../engine/mlEngine";
import { combineAndScorePipeline } from "../engine/riskScoring";

interface RealtimeStreamProps {
  baselineTransactions: Transaction[];
  onInspectTransaction: (tx: AnalyzedTransaction) => void;
  language: "id" | "en";
}

export const RealtimeStream: React.FC<RealtimeStreamProps> = ({
  baselineTransactions,
  onInspectTransaction,
  language,
}) => {
  const isId = language === "id";

  const [isStreaming, setIsStreaming] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(2500); // ms
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveStreamQueue, setLiveStreamQueue] = useState<AnalyzedTransaction[]>([]);
  const [liveStats, setLiveStats] = useState({
    receivedCount: 0,
    criticalCount: 0,
    highCount: 0,
    totalVolume: 0,
  });

  const nextIdRef = useRef(9001);

  // Play subtle web audio beep for high-risk alerts
  const playAlertSound = (freq = 880) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Ignore audio failure
    }
  };

  // Generate single realistic incoming transaction
  const generateLiveTransaction = (forceAnomaly = false): Transaction => {
    const idNum = nextIdRef.current++;
    const txId = `TX-LIVE-${idNum}`;
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    const sampleVendors = [
      { id: "VEN001", name: "PT Solusi Cloud Nusantara", category: "IT Infrastructure", avg: 45000000 },
      { id: "VEN002", name: "PT Mitra Logistik Prima", category: "Logistics", avg: 18000000 },
      { id: "VEN003", name: "CV Sumber Berkah Mandiri", category: "Office Supplies", avg: 3500000 },
      { id: "VEN005", name: "KAP Tanuredja & Rekan", category: "Professional Services", avg: 85000000 },
      { id: "VEN009", name: "PT Cakrawala Global Tour", category: "Travel & Entertainment", avg: 12000000 },
    ];

    const depts = ["Finance", "Marketing", "IT & Engineering", "Operations", "Procurement"];
    const vendor = sampleVendors[Math.floor(Math.random() * sampleVendors.length)];
    const dept = depts[Math.floor(Math.random() * depts.length)];

    let amount = Math.round(vendor.avg * (0.6 + Math.random() * 0.8));
    let inv = `INV-LIVE-${1000 + (idNum % 40)}`;

    if (forceAnomaly) {
      const anomalyMode = Math.random();
      if (anomalyMode < 0.5) {
        amount = 320000000; // Large amount anomaly
      } else {
        // Duplicate invoice anomaly
        inv = liveStreamQueue[0]?.invoice_id || `INV-DUP-LIVE-99`;
        amount = vendor.avg * 5.2; // Spiked multiplier
      }
    }

    return {
      transaction_id: txId,
      date: dateStr,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      invoice_id: inv,
      category: vendor.category,
      amount,
      employee_id: `EMP${100 + Math.floor(Math.random() * 30)}`,
      department: dept,
      payment_method: Math.random() > 0.7 ? "Corporate Card" : "Bank Transfer",
      account: "Operational Expense",
      description: forceAnomaly
        ? "Emergency expedited payment authorization"
        : "Standard operational billing invoice",
      is_injected_anomaly: forceAnomaly,
    };
  };

  // Process incoming transaction through audit rule engine + ML scoring
  const processIncomingTransaction = (rawTx: Transaction) => {
    // We analyze the new transaction within the context of recent transactions + baseline
    const combinedContext = [rawTx, ...baselineTransactions.slice(0, 100)];
    const ruleResults = runAuditRules(combinedContext);
    const mlScores = trainAndScoreAnomalies(combinedContext, ruleResults);
    const analyzed = combineAndScorePipeline(combinedContext, ruleResults, mlScores);
    const newlyAnalyzed = analyzed[0];

    if (newlyAnalyzed.risk_priority === "Critical" || newlyAnalyzed.risk_priority === "High") {
      playAlertSound(newlyAnalyzed.risk_priority === "Critical" ? 950 : 650);
    }

    setLiveStreamQueue((prev) => [newlyAnalyzed, ...prev.slice(0, 49)]); // Keep last 50 transactions
    setLiveStats((prev) => ({
      receivedCount: prev.receivedCount + 1,
      criticalCount: prev.criticalCount + (newlyAnalyzed.risk_priority === "Critical" ? 1 : 0),
      highCount: prev.highCount + (newlyAnalyzed.risk_priority === "High" ? 1 : 0),
      totalVolume: prev.totalVolume + newlyAnalyzed.amount,
    }));
  };

  // Streaming Interval
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // 12% probability of generating natural anomaly in stream
      const isAnomaly = Math.random() < 0.12;
      const tx = generateLiveTransaction(isAnomaly);
      processIncomingTransaction(tx);
    }, streamSpeed);

    return () => clearInterval(interval);
  }, [isStreaming, streamSpeed, baselineTransactions]);

  const handleInjectManualAnomaly = () => {
    const forcedTx = generateLiveTransaction(true);
    processIncomingTransaction(forcedTx);
  };

  const formatCurrency = (val: number) => {
    if (!isId) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(val);
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Stream Controls & Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                isStreaming
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              <Radio className={`w-6 h-6 ${isStreaming ? "animate-pulse" : ""}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isId ? "Analisis Data Real-Time (Live Stream)" : "Real-Time Transaction Stream"}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isStreaming
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isStreaming ? (isId ? "LIVE MENGALIR" : "STREAM ACTIVE") : isId ? "JEDA" : "PAUSED"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isId
                  ? "Simulasi aliran transaksi live dari sistem ERP/Payment Gateway dengan evaluasi risiko instan per transaksi"
                  : "Continuous live ingestion simulator evaluating incoming transactions against baseline behavioral thresholds"}
              </p>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3.5 py-1.5 rounded-xl font-medium text-xs flex items-center space-x-1.5 transition-all ${
                isStreaming
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 hover:bg-amber-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>{isId ? "Jeda Aliran" : "Pause Stream"}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{isId ? "Lanjutkan Aliran" : "Resume Stream"}</span>
                </>
              )}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <span className="text-slate-400 px-1 text-[11px]">{isId ? "Interval:" : "Speed:"}</span>
              <button
                onClick={() => setStreamSpeed(1500)}
                className={`px-2 py-1 rounded-lg ${
                  streamSpeed === 1500 ? "bg-white dark:bg-slate-700 font-bold shadow-xs" : "text-slate-400"
                }`}
              >
                1.5s
              </button>
              <button
                onClick={() => setStreamSpeed(2500)}
                className={`px-2 py-1 rounded-lg ${
                  streamSpeed === 2500 ? "bg-white dark:bg-slate-700 font-bold shadow-xs" : "text-slate-400"
                }`}
              >
                2.5s
              </button>
              <button
                onClick={() => setStreamSpeed(4000)}
                className={`px-2 py-1 rounded-lg ${
                  streamSpeed === 4000 ? "bg-white dark:bg-slate-700 font-bold shadow-xs" : "text-slate-400"
                }`}
              >
                4.0s
              </button>
            </div>

            {/* Inject Test Anomaly */}
            <button
              onClick={handleInjectManualAnomaly}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              <span>{isId ? "Inject Anomali Uji" : "Inject Test Outlier"}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
              title={soundEnabled ? "Mute Alert Sounds" : "Unmute Alert Sounds"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear Buffer */}
            <button
              onClick={() => {
                setLiveStreamQueue([]);
                setLiveStats({ receivedCount: 0, criticalCount: 0, highCount: 0, totalVolume: 0 });
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
              title="Reset Live Stream Buffer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Rolling Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            {isId ? "Transaksi Masuk Live" : "Streamed Ingestion"}
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {liveStats.receivedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{isId ? "Di buffer memori" : "Active session count"}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase">
            {isId ? "Anomali Kritis Tercegat" : "Critical Intercepted"}
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {liveStats.criticalCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{isId ? "Skor risiko 80-100" : "High urgency alerts"}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 uppercase">
            {isId ? "Prioritas Tinggi" : "High Priority"}
          </span>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {liveStats.highCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{isId ? "Skor risiko 60-79" : "Elevated risk score"}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            {isId ? "Volume Nilai Live" : "Streamed Value"}
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 truncate">
            {formatCurrency(liveStats.totalVolume)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{isId ? "Akumulasi nilai" : "Total processed volume"}</p>
        </div>
      </div>

      {/* Live Ingestion Feed Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isId ? "Feed Transaksi Masuk Real-Time (50 Terakhir)" : "Real-Time Transaction Event Log"}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {isId ? "Klik transaksi untuk investigasi mendalam" : "Click row to investigate"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">{isId ? "ID & Jam" : "ID & Timestamp"}</th>
                <th className="py-2.5 px-4">{isId ? "Vendor & Invoice" : "Vendor & Invoice"}</th>
                <th className="py-2.5 px-4">{isId ? "Departemen" : "Department"}</th>
                <th className="py-2.5 px-4 text-right">{isId ? "Nilai" : "Amount"}</th>
                <th className="py-2.5 px-4">{isId ? "Pemicu Aturan" : "Rule Trigger"}</th>
                <th className="py-2.5 px-4 text-center">{isId ? "Skor ML" : "ML"}</th>
                <th className="py-2.5 px-4 text-center">{isId ? "Risiko & Prioritas" : "Risk Priority"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {liveStreamQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                    <Radio className="w-6 h-6 mx-auto mb-2 text-slate-400 opacity-50 animate-pulse" />
                    {isId ? "Menunggu aliran transaksi pertama..." : "Waiting for streaming events..."}
                  </td>
                </tr>
              ) : (
                liveStreamQueue.map((tx, idx) => (
                  <tr
                    key={tx.transaction_id + idx}
                    onClick={() => onInspectTransaction(tx)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      tx.risk_priority === "Critical"
                        ? "bg-rose-50/50 dark:bg-rose-950/20"
                        : tx.risk_priority === "High"
                        ? "bg-orange-50/40 dark:bg-orange-950/20"
                        : ""
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                      {tx.transaction_id}
                    </td>

                    <td className="py-2.5 px-4 font-sans">
                      <div className="font-medium text-slate-900 dark:text-white">{tx.vendor_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{tx.invoice_id}</div>
                    </td>

                    <td className="py-2.5 px-4 font-sans text-slate-700 dark:text-slate-300">
                      {tx.department}
                    </td>

                    <td className="py-2.5 px-4 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(tx.amount)}
                    </td>

                    <td className="py-2.5 px-4 font-sans">
                      <div className="flex flex-wrap gap-1">
                        {tx.rule_flags.length === 0 ? (
                          <span className="text-[10px] text-slate-400">Normal</span>
                        ) : (
                          tx.rule_flags.map((f) => (
                            <span
                              key={f}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                            >
                              {f.replace("_", " ")}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {tx.ml_anomaly_score}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-center font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.risk_priority === "Critical"
                            ? "bg-rose-600 text-white"
                            : tx.risk_priority === "High"
                            ? "bg-orange-500 text-white"
                            : tx.risk_priority === "Medium"
                            ? "bg-amber-500 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {tx.risk_score} • {tx.risk_priority}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
