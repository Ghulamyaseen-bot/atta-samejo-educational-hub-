import React, { useState, useEffect } from 'react';
import { Question, Subject, SchoolClass } from '../types';
import { api } from '../api/client';
import { 
  BookOpen, 
  Search, 
  Plus, 
  CheckCircle2, 
  X, 
  HelpCircle,
  Lightbulb,
  Check,
  ChevronDown
} from 'lucide-react';

export const McqBankView: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeReveals, setActiveReveals] = useState<Record<string, boolean>>({});

  // Add question state
  const [qText, setQText] = useState('');
  const [qClass, setQClass] = useState('Class 10');
  const [qSubject, setQSubject] = useState('Mathematics');
  const [qTopic, setQTopic] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qMarks, setQMarks] = useState(5);
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState('0');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const res = await api.getQuestions();
    if (res.success && res.data) {
      setQuestions(res.data);
    }
  };

  const toggleReveal = (qId: string) => {
    setActiveReveals(prev => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addQuestion({
      class_name: qClass,
      subject: qSubject,
      topic: qTopic || 'General Topic',
      difficulty: qDifficulty,
      question_text: qText,
      question_type: 'mcq',
      marks: Number(qMarks),
      options: [optA, optB, optC, optD],
      correct_answer: correctOpt,
      explanation,
    });
    setShowAddModal(false);
    // reset
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
    loadQuestions();
  };

  const filtered = questions.filter(q => {
    const matchClass = selectedClass === 'all' || q.class_name.toLowerCase() === selectedClass.toLowerCase();
    const matchSub = selectedSubject === 'all' || q.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchClass && matchSub && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              MCQ Question Bank &amp; Repository
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Curated school question bank for Class 1 to Class 12 test preparation.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question to Bank</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block uppercase">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Classes</option>
              {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block uppercase">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="General Science">General Science</option>
              <option value="English Language">English Language</option>
              <option value="Urdu & Literature">Urdu &amp; Literature</option>
              <option value="Pakistan Studies">Pakistan Studies</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or topics..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
            No questions found matching your filter criteria.
          </div>
        ) : (
          filtered.map((q, idx) => {
            const isRevealed = activeReveals[q.id];
            return (
              <div key={q.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {q.class_name} • {q.subject}
                    </span>
                    {q.topic && (
                      <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        ({q.topic})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                      q.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {q.marks} Marks
                    </span>
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                  {q.question_text}
                </p>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options?.map((opt, optIdx) => {
                    const isCorrect = String(optIdx) === String(q.correct_answer);
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          isRevealed && isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold uppercase text-slate-400">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isRevealed && isCorrect && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Answer reveal toggle */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => toggleReveal(q.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{isRevealed ? 'Hide Answer Key' : 'Reveal Answer & Explanation'}</span>
                  </button>

                  {isRevealed && q.explanation && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      {q.explanation}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add New Question */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-extrabold text-slate-800">Add New MCQ to Question Bank</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class (1 to 12)</label>
                  <select
                    value={qClass}
                    onChange={(e) => setQClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={qSubject}
                    onChange={(e) => setQSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Type the question clearly..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option A</label>
                  <input
                    type="text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option B</label>
                  <input
                    type="text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option C</label>
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option D</label>
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correct Option</label>
                  <select
                    value={correctOpt}
                    onChange={(e) => setCorrectOpt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                  >
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    value={qMarks}
                    onChange={(e) => setQMarks(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Explanation (Optional)</label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this option is correct..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
