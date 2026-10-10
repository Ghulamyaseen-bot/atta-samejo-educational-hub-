import React, { useState } from 'react';
import { TestResult, Student, Role } from '../types';
import { OfficialLogo } from '../components/OfficialLogo';
import { getGradeBadgeColor, getGradeLabel } from '../utils/grading';
import { 
  generateIndividualResultPdf, 
  generateClassResultSheetPdf, 
  downloadPdf, 
  printPdf 
} from '../utils/pdfGenerator';
import { api } from '../api/client';
import { 
  BarChart3, 
  Printer, 
  Trophy, 
  CheckCircle2, 
  Search, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  FileText,
  Download,
  Eye,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ResultsAnalyticsViewProps {
  results: TestResult[];
  student: Student;
  role?: Role;
  onTakeTestAgain: (testId: string) => void;
  onResultsChanged?: () => void;
}

export const ResultsAnalyticsView: React.FC<ResultsAnalyticsViewProps> = ({
  results: initialResults,
  student,
  role = 'student',
  onTakeTestAgain,
  onResultsChanged,
}) => {
  const [results, setResults] = useState<TestResult[]>(initialResults);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResultForDetail, setSelectedResultForDetail] = useState<TestResult | null>(null);
  
  // Edit result modal (Teacher / Admin only)
  const [editingResult, setEditingResult] = useState<TestResult | null>(null);
  const [editMarks, setEditMarks] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  // Sync if prop changes
  React.useEffect(() => {
    setResults(initialResults);
  }, [initialResults]);

  const isTeacherOrAdmin = role === 'teacher' || role === 'admin';

  // Extract distinct subjects
  const subjects = Array.from(new Set(results.map(r => r.subject)));

  // Filtered results
  const filtered = results.filter(r => {
    const matchSub = selectedSubject === 'all' || r.subject === selectedSubject;
    const matchSearch = r.test_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSub && matchSearch;
  });

  // Calculate overall school metrics (NO GPA)
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

  // PDF Export Handlers
  const handleDownloadResultPdf = (res: TestResult) => {
    const doc = generateIndividualResultPdf(res, student);
    downloadPdf(doc, `Result_${res.test_title.replace(/\s+/g, '_')}_${student.roll_number}.pdf`);
  };

  const handlePrintResultPdf = (res: TestResult) => {
    const doc = generateIndividualResultPdf(res, student);
    printPdf(doc);
  };

  const handleDownloadClassSummaryPdf = () => {
    if (results.length === 0) return;
    const doc = generateClassResultSheetPdf(results, student.class, 'Comprehensive Assessment');
    downloadPdf(doc, `Class_Result_Sheet_${student.class.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrintWindow = () => {
    window.print();
  };

  // Teacher / Admin Result Editing
  const handleOpenEdit = (res: TestResult) => {
    setEditingResult(res);
    setEditMarks(res.obtained_marks);
    setEditFeedback(res.answers?.[0]?.teacher_feedback || '');
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    if (editMarks < 0 || editMarks > editingResult.total_marks) {
      setEditError(`Marks must be between 0 and ${editingResult.total_marks}.`);
      return;
    }

    const updated = await api.updateResult(editingResult.id, editMarks, editFeedback);
    if (updated.success && updated.data) {
      setResults(prev => prev.map(r => r.id === updated.data!.id ? updated.data! : r));
      setEditingResult(null);
      if (onResultsChanged) onResultsChanged();
    } else {
      setEditError(updated.error || 'Failed to update result.');
    }
  };

  const handleDeleteResult = async (resId: string) => {
    if (!confirm('Are you sure you want to delete this result record?')) return;
    const deleted = await api.deleteResult(resId);
    if (deleted.success) {
      setResults(prev => prev.filter(r => r.id !== resId));
      if (onResultsChanged) onResultsChanged();
    } else {
      alert(deleted.error || 'Failed to delete result record.');
    }
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
            Official school assessment results, subject marks, and verified grade records. (Class 1–12)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isTeacherOrAdmin && (
            <button
              onClick={handleDownloadClassSummaryPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Class Report PDF</span>
            </button>
          )}
          <button
            onClick={handlePrintWindow}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Progress Report</span>
          </button>
        </div>
      </div>

      {/* Official School Progress Report Card */}
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

        {/* School Summary Metric Cards (NO GPA) */}
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
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Peak Assessment</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <div className="flex items-center gap-1.5 text-purple-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Distinction (A+/A)</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">
              {gradeCounts['A+'] + gradeCounts['A']}
            </div>
            <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Top Grades Earned</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Filter by Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Subjects ({subjects.length})</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessment results..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        {/* Detailed Assessment Results Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Marks (Obt / Total)</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-right no-print">Actions &amp; Export</th>
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details button (for everyone) */}
                          <button
                            onClick={() => setSelectedResultForDetail(res)}
                            title="View Result Details"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Generate / Download PDF button (for everyone) */}
                          <button
                            onClick={() => handleDownloadResultPdf(res)}
                            title="Download Result PDF"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Print Result button */}
                          <button
                            onClick={() => handlePrintResultPdf(res)}
                            title="Print Result Slip"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Teacher / Admin only: Edit & Delete */}
                          {isTeacherOrAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(res)}
                                title="Edit Marks (Teacher/Admin)"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteResult(res.id)}
                                title="Delete Result (Teacher/Admin)"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
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

      {/* --- RESULT DETAIL MODAL (READ-ONLY FOR STUDENT) --- */}
      {selectedResultForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-800">
                  {selectedResultForDetail.test_title}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {selectedResultForDetail.subject} • Submitted {new Date(selectedResultForDetail.submitted_at).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedResultForDetail(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-600 block">Marks Obtained</span>
                <span className="text-lg font-black text-blue-800">
                  {selectedResultForDetail.obtained_marks} / {selectedResultForDetail.total_marks}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 block">Percentage</span>
                <span className="text-lg font-black text-emerald-800">
                  {selectedResultForDetail.percentage}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 block">Grade</span>
                <span className="text-lg font-black text-purple-800">
                  {selectedResultForDetail.grade}
                </span>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-bold text-slate-800">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Roll No:</span>
                <span className="font-bold text-slate-800">{student.roll_number} ({student.class})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Evaluation:</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {selectedResultForDetail.evaluation_status || 'Evaluated & Released'}
                </span>
              </div>
            </div>

            {/* Question by Question Answer Summary */}
            {selectedResultForDetail.answers && selectedResultForDetail.answers.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700">Question Evaluation Breakdown</h5>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {selectedResultForDetail.answers.map((ans, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-700">Q{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        {ans.question_type === 'mcq' ? (
                          ans.is_correct ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Correct (+{ans.marks_awarded})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                              Incorrect (0)
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Descriptive ({ans.marks_awarded} marks)
                          </span>
                        )}
                        {ans.teacher_feedback && (
                          <span className="text-[10px] text-slate-500 italic">
                            "{ans.teacher_feedback}"
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDownloadResultPdf(selectedResultForDetail)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => handlePrintResultPdf(selectedResultForDetail)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TEACHER / ADMIN EDIT MARKS MODAL --- */}
      {editingResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-800">Correct Assessment Marks</h4>
                <p className="text-[11px] text-slate-500">Teacher / Admin Result Modification</p>
              </div>
              <button onClick={() => setEditingResult(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Obtained Marks (out of {editingResult.total_marks})
                </label>
                <input
                  type="number"
                  min="0"
                  max={editingResult.total_marks}
                  value={editMarks}
                  onChange={(e) => setEditMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teacher Remarks / Correction Reason
                </label>
                <textarea
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  placeholder="e.g. Verified handwritten section, bonus marks awarded for question 4..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Save &amp; Recalculate Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
