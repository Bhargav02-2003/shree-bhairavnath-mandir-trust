import React, { useState, useEffect } from "react";
import { TempleEvent } from "../../../types";
import { ImageUpload } from "../../../components/ImageUpload";
import { X, Save, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./CreateYearlyEvent.css";

interface CreateYearlyEventProps {
  event?: TempleEvent | null;
  onSave: (data: Partial<TempleEvent>) => Promise<void>;
  onClose: () => void;
}

export const CreateYearlyEvent: React.FC<CreateYearlyEventProps> = ({
  event,
  onSave,
  onClose,
}) => {
  const { t, user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setDate(event.date);
      setImage(event.image);
      setLocation(event.location);
      setStatus(event.eventStatus);
    } else {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [event]);

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    const isMarathi = t("nav.dashboard") === "मुख्य डॅशबोर्ड";
    if (!title.trim()) tempErrors.title = isMarathi ? "उत्सवाचे शीर्षक आवश्यक आहे" : "Event title is required";
    if (!description.trim()) tempErrors.description = isMarathi ? "तपशील आवश्यक आहे" : "Description is required";
    if (!date) tempErrors.date = isMarathi ? "उत्सवाची तारीख आवश्यक आहे" : "Event celebration date is required";
    if (!image) tempErrors.image = isMarathi ? "उत्सव बॅनर/चित्र आवश्यक आहे" : "Event cover banner/image is required";
    if (!location.trim()) tempErrors.location = isMarathi ? "ठिकाण/स्थळ आवश्यक आहे" : "Location/Venue is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    const payload: Partial<TempleEvent> & { authorUuid?: string | null } = {
      title: title.trim(),
      description: description.trim(),
      date,
      image,
      location: location.trim(),
      status,
      authorUuid: user?.uuid || user?.id || null,
    };

    try {
      await onSave(payload);
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.message || (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उत्सव जतन करण्यात आला नाही." : "Failed to save event information."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-scaleIn">
        
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>ॐ</span>
            <h3 className="font-bold font-display text-lg">
              {event ? (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "वार्षिक उत्सव दुरुस्त करा" : "Modify Yearly Event") : (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "नवीन वार्षिक उत्सव जोडा" : "Add Yearly Chariot / Event")}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {apiError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उत्सव/कार्यक्रमाचे शीर्षक" : "Festival/Event Title"}
            </label>
            <input
              type="text"
              placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उदा. श्री भैरवनाथ वार्षिक पालखी सोहळा" : "e.g. Shree Bhairavnath Annual Palkhi Sohala"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-600"
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "कार्यक्रमाचे वर्णन आणि वेळापत्रक" : "Event Description & Timings"}
            </label>
            <textarea
              rows={3}
              placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "संपूर्ण माहिती, महाप्रसाद वाटप आणि आरतीच्या वेळा इ. माहिती द्या" : "Provide complete overview, distribution of Mahaprasad details, aarti timings etc."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-600"
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("field.date")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उत्सव स्थिती" : "Celebration Status"}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="upcoming">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "नियोजित" : "Upcoming"}</option>
                <option value="completed">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "पूर्ण" : "Completed"}</option>
                <option value="cancelled">{t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "रद्द" : "Cancelled"}</option>
              </select>
            </div>
          </div>

          {/* Venue / Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              {t("field.location")}
            </label>
            <input
              type="text"
              placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उदा. यज्ञ शाळा / मुख्य मंदिर परिसर" : "e.g. Yajna Shala / Temple Inner Precincts"}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.location ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-600"
              }`}
            />
            {errors.location && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.location}</p>}
          </div>

          {/* Image upload */}
          <div>
            <ImageUpload
              label={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उत्सव बॅनर / निमंत्रण पत्रिका फोटो अपलोड करा" : "Event Banner / Invitation Photo"}
              placeholder={t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उत्कृष्ट मंदिर/उत्सव पोस्टर किंवा कव्हर फोटो अपलोड करा" : "Upload gorgeous temple/festival poster or cover image"}
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

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
            >
              {t("action.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-800 transition shadow-sm disabled:bg-red-400 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {submitting ? t("action.saving") : event ? (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उत्सव दुरुस्त करा" : "Update Event") : (t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "उत्सव तयार करा" : "Create Event")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateYearlyEvent;
