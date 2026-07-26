import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Dashboard } from "./modules/dashboard/view/Dashboard";
import { Receipt } from "./modules/receipt/view/Receipt";
import { Expense } from "./modules/expense/view/Expense";
import { YearlyEvent } from "./modules/yearly-event/view/YearlyEvent";
import { MonthlyEvent } from "./modules/monthly-event/view/MonthlyEvent";
import { LoginView } from "./modules/login/view/LoginView";
import { TrusteeManagement } from "./modules/trustee/TrusteeManagement";
import { BannerManagement } from "./modules/banner/BannerManagement";
import { BoardMembers } from "./modules/board-members/BoardMembers";
import { MobileDrawer, Tab } from "./components/MobileDrawer";
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
  Menu,
} from "lucide-react";

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logout, language, setLanguage, isDarkMode, setIsDarkMode, t } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setActiveTab("dashboard");
    } catch {
      // Ignore logout errors
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "receipts":
        return <Receipt />;
      case "expenses":
        return <Expense />;
      case "yearly_events":
        return <YearlyEvent />;
      case "monthly_events":
        return <MonthlyEvent />;
      case "board_members":
        return <BoardMembers />;
      case "banners":
        return <BannerManagement />;
      case "trustees":
        return user && user.role !== "trustee" ? <TrusteeManagement /> : <Dashboard />;
      case "admin":
        return user ? (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 text-red-700 border border-red-100">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-gray-900">Secure Admin Session</h3>
              <p className="text-xs text-gray-500 mt-1">
                You are currently logged in as a recognized official of Shree Bhairavnath Mandir Trust.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Username</span>
                <span className="font-bold text-gray-800 font-mono">{user.username}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Authorized Role</span>
                <span className="inline-flex px-2 py-0.5 text-xs font-bold bg-red-100 text-red-800 rounded-full uppercase tracking-wider">
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Privilege Level</span>
                <span className="font-semibold text-gray-700 truncate max-w-[200px]">{user.permissions}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition duration-150 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {t("nav.logout")}
            </button>
          </div>
        ) : (
          <LoginView onSuccess={() => setActiveTab("dashboard")} />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col antialiased">
      {/* 1. Header with Mandir branding */}
      <header className="text-white shadow-md relative overflow-hidden shrink-0" style={{ backgroundColor: "#fa5c07" }}>
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-20 -translate-y-20 select-none text-[220px]">
          ॐ
        </div>
        <div className="px-4 py-3 md:py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 text-left">
            {/* Mandir image - square */}
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl overflow-hidden border-2 border-white/40 shadow-lg shrink-0">
              <img
                src="/mandir.jpg"
                alt="Shree Bhairavnath Mandir"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div>
              <p className="text-amber-200 font-bold tracking-widest text-[9px] md:text-xs uppercase font-display">
                {t("brand.prassana")}
              </p>
              <h1 className="text-lg md:text-2xl font-black font-display tracking-tight text-white mt-0.5 leading-tight">
                {t("brand.title")}
              </h1>
              <p className="text-[11px] md:text-xs text-white/70 mt-0.5 line-clamp-1 md:line-clamp-none">
                {t("brand.subtitle")}
              </p>
            </div>
          </div>

          {/* Desktop User Info & Login Button (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/20" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.username}</p>
                  <p className="text-[10px] font-semibold text-amber-200 uppercase tracking-wider">{user.role.replace("_", " ")}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                  title={t("nav.logout")}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("admin")}
                className="flex items-center gap-2 bg-white text-orange-700 hover:bg-amber-50 font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition duration-150 shadow-md cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                {t("nav.login")}
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button (Visible ONLY on Mobile md:hidden) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* 2. Desktop Navigation Menu Bar (Hidden on Mobile) */}
      <nav className="hidden md:block bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40 shrink-0">
        <div className="mx-auto px-4 flex items-center justify-between">
          <div className="flex overflow-x-auto no-scrollbar py-1 flex-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "dashboard"
                  ? "border-red-700 text-red-700 bg-red-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Home className="h-4 w-4" />
              {t("nav.dashboard")}
            </button>

            <button
              onClick={() => setActiveTab("receipts")}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "receipts"
                  ? "border-red-700 text-red-700 bg-red-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <IndianRupee className="h-4 w-4" />
              {t("nav.receipts")}
            </button>

            <button
              onClick={() => setActiveTab("expenses")}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "expenses"
                  ? "border-red-700 text-red-700 bg-red-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {t("nav.expenses")}
            </button>

            <button
              onClick={() => setActiveTab("yearly_events")}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "yearly_events"
                  ? "border-red-700 text-red-700 bg-red-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Calendar className="h-4 w-4" />
              {t("nav.yearly")}
            </button>

            <button
              onClick={() => setActiveTab("monthly_events")}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "monthly_events"
                  ? "border-red-700 text-red-700 bg-red-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Clock className="h-4 w-4" />
              {t("nav.monthly")}
            </button>

            {user && (
              <button
                onClick={() => setActiveTab("banners")}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === "banners"
                    ? "border-red-700 text-red-700 bg-red-50/10"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "बॅनर आणि सूचना" : "Banners & Notifications"}
              </button>
            )}

            <button
              onClick={() => setActiveTab("board_members")}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "board_members"
                  ? "border-red-700 text-red-700 bg-red-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <UsersRound className="h-4 w-4" />
              {t("nav.dashboard") === "मुख्य डॅशबोर्ड" ? "विश्वस्त मंडळ" : "Board of Members"}
            </button>

            {user && user.role !== "trustee" && (
              <button
                onClick={() => setActiveTab("trustees")}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === "trustees"
                    ? "border-red-700 text-red-700 bg-red-50/10"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                {t("nav.trustees")}
              </button>
            )}

            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ml-auto ${
                activeTab === "admin"
                  ? "border-red-700 text-red-700 bg-red-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <User className="h-4 w-4" />
              {t("nav.zone")}
            </button>
          </div>

          {/* Desktop Fixed Dark Mode & Language Toggles */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
            {/* Language switches */}
            <div className="flex bg-gray-100 dark:bg-gray-800/80 rounded-lg p-0.5 border border-gray-200/50 dark:border-gray-700/50 select-none">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-red-700 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("mr")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  language === "mr"
                    ? "bg-red-700 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Dark Mode switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <span className="text-sm">☀️</span>
              ) : (
                <span className="text-sm">🌙</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Reusable Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 3. Main Dashboard Body Container */}
      <main className="flex-1 w-full mx-auto p-4 md:p-6 pb-20">
        {renderContent()}
      </main>

      {/* 4. Devotional Footer */}
      <footer className="text-white/70 py-6 border-t text-center text-xs shrink-0 select-none" style={{ backgroundColor: "#7a2a02", borderColor: "#5e2002" }}>
        <p className="font-display tracking-widest text-amber-300 font-bold mb-1">
          {t("brand.footer1")}
        </p>
        <p>{t("brand.footer2")}</p>
        <p className="mt-1 text-white/30 text-[10px]">{t("brand.footer3")}</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
