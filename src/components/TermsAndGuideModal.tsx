import React, { useState } from "react";
import {
  ShieldAlert,
  BookOpen,
  FileCheck,
  Lock,
  Eye,
  Scale,
  CheckCircle2,
  X,
  AlertTriangle,
  UploadCloud,
  Cpu,
  Search,
  FileText,
  Radio,
  FileSpreadsheet,
  Award,
  Building2,
  HelpCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

interface TermsAndGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "id" | "en";
}

export const TermsAndGuideModal: React.FC<TermsAndGuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isId = language === "id";
  const [activeTab, setActiveTab] = useState<"sop" | "terms">("sop");
  const [activeSopChapter, setActiveSopChapter] = useState<string>("all");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Enterprise Compliance Badges */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0 mt-0.5">
              <Scale className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {isId
                    ? "Pedoman SOP Audit & Syarat Ketentuan Integritas"
                    : "Auditor Standard Operating Procedure (SOP) & Integrity Code"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  DOC: SOP/CLP/IA-2026/049-REV2
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ISA & COSO Compliant</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isId
                  ? "Standar Operasional Prosedur Pengujian Substantif, Investigasi Anomali, dan Kode Etik Auditor Claudit"
                  : "Operational Protocol for Substantive Testing, Anomaly Triage, and Auditor Ethical Governance"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
            title={isId ? "Tutup Dokumen" : "Close Document"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex space-x-3">
          <button
            onClick={() => setActiveTab("sop")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === "sop"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isId ? "1. Panduan Prosedur Standar (SOP Audit Lengkap)" : "1. Standard Operating Procedure (Full SOP)"}</span>
          </button>

          <button
            onClick={() => setActiveTab("terms")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === "terms"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isId ? "2. Kode Etik, Integritas & S&K Hukum" : "2. Ethics, Integrity & Legal Terms"}</span>
          </button>
        </div>

        {/* Main Document Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-7 text-xs sm:text-sm leading-relaxed">
          {activeTab === "sop" ? (
            <div className="space-y-6">
              {/* Document Metadata Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    {isId ? "Nomor Standar" : "Standard No."}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">SOP-AUD-2026-V2</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    {isId ? "Otoritas Penyusun" : "Authorizing Body"}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">PVA Assurance Practice</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    {isId ? "Status Berlaku" : "Effective Date"}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">2026 – Berlaku Aktif</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    {isId ? "Tingkat Kerahasiaan" : "Classification"}
                  </span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Strictly Confidential</span>
                </div>
              </div>

              {/* Section I: Landasan Kepatuhan Standar */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm sm:text-base border-b border-indigo-100 dark:border-indigo-950 pb-1.5">
                  <Award className="w-5 h-5 shrink-0" />
                  <span>{isId ? "BAB I: Landasan Hukum & Standar Profesi Audit" : "CHAPTER I: Legal Foundations & Auditing Standards"}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  {isId
                    ? "SOP ini mengikat seluruh auditor pengguna platform Claudit dalam melaksanakan pemeriksaan keuangan, analitik anomali transaksi, dan investigasi internal berdasarkan kerangka kerja kepatuhan:"
                    : "This SOP binds all auditing personnel utilizing Claudit when executing financial inspections, transaction anomaly analytics, and internal fraud triage in compliance with:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>ISA 240, ISA 315 & ISA 500</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isId
                        ? "Kewajiban menjaga skeptisisme profesional terhadap potensi kecurangan (fraud), penilaian risiko salah saji material, serta kecukupan bukti audit fisik yang relevan dan andal."
                        : "Mandatory professional skepticism regarding potential fraud, material misstatement risk assessment, and sufficiency of competent, reliable audit evidence."}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>COSO Internal Control Framework</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isId
                        ? "Evaluasi menyeluruh terhadap 5 pilar: Lingkungan Pengendalian, Penaksiran Risiko, Aktivitas Pengendalian, Informasi & Komunikasi, serta Pemantauan Berkelanjutan."
                        : "Evaluation across the 5 pillars: Control Environment, Risk Assessment, Control Activities, Information & Communication, and Continuous Monitoring."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section II: Tahapan Prosedur Audit Claudit */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm sm:text-base border-b border-indigo-100 dark:border-indigo-950 pb-1.5">
                  <Layers className="w-5 h-5 shrink-0" />
                  <span>{isId ? "BAB II: 6 Tahap Prosedur Pelaksanaan Audit (Workflow Detail)" : "CHAPTER II: 6-Stage Execution Audit Workflow"}</span>
                </div>

                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 font-bold text-slate-900 dark:text-white">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                          1
                        </span>
                        <span>{isId ? "Fase 1: Ingesti Data & Uji Integritas Rantai Lacak" : "Phase 1: Ledger Ingestion & Chain-of-Custody Verification"}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                        {isId ? "Sebelum Analisis" : "Pre-Audit"}
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 pl-1">
                      <li>{isId ? "Pilih akun kerja pada panel profil: Mode Demo (800 transaksi contoh) atau Akun Bersih (0 transaksi awal untuk klien riil)." : "Select active workspace in profile pill: Demo Engagement (800 synthetic samples) or Clean Workspace (blank canvas for real ledger)."}</li>
                      <li>{isId ? "Unggah file CSV buku besar (General Ledger / Accounts Payable) melalui menu 'Unggah Data'." : "Upload General Ledger or Accounts Payable CSV files through the 'Upload Data' tab."}</li>
                      <li>{isId ? "Sistem secara otomatis memvalidasi kelengkapan kolom wajib (ID Transaksi, Tanggal, Nominal, Vendor, Departemen, No. Faktur) dan melakukan kalkulasi Hash Integritas." : "The engine validates required schema columns (Transaction ID, Date, Amount, Vendor, Department, Invoice ID) and generates integrity verification hashes."}</li>
                    </ul>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 font-bold text-slate-900 dark:text-white">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                          2
                        </span>
                        <span>{isId ? "Fase 2: Eksekusi Deteksi Anomali Ganda (Rules + Machine Learning)" : "Phase 2: Dual-Engine Anomaly Analytics"}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                        Automated ML
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isId
                        ? "Sistem memproses dataset melalui 2 lapisan analitik independen: (1) Mesin aturan kepatuhan deterministik 5-rule untuk mengecek faktur ganda, lonjakan nilai, transaksi di luar jam kerja, dan cutoff tanggal; (2) Model Machine Learning Isolation Forest tanpa supervisi untuk mendeteksi deviasi tersembunyi berdimensi majemuk."
                        : "The engine runs 2 independent analytical layers: (1) Deterministic 5-rule compliance engine checking duplicate invoices, vendor amount outliers, off-hours execution, and cutoff dates; (2) Unsupervised Isolation Forest ML model scoring multi-feature latent deviations."}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 font-bold text-slate-900 dark:text-white">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                          3
                        </span>
                        <span>{isId ? "Fase 3: Triase & Klasifikasi Prioritas Risiko Transaksi" : "Phase 3: Risk Triage & Priority Stratification"}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                        Critical First
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
                        <span className="font-bold text-rose-700 dark:text-rose-400 block">Critical (Skor 80–100)</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          {isId ? "Faktur duplikat atau deviasi ekstrem. Wajib verifikasi fisik sebelum pencairan." : "Duplicate invoice or severe outlier. Mandatory pre-disbursement verification."}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                        <span className="font-bold text-amber-700 dark:text-amber-400 block">High & Medium (Skor 40–79)</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          {isId ? "Transaksi akhir pekan, nilai mendekati limit otorisasi. Pengujian sampel terfokus." : "Weekend transaction, near-threshold amount. Focused sample testing."}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Low (Skor 0–39)</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          {isId ? "Transaksi rutin sesuai profil historis wajar. Dokumentasi standar." : "Routine transaction consistent with baseline profile. Standard filing."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 font-bold text-slate-900 dark:text-white">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                          4
                        </span>
                        <span>{isId ? "Fase 4: Prosedur Pengujian Substantif Lapangan (3-Way Matching)" : "Phase 4: Substantive Vouching & Field Examination"}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-250 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                        Field Testing
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 pl-1">
                      <li>{isId ? "Pemeriksaan 3-Way Matching: Cocokkan Surat Pesanan (PO), Faktur Pajak/Komersial Asli, dan Berita Acara Serah Terima (BAST)." : "3-Way Matching Test: Reconcile Purchase Order (PO), Vendor Commercial Invoice, and Goods Receipt Note (GRN/BAST)."}</li>
                      <li>{isId ? "Verifikasi Rekening Koran: Pastikan dana belum didebit dua kali pada kasus nomor faktur yang sama." : "Bank Reconciliation: Verify disbursement bank statement to ensure dual-debit has not materialized on duplicate invoice numbers."}</li>
                      <li>{isId ? "Konfirmasi Eksternal: Lakukan konfirmasi tertulis kepada vendor terkait keabsahan pesanan dan saldo piutang." : "External Confirmation: Issue written third-party inquiries to vendors regarding purchase validity and outstanding balances."}</li>
                    </ul>
                  </div>

                  {/* Step 5 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 font-bold text-slate-900 dark:text-white">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                          5
                        </span>
                        <span>{isId ? "Fase 5: Investigasi Khusus, Tanya Jawab AI & Wawancara" : "Phase 5: Investigation Drawer & AI Copilot Consultation"}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                        Interview Protocol
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isId
                        ? "Klik transaksi pada tabel untuk membuka Laci Investigasi. Manfaatkan tab 'Pertanyaan Wawancara' untuk memperoleh draf panduan tanya-jawab non-accusatory kepada staf terkait, serta manfaatkan Asisten AI untuk menyusun ringkasan eksekutif cepat."
                        : "Click any record to access the Investigation Drawer. Leverage the 'Interview Guide' tab for objective, non-accusatory inquiry scripts and consult the AI Assistant for executive briefing memos."}
                    </p>
                  </div>

                  {/* Step 6 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 font-bold text-slate-900 dark:text-white">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                          6
                        </span>
                        <span>{isId ? "Fase 6: Dokumentasi Kertas Kerja Audit (KKA) & Ekspor Laporan" : "Phase 6: Workpaper Archiving & CSV Export"}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Final Deliverable
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isId
                        ? "Seluruh temuan wajib diarsipkan dengan format nomor KKA resmi (KKA-REF-2026-[DEPT]-[TXID]). Klik tombol 'Unduh CSV' untuk mengekspor data lengkap dengan skor risiko, alasan bendera merah, dan indeks transaksi untuk dilampirkan ke Laporan Hasil Pemeriksaan (LHP)."
                        : "All findings must be indexed with standard workpaper reference codes. Click 'Export CSV' to produce the formal audited ledger containing calculated risk scores, red flag reasons, and anomaly flags for formal engagement files."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section III: Special Case Procedures */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm sm:text-base border-b border-indigo-100 dark:border-indigo-950 pb-1.5">
                  <FileCheck className="w-5 h-5 shrink-0" />
                  <span>{isId ? "BAB III: Protokol Tanggap Anomali Khusus (Spesifik Kasus)" : "CHAPTER III: Protocols for Specific Anomaly Scenarios"}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
                    <h5 className="font-bold text-rose-600 dark:text-rose-400">
                      {isId ? "1. Protokol Temuan Faktur Duplikat (Duplicate Invoice Number)" : "1. Duplicate Invoice Number Protocol"}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300">
                      {isId
                        ? "Tindakan: Segera terbitkan memo penahanan pembayaran (payment hold). Lakukan rekonsiliasi mutasi rekening koran 3 bulan terakhir. Jika dana telah ditransfer dua kali, terbitkan Surat Permintaan Pengembalian Kelebihan Pembayaran / Nota Kredit dalam tempo 3x24 jam."
                        : "Action: Immediately issue a payment stop notice. Reconcile bank debit ledger over the preceding 3 months. If duplicate disbursement materialized, issue a formal Recovery Demand Notice or Credit Memo within 3 business days."}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
                    <h5 className="font-bold text-amber-600 dark:text-amber-400">
                      {isId ? "2. Protokol Lonjakan Nilai Transaksi Melampaui Rata-Rata Vendor" : "2. Vendor Outlier Amount Spike Protocol"}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300">
                      {isId
                        ? "Tindakan: Periksa Berita Acara Rapat Direksi atau persetujuan adendum kontrak. Cek apakah terjadi pemecahan transaksi (smurfing / invoice splitting) untuk menghindari batasan otorisasi persetujuan Direktur Keuangan."
                        : "Action: Inspect Board minutes or contract addenda. Evaluate whether invoice splitting was employed to circumvent departmental delegation-of-authority (DOA) thresholds."}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
                    <h5 className="font-bold text-indigo-600 dark:text-indigo-400">
                      {isId ? "3. Protokol Transaksi Akhir Pekan / Luar Jam Kerja (Off-Hours)" : "3. Off-Hours & Weekend Transaction Protocol"}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300">
                      {isId
                        ? "Tindakan: Pastikan transaksi memiliki justifikasi kebutuhan operasional mendesak (emergency purchase justification) dan log persetujuan manual kepala divisi bersangkutan."
                        : "Action: Verify formal emergency requisition forms and validate manager overtime access logs approving the release of off-schedule commitments."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alert Callout */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 flex items-start space-x-3 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm">
                    {isId ? "Prinsip Pertimbangan Profesional (Professional Judgment Mandate)" : "Professional Judgment Mandate"}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300/90">
                    {isId
                      ? "Claudit dirancang sebagai alat bantu analitik berbantuan AI. Skor risiko dan bendera anomali merupakan indikasi awal (red flags) dan TIDAK menggantikan verifikasi substantif auditor bersertifikasi."
                      : "Claudit is an augmented audit analytics platform. Risk scores and anomaly flags are preliminary indicators (red flags) and do not substitute the formal substantive testing of a certified auditor."}
                  </p>
                </div>
              </div>

              {/* Terms Articles */}
              <div className="space-y-5">
                {/* Article 1 */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Lock className="w-4 h-4" />
                    <span>{isId ? "Pasal 1: Integritas Bukti & Larangan Keras Manipulasi Algoritma" : "Article 1: Evidence Integrity & Anti-Tampering Mandate"}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    {isId
                      ? "Auditor dan pengguna platform dilarang keras mengubah bobot aturan (scoring weights), merekayasa parameter deteksi, atau memanipulasi file CSV mentah dengan maksud menyembunyikan temuan fraud, memutihkan transaksi pihak terafiliasi, atau mengaburkan tagihan ganda (duplicate invoices). Setiap perubahan bobot terekam dalam log audit kepatuhan."
                      : "Users and auditing personnel are strictly prohibited from modifying scoring threshold weights, altering detection parameters, or falsifying raw ledger imports to suppress fraud findings, whiten related-party transactions, or conceal duplicate invoices. All threshold changes are recorded in tamper-evident system logs."}
                  </p>
                </div>

                {/* Article 2 */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Eye className="w-4 h-4" />
                    <span>{isId ? "Pasal 2: Kerahasiaan Data Finansial & Standar UU PDP" : "Article 2: Financial Confidentiality & Data Privacy Compliance"}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    {isId
                      ? "Seluruh data transaksi, nama vendor, nomor rekening perbankan, dan dokumen bukti bersifat rahasia tingkat tinggi (Strictly Confidential). Pengguna tunduk pada Kode Etik Akuntan Publik Indonesia (IAPI/IFAC) serta UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Dilarang menyebarkan atau mengekspor data ke pihak yang tidak berhak."
                      : "All transaction registers, vendor credentials, bank details, and audit workpapers are strictly classified. Users are bound by international codes of ethics (IESBA/IIA) and applicable data protection statutes. Transmission or unauthorized disclosure of audit workpapers to third parties is strictly prohibited."}
                  </p>
                </div>

                {/* Article 3 */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Scale className="w-4 h-4" />
                    <span>{isId ? "Pasal 3: Tanggung Jawab Opini & Legalitas Lisensi Platform" : "Article 3: Opinion Accountability & Exclusive Platform Licensing"}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    {isId
                      ? "Platform Claudit beroperasi di bawah lisensi resmi dan hak kekayaan intelektual atas nama Priscilla Valencia Andow (2026). Hasil analitik dan ringkasan eksekutif AI harus selalu direviu, divalidasi, dan ditandatangani oleh Auditor Penanggung Jawab (Lead Partner) sebelum diterbitkan dalam Laporan Audit Independen."
                      : "The Claudit platform operates under the exclusive intellectual property and governance license of Priscilla Valencia Andow (2026). Analytical outputs and AI summaries must always be reviewed, confirmed, and signed by an authorized Engagement Partner before issuance."}
                  </p>
                </div>

                {/* Article 4 */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{isId ? "Pasal 4: Sanksi Administratif & Konsekuensi Hukum" : "Article 4: Disciplinary Sanctions & Legal Liability"}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    {isId
                      ? "Pelanggaran terhadap integritas data, pembocoran rahasia perusahaan klien, atau pemalsuan kertas kerja audit dapat dikenakan tindakan pemutusan hak akses seketika, pelaporan kepada asosiasi profesi (IAPI/IIA), serta penuntutan ganti rugi perdata dan pidana berdasarkan peraturan perundang-undangan yang berlaku."
                      : "Violation of data integrity, breach of client confidentiality, or willful falsification of audit workpapers will result in immediate revocation of platform credentials, referral to professional disciplinary bodies, and civil or criminal prosecution under applicable laws."}
                  </p>
                </div>
              </div>

              {/* Official Seal Attribution */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    PA
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">
                      Priscilla Valencia Andow
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Lead Senior Auditor • Claudit Platform Creator & Licensee
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  ✓ VERIFIED & BINDING
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 text-center sm:text-left flex items-center space-x-2">
            <Scale className="w-3.5 h-3.5 text-indigo-500" />
            <span>© 2026 Priscilla Valencia Andow • Cloud Audit Analytics Platform</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isId ? "Saya Mengerti & Siap Mematuhi SOP" : "I Understand & Comply With SOP"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
