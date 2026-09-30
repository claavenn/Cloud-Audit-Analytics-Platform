import React from "react";
import { ShieldCheck, Scale, FileText, Cloud, CheckCircle2 } from "lucide-react";

interface FooterProps {
  onOpenTerms: () => void;
  language: "id" | "en";
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerms, language }) => {
  const isId = language === "id";

  return (
    <footer className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-lg transition-colors py-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & License */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Cloud Audit Analytics Platform (Claudit)
            </span>
          </div>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

          <span className="font-medium text-slate-600 dark:text-slate-300">
            © 2026 <strong className="text-slate-900 dark:text-white font-bold">Priscilla Valencia Andow</strong>. All rights reserved.
          </span>
        </div>

        {/* Links & Compliance Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs">
          <button
            onClick={onOpenTerms}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors border border-slate-200/70 dark:border-slate-700/70 shadow-2xs"
          >
            <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isId ? "S&K & Panduan SOP Auditor" : "Auditor Code, Terms & SOP Guide"}</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Cloud className="w-3.5 h-3.5" />
            <span>Google Cloud Run (asia-southeast1)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
