import React from 'react';
import { motion, Variants } from 'framer-motion';
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
  Sparkles,
  BookMarked,
  BarChart3,
  CalendarCheck
} from 'lucide-react';
import { Role } from '../types';

interface DashboardActionCardsProps {
  role?: Role;
  onTakeTest: () => void;
  onCreateTest?: () => void;
  onOpenMcqBank: () => void;
  onOpenOmrSheet?: () => void;
  onOpenOmrScan?: () => void;
  onOpenStudentsForm?: () => void;
  onOpenStudyMaterials?: () => void;
  onOpenResults?: () => void;
  onOpenAttendance?: () => void;
  testsTaken?: number;
  testsTakenDelta?: string;
  studyHours?: number;
  studyHoursDelta?: string;
  rank?: string;
  rankDelta?: string;
}

const actionCardVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: custom * 0.04,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

export const DashboardActionCards: React.FC<DashboardActionCardsProps> = ({
  role = 'student',
  onTakeTest,
  onCreateTest,
  onOpenMcqBank,
  onOpenOmrSheet,
  onOpenOmrScan,
  onOpenStudentsForm,
  onOpenStudyMaterials,
  onOpenResults,
  onOpenAttendance,
  testsTaken = 12,
  testsTakenDelta = '↑ 3 this week',
  studyHours = 24.5,
  studyHoursDelta = '↑ 5.2 hrs this week',
  rank = '5 / 28',
  rankDelta = '↑ 2 positions',
}) => {
  const isStudent = role === 'student';

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

      {/* 4 Primary Action Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Take a Test / Test Hub */}
        <motion.div
          custom={0}
          variants={actionCardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -3, transition: { duration: 0.18 } }}
          whileTap={{ scale: 0.97 }}
          onClick={onTakeTest}
          className="group relative overflow-hidden rounded-2xl bg-blue-600 hover:bg-blue-700 text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-36 sm:h-40"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                {isStudent ? 'Take a Test' : 'Tests Hub'}
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
        </motion.div>

        {/* Card 2: Student -> Study Materials | Teacher/Admin -> Create Test */}
        {isStudent ? (
          <motion.div
            custom={1}
            variants={actionCardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenStudyMaterials || onTakeTest}
            className="group relative overflow-hidden rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-36 sm:h-40"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                  Study Materials
                </h3>
                <p className="text-emerald-100 text-[11px] sm:text-xs mt-1 leading-snug line-clamp-2">
                  Download syllabus &amp; notes
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-emerald-600 flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            custom={1}
            variants={actionCardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            whileTap={{ scale: 0.97 }}
            onClick={onCreateTest}
            className="group relative overflow-hidden rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-36 sm:h-40"
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
          </motion.div>
        )}

        {/* Card 3: MCQ Bank */}
        <motion.div
          custom={2}
          variants={actionCardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -3, transition: { duration: 0.18 } }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenMcqBank}
          className="group relative overflow-hidden rounded-2xl bg-amber-500 hover:bg-amber-600 text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-36 sm:h-40"
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
        </motion.div>

        {/* Card 4: Student -> My Results | Teacher/Admin -> OMR System */}
        {isStudent ? (
          <motion.div
            custom={3}
            variants={actionCardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenResults || onTakeTest}
            className="group relative overflow-hidden rounded-2xl bg-purple-600 hover:bg-purple-700 text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-36 sm:h-40"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                  My Results
                </h3>
                <p className="text-purple-100 text-[11px] sm:text-xs mt-1 leading-snug line-clamp-2">
                  View scores, report card &amp; grades
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-purple-600 flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            custom={3}
            variants={actionCardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenOmrSheet}
            className="group relative overflow-hidden rounded-2xl bg-purple-600 hover:bg-purple-700 text-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-36 sm:h-40"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                  OMR System
                </h3>
                <p className="text-purple-100 text-[11px] sm:text-xs mt-1 leading-snug line-clamp-2">
                  Generate 100-Q sheets &amp; scan
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-purple-600 flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Secondary Row: Quick Tools & Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* If Teacher/Admin: show OMR Scan and Students Form */}
        {!isStudent && (
          <>
            <motion.div
              custom={4}
              variants={actionCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenOmrScan}
              className="group rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 p-3.5 cursor-pointer shadow-xs hover:shadow-sm transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ScanLine className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Scan OMR Sheet</h4>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 leading-snug">
                Camera / upload optical grading
              </p>
            </motion.div>

            <motion.div
              custom={5}
              variants={actionCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenStudentsForm}
              className="group rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 p-3.5 cursor-pointer shadow-xs hover:shadow-sm transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Student Directory</h4>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 leading-snug">
                Class 1–12 student roster
              </p>
            </motion.div>
          </>
        )}

        {/* If Student: show Attendance shortcut */}
        {isStudent && (
          <motion.div
            custom={4}
            variants={actionCardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAttendance}
            className="group rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 p-3.5 cursor-pointer shadow-xs hover:shadow-sm transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">My Attendance</h4>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 leading-snug">
              Monthly roll-call history
            </p>
          </motion.div>
        )}

        {/* Total Tests Taken Metric */}
        <motion.div
          custom={6}
          variants={actionCardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Tests Taken</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-none">{testsTaken}</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">{testsTakenDelta}</div>
          </div>
        </motion.div>

        {/* Study Hours Metric */}
        <motion.div
          custom={7}
          variants={actionCardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Study Hours</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-none">{studyHours}h</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">{studyHoursDelta}</div>
          </div>
        </motion.div>

        {/* Class Rank Metric */}
        <motion.div
          custom={8}
          variants={actionCardVariants}
          initial="hidden"
          animate="visible"
          className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Class Standing</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-none">{rank}</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">{rankDelta}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
