import React, { useState, useEffect } from "react";
import { api, useAuth } from "../../../context/AuthContext";
import { DashboardSummary, Banner, BoardMember } from "../../../types";
import { Calendar, Users, AlertCircle, User } from "lucide-react";
import "./Dashboard.css";

// Helper to detect if a hex color is too light for white background
const isLightColor = (hex: string | null | undefined): boolean => {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return false;
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return false;
  const r = parseInt(cleanHex.length === 3 ? cleanHex[0] + cleanHex[0] : cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.length === 3 ? cleanHex[1] + cleanHex[1] : cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.length === 3 ? cleanHex[2] + cleanHex[2] : cleanHex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 185;
};

// Helper to render bold markdown syntax like **text**
const renderFormattedText = (line: string) => {
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-extrabold text-gray-900 dark:text-amber-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

// Helper to render full notice description with markdown headers and styling
const renderNoticeDescription = (text: string, baseStyle?: React.CSSProperties) => {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-2.5 text-gray-800 dark:text-gray-200" style={baseStyle}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={idx}
              className="text-xl sm:text-2xl md:text-3xl font-black text-amber-900 dark:text-amber-400 font-display tracking-tight text-center md:text-left mt-1 mb-2 leading-snug"
            >
              {trimmed.replace(/^#\s+/, "")}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-lg sm:text-xl md:text-2xl font-bold text-red-900 dark:text-amber-300 font-display text-center md:text-left mt-1 mb-2 leading-snug"
            >
              {trimmed.replace(/^##\s+/, "")}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white font-display mt-1"
            >
              {trimmed.replace(/^###\s+/, "")}
            </h3>
          );
        }
        return (
          <p key={idx} className="text-xs sm:text-sm md:text-base leading-relaxed break-words">
            {renderFormattedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { t, language } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const isMarathi = language === "mr" || t("nav.dashboard") === "मुख्य डॅशबोर्ड";

  // Helper to get active banners as slides, with a fallback welcome slide if empty
  const getSlides = () => {
    const activeBanners = banners.filter(b => b.active);
    if (activeBanners.length > 0) {
      return activeBanners.map(b => ({ ...b, isBanner: true }));
    }
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

  // Slide rotation with pause on hover / interaction
  useEffect(() => {
    const count = slides.length;
    if (count <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % count);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners, slides.length, isPaused]);

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

        // Determine legitimate theme color
        const rawColor = currentSlide.color;
        const bannerColor = (!rawColor || isLightColor(rawColor)) ? "#991b1b" : rawColor;

        // Font style configuration for text-only notices
        const styleParts = currentSlide.fontStyle ? currentSlide.fontStyle.split(" ") : [];
        const textStyle: React.CSSProperties = {
          color: bannerColor,
          fontStyle: styleParts.includes("italic") ? "italic" : "normal",
          fontWeight: styleParts.includes("bold") ? "bold" : "normal",
          fontFamily: styleParts.includes("serif") ? "serif" : "sans-serif"
        };

        const hasH1 = currentSlide.description && currentSlide.description.includes("# ");
        const isGenericTitle = !currentSlide.title || ["public announcement", "announcement", "notice", "सूचना", "घोषणा"].includes(currentSlide.title.toLowerCase().trim());
        const titleMatchesH1 = hasH1 && currentSlide.description.toLowerCase().includes(currentSlide.title.toLowerCase().trim());
        const shouldShowTitle = currentSlide.title && !titleMatchesH1 && !isGenericTitle;

        return (
          <div 
            className="relative h-[420px] sm:h-[460px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-md group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {currentSlide.image ? (
              <>
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out transform scale-100 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex flex-col justify-end p-5 md:p-8">
                  <span className="bg-amber-500 text-black text-[10px] md:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full w-max mb-2 shadow-xs">
                    {badgeLabel}
                  </span>
                  <h2 className="text-xl md:text-4xl font-bold text-white font-display tracking-tight">
                    {currentSlide.title}
                  </h2>
                  <div className="max-h-36 overflow-y-auto pr-2 mt-2 custom-banner-scroll">
                    <p className="text-gray-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                      {currentSlide.description || (isMarathi ? "कृपा मिळवण्यासाठी श्री भैरवनाथ मंदिरात सहकुटुंब सहपरिवार उपस्थित राहा." : "Join us with family & devotees at Shree Bhairavnath Mandir to seek divine blessings.")}
                    </p>
                  </div>
                  {currentSlide.expiresAt && (
                    <span className="text-[10px] text-amber-400 font-mono font-bold mt-2">
                      {isMarathi ? `समाप्ती: ${new Date(currentSlide.expiresAt).toLocaleDateString("en-IN")}` : `Expires: ${new Date(currentSlide.expiresAt).toLocaleDateString("en-IN")}`}
                    </span>
                  )}
                </div>
              </>
            ) : (
              /* Text Description Banner Slide */
              <div 
                className="w-full h-full flex flex-col p-4 sm:p-6 md:p-8 transition-all duration-500 bg-white dark:bg-gray-900"
                style={{
                  borderLeft: `10px solid ${bannerColor}`
                }}
              >
                {/* Top header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-white text-[10px] md:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-xs"
                      style={{ backgroundColor: bannerColor }}
                    >
                      {badgeLabel}
                    </span>
                    <span className="text-[10px] sm:text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-2xs">
                      <span>📜</span> {isMarathi ? "खाली स्क्रोल करून पूर्ण वाचा" : "Scroll down to read all"}
                    </span>
                  </div>
                  {currentSlide.expiresAt && (
                    <span className="text-[10px] md:text-xs text-amber-700 dark:text-amber-400 font-mono font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {isMarathi 
                        ? `समाप्ती: ${new Date(currentSlide.expiresAt).toLocaleDateString("en-IN")}`
                        : `Expires: ${new Date(currentSlide.expiresAt).toLocaleDateString("en-IN")}`}
                    </span>
                  )}
                </div>

                {/* Scrollable text wording body */}
                <div 
                  className="flex-1 overflow-y-auto pr-3 pt-3 pb-10 overscroll-contain focus:outline-none custom-banner-scroll"
                  tabIndex={0}
                >
                  {shouldShowTitle && (
                    <h2 
                      className="text-lg sm:text-xl md:text-2xl font-black font-display tracking-tight mb-2"
                      style={textStyle}
                    >
                      {currentSlide.title}
                    </h2>
                  )}
                  {renderNoticeDescription(currentSlide.description, {
                    fontStyle: styleParts.includes("italic") ? "italic" : "normal",
                    fontFamily: styleParts.includes("serif") ? "serif" : "sans-serif"
                  })}
                </div>
              </div>
            )}

            {/* Slider navigation dots */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeSlide ? "bg-amber-500 w-5" : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 w-2"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}


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
