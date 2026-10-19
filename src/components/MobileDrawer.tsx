import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  IndianRupee,
  BookOpen,
  Calendar,
  Clock,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Image as ImageIcon,
  UsersRound,
  X,
  Sun,
  Moon,
  ChevronRight
} from "lucide-react";

export type Tab =
  | "dashboard"
  | "receipts"
  | "expenses"
  | "yearly_events"
  | "monthly_events"
  | "admin"
  | "trustees"
  | "banners"
  | "board_members";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}) => {
  const { user, logout, language, setLanguage, isDarkMode, setIsDarkMode, t } = useAuth();

  if (!isOpen) return null;

  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab);
    onClose();
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      setActiveTab("dashboard");
    } finally {
      onClose();
    }
  };

  const isMarathi = language === "mr";

  const navItems: { id: Tab; label: string; icon: React.ReactNode; show: boolean }[] = [
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      icon: <Home className="h-5 w-5" />,
      show: true,
    },
    {
      id: "receipts",
      label: t("nav.receipts"),
      icon: <IndianRupee className="h-5 w-5" />,
      show: true,
    },
    {
      id: "expenses",
      label: t("nav.expenses"),
      icon: <BookOpen className="h-5 w-5" />,
      show: true,
    },
    {
      id: "yearly_events",
      label: t("nav.yearly"),
      icon: <Calendar className="h-5 w-5" />,
      show: true,
    },
    {
      id: "monthly_events",
      label: t("nav.monthly"),
      icon: <Clock className="h-5 w-5" />,
      show: true,
    },
    {
      id: "banners",
      label: isMarathi ? "बॅनर आणि सूचना" : "Banners & Notifications",
      icon: <ImageIcon className="h-5 w-5" />,
      show: !!user,
    },
    {
      id: "board_members",
      label: isMarathi ? "विश्वस्त मंडळ" : "Board of Members",
      icon: <UsersRound className="h-5 w-5" />,
      show: true,
    },
    {
      id: "trustees",
      label: t("nav.trustees"),
      icon: <ShieldCheck className="h-5 w-5" />,
      show: !!user && user.role !== "trustee",
    },
    {
      id: "admin",
      label: t("nav.zone"),
      icon: <User className="h-5 w-5" />,
      show: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide-in Drawer Container */}
      <aside className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col overflow-hidden animate-slideInRight">
        {/* Mandir Saffron Header inside Drawer */}
        <div
          className="p-5 text-white flex items-center justify-between shrink-0 relative overflow-hidden"
          style={{ backgroundColor: "#fa5c07" }}
        >
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none select-none text-8xl">
            ॐ
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div 
              className="h-12 w-12 rounded-xl overflow-hidden shadow shrink-0"
              style={{ border: "2px solid #d4af37" }}
            >
              <img
                src="/mandir.jpg"
                alt="Shree Bhairavnath Mandir Talawade"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div>
              <p className="text-amber-200 font-bold tracking-widest text-[9px] uppercase font-display">
                {t("brand.prassana")}
              </p>
              <h2 className="text-base font-black font-display tracking-tight text-white leading-tight">
                {t("brand.title")}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer relative z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Account Info / Login Banner inside Drawer */}
        <div className="p-4 bg-orange-50/50 dark:bg-gray-800/50 border-b border-orange-100 dark:border-gray-800 shrink-0">
          {user ? (
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-2xl border border-orange-200/60 dark:border-gray-700 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {user.name || user.username}
                  </h4>
                  <span className="inline-flex px-2 py-0.5 mt-0.5 text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 rounded-full uppercase tracking-wider">
                    {user.role.replace("_", " ")}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogoutClick}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                title={t("nav.logout")}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick("admin")}
              className="w-full flex items-center justify-between bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-sm px-4 py-3 rounded-2xl shadow-md transition hover:opacity-95 cursor-pointer min-h-[44px]"
            >
              <div className="flex items-center gap-2.5">
                <LogIn className="h-5 w-5" />
                <span>{t("nav.login")}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/80" />
            </button>
          )}
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer min-h-[48px] ${
                    isActive
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={isActive ? "text-white" : "text-orange-600 dark:text-orange-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
        </div>

        {/* Bottom Drawer Footer: Language & Theme Controls */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950 flex items-center justify-between shrink-0">
          {/* Language Switcher */}
          <div className="flex bg-gray-200 dark:bg-gray-800 rounded-xl p-1 border border-gray-300/40 dark:border-gray-700 select-none">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer min-h-[36px] ${
                language === "en"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("mr")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer min-h-[36px] ${
                language === "mr"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              मराठी
            </button>
          </div>

          {/* Dark Mode Switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs hover:bg-gray-100 transition cursor-pointer min-h-[44px]"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};
