import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Student, Teacher, SchoolClass, Subject, Test, TestResult } from '../types';
import { 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardCheck, 
  BarChart3, 
  Plus, 
  Printer, 
  Download,
  School,
  CheckCircle2
} from 'lucide-react';

export const AdminManageView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'classes' | 'subjects' | 'reports'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);

  // Add subject modal/state
  const [newSubName, setNewSubName] = useState('');
  const [newSubClass, setNewSubClass] = useState('Class 10');
  const [showAddSub, setShowAddSub] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const s = await api.getStudents();
    if (s.success && s.data) setStudents(s.data);

    const c = await api.getClasses();
    if (c.success && c.data) setClasses(c.data);

    const sub = await api.getSubjects();
    if (sub.success && sub.data) setSubjects(sub.data);

    const t = await api.getTests();
    if (t.success && t.data) setTests(t.data);

    const r = await api.getResults();
    if (r.success && r.data) setResults(r.data);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    await api.addSubject({
      subject_name: newSubName,
      class_name: newSubClass,
    });
    setNewSubName('');
    setShowAddSub(false);
    loadAll();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              Hub Administration &amp; Academic Control
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official management of students, faculty, classes, subjects, assessments &amp; reports.
          </p>
        </div>

        {/* Admin Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'classes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Classes &amp; Subjects
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'reports' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key School Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" /> Total Students
              </div>
              <div className="text-3xl font-extrabold text-slate-800 mt-2">{students.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Enrolled Class 1–12</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" /> Teaching Faculty
              </div>
              <div className="text-3xl font-extrabold text-slate-800 mt-2">8</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Subject Specialists</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-purple-600" /> Active Tests
              </div>
              <div className="text-3xl font-extrabold text-slate-800 mt-2">{tests.length}</div>
              <div className="text-[11px] text-purple-600 font-semibold mt-0.5">MCQ &amp; OMR Exams</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-500" /> Results Logged
              </div>
              <div className="text-3xl font-extrabold text-slate-800 mt-2">{results.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Official Submissions</div>
            </div>
          </div>

          {/* Quick Hub Settings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-800">
              School Assessment Grading Scale (Strictly Marks &rarr; Percentage &rarr; Grade)
            </h3>
            <p className="text-xs text-slate-500">
              Confirmed standard: strictly Class 1–12 school grading scale. No university GPA/CGPA.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-extrabold text-lg text-emerald-700 block">Grade A+</span>
                <span className="text-[11px] text-emerald-600 font-semibold">80% – 100%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Outstanding</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="font-extrabold text-lg text-emerald-700 block">Grade A</span>
                <span className="text-[11px] text-emerald-600 font-semibold">70% – 79.9%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Excellent</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="font-extrabold text-lg text-blue-700 block">Grade B</span>
                <span className="text-[11px] text-blue-600 font-semibold">60% – 69.9%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Good</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="font-extrabold text-lg text-amber-700 block">Grade C</span>
                <span className="text-[11px] text-amber-600 font-semibold">50% – 59.9%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Fair</span>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                <span className="font-extrabold text-lg text-orange-700 block">Grade D</span>
                <span className="text-[11px] text-orange-600 font-semibold">40% – 49.9%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Passing</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="font-extrabold text-lg text-rose-700 block">Grade F</span>
                <span className="text-[11px] text-rose-600 font-semibold">Below 40%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Fail</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CLASSES & SUBJECTS TAB --- */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Classes &amp; Subject Offerings</h3>
                <p className="text-xs text-slate-500">Configure subjects per class (Class 1 to Class 12)</p>
              </div>
              <button
                onClick={() => setShowAddSub(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {classes.slice(0, 12).map((cls) => {
                const classSubs = subjects.filter(s => s.class_name.toLowerCase() === cls.class_name.toLowerCase());
                return (
                  <div key={cls.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-800">{cls.class_name}</span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Sections: {cls.sections.join(', ')}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      {classSubs.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No custom subjects added.</span>
                      ) : (
                        classSubs.map(s => (
                          <div key={s.id} className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span>{s.subject_name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- REPORTS TAB --- */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-800">Master School Examination Log</h3>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <Printer className="w-4 h-4" />
              <span>Print Complete School Gazette</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Test Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Marks</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{r.student_name}</td>
                    <td className="py-3 px-4 font-medium">{r.class_name} ({r.section})</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{r.test_title}</td>
                    <td className="py-3 px-4">{r.subject}</td>
                    <td className="py-3 px-4 text-center font-bold">{r.obtained_marks} / {r.total_marks}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-blue-700">{r.percentage}%</td>
                    <td className="py-3 px-4 text-center font-extrabold">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h4 className="text-base font-extrabold text-slate-800">Add New Subject</h4>
            <form onSubmit={handleAddSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Computer Science, Islamiat"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Class (1 to 12)</label>
                <select
                  value={newSubClass}
                  onChange={(e) => setNewSubClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSub(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
