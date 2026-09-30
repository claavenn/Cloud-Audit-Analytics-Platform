import React, { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { FindingsTable } from "./components/FindingsTable";
import { RealtimeStream } from "./components/RealtimeStream";
import { DataQualityView } from "./components/DataQualityView";
import { TransactionDrawer } from "./components/TransactionDrawer";
import { AuditCopilotModal } from "./components/AuditCopilotModal";
import { InteractiveBackground } from "./components/InteractiveBackground";
import { AccountSwitcherModal } from "./components/AccountSwitcherModal";
import { TermsAndGuideModal } from "./components/TermsAndGuideModal";
import { Footer } from "./components/Footer";
import {
  Transaction,
  AnalyzedTransaction,
  ValidationReport,
  AuditRulesConfig,
  DatasetSummary,
  UserAccount,
} from "./types";
import { generateSyntheticTransactions } from "./data/syntheticGenerator";
import { validateDataset, parseCSVToTransactions, exportTransactionsToCSV } from "./engine/validation";
import { runAuditRules, DEFAULT_RULES_CONFIG } from "./engine/auditRules";
import { trainAndScoreAnomalies } from "./engine/mlEngine";
import { combineAndScorePipeline, generateDatasetSummary } from "./engine/riskScoring";
import { REGISTERED_ACCOUNTS } from "./data/authAccounts";

export default function App() {
  const [language, setLanguage] = useState<"id" | "en">("en");
  const [activeTab, setActiveTab] = useState<"overview" | "findings" | "realtime" | "data" | "copilot">("overview");

  // Standard Website Account Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(REGISTERED_ACCOUNTS[0]);

  // Per-account raw transaction datasets
  const [workspaceDatasets, setWorkspaceDatasets] = useState<Record<string, Transaction[]>>(() => ({
    "admin-priscilla": generateSyntheticTransactions(800),
    "user-auditor": generateSyntheticTransactions(800),
  }));

  const activeUserId = currentUser ? currentUser.id : "admin-priscilla";

  const rawTransactions = useMemo(() => {
    return workspaceDatasets[activeUserId] || workspaceDatasets["admin-priscilla"] || [];
  }, [workspaceDatasets, activeUserId]);

  // Validation Report for active dataset
  const validationReport = useMemo<ValidationReport>(() => {
    return validateDataset(rawTransactions);
  }, [rawTransactions]);

  // Configurable Audit Rules
  const [rulesConfig, setRulesConfig] = useState<AuditRulesConfig>(DEFAULT_RULES_CONFIG);

  // Selected transaction for detail drawer
  const [selectedTransaction, setSelectedTransaction] = useState<AnalyzedTransaction | null>(null);

  // Modals state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Filter state for findings
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("ALL");

  // Pipeline Execution: Run rules, train Isolation Forest ML, combine risk scores
  const analyzedTransactions = useMemo<AnalyzedTransaction[]>(() => {
    if (rawTransactions.length === 0) return [];
    // 1. Audit Rules Engine
    const ruleMap = runAuditRules(rawTransactions, rulesConfig);
    // 2. Unsupervised Isolation Forest ML Engine
    const mlMap = trainAndScoreAnomalies(rawTransactions, ruleMap);
    // 3. Combined Risk Scoring & Explainability
    return combineAndScorePipeline(rawTransactions, ruleMap, mlMap, rulesConfig);
  }, [rawTransactions, rulesConfig]);

  // Dataset Summary
  const datasetSummary = useMemo<DatasetSummary>(() => {
    return generateDatasetSummary(analyzedTransactions);
  }, [analyzedTransactions]);

  // Handlers
  const handleSetRawTransactions = (txs: Transaction[]) => {
    setWorkspaceDatasets((prev) => ({
      ...prev,
      [activeUserId]: txs,
    }));
  };

  const handleUploadDataset = (csvText: string) => {
    const { data, error } = parseCSVToTransactions(csvText);
    if (error || data.length === 0) {
      alert(error || "Failed to import CSV file. Please check format.");
      return;
    }
    handleSetRawTransactions(data);
    setActiveTab("overview");
  };

  const handleReloadSynthetic = () => {
    const freshData = generateSyntheticTransactions(800);
    handleSetRawTransactions(freshData);
  };

  const handleExportCSV = (dataToExport = analyzedTransactions) => {
    const csvStr = exportTransactionsToCSV(dataToExport);
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit_results_${activeUserId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectPriorityFilter = (priority: string) => {
    setSelectedPriorityFilter(priority);
    setActiveTab("findings");
  };

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors antialiased overflow-x-hidden flex flex-col justify-between">
      {/* Subtle Apple-style ambient interactive background */}
      <InteractiveBackground />

      <div className="relative z-10 flex-1">
        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
          setLanguage={setLanguage}
          totalTransactions={datasetSummary.totalTransactions}
          criticalCount={datasetSummary.criticalCount}
          isStreaming={activeTab === "realtime"}
          onExportCSV={() => handleExportCSV()}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          activeAccount={currentUser}
          onOpenAccountSwitcher={() => setIsAccountSwitcherOpen(true)}
          onOpenTerms={() => setIsTermsOpen(true)}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "overview" && (
            <OverviewDashboard
              summary={datasetSummary}
              analyzedTransactions={analyzedTransactions}
              onSelectPriorityFilter={handleSelectPriorityFilter}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              language={language}
            />
          )}

          {activeTab === "findings" && (
            <FindingsTable
              transactions={analyzedTransactions}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              selectedPriorityFilter={selectedPriorityFilter}
              setSelectedPriorityFilter={setSelectedPriorityFilter}
              onExportFilteredCSV={(txs) => handleExportCSV(txs)}
              language={language}
            />
          )}

          {activeTab === "realtime" && (
            <RealtimeStream
              baselineTransactions={rawTransactions}
              onInspectTransaction={(tx) => setSelectedTransaction(tx)}
              language={language}
            />
          )}

          {activeTab === "data" && (
            <DataQualityView
              validationReport={validationReport}
              rulesConfig={rulesConfig}
              onUpdateConfig={setRulesConfig}
              onUploadDataset={handleUploadDataset}
              onReloadSynthetic={handleReloadSynthetic}
              analyzedTransactions={analyzedTransactions}
              language={language}
              userRole={currentUser?.role || "user"}
            />
          )}
        </main>
      </div>

      {/* Persistent Footer with Licensing */}
      <div className="relative z-10">
        <Footer language={language} onOpenTerms={() => setIsTermsOpen(true)} />
      </div>

      {/* Modals & Drawers */}
      <TransactionDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        language={language}
      />

      <AuditCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        summary={datasetSummary}
        analyzedTransactions={analyzedTransactions}
        language={language}
      />

      <AccountSwitcherModal
        isOpen={isAccountSwitcherOpen}
        onClose={() => setIsAccountSwitcherOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        onLogout={() => {
          setCurrentUser(null);
        }}
        language={language}
      />

      <TermsAndGuideModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        language={language}
      />

      {/* Floating Apple Intelligence Assistant Trigger */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="group relative p-[1.5px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
          title={language === "id" ? "Buka Tanya Jawab AI" : "Ask AI Assistant"}
        >
          <div className="px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 flex items-center space-x-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-500 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {language === "id" ? "Tanya Asisten AI" : "Ask AI"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
