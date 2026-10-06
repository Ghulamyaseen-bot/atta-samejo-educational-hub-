import React, { useState } from 'react';
import { TestResult, Student } from '../types';
import { OfficialLogo } from '../components/OfficialLogo';
import { getGradeBadgeColor, getGradeLabel } from '../utils/grading';
import { 
  BarChart3, 
  Printer, 
  Trophy, 
  CheckCircle2, 
  Search, 
  Calendar, 
  BookOpen,
  TrendingUp,
  FileText
} from 'lucide-react';

interface ResultsAnalyticsViewProps {
  results: TestResult[];
  student: Student;
  onTakeTestAgain: (testId: string) => void;
}

export const ResultsAnalyticsView: React.FC<ResultsAnalyticsViewProps> = ({
  results,
  student,
  onTakeTestAgain,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract distinct subjects
  const subjects = Array.from(new Set(results.map(r => r.subject)));

  // Filtered results
  const filtered = results.filter(r => {
    const matchSub = selectedSubject === 'all' || r.subject === selectedSubject;
    const matchSearch = r.test_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSub && matchSearch;
  });

  // Calculate overall school metrics
  const totalTests = results.length;
  const avgPercentage = totalTests > 0
    ? Math.round((results.reduce((acc, r) => acc + r.percentage, 0) / totalTests) * 10) / 10
    : 0;

  const highestScore = totalTests > 0
    ? Math.max(...results.map(r => r.percentage))
    : 0;

  // Grade count breakdown
  const gradeCounts = {
    'A+': results.filter(r => r.grade === 'A+').length,
    'A': results.filter(r => r.grade === 'A').length,
    'B': results.filter(r => r.grade === 'B').length,
    'C': results.filter(r => r.grade === 'C').length,
    'D': results.filter(r => r.grade === 'D').length,
    'F': results.filter(r => r.grade === 'F').length,
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              Results &amp; Academic Performance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            School assessment results, subject percentage, and official grade records. (Class 1–12)
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Progress Report</span>
        </button>
      </div>

      {/* Official School Progress Report Card (Visible in UI and perfect for printing) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:border-none print:shadow-none space-y-6">
        {/* Printable Official Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-5">
          <OfficialLogo size="md" />
          <div className="text-right">
            <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">
              STUDENT ACADEMIC REPORT CARD
            </h3>
            <p className="text-xs font-semibold text-slate-600">Session 2026–2027</p>
            <p className="text-[11px] text-slate-500">School Hub Assessment Division</p>
          </div>
        </div>

        {/* Student Metadata Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold text-[11px]">Student Name</span>
            <span className="font-extrabold text-slate-800 text-sm">{student.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold text-[11px]">Student ID / Roll No</span>
            <span className="font-extrabold text-slate-800 text-sm">{student.student_id} (Roll {student.roll_number})</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold text-[11px]">Class &amp; Section</span>
            <span className="font-extrabold text-slate-800 text-sm">{student.class} - {student.section}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold text-[11px]">Father's Name</span>
            <span className="font-extrabold text-slate-800 text-sm">{student.father_name}</span>
          </div>
        </div>

        {/* 4 School Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 no-print">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold">
              <FileText className="w-4 h-4" />
              <span>Tests Completed</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">{totalTests}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Assessed Unit Tests</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>Average Percentage</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">{avgPercentage}%</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Overall Performance</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
              <Trophy className="w-4 h-4" />
              <span>Highest Score</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">{highestScore}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Peak Test Result</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <div className="flex items-center gap-1.5 text-purple-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Distinctions (A+/A)</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">
              {gradeCounts['A+'] + gradeCounts['A']}
            </div>
            <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Out of {totalTests} Tests</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 no-print pt-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="all">All Subjects</option>
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search results..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Results List Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Marks (Obt / Total)</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No results found for selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((res) => {
                  const badgeColor = getGradeBadgeColor(res.grade);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {res.test_title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{res.subject}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(res.submitted_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {res.obtained_marks} / {res.total_marks}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-blue-700">
                        {res.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold text-[11px] border ${badgeColor.bg} ${badgeColor.border}`}>
                          {res.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right no-print">
                        <button
                          onClick={() => onTakeTestAgain(res.test_id)}
                          className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors"
                        >
                          Retake
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Printable Signature & Authentication Footer */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs text-slate-600 print:mt-12">
          <div>
            <div className="h-10 border-b border-slate-400 mb-1" />
            <span className="font-bold">Class Teacher Signature</span>
          </div>
          <div>
            <div className="h-10 border-b border-slate-400 mb-1" />
            <span className="font-bold">Head of Assessment</span>
          </div>
          <div>
            <div className="h-10 border-b border-slate-400 mb-1" />
            <span className="font-bold">Official Seal &amp; Principal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
