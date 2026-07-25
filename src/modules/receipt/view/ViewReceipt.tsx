import React from "react";
import { Receipt } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { Eye, Printer, X, User } from "lucide-react";

interface ViewReceiptProps {
  matchingReceipts: Receipt[];
  selectedReceipt: Receipt | null;
  onSelectReceipt: (receipt: Receipt | null) => void;
  onClose: () => void;
}

const numberToWords = (num: number): string => {
  if (num === 0) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertThreeDigit = (n: number): string => {
    let word = "";
    if (n >= 100) {
      word += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (word !== "") word += "and ";
      if (n < 20) {
        word += a[n];
      } else {
        word += b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
      }
    }
    return word.trim();
  };

  let word = "";
  let temp = num;

  // 1. Units
  const units = temp % 1000;
  temp = Math.floor(temp / 1000);
  if (units > 0) {
    word = convertThreeDigit(units) + " " + word;
  }
  
  // 2. Thousands
  if (temp > 0) {
    const thousands = temp % 100;
    temp = Math.floor(temp / 100);
    if (thousands > 0) {
      word = convertThreeDigit(thousands) + " Thousand " + word;
    }
  }

  // 3. Lakhs
  if (temp > 0) {
    const lakhs = temp % 100;
    temp = Math.floor(temp / 100);
    if (lakhs > 0) {
      word = convertThreeDigit(lakhs) + " Lakh " + word;
    }
  }

  // 4. Crores
  if (temp > 0) {
    const crores = temp % 100;
    temp = Math.floor(temp / 100);
    if (crores > 0) {
      word = convertThreeDigit(crores) + " Crore " + word;
    }
  }

  return (word.trim() + " Rupees Only").replace(/\s+/g, " ");
};

const numberToWordsMarathi = (num: number): string => {
  if (num === 0) return "शून्य रुपये फक्त";
  const units = [
    "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ", "दहा",
    "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस", "वीस",
    "एकवीस", "बावीस", "तेवीस", "चौवीस", "पंचवीस", "सव्वीस", "सत्तावीस", "अठ्ठावीस", "एकोणतीस", "तीस",
    "एकतीस", "बत्तीस", "तेहतीस", "चौतीस", "पस्तीस", "छत्तीस", "सदुतीस", "अडतीस", "एकोणचाळीस", "चाळीस",
    "एकचाळीस", "बेचाळीस", "तेचाळीस", "चौवेचाळीस", "पंचेचाळीस", "सेचाळीस", "सत्तेचाळीस", "अठ्ठेचाळीस", "एकोणपन्नास", "पन्नास",
    "एकपन्नास", "बावन", "त्रिपन्न", "चौपन", "पंचावन", "छप्पन्न", "सत्तावन", "अठ्ठावन", "एकोणसाठ", "साठ",
    "एकसठ", "बाइसठ", "त्रेसठ", "चौसठ", "पायसठ", "सहासठ", "सडसठ", "अडसठ", "एकोणसत्तर", "सत्तर",
    "एकहत्तर", "बाहत्तर", "त्र्याहत्तर", "चौऱ्याहत्तर", "पंच्याहत्तर", "शहात्तर", "सत्याहत्तर", "अठ्ठ्याहत्तर", "एकोणऐंशी", "ऐंशी",
    "एक्याऐंशी", "ब्याऐंशी", "त्र्याऐंशी", "चौऱ्याऐंशी", "पंच्याऐंशी", "शहाऐंशी", "सत्याऐंशी", "अठ्ठ्याऐंशी", "एकोणनव्वद", "नव्वद",
    "एक्याण्णव", "ब्याण्णव", "त्र्याण्णव", "चौऱ्याण्णव", "पंच्याण्णव", "शहाण्णव", "सत्याण्णव", "अठ्ठ्याण्णव", "नव्व्याण्णव"
  ];

  const convertLessThanHundred = (n: number): string => {
    return units[n];
  };

  const convertThreeDigit = (n: number): string => {
    let word = "";
    if (n >= 100) {
      word += units[Math.floor(n / 100)] + " शे ";
      n %= 100;
    }
    if (n > 0) {
      word += convertLessThanHundred(n);
    }
    return word.trim();
  };

  let word = "";
  let temp = num;

  const u = temp % 1000;
  temp = Math.floor(temp / 1000);
  if (u > 0) {
    if (u < 100) {
      word = convertLessThanHundred(u);
    } else {
      word = convertThreeDigit(u);
    }
  }

  // Thousands
  if (temp > 0) {
    const thousands = temp % 100;
    temp = Math.floor(temp / 100);
    if (thousands > 0) {
      word = convertLessThanHundred(thousands) + " हजार " + word;
    }
  }

  // Lakhs
  if (temp > 0) {
    const lakhs = temp % 100;
    temp = Math.floor(temp / 100);
    if (lakhs > 0) {
      word = convertLessThanHundred(lakhs) + " लाख " + word;
    }
  }

  // Crores
  if (temp > 0) {
    const crores = temp % 100;
    temp = Math.floor(temp / 100);
    if (crores > 0) {
      word = convertLessThanHundred(crores) + " कोटी " + word;
    }
  }

  return (word.trim() + " रुपये फक्त").replace(/\s+/g, " ");
};

