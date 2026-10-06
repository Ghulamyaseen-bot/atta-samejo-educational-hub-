import React, { useState } from 'react';
import { api } from '../api/client';
import { PlusCircle, Plus, Trash2, ArrowLeft, CheckCircle2, Clock, Award } from 'lucide-react';
import { Question } from '../types';

interface CreateTestViewProps {
  onBack: () => void;
  onTestCreated: () => void;
}

export const CreateTestView: React.FC<CreateTestViewProps> = ({
  onBack,
  onTestCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [subject, setSubject] = useState('Mathematics');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [instructions, setInstructions] = useState('Attempt all questions. Select the correct option for each.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Dynamic question list
  const [questions, setQuestions] = useState<Array<{
    question_text: string;
    options: [string, string, string, string];
    correct_answer: string;
    marks: number;
    explanation: string;
  }>>([
    {
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '0',
      marks: 5,
      explanation: '',
    },
  ]);

  const handleAddQuestionRow = () => {
    setQuestions(prev => [
      ...prev,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '0',
        marks: 5,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestionRow = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const newOpts = [...copy[qIdx].options] as [string, string, string, string];
      newOpts[optIdx] = val;
      copy[qIdx] = { ...copy[qIdx], options: newOpts };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 5), 0);

    const formattedQuestions = questions.map(q => ({
      class_name: className,
      subject,
      difficulty: 'medium' as const,
      question_text: q.question_text || 'Standard Test Question',
      question_type: 'mcq' as const,
      marks: q.marks,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    }));

    const res = await api.createTest(
      {
        title,
        description,
        class_name: className,
        subject,
        total_marks: totalMarks,
        duration_minutes: durationMinutes,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 86400000).toISOString(),
        created_by: 'Teacher / Hub Staff',
        status: 'published',
        test_type: 'mcq',
        instructions,
      },
      formattedQuestions
    );

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => {
        onTestCreated();
      }, 1200);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests
          </button>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>Create New Test / Exam</span>
          </h2>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Test published successfully! Redirecting to test directory...</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Test Parameters Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-3">
            Assessment Information (Class 1–12)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Test Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mathematics Monthly Assessment 2"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, Science, English"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Class (1 to 12)</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={5}
                max={180}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Calculated Total Marks</label>
              <div className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800">
                {questions.reduce((sum, q) => sum + (q.marks || 5), 0)} Marks
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Test Description &amp; Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Dynamic Questions Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-800">
              Questions ({questions.length})
            </h3>
            <button
              type="button"
              onClick={handleAddQuestionRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Question</span>
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-xs text-blue-600">
                  Question {qIdx + 1}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Marks:</label>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={(e) => handleQuestionChange(qIdx, 'marks', Number(e.target.value))}
                      min={1}
                      className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                    />
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestionRow(qIdx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Statement</label>
                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(qIdx, 'question_text', e.target.value)}
                  placeholder="Enter question text..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {letter}
                    </span>
                    <input
                      type="text"
                      value={q.options[optIdx]}
                      onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                      placeholder={`Option ${letter}`}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correct Answer</label>
                  <select
                    value={q.correct_answer}
                    onChange={(e) => handleQuestionChange(qIdx, 'correct_answer', e.target.value)}
                    className="w-full px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold"
                  >
                    <option value="0">Option A is correct</option>
                    <option value="1">Option B is correct</option>
                    <option value="2">Option C is correct</option>
                    <option value="3">Option D is correct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Explanation (Optional)</label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                    placeholder="Brief explanation for student review..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            {isSubmitting ? 'Publishing Test...' : 'Publish Test to Students'}
          </button>
        </div>
      </form>
    </div>
  );
};
