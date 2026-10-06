import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  PlusCircle, 
  BookOpen, 
  PenLine, 
  Grid, 
  BarChart3, 
  BookMarked, 
  User, 
  Users, 
  HelpCircle,
  X,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { Role } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'my-tests'
  | 'create-test'
  | 'mcq-bank'
  | 'descriptive-tests'
  | 'omr-sheet'
  | 'results'
  | 'attendance'
  | 'study-materials'
  | 'profile'
  | 'students-form'
  | 'admin-manage';

interface NavigationSidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  role: Role;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  role,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; roles: Role[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['student', 'teacher', 'admin'] },
    { id: 'my-tests', label: 'My Tests', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['student', 'teacher', 'admin'] },
    { id: 'create-test', label: 'Create Test', icon: <PlusCircle className="w-5 h-5" />, roles: ['teacher', 'admin'] },
    { id: 'mcq-bank', label: 'MCQ Bank', icon: <BookOpen className="w-5 h-5" />, roles: ['student', 'teacher', 'admin'] },
    { id: 'descriptive-tests', label: 'Descriptive Tests', icon: <PenLine className="w-5 h-5" />, roles: ['student', 'teacher', 'admin'] },
    { id: 'omr-sheet', label: 'OMR Sheet', icon: <Grid className="w-5 h-5" />, roles: ['student', 'teacher', 'admin'] },
    { id: 'results', label: 'Results & Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['student', 'teacher', 'admin'] },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-5 h-5" />, roles: ['student', 'teacher', 'admin'] },
    { id: 'study-materials', label: 'Study Materials', icon: <BookMarked className="w-5 h-5" />, roles: ['student', 'teacher', 'admin'] },
    { id: 'profile', label: 'My Profile', icon: <User className="w-5 h-5" />, roles: ['student', 'teacher', 'admin'] },
    { id: 'students-form', label: 'Students Form', icon: <Users className="w-5 h-5" />, roles: ['teacher', 'admin'] },
    { id: 'admin-manage', label: 'System Admin', icon: <ShieldCheck className="w-5 h-5" />, roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#111827] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding Section matching reference image */}
        <div>
          <div className="p-5 pb-4 border-b border-slate-800/80 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Blue Graduation Diamond Icon */}
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-base tracking-tight text-white uppercase">
                  ATTA SAMEJO
                </div>
                <div className="text-[10px] font-semibold text-slate-300 tracking-wider uppercase">
                  EDUCATIONAL HUB
                </div>
                <div className="text-[9px] font-medium text-sky-400 mt-1 flex items-center gap-1">
                  <span>Learn</span>
                  <span className="text-[6px]">•</span>
                  <span>Practice</span>
                  <span className="text-[6px]">•</span>
                  <span>Achieve</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {visibleItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: Need Help? Contact Support */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer">
            <HelpCircle className="w-5 h-5 text-sky-400 shrink-0" />
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-white">Need Help?</div>
              <div className="text-[10px] text-slate-400">Contact Support</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
