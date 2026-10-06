import React from 'react';
import { 
  ClipboardCheck, 
  PlusCircle, 
  BookOpen, 
  FileText, 
  ScanLine, 
  Users, 
  ArrowRight,
  Clock,
  Trophy,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface DashboardActionCardsProps {
  onTakeTest: () => void;
  onCreateTest: () => void;
  onOpenMcqBank: () => void;
  onOpenOmrSheet: () => void;
  onOpenOmrScan: () => void;
  onOpenStudentsForm: () => void;
  testsTaken?: number;
  testsTakenDelta?: string;
  studyHours?: number;
  studyHoursDelta?: string;
  rank?: string;
  rankDelta?: string;
}

export const DashboardActionCards: React.FC<DashboardActionCardsProps> = ({
  onTakeTest,
  onCreateTest,
  onOpenMcqBank,
  onOpenOmrSheet,
  onOpenOmrScan,
  onOpenStudentsForm,
  testsTaken = 12,
  testsTakenDelta = '↑ 3 this week',
  studyHours = 24.5,
  studyHoursDelta = '↑ 5.2 hrs this week',
  rank = '5 / 28',
  rankDelta = '↑ 2 positions',
}) => {
  return (
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Core Academic Tools</span>
        </h2>
        <span className="text-[11px] font-semibold text-slate-400">Class 1–12 Portal</span>
      </div>

      {/* 4 Primary Action Cards: 2x2 grid on mobile, 4 columns on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* 1. Take a Test (Navy Blue) */}
        <div
          onClick={onTakeTest}
          className="group relative overflow-hidden rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36 sm:h-40"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                Take a Test
              </h3>
              <p className="text-blue-100 text-[11px] sm:text-xs mt-1 leading-snug line-clamp-2">
                Practice &amp; boost test scores
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-blue-600 flex items-center justify-center transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 2. Create Test (Emerald Green) */}
        <div
          onClick={onCreateTest}
          className="group relative overflow-hidden rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36 sm:h-40"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                Create Test
              </h3>
              <p className="text-emerald-100 text-[11px] sm:text-xs mt-1 leading-snug line-clamp-2">
                Build MCQs or descriptive tests
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-emerald-600 flex items-center justify-center transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 3. MCQ Bank (Warm Amber) */}
        <div
          onClick={onOpenMcqBank}
          className="group relative overflow-hidden rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36 sm:h-40"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                MCQ Bank
              </h3>
              <p className="text-amber-100 text-[11px] sm:text-xs mt-1 leading-snug line-clamp-2">
                Practice chapter questions
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-amber-600 flex items-center justify-center transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 4. OMR Sheet (Purple) */}
        <div
          onClick={onOpenOmrSheet}
          className="group relative overflow-hidden rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36 sm:h-40"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                OMR Sheet
              </h3>
              <p className="text-purple-100 text-[11px] sm:text-xs mt-1 leading-snug line-clamp-2">
                Generate printable sheets
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-purple-600 flex items-center justify-center transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Quick Tools & Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* OMR Scan Card */}
        <div
          onClick={onOpenOmrScan}
          className="group rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 active:scale-[0.98] p-3.5 cursor-pointer shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ScanLine className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">OMR Scan</h4>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 leading-snug">
            Instant optical sheet grading
          </p>
        </div>

        {/* Students Form Card */}
        <div
          onClick={onOpenStudentsForm}
          className="group rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 active:scale-[0.98] p-3.5 cursor-pointer shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Students Form</h4>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 leading-snug">
            Class 1–12 student directory
          </p>
        </div>

        {/* Total Tests Taken Metric */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Tests Taken</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-none">{testsTaken}</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">{testsTakenDelta}</div>
          </div>
        </div>

        {/* Study Hours Metric */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Study Hours</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-none">{studyHours}h</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">{studyHoursDelta}</div>
          </div>
        </div>

        {/* Class Rank Metric */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Class Rank</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-none">{rank}</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">{rankDelta}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
