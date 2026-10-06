import React, { useState } from 'react';
import { PenLine, CheckCircle2, Clock, Award, ArrowLeft, Send } from 'lucide-react';

interface DescriptiveTestViewProps {
  onBack: () => void;
}

export const DescriptiveTestView: React.FC<DescriptiveTestViewProps> = ({ onBack }) => {
  const [answerText, setAnswerText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <PenLine className="w-5 h-5 text-indigo-600" />
            <span>Descriptive Assessment: English Writing Task</span>
          </h2>
          <span className="text-xs text-blue-600 font-semibold">Class 10 • English Language</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> 40 Minutes
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" /> 15 Marks
          </span>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800">Descriptive Answer Submitted!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your essay has been securely submitted to your teacher (Sir Atta Samejo) for grading. Evaluated marks and feedback will appear in your Results tab.
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto text-left text-xs text-slate-700">
            <span className="font-bold text-slate-500 block mb-1">Submitted Response ({wordCount} words):</span>
            <p className="whitespace-pre-wrap leading-relaxed">{answerText}</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Question Prompt */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase">Question 1 (15 Marks)</span>
              <span className="text-xs font-semibold text-slate-500">Target: 100 – 150 Words</span>
            </div>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">
              "Explain the role of discipline and scheduled study in a student’s academic success. Highlight how regular practice shapes performance."
            </p>
          </div>

          {/* Student Answer Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Your Written Answer:</label>
              <span className={`font-semibold ${wordCount < 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                Words: {wordCount}
              </span>
            </div>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Begin writing your descriptive answer here in complete sentences..."
              rows={8}
              className="w-full p-4 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Submit Descriptive Answer</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
