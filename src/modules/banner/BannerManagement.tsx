import React, { useState, useEffect } from "react";
import { Banner } from "../../types";
import { api, useAuth } from "../../context/AuthContext";
import { ImageUpload } from "../../components/ImageUpload";
import { Plus, X, Trash2, Calendar, LayoutGrid, Type, Palette, Clock, Check, AlertCircle } from "lucide-react";

export const BannerManagement: React.FC = () => {
  const { t, user } = useAuth();
  const isMarathi = t("nav.dashboard") === "मुख्य डॅशबोर्ड";

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [bannerType, setBannerType] = useState<"image" | "text">("image");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [textColor, setTextColor] = useState("#991b1b");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preset Premium Colors
  const presetColors = [
    { name: isMarathi ? "गडद लाल" : "Dark Red", value: "#991b1b" },
    { name: isMarathi ? "नारिंगी" : "Orange", value: "#ea580c" },
    { name: isMarathi ? "हिरवा" : "Emerald", value: "#047857" },
    { name: isMarathi ? "निळा" : "Indigo", value: "#4338ca" },
    { name: isMarathi ? "जांभळा" : "Purple", value: "#6d28d9" },
    { name: isMarathi ? "काळा" : "Charcoal", value: "#1f2937" }
  ];

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/banners/all");
      setBanners(response.data);
    } catch {
      // Ignore load error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDeactivate = async (id: string) => {
    const confirmDeactivate = window.confirm(
      isMarathi 
        ? "तुम्हाला हा बॅनर नक्की निष्क्रिय/हटवायचा आहे का?" 
        : "Are you sure you want to deactivate/delete this banner?"
    );
    if (!confirmDeactivate) return;

    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch {
      alert(isMarathi ? "निष्क्रिय करण्यात अडचण आली." : "Failed to deactivate banner.");
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!title.trim()) {
      tempErrors.title = isMarathi ? "शीर्षक आवश्यक आहे" : "Title is required";
    }
    if (bannerType === "image" && !image) {
      tempErrors.image = isMarathi ? "बॅनर चित्र आवश्यक आहे" : "Banner image is required";
    }
    if (bannerType === "text" && !description.trim()) {
      tempErrors.description = isMarathi ? "तपशील/वर्णन आवश्यक आहे" : "Description is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    // Build Font Style string
    const styleParts = [];
    if (isBold) styleParts.push("bold");
    if (isItalic) styleParts.push("italic");
    styleParts.push(fontFamily);
    const fontStyle = styleParts.join(" ");

    const payload = {
      title: title.trim(),
      image: bannerType === "image" ? image : null,
      description: bannerType === "text" ? description.trim() : null,
      color: bannerType === "text" ? textColor : null,
      fontStyle: bannerType === "text" ? fontStyle : null,
      expiresAt: expiresAt ? expiresAt : null,
      active,
    };

    try {
      await api.post("/banners", payload);
      setIsCreateOpen(false);
      // Reset form
      setTitle("");
      setBannerType("image");
      setImage("");
      setDescription("");
      setTextColor("#991b1b");
      setIsBold(false);
      setIsItalic(false);
      setFontFamily("sans-serif");
      setExpiresAt("");
      setActive(true);
      fetchBanners();
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.message || "Failed to create banner");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if banner is expired
  const isExpired = (ban: Banner) => {
    if (!ban.expiresAt) return false;
    return new Date(ban.expiresAt).getTime() < new Date().getTime();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-gray-800 dark:text-gray-150 tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-red-700 rounded-full"></span>
            {isMarathi ? "बॅनर आणि सूचना व्यवस्थापन" : "Mandir Scheme Banners & Notifications"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isMarathi 
              ? "मुख्य डॅशबोर्डवर दिसणारे महत्त्वपूर्ण बॅनर, मंदिर योजना आणि सूचना व्यवस्थापित करा." 
              : "Upload and schedule important scheme banners, announcements, or notifications displayed on the home page."}
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          {isMarathi ? "नवीन बॅनर जोडा" : "Add New Banner"}
        </button>
      </div>

      {/* Main content grid */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
          <p className="text-sm text-gray-400 mt-4">{isMarathi ? "लोड होत आहे..." : "Loading banners..."}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">{isMarathi ? "शीर्षक" : "Title"}</th>
                  <th className="px-6 py-4">{isMarathi ? "प्रकार" : "Type"}</th>
                  <th className="px-6 py-4">{isMarathi ? "पूर्वावलोकन" : "Preview"}</th>
                  <th className="px-6 py-4">{isMarathi ? "समाप्ती वेळ" : "Expiration Timer"}</th>
                  <th className="px-6 py-4">{isMarathi ? "स्थिती" : "Status"}</th>
                  <th className="px-6 py-4 text-center">{isMarathi ? "कृती" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {banners.length > 0 ? (
                  banners.map((ban) => {
                    const expired = isExpired(ban);
                    const isTxt = !ban.image;
                    const styleParts = ban.fontStyle ? ban.fontStyle.split(" ") : [];
                    const cardStyle: React.CSSProperties = {
                      color: ban.color || "#991b1b",
                      fontStyle: styleParts.includes("italic") ? "italic" : "normal",
                      fontWeight: styleParts.includes("bold") ? "bold" : "normal",
                      fontFamily: styleParts.includes("serif") ? "serif" : "sans-serif"
                    };

                    return (
                      <tr key={ban.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                          {ban.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isTxt 
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400" 
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                          }`}>
                            {isTxt ? <Type className="h-3 w-3" /> : <LayoutGrid className="h-3 w-3" />}
                            {isTxt ? (isMarathi ? "मजकूर" : "Text Notice") : (isMarathi ? "चित्र बॅनर" : "Image Banner")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {ban.image ? (
                            <img
                              src={ban.image}
                              alt={ban.title}
                              className="h-10 w-20 object-cover rounded-md border border-gray-200 dark:border-gray-700 shadow-2xs"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div 
                              className="h-10 w-20 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-[8px] font-bold overflow-hidden line-clamp-2 leading-tight bg-gray-50 dark:bg-gray-800"
                              style={cardStyle}
                            >
                              {ban.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-bold text-gray-600 dark:text-gray-400">
                          {ban.expiresAt ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              {new Date(ban.expiresAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic font-normal">{isMarathi ? "वेळ नाही" : "No expiration"}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-extrabold ${
                            expired
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400"
                              : ban.active && ban.status === "active"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-850 dark:text-gray-400"
                          }`}>
                            {expired 
                              ? (isMarathi ? "कालबाह्य" : "Expired") 
                              : ban.active && ban.status === "active"
                              ? (isMarathi ? "सक्रिय" : "Active") 
                              : (isMarathi ? "निष्क्रिय" : "Inactive")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {ban.status === "active" ? (
                            <button
                              onClick={() => handleDeactivate(ban.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer border border-rose-100"
                              title={isMarathi ? "निष्क्रिय करा" : "Deactivate / Delete"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>{isMarathi ? "हटवा" : "Delete"}</span>
                            </button>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-700 italic text-xs">{isMarathi ? "निष्क्रिय केलेले" : "Deactivated"}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                      {isMarathi ? "कोणतेही बॅनर सापडले नाहीत." : "No banners uploaded yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Modal Popup */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-800 animate-scaleIn">
            
            {/* Header */}
            <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>ॐ</span>
                <h3 className="font-bold font-display text-lg">
                  {isMarathi ? "नवीन बॅनर / योजना जोडा" : "Create Scheme Banner / Notice"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-white/80 hover:text-white hover:bg-red-800 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {apiError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {isMarathi ? "बॅनरचे शीर्षक / विषय *" : "Banner Title / Subject *"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isMarathi ? "उदा. महाशिवरात्र महोत्सव २०२६ किंवा नवीन देणगी योजना" : "e.g. Mahashivratri Mahotsav 2026 or Temple Renovation Scheme"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title}</p>}
              </div>

              {/* Banner Type Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {isMarathi ? "बॅनर प्रकार निवडा" : "Select Banner Type"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBannerType("image")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      bannerType === "image"
                        ? "bg-red-700 text-white border-red-700"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-350 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>{isMarathi ? "चित्र बॅनर" : "Image Banner"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerType("text")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      bannerType === "text"
                        ? "bg-red-700 text-white border-red-700"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-350 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Type className="h-4 w-4" />
                    <span>{isMarathi ? "मजकूर घोषणा" : "Text Notification"}</span>
                  </button>
                </div>
              </div>

              {/* Conditional Inputs */}
              {bannerType === "image" ? (
                /* IMAGE UPLOAD */
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {isMarathi ? "बॅनर प्रतिमा / पोस्टर अपलोड करा *" : "Upload Banner Image/Poster *"}
                  </label>
                  <ImageUpload
                    onUploadSuccess={(url) => setImage(url)}
                    defaultUrl={image}
                    label=""
                    placeholder={isMarathi ? "चित्र बॅनर निवडा किंवा येथे ड्रॅग करा" : "Drag and drop banner file, or click to browse"}
                  />
                  {errors.image && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.image}</p>}
                </div>
              ) : (
                /* TEXT NOTIFICATION OPTIONS */
                <div className="space-y-4 p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
                  {/* Description text */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {isMarathi ? "महत्त्वाची घोषणा / तपशील मजकूर *" : "Notification Description Text *"}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      placeholder={isMarathi ? "येथे मंदिराची महत्त्वाची सूचना किंवा योजनेची माहिती लिहा..." : "Write official temple announcement or scheme guidelines here..."}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600 resize-y"
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.description}</p>}
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Palette className="h-3.5 w-3.5" />
                      <span>{isMarathi ? "मजकूर रंग निवडा" : "Select Text Color"}</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {presetColors.map((col) => (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => setTextColor(col.value)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition"
                          style={{
                            borderColor: textColor === col.value ? col.value : "#e5e7eb",
                            backgroundColor: textColor === col.value ? `${col.value}15` : "white",
                            color: col.value
                          }}
                        >
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.value }}></span>
                          <span>{col.name}</span>
                          {textColor === col.value && <Check className="h-3 w-3 ml-0.5" />}
                        </button>
                      ))}
                    </div>
                    {/* Custom Color Input */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 font-bold">{isMarathi ? "किंवा सानुकूल रंग:" : "Or Custom Color:"}</span>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-7 w-12 border border-gray-300 dark:border-gray-700 rounded cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-gray-500 uppercase">{textColor}</span>
                    </div>
                  </div>

                  {/* Font Styles */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {isMarathi ? "फॉन्ट आणि शैली" : "Font Weight & Styles"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {/* Bold toggle */}
                      <button
                        type="button"
                        onClick={() => setIsBold(!isBold)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          isBold
                            ? "bg-red-700 text-white border-red-700"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-350 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {isMarathi ? "ठळक (Bold)" : "Bold"}
                      </button>
                      {/* Italic toggle */}
                      <button
                        type="button"
                        onClick={() => setIsItalic(!isItalic)}
                        className={`px-3 py-1.5 text-xs italic font-bold rounded-lg border transition cursor-pointer ${
                          isItalic
                            ? "bg-red-700 text-white border-red-700"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-350 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {isMarathi ? "तिरपे (Italic)" : "Italic"}
                      </button>
                      {/* Font Family selection */}
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
                      >
                        <option value="sans-serif">{isMarathi ? "सॅन्स-सेरिफ (Sans-Serif)" : "Sans-Serif"}</option>
                        <option value="serif">{isMarathi ? "सेरिफ (Serif)" : "Serif Style"}</option>
                        <option value="monospace">{isMarathi ? "मोनोस्पेस (Monospace)" : "Monospace"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Realtime Live Text Preview Box */}
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{isMarathi ? "घोषणा पूर्वावलोकन" : "Notification Notice Preview"}</span>
                    <div 
                      className="w-full p-4 bg-red-50/20 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center min-h-[70px] text-center"
                      style={{
                        color: textColor,
                        fontStyle: isItalic ? "italic" : "normal",
                        fontWeight: isBold ? "bold" : "normal",
                        fontFamily: fontFamily
                      }}
                    >
                      <p className="text-sm font-semibold whitespace-pre-wrap break-all leading-normal">
                        {description || (isMarathi ? "तुमचा सूचना संदेश येथे दिसेल..." : "Your announcement preview message will show here...")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timer/Expiration Field */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{isMarathi ? "बॅनर समाप्तीचा वेळ (टायमर - ऐच्छिक)" : "Banner Expiration Timer (Optional)"}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  {expiresAt && (
                    <button
                      type="button"
                      onClick={() => setExpiresAt("")}
                      className="px-3 py-2 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition border border-gray-250 cursor-pointer"
                    >
                      {isMarathi ? "रद्द" : "Clear"}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {isMarathi 
                    ? "या वेळानंतर बॅनर आपोआप निष्क्रिय होईल." 
                    : "After this specified date and time, the banner will automatically become inactive."}
                </p>
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-gray-300 dark:border-gray-700 text-red-700 focus:ring-red-600 cursor-pointer"
                />
                <label htmlFor="active" className="text-xs font-extrabold text-gray-600 dark:text-gray-350 select-none cursor-pointer">
                  {isMarathi ? "त्वरित सक्रिय करा (आता दाखवा)" : "Activate Immediately (Show Now)"}
                </label>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-150 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-gray-650 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition cursor-pointer"
                >
                  {isMarathi ? "रद्द करा" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 rounded-lg transition cursor-pointer"
                >
                  {submitting ? (isMarathi ? "जतन करत आहे..." : "Saving...") : (isMarathi ? "बॅनर जतन करा" : "Save Banner")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
