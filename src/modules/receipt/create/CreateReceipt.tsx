import React, { useState, useEffect } from "react";
import { Receipt } from "../../../types";
import { ImageUpload } from "../../../components/ImageUpload";
import { X, Save, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./CreateReceipt.css";

interface CreateReceiptProps {
  receipt?: Receipt | null;
  onSave: (data: Partial<Receipt>) => Promise<void>;
  onClose: () => void;
}

export const CreateReceipt: React.FC<CreateReceiptProps> = ({
  receipt,
  onSave,
  onClose,
}) => {
  const { t, user } = useAuth();
  const [name, setName] = useState("");
  const [reason, setReason] = useState("General Donation");
  const [customReason, setCustomReason] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [foodName, setFoodName] = useState("");
  const [foodQty, setFoodQty] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const PRESET_REASONS = ["General Donation", "Abhishek Pooja Sewa", "Food", "Temple Renovation Fund"];

  useEffect(() => {
    if (receipt) {
      setName(receipt.name);
      if (PRESET_REASONS.includes(receipt.reason)) {
        setReason(receipt.reason);
        setCustomReason("");
      } else {
        setReason("Other");
        setCustomReason(receipt.reason);
      }
      setAmount(receipt.amount !== null ? receipt.amount : "");
      setFoodName(receipt.foodName || "");
      setFoodQty(receipt.foodQty !== null ? receipt.foodQty : "");
      setImage(receipt.image);
      setCreatedDate(receipt.createdDate);
      setMobile(receipt.mobile || "");
      setAddress(receipt.address || "");
      setPaymentMode(receipt.paymentMode || "Cash");
    } else {
      // Set today's date in local YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];
      setCreatedDate(today);
      setName("");
      setReason("General Donation");
      setCustomReason("");
      setAmount("");
      setFoodName("");
      setFoodQty("");
      setImage("");
      setMobile("");
      setAddress("");
      setPaymentMode("Cash");
    }
  }, [receipt]);

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = "Name is required";
    if (!reason.trim()) tempErrors.reason = "Receipt reason is required";
    if (reason === "Other" && !customReason.trim()) tempErrors.customReason = "Please specify the reason";
    if (!image) tempErrors.image = "Receipt/document image upload is required";
    if (!createdDate) tempErrors.createdDate = "Created date is required";

    if (!mobile.trim()) {
      tempErrors.mobile = "Phone number is required";
    } else if (!/^[0-9\s+-]{10,15}$/.test(mobile.trim())) {
      tempErrors.mobile = "Invalid phone number format (must be 10-15 digits)";
    }

    const effectiveReason = reason === "Other" ? customReason.trim() : reason;
    if (effectiveReason === "Food") {
      if (!foodName.trim()) tempErrors.foodName = "Food item name is required";
      if (!foodQty || Number(foodQty) <= 0) {
        tempErrors.foodQty = "Valid food quantity (KG) is required";
      }
    } else {
      if (!amount || Number(amount) <= 0) {
        tempErrors.amount = "Valid amount (Rs.) is required";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    const effectiveReason = reason === "Other" ? customReason.trim() : reason;
    const payload: Partial<Receipt> & { authorUuid?: string | null } = {
      name: name.trim(),
      reason: effectiveReason,
      image,
      createdDate,
      amount: effectiveReason === "Food" ? null : Number(amount),
      foodName: effectiveReason === "Food" ? foodName.trim() : null,
      foodQty: effectiveReason === "Food" ? Number(foodQty) : null,
      mobile: mobile.trim(),
      address: address.trim() || null,
      paymentMode,
      authorUuid: user?.uuid || user?.id || null,
    };

    try {
      await onSave(payload);
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.message || "Something went wrong saving receipt");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReasonChange = (newReason: string) => {
    setReason(newReason);
    setCustomReason("");
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transition-all scale-100 animate-scaleIn">
        
        {/* Modal Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">ॐ</span>
            <h3 className="font-bold font-display text-lg">
              {receipt 
                ? `${t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "पावती संपादित करा" : "Edit Receipt"} ${receipt.receiptNo}` 
                : (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "नवीन पावती तयार करा" : "Create New Receipt")}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {apiError}
            </div>
          )}

          {/* Donor Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              {t("receipt.donorName")}
            </label>
            <input
              type="text"
              placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "देणगीदाराचे पूर्ण नाव प्रविष्ट करा" : "Enter donor/devotee name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-600"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Phone Number & Address (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("field.mobile")}
              </label>
              <input
                type="text"
                placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "मोबाईल नंबर प्रविष्ट करा" : "Enter phone number"}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  errors.mobile ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-600"
                }`}
              />
              {errors.mobile && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.mobile}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("field.address")} <span className="text-[10px] text-gray-400">({t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "ऐच्छिक" : "Optional"})</span>
              </label>
              <input
                type="text"
                placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "पत्ता प्रविष्ट करा" : "Enter address"}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Reason Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("field.reason")}
              </label>
              <select
                value={reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="General Donation">{t("General Donation")}</option>
                <option value="Abhishek Pooja Sewa">{t("Abhishek Pooja")}</option>
                <option value="Food">{t("Food")}</option>
                <option value="Temple Renovation Fund">{t("Renovation Scheme")}</option>
                <option value="Other">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "इतर" : "Other"}</option>
              </select>
            </div>

            {/* Mode of Transaction */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "व्यवहार प्रकार" : "Mode of Transaction"}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
              >
                <option value="Cash">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "रोख (Cash)" : "Cash"}</option>
                <option value="Check">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "चेक (Check)" : "Check"}</option>
                <option value="UPI">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "युपीआय (UPI)" : "UPI"}</option>
              </select>
            </div>
          </div>

          {/* Created Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              {t("field.date")}
            </label>
            <input
              type="date"
              value={createdDate}
              onChange={(e) => setCreatedDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Custom Reason Input (shown only when 'Other' is selected) */}
          {reason === "Other" && (
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-800 mb-1">
                {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "दानाचे कारण नाव" : "Specify Reason"}
              </label>
              <input
                type="text"
                placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उदा. वार्षिक दान, विशेष सेवा" : "e.g. Annual Contribution, Special Service"}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  errors.customReason ? "border-red-500 focus:ring-red-500" : "border-purple-300 focus:ring-purple-500"
                }`}
              />
              {errors.customReason && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.customReason}</p>}
            </div>
          )}

          {/* Conditional Fields based on Reason */}
          {reason === "Food" ? (
            <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                  {t("field.foodName")}
                </label>
                <input
                  type="text"
                  placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उदा. तांदूळ, गहू" : "e.g. Basmati Rice, Wheat"}
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 ${
                    errors.foodName ? "border-red-500 focus:ring-red-500" : "border-amber-300 focus:ring-amber-500"
                  }`}
                />
                {errors.foodName && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.foodName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                  {t("receipt.foodQty")}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={foodQty}
                  onChange={(e) => setFoodQty(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`w-full px-3 py-1.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 ${
                    errors.foodQty ? "border-red-500 focus:ring-red-500" : "border-amber-300 focus:ring-amber-500"
                  }`}
                />
                {errors.foodQty && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.foodQty}</p>}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                {t("field.amount")}
              </label>
              <input
                type="number"
                placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "रक्कम प्रविष्ट करा" : "Enter amount in Rupees"}
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className={`w-full px-3.5 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 ${
                  errors.amount ? "border-red-500 focus:ring-red-500" : "border-emerald-300 focus:ring-emerald-500"
                }`}
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.amount}</p>}
            </div>
          )}

          {/* Receipt Image / Document Upload */}
          <div>
            <ImageUpload
              label={t("receipt.proofDoc")}
              placeholder={t("receipt.viewProof")}
              defaultUrl={image}
              onUploadSuccess={(url) => {
                setImage(url);
                if (url) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.image;
                    return next;
                    });
                  }
                }}
              />
            {errors.image && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.image}</p>}
          </div>

          {/* Modal Footer / Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
            >
              {t("action.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-800 transition shadow-sm disabled:bg-red-400 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {submitting 
                ? t("action.saving") 
                : receipt 
                  ? (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "पावती सुधारा" : "Update Receipt") 
                  : (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "पावती जतन करा" : "Save Receipt")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateReceipt;
