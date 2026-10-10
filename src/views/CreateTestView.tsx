import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { api } from '../api/client';
import { 
  PlusCircle, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Award, 
  FileText, 
  Eye, 
  Download, 
  Printer, 
  Share2,
  CheckSquare,
  PenLine
} from 'lucide-react';
import { Question } from '../types';
import { generateTestQuestionPaperPdf } from '../utils/pdfGenerator';
import { PdfPreviewModal } from '../components/PdfPreviewModal';

interface CreateTestViewProps {
  onBack: () => void;
  onTestCreated: () => void;
}

export const CreateTestView: React.FC<CreateTestViewProps> = ({
  onBack,
  onTestCreated,
}) => {
  const [testType, setTestType] = useState<'mcq' | 'descriptive'>('mcq');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [subject, setSubject] = useState('Mathematics');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [instructions, setInstructions] = useState('Attempt all questions. Choose the correct option or write clear concise answers.');
  const [negativeMarking, setNegativeMarking] = useState(false);
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

  // PDF Preview State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<jsPDF | null>(null);

  const handleAddQuestionRow = () => {
    setQuestions(prev => [
      ...prev,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '0',
        marks: testType === 'mcq' ? 5 : 10,
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

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || (testType === 'mcq' ? 5 : 10)), 0);

  const handleGeneratePdf = () => {
    const formattedQuestions: Question[] = questions.map((q, idx) => ({
      id: `q_${idx + 1}`,
      class_name: className,
      subject,
      difficulty: 'medium',
      question_text: q.question_text || `Question ${idx + 1}`,
      question_type: testType,
      marks: q.marks,
      options: testType === 'mcq' ? q.options : undefined,
      correct_answer: q.correct_answer,
    }));

    const testData = {
      id: `test_${Date.now()}`,
      title: title || 'Examination Assessment Paper',
      description,
      class_name: className,
      subject,
      total_marks: totalMarks,
      duration_minutes: durationMinutes,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 86400000).toISOString(),
      created_by: 'Faculty Specialist',
      status: 'published' as const,
      test_type: testType,
      instructions,
    };

    const doc = generateTestQuestionPaperPdf(testData, formattedQuestions);
    setGeneratedPdf(doc);
    setPdfModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const formattedQuestions = questions.map(q => ({
      class_name: className,
      subject,
      difficulty: 'medium' as const,
      question_text: q.question_text || 'Standard Test Question',
      question_type: testType,
      marks: q.marks,
      options: testType === 'mcq' ? q.options : undefined,
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
        created_by: 'Sir Ghulam Yaseen',
        status: 'published',
        test_type: testType,
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
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests
          </button>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>Create Test &amp; Question Paper</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Build MCQ or Descriptive school exams with real examination paper PDF export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGeneratePdf}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Generate Test PDF</span>
          </button>
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
        {/* Test Type Toggle */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-800">
              Exam Format Selection
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTestType('mcq')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  testType === 'mcq'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Multiple Choice (MCQ)</span>
              </button>
              <button
                type="button"
                onClick={() => setTestType('descriptive')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  testType === 'descriptive'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Descriptive / Theory</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Test Title *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, General Science, English"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
              <div className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800">
                {totalMarks} Marks ({questions.length} Questions)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="negMark"
              checked={negativeMarking}
              onChange={e => setNegativeMarking(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <label htmlFor="negMark" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Enable Negative Marking (-0.25 per incorrect answer)
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instructions for Students</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            />
          </div>
        </div>

        {/* Question Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800">
              Exam Questions ({questions.length})
            </h3>
            <button
              type="button"
              onClick={handleAddQuestionRow}
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          {questions.map((q, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-slate-800">Question #{idx + 1}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Marks:</label>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={e => handleQuestionChange(idx, 'marks', Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      min={1}
                    />
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestionRow(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  rows={2}
                  value={q.question_text}
                  onChange={e => handleQuestionChange(idx, 'question_text', e.target.value)}
                  placeholder="Enter the question statement..."
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium"
                  required
                />
              </div>

              {testType === 'mcq' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Four Options &amp; Correct Answer</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((optLabel, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <input
                          type="radio"
                          name={`correct_${idx}`}
                          checked={q.correct_answer === oIdx.toString()}
                          onChange={() => handleQuestionChange(idx, 'correct_answer', oIdx.toString())}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-600">{optLabel}:</span>
                        <input
                          type="text"
                          value={q.options[oIdx]}
                          onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                          placeholder={`Option ${optLabel}`}
                          className="flex-1 bg-transparent text-xs font-medium outline-none"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Marking Points / Model Answer</label>
                  <input
                    type="text"
                    value={q.correct_answer}
                    onChange={e => handleQuestionChange(idx, 'correct_answer', e.target.value)}
                    placeholder="Key concepts or formula required for full marks..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Submission & Export Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleGeneratePdf}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Generate Examination PDF</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save &amp; Publish Test</span>
          </button>
        </div>
      </form>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        title={title || 'Examination Question Paper'}
        category="Test Paper"
        doc={generatedPdf}
        filename={`${(title || 'Test_Paper').replace(/\s+/g, '_')}.pdf`}
      />
    </div>
  );
};
