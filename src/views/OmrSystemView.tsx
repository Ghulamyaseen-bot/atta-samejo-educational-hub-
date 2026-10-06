import React, { useState, useEffect } from 'react';
import { OMRSheet, SchoolClass, Subject } from '../types';
import { api } from '../api/client';
import { OfficialLogo } from '../components/OfficialLogo';
import { 
  FileText, 
  Printer, 
  ScanLine, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Download,
  Check,
  ChevronRight,
  Upload
} from 'lucide-react';

interface OmrSystemViewProps {
  onViewResults: () => void;
}

export const OmrSystemView: React.FC<OmrSystemViewProps> = ({ onViewResults }) => {
  const [sheets, setSheets] = useState<OMRSheet[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'scan' | 'generate' | 'templates'>('scan');

  // Scanner state
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');
  const [studentRollNo, setStudentRollNo] = useState<string>('05');
  const [scannedBubbles, setScannedBubbles] = useState<Record<number, string>>({});
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sheet creator state
  const [newTitle, setNewTitle] = useState('Class 10 Monthly OMR Assessment');
  const [newClass, setNewClass] = useState('Class 10');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newQuestionCount, setNewQuestionCount] = useState<number>(20);
  const [answerKey, setAnswerKey] = useState<string[]>(Array(20).fill('A'));
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sRes = await api.getOMRSheets();
    if (sRes.success && sRes.data) {
      setSheets(sRes.data);
      if (sRes.data.length > 0 && !selectedSheetId) {
        setSelectedSheetId(sRes.data[0].id);
      }
    }

    const cRes = await api.getClasses();
    if (cRes.success && cRes.data) setClasses(cRes.data);

    const subRes = await api.getSubjects();
    if (subRes.success && subRes.data) setSubjects(subRes.data);
  };

  const handleBubbleClick = (qNum: number, opt: string) => {
    setScannedBubbles(prev => ({
      ...prev,
      [qNum]: prev[qNum] === opt ? '' : opt,
    }));
  };

  const handleSimulateFill = () => {
    // Fill realistic student bubbles for quick test
    const currentSheet = sheets.find(s => s.id === selectedSheetId) || sheets[0];
    if (!currentSheet) return;

    const mockFilled: Record<number, string> = {};
    currentSheet.answer_key.forEach((key, idx) => {
      // 80% correct, 15% random, 5% blank
      const roll = Math.random();
      if (roll > 0.15) {
        mockFilled[idx + 1] = key;
      } else if (roll > 0.05) {
        const alt = ['A', 'B', 'C', 'D'].filter(x => x !== key);
        mockFilled[idx + 1] = alt[Math.floor(Math.random() * alt.length)];
      }
    });
    setScannedBubbles(mockFilled);
  };

  const handleProcessScan = async () => {
    if (!selectedSheetId) return;
    setIsProcessing(true);
    setScanResult(null);

    const res = await api.scanOMR(selectedSheetId, studentRollNo, scannedBubbles);
    setIsProcessing(false);

    if (res.success && res.data) {
      setScanResult(res.data);
    }
  };

  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.createOMRSheet({
      title: newTitle,
      class_name: newClass,
      subject: newSubject,
      question_count: newQuestionCount,
      options_per_question: 4,
      answer_key: answerKey.slice(0, newQuestionCount),
      created_by: 'Teacher / Admin',
    });

    if (created.success) {
      setCreateSuccess('OMR Sheet created and added to templates!');
      loadData();
      setTimeout(() => setCreateSuccess(null), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentSheet = sheets.find(s => s.id === selectedSheetId) || sheets[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ScanLine className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              Optical Mark Recognition (OMR) System
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable bubble sheets, scan filled answers, and grade school tests.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            OMR Scanner
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'generate' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Create &amp; Print
          </button>
        </div>
      </div>

      {/* --- TAB 1: OMR SCANNER --- */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Setup & Optical Bubble Sheet */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Select OMR Test Sheet</label>
                <select
                  value={selectedSheetId}
                  onChange={(e) => {
                    setSelectedSheetId(e.target.value);
                    setScannedBubbles({});
                    setScanResult(null);
                  }}
                  className="mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  {sheets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.class_name} • {s.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Student Roll No</label>
                <input
                  type="text"
                  value={studentRollNo}
                  onChange={(e) => setStudentRollNo(e.target.value)}
                  className="mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 w-24 text-center"
                />
              </div>

              <div className="self-end">
                <button
                  onClick={handleSimulateFill}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Fill Bubbles</span>
                </button>
              </div>
            </div>

            {/* Bubble Matrix Sheet Display */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600">
                <span>OMR Bubble Grid (Click bubbles to mark filled answers)</span>
                <span className="text-purple-600 font-semibold">
                  Filled: {Object.values(scannedBubbles).filter(Boolean).length} / {currentSheet?.question_count || 20}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 max-h-[420px] overflow-y-auto pr-2">
                {Array.from({ length: currentSheet?.question_count || 20 }).map((_, idx) => {
                  const qNum = idx + 1;
                  const currentFilled = scannedBubbles[qNum];
                  return (
                    <div
                      key={qNum}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <span className="font-bold text-slate-500 w-8">Q{qNum}.</span>
                      <div className="flex items-center gap-2">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const isBubbleFilled = currentFilled === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleBubbleClick(qNum, opt)}
                              className={`w-7 h-7 rounded-full text-[11px] font-bold border flex items-center justify-center transition-all ${
                                isBubbleFilled
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-inner'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setScannedBubbles({})}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Clear Bubbles
              </button>
              <button
                onClick={handleProcessScan}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30"
              >
                <ScanLine className="w-4 h-4" />
                <span>{isProcessing ? 'Processing OMR Sheet...' : 'Process & Grade Sheet'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Scan Evaluation Results */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Evaluation Results</span>
              </h3>

              {scanResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="text-xs text-slate-400">Student Name</div>
                    <div className="text-sm font-extrabold text-slate-800">{scanResult.student_name}</div>
                    <div className="text-xs text-slate-500">Roll No: {scanResult.roll_number}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-500">Obtained Marks</span>
                      <span className="text-lg font-extrabold text-blue-800 block">
                        {scanResult.obtained_marks} / {scanResult.total_marks}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600">Percentage</span>
                      <span className="text-lg font-extrabold text-emerald-700 block">
                        {scanResult.percentage}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                      <span className="text-[10px] font-bold text-purple-600">School Grade</span>
                      <span className="text-xl font-extrabold text-purple-700 block">
                        {scanResult.grade}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500">Correct Answers</span>
                      <span className="text-lg font-extrabold text-slate-700 block">
                        {scanResult.correct_count} / {scanResult.total_questions}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
                    OMR score has been automatically verified and added to student results report!
                  </div>

                  <button
                    onClick={onViewResults}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                  >
                    View All Results &amp; Analytics
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <ScanLine className="w-10 h-10 mx-auto text-slate-300 animate-pulse" />
                  <p className="text-xs">No scan performed yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Click "Auto-Fill Bubbles" or select answers, then click "Process &amp; Grade Sheet".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: CREATE & PRINT OMR SHEET --- */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          {/* Creator Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm no-print">
            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Create New OMR Assessment Sheet</span>
            </h3>

            {createSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateSheet} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sheet Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Class (1 to 12)</label>
                <select
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
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
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div className="sm:col-span-3 flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  Configured: {newQuestionCount} questions with 4 options (A, B, C, D).
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Save OMR Specification
                </button>
              </div>
            </form>
          </div>

          {/* Printable Official OMR Sheet Template */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-300 shadow-md print:border-none print:shadow-none space-y-6">
            {/* Print Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
              <OfficialLogo size="md" />
              <div className="text-right">
                <h3 className="font-extrabold text-base text-slate-900 uppercase">OFFICIAL OMR ANSWER SHEET</h3>
                <p className="text-xs text-slate-600 font-bold">{newTitle}</p>
                <p className="text-[11px] text-slate-500">{newClass} • {newSubject}</p>
              </div>
            </div>

            {/* Candidate Details & Roll Number Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 border border-slate-300 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 uppercase">Student Information</div>
                <div className="border-b border-dashed border-slate-400 pb-1">Name: _______________________________</div>
                <div className="border-b border-dashed border-slate-400 pb-1">Father's Name: _______________________</div>
                <div>Class: <span className="font-bold">{newClass}</span> &nbsp;&nbsp;&nbsp; Section: [ &nbsp; ]</div>
              </div>

              <div className="p-3 border border-slate-300 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 uppercase">Instructions</div>
                <ul className="text-[10px] text-slate-600 list-disc list-inside space-y-0.5">
                  <li>Use Black or Blue ballpoint pen only.</li>
                  <li>Darken complete bubble like this: ● (not ✕ or ✓).</li>
                  <li>Do not fold or crush this OMR sheet.</li>
                </ul>
              </div>
            </div>

            {/* OMR Bubble Question Grid (Printable format) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 w-6">{(i + 1).toString().padStart(2, '0')}.</span>
                  <div className="flex items-center gap-1.5">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <span key={opt} className="w-5 h-5 rounded-full border border-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-800">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Print Action Button */}
            <div className="flex justify-end pt-4 no-print">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official OMR Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
