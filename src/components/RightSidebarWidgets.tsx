import React from 'react';
import { 
  FileCheck2, 
  TrendingUp, 
  Clock, 
  Trophy, 
  ChevronRight, 
  Calendar,
  Mountain
} from 'lucide-react';

interface RightSidebarWidgetsProps {
  studentName?: string;
  testsTaken?: number;
  avgScore?: number;
  studyTime?: number;
  rank?: string;
  onViewAllUpcoming?: () => void;
  onSelectUpcomingTest?: (testId: string) => void;
}

export const RightSidebarWidgets: React.FC<RightSidebarWidgetsProps> = ({
  studentName = 'Ghulam Yaseen',
  testsTaken = 12,
  avgScore = 68,
  studyTime = 24.5,
  rank = '5 / 28',
  onViewAllUpcoming,
  onSelectUpcomingTest,
}) => {
  const upcomingList = [
    {
      id: 'test_eng_desc',
      day: '05',
      month: 'Oct',
      title: 'English Writing Task',
      subtitle: 'English Preparation',
      time: '10:00 AM',
    },
    {
      id: 'test_sci_1',
      day: '07',
      month: 'Oct',
      title: 'General Science Assessment',
      subtitle: 'Physics & Chemistry',
      time: '02:00 PM',
    },
    {
      id: 'test_math_1',
      day: '10',
      month: 'Oct',
      title: 'Mathematics Unit Test',
      subtitle: 'Algebra & Matrices',
      time: '10:00 AM',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. At a Glance Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 font-extrabold text-slate-800 text-xs sm:text-sm">
            <span className="text-blue-600">◇</span>
            <span>At a Glance</span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
            This Week
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-3.5">
          {/* Tests Taken */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100/90">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-slate-800 leading-none">{testsTaken}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Tests Taken</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 3 this week</div>
          </div>

          {/* Avg. Score (strictly school score %) */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/90">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-slate-800 leading-none">{avgScore}%</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Avg. Score</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 5% this week</div>
          </div>

          {/* Study Time */}
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100/90">
            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-slate-800 leading-none">{studyTime}h</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Study Time</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 5.2 hrs</div>
          </div>

          {/* Your Rank */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100/90">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-slate-800 leading-none">{rank}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Class Rank</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 2 positions</div>
          </div>
        </div>
      </div>

      {/* 2. Your Progress */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">Your Progress</h3>
          <span className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer">
            View Details &gt;
          </span>
        </div>

        <div className="space-y-3">
          {/* Completed Tests */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                Completed Tests
              </span>
              <span className="text-slate-800 font-extrabold text-xs">68%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '68%' }} />
            </div>
          </div>

          {/* Study Goal */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Study Goal
              </span>
              <span className="text-slate-800 font-extrabold text-xs">72%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Tests */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">Upcoming Tests</h3>
          </div>
          <button
            onClick={onViewAllUpcoming}
            className="text-[11px] text-blue-600 font-bold hover:underline"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {upcomingList.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectUpcomingTest?.(item.id)}
              className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50 -mx-1.5 px-1.5 rounded-xl transition-colors active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-700 flex flex-col items-center justify-center font-bold text-xs shrink-0 transition-colors">
                  <span className="text-xs font-extrabold leading-none">{item.day}</span>
                  <span className="text-[9px] text-slate-500 uppercase leading-none mt-0.5">{item.month}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                    <span>{item.subtitle}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. You Can Do It! Motivational Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white p-4 sm:p-5 shadow-md">
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
          <Mountain className="w-32 h-32 -mb-5 -mr-4 text-white" />
        </div>

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-sm">★</span>
            <h4 className="font-extrabold text-xs sm:text-sm tracking-wide text-white">You Can Do It!</h4>
          </div>
          <p className="text-[11px] sm:text-xs text-blue-100 font-medium italic leading-relaxed">
            "Small steps every day lead to big results."
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal pt-0.5">
            — Keep Going, {studentName}
          </p>
        </div>
      </div>
    </div>
  );
};
