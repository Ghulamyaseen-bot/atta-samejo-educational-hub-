import React from 'react';
import { motion } from 'framer-motion';
import { Target, ArrowRight, Check, School, ShieldCheck, GraduationCap } from 'lucide-react';
import { Role } from '../types';
import officialAdminPortrait from '../assets/FB_IMG_1790800525155.jpg';

export const DEFAULT_PORTRAIT_URL = officialAdminPortrait || '/assets/FB_IMG_1790800525155.jpg';
export const FALLBACK_PORTRAIT_URL = '/FB_IMG_1790800525155.jpg';
export const DEFAULT_AVATAR_PLACEHOLDER = '/assets/student_avatar.svg';

interface WelcomeBannerProps {
  studentName?: string;
  photoUrl?: string;
  role?: Role;
  classNameLabel?: string;
  rollNumber?: string;
  onExploreGoals?: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  studentName = 'Ghulam Yaseen',
  photoUrl,
  role = 'student',
  classNameLabel = 'Class 10-A',
  rollNumber = '05',
  onExploreGoals,
}) => {
  // Determine portrait source:
  // 1. Both Admin and Teacher portals permanently display the official administrator portrait
  // 2. Student portal strictly displays the student's own uploaded registration photo
  // 3. Student photo is strictly distinct from the administrator photo
  const resolvedPhoto = (role === 'admin' || role === 'teacher')
    ? DEFAULT_PORTRAIT_URL
    : (photoUrl && photoUrl !== DEFAULT_AVATAR_PLACEHOLDER)
    ? photoUrl
    : DEFAULT_PORTRAIT_URL;

  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white p-4 sm:p-6 md:p-7 shadow-lg shadow-blue-900/15 border border-blue-400/20"
    >
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-48 h-48 rounded-full bg-sky-400/15 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-6">
        {/* Left Column: Greeting, Role / Class metadata, Goal action */}
        <motion.div 
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="space-y-2 max-w-[62%] sm:max-w-md"
        >
          {/* Role / Class Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[10px] sm:text-[11px] font-semibold text-sky-100 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              {isAdmin 
                ? 'Institutional Leadership • Administration' 
                : isTeacher 
                ? 'Academic Faculty Specialist' 
                : `${classNameLabel} • Roll No. ${rollNumber}`}
            </span>
          </div>

          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Welcome Back, <br />
            <span className="text-sky-200">{studentName}!</span>
          </h1>

          <p className="text-blue-100 text-[11px] sm:text-xs md:text-sm font-normal line-clamp-2 leading-relaxed">
            {isAdmin 
              ? 'Institutional administration & centralized academic evaluation portal.' 
              : isTeacher 
              ? 'Evaluate student examinations, configure answer keys, and manage results.' 
              : 'Keep going! Your hard work and regular practice will pay off.'}
          </p>

          <div className="pt-1">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onExploreGoals}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">
                {isAdmin ? 'View School Analytics' : isTeacher ? 'View Examination Results' : 'Your Goal: Better Scores'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            </motion.button>
          </div>
        </motion.div>

        {/* Right Column: Permanent Saved Portrait (Read-Only, No Repeated Upload) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="relative shrink-0 flex flex-col items-center"
        >
          {/* Academic Slogan Pill */}
          <div className="hidden sm:flex items-center gap-1.5 mb-1.5 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-300/30 backdrop-blur-xs text-[9px] font-bold text-sky-200 tracking-wider uppercase select-none">
            <span>Study</span>
            <span className="text-amber-300">•</span>
            <span>Practice</span>
            <span className="text-amber-300">•</span>
            <span>Succeed</span>
          </div>

          {/* Portrait Container */}
          <div className="relative group">
            {/* Academic Cap / Shield Badge Accent */}
            <div className="absolute -top-2 -left-2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-blue-900 border border-blue-400/50 shadow-md flex items-center justify-center text-amber-300">
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : isTeacher ? (
                <School className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>

            {/* Permanent Portrait Frame with role-distinct styling */}
            <div className={`w-24 h-28 sm:w-32 sm:h-36 md:w-36 md:h-40 rounded-2xl overflow-hidden border-2 shadow-xl relative ${
              isAdmin
                ? 'border-amber-300 ring-2 ring-amber-400/60 shadow-amber-950/30 bg-slate-900'
                : isTeacher
                ? 'border-blue-300 ring-2 ring-blue-400/60 shadow-blue-950/30 bg-slate-900'
                : 'border-emerald-300 ring-2 ring-emerald-400/60 shadow-emerald-950/30 bg-slate-900'
            }`}>
              <img
                src={resolvedPhoto}
                alt={`${studentName} - Profile`}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (role === 'admin' || role === 'teacher') {
                    target.src = FALLBACK_PORTRAIT_URL;
                  } else {
                    target.src = DEFAULT_PORTRAIT_URL;
                  }
                }}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Verified Institutional Badge */}
            <div className={`absolute -bottom-2 inset-x-0.5 py-0.5 rounded-md border backdrop-blur-sm text-center text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase shadow-sm flex items-center justify-center gap-1 select-none ${
              isAdmin
                ? 'bg-amber-950/95 border-amber-400/50 text-amber-200'
                : isTeacher
                ? 'bg-blue-950/95 border-blue-300/40 text-sky-200'
                : 'bg-emerald-950/95 border-emerald-400/50 text-emerald-200'
            }`}>
              <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span>{isAdmin ? 'Official Admin' : isTeacher ? 'Verified Faculty' : 'Registered Student'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
