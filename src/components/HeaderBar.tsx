import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Smartphone, 
  Monitor, 
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  School,
  GraduationCap,
  Lock
} from 'lucide-react';
import { User, NotificationItem } from '../types';
import officialAdminPortrait from '../assets/FB_IMG_1790800525155.jpg';

interface HeaderBarProps {
  onToggleSidebar: () => void;
  currentUser: User;
  onLogout: () => void;
  isAndroidView: boolean;
  onToggleAndroidView: () => void;
  notifications: NotificationItem[];
  onSearch?: (query: string) => void;
  onNavigate?: (tab: string) => void;
}

// Permanent Administrator & Founder Portrait (Uneditable Institutional Branding)
export const ADMIN_PORTRAIT_PATH = officialAdminPortrait || '/assets/FB_IMG_1790800525155.jpg';
export const ADMIN_PORTRAIT_FALLBACK = '/FB_IMG_1790800525155.jpg';

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onToggleSidebar,
  currentUser,
  onLogout,
  isAndroidView,
  onToggleAndroidView,
  notifications,
  onSearch,
  onNavigate,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const isStudent = currentUser.role === 'student';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4 shadow-xs">
        {/* Left: Mobile Drawer Hamburger & OFFICIAL ADMINISTRATOR BRANDING CONTAINER */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* ========================================================================= */}
          {/* PROMINENT OFFICIAL ADMINISTRATOR BRANDING CONTAINER (UPPER LEFT SIDE)     */}
          {/* ========================================================================= */}
          <div 
            onClick={() => setShowAdminModal(true)}
            className="group flex items-center gap-2 sm:gap-2.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-slate-50 to-amber-50/80 border border-blue-200 hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer shrink-0"
            title="Click to view Official Administrator & Founder credentials"
          >
            {/* Administrator Portrait Box with Official Golden/Royal Blue Ring */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden ring-2 ring-amber-400 shadow-sm bg-slate-900 transition-transform group-hover:scale-105">
                <img
                  src={officialAdminPortrait || ADMIN_PORTRAIT_PATH}
                  alt="Official Administrator Ghulam Yaseen - Atta Samejo Educational Hub"
                  className="w-full h-full object-cover object-top select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.indexOf(ADMIN_PORTRAIT_FALLBACK) === -1) {
                      target.src = ADMIN_PORTRAIT_FALLBACK;
                    }
                  }}
                />
              </div>

              {/* Verified Administrator Badge Pill */}
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs"
                title="Verified Official Administration"
              >
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Administrator Branding Typography - Permanently Visible in Upper Left */}
            <div className="text-left leading-tight flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-[13px] font-black text-slate-900 tracking-tight whitespace-nowrap">
                  ATTA SAMEJO
                </span>
                <span className="inline-block px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 font-extrabold text-[9px] uppercase border border-amber-300 tracking-wide">
                  ADMIN
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 whitespace-nowrap">
                  Admin: Ghulam Yaseen
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">• Classes 1–12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md hidden md:block mx-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests, syllabus, or topics..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
          />
        </form>

        {/* Right: Actions, Android Preview Mode, Notification & USER PROFILE DROPDOWN */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Toggle Android Phone Frame view */}
          <button
            onClick={onToggleAndroidView}
            title={isAndroidView ? "Switch to Tablet/Desktop Dashboard View" : "Preview Android Phone Mode"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isAndroidView
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {isAndroidView ? (
              <>
                <Monitor className="w-4 h-4" />
                <span className="hidden lg:inline">Dashboard</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="hidden lg:inline">Android Mode</span>
              </>
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowProfileMenu(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                  <span className="font-bold text-xs text-slate-800">Notifications ({unreadCount})</span>
                  <button onClick={() => setShowNotifMenu(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* USER PROFILE INFO & DROPDOWN (DISTINCT STUDENT / PERSONAL ACCOUNT AREA)   */}
          {/* ========================================================================= */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifMenu(false);
              }}
              className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
                isStudent
                  ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/70'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              title={isStudent ? `Student Profile: ${currentUser.name}` : `Account: ${currentUser.name}`}
            >
              {/* Student's Own Uploaded Profile Photo or Teacher/Admin Official Photo */}
              <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ${
                isStudent ? 'ring-2 ring-emerald-500 bg-emerald-100' : 'ring-2 ring-amber-400/90 bg-slate-900 shadow-xs'
              }`}>
                <img
                  src={
                    (currentUser.role === 'admin' || currentUser.role === 'teacher')
                      ? '/assets/FB_IMG_1790800525155.jpg'
                      : (currentUser.avatar && currentUser.avatar !== '/assets/student_avatar.svg'
                          ? currentUser.avatar
                          : '/assets/FB_IMG_1790800525155.jpg')
                  }
                  alt={`Profile of ${currentUser.name}`}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = '/assets/FB_IMG_1790800525155.jpg';
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Student Name & Role Badge - Distinct from Administrator Branding */}
              <div className="text-left hidden sm:block leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                    isStudent 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/80' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {isStudent ? 'Student Profile' : currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* User Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        (currentUser.role === 'admin' || currentUser.role === 'teacher')
                          ? '/assets/FB_IMG_1790800525155.jpg'
                          : (currentUser.avatar && currentUser.avatar !== '/assets/student_avatar.svg'
                              ? currentUser.avatar
                              : '/assets/FB_IMG_1790800525155.jpg')
                      }
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover object-top ring-2 ring-slate-200"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/assets/FB_IMG_1790800525155.jpg';
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">@{currentUser.username}</div>
                      <div className="mt-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isStudent ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isStudent ? 'Student Profile' : currentUser.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="px-3 py-2 text-[11px] text-slate-500 space-y-1 border-b border-slate-100">
                  <div className="flex justify-between">
                    <span>Account ID:</span>
                    <span className="font-mono text-slate-700">{currentUser.id}</span>
                  </div>
                  {currentUser.phone && (
                    <div className="flex justify-between">
                      <span>Mobile:</span>
                      <span className="font-medium text-slate-700">{currentUser.phone}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onNavigate) onNavigate('profile');
                  }}
                  className="w-full mt-1 flex items-center justify-start gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Profile &amp; Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full mt-1 flex items-center justify-start gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL ADMINISTRATOR BRANDING & FOUNDER PROFILE DETAILS          */}
      {/* ========================================================================= */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header with Gold/Blue Theme */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white relative">
              <button
                onClick={() => setShowAdminModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  Official Institutional Leadership
                </span>
              </div>
              <h2 className="text-lg font-black text-white">ATTA SAMEJO EDUCATIONAL HUB</h2>
              <p className="text-xs text-blue-200">Classes 1–12 Academic Management Platform</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-center space-y-4">
              {/* Prominent High-Resolution Administrator Portrait */}
              <div className="relative inline-block mx-auto">
                <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-amber-400 shadow-xl bg-slate-900">
                  <img
                    src={ADMIN_PORTRAIT_PATH}
                    alt="Administrator Ghulam Yaseen"
                    className="w-full h-full object-cover object-top select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.indexOf(ADMIN_PORTRAIT_FALLBACK) === -1) {
                        target.src = ADMIN_PORTRAIT_FALLBACK;
                      }
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-md ring-2 ring-white flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>FOUNDER</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">Ghulam Yaseen</h3>
                <p className="text-xs font-bold text-blue-600">Administrator & Founder</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Official Administrator Profile of Atta Samejo Educational Hub. Governing institutional tests, OMR examinations, and student excellence.
                </p>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-left text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Institutional Distinctions:</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  • <strong>Administrator Photo:</strong> Official portal branding icon representing executive institutional leadership.
                </p>
                <p className="text-[11px] text-amber-800">
                  • <strong>Student Photos:</strong> Individual learner credentials uploaded during enrollment for personal ID slips and result report cards.
                </p>
              </div>

              <button
                onClick={() => setShowAdminModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                Close Administrator Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

