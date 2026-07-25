import React, { useState } from "react";
import { Expense } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { Eye, Edit2, Trash2, Calendar, FileText, IndianRupee, Image as ImageIcon, X } from "lucide-react";
import "./ExpenseGrid.css";

interface ExpenseGridProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

export const ExpenseGrid: React.FC<ExpenseGridProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  const { user, hasPermission, t } = useAuth();
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  const canEdit = hasPermission("update", "expenses");
  const canDelete = hasPermission("delete", "expenses");

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-5 py-3">{t("expense.details")}</th>
              <th className="px-5 py-3">{t("field.category")}</th>
              <th className="px-5 py-3">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "प्रकार" : "Mode"}</th>
              <th className="px-5 py-3 text-right">{t("expense.amountPaid")}</th>
              <th className="px-5 py-3">{t("field.date")}</th>
              <th className="px-5 py-3 text-center">{t("expense.voucherBill")}</th>
              <th className="px-5 py-3 text-center">{t("field.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {expenses.length > 0 ? (
              expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-gray-900">{exp.name}</p>
                      {exp.description && (
                        <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{exp.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      exp.category.includes("Pooja") || exp.category.includes("Rituals")
                        ? "bg-amber-100 text-amber-800"
                        : exp.category.includes("Maintenance")
                        ? "bg-blue-100 text-blue-800"
                        : exp.category.includes("Annadan") || exp.category.includes("Kitchen")
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {t(exp.category)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      {exp.paymentMode ? t(exp.paymentMode) : (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "रोख" : "Cash")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-rose-600 font-display">
                    - ₹{exp.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">
                    {new Date(exp.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {exp.bill ? (
                      <button
                        onClick={() => setViewingExpense(exp)}
                        className="text-red-700 hover:text-red-800 p-1 bg-red-50 hover:bg-red-100 rounded transition mx-auto flex items-center justify-center cursor-pointer"
                        title={t("expense.viewBillTitle")}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setViewingExpense(exp)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer border border-blue-100"
                        title={t("action.view")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{t("action.view")}</span>
                      </button>

                      {user && canEdit && (
                        <button
                          onClick={() => onEdit(exp)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer border border-emerald-100"
                          title={t("expense.edit")}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>{t("action.edit")}</span>
                        </button>
                      )}

                      {user && canDelete && (
                        <button
                          onClick={() => onDelete(exp.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer border border-rose-100"
                          title={t("expense.delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t("action.delete")}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                  {t("expense.noExpenses")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Expense Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-scaleIn">
            
            {/* Header */}
            <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>ॐ</span>
                <h3 className="font-bold font-display text-lg">{t("expense.auditTitle")}</h3>
              </div>
              <button
                onClick={() => setViewingExpense(null)}
                className="text-white/80 hover:text-white hover:bg-red-800 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t("expense.detailsVendor")}</p>
                <p className="text-lg font-bold text-gray-950 mt-1">{viewingExpense.name}</p>
                <p className="text-xs text-gray-500 mt-2">{viewingExpense.description || t("expense.noDesc")}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">{t("expense.category")}</span>
                  <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-md text-xs mt-1 border border-amber-200">
                    {t(viewingExpense.category)}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">{t("expense.date")}</span>
                  <span className="flex items-center gap-1.5 mt-1 font-semibold text-gray-800">
                    <Calendar className="h-4 w-4 text-red-500" />
                    {new Date(viewingExpense.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
              </div>

              {/* Amount Display */}
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wide block">{t("expense.outflow")}</span>
                  <div className="flex items-center gap-1 mt-1 text-2xl font-black text-rose-700">
                    <IndianRupee className="h-6 w-6" />
                    <span>{viewingExpense.amount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block">{t("expense.authorized")}</span>
                  <span className="text-xs font-bold text-gray-700 block mt-1">{viewingExpense.createdBy}</span>
                </div>
              </div>

              {/* Bill proof upload preview */}
              {viewingExpense.bill && (
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">{t("expense.proofTitle")}</span>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2 max-h-[220px]">
                    <img
                      src={viewingExpense.bill}
                      alt="Bill Scan"
                      className="max-h-[200px] object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewingExpense(null)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition cursor-pointer"
              >
                {t("expense.closeBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExpenseGrid;
