import React, { useState, useEffect } from "react";
import { Trustee, TrusteePermission } from "../../types";
import { useAuth, api } from "../../context/AuthContext";
import { ImageUpload } from "../../components/ImageUpload";
import { 
  Search, Plus, User, Mail, Phone, Shield, Lock, 
  Check, X, Edit2, Trash2, Key, ToggleLeft, ToggleRight, AlertTriangle 
} from "lucide-react";

export const TrusteeManagement: React.FC = () => {
  const { user, t: translate } = useAuth();
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Trustee>("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 6;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedTrustee, setSelectedTrustee] = useState<Trustee | null>(null);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // Permissions state
  const defaultPermissions = {
    receipts: { read: false, write: false, update: false },
    monthly_events: { read: false, write: false, update: false },
    yearly_events: { read: false, write: false, update: false },
    expenses: { read: false, write: false, update: false },
    banners: { read: false, write: false, update: false },
  };
  const [permissions, setPermissions] = useState(defaultPermissions);

  // Reset Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const fetchTrustees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/trustees");
      setTrustees(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load trustee list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrustees();
  }, []);

  const resetFormFields = () => {
    setFullName("");
    setMobile("");
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setDesignation("");
    setProfilePhoto("");
    setStatus("active");
    setPermissions(defaultPermissions);
    setValidationErrors({});
  };

  const handleOpenCreate = () => {
    setSelectedTrustee(null);
    resetFormFields();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (trustee: Trustee) => {
    setSelectedTrustee(trustee);
    setFullName(trustee.fullName);
    setMobile(trustee.mobile || "");
    setEmail(trustee.email || "");
    setUsername(trustee.username);
    setPassword("");
    setConfirmPassword("");
    setDesignation(trustee.designation || "");
    setProfilePhoto(trustee.profilePhoto || "");
    setStatus(trustee.status);

    // Map permissions back
    const mappedPerms = { ...defaultPermissions };
    if (trustee.permissions) {
      trustee.permissions.forEach((p) => {
        const mod = p.moduleName as keyof typeof defaultPermissions;
        if (mappedPerms[mod]) {
          mappedPerms[mod] = {
            read: !!p.canRead,
            write: !!p.canWrite,
            update: !!p.canUpdate,
          };
        }
      });
    }
    setPermissions(mappedPerms);
    setValidationErrors({});
    setIsFormOpen(true);
  };

  const handleOpenResetPassword = (trustee: Trustee) => {
    setSelectedTrustee(trustee);
    setNewPassword("");
    setConfirmNewPassword("");
    setValidationErrors({});
    setIsResetOpen(true);
  };

  const handlePermissionChange = (module: keyof typeof defaultPermissions, action: "read" | "write" | "update") => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action],
      },
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const isMarathi = translate("nav.dashboard") === "मुख्य डॅशबोर्ड";

    if (!fullName.trim()) errors.fullName = isMarathi ? "पूर्ण नाव आवश्यक आहे" : "Full Name is required";
    if (!username.trim()) errors.username = isMarathi ? "युझरनेम आवश्यक आहे" : "Username is required";
    if (username.trim().length < 4) errors.username = isMarathi ? "युझरनेम किमान ४ अक्षरांचे असणे आवश्यक आहे" : "Username must be at least 4 characters";

    if (!selectedTrustee) {
      if (!password) {
        errors.password = isMarathi ? "पासवर्ड आवश्यक आहे" : "Password is required";
      } else if (password.length < 6) {
        errors.password = isMarathi ? "पासवर्ड किमान ६ अक्षरांचा असणे आवश्यक आहे" : "Password must be at least 6 characters";
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = isMarathi ? "पासवर्ड जुळत नाहीत" : "Passwords do not match";
      }
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = isMarathi ? "कृपया वैध ईमेल पत्ता प्रविष्ट करा" : "Please enter a valid email address";
    }

    if (mobile && !/^\+?[0-9]{10,14}$/.test(mobile.replace(/[\s-]/g, ""))) {
      errors.mobile = isMarathi ? "कृपया वैध मोबाईल नंबर प्रविष्ट करा" : "Please enter a valid mobile number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        fullName,
        username,
        mobile,
        email,
        designation,
        profilePhoto,
        status,
        permissions,
        authorUuid: user?.uuid || user?.id || null,
        ...(selectedTrustee ? {} : { password }),
      };

      if (selectedTrustee) {
        await api.put(`/trustees/${selectedTrustee.id}`, payload);
      } else {
        await api.post("/trustees", payload);
      }

      setIsFormOpen(false);
      resetFormFields();
      fetchTrustees();
    } catch (err: any) {
      setValidationErrors({
        submit: err.response?.data?.message || (translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खाते जतन करताना त्रुटी आली." : "An error occurred while saving the trustee account"),
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    const isMarathi = translate("nav.dashboard") === "मुख्य डॅशबोर्ड";

    if (!newPassword) {
      errors.newPassword = isMarathi ? "पासवर्ड आवश्यक आहे" : "Password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = isMarathi ? "पासवर्ड किमान ६ अक्षरांचा असणे आवश्यक आहे" : "Password must be at least 6 characters";
    }

    if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = isMarathi ? "पासवर्ड जुळत नाहीत" : "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (selectedTrustee) {
        await api.patch(`/trustees/${selectedTrustee.id}/reset-password`, {
          password: newPassword,
          authorUuid: user?.uuid || user?.id || null,
        });
        setIsResetOpen(false);
        fetchTrustees();
      }
    } catch (err: any) {
      setValidationErrors({
        submit: err.response?.data?.message || (translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "पासवर्ड रीसेट करण्यात आले नाही." : "Failed to reset password"),
      });
    }
  };

  const handleToggleStatus = async (trustee: Trustee) => {
    const newStatus = trustee.status === "active" ? "inactive" : "active";
    try {
      await api.patch(`/trustees/${trustee.id}/status`, { status: newStatus });
      fetchTrustees();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update trustee status");
    }
  };

  const handleDeleteTrustee = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete trustee: ${name}?`)) return;

    try {
      await api.delete(`/trustees/${id}`);
      fetchTrustees();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete trustee");
    }
  };

  // Sorting Handler
  const handleSort = (field: keyof Trustee) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter and Sort Trustees
  const filteredTrustees = trustees
    .filter((t) => {
      const matchSearch =
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.designation || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? t.status === statusFilter : true;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA === null || valA === undefined) return sortOrder === "asc" ? 1 : -1;
      if (valB === null || valB === undefined) return sortOrder === "asc" ? -1 : 1;

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Paginated list
  const totalPages = Math.ceil(filteredTrustees.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedTrustees = filteredTrustees.slice(startIndex, startIndex + limit);

  return (
    <div className="space-y-6">
      {/* 1. Header with title & Add Trustee button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-gray-800 tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-red-700 rounded-full"></span>
            {translate("trustee.title")}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {translate("trustee.subtitle")}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          {translate("trustee.addAccount")}
        </button>
      </div>

      {/* 2. Bento Style Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {translate("trustee.searchLabel")}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={translate("trustee.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 bg-gray-50/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {translate("trustee.statusFilterLabel")}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
          >
            <option value="">{translate("trustee.allStatuses")}</option>
            <option value="active">{translate("trustee.activeOnly")}</option>
            <option value="inactive">{translate("trustee.inactiveOnly")}</option>
          </select>
        </div>
      </div>

      {/* 3. Trustees Listing Table */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
          <p className="text-sm text-gray-400 mt-4">{translate("trustee.loading")}</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-2xl flex flex-col items-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
          <p className="font-semibold text-sm">{translate(error)}</p>
          <button onClick={fetchTrustees} className="text-xs underline text-red-800 mt-2 font-bold cursor-pointer">
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-xs bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th onClick={() => handleSort("fullName")} className="px-5 py-3 cursor-pointer hover:bg-gray-100 transition">
                    {translate("field.name")} {sortField === "fullName" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("username")} className="px-5 py-3 cursor-pointer hover:bg-gray-100 transition">
                    {translate("field.username")} {sortField === "username" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="px-5 py-3">{translate("field.designation")}</th>
                  <th className="px-5 py-3">{translate("trustee.contactDetails")}</th>
                  <th className="px-5 py-3 text-center">{translate("field.permissions")}</th>
                  <th className="px-5 py-3 text-center">{translate("field.status")}</th>
                  <th className="px-5 py-3 text-center">{translate("field.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedTrustees.length > 0 ? (
                  paginatedTrustees.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition duration-150">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-red-50 border border-red-100 text-red-700 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm">
                            {t.profilePhoto ? (
                              <img src={t.profilePhoto} alt={t.fullName} className="h-full w-full object-cover" />
                            ) : (
                              t.fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{t.fullName}</p>
                            <p className="text-[11px] text-gray-400">Created: {new Date(t.createdAt).toLocaleDateString("en-IN")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-gray-700">
                        @{t.username}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {t.designation ? translate(t.designation) : <span className="text-gray-300 italic text-xs">Trustee</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          {t.mobile && (
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" /> {t.mobile}
                            </p>
                          )}
                          {t.email && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3 text-gray-400" /> {t.email}
                            </p>
                          )}
                          {!t.mobile && !t.email && (
                            <span className="text-gray-300 italic text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex flex-wrap justify-center gap-1.5 max-w-[220px] mx-auto">
                          {t.permissions && t.permissions.some(p => p.canRead || p.canWrite || p.canUpdate) ? (
                            t.permissions.map((p) => {
                              const actions = [];
                              if (p.canRead) actions.push("R");
                              if (p.canWrite) actions.push("W");
                              if (p.canUpdate) actions.push("U");
                              
                              if (actions.length === 0) return null;

                              const modLabel = p.moduleName === "yearly_events" ? "Y_Ev" 
                                             : p.moduleName === "monthly_events" ? "M_Ev"
                                             : p.moduleName === "receipts" ? "Rec"
                                             : p.moduleName === "banners" ? "Ban"
                                             : "Exp";

                              return (
                                <span 
                                  key={p.id} 
                                  title={`${p.moduleName}: ${actions.join(", ")}`}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-50 text-red-800 text-[10px] font-bold border border-red-100"
                                >
                                  {modLabel}: {actions.join("")}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-gray-300 italic text-xs">{translate("trustee.noAccess")}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(t)}
                          className="focus:outline-none cursor-pointer"
                          title="Toggle Status"
                        >
                          {t.status === "active" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Check className="h-3 w-3" /> {translate("active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                              <X className="h-3 w-3" /> {translate("inactive")}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer border border-emerald-100"
                            title="Edit details & permissions"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>{translate("action.edit")}</span>
                          </button>
                          
                          <button
                            onClick={() => handleOpenResetPassword(t)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer border border-blue-100"
                            title="Reset password"
                          >
                            <Key className="h-3.5 w-3.5" />
                            <span>{translate("action.reset")}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteTrustee(t.id, t.fullName)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer border border-rose-100"
                            title="Delete Trustee account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>{translate("action.delete")}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                      {translate("trustee.noTrustees")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-xs">
              <span className="text-xs text-gray-500 font-medium">
                Showing page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span> ({filteredTrustees.length} trustees found)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-8 w-8 text-xs font-bold rounded-lg transition cursor-pointer ${
                      page === i + 1
                        ? "bg-red-700 text-white shadow-md shadow-red-700/10"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 my-8">
            {/* Modal Header */}
            <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span>ॐ</span>
                <h3 className="font-bold font-display text-lg">
                  {selectedTrustee ? (translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "विश्वस्त खाते तपशील आणि परवानग्या दुरुस्त करा" : "Update Trustee Details & Permissions") : (translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "नवीन विश्वस्त खाते तयार करा" : "Create Trustee Account")}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-white/80 hover:text-white hover:bg-red-800 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {validationErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{validationErrors.submit}</span>
                </div>
              )}

              {/* Account details section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider border-b border-red-100 pb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "१. विश्वस्तांचे ओळख तपशील" : "1. Trustee Identity Details"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{translate("field.name")} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
                        validationErrors.fullName ? "border-red-500 ring-red-100" : "border-gray-300"
                      }`}
                      placeholder={translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उदा. रमेश शंकर पाटील" : "e.g. Ramesh Shankar Patil"}
                    />
                    {validationErrors.fullName && <p className="text-[11px] text-red-500 mt-0.5">{validationErrors.fullName}</p>}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{translate("field.username")} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!!selectedTrustee}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 ${
                        validationErrors.username ? "border-red-500 ring-red-100" : "border-gray-300"
                      }`}
                      placeholder={translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उदा. ramesh_patil" : "e.g. ramesh_patil"}
                    />
                    {validationErrors.username && <p className="text-[11px] text-red-500 mt-0.5">{validationErrors.username}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{translate("field.email")}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
                        validationErrors.email ? "border-red-500 ring-red-100" : "border-gray-300"
                      }`}
                      placeholder="e.g. ramesh@example.com"
                    />
                    {validationErrors.email && <p className="text-[11px] text-red-500 mt-0.5">{validationErrors.email}</p>}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{translate("field.mobile")}</label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
                        validationErrors.mobile ? "border-red-500 ring-red-100" : "border-gray-300"
                      }`}
                      placeholder="e.g. 9876543210"
                    />
                    {validationErrors.mobile && <p className="text-[11px] text-red-500 mt-0.5">{validationErrors.mobile}</p>}
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{translate("field.designation")}</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder={translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उदा. अध्यक्ष / कोषाध्यक्ष / सक्रिय विश्वस्त" : "e.g. President / Treasurer / Active Trustee"}
                    />
                  </div>
                </div>

                {/* Profile Photo — full width with ImageUpload (file + camera) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    {translate("field.photo")}
                    <span className="ml-1 text-gray-400 font-normal">
                      ({translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "ऐच्छिक" : "Optional"})
                    </span>
                  </label>

                  {/* Show current photo + change option when editing */}
                  {selectedTrustee && profilePhoto && (
                    <div className="flex items-center gap-3 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <img
                        src={profilePhoto.startsWith("http") || profilePhoto.startsWith("/uploads") ? profilePhoto : `/uploads/${profilePhoto}`}
                        alt="Current profile"
                        className="h-12 w-12 rounded-full object-cover border-2 border-red-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "सध्याचा फोटो" : "Current Photo"}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">{profilePhoto}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfilePhoto("")}
                        className="text-xs text-red-600 hover:text-red-700 font-bold shrink-0 cursor-pointer"
                      >
                        {translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "बदला" : "Change"}
                      </button>
                    </div>
                  )}

                  {(!selectedTrustee || !profilePhoto) && (
                    <ImageUpload
                      onUploadSuccess={(url) => setProfilePhoto(url)}
                      defaultUrl=""
                      label=""
                      placeholder={
                        translate("nav.dashboard") === "मुख्य डॅशबोर्ड"
                          ? "प्रोफाइल फोटो अपलोड करा किंवा कॅमेरा वापरा"
                          : "Upload profile photo or use camera"
                      }
                      accept="image/*"
                    />
                  )}
                </div>

                {!selectedTrustee && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{translate("field.password")} <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
                          validationErrors.password ? "border-red-500 ring-red-100" : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                      />
                      {validationErrors.password && <p className="text-[11px] text-red-500 mt-0.5">{validationErrors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "पासवर्डची पुष्टी करा" : "Confirm Password"} <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
                          validationErrors.confirmPassword ? "border-red-500 ring-red-100" : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                      />
                      {validationErrors.confirmPassword && <p className="text-[11px] text-red-500 mt-0.5">{validationErrors.confirmPassword}</p>}
                    </div>
                  </div>
                )}

                {/* Status Toggle */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">{translate("field.status")}</label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-sm">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={status === "active"}
                        onChange={() => setStatus("active")}
                        className="text-red-700 focus:ring-red-600"
                      />
                      {translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "सक्रिय (लॉगिन सक्षम)" : "Active (Login Enabled)"}
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-sm">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={status === "inactive"}
                        onChange={() => setStatus("inactive")}
                        className="text-red-700 focus:ring-red-600"
                      />
                      {translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "निष्क्रिय (लॉगिन अक्षम)" : "Inactive (Login Disabled)"}
                    </label>
                  </div>
                </div>
              </div>

              {/* Permissions checkboxes grid */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider border-b border-red-100 pb-1.5 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> {translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "२. मॉड्यूल परवानग्या नियुक्त करा" : "2. Allocate Module Access Permissions"}
                </h4>

                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs bg-gray-50/50">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-xs font-bold uppercase">
                        <th className="px-4 py-2.5">{translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "मॉड्यूलचे नाव" : "Module Name"}</th>
                        <th className="px-4 py-2.5 text-center">{translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "वाचा (Read)" : "Read"}</th>
                        <th className="px-4 py-2.5 text-center">{translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "लिहा (Create)" : "Write (Create)"}</th>
                        <th className="px-4 py-2.5 text-center">{translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "दुरुस्त करा (Edit)" : "Update (Edit)"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* Receipts Row */}
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-800">{translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "देणगी पावती खातेवही" : "Donation Receipts Ledger"}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.receipts.read}
                            onChange={() => handlePermissionChange("receipts", "read")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.receipts.write}
                            onChange={() => handlePermissionChange("receipts", "write")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.receipts.update}
                            onChange={() => handlePermissionChange("receipts", "update")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                      </tr>

                      {/* Monthly Events */}
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-800">{translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "मासिक उत्सव आणि पूजा" : "Monthly Events & Poojas"}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.monthly_events.read}
                            onChange={() => handlePermissionChange("monthly_events", "read")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.monthly_events.write}
                            onChange={() => handlePermissionChange("monthly_events", "write")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.monthly_events.update}
                            onChange={() => handlePermissionChange("monthly_events", "update")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                      </tr>

                      {/* Yearly Events */}
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-800">{translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "वार्षिक उत्सव आणि मिरवणूक" : "Yearly Festivals & Processions"}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.yearly_events.read}
                            onChange={() => handlePermissionChange("yearly_events", "read")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.yearly_events.write}
                            onChange={() => handlePermissionChange("yearly_events", "write")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.yearly_events.update}
                            onChange={() => handlePermissionChange("yearly_events", "update")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                      </tr>

                      {/* Expenses Row */}
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-800">{translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खर्च खातेवही आणि खाती" : "Expense Ledger & Accounts"}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.expenses.read}
                            onChange={() => handlePermissionChange("expenses", "read")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.expenses.write}
                            onChange={() => handlePermissionChange("expenses", "write")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.expenses.update}
                            onChange={() => handlePermissionChange("expenses", "update")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                      </tr>

                      {/* Banners & Notifications */}
                      <tr className="bg-purple-50/30">
                        <td className="px-4 py-3 font-bold text-gray-800">
                          <span className="flex items-center gap-2">
                            
                            {translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "बॅनर आणि सूचना फलक" : "Banners & Notifications"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.banners.read}
                            onChange={() => handlePermissionChange("banners", "read")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.banners.write}
                            onChange={() => handlePermissionChange("banners", "write")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.banners.update}
                            onChange={() => handlePermissionChange("banners", "update")}
                            className="rounded text-red-700 focus:ring-red-600 h-4.5 w-4.5"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  {translate("action.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-md transition cursor-pointer"
                >
                  {selectedTrustee ? (translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खाते दुरुस्त करा" : "Update Account") : (translate("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "खाते तयार करा" : "Create Account")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Reset Password Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Lock className="h-4.5 w-4.5" />
                <h3 className="font-bold font-display text-base">
                  Reset Password: {selectedTrustee?.fullName}
                </h3>
              </div>
              <button
                onClick={() => setIsResetOpen(false)}
                className="text-white/80 hover:text-white hover:bg-red-800 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              {validationErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold">
                  {validationErrors.submit}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">New Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
                    validationErrors.newPassword ? "border-red-500 ring-red-100" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                {validationErrors.newPassword && <p className="text-[11px] text-red-500 mt-0.5">{validationErrors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
                    validationErrors.confirmNewPassword ? "border-red-500 ring-red-100" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                {validationErrors.confirmNewPassword && <p className="text-[11px] text-red-500 mt-0.5">{validationErrors.confirmNewPassword}</p>}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-md transition cursor-pointer"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
