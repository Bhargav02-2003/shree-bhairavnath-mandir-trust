import React, { useState, useEffect } from "react";
import { Receipt as ReceiptType } from "../../../types";
import { useAuth, api } from "../../../context/AuthContext";
import { CreateReceipt } from "../create/CreateReceipt";
import { ReceiptGrid } from "../grid/ReceiptGrid";
import { ViewReceipt } from "./ViewReceipt";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import "./Receipt.css";

export const Receipt: React.FC = () => {
  const { user, hasPermission, t } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptType | null>(null);

  // View Receipt states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [matchingReceipts, setMatchingReceipts] = useState<ReceiptType[]>([]);
  const [selectedViewReceipt, setSelectedViewReceipt] = useState<ReceiptType | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        reason: reasonFilter,
        dateFrom,
        dateTo,
        page,
        limit: 8,
      };
      const response = await api.get("/receipts", { params });
      setReceipts(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch {
      // Ignore load error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset page to 1 on filter changes
    setPage(1);
  }, [searchTerm, reasonFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchReceipts();
  }, [page, searchTerm, reasonFilter, dateFrom, dateTo]);

  const handleSave = async (data: Partial<ReceiptType>) => {
    if (editingReceipt) {
      // Update
      await api.put(`/receipts/${editingReceipt.id}`, data);
    } else {
      // Create
      await api.post("/receipts", data);
    }
    setIsCreateOpen(false);
    setEditingReceipt(null);
    fetchReceipts();
  };

  const handleView = async (rec: ReceiptType) => {
    try {
      setLoadingDetails(true);
      const response = await api.get(`/receipts?search=${encodeURIComponent(rec.receiptNo)}&limit=100`);
      const data = response.data?.data || [];
      const exactMatches = data.filter((item: ReceiptType) => item.receiptNo === rec.receiptNo);
      const finalMatches = exactMatches.length > 0 ? exactMatches : [rec];
      
      setMatchingReceipts(finalMatches);
      if (finalMatches.length > 1) {
        setSelectedViewReceipt(null); // Show the entries list/table
      } else {
        setSelectedViewReceipt(finalMatches[0]); // Show single receipt layout
      }
      setIsViewOpen(true);
    } catch {
      setMatchingReceipts([rec]);
      setSelectedViewReceipt(rec);
      setIsViewOpen(true);
    } finally {
      setLoadingDetails(false);
    }
  };

  const canWrite = hasPermission("write", "receipts");

  return (
    <div className="receipt-container space-y-6">
      {/* 1. Page Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-gray-800 tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-red-700 rounded-full"></span>
            {t("receipt.managementTitle")}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {t("receipt.managementSubtitle")}
          </p>
        </div>
        {user && canWrite && (
          <button
            onClick={() => {
              setEditingReceipt(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            {t("receipt.add")}
          </button>
        )}
      </div>

      {/* 2. Filters & Searches (Bento Style Tool Panel) */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Text search */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t("receipt.searchLabel")}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("receipt.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 bg-gray-50/20"
            />
          </div>
        </div>

        {/* Reason selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t("receipt.filterReason")}
          </label>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="">{t("receipt.allTypes")}</option>
            <option value="General Donation">{t("General Donation")}</option>
            <option value="Abhishek Pooja Sewa">{t("Abhishek Pooja")}</option>
            <option value="Food">{t("Food")}</option>
            <option value="Temple Renovation Fund">{t("Renovation Scheme")}</option>
          </select>
        </div>

        {/* Date From & To */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              {t("field.fromDate")}
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
              {t("field.toDate")}
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

      {/* 3. Main Data Grid Table */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
          <p className="text-sm text-gray-400 mt-4">{t("receipt.loading")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ReceiptGrid
            receipts={receipts}
            onEdit={(rec) => {
              setEditingReceipt(rec);
              setIsCreateOpen(true);
            }}
            onView={handleView}
          />

          {/* 4. Elegant Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-xs">
              <span className="text-xs text-gray-500 font-medium">
                {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? (
                  <>
                    पाने <span className="font-bold text-gray-800">{totalPages}</span> पैकी पान <span className="font-bold text-gray-800">{page}</span> (एकूण <span className="font-bold text-gray-800">{total}</span> पावत्या सापडल्या)
                  </>
                ) : (
                  <>
                    Showing page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span> ({total} receipts found)
                  </>
                )}
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

      {/* 5. Create / Edit Receipt Modal Popup */}
      {(isCreateOpen || editingReceipt) && (
        <CreateReceipt
          receipt={editingReceipt}
          onSave={handleSave}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingReceipt(null);
          }}
        />
      )}

      {/* 6. View Receipt Details Modal Popup */}
      {isViewOpen && (
        <ViewReceipt
          matchingReceipts={matchingReceipts}
          selectedReceipt={selectedViewReceipt}
          onSelectReceipt={setSelectedViewReceipt}
          onClose={() => {
            setIsViewOpen(false);
            setMatchingReceipts([]);
            setSelectedViewReceipt(null);
          }}
        />
      )}

      {/* 7. Loading Details Overlay */}
      {loadingDetails && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-mono">
              {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "माहिती लोड होत आहे..." : "Loading details..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipt;
