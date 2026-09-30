import { Transaction } from "../types";

const VENDORS = [
  { id: "VEN001", name: "PT Solusi Cloud Nusantara", category: "IT Infrastructure", baseAvg: 45000000 },
  { id: "VEN002", name: "PT Mitra Logistik Prima", category: "Logistics", baseAvg: 18000000 },
  { id: "VEN003", name: "CV Sumber Berkah Mandiri", category: "Office Supplies", baseAvg: 3500000 },
  { id: "VEN004", name: "PT Digital Kreasi Media", category: "Marketing & Media", baseAvg: 28000000 },
  { id: "VEN005", name: "KAP Tanuredja & Rekan (Consulting)", category: "Professional Services", baseAvg: 85000000 },
  { id: "VEN006", name: "PT Bina Sarana Graha", category: "Facilities", baseAvg: 22000000 },
  { id: "VEN007", name: "PT Surya Mandiri Teknik", category: "Facilities", baseAvg: 14000000 },
  { id: "VEN008", name: "PT Nusantara Data Proteksi", category: "IT Infrastructure", baseAvg: 38000000 },
  { id: "VEN009", name: "PT Cakrawala Global Tour", category: "Travel & Entertainment", baseAvg: 12000000 },
  { id: "VEN010", name: "PT Talenta Optima Insani", category: "Human Capital", baseAvg: 32000000 },
  { id: "VEN011", name: "CV Kencana ATK Express", category: "Office Supplies", baseAvg: 2800000 },
  { id: "VEN012", name: "PT Sentosa Ekspedisi Cepat", category: "Logistics", baseAvg: 9500000 },
  { id: "VEN013", name: "PT Cybertronik Solusindo", category: "IT Infrastructure", baseAvg: 55000000 },
  { id: "VEN014", name: "PT Megah Advertising Studio", category: "Marketing & Media", baseAvg: 42000000 },
  { id: "VEN015", name: "CV Karya Bersama Katering", category: "Facilities", baseAvg: 4500000 },
];

const DEPARTMENTS = [
  "Finance",
  "IT & Engineering",
  "Marketing",
  "Operations",
  "HR & General Affairs",
  "Procurement",
  "Legal & Compliance",
];

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Corporate Card",
  "Virtual Account",
  "Direct Debit",
  "Cheque",
];

const ACCOUNTS: Record<string, string> = {
  "IT Infrastructure": "Software & Tech Infrastructure (Capex/Opex)",
  "Logistics": "Freight & Delivery Operational Expense",
  "Office Supplies": "Stationery & Consumables (Opex)",
  "Marketing & Media": "Advertising & Campaign Promotion Expense",
  "Professional Services": "Legal, Tax & Consulting Fees",
  "Facilities": "Office Lease & Building Maintenance",
  "Travel & Entertainment": "Business Travel & Client Entertainment",
  "Human Capital": "Staff Training & Talent Acquisition",
};

const DESCRIPTIONS: Record<string, string[]> = {
  "IT Infrastructure": [
    "Annual Cloud Infrastructure Server Billing",
    "Database cluster storage upgrade licenses",
    "Endpoint security enterprise subscription renewal",
    "Network firewall appliance warranty maintenance",
  ],
  "Logistics": [
    "Domestic cargo shipping for regional warehouse transfer",
    "Express courier distribution for retail branches",
    "Fleet fuel and road transportation freight charge",
    "Customs clearance fee for imported test equipment",
  ],
  "Office Supplies": [
    "Monthly printing paper and ink toner replenishment",
    "Ergonomic stationery accessories for workstation",
    "Pantry supplies and cleaning consumable procurement",
    "Archive filing boxes and barcode labeling supplies",
  ],
  "Marketing & Media": [
    "Digital ad placements for Q2 product launch campaign",
    "Influencer agency sponsorship management retainer",
    "Exhibition booth production and staging fabrication",
    "Creative studio branding video production retainer",
  ],
  "Professional Services": [
    "Quarterly internal control advisory & transfer pricing audit",
    "Corporate legal contract notarization and compliance review",
    "Penetration testing & cybersecurity risk audit engagement",
    "Tax consultation fee regarding cross-border withholding tax",
  ],
  "Facilities": [
    "HVAC air conditioning monthly maintenance & repair",
    "HQ building access door card system servicing",
    "Office janitorial cleaning contract for current month",
    "Fire extinguisher system compliance inspection and test",
  ],
  "Travel & Entertainment": [
    "Executive business airfare tickets for client roadshow",
    "Regional branch audit inspection hotel accommodation",
    "Client executive dinner following contract signing ceremony",
    "Car rental reimbursement for field inspection staff",
  ],
  "Human Capital": [
    "Certified ethical hacker training workshop fees",
    "Executive recruitment search fee for Principal Architect",
    "Annual employee wellness health checkup program",
    "Leadership offsite seminar venue reservation",
  ],
};

// Deterministic Pseudo-Random Generator for reproducible evaluation datasets
function pseudoRandom(seed: number) {
  let s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
}

