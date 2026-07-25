import React, { useState, useEffect } from "react";
import { api, useAuth } from "../../../context/AuthContext";
import { DashboardSummary, Banner, BoardMember } from "../../../types";
import { TrendingUp, TrendingDown, Calendar, Users, Bell, AlertCircle, User } from "lucide-react";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
  const { t } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, bannerRes, membersRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/banners"),
          api.get("/board_members"),
        ]);
        setSummary(sumRes.data);
        setBanners(bannerRes.data);
        setBoardMembers(membersRes.data);
      } catch (err: any) {
        setError("Failed to fetch dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to get active banners as slides, with a fallback welcome slide if empty
  const getSlides = () => {
    const activeBanners = banners.filter(b => b.active);
    if (activeBanners.length > 0) {
      return activeBanners.map(b => ({ ...b, isBanner: true }));
    }
    const isMarathi = t("nav.dashboard") === "मुख्य डॅशबोर्ड";
    return [
      {
        id: "welcome-fallback",
        title: isMarathi ? "श्री भैरवनाथ मंदिर ट्रस्ट" : "Shree Bhairavnath Mandir Trust",
        description: isMarathi 
          ? "भव्य स्वागत! श्री भैरवनाथ मंदिर ट्रस्ट, तळवडे, पुणे मध्ये आपले सहर्ष स्वागत." 
          : "Welcome! Shree Bhairavnath Mandir Trust, Talwade, Pune welcomes all devotees.",
        color: "#991b1b",
        fontStyle: "bold",
        isBanner: true,
        image: null,
        expiresAt: null
      }
    ];
  };

  const slides = getSlides();

  // Slide rotation
  useEffect(() => {
    const count = getSlides().length;
    if (count <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % count);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">{t("dashboard.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto my-10">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Large Upcoming Events / Slider Section */}
      {slides.length > 0 && (() => {
        const currentSlide = slides[activeSlide % slides.length];
        const isMarathi = t("nav.dashboard") === "मुख्य डॅशबोर्ड";

        // Dynamic Badge label
        let badgeLabel = isMarathi ? "नियोजित उत्सव" : "UPCOMING MAHOTSAV";
        if (currentSlide.isBanner) {
          const lowerTitle = currentSlide.title.toLowerCase();
          if (lowerTitle.includes("scheme") || lowerTitle.includes("donation") || lowerTitle.includes("renovation") || lowerTitle.includes("देणगी") || lowerTitle.includes("योजना")) {
            badgeLabel = isMarathi ? "मंदिर योजना" : "MANDIR SCHEME";
          } else {
            badgeLabel = isMarathi ? "घोषणा / सूचना" : "ANNOUNCEMENT";
          }
        }

        // Font style configuration for text-only notices
        const styleParts = currentSlide.fontStyle ? currentSlide.fontStyle.split(" ") : [];
        const textStyle: React.CSSProperties = {
          color: currentSlide.color || "#991b1b",
          fontStyle: styleParts.includes("italic") ? "italic" : "normal",
          fontWeight: styleParts.includes("bold") ? "bold" : "normal",
          fontFamily: styleParts.includes("serif") ? "serif" : "sans-serif"
        };

        return (
          <div className="relative h-[320px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-md group">
            {currentSlide.image ? (
              <>
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out transform scale-100 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                  <span className="bg-amber-500 text-black text-[10px] md:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full w-max mb-3">
                    {badgeLabel}
                  </span>
                  <h2 className="text-xl md:text-4xl font-bold text-white font-display tracking-tight">
                    {currentSlide.title}
                  </h2>
                  <p className="text-gray-200 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed line-clamp-3">
                    {currentSlide.description || (isMarathi ? "कृपा मिळवण्यासाठी श्री भैरवनाथ मंदिरात सहकुटुंब सहपरिवार उपस्थित राहा." : "Join us with family & devotees at Shree Bhairavnath Mandir to seek divine blessings.")}
                  </p>
                  {currentSlide.expiresAt && (
                    <span className="text-[9px] text-amber-400 font-mono font-bold mt-2">
                      {isMarathi ? `समाप्ती: ${new Date(currentSlide.expiresAt).toLocaleDateString("en-IN")}` : `Expires: ${new Date(currentSlide.expiresAt).toLocaleDateString("en-IN")}`}
                    </span>
                  )}
                </div>
              </>
            ) : (
              /* Text Description Banner Slide */
              <div 
                className="w-full h-full flex flex-col justify-between p-6 md:p-10 transition-all duration-500 bg-white dark:bg-gray-900"
                style={{
                  borderLeft: `12px solid ${currentSlide.color || "#991b1b"}`
                }}
              >
                <div>
                  <span 
                    className="text-white text-[10px] md:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full w-max mb-3 inline-block"
                    style={{ backgroundColor: currentSlide.color || "#991b1b" }}
                  >
                    {badgeLabel}
                  </span>
                  <h2 
                    className="text-xl md:text-3xl font-black font-display tracking-tight mt-2"
                    style={textStyle}
                  >
                    {currentSlide.title}
                  </h2>
                  <p 
                    className="text-gray-700 dark:text-gray-300 text-sm md:text-base mt-4 max-w-2xl whitespace-pre-wrap leading-relaxed"
                    style={{
                      fontStyle: styleParts.includes("italic") ? "italic" : "normal",
                      fontFamily: styleParts.includes("serif") ? "serif" : "sans-serif"
                    }}
                  >
                    {currentSlide.description}
                  </p>
                </div>
                {currentSlide.expiresAt && (
                  <span className="text-[10px] text-amber-600 font-mono font-bold">
                    {isMarathi 
                      ? `समाप्ती: ${new Date(currentSlide.expiresAt).toLocaleString("en-IN")}`
                      : `Expires: ${new Date(currentSlide.expiresAt).toLocaleString("en-IN")}`}
                  </span>
                )}
              </div>
            )}

            {/* Slider navigation dots */}
            <div className="absolute bottom-4 right-6 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeSlide ? "bg-amber-400 w-6" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        );
      })()}

      {/* 2. Welcome Announcement Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-3">
          <div className="bg-amber-500 text-white rounded-full p-2 h-max">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 font-display text-sm md:text-base">{t("dashboard.announceTitle")}</h4>
            <p className="text-xs md:text-sm text-amber-800 mt-0.5">
              {t("dashboard.announceDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bento Grid - Dashboard Statistics (Yearly & Monthly Events only) */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Yearly Events */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 bento-card">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t("dashboard.yearlyEvents")}</p>
              <p className="text-2xl font-black text-gray-800 mt-1 font-display">
                {summary.yearlyEvents} {summary.yearlyEvents === 1 ? t("dashboard.celebration") : t("dashboard.celebrations")}
              </p>
              <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                {t("dashboard.grandChariot")}
              </span>
            </div>
          </div>

          {/* Monthly Events */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 bento-card">
            <div className="p-3.5 bg-red-50 text-red-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t("dashboard.monthlyEvents")}</p>
              <p className="text-2xl font-black text-gray-800 mt-1 font-display">
                {summary.monthlyEvents} {summary.monthlyEvents === 1 ? t("dashboard.pooja") : t("dashboard.poojas")}
              </p>
              <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                {t("dashboard.devotionalHavan")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Board of Members Section */}
      {boardMembers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold font-display text-gray-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-amber-500 rounded-full"></span>
            {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "विश्वस्त मंडळ" : "Board of Members"}
          </h3>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-gray-200">
              {boardMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center text-center px-6 py-8 hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Square photo */}
                  <div className="mb-4">
                    {member.profilePhoto ? (
                      <img
                        src={member.profilePhoto}
                        alt={member.name}
                        className="h-28 w-28 rounded-xl object-cover object-top border-4 border-gray-100 shadow-md"
                      />
                    ) : (
                      <div className="h-28 w-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-gray-100 shadow-md">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {/* Name */}
                  <h4 className="font-bold text-gray-900 text-sm leading-snug max-w-[180px]">{member.name}</h4>
                  {/* Designation */}
                  {member.designation && (
                    <p className="text-xs text-gray-500 mt-1 leading-tight max-w-[180px]">{member.designation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Dashboard;
