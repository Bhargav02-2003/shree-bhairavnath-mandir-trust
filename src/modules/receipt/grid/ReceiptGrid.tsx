import React from "react";
import { Receipt } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { Eye, Edit2, Image as ImageIcon } from "lucide-react";
import "./ReceiptGrid.css";

interface ReceiptGridProps {
  receipts: Receipt[];
  onEdit: (receipt: Receipt) => void;
  onView: (receipt: Receipt) => void;
}

export const ReceiptGrid: React.FC<ReceiptGridProps> = ({
  receipts,
  onEdit,
  onView,
}) => {
  const { user, hasPermission, t } = useAuth();
  const canEdit = hasPermission("update", "receipts");

  return (
    <div className="w-full">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-xs bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-5 py-3">{t("receipt.no")}</th>
              <th className="px-5 py-3">{t("field.date")}</th>
              <th className="px-5 py-3">{t("receipt.donorName")}</th>
              <th className="px-5 py-3">{t("field.reason")}</th>
              <th className="px-5 py-3">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "प्रकार" : "Mode"}</th>
              <th className="px-5 py-3 text-right">{t("field.amount")}</th>
              <th className="px-5 py-3">{t("field.foodName")}</th>
              <th className="px-5 py-3">{t("receipt.foodQty")}</th>
              <th className="px-5 py-3 text-center">{t("receipt.image")}</th>
              <th className="px-5 py-3">{t("field.createdBy")}</th>
              <th className="px-5 py-3 text-center">{t("field.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {receipts.length > 0 ? (
              receipts.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50/50 transition duration-150">
                  <td className="px-5 py-3.5 font-mono font-bold text-red-700">
                    {rec.receiptNo}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 truncate whitespace-nowrap">
                    {new Date(rec.createdDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900 truncate max-w-[160px]">
                    {rec.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      rec.reason === "Food"
                        ? "bg-amber-100 text-amber-800"
                        : rec.reason.includes("Renovation")
                        ? "bg-emerald-100 text-emerald-800"
                        : rec.reason.includes("Abhishek")
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {t(rec.reason)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      {rec.paymentMode ? t(rec.paymentMode) : (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "रोख" : "Cash")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-gray-800">
                    {rec.amount !== null ? `₹${rec.amount.toLocaleString("en-IN")}` : <span className="text-gray-400 italic font-normal text-xs">-</span>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {rec.foodName ? t(rec.foodName) : <span className="text-gray-400 italic text-xs">-</span>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium">
                    {rec.foodQty !== null ? `${rec.foodQty} ${t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "कि.ग्रॅ." : "KG"}` : <span className="text-gray-400 italic text-xs">-</span>}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {rec.image ? (
                      <button
                        onClick={() => onView(rec)}
                        className="text-red-700 hover:text-red-800 p-1 bg-red-50 hover:bg-red-100 rounded transition mx-auto flex items-center justify-center cursor-pointer"
                        title={t("receipt.viewProof")}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                    {rec.createdBy}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView(rec)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer border border-blue-100"
                        title={t("receipt.viewDetails")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{t("action.view")}</span>
                      </button>
                      
                      {user && canEdit && (
                        <button
                          onClick={() => onEdit(rec)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer border border-emerald-100"
                          title={t("receipt.edit")}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>{t("action.edit")}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-5 py-12 text-center text-gray-400">
                  {t("receipt.noReceipts")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceiptGrid;
