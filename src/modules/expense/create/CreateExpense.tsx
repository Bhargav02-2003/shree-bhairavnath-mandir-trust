import React, { useState, useEffect } from "react";
import { Expense } from "../../../types";
import { ImageUpload } from "../../../components/ImageUpload";
import { X, Save, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./CreateExpense.css";

interface CreateExpenseProps {
  expense?: Expense | null;
  onSave: (data: Partial<Expense>) => Promise<void>;
  onClose: () => void;
}

export const CreateExpense: React.FC<CreateExpenseProps> = ({
  expense,
  onSave,
  onClose,
}) => {
  const { t, user } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Pooja & Vidhi");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [bill, setBill] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const PRESET_CATEGORIES = ["Pooja & Vidhi", "Maintenance", "Annadan Kharcha", "Festival Decorations", "Administrative", "Charity & Welfare"];

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      if (PRESET_CATEGORIES.includes(expense.category)) {
        setCategory(expense.category);
        setCustomCategory("");
      } else {
        setCategory("Other");
        setCustomCategory(expense.category);
      }
      setAmount(expense.amount);
      setDescription(expense.description || "");
      setDate(expense.date);
      setBill(expense.bill);
      setPaymentMode(expense.paymentMode || "Cash");
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setPaymentMode("Cash");
    }
  }, [expense]);

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    const isMarathi = t("nav.dashboard") === "मुख्य डॅशबोर्ड";
    if (!name.trim()) tempErrors.name = isMarathi ? "खर्चाचे नाव आवश्यक आहे" : "Expense name is required";
    if (!category.trim()) tempErrors.category = isMarathi ? "वर्ग आवश्यक आहे" : "Category is required";
    if (category === "Other" && !customCategory.trim()) tempErrors.customCategory = isMarathi ? "कस्टम वर्ग आवश्यक आहे" : "Please specify the category";
    if (!amount || Number(amount) <= 0) tempErrors.amount = isMarathi ? "वैध रक्कम आवश्यक आहे" : "Valid amount is required";
    if (!date) tempErrors.date = isMarathi ? "खर्चाची तारीख आवश्यक आहे" : "Date of expense is required";
    if (!bill) tempErrors.bill = isMarathi ? "खर्चाचे बिल/पावती पुरावा दस्तऐवज आवश्यक आहे" : "Bill / Receipt upload proof is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    const payload: Partial<Expense> & { authorUuid?: string | null } = {
      name: name.trim(),
      category: category === "Other" ? customCategory.trim() : category,
      amount: Number(amount),
      description: description.trim(),
      date,
      bill,
      paymentMode,
      authorUuid: user?.uuid || user?.id || null,
    };

    try {
      await onSave(payload);
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.message || (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खर्च जतन करण्यात आले नाही." : "Failed to save expense log."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-scaleIn">
        
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>ॐ</span>
            <h3 className="font-bold font-display text-lg">
              {expense ? (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खर्च नोंद दुरुस्त करा" : "Modify Expense Entry") : (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "नवीन खर्च नोंदवा" : "Record New Expense")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-red-800 p-1.5 rounded-full transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {apiError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खर्चाचे नाव / विक्रेता" : "Expense Name / Vendor"}
            </label>
            <input
              type="text"
              placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उदा. हवन सामग्री किंवा तूप खरेदी" : "e.g. Purchase of Havan Samagri or Ghee"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-600"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("field.category")}
              </label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setCustomCategory(""); }}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="Pooja & Vidhi">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "पूजा आणि विधी" : "Pooja & Vidhi"}</option>
                <option value="Maintenance">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "देखभाल आणि दुरुस्ती" : "Maintenance & Repairs"}</option>
                <option value="Annadan Kharcha">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "अन्नदान खर्च" : "Annadan Kharcha"}</option>
                <option value="Festival Decorations">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उत्सव सजावट" : "Festival Decorations"}</option>
                <option value="Administrative">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "प्रशासकीय आणि पगार" : "Administrative & Salaries"}</option>
                <option value="Charity & Welfare">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "धर्मादाय आणि कल्याण" : "Charity & Welfare"}</option>
                <option value="Other">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "इतर" : "Other"}</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("field.date")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Custom Category Input (shown only when 'Other' is selected) */}
          {category === "Other" && (
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200 animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">
                {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "कस्टम वर्ग नाव" : "Specify Category"}
              </label>
              <input
                type="text"
                placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उदा. विशेष उपक्रम, वाहन खर्च" : "e.g. Special Initiative, Vehicle Expense"}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  errors.customCategory ? "border-red-500 focus:ring-red-500" : "border-orange-300 focus:ring-orange-500"
                }`}
              />
              {errors.customCategory && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.customCategory}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Transaction Mode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "व्यवहार प्रकार" : "Transaction Mode"}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="Cash">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "रोख (Cash)" : "Cash"}</option>
                <option value="Check">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "चेक (Check)" : "Check"}</option>
                <option value="UPI">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "युपीआय (UPI)" : "UPI"}</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("field.amount")} (₹ {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "रुपये" : "Rupees"})
              </label>
              <input
                type="number"
                placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "भरलेली रक्कम टाका" : "Enter paid amount"}
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  errors.amount ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-600"
                }`}
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.amount}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              {t("field.description")}
            </label>
            <textarea
              rows={2}
              placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "बिल व्हाउचर नोट्स किंवा व्यापारी तपशील नोंदवा" : "Record any bill voucher notes or merchant details"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Bill Proof Upload */}
          <div>
            <ImageUpload
              label={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खर्च देयक / बिल अपलोड करा" : "Invoice Bill / Voucher Receipt upload"}
              placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "अधिकृत बिल किंवा पेमेंट स्क्रीनशॉट अपलोड करा" : "Upload official invoice bill or merchant payment screenshot"}
              defaultUrl={bill}
              onUploadSuccess={(url) => {
                setBill(url);
                if (url) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.bill;
                    return next;
                  });
                }
              }}
            />
            {errors.bill && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.bill}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
            >
              {t("action.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-800 transition shadow-sm disabled:bg-red-400 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {submitting ? t("action.saving") : expense ? (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खर्च दुरुस्त करा" : "Update Expense") : (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खर्च नोंदवा" : "Record Expense")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateExpense;
