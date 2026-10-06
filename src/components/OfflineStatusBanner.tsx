import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, RefreshCw } from 'lucide-react';

interface OfflineStatusBannerProps {
  onRefresh?: () => void;
}

export const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({ onRefresh }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      if (onRefresh) onRefresh();
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onRefresh]);

  if (isOnline && !justReconnected) {
    return null;
  }

  if (justReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-300">
        <div className="flex items-center gap-2 mx-auto">
          <Wifi className="w-4 h-4 text-emerald-200" />
          <span>Back Online • Reconnected &amp; Synced with Hub Server</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-amber-300 px-4 py-2 text-xs font-bold border-b border-amber-500/30 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Offline Mode • Displaying cached dashboard data &amp; recent test results
        </span>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reload Cache</span>
        </button>
      )}
    </div>
  );
};
