import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { TrendingUp, Award, Calendar, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';
import { TestResult } from '../types';

interface AssessmentTrendChartProps {
  results?: TestResult[];
  onViewAllResults?: () => void;
}

export const AssessmentTrendChart: React.FC<AssessmentTrendChartProps> = ({
  results = [],
  onViewAllResults,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'math' | 'science'>('all');

  // Format the last 6 assessments data from results or school mock progression
  const last6Results = results.slice(0, 6).reverse();

  const chartData = last6Results.length >= 3
    ? last6Results.map((r, i) => ({
        testName: r.test_title.length > 14 ? `${r.test_title.slice(0, 12)}...` : r.test_title,
        fullTitle: r.test_title,
        subject: r.subject,
        score: Math.round(r.percentage),
        obtained: r.obtained_marks,
        total: r.total_marks,
        grade: r.grade,
        date: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `T${i + 1}`,
      }))
    : [
        { testName: 'Algebra Test', fullTitle: 'Mathematics: Algebra & Equations', subject: 'Mathematics', score: 68, obtained: 34, total: 50, grade: 'B', date: 'Sep 12' },
        { testName: 'Living Things', fullTitle: 'General Science: Cells & Life', subject: 'General Science', score: 72, obtained: 36, total: 50, grade: 'A', date: 'Sep 18' },
        { testName: 'Geometry Unit', fullTitle: 'Mathematics: Geometry & Angles', subject: 'Mathematics', score: 75, obtained: 30, total: 40, grade: 'A', date: 'Sep 25' },
        { testName: 'Motion Quiz', fullTitle: 'Physics: Motion & Force', subject: 'Physics', score: 80, obtained: 40, total: 50, grade: 'A+', date: 'Oct 01' },
        { testName: 'Grammar Test', fullTitle: 'English: Grammar & Tenses', subject: 'English', score: 79, obtained: 39.5, total: 50, grade: 'A', date: 'Oct 04' },
        { testName: 'Current Assessment', fullTitle: 'Mathematics: Quadratic Equations', subject: 'Mathematics', score: 84, obtained: 42, total: 50, grade: 'A+', date: 'Today' },
      ];

  // Calculate statistics
  const currentScore = chartData[chartData.length - 1]?.score || 0;
  const initialScore = chartData[0]?.score || 0;
  const delta = currentScore - initialScore;
  const avgScore = Math.round(chartData.reduce((acc, c) => acc + c.score, 0) / chartData.length);
  const highestScore = Math.max(...chartData.map(c => c.score));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1 z-50">
          <div className="font-extrabold text-sky-300">{data.fullTitle}</div>
          <div className="text-[11px] text-slate-300">{data.subject} • {data.date}</div>
          <div className="pt-1.5 flex items-center justify-between gap-4 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">Score / Marks</span>
              <span className="font-bold text-white text-sm">{data.score}% ({data.obtained}/{data.total})</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">School Grade</span>
              <span className={`font-black text-sm px-2 py-0.5 rounded-md ${
                data.grade === 'A+' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
              }`}>
                {data.grade}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-800">
              Assessment Score Progress Trend
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Average score progression across your last 6 school tests (Class 1–12 School Percentage).
          </p>
        </div>

        {onViewAllResults && (
          <button
            onClick={onViewAllResults}
            className="self-start sm:self-center text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>All Results</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4 Mini Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 transition-shadow hover:shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recent Score</span>
          <div className="text-lg font-black text-slate-800 mt-0.5">{currentScore}%</div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            ↑ {delta >= 0 ? `+${delta}%` : `${delta}%`} trajectory
          </span>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 transition-shadow hover:shadow-sm">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">6-Test Average</span>
          <div className="text-lg font-black text-blue-700 mt-0.5">{avgScore}%</div>
          <span className="text-[10px] text-blue-700 font-medium">Class 10 Target: &gt;75%</span>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 transition-shadow hover:shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peak Score</span>
          <div className="text-lg font-black text-emerald-600 mt-0.5">{highestScore}%</div>
          <span className="text-[10px] text-slate-500 font-medium">Grade A+ (Excellence)</span>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 transition-shadow hover:shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pass Rate</span>
          <div className="text-lg font-black text-purple-700 mt-0.5">100%</div>
          <span className="text-[10px] text-emerald-600 font-semibold">6 of 6 Passed</span>
        </motion.div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-56 sm:h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a56db" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              domain={[40, 100]} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={false} 
              tickLine={false}
              unit="%" 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#1a56db" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#scoreGradient)" 
              dot={{ r: 4, fill: '#1a56db', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#1a56db', strokeWidth: 3, stroke: '#93c5fd' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
