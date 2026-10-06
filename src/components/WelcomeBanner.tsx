import React, { useState, useEffect, useRef } from 'react';
import { Target, ArrowRight, Camera, Check, UploadCloud } from 'lucide-react';

const STORAGE_PORTRAIT_KEY = 'ghulam_official_portrait_data_v1';
export const DEFAULT_PORTRAIT_URL = '/assets/FB_IMG_1790800525155.jpg';
export const FALLBACK_PORTRAIT_URL = '/FB_IMG_1790800525155.jpg';

interface WelcomeBannerProps {
  studentName?: string;
  onExploreGoals?: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  studentName = 'Ghulam Yaseen',
  onExploreGoals,
}) => {
  const [portraitSrc, setPortraitSrc] = useState<string>(DEFAULT_PORTRAIT_URL);
  const [hasLoadedImage, setHasLoadedImage] = useState<boolean>(false);
  const [showUploadHint, setShowUploadHint] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user has previously saved the official portrait in localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_PORTRAIT_KEY);
      if (saved) {
        setPortraitSrc(saved);
        setHasLoadedImage(true);
      }
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPortraitSrc(dataUrl);
        setHasLoadedImage(true);
        try {
          localStorage.setItem(STORAGE_PORTRAIT_KEY, dataUrl);
          // Persist to server disk via API
          await fetch('/api/upload-portrait', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl }),
          });
        } catch (err) {
          console.error('Failed to sync portrait to server', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white p-4 sm:p-6 md:p-7 shadow-lg shadow-blue-900/15 border border-blue-400/20">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-48 h-48 rounded-full bg-sky-400/15 blur-xl pointer-events-none" />

      {/* Hidden file input for permanent local binding of FB_IMG_1790800525155.jpg */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-6">
        {/* Left Column: Greeting, Class metadata, Goal action */}
        <div className="space-y-2 max-w-[62%] sm:max-w-md">
          {/* Class / Student Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[10px] sm:text-[11px] font-semibold text-sky-100 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Class 10-A • Roll No. 05</span>
          </div>

          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Welcome Back, <br />
            <span className="text-sky-200">{studentName}!</span>
          </h1>

          <p className="text-blue-100 text-[11px] sm:text-xs md:text-sm font-normal line-clamp-2 leading-relaxed">
            Keep going! Your hard work will pay off.
          </p>

          <div className="pt-1">
            <button
              onClick={onExploreGoals}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[11px] sm:text-xs font-semibold transition-all active:scale-95"
            >
              <Target className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">Your Goal: Better Scores</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right Column: Exact Permanent Uploaded Portrait */}
        <div className="relative shrink-0 flex flex-col items-center">
          {/* Slogan Pill matching reference image */}
          <div className="hidden sm:flex items-center gap-1.5 mb-1.5 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-300/30 backdrop-blur-xs text-[9px] font-bold text-sky-200 tracking-wider uppercase select-none">
            <span>Study</span>
            <span className="text-amber-300">•</span>
            <span>Practice</span>
            <span className="text-amber-300">•</span>
            <span>Succeed</span>
          </div>

          {/* Exact Portrait Container */}
          <div className="relative group">
            {/* Academic Graduation Cap Badge Accent */}
            <div className="absolute -top-2 -left-2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-blue-900 border border-blue-400/50 shadow-md flex items-center justify-center text-amber-300">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>

            {/* Permanent Portrait Frame with exact natural aspect ratio cropping */}
            <div
              onClick={triggerFileInput}
              className="w-24 h-28 sm:w-32 sm:h-36 md:w-36 md:h-40 rounded-2xl overflow-hidden border-2 border-white/60 shadow-xl shadow-blue-950/40 bg-slate-900 relative ring-2 ring-blue-400/30 cursor-pointer"
              title="Click to select or confirm your official portrait file (FB_IMG_1790800525155.jpg)"
            >
              <img
                src={portraitSrc}
                alt="Ghulam Yaseen - Official Student Portrait"
                onLoad={() => setHasLoadedImage(true)}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes(DEFAULT_PORTRAIT_URL)) {
                    target.src = FALLBACK_PORTRAIT_URL;
                  } else {
                    setHasLoadedImage(false);
                  }
                }}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* If image is not yet rendered on disk/localStorage, display interactive prompt */}
              {!hasLoadedImage && (
                <div className="absolute inset-0 bg-blue-950/90 flex flex-col items-center justify-center p-2 text-center text-white">
                  <Camera className="w-6 h-6 text-sky-300 mb-1" />
                  <span className="text-[10px] font-bold text-sky-100 leading-tight">
                    Select Your Photo
                  </span>
                  <span className="text-[8px] text-blue-300 mt-0.5">
                    FB_IMG_1790800525155.jpg
                  </span>
                </div>
              )}

              {/* Change / Update Photo Hover Overlay */}
              <div className="absolute inset-0 bg-blue-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold pointer-events-none">
                <Camera className="w-4 h-4 text-sky-300" />
                <span>Update Photo</span>
              </div>
            </div>

            {/* Official Student Verified Badge */}
            <button
              onClick={triggerFileInput}
              className="absolute -bottom-2 inset-x-0.5 py-0.5 rounded-md bg-blue-950/95 hover:bg-blue-900 border border-blue-300/40 backdrop-blur-sm text-center text-[8px] sm:text-[9px] font-extrabold text-sky-200 tracking-wider uppercase shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span>Official Student</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
