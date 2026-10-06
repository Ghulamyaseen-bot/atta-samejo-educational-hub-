import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Smartphone, 
  Monitor, 
  User as UserIcon,
  CheckCircle,
  X
} from 'lucide-react';
import { User, NotificationItem } from '../types';

interface HeaderBarProps {
  onToggleSidebar: () => void;
  currentUser: User;
  onLogout: () => void;
  isAndroidView: boolean;
  onToggleAndroidView: () => void;
  notifications: NotificationItem[];
  onSearch?: (query: string) => void;
  onSwitchUser?: (username: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onToggleSidebar,
  currentUser,
  onLogout,
  isAndroidView,
  onToggleAndroidView,
  notifications,
  onSearch,
  onSwitchUser,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Hamburger & Search */}
      <div className="flex items-center gap-3.5 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search input matching reference */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests, topics, or subjects..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </form>
      </div>

      {/* Right: Actions, Android Preview Mode, Notification & User Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Toggle Android Phone Frame view */}
        <button
          onClick={onToggleAndroidView}
          title={isAndroidView ? "Switch to Tablet/Desktop Dashboard View" : "Preview Android Phone Mode"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isAndroidView
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {isAndroidView ? (
            <>
              <Monitor className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard Mode</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Android View</span>
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
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
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
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
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

        {/* User Profile Info & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-600/30 bg-blue-50 shrink-0">
              <img
                src={currentUser.avatar || "/assets/student_avatar.svg"}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left hidden sm:block leading-tight">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[11px] font-medium text-slate-500 capitalize">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="p-2.5 border-b border-slate-100">
                <div className="font-bold text-xs text-slate-800">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 capitalize">Role: {currentUser.role}</div>
              </div>

              {/* Quick switch between Student / Teacher / Admin */}
              {onSwitchUser && (
                <div className="py-2 border-b border-slate-100">
                  <div className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Permanent System Roles
                  </div>
                  <button
                    onClick={() => { onSwitchUser('teacher'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">Sir Ghulam Yaseen</span>
                      <span className="text-[10px] text-emerald-600 block">Teacher • ghulamyaseen123</span>
                    </div>
                    {currentUser.role === 'teacher' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => { onSwitchUser('admin'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">Ghulam Yaseen</span>
                      <span className="text-[10px] text-purple-600 block">Admin • ghulamyaseen786</span>
                    </div>
                    {currentUser.role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                  <button
                    onClick={() => { onSwitchUser('student'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">Ghulam Yaseen</span>
                      <span className="text-[10px] text-blue-600 block">Student • Class 10</span>
                    </div>
                    {currentUser.role === 'student' && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full mt-1 flex items-center gap-2 px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
