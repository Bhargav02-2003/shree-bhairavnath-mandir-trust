import React, { useState, useEffect } from "react";
import { api, useAuth } from "../../context/AuthContext";
import { BoardMember } from "../../types";
import { ImageUpload } from "../../components/ImageUpload";
import {
  Plus, X, Save, Trash2, AlertCircle, Users, Pencil, User,
} from "lucide-react";

export const BoardMembers: React.FC = () => {
  const { t, user } = useAuth();
  const isMarathi = t("nav.dashboard") === "मुख्य डॅशबोर्ड";

  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BoardMember | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number | "">("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const canWrite = user?.role === "super_admin" || user?.role === "user";
  const canDelete = user?.role === "super_admin";

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/board_members");
      setMembers(res.data);
    } catch (err: any) {
      setError(isMarathi ? "सदस्य लोड करण्यात अयशस्वी." : "Failed to load board members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const resetForm = () => {
    setName("");
    setDesignation("");
    setProfilePhoto("");
    setDisplayOrder("");
    setFormErrors({});
    setApiError(null);
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (member: BoardMember) => {
    setEditing(member);
    setName(member.name);
    setDesignation(member.designation || "");
    setProfilePhoto(member.profilePhoto || "");
    setDisplayOrder(member.displayOrder);
    setFormErrors({});
    setApiError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = isMarathi ? "नाव आवश्यक आहे" : "Name is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        name: name.trim(),
        designation: designation.trim() || null,
        profilePhoto: profilePhoto || null,
        displayOrder: displayOrder !== "" ? Number(displayOrder) : 0,
      };
      if (editing) {
        await api.put(`/board_members/${editing.id}`, payload);
      } else {
        await api.post("/board_members", payload);
      }
      closeForm();
      fetchMembers();
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.message || (isMarathi ? "जतन करण्यात त्रुटी." : "Failed to save member."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/board_members/${id}`);
      setDeleteConfirm(null);
      setMembers((prev) => prev.filter((m) => m.id !== id && (m as any).uuid !== id));
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || (isMarathi ? "हटवण्यात अयशस्वी." : "Failed to delete member."));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-gray-900 flex items-center gap-2">
            <span className="h-3 w-3 bg-red-600 rounded-full inline-block"></span>
            {isMarathi ? "विश्वस्त मंडळ" : "Board of Members"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isMarathi ? "श्री भैरवनाथ मंदिर, तळवडेचे विश्वस्त सदस्य" : "Trustees & members of Shree Bhairavnath Mandir Talawade"}
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {isMarathi ? "नवीन सदस्य जोडा" : "Add Member"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
          <p className="mt-3 text-sm text-gray-400">{isMarathi ? "लोड होत आहे..." : "Loading..."}</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-red-300" />
            </div>
          </div>
          <p className="text-gray-500 font-medium text-sm">
            {isMarathi ? "अद्याप कोणतेही सदस्य नाहीत." : "No board members added yet."}
          </p>
          {canWrite && (
            <button onClick={openAdd} className="mt-4 text-red-600 hover:text-red-800 font-bold text-sm cursor-pointer">
              + {isMarathi ? "पहिला सदस्य जोडा" : "Add the first member"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center group hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              {/* Profile Photo */}
              <div className="relative mb-3">
                {member.profilePhoto ? (
                  <img
                    src={member.profilePhoto}
                    alt={member.name}
                    className="h-20 w-20 rounded-full object-cover border-4 border-red-100 shadow"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center border-4 border-red-100">
                    <User className="h-9 w-9 text-red-400" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-400 rounded-full border-2 border-white"></div>
              </div>

              {/* Info */}
              <h4 className="font-bold text-gray-900 text-sm leading-tight">{t(member.name)}</h4>
              {member.designation && (
                <p className="text-[11px] text-red-600 font-semibold mt-0.5">{t(member.designation)}</p>
              )}

              {/* Actions (admin only) */}
              {canWrite && (
                <div className="flex gap-1.5 mt-3">
                  <button
                    onClick={() => openEdit(member)}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-lg transition cursor-pointer border border-amber-100"
                    title={isMarathi ? "संपादित करा" : "Edit"}
                  >
                    <Pencil className="h-3 w-3" />
                    <span>{isMarathi ? "संपादित करा" : "Edit"}</span>
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => setDeleteConfirm(member.id || (member as any).uuid)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition cursor-pointer border border-red-100"
                      title={isMarathi ? "हटवा" : "Delete"}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>{isMarathi ? "हटवा" : "Delete"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-scaleIn">
            <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>ॐ</span>
                <h3 className="font-bold font-display text-lg">
                  {editing
                    ? (isMarathi ? "सदस्य दुरुस्त करा" : "Edit Member")
                    : (isMarathi ? "नवीन सदस्य जोडा" : "Add New Member")}
                </h3>
              </div>
              <button onClick={closeForm} className="text-white/80 hover:text-white hover:bg-red-800 p-1.5 rounded-full transition cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {apiError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {apiError}
                </div>
              )}

              {/* Profile Photo */}
              <div>
                <ImageUpload
                  label={isMarathi ? "प्रोफाइल फोटो (ऐच्छिक)" : "Profile Photo (Optional)"}
                  placeholder={isMarathi ? "सदस्याचा फोटो अपलोड करा" : "Upload member profile photo"}
                  defaultUrl={profilePhoto}
                  onUploadSuccess={(url) => setProfilePhoto(url)}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {isMarathi ? "सदस्याचे नाव *" : "Member Name *"}
                </label>
                <input
                  type="text"
                  placeholder={isMarathi ? "उदा. श्री राजेश शिंदे" : "e.g. Shri Rajesh Shinde"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                    formErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-600"
                  }`}
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{formErrors.name}</p>}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {isMarathi ? "पद / भूमिका" : "Designation / Role"}
                  <span className="text-[10px] text-gray-400 ml-1">({isMarathi ? "ऐच्छिक" : "Optional"})</span>
                </label>
                <input
                  type="text"
                  placeholder={isMarathi ? "उदा. अध्यक्ष, विश्वस्त, सचिव" : "e.g. President, Trustee, Secretary"}
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {isMarathi ? "प्रदर्शन क्रम" : "Display Order"}
                  <span className="text-[10px] text-gray-400 ml-1">({isMarathi ? "ऐच्छिक" : "Optional"})</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <p className="text-[10px] text-gray-400 mt-1">{isMarathi ? "लहान संख्या प्रथम दिसेल" : "Lower number appears first"}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                >
                  {isMarathi ? "रद्द करा" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-800 transition shadow-sm disabled:bg-red-400 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  {submitting
                    ? (isMarathi ? "जतन होत आहे..." : "Saving...")
                    : editing
                      ? (isMarathi ? "अद्यतनित करा" : "Update Member")
                      : (isMarathi ? "सदस्य जोडा" : "Add Member")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{isMarathi ? "सदस्य हटवायचा?" : "Remove this member?"}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{isMarathi ? "हे पूर्ववत करता येणार नाही." : "This action cannot be undone."}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                {isMarathi ? "रद्द करा" : "Cancel"}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition cursor-pointer"
              >
                {isMarathi ? "हटवा" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardMembers;
