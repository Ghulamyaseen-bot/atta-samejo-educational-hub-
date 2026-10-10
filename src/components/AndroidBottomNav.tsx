import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.nav 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={positionClass}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex flex-col items-center justify-center gap-1 cursor-pointer py-1 px-3 ${
              isActive ? 'text-blue-600 font-extrabold' : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <div className="relative p-1.5 rounded-xl">
              {isActive && (
                <motion.div
                  layoutId={isInsidePhoneSimulator ? 'bottomNavSimActive' : 'bottomNavRealActive'}
                  className="absolute inset-0 bg-blue-50 rounded-xl"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-none tracking-tight relative z-10">{tab.label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
};
