import React from "react";
import {
  Sparkles,
  LayoutDashboard,
  Search,
  Radio,
  FolderUp,
  Download,
  ShieldCheck,
  Languages,
  User,
  Scale,
  ChevronDown,
  LogIn,
} from "lucide-react";
import { UserAccount } from "../types";

interface NavbarProps {
  activeTab: "overview" | "findings" | "realtime" | "data" | "copilot";
  setActiveTab: (tab: "overview" | "findings" | "realtime" | "data" | "copilot") => void;
  language: "id" | "en";
  setLanguage: (lang: "id" | "en") => void;
  totalTransactions: number;
  criticalCount: number;
  isStreaming: boolean;
  onExportCSV: () => void;
  onOpenCopilot: () => void;
  activeAccount: UserAccount | null;
  onOpenAccountSwitcher: () => void;
  onOpenTerms: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  totalTransactions,
  criticalCount,
  isStreaming,
  onExportCSV,
  onOpenCopilot,
  activeAccount,
  onOpenAccountSwitcher,
  onOpenTerms,
}) => {
  const isId = language === "id";

  const tabs = [
    {
      id: "overview" as const,
      label: isId ? "Ringkasan" : "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "findings" as const,
      label: isId ? "Daftar Transaksi" : "Transactions",
      icon: Search,
      badge: criticalCount > 0 ? `${criticalCount}` : undefined,
    },
    {
      id: "realtime" as const,
      label: isId ? "Pantau Langsung" : "Live Stream",
      icon: Radio,
      pulse: isStreaming,
    },
    {
      id: "data" as const,
      label: isId ? "Unggah Data" : "Upload Data",
      icon: FolderUp,
    },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Identity (Apple sleek style) */}
        <div
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none min-w-0"
          onClick={() => setActiveTab("overview")}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white transition-transform active:scale-95 shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xs sm:text-base tracking-tight text-slate-900 dark:text-white truncate">
                Cloud Audit Analytics
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 shrink-0">
                Claudit
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate hidden xs:block">
              {isId ? "Pemantauan Aliran & Audit Transaksi Cerdas" : "Automated Audit & Real-Time Stream Monitoring"}
            </p>
          </div>
        </div>

        {/* Center: Apple-style Segmented Control Capsule */}
        <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all duration-200 select-none ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}

                {tab.pulse && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Controls, Account Pill & AI Assistant */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* S&K / Auditor Code Button */}
          <button
            onClick={onOpenTerms}
            className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
            title={isId ? "Syarat & Ketentuan Penggunaan Auditor" : "Auditor Code of Ethics & SOP Guide"}
          >
            <Scale className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isId ? "S&K & SOP" : "Ethics & SOP"}</span>
          </button>

          {/* Account Profile / Login Button */}
          {activeAccount ? (
            <button
              onClick={onOpenAccountSwitcher}
              className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition-all text-xs font-medium text-slate-800 dark:text-slate-200"
              title={isId ? "Akun & Sesi Login" : "Account & Login Session"}
            >
              <div
                className={`w-6 h-6 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 text-white ${
                  activeAccount.role === "admin"
                    ? "bg-gradient-to-tr from-indigo-600 to-purple-600"
                    : "bg-gradient-to-tr from-emerald-600 to-teal-600"
                }`}
              >
                {activeAccount.initials || (activeAccount.role === "admin" ? "PA" : "US")}
              </div>
              <div className="hidden sm:flex items-center space-x-1.5 text-left leading-tight">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[105px]">
                  {activeAccount.name.split(" ")[0]}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                    activeAccount.role === "admin"
                      ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  }`}
                >
                  {activeAccount.role}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>
          ) : (
            <button
              onClick={onOpenAccountSwitcher}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              title={isId ? "Masuk ke Akun" : "Log In"}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isId ? "Masuk" : "Log In"}</span>
            </button>
          )}

          {/* Glowing Apple Intelligence Chatbot Button */}
          <button
            onClick={onOpenCopilot}
            className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/15 hover:shadow-indigo-500/30 transition-all active:scale-95"
            title={isId ? "Buka Tanya Jawab AI" : "Open AI Assistant"}
          >
            <div className="px-2.5 sm:px-3 py-1.5 rounded-[15px] bg-white dark:bg-slate-900 flex items-center space-x-1 sm:space-x-1.5 transition-colors group-hover:bg-opacity-95">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
              <span className="text-xs font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:inline">
                {isId ? "Tanya AI" : "Ask AI"}
              </span>
            </div>
          </button>

          {/* Export Report */}
          <button
            onClick={onExportCSV}
            className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            title={isId ? "Unduh data ke file CSV" : "Export data to CSV"}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isId ? "Unduh CSV" : "Export"}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "id" ? "en" : "id")}
            className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center space-x-1 transition-colors"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase text-[10px] sm:text-[11px]">{language}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 overflow-x-auto text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-xl flex items-center space-x-1 whitespace-nowrap text-xs ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1 text-[9px] rounded-full bg-rose-500 text-white">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};

