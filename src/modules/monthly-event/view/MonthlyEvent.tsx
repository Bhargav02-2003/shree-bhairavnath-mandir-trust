import React, { useState, useEffect } from "react";
import { TempleEvent } from "../../../types";
import { useAuth, api } from "../../../context/AuthContext";
import { CreateMonthlyEvent } from "../create/CreateMonthlyEvent";
import { MonthlyEventGrid } from "../grid/MonthlyEventGrid";
import { Plus, AlertTriangle } from "lucide-react";
import "./MonthlyEvent.css";

export const MonthlyEvent: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TempleEvent | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/monthly_events");
      setEvents(response.data);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSave = async (data: Partial<TempleEvent>) => {
    if (editingEvent) {
      await api.put(`/monthly_events/${editingEvent.id}`, data);
    } else {
      await api.post("/monthly_events", data);
    }
    setIsCreateOpen(false);
    setEditingEvent(null);
    fetchEvents();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/monthly_events/${deletingId}`);
      setDeletingId(null);
      fetchEvents();
    } catch {
      // Ignore error
    }
  };

  const canWrite = hasPermission("write", "monthly_events");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-gray-800 tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-red-700 rounded-full"></span>
            Monthly MOM
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Browse and schedule regular monthly Meetings, distribution schemes, and local community gatherings.
          </p>
        </div>
        {user && canWrite && (
          <button
            onClick={() => {
              setEditingEvent(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Monthly Pooja
          </button>
        )}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
          <p className="text-sm text-gray-400 mt-4">Loading monthly rituals...</p>
        </div>
      ) : (
        <MonthlyEventGrid
          events={events}
          onEdit={(ev) => {
            setEditingEvent(ev);
            setIsCreateOpen(true);
          }}
          onDelete={(id) => setDeletingId(id)}
        />
      )}

      {/* Save Modal */}
      {(isCreateOpen || editingEvent) && (
        <CreateMonthlyEvent
          event={editingEvent}
          onSave={handleSave}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialogue */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-600 mb-4 border border-rose-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 font-display">Delete Monthly Ritual?</h3>
            <p className="text-xs text-gray-500 mt-2">
              This will permanently delete this monthly pooja. Historical receipts associated with it are unaffected.
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
export default MonthlyEvent;
