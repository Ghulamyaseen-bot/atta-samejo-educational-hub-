import React, { useState, useEffect } from 'react';
import { Test, Role } from '../types';
import { api } from '../api/client';
import { 
  ClipboardCheck, 
  Clock, 
  Award, 
  Calendar, 
  ArrowRight, 
  Search, 
  Plus, 
  Trash2,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface MyTestsViewProps {
  className?: string;
  role: Role;
  onTakeTest: (testId: string) => void;
  onCreateTest: () => void;
}

export const MyTestsView: React.FC<MyTestsViewProps> = ({
  className = 'Class 10',
  role,
  onTakeTest,
  onCreateTest,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTests();
  }, [className]);

  const loadTests = async () => {
    const res = await api.getTests(role === 'student' ? className : undefined);
    if (res.success && res.data) {
      setTests(res.data);
    }
  };

  const handleDeleteTest = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this test?')) {
      await api.deleteTest(id);
      loadTests();
    }
  };

  const subjects = Array.from(new Set(tests.map(t => t.subject)));

  const filtered = tests.filter(t => {
    const matchSub = selectedSubject === 'all' || t.subject === selectedSubject;
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSub && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              Assigned Tests &amp; Practice Assessments
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            School examinations and practice quizzes for {className}.
          </p>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <button
            onClick={onCreateTest}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Test</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test titles..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
            No tests currently available for this selection.
          </div>
        ) : (
          filtered.map((test) => (
            <div
              key={test.id}
              onClick={() => onTakeTest(test.id)}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <BookOpen className="w-3 h-3" />
                    <span>{test.subject}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{test.class_name}</span>
                    {(role === 'teacher' || role === 'admin') && (
                      <button
                        onClick={(e) => handleDeleteTest(test.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete test"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {test.description}
                </p>
              </div>

              {/* Meta information: duration, marks, start date */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{test.duration_minutes} mins</span>
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{test.total_marks} Marks</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Start Test</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
