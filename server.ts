import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // API Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API 1: Personalized Transaction Investigation Recommendation
  app.post("/api/gemini/recommendations", async (req, res) => {
    try {
      const { transaction, role, language = "id" } = req.body;

      if (!transaction) {
        return res.status(400).json({ error: "Transaction data is required" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        // High-quality deterministic fallback recommendation if API key is not configured
        const fallbackId = {
          riskSummary: `Transaksi ${transaction.transaction_id} dengan vendor ${transaction.vendor_name} memiliki skor risiko ${transaction.risk_score}/100 (${transaction.risk_priority} Review Priority). Ditemukan indikasi anomali: ${transaction.risk_reasons?.join(", ") || "Pola tidak lazim"}.`,
          investigationChecklist: [
            "Verifikasi keabsahan Purchase Order (PO) dan Bukti Penerimaan Barang (GRN)",
            "Lakukan konfirmasi independen ke pihak Vendor mengenai nomor invoice dan rincian transaksi",
            "Cek otorisasi persetujuan anggaran dan limit wewenang oleh manajer departemen",
            "Bandingkan dengan riwayat transaksi vendor serupa dalam 6 bulan terakhir",
          ],
          interviewQuestions: [
            `Kepada ${transaction.employee_id} (${transaction.department}): Apa urgensi transaksi senilai Rp ${Number(transaction.amount).toLocaleString("id-ID")} pada tanggal tersebut?`,
            "Apakah ada negosiasi harga khusus atau kontrak payung terdahulu?",
            "Mengapa tanggal dokumen mendekati akhir periode atau akhir pekan?",
          ],
          requiredDocuments: [
            "Surat Perjanjian Kerja / Kontrak Vendor",
            "Faktur Pajak dan Invoice Asli",
            "Berita Acara Serah Terima (BAST)",
            "Formulir Approval Otorisasi Pembayaran",
          ],
          controlImprovement:
            "Terapkan validasi otomatis sistem ERP untuk mencegah double-invoicing dan berlakukan 3-way matching ketat sebelum pencairan dana.",
        };

        const fallbackEn = {
          riskSummary: `Transaction ${transaction.transaction_id} with vendor ${transaction.vendor_name} flagged with risk score ${transaction.risk_score}/100 (${transaction.risk_priority} Review Priority). Primary indicators: ${transaction.risk_reasons?.join(", ") || "Unusual pattern"}.`,
          investigationChecklist: [
            "Verify validity of Purchase Order (PO) and Goods Receipt Note (GRN)",
            "Perform direct confirmation with vendor regarding invoice authenticity",
            "Validate approval matrix and manager spending authorization",
            "Cross-check historical volume and pricing for this vendor class",
          ],
          interviewQuestions: [
            `To Employee ${transaction.employee_id}: What was the business justification for Rp ${Number(transaction.amount).toLocaleString("en-US")} on this date?`,
            "Were competitive quotes obtained prior to procurement?",
            "Can you clarify the proximity of the transaction to accounting period cut-off?",
          ],
          requiredDocuments: [
            "Master Service Agreement / Contract",
            "Original Tax Invoice & Billing Statement",
            "Handover Acceptance Certificate",
            "Payment Voucher & Dual Sign-off Form",
          ],
          controlImprovement:
            "Enforce automated 3-way matching in ERP and implement hard controls on duplicate invoice number ingestion.",
        };

        return res.json({
          success: true,
          recommendation: language === "en" ? fallbackEn : fallbackId,
          source: "heuristic-fallback",
        });
      }

      const prompt = `
You are an expert Senior IT & Financial Auditor and Forensic Analytics Consultant.
Provide a structured, personalized audit investigation plan for this flagged transaction.

Transaction Details:
- ID: ${transaction.transaction_id}
- Date: ${transaction.date}
- Vendor: ${transaction.vendor_name} (${transaction.vendor_id})
- Amount: IDR ${Number(transaction.amount).toLocaleString()}
- Department: ${transaction.department}
- Employee ID: ${transaction.employee_id}
- Invoice ID: ${transaction.invoice_id}
- Payment Method: ${transaction.payment_method}
- Account: ${transaction.account}
- Description: ${transaction.description}
- Audit Rule Score: ${transaction.rule_score}
- ML Anomaly Score: ${transaction.ml_anomaly_score}
- Combined Risk Score: ${transaction.risk_score} (${transaction.risk_priority})
- Flagged Reasons: ${(transaction.risk_reasons || []).join("; ")}
- Auditor Persona / Target Role: ${role || "Lead Financial Auditor"}
- Language: ${language === "en" ? "English" : "Indonesian (Bahasa Indonesia yang profesional, formal, dan analitis)"}

Respond ONLY in valid JSON matching this schema:
{
  "riskSummary": "Concise 2-sentence executive rationale of why this specific pattern warrants auditor attention",
  "investigationChecklist": ["Step 1...", "Step 2...", "Step 3...", "Step 4..."],
  "interviewQuestions": ["Specific question for department or employee...", "Specific question for procurement...", "Question for vendor confirmation..."],
  "requiredDocuments": ["Document 1", "Document 2", "Document 3", "Document 4"],
  "controlImprovement": "Concrete internal control recommendation to prevent recurring risk"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);

      return res.json({
        success: true,
        recommendation: parsed,
        source: "gemini-3.8-flash",
      });
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      return res.status(500).json({
        error: "Failed to generate AI recommendations",
        details: error.message,
      });
    }
  });

  // API 2: Executive Financial Briefing & Summary
  app.post("/api/gemini/executive-summary", async (req, res) => {
    try {
      const { summaryData, language = "id" } = req.body;
      const ai = getGeminiClient();

      const formatIDR = (val: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

      const generateFallbackSummary = () => ({
        title: language === "en" ? "Executive Financial Health & Audit Briefing" : "Ringkasan Eksekutif Kesehatan Keuangan & Transaksi",
        keyObservations: language === "en"
          ? [
              `Audited ${summaryData?.totalTransactions || 0} transactions totaling ${formatIDR(summaryData?.totalValue || 0)}.`,
              `${summaryData?.flaggedCount || 0} transactions (${summaryData?.flaggedPercentage || 0}%) require review, representing ${formatIDR(summaryData?.highRiskExposure || 0)} in potential exposure.`,
              `Highest anomaly concentration observed in ${summaryData?.topDepartments?.[0] || "Finance"} department.`,
            ]
          : [
              `Total ${summaryData?.totalTransactions || 0} transaksi berhasil diperiksa dengan total perputaran ${formatIDR(summaryData?.totalValue || 0)}.`,
              `Sebanyak ${summaryData?.flaggedCount || 0} transaksi (${summaryData?.flaggedPercentage || 0}%) perlu diverifikasi, mencakup nilai potensi risiko ${formatIDR(summaryData?.highRiskExposure || 0)}.`,
              `Konsentrasi transaksi yang membutuhkan perhatian tertinggi berada pada divisi ${summaryData?.topDepartments?.[0] || "Keuangan / Operasional"}.`,
            ],
        strategicRecommendations: language === "en"
          ? [
              "Implement 3-way matching automated controls for all vendor billing.",
              "Enforce dual-sign off authorization on vendor invoices exceeding Rp 50M.",
              "Conduct immediate confirmation testing for identified duplicate invoices.",
            ]
          : [
              "Terapkan verifikasi pencocokan otomatis 3 arah (Purchase Order, BAST, dan Faktur).",
              "Wajibkan persetujuan ganda (dual-approval) untuk pengeluaran di atas Rp 50 Juta.",
              "Segera lakukan klarifikasi langsung ke vendor terkait tagihan dengan nomor faktur yang sama.",
            ],
        recommendedNextSteps: language === "en"
          ? [
              "Review the top 5 critical risk transactions with department heads.",
              "Request physical documentation from vendors flagged with duplicate invoices.",
              "Re-evaluate month-end processing cutoffs.",
            ]
          : [
              "Periksa 5 transaksi berisiko tertinggi bersama pimpinan departemen terkait.",
              "Minta bukti fisik dan tanda terima untuk tagihan yang terindikasi ganda.",
              "Evaluasi jadwal persetujuan pengeluaran di masa tutup buku.",
            ],
      });

      if (!ai) {
        return res.json({
          success: true,
          summary: generateFallbackSummary(),
          source: "smart-fallback",
        });
      }

      try {
        const prompt = `
You are an Executive Financial Consultant presenting to Senior Leadership.
Analyze this transaction audit summary and provide an executive-level briefing in plain, human-friendly terms.

Audit Metrics:
- Total Transactions: ${summaryData?.totalTransactions}
- Flagged for Review: ${summaryData?.flaggedCount} (${summaryData?.flaggedPercentage}%)
- Critical Priority Items: ${summaryData?.criticalCount}
- High Priority Items: ${summaryData?.highCount}
- Total Audited Volume: IDR ${summaryData?.totalValue}
- Flagged Exposure: IDR ${summaryData?.highRiskExposure}
- Top Triggered Rules: ${(summaryData?.topRules || []).join(", ")}
- Top Flagged Departments: ${(summaryData?.topDepartments || []).join(", ")}
- Top Flagged Vendors: ${(summaryData?.topVendors || []).join(", ")}
- Target Language: ${language === "en" ? "English" : "Indonesian (Bahasa Indonesia yang santun, jelas, mudah dipahami orang non-IT)"}

Respond ONLY in valid JSON matching this schema:
{
  "title": "Ringkasan Eksekutif Kesehatan Keuangan",
  "keyObservations": ["Observasi 1 jelas dan lugas", "Observasi 2", "Observasi 3"],
  "strategicRecommendations": ["Saran 1 praktis", "Saran 2", "Saran 3"],
  "recommendedNextSteps": ["Langkah 1 mudah dijalankan", "Langkah 2"]
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json({
          success: true,
          summary: parsed,
          source: "gemini-3.8-flash",
        });
      } catch (geminiError) {
        console.warn("Gemini API call failed, using intelligent fallback summary:", geminiError);
        return res.json({
          success: true,
          summary: generateFallbackSummary(),
          source: "smart-fallback",
        });
      }
    } catch (error: any) {
      console.error("Error generating executive summary:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Helper to remove any markdown asterisks and generic AI emojis
  const cleanChatbotText = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "") // remove bold markdown
      .replace(/\*/g, "")   // remove italics/bullet asterisks
      .replace(/^#{1,6}\s+/gm, "") // remove markdown heading hashes
      .replace(/[\u{1F916}\u{2728}\u{1F680}\u{1F4A1}\u{1F4CC}\u{1F4CA}\u{1F3E2}\u{26A0}\u{FE0F}\u{1F4CB}\u{1F4C8}\u{1F50D}\u{1F4B0}\u{1F4B8}\u{1F6E1}\u{1F525}\u{2705}\u{274C}]/gu, "")
      .trim();
  };

  // API 3: Natural Language Financial & Audit AI Assistant
  app.post("/api/gemini/assistant", async (req, res) => {
    try {
      const {
        query = "",
        datasetStats = {},
        duplicateItems = [],
        criticalItems = [],
        flaggedSamples = [],
        language = "en",
      } = req.body;
      const ai = getGeminiClient();

      const formatCurrency = (val: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

      const total = datasetStats.totalTransactions || 0;
      const flagged = datasetStats.flaggedCount || 0;
      const critical = datasetStats.criticalCount || 0;
      const safe = Math.max(0, total - flagged);
      const healthPercent = total > 0 ? Math.round((safe / total) * 100) : 100;
      const exposure = formatCurrency(datasetStats.flaggedValue || datasetStats.highRiskExposure || 0);
      const isClean = total === 0 || datasetStats.isCleanWorkspace;

      const buildSmartFallbackReply = (q: string): string => {
        const lowerQ = q.toLowerCase();

        if (language === "en") {
          // Clean workspace response
          if (isClean) {
            return `Audit Workspace Status: Clean Engagement (0 Transactions Active)
This workspace currently holds zero records.

To proceed with audit analytics:
1. Navigate to 'Upload Data' to import your General Ledger or Accounts Payable CSV file.
2. Or open 'Live Stream' to monitor streaming transaction events in real time.
As soon as transactions are loaded, the system will automatically run rule checks (duplicate invoice, large amount, unusual vendor spikes) and calculate Isolation Forest anomaly scores.`;
          }

          if (lowerQ.includes("duplicate") || lowerQ.includes("invoice") || lowerQ.includes("double")) {
            const dupList = duplicateItems.length > 0
              ? duplicateItems.slice(0, 3).map((d: any) => `- Invoice ${d.invoice_id || "N/A"} (${d.vendor}): ${formatCurrency(d.amount)} on ${d.date || "N/A"}`).join("\n")
              : "- Duplicate invoice rules matched entries with identical invoice numbers from the same vendor.";

            return `Duplicate Invoices Analysis:
${duplicateItems.length > 0 ? `Identified duplicate invoice entries:` : "Identified duplicate entries in the ledger:"}
${dupList}

Auditor Action Plan:
1. Reconcile bank disbursement statements to confirm whether single or dual payments were completed.
2. Contact vendor accounts receivable to verify actual billing submissions.
3. Secure credit memos or reimbursement if dual disbursements occurred.`;
          }

          if (lowerQ.includes("critical") || lowerQ.includes("exposure") || lowerQ.includes("risk") || lowerQ.includes("money") || lowerQ.includes("safe") || lowerQ.includes("how many")) {
            const topCrit = criticalItems.length > 0
              ? criticalItems.slice(0, 3).map((c: any) => `- ${c.id}: ${c.vendor} (${formatCurrency(c.amount)}) - ${c.department}`).join("\n")
              : "";

            return `Transaction Health and Risk Assessment:
- Audited transactions: ${total} total records.
- Safe transactions: ${safe} (${healthPercent}%) verified normal.
- Critical priority: ${critical} transactions representing ${exposure} in potential financial risk.

${topCrit ? `High-priority items requiring immediate review:\n${topCrit}\n` : ""}
Primary risk drivers: Duplicate billing submissions and transactions substantially exceeding historical vendor baselines.`;
          }

          if (lowerQ.includes("department") || lowerQ.includes("dept") || lowerQ.includes("spending")) {
            const depts = datasetStats.topDepartments && datasetStats.topDepartments.length > 0
              ? datasetStats.topDepartments
              : ["Finance", "IT & Engineering", "Marketing"];
            return `Departmental Spend & Risk Concentrations:
The departments exhibiting the highest concentration of flagged items are ${depts.join(", ")}.

Recommendation:
1. Verify department head approvals for expenditures over IDR 50,000,000.
2. Cross-reference purchase orders against formal goods receipt notes.`;
          }

          if (lowerQ.includes("summary") || lowerQ.includes("brief") || lowerQ.includes("memo") || lowerQ.includes("boss") || lowerQ.includes("report") || lowerQ.includes("leadership")) {
            return `Executive Financial Audit Briefing:
- System Health: ${healthPercent}% of records show normal operational parameters (${safe} of ${total} total transactions).
- Risk Exposure: ${flagged} flagged items, with ${critical} critical transactions totaling ${exposure}.
- Core Priorities: Focus on duplicate invoice reconciliations and high-value single transactions in ${(datasetStats.topDepartments || ["Finance"])[0]}.`;
          }

          return `Cloud Audit Assistant:
Currently monitoring ${total} transactions across operational ledgers.
- ${safe} transactions (${healthPercent}%) are safe and verified.
- ${critical} transactions are classified as Critical Priority requiring document inspection.

You can ask about:
- Duplicate invoices and potential duplicate payments
- Critical priority items and total financial exposure
- Departmental anomaly distributions
- Executive briefings for management`;
        } else {
          // Indonesian
          if (isClean) {
            return `Status Ruang Kerja: Akun Bersih (0 Transaksi)
Saat ini belum ada transaksi yang dimuat pada ruang kerja ini.

Langkah untuk memulai audit:
1. Buka tab 'Upload Data' untuk mengunggah file CSV General Ledger atau Accounts Payable.
2. Atau gunakan tab 'Pantau Langsung' untuk streaming transaksi real-time.
Setelah file masuk, 5 aturan audit otomatis dan model Isolation Forest akan langsung memproses skor risiko secara instan.`;
          }

          if (lowerQ.includes("dobel") || lowerQ.includes("duplikat") || lowerQ.includes("invoice") || lowerQ.includes("faktur") || lowerQ.includes("ganda")) {
            const dupList = duplicateItems.length > 0
              ? duplicateItems.slice(0, 3).map((d: any) => `- Faktur ${d.invoice_id || "N/A"} (${d.vendor}): ${formatCurrency(d.amount)} tanggal ${d.date || "N/A"}`).join("\n")
              : "- Terdeteksi tagihan dengan nomor faktur yang persis sama diajukan lebih dari satu kali.";

            return `Analisis Tagihan Dobel (Faktur Duplikat):
${duplicateItems.length > 0 ? `Daftar faktur duplikat yang teridentifikasi:` : "Daftar tagihan duplikat dalam pembukuan:"}
${dupList}

Langkah Tindakan Auditor:
1. Rekonsiliasi rekening koran perbankan untuk memastikan apakah dana terdebit dua kali.
2. Hubungi pihak vendor untuk verifikasi faktur tagihan sebenarnya.
3. Ajukan nota kredit atau pengembalian dana jika pembayaran ganda telah terjadi.`;
          }

          if (lowerQ.includes("kritis") || lowerQ.includes("eksposur") || lowerQ.includes("uang") || lowerQ.includes("risiko") || lowerQ.includes("aman") || lowerQ.includes("total")) {
            const topCrit = criticalItems.length > 0
              ? criticalItems.slice(0, 3).map((c: any) => `- ${c.id}: ${c.vendor} (${formatCurrency(c.amount)}) - Divisi ${c.department}`).join("\n")
              : "";

            return `Ringkasan Kesehatan dan Risiko Transaksi:
- Total transaksi diperiksa: ${total} transaksi.
- Transaksi aman: ${safe} (${healthPercent}%) dalam status normal.
- Prioritas Kritis: ${critical} transaksi dengan nilai potensi risiko ${exposure}.

${topCrit ? `Transaksi kritis teratas yang membutuhkan verifikasi fisik:\n${topCrit}\n` : ""}
Faktor penyebab utama: Indikasi faktur ganda dan nilai pengeluaran yang jauh melampaui riwayat rata-rata vendor.`;
          }

          if (lowerQ.includes("departemen") || lowerQ.includes("divisi") || lowerQ.includes("boros") || lowerQ.includes("terbanyak")) {
            const depts = datasetStats.topDepartments && datasetStats.topDepartments.length > 0
              ? datasetStats.topDepartments
              : ["Finance", "IT & Engineering", "Procurement"];
            return `Konsentrasi Risiko Departemen:
Departemen dengan konsentrasi temuan anomali tertinggi adalah ${depts.join(", ")}.

Rekomendasi Auditor:
1. Pastikan setiap pengeluaran di atas Rp 50 Juta memiliki persetujuan kepala divisi dan Purchase Order resmi.
2. Cocokkan bukti tanda terima serah terima barang (BAST) sebelum pencairan.`;
          }

          if (lowerQ.includes("ringkasan") || lowerQ.includes("memo") || lowerQ.includes("bos") || lowerQ.includes("laporan") || lowerQ.includes("pimpinan")) {
            return `Ringkasan Eksekutif untuk Pimpinan:
- Tingkat Kesehatan: ${healthPercent}% transaksi terpantau aman dan normal (${safe} dari total ${total} transaksi).
- Nilai Potensi Risiko: ${exposure} pada ${critical} transaksi berstatus Kritis.
- Rekomendasi Utama: Segera lakukan klarifikasi nomor faktur ganda pada divisi ${(datasetStats.topDepartments || ["Finance"])[0]}.`;
          }

          return `Asisten Audit Keuangan:
Saat ini memantau ${total} transaksi pada sistem.
- ${safe} transaksi (${healthPercent}%) berstatus aman.
- ${critical} transaksi Kritis membutuhkan pemeriksaan berkas fisik.

Pertanyaan yang dapat diajukan:
- Rincian faktur duplikat atau tagihan ganda
- Daftar transaksi kritis dan total eksposur keuangan
- Analisis pengeluaran per departemen
- Pembuatan ringkasan audit untuk pimpinan`;
        }
      };

      if (!ai) {
        return res.json({
          reply: cleanChatbotText(buildSmartFallbackReply(query)),
          source: "smart-fallback",
        });
      }

      try {
        const prompt = `
You are an expert, highly accurate Senior Financial & Audit Analytics Consultant.
Provide direct, precise, fact-grounded responses in professional business language.

CURRENT WORKSPACE CONTEXT:
- Is Clean Workspace: ${isClean ? "YES (0 records loaded)" : "NO (active audit ledger loaded)"}
- Total Audited Transactions: ${total}
- Safe Transactions: ${safe} (${healthPercent}%)
- Flagged for Review: ${flagged}
- Critical Priority Items: ${critical}
- High Priority Items: ${datasetStats?.highCount || 0}
- Medium Priority Items: ${datasetStats?.mediumCount || 0}
- Potential Financial Exposure: IDR ${datasetStats?.flaggedValue || 0}
- Top Departments Flagged: ${JSON.stringify(datasetStats?.topDepartments || [])}
- Top Triggered Rules: ${JSON.stringify(datasetStats?.topRules || [])}
- Identified Duplicate Invoices: ${JSON.stringify(duplicateItems.slice(0, 5))}
- Top Critical Transactions: ${JSON.stringify(criticalItems.slice(0, 5))}

MANDATORY INSTRUCTIONS:
1. GROUNDING: Answer based strictly on the metrics and transactions provided above. If asked about duplicates or critical items, cite the actual invoice numbers, vendors, and amounts from the context above.
2. CLEAN WORKSPACE: If the workspace is clean (0 records), inform the user that no transactions have been ingested yet, and explain that they can upload a CSV via 'Upload Data' or stream transactions in 'Live Stream'.
3. NO ASTERISKS: STRICTLY NEVER output double asterisks (**) or markdown bold. Do not use single asterisks (*) for formatting. Use plain words.
4. NO AI EMOJIS: STRICTLY DO NOT output any emojis (no robots, sparkles, rockets, bulbs, pins, or warning symbols).
5. FORMATTING: Use clean line breaks, plain capitalized headings, and clean hyphens (-) for lists.
6. LANGUAGE: Answer in ${language === "en" ? "fluent, professional English" : "Bahasa Indonesia yang santun, objektif, dan profesional"}.

User Question: "${query}"
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            temperature: 0.2,
          },
        });

        const replyText = response.text?.trim();
        if (!replyText) {
          return res.json({ reply: cleanChatbotText(buildSmartFallbackReply(query)), source: "smart-fallback" });
        }

        return res.json({
          reply: cleanChatbotText(replyText),
          source: "gemini-3.8-flash",
        });
      } catch (geminiError) {
        console.warn("Gemini API call failed in assistant, using smart fallback reply:", geminiError);
        return res.json({
          reply: cleanChatbotText(buildSmartFallbackReply(query)),
          source: "smart-fallback",
        });
      }
    } catch (error: any) {
      console.error("Error in audit assistant:", error);
      return res.json({
        reply: "The audit assistant is ready. Please submit your inquiry or select a suggested topic.",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Audit Analytics Platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
