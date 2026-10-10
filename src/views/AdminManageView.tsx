import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Student, Teacher, SchoolClass, Subject, Test, TestResult, User } from '../types';
import officialAdminPortrait from '../assets/FB_IMG_1790800525155.jpg';
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
  CheckCircle2,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Phone,
  Calendar,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';

export const AdminManageView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'classes' | 'reports'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);

  // Registered students search and filter
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentClass, setSelectedStudentClass] = useState<string>('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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

    const u = await api.getUsers();
    if (u.success && u.data) setUsers(u.data);

    const c = await api.getClasses();
    if (c.success && c.data) setClasses(c.data);

    const sub = await api.getSubjects();
    if (sub.success && sub.data) setSubjects(sub.data);

    const t = await api.getTests();
    if (t.success && t.data) setTests(t.data);

    const r = await api.getResults();
    if (r.success && r.data) setResults(r.data);
  };

  const handleToggleStudentStatus = async (studentId: string, currentStatus?: string) => {
    const res = await api.toggleStudentStatus(studentId);
    if (res.success) {
      setActionMessage(`Student account status set to ${res.data?.status === 'deactivated' ? 'Deactivated' : 'Active'}.`);
      loadAll();
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      alert(res.error || 'Failed to update account status.');
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (confirm(`Are you sure you want to completely remove student "${student.name}" (${student.student_id}) and delete their login account?`)) {
      const res = await api.deleteStudent(student.id);
      if (res.success) {
        setActionMessage(`Student account "${student.name}" permanently deleted.`);
        if (selectedStudentDetail?.id === student.id) {
          setSelectedStudentDetail(null);
        }
        loadAll();
        setTimeout(() => setActionMessage(null), 3500);
      } else {
        alert(res.error || 'Failed to delete student account.');
      }
    }
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
      {/* Top Banner with Permanent Administrator Official Portrait */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Permanent Administrator Portrait (Uneditable Official Photo) */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden ring-2 ring-purple-500/50 shadow-md bg-slate-900">
              <img
                src={officialAdminPortrait || "/assets/FB_IMG_1790800525155.jpg"}
                alt="Official Administrator Ghulam Yaseen"
                className="w-full h-full object-cover object-top select-none pointer-events-none"
                onError={(e) => {
                  e.currentTarget.src = "/FB_IMG_1790800525155.jpg";
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                Hub Administration &amp; Academic Control
              </h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase">
                Official Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ghulam Yaseen (Administrator &amp; Founder) • Management of students, faculty, classes, assessments &amp; reports.
            </p>
          </div>
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
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'students' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Registered Students ({students.length})</span>
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

      {/* --- REGISTERED STUDENTS TAB (ADMIN ONLY) --- */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {actionMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionMessage}</span>
              </div>
              <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Control Bar: Total Stats, Filter by Class, Search */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Registered Students Directory</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional database of Class 1–12 learners. Full admin control to manage, inspect, deactivate, or remove student accounts.
                </p>
              </div>

              {/* Total Registered Students Counter Badge */}
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Total Registered: {students.length}</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Filter by Class:</label>
                <select
                  value={selectedStudentClass}
                  onChange={(e) => setSelectedStudentClass(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">All Classes (1 to 12)</option>
                  {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by student name, ID, or phone..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Student ID / Username</th>
                    <th className="py-3 px-4">Class &amp; Section</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Registration Date</th>
                    <th className="py-3 px-4 text-center">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(() => {
                    const filteredStudents = students.filter(std => {
                      const matchClass = selectedStudentClass === 'all' || std.class === selectedStudentClass;
                      const q = studentSearch.toLowerCase().trim();
                      const matchQuery = !q || 
                        std.name.toLowerCase().includes(q) ||
                        std.student_id.toLowerCase().includes(q) ||
                        (std.phone && std.phone.toLowerCase().includes(q)) ||
                        std.father_name.toLowerCase().includes(q);
                      return matchClass && matchQuery;
                    });

                    if (filteredStudents.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No registered students found matching your search.
                          </td>
                        </tr>
                      );
                    }

                    return filteredStudents.map((std) => {
                      const user = users.find(u => u.id === std.user_id);
                      const isDeactivated = user?.status === 'deactivated';

                      return (
                        <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Student Name & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={std.profile_photo || '/assets/student_avatar.svg'}
                                alt={std.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 bg-slate-100 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-slate-800 block text-xs">{std.name}</span>
                                <span className="text-[10px] text-slate-400 block">S/O {std.father_name}</span>
                              </div>
                            </div>
                          </td>

                          {/* Student ID / Username */}
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                            {std.student_id}
                          </td>

                          {/* Class */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{std.class}</span>
                            <span className="text-slate-400 text-[11px] ml-1">({std.section}) • Roll {std.roll_number}</span>
                          </td>

                          {/* Phone */}
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {std.phone || '—'}
                          </td>

                          {/* Registration Date */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {new Date(std.created_at || '2026-09-01').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isDeactivated 
                                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isDeactivated ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                              <span>{isDeactivated ? 'Deactivated' : 'Active'}</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => setSelectedStudentDetail(std)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="View Complete Student Record"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Deactivate / Activate */}
                              <button
                                onClick={() => handleToggleStudentStatus(std.id, user?.status)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isDeactivated 
                                    ? 'text-emerald-600 hover:bg-emerald-50' 
                                    : 'text-amber-600 hover:bg-amber-50'
                                }`}
                                title={isDeactivated ? 'Reactivate Student Account' : 'Deactivate Student Account'}
                              >
                                {isDeactivated ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                              </button>

                              {/* Delete Student Account */}
                              <button
                                onClick={() => handleDeleteStudent(std)}
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                title="Permanently Delete Student Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Detail Modal */}
          {selectedStudentDetail && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <span>Student Profile &amp; Account Details</span>
                  </h4>
                  <button
                    onClick={() => setSelectedStudentDetail(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <img
                    src={selectedStudentDetail.profile_photo || '/assets/student_avatar.svg'}
                    alt={selectedStudentDetail.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20 bg-white"
                  />
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">{selectedStudentDetail.name}</h5>
                    <p className="text-xs text-slate-500">S/O {selectedStudentDetail.father_name}</p>
                    <span className="inline-block mt-1 font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      ID: {selectedStudentDetail.student_id}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block font-semibold text-[11px]">Class &amp; Section</span>
                    <span className="font-extrabold text-slate-800">{selectedStudentDetail.class} - {selectedStudentDetail.section}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block font-semibold text-[11px]">Roll Number</span>
                    <span className="font-extrabold text-slate-800">{selectedStudentDetail.roll_number}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block font-semibold text-[11px]">Phone Number</span>
                    <span className="font-extrabold text-slate-800">{selectedStudentDetail.phone || '—'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block font-semibold text-[11px]">Date of Birth</span>
                    <span className="font-extrabold text-slate-800">{selectedStudentDetail.date_of_birth}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDeleteStudent(selectedStudentDetail)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Student Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStudentDetail(null)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
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