export const ViewReceipt: React.FC<ViewReceiptProps> = ({
  matchingReceipts,
  selectedReceipt,
  onSelectReceipt,
  onClose,
}) => {
  const { t } = useAuth();
  const isMarathi = t("nav.dashboard") === "मुख्य डॅशबोर्ड";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Print Style Injector */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .print-receipt-modal, .print-receipt-modal * {
            visibility: visible;
          }
          .print-receipt-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10mm 15mm !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Specificity overrides to ensure black text inside print layout in dark mode */
          .print-receipt-modal,
          .print-receipt-modal *,
          .dark .print-receipt-modal,
          .dark .print-receipt-modal * {
            color: #000000 !important;
            border-color: #d1d5db !important;
          }
          .print-receipt-modal .text-red-700,
          .print-receipt-modal .text-red-500,
          .print-receipt-modal .text-orange-600,
          .dark .print-receipt-modal .text-red-700,
          .dark .print-receipt-modal .text-red-500,
          .dark .print-receipt-modal .text-orange-600 {
            color: #b91c1c !important;
            border-color: #b91c1c !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {selectedReceipt ? (
        /* 1. SINGLE RECEIPT DETAILED PRINT LAYOUT */
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 dark:border-gray-800 animate-scaleIn print-receipt-modal my-8">
          {/* Modal Header Controls (hidden on print) */}
          <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between shadow-sm no-print">
            <div className="flex items-center gap-2">
              <span>ॐ</span>
              <h3 className="font-bold font-display text-lg text-white">
                {t("receipt.detailsTitle")}: {selectedReceipt.receiptNo}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition cursor-pointer flex items-center gap-1 text-sm font-semibold animate-pulse"
                title="Print / Save PDF"
              >
                <Printer className="h-4 w-4" />
                <span>{isMarathi ? "प्रिंट करा" : "Print"}</span>
              </button>
              {matchingReceipts.length > 1 && (
                <button
                  onClick={() => onSelectReceipt(null)}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition cursor-pointer text-xs font-bold"
                >
                  {isMarathi ? "मागे" : "Back"}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-red-800 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto bg-amber-50/5 text-gray-900 dark:text-gray-100">
            {/* Receipt Header Border Box */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white dark:bg-gray-800 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500"></div>
              <div className="flex-shrink-0 h-16 w-16 bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-2xl shadow-inner">
                ॐ
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 font-display">
                  {t("brand.title")} (Reg. No. E-14023)
                </h2>
                <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Shree Bhairavnath Mandir Trust
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">
                  {isMarathi ? "तळवडे, ता. हवेली, जि. पुणे" : "Talwade, Tal. Haveli, Dist. Pune"}
                </p>
              </div>
            </div>

            {/* Donation Receipt Badge */}
            <div className="text-center py-2">
              <h4 className="text-lg font-black tracking-widest text-red-700 dark:text-red-500 font-display border-b-2 border-red-200 dark:border-red-950/60 inline-block pb-1">
                {isMarathi ? "देणगी पावती" : "DONATION RECEIPT"}
              </h4>
            </div>

            {/* Receipt Metadata */}
            <div className="flex flex-col sm:flex-row sm:justify-between text-sm font-mono text-gray-700 dark:text-gray-300 gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <span className="font-bold">{t("receipt.no")} :</span>{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedReceipt.receiptNo}</span>
              </div>
              <div>
                <span className="font-bold">{isMarathi ? "व्यवहार प्रकार" : "Mode"} :</span>{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedReceipt.paymentMode ? t(selectedReceipt.paymentMode) : (isMarathi ? "रोख (Cash)" : "Cash")}
                </span>
              </div>
              <div>
                <span className="font-bold">{t("field.date")} :</span>{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(selectedReceipt.createdDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Donor Fields Section */}
            <div className="space-y-4 font-mono text-sm">
              <div className="flex flex-col sm:flex-row sm:items-end gap-1">
                <span className="w-36 font-bold text-gray-500 shrink-0">{t("receipt.donorName")}</span>
                <span className="hidden sm:inline mr-2 text-gray-400">:</span>
                <div className="flex-1 border-b border-dashed border-gray-300 dark:border-gray-700 pb-0.5 font-bold text-gray-900 dark:text-gray-100">
                  {selectedReceipt.name}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end gap-1">
                <span className="w-36 font-bold text-gray-500 shrink-0">{t("field.mobile")}</span>
                <span className="hidden sm:inline mr-2 text-gray-400">:</span>
                <div className="flex-1 border-b border-dashed border-gray-300 dark:border-gray-700 pb-0.5 font-bold text-gray-900 dark:text-gray-100">
                  {selectedReceipt.mobile || "________________________________________"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end gap-1">
                <span className="w-36 font-bold text-gray-500 shrink-0">{t("field.address")}</span>
                <span className="hidden sm:inline mr-2 text-gray-400">:</span>
                <div className="flex-1 border-b border-dashed border-gray-300 dark:border-gray-700 pb-0.5 font-bold text-gray-900 dark:text-gray-100 font-mono">
                  {selectedReceipt.address || "________________________________________"}
                </div>
              </div>
            </div>

            {/* Conditional Amount or Food items */}
            {selectedReceipt.reason !== "Food" ? (
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">{t("field.amount")}</p>
                  <div className="inline-block border-4 border-double border-red-700 dark:border-red-500 bg-red-50/30 dark:bg-red-950/20 px-8 py-2.5 text-2xl font-black rounded-lg text-red-700 dark:text-red-400 font-display">
                    ₹ {selectedReceipt.amount?.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">{t("field.amountInWords")}</p>
                  <p className="font-serif italic font-semibold text-gray-800 dark:text-gray-200 text-sm mt-0.5 capitalize bg-gray-50 dark:bg-gray-800/50 py-1.5 px-3 rounded-lg inline-block border border-gray-100 dark:border-gray-800">
                    {isMarathi 
                      ? numberToWordsMarathi(selectedReceipt.amount || 0) 
                      : numberToWords(selectedReceipt.amount || 0)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-4 text-center bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl">
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-gray-500 font-bold">{t("field.foodName")}</span>
                    <span className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1 block">
                      {t(selectedReceipt.foodName || "")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-gray-500 font-bold">{t("receipt.foodQty")}</span>
                    <span className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1 block">
                      {selectedReceipt.foodQty} {isMarathi ? "कि.ग्रॅ." : "KG"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">{t("field.description")}</p>
              <div className="border-b border-dashed border-gray-300 dark:border-gray-700 pb-2 text-sm text-gray-600 dark:text-gray-350 italic min-h-[40px]">
                {selectedReceipt.reason === "Food" 
                  ? (isMarathi 
                      ? "श्री भैरवनाथ मंदिर भंडारा स्वयंपाकघर साठ्यामध्ये पवित्र अन्नधान्य/सामग्रीचे योगदान प्राप्त झाले." 
                      : "Received holy food ingredients contribution at the Shree Bhairavnath Temple Bhandara kitchen storage.")
                  : (isMarathi 
                      ? "मंदिराच्या विकास योजनांसाठी समर्पित पवित्र देणगी/दक्षिणा प्राप्त झाली." 
                      : "Received holy monetary contribution/dakshina dedicated to the developmental schemes of the shrine.")}
              </div>
            </div>

            {/* Uploaded Receipt Preview Image (no-print) */}
            {selectedReceipt.image && (
              <div className="no-print space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block text-center">
                  {t("receipt.proofDoc")}
                </span>
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40 p-2 flex justify-center max-h-[220px]">
                  <img
                    src={selectedReceipt.image}
                    alt="Receipt Scan"
                    className="max-h-[200px] object-contain rounded-lg shadow-2xs"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            {/* Received By and Seals Section */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-dashed border-gray-300 dark:border-gray-700">
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">{t("field.createdBy")}</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200 mt-1 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-gray-400" />
                    {selectedReceipt.createdBy}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">{t("receipt.signature")}</p>
                  <p className="text-gray-400 mt-4 border-b border-gray-400 w-32"></p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-gray-50/50 dark:bg-gray-800/20 relative overflow-hidden">
                <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider mb-2">{t("receipt.stamp")}</p>
                <div className="h-16 w-16 rounded-full border-2 border-dashed border-red-500/40 dark:border-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400 font-black text-[8px] text-center p-1.5 uppercase rotate-12 select-none">
                  {isMarathi ? "मंदिर ट्रस्ट शिक्का" : "Temple Trust Stamp"}
                </div>
              </div>
            </div>

            {/* Bottom Gratitude Line */}
            <div className="text-center pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 space-y-1">
              <p className="text-sm font-bold text-red-700 dark:text-red-400 italic">
                {t("receipt.thankYou")}
              </p>
              <p className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest font-display">
                {t("brand.title")}
              </p>
            </div>
          </div>

          {/* Modal Footer (hidden on print) */}
          <div className="bg-gray-50 dark:bg-gray-800/60 px-6 py-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800/80 no-print">
            {matchingReceipts.length > 1 && (
              <button
                onClick={() => onSelectReceipt(null)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition cursor-pointer"
              >
                {isMarathi ? "मागे जा" : "Back to List"}
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-700/10"
            >
              <Printer className="h-4 w-4" />
              <span>{isMarathi ? "पावती प्रिंट करा" : "Print Receipt"}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition cursor-pointer"
            >
              {t("action.close")}
            </button>
          </div>
        </div>
      ) : (
        /* 2. MULTIPLE MATCHING ENTRIES TABLE VIEW */
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-100 dark:border-gray-800 animate-scaleIn my-8">
          {/* Modal Header */}
          <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span>ॐ</span>
              <h3 className="font-bold font-display text-lg text-white">
                {isMarathi 
                  ? `पावती क्रमांक ${matchingReceipts[0]?.receiptNo} साठी शोधलेल्या नोंदी` 
                  : `Matching Entries for ${matchingReceipts[0]?.receiptNo}`}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-red-800 p-1.5 rounded-full transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Table Body */}
          <div className="p-6 overflow-x-auto bg-amber-50/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">{t("receipt.no")}</th>
                  <th className="px-5 py-3">{t("field.date")}</th>
                  <th className="px-5 py-3">{t("receipt.donorName")}</th>
                  <th className="px-5 py-3">{t("field.reason")}</th>
                  <th className="px-5 py-3 text-right">{t("field.amount")}</th>
                  <th className="px-5 py-3">{t("field.foodName")}</th>
                  <th className="px-5 py-3">{t("receipt.foodQty")}</th>
                  <th className="px-5 py-3 text-center">{t("field.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-sm">
                {matchingReceipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition duration-150 text-gray-700 dark:text-gray-300">
                    <td className="px-5 py-3.5 font-mono font-bold text-red-700 dark:text-red-500">
                      {rec.receiptNo}
                    </td>
                    <td className="px-5 py-3.5 truncate whitespace-nowrap">
                      {new Date(rec.createdDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-gray-100 truncate max-w-[160px]">
                      {rec.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        rec.reason === "Food"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                          : rec.reason.includes("Renovation")
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : rec.reason.includes("Abhishek")
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400"
                          : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                      }`}>
                        {t(rec.reason)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold">
                      {rec.amount !== null ? `₹${rec.amount.toLocaleString("en-IN")}` : <span className="text-gray-450 italic font-normal text-xs">-</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {rec.foodName ? t(rec.foodName) : <span className="text-gray-450 italic text-xs">-</span>}
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {rec.foodQty !== null ? `${rec.foodQty} ${isMarathi ? "कि.ग्रॅ." : "KG"}` : <span className="text-gray-450 italic text-xs">-</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onSelectReceipt(rec)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition cursor-pointer border border-blue-100 dark:border-blue-900/40"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{t("action.view")}</span>
                        </button>
                        <button
                          onClick={() => {
                            onSelectReceipt(rec);
                            setTimeout(() => window.print(), 150);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg transition cursor-pointer border border-red-100 dark:border-red-900/40"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>{isMarathi ? "प्रिंट" : "Print"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 dark:bg-gray-800/60 px-6 py-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800/80">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition cursor-pointer"
            >
              {t("action.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
