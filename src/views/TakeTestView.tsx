import React, { useState, useEffect } from 'react';
import { Test, Question, TestResult } from '../types';
import { api } from '../api/client';
import { calculatePercentage, calculateSchoolGrade, getGradeBadgeColor } from '../utils/grading';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Trophy,
  Check,
  X
} from 'lucide-react';

interface TakeTestViewProps {
  test: Test & { questions: Question[] };
  studentId: string;
  onBackToDashboard: () => void;
  onViewResults: (result: TestResult) => void;
}

export const TakeTestView: React.FC<TakeTestViewProps> = ({
  test,
  studentId,
  onBackToDashboard,
  onViewResults,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>((test.duration_minutes || 20) * 60);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const questions = test.questions || [];
  const currentQ = questions[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (testResult) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [testResult]);

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQ || testResult) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const toggleMarkForReview = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleAutoSubmit = async () => {
    await doSubmitTest();
  };

  const doSubmitTest = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const submissionPayload = questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id],
    }));

    const res = await api.submitTest(test.id, studentId, submissionPayload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setTestResult(res.data);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQ && !testResult) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600">No questions available in this test.</p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  // --- RESULT VIEW POST-SUBMISSION ---
  if (testResult) {
    const badgeColor = getGradeBadgeColor(testResult.grade);
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Test Completed Successfully!</h2>
          <p className="text-sm text-slate-500 mt-1">{test.title} • {test.subject}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 max-w-xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-xs font-semibold text-slate-400">Obtained Marks</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
                {testResult.obtained_marks} / {testResult.total_marks}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="block text-xs font-semibold text-blue-500">Percentage</span>
              <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
                {testResult.percentage}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="block text-xs font-semibold text-emerald-600">School Grade</span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                {testResult.grade}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="block text-xs font-semibold text-purple-600">Questions</span>
              <span className="text-2xl font-extrabold text-purple-700 mt-1 block">
                {questions.length}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button
              onClick={onBackToDashboard}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => onViewResults(testResult)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              View Full Report Card
            </button>
          </div>
        </div>

        {/* Question-by-Question Review with Explanations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-800 border-b border-slate-100 pb-3">
            Answer Review &amp; Explanations
          </h3>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const studentChoice = answers[q.id];
              const isCorrect = String(studentChoice) === String(q.correct_answer);
              return (
                <div key={q.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-xs text-slate-400">
                      Question {idx + 1} ({q.marks} Marks)
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check className="w-3.5 h-3.5" /> Correct (+{q.marks})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        <X className="w-3.5 h-3.5" /> Incorrect (0 Marks)
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-sm text-slate-800">{q.question_text}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options?.map((opt, optIdx) => {
                      const isChosen = studentChoice === optIdx;
                      const isRightOption = String(optIdx) === String(q.correct_answer);
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                            isRightOption
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                              : isChosen
                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-bold uppercase">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </span>
                          {isRightOption && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-600">
                      <span className="font-bold text-slate-700">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE TEST INTERFACE ---
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Test Header with Timer & Progress */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800">{test.title}</h2>
          <span className="text-xs text-blue-600 font-semibold">{test.subject} • {test.class_name}</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-xl text-blue-700 font-bold text-sm">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Question Stepper Indicator Grid */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-slate-700">Question Palette</span>
          <span className="text-slate-400 font-medium">
            Answered: {Object.keys(answers).length} / {questions.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isMarked = markedForReview[q.id];
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all relative ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 ring-offset-2 bg-blue-600 text-white'
                    : isMarked
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
                {isMarked && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-1 ring-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Question {currentIndex + 1} of {questions.length}
          </span>

          <button
            onClick={toggleMarkForReview}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              markedForReview[currentQ.id]
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {markedForReview[currentQ.id] ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Marked for Review</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Mark for Review</span>
              </>
            )}
          </button>
        </div>

        {/* Question Text */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
            {currentQ.question_text}
          </h3>
          <span className="inline-block mt-2 text-[11px] font-semibold text-slate-400">
            Points: {currentQ.marks} Marks
          </span>
        </div>

        {/* MCQ Options A/B/C/D */}
        <div className="space-y-3 pt-2">
          {currentQ.options?.map((optionText, optIndex) => {
            const isSelected = answers[currentQ.id] === optIndex;
            return (
              <div
                key={optIndex}
                onClick={() => handleSelectOption(optIndex)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </div>
                  <span className="text-sm font-semibold">{optionText}</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons: Previous, Next, Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Test</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal: "Are you sure you want to submit your test?" */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-lg font-extrabold text-slate-800">
                Are you sure you want to submit your test?
              </h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                You have answered {Object.keys(answers).length} out of {questions.length} questions.
                {Object.keys(answers).length < questions.length && (
                  <span className="text-rose-600 font-bold block mt-1">
                    Warning: You still have {questions.length - Object.keys(answers).length} unanswered questions!
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Continue Test
              </button>
              <button
                onClick={doSubmitTest}
                disabled={isSubmitting}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
