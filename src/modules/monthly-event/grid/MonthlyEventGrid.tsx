import React, { useState } from "react";
import { TempleEvent } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { Eye, Edit2, Trash2, Calendar, MapPin, X } from "lucide-react";
import "./MonthlyEventGrid.css";

interface MonthlyEventGridProps {
  events: TempleEvent[];
  onEdit: (event: TempleEvent) => void;
  onDelete: (id: number) => void;
}

export const MonthlyEventGrid: React.FC<MonthlyEventGridProps> = ({
  events,
  onEdit,
  onDelete,
}) => {
  const { user, hasPermission, t } = useAuth();
  const [viewingEvent, setViewingEvent] = useState<TempleEvent | null>(null);

  const canEdit = hasPermission("update", "monthly_events");
  const canDelete = hasPermission("delete", "monthly_events");

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-5 py-3">{t("event.photo")}</th>
              <th className="px-5 py-3">{t("event.title")}</th>
              <th className="px-5 py-3">{t("field.date")}</th>
              <th className="px-5 py-3">{t("event.venue")}</th>
              <th className="px-5 py-3">{t("event.status")}</th>
              <th className="px-5 py-3 text-center">{t("field.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {events.length > 0 ? (
              events.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3">
                    <img
                      src={ev.image}
                      alt={t(ev.title)}
                      className="w-16 h-10 object-cover rounded-lg border border-gray-100 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900 max-w-[200px] truncate">
                    {t(ev.title)}
                  </td>
                  <td className="px-5 py-3 text-gray-600 font-medium">
                    {new Date(ev.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td className="px-5 py-3 text-gray-600 truncate max-w-[180px]">
                    {t(ev.location)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      ev.eventStatus === "upcoming"
                        ? "bg-amber-100 text-amber-800"
                        : ev.eventStatus === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {t(ev.eventStatus)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setViewingEvent(ev)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer border border-blue-100"
                        title={t("action.view")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{t("action.view")}</span>
                      </button>

                      {user && canEdit && (
                        <button
                          onClick={() => onEdit(ev)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer border border-emerald-100"
                          title={t("event.edit")}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>{t("action.edit")}</span>
                        </button>
                      )}

                      {user && canDelete && (
                        <button
                          onClick={() => onDelete(ev.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer border border-rose-100"
                          title={t("event.delete")}
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
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  {t("event.noEvents")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed View Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-scaleIn">
            
            <div className="relative h-48 w-full bg-gray-100">
              <img
                src={viewingEvent.image}
                alt={t(viewingEvent.title)}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setViewingEvent(null)}
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/80 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white rounded-full ${
                  viewingEvent.eventStatus === "upcoming" ? "bg-amber-500" : "bg-emerald-600"
                }`}>
                  {viewingEvent.eventStatus === "upcoming" ? t("event.upcomingText") : t("event.completedText")}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-black font-display text-gray-900 tracking-tight">
                  {t(viewingEvent.title)}
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {t(viewingEvent.description)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">{t("event.dateTitle")}</span>
                  <span className="flex items-center gap-1.5 mt-1 font-semibold text-gray-800">
                    <Calendar className="h-4 w-4 text-red-500" />
                    {new Date(viewingEvent.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">{t("event.venueTitle")}</span>
                  <span className="flex items-center gap-1.5 mt-1 font-semibold text-gray-800 truncate">
                    <MapPin className="h-4 w-4 text-red-500" />
                    {t(viewingEvent.location)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewingEvent(null)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition cursor-pointer"
              >
                {t("event.closeBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MonthlyEventGrid;
