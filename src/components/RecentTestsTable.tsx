import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { TestResult } from '../types';

interface RecentTestsTableProps {
  results: TestResult[];
  onViewAll?: () => void;
  onSelectResult?: (result: TestResult) => void;
}

export const RecentTestsTable: React.FC<RecentTestsTableProps> = ({
  results,
  onViewAll,
  onSelectResult,
}) => {
  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">Recent Tests</h3>
          <p className="text-slate-400 text-[11px] mt-0.5">Assessed tests and school marks</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Mobile Card List (visible on screens < 640px) */}
      <div className="divide-y divide-slate-100 sm:hidden">
        {results.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No tests taken yet. Start with your practice test!
          </div>
        ) : (
          results.map((r, idx) => (
            <motion.div
              key={r.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectResult?.(r)}
              className="p-3.5 hover:bg-blue-50/40 active:bg-blue-50/70 transition-colors flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">
                    {r.test_title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <span className="font-semibold text-slate-500">{r.subject}</span>
                    <span>•</span>
                    <span>
                      {new Date(r.submitted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-extrabold text-xs text-slate-800">
                  {r.obtained_marks}/{r.total_marks}
                </div>
                <div className={`text-[10px] font-bold mt-0.5 ${
                  r.percentage >= 60 ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {Math.round(r.percentage)}% • {r.grade}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Desktop Clean Table (visible on screens >= 640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-5">Test Name</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-center">Grade</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {results.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No tests taken yet. Start with your practice test!
                </td>
              </tr>
            ) : (
              results.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelectResult?.(r)}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {r.test_title}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {r.subject}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {new Date(r.submitted_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-extrabold text-slate-800">
                      {r.obtained_marks}/{r.total_marks}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">
                      ({Math.round(r.percentage)}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      r.percentage >= 80 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : r.percentage >= 60
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
