import React from 'react';
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
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
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
          results.map((r) => (
            <div
              key={r.id}
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

              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none">
                    {r.percentage}%
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                    Grade {r.grade}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop/Tablet Table (visible on screens >= 640px) */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-5">Test Name</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {results.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No tests taken yet. Start with your practice test!
                </td>
              </tr>
            ) : (
              results.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelectResult?.(r)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5 font-semibold text-slate-800 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate max-w-[220px]">{r.test_title}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{r.subject}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(r.submitted_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-extrabold text-slate-900">{r.percentage}%</span>
                    <span className="ml-1 text-[11px] text-slate-400 font-semibold">({r.grade})</span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Completed
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
