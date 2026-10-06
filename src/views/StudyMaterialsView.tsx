import React, { useState } from 'react';
import { BookMarked, Download, FileText, Search, ExternalLink, BookOpen } from 'lucide-react';

interface StudyMaterialsViewProps {
  className?: string;
}

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({
  className = 'Class 10',
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const materials = [
    {
      id: 'mat_1',
      title: 'Mathematics Unit 1: Quadratic Equations Handbook',
      subject: 'Mathematics',
      class_name: 'Class 10',
      type: 'PDF Notes',
      size: '2.4 MB',
      description: 'Comprehensive notes with solved examples and standard discriminant practice.',
    },
    {
      id: 'mat_2',
      title: 'General Science: Optics & Lens Formulas Summary',
      subject: 'General Science',
      class_name: 'Class 10',
      type: 'Chapter Guide',
      size: '1.8 MB',
      description: 'Refraction principles, Snell’s law, concave and convex lens diagrams.',
    },
    {
      id: 'mat_3',
      title: 'English Language: Essay Writing & Grammar Rules',
      subject: 'English Language',
      class_name: 'Class 10',
      type: 'Grammar Guide',
      size: '1.2 MB',
      description: 'Model descriptive essays, active/passive voice tables, and vocabulary lists.',
    },
    {
      id: 'mat_4',
      title: 'Pakistan Studies: Chapter 2 Constitutional History',
      subject: 'Pakistan Studies',
      class_name: 'Class 10',
      type: 'Text Notes',
      size: '3.1 MB',
      description: 'Key dates, resolutions, and educational milestones for board assessment.',
    },
    {
      id: 'mat_5',
      title: 'Urdu Literature: Poetry Comprehension & Tashreeh',
      subject: 'Urdu & Literature',
      class_name: 'Class 10',
      type: 'Solved Guide',
      size: '1.9 MB',
      description: 'Complete poetical explanations and exam question models.',
    },
  ];

  const filtered = materials.filter(m => {
    const matchSub = selectedSubject === 'all' || m.subject === selectedSubject;
    const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSub && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <BookMarked className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              School Study Materials &amp; Notes
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Curriculum syllabi, textbook notes, and revision sheets for {className}.
          </p>
        </div>
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
            <option value="Mathematics">Mathematics</option>
            <option value="General Science">General Science</option>
            <option value="English Language">English Language</option>
            <option value="Pakistan Studies">Pakistan Studies</option>
            <option value="Urdu & Literature">Urdu &amp; Literature</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study material..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mat) => (
          <div
            key={mat.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {mat.subject}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{mat.size}</span>
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm leading-snug">
                {mat.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {mat.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{mat.type}</span>
              <button
                onClick={() => alert(`Downloading ${mat.title}...`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Notes</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