export function generateSyntheticTransactions(count: number = 800): Transaction[] {
  const transactions: Transaction[] = [];
  const invoicePool: string[] = [];

  // Pre-generate normal invoices
  for (let i = 1; i <= Math.floor(count * 0.9); i++) {
    invoicePool.push(`INV-${20260000 + i}`);
  }

  const startDate = new Date(2026, 0, 1).getTime();
  const endDate = new Date(2026, 8, 15).getTime();
  const timeSpan = endDate - startDate;

  for (let i = 0; i < count; i++) {
    const seed = i + 1042;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed * 2 + 1);
    const r3 = pseudoRandom(seed * 3 + 2);
    const r4 = pseudoRandom(seed * 4 + 3);

    const vendor = VENDORS[Math.floor(r1 * VENDORS.length)];
    const department = DEPARTMENTS[Math.floor(r2 * DEPARTMENTS.length)];
    const paymentMethod = PAYMENT_METHODS[Math.floor(r3 * PAYMENT_METHODS.length)];
    const empNum = 100 + Math.floor(r4 * 35);
    const employeeId = `EMP${empNum}`;

    // Date generation
    const txTime = new Date(startDate + r2 * timeSpan);
    const yyyy = txTime.getFullYear();
    const mm = String(txTime.getMonth() + 1).padStart(2, "0");
    const dd = String(txTime.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Base amount calculation with log-normal like variation
    const baseVariance = 0.5 + pseudoRandom(seed * 5 + 4) * 0.9;
    let amount = Math.round((vendor.baseAvg * baseVariance) / 1000) * 1000;

    const descList = DESCRIPTIONS[vendor.category] || ["General procurement expense"];
    const description = descList[Math.floor(pseudoRandom(seed * 6) * descList.length)];

    const txId = `TX${String(i + 1).padStart(6, "0")}`;
    const invoiceId = invoicePool[Math.floor(r3 * invoicePool.length)] || `INV-${20269000 + i}`;

    const tx: Transaction = {
      transaction_id: txId,
      date: dateStr,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      invoice_id: invoiceId,
      category: vendor.category,
      amount,
      employee_id: employeeId,
      department,
      payment_method: paymentMethod,
      account: ACCOUNTS[vendor.category] || "General Operating Expense",
      description,
      is_injected_anomaly: false,
    };

    transactions.push(tx);
  }

  // Inject a controlled subset of synthetic anomalies for testing & evaluation (approx ~5-7% of total)
  // 1. Large Amount Anomalies (excess of normal thresholds)
  const largeIndexes = [12, 45, 98, 142, 215, 310, 480, 620];
  largeIndexes.forEach((idx) => {
    if (transactions[idx]) {
      transactions[idx].amount = 280000000 + (idx * 1500000); // 280M+ IDR
      transactions[idx].is_injected_anomaly = true;
      transactions[idx].anomaly_type = "large_amount";
      transactions[idx].description += " (Urgent executive procurement bypass)";
    }
  });

  // 2. Duplicate Invoice Anomalies
  const duplicatePairs = [
    [24, 75],
    [105, 106],
    [190, 230],
    [340, 395],
    [512, 580],
  ];
  duplicatePairs.forEach(([idx1, idx2], pIdx) => {
    if (transactions[idx1] && transactions[idx2]) {
      const sharedInvoice = `INV-DUP-${9001 + pIdx}`;
      transactions[idx1].invoice_id = sharedInvoice;
      transactions[idx2].invoice_id = sharedInvoice;
      transactions[idx2].vendor_id = transactions[idx1].vendor_id;
      transactions[idx2].vendor_name = transactions[idx1].vendor_name;
      transactions[idx1].is_injected_anomaly = true;
      transactions[idx1].anomaly_type = "duplicate_invoice";
      transactions[idx2].is_injected_anomaly = true;
      transactions[idx2].anomaly_type = "duplicate_invoice";
    }
  });

  // 3. Weekend & Month-End Clusters with Unusual Vendor Multiplier
  const timingIndexes = [33, 89, 167, 288, 412, 555];
  timingIndexes.forEach((idx) => {
    if (transactions[idx]) {
      // Set to month-end Sunday
      transactions[idx].date = "2026-03-29"; // Sunday & 3 days before month end
      transactions[idx].amount = transactions[idx].amount * 5.8; // 5.8x vendor average
      transactions[idx].is_injected_anomaly = true;
      transactions[idx].anomaly_type = "unusual_timing_and_vendor_amount";
      transactions[idx].payment_method = "Cheque";
    }
  });

  // 4. Unusual Department Outlier
  const deptOutlierIndexes = [64, 182, 333, 501];
  deptOutlierIndexes.forEach((idx) => {
    if (transactions[idx]) {
      transactions[idx].department = "HR & General Affairs";
      transactions[idx].category = "IT Infrastructure";
      transactions[idx].amount = 175000000;
      transactions[idx].is_injected_anomaly = true;
      transactions[idx].anomaly_type = "unusual_department_spending";
    }
  });

  return transactions;
}
