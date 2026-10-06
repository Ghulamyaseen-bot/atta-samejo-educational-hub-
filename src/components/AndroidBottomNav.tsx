import React from 'react';
import { LayoutDashboard, ClipboardCheck, BarChart3, User } from 'lucide-react';
import { NavTab } from './NavigationSidebar';

interface AndroidBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isInsidePhoneSimulator?: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentTab,
  onSelectTab,
  isInsidePhoneSimulator = false,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
    { id: 'my-tests' as NavTab, label: 'Tests', icon: ClipboardCheck },
    { id: 'results' as NavTab, label: 'Results', icon: BarChart3 },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  const positionClass = isInsidePhoneSimulator
    ? 'absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-4 flex items-center justify-around shadow-lg'
    : 'fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-6 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg lg:hidden';

  return (
    <nav className={positionClass}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer py-1 px-3 ${
              isActive ? 'text-blue-600 font-extrabold' : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-transparent'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-none tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
