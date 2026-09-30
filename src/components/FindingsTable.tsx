import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  LayoutGrid,
  List,
} from "lucide-react";
import { AnalyzedTransaction, ReviewPriority } from "../types";

interface FindingsTableProps {
  transactions: AnalyzedTransaction[];
  onSelectTransaction: (tx: AnalyzedTransaction) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (priority: string) => void;
  onExportFilteredCSV: (txs: AnalyzedTransaction[]) => void;
  language: "id" | "en";
}

export const FindingsTable: React.FC<FindingsTableProps> = ({
  transactions,
  onSelectTransaction,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  onExportFilteredCSV,
  language,
}) => {
  const isId = language === "id";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Extract unique departments for clean dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.department));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Priority filter
      if (selectedPriorityFilter !== "ALL" && tx.risk_priority !== selectedPriorityFilter) {
        return false;
      }

      // Department filter
      if (selectedDept !== "ALL" && tx.department !== selectedDept) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const match =
          tx.transaction_id.toLowerCase().includes(q) ||
          tx.vendor_name.toLowerCase().includes(q) ||
          tx.invoice_id.toLowerCase().includes(q) ||
          tx.department.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [transactions, selectedPriorityFilter, selectedDept, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Plain language explanation for non-IT users
  const getSimpleReasonBadge = (tx: AnalyzedTransaction) => {
    if (tx.rule_flags.includes("duplicate_invoice")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
          {isId ? "Tagihan Dobel" : "Duplicate Bill"}
        </span>
      );
    }
    if (tx.rule_flags.includes("unusual_vendor_amount")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
          {isId ? `${tx.vendor_amount_ratio}x Lebih Besar dari Biasa` : `${tx.vendor_amount_ratio}x Higher than Avg`}
        </span>
      );
    }
    if (tx.rule_flags.includes("large_amount")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
          {isId ? "Nominal Sangat Besar" : "Large Amount"}
        </span>
      );
    }
    if (tx.risk_priority === "Low") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {isId ? "Wajar & Normal" : "Normal"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
        {isId ? "Perlu Verifikasi" : "Review Required"}
      </span>
    );
  };

  const getPriorityBadge = (p: ReviewPriority) => {
    switch (p) {
      case "Critical":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
            {isId ? "Kritis" : "Critical"}
          </span>
        );
      case "High":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white shadow-xs">
            {isId ? "Waspada" : "High"}
          </span>
        );
      case "Medium":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
            {isId ? "Perhatian" : "Medium"}
          </span>
        );
      case "Low":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {isId ? "Aman" : "Safe"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header (Apple Spotlight style) */}
      <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Spotlight Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                isId
                  ? "Cari nama vendor, nomor invoice, departemen, atau catatan transaksi..."
                  : "Search vendor name, invoice number, department, or note..."
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-100/80 dark:bg-slate-800/80 border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* View Mode Toggle & Export */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "cards"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Tampilan Kartu (Cards)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Tampilan Tabel (Table)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onExportFilteredCSV(filteredTransactions)}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isId ? "Unduh Hasil" : "Export"}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills (Status & Department) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: isId ? "Semua Transaksi" : "All" },
              { id: "Critical", label: isId ? "🔴 Perlu Dicek (Kritis)" : "🔴 Critical" },
              { id: "High", label: isId ? "🟠 Waspada" : "🟠 High" },
              { id: "Medium", label: isId ? "🟡 Perhatian" : "🟡 Medium" },
              { id: "Low", label: isId ? "🟢 Aman & Wajar" : "🟢 Safe" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPriorityFilter(p.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedPriorityFilter === p.id
                    ? "bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-sm font-semibold"
                    : "bg-slate-100/90 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-xs">{isId ? "Departemen:" : "Dept:"}</span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="ALL">{isId ? "Semua Departemen" : "All Departments"}</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content: Cards View (Default, Human-friendly) */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.length === 0 ? (
            <div className="col-span-full rounded-3xl p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {isId ? "Tidak ada transaksi yang cocok dengan filter pencarian." : "No transactions match your search."}
              </p>
            </div>
          ) : (
            paginatedData.map((tx) => (
              <div
                key={tx.transaction_id}
                onClick={() => onSelectTransaction(tx)}
                className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top row: ID, Date, Priority */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{tx.transaction_id}</span>
                    <div>{getPriorityBadge(tx.risk_priority)}</div>
                  </div>

                  {/* Vendor & Amount */}
                  <div className="mt-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tx.vendor_name}
                    </h4>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>

                  {/* Status Reason Pill */}
                  <div className="mt-3">{getSimpleReasonBadge(tx)}</div>

                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>{tx.department}</span>
                    <span className="font-mono text-[11px]">{tx.invoice_id}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">{tx.date}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{isId ? "Lihat Rincian" : "View Details"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View (Compact) */
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200/70 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">{isId ? "ID & Tanggal" : "ID & Date"}</th>
                  <th className="py-3 px-4">{isId ? "Vendor & Invoice" : "Vendor & Invoice"}</th>
                  <th className="py-3 px-4">{isId ? "Departemen" : "Department"}</th>
                  <th className="py-3 px-4 text-right">{isId ? "Nominal Transaksi" : "Amount"}</th>
                  <th className="py-3 px-4">{isId ? "Status & Catatan" : "Status & Note"}</th>
                  <th className="py-3 px-4 text-center">{isId ? "Aksi" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {paginatedData.map((tx) => (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-slate-900 dark:text-white">{tx.transaction_id}</div>
                      <div className="text-[11px] text-slate-400">{tx.date}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{tx.vendor_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{tx.invoice_id}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{tx.department}</td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(tx.amount)}
                    </td>

                    <td className="py-3 px-4">{getSimpleReasonBadge(tx)}</td>

                    <td className="py-3 px-4 text-center">
                      <button className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors">
                        {isId ? "Buka" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="rounded-2xl p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          {isId ? "Menampilkan" : "Showing"}{" "}
          <span className="font-semibold text-slate-800 dark:text-white">
            {filteredTransactions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{" "}
          -{" "}
          <span className="font-semibold text-slate-800 dark:text-white">
            {Math.min(currentPage * pageSize, filteredTransactions.length)}
          </span>{" "}
          {isId ? "dari" : "of"}{" "}
          <span className="font-semibold text-slate-800 dark:text-white">{filteredTransactions.length}</span>{" "}
          {isId ? "transaksi" : "records"}
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
