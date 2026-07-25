import React, { useState, useEffect } from "react";
import { Expense as ExpenseType } from "../../../types";
import { useAuth, api } from "../../../context/AuthContext";
import { CreateExpense } from "../create/CreateExpense";
import { ExpenseGrid } from "../grid/ExpenseGrid";
import { Search, Plus, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import "./Expense.css";

export const Expense: React.FC = () => {
  const { user, hasPermission, t } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category: categoryFilter,
        dateFrom,
        dateTo,
        page,
        limit: 8,
      };
      const response = await api.get("/expenses", { params });
      setExpenses(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch {
      // Ignore load error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchExpenses();
  }, [page, searchTerm, categoryFilter, dateFrom, dateTo]);

  const handleSave = async (data: Partial<ExpenseType>) => {
    if (editingExpense) {
      await api.put(`/expenses/${editingExpense.id}`, data);
    } else {
      await api.post("/expenses", data);
    }
    setIsCreateOpen(false);
    setEditingExpense(null);
    fetchExpenses();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/expenses/${deletingId}`);
      setDeletingId(null);
      fetchExpenses();
    } catch {
      // Ignore delete error
    }
  };

  const canWrite = hasPermission("write", "expenses");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-gray-800 tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-red-700 rounded-full"></span>
            Expense Ledger Book
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Browse and audit all trust maintenance charges, ritual purchases, kitchen expenditures and employee salaries.
          </p>
        </div>
        {user && canWrite && (
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Expense Voucher
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Search Item or Merchant
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by expense name, description, merchant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 bg-gray-50/20"
            />
          </div>
        </div>

        {/* Category select */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Category Filter
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="">All Categories</option>
            <option value="Pooja & Vidhi">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "पूजा आणि विधी" : "Pooja & Vidhi"}</option>
            <option value="Maintenance">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "देखभाल आणि दुरुस्ती" : "Maintenance & Repairs"}</option>
            <option value="Annadan Kharcha">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "अन्नदान खर्च" : "Annadan Kharcha"}</option>
            <option value="Festival Decorations">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उत्सव सजावट" : "Festival Decorations"}</option>
            <option value="Administrative">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "प्रशासकीय आणि पगार" : "Administrative & Salaries"}</option>
            <option value="Charity & Welfare">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "धर्मादाय आणि कल्याण" : "Charity & Welfare"}</option>
          </select>
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
          <p className="text-sm text-gray-400 mt-4">Loading expenditures...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ExpenseGrid
            expenses={expenses}
            onEdit={(exp) => {
              setEditingExpense(exp);
              setIsCreateOpen(true);
            }}
            onDelete={(id) => setDeletingId(id)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-xs">
              <span className="text-xs text-gray-500 font-medium">
                Showing page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span> ({total} entries)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      page === num
                        ? "bg-red-700 text-white shadow-xs"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Modal */}
      {(isCreateOpen || editingExpense) && (
        <CreateExpense
          expense={editingExpense}
          onSave={handleSave}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingExpense(null);
          }}
        />
      )}

      {/* Delete confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-600 mb-4 border border-rose-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 font-display">Delete Expense Entry?</h3>
            <p className="text-xs text-gray-500 mt-2">
              Warning! Deleting this recorded expense will change the total trust summary reports and accounts immediately.
            </p>
            <div className="mt-5 flex gap-3 justify-center">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-600 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white rounded-lg transition shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Expense;
