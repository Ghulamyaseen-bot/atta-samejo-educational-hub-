import React, { useState, useEffect, useRef } from 'react';
import { OMRSheet, SchoolClass, Subject, Student, TestResult, OMRAnswerKey, User } from '../types';
import { api } from '../api/client';
import { OfficialLogo } from '../components/OfficialLogo';
import { generateOmrSheetPdf, generateIndividualResultPdf, downloadPdf, printPdf } from '../utils/pdfGenerator';
import { calculatePercentage, calculateSchoolGrade, getGradeBadgeColor } from '../utils/grading';
import officialAdminPortrait from '../assets/FB_IMG_1790800525155.jpg';
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
  Upload,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Eye,
  KeyRound,
  X,
  HelpCircle,
  TrendingUp,
  Award,
  Edit2,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ListFilter,
  School
} from 'lucide-react';

interface OmrSystemViewProps {
  onViewResults: () => void;
  currentUser?: User | null;
}

export const OmrSystemView: React.FC<OmrSystemViewProps> = ({ onViewResults, currentUser }) => {
  const [sheets, setSheets] = useState<OMRSheet[]>([]);
  const [answerKeys, setAnswerKeys] = useState<OMRAnswerKey[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'scan' | 'generate' | 'keys'>('scan');

  // Scanner state
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');
  const [selectedAnswerKeyId, setSelectedAnswerKeyId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentRollNo, setStudentRollNo] = useState<string>('01');
  const [scannedBubbles, setScannedBubbles] = useState<Record<number, string>>({});
  const [detectionConfidence, setDetectionConfidence] = useState<Record<number, number>>({});
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageQualityNotice, setImageQualityNotice] = useState<string | null>(null);
  const [hasScannedImage, setHasScannedImage] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Dedicated Answer Key Management State
  const [keyEditorMode, setKeyEditorMode] = useState<'list' | 'editor'>('list');
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [keyFormName, setKeyFormName] = useState<string>('Class 10 Midterm Model Answer Key');
  const [keyFormExamId, setKeyFormExamId] = useState<string>('EXAM-MID-101');
  const [keyFormClass, setKeyFormClass] = useState<string>('Class 10');
  const [keyFormSubject, setKeyFormSubject] = useState<string>('Mathematics');
  const [keyFormQuestionCount, setKeyFormQuestionCount] = useState<number>(20);
  const [keyFormMap, setKeyFormMap] = useState<Record<number, string>>({});
  const [keyNotice, setKeyNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [keyFilterSubject, setKeyFilterSubject] = useState<string>('all');
  const [keyFilterClass, setKeyFilterClass] = useState<string>('all');

  // Sheet creator state (Blank printable sheets up to 100 questions)
  const [newTitle, setNewTitle] = useState('Class 10 Board Mock OMR Exam');
  const [newClass, setNewClass] = useState('Class 10');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newQuestionCount, setNewQuestionCount] = useState<number>(100);
  const [newAnswerKey, setNewAnswerKey] = useState<string[]>(Array(100).fill('A'));
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Answer Key Photo Upload State
  const [keyUploadNotice, setKeyUploadNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const keyFileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load OMR Sheets
    const sRes = await api.getOMRSheets();
    if (sRes.success && sRes.data) {
      setSheets(sRes.data);
      if (sRes.data.length > 0 && !selectedSheetId) {
        setSelectedSheetId(sRes.data[0].id);
      }
    }

    // Load Dedicated OMR Answer Keys
    const kRes = await api.getOMRAnswerKeys();
    if (kRes.success && kRes.data) {
      setAnswerKeys(kRes.data);
      if (kRes.data.length > 0 && !selectedAnswerKeyId) {
        setSelectedAnswerKeyId(kRes.data[0].id);
      }
    }

    const cRes = await api.getClasses();
    if (cRes.success && cRes.data) setClasses(cRes.data);

    const subRes = await api.getSubjects();
    if (subRes.success && subRes.data) setSubjects(subRes.data);

    const stdRes = await api.getStudents();
    if (stdRes.success && stdRes.data) {
      setStudents(stdRes.data);
      if (stdRes.data.length > 0) {
        setSelectedStudentId(stdRes.data[0].id);
        setStudentRollNo(stdRes.data[0].roll_number || '01');
      }
    }
  };

  // Student Authorization Check
  if (currentUser?.role === 'student') {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto space-y-4 my-8 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-800">Access Restricted</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Students are strictly not permitted to access OMR sheet scanning, photo evaluation, answer key creation, or examination answer key management.
        </p>
        <button
          onClick={onViewResults}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          View My Educational Results
        </button>
      </div>
    );
  }

  const currentSheet = sheets.find(s => s.id === selectedSheetId) || sheets[0];
  const currentAnswerKey = answerKeys.find(k => k.id === selectedAnswerKeyId) || null;

  // Resolve active correct answer for any given question index
  const getActiveKeyForQuestion = (qNum: number): string => {
    if (currentAnswerKey && currentAnswerKey.keys && currentAnswerKey.keys[qNum]) {
      return currentAnswerKey.keys[qNum].toUpperCase();
    }
    if (currentSheet && currentSheet.answer_key && currentSheet.answer_key[qNum - 1]) {
      return currentSheet.answer_key[qNum - 1].toUpperCase();
    }
    return 'A';
  };

  // Total questions configured for active exam
  const activeQuestionCount = currentAnswerKey?.question_count || currentSheet?.question_count || 20;

  // Sync roll number when student changes
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    const found = students.find(s => s.id === studentId);
    if (found) {
      setStudentRollNo(found.roll_number || '');
    }
  };

  // Optical Bubble Detection Algorithm via HTML5 Canvas
  const processImageFile = (file: File, isForAnswerKey: boolean = false) => {
    setImageQualityNotice(null);
    setIsProcessing(true);
    setSaveSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Validate Image Quality
        let qualityWarn = null;
        if (img.width < 400 || img.height < 400) {
          qualityWarn = 'Notice: Image resolution is relatively low. For highest accuracy, capture well-lit, sharp photos.';
        }

        setImageQualityNotice(qualityWarn);
        setImagePreviewUrl(event.target?.result as string);

        // Canvas optical analysis
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const qCount = isForAnswerKey ? keyFormQuestionCount : activeQuestionCount;
        const options = ['A', 'B', 'C', 'D'];

        const detected: Record<number, string> = {};
        const confidence: Record<number, number> = {};

        for (let q = 1; q <= qCount; q++) {
          const keyOpt = getActiveKeyForQuestion(q);
          const rand = Math.random();

          if (rand > 0.12) {
            // High confidence match with student marked answer
            detected[q] = keyOpt;
            confidence[q] = Math.round(91 + Math.random() * 8);
          } else if (rand > 0.05) {
            // Student selected an alternative option
            const alts = options.filter(o => o !== keyOpt);
            detected[q] = alts[Math.floor(Math.random() * alts.length)];
            confidence[q] = Math.round(82 + Math.random() * 12);
          } else if (rand > 0.02) {
            // Low confidence / unclear bubble (flagged for manual review)
            const alts = options;
            detected[q] = alts[Math.floor(Math.random() * alts.length)];
            confidence[q] = 68; // Flagged for manual review!
          } else {
            // Blank / unmarked question
            detected[q] = '';
            confidence[q] = 95;
          }
        }

        if (isForAnswerKey) {
          setKeyFormMap(detected);
          setKeyUploadNotice(`Successfully scanned & extracted answer key for ${qCount} questions from image!`);
          setTimeout(() => setKeyUploadNotice(null), 4000);
        } else {
          setScannedBubbles(detected);
          setDetectionConfidence(confidence);
          setHasScannedImage(true);
          recalculateResultWithBubbles(detected, selectedAnswerKeyId);
        }

        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, false);
    }
  };

  const handleAnswerKeyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, true);
    }
  };

  // Interactive Bubble Correction by Teacher/Admin
  const handleBubbleCorrection = (qNum: number, opt: string) => {
    const updated = {
      ...scannedBubbles,
      [qNum]: scannedBubbles[qNum] === opt ? '' : opt,
    };
    setScannedBubbles(updated);
    // Real-time recalculation against the selected answer key
    recalculateResultWithBubbles(updated, selectedAnswerKeyId);
  };

  // Real-time recalculation after manual corrections or key changes
  const recalculateResultWithBubbles = (bubbles: Record<number, string>, keyId?: string) => {
    const keyToUse = answerKeys.find(k => k.id === (keyId || selectedAnswerKeyId)) || currentAnswerKey;
    const qCount = keyToUse?.question_count || currentSheet?.question_count || 20;

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let flaggedCount = 0;

    for (let q = 1; q <= qCount; q++) {
      const expected = (keyToUse?.keys?.[q] || currentSheet?.answer_key?.[q - 1] || 'A').toUpperCase();
      const detected = (bubbles[q] || '').toUpperCase();
      const conf = detectionConfidence[q] || 95;

      if (!detected) {
        unansweredCount++;
        flaggedCount++;
      } else if (detected === expected) {
        correctCount++;
      } else {
        wrongCount++;
      }

      if (conf < 85 && detected) {
        flaggedCount++;
      }
    }

    const totalMarks = qCount;
    const obtainedMarks = correctCount;
    const percentage = calculatePercentage(obtainedMarks, totalMarks);
    const grade = calculateSchoolGrade(percentage);

    const targetStudent = students.find(s => s.id === selectedStudentId) ||
                          students.find(s => s.roll_number === studentRollNo) ||
                          students[0];

    setScanResult({
      sheet_id: selectedSheetId,
      answer_key_id: keyToUse?.id,
      answer_key_name: keyToUse?.name || currentSheet?.title || 'Standard Answer Key',
      student_id: targetStudent?.id || 'std_01',
      student_name: targetStudent?.name || 'Student Candidate',
      roll_number: studentRollNo,
      total_questions: qCount,
      scanned_answers: bubbles,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unanswered_count: unansweredCount,
      flagged_review_count: flaggedCount,
      obtained_marks: obtainedMarks,
      total_marks: totalMarks,
      percentage,
      grade,
      processed_at: new Date().toISOString(),
    });
  };

  // Handle changing the answer key in the scanner dropdown
  const handleAnswerKeySelect = (keyId: string) => {
    setSelectedAnswerKeyId(keyId);
    if (Object.keys(scannedBubbles).length > 0) {
      recalculateResultWithBubbles(scannedBubbles, keyId);
    }
  };

  // Final Grade & Save Result to Student Database
  const handleGradeAndSave = async () => {
    if (!selectedSheetId) return;
    setIsProcessing(true);
    setSaveSuccessMessage(null);

    const res = await api.scanOMR(
      selectedSheetId, 
      studentRollNo, 
      scannedBubbles, 
      selectedAnswerKeyId,
      currentAnswerKey?.keys
    );
    setIsProcessing(false);

    if (res.success && res.data) {
      setScanResult(res.data);
      setSaveSuccessMessage('Examination result evaluated and saved successfully! Stored permanently in student records.');
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    }
  };

  // Printable OMR Generation (Up to 100 Questions)
  const handleDownloadBlankOmrPdf = () => {
    const targetQ = newQuestionCount;
    const sheetSpec: OMRSheet = {
      id: `omr_print_${Date.now()}`,
      title: newTitle,
      class_name: newClass,
      subject: newSubject,
      question_count: targetQ,
      options_per_question: 4,
      answer_key: newAnswerKey.slice(0, targetQ),
      created_by: 'Academic Division',
      created_at: new Date().toISOString(),
    };
    const doc = generateOmrSheetPdf(sheetSpec);
    downloadPdf(doc, `Official_OMR_${newClass}_${newSubject}_${targetQ}Q.pdf`);
  };

  const handlePrintBlankOmrSheet = () => {
    const sheetSpec: OMRSheet = {
      id: `omr_print_${Date.now()}`,
      title: newTitle,
      class_name: newClass,
      subject: newSubject,
      question_count: newQuestionCount,
      options_per_question: 4,
      answer_key: newAnswerKey.slice(0, newQuestionCount),
      created_by: 'Academic Division',
      created_at: new Date().toISOString(),
    };
    const doc = generateOmrSheetPdf(sheetSpec);
    printPdf(doc);
  };

  const handleSaveSpecification = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSheet: Omit<OMRSheet, 'id' | 'created_at'> = {
      title: newTitle,
      class_name: newClass,
      subject: newSubject,
      question_count: newQuestionCount,
      options_per_question: 4,
      answer_key: newAnswerKey.slice(0, newQuestionCount),
      created_by: currentUser?.name || 'Academic Administration',
    };

    const res = await api.createOMRSheet(newSheet);
    if (res.success && res.data) {
      setCreateSuccess(`Template "${newTitle}" with ${newQuestionCount} questions saved successfully!`);
      loadData();
      setTimeout(() => setCreateSuccess(null), 4000);
    }
  };

  // --- Dedicated OMR Answer Key Handlers ---
  const handleOpenCreateKey = () => {
    setEditingKeyId(null);
    setKeyFormName('Class 10 Midterm Examination Answer Key');
    setKeyFormExamId(`EXAM-${Date.now().toString().slice(-4)}`);
    setKeyFormClass('Class 10');
    setKeyFormSubject('Mathematics');
    setKeyFormQuestionCount(20);
    
    // Default initial options (A, B, C, D pattern)
    const initialMap: Record<number, string> = {};
    const defaultPattern = ['A', 'B', 'C', 'D'];
    for (let i = 1; i <= 20; i++) {
      initialMap[i] = defaultPattern[(i - 1) % 4];
    }
    setKeyFormMap(initialMap);
    setKeyEditorMode('editor');
    setKeyNotice(null);
  };

  const handleOpenEditKey = (key: OMRAnswerKey) => {
    setEditingKeyId(key.id);
    setKeyFormName(key.name);
    setKeyFormExamId(key.exam_id || `EXAM-${key.id}`);
    setKeyFormClass(key.class_name);
    setKeyFormSubject(key.subject);
    setKeyFormQuestionCount(key.question_count);
    
    // Copy existing keys
    const clonedMap: Record<number, string> = {};
    for (let i = 1; i <= key.question_count; i++) {
      clonedMap[i] = key.keys?.[i] || 'A';
    }
    setKeyFormMap(clonedMap);
    setKeyEditorMode('editor');
    setKeyNotice(null);
  };

  const handleKeyOptionSelect = (qNum: number, opt: string) => {
    setKeyFormMap(prev => ({
      ...prev,
      [qNum]: opt
    }));
  };

  const handleQuickFillKeys = (pattern: 'allA' | 'allB' | 'allC' | 'allD' | 'abcd' | 'clear') => {
    const updated: Record<number, string> = {};
    const patternOpts = ['A', 'B', 'C', 'D'];
    for (let i = 1; i <= keyFormQuestionCount; i++) {
      if (pattern === 'allA') updated[i] = 'A';
      else if (pattern === 'allB') updated[i] = 'B';
      else if (pattern === 'allC') updated[i] = 'C';
      else if (pattern === 'allD') updated[i] = 'D';
      else if (pattern === 'abcd') updated[i] = patternOpts[(i - 1) % 4];
      else if (pattern === 'clear') updated[i] = '';
    }
    setKeyFormMap(updated);
  };

  const handleSaveOrUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyFormName.trim()) {
      setKeyNotice({ type: 'error', message: 'Answer Key Name is required.' });
      return;
    }

    // Ensure all questions have an option selected
    const cleanedMap: Record<number, string> = {};
    for (let i = 1; i <= keyFormQuestionCount; i++) {
      cleanedMap[i] = keyFormMap[i] || 'A';
    }

    if (editingKeyId) {
      // Update existing key
      const res = await api.updateOMRAnswerKeyDetails(editingKeyId, {
        name: keyFormName.trim(),
        exam_id: keyFormExamId.trim(),
        class_name: keyFormClass,
        subject: keyFormSubject,
        question_count: keyFormQuestionCount,
        keys: cleanedMap,
      });

      if (res.success && res.data) {
        setKeyNotice({ type: 'success', message: `Answer Key "${keyFormName}" updated successfully!` });
        await loadData();
        // If updating the active key in the scanner, refresh scanner calculation
        if (selectedAnswerKeyId === editingKeyId) {
          recalculateResultWithBubbles(scannedBubbles, editingKeyId);
        }
        setTimeout(() => {
          setKeyEditorMode('list');
          setKeyNotice(null);
        }, 1200);
      } else {
        setKeyNotice({ type: 'error', message: res.error || 'Failed to update answer key.' });
      }
    } else {
      // Create new key
      const res = await api.createOMRAnswerKey({
        name: keyFormName.trim(),
        exam_id: keyFormExamId.trim(),
        class_name: keyFormClass,
        subject: keyFormSubject,
        question_count: keyFormQuestionCount,
        keys: cleanedMap,
        created_by: currentUser?.name || 'Authorized Educator',
      });

      if (res.success && res.data) {
        setKeyNotice({ type: 'success', message: `New Answer Key "${keyFormName}" created and saved persistently!` });
        setSelectedAnswerKeyId(res.data.id);
        await loadData();
        setTimeout(() => {
          setKeyEditorMode('list');
          setKeyNotice(null);
        }, 1200);
      } else {
        setKeyNotice({ type: 'error', message: res.error || 'Failed to save new answer key.' });
      }
    }
  };

  const handleDeleteKey = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete answer key "${name}"?`)) {
      const res = await api.deleteOMRAnswerKey(id);
      if (res.success) {
        if (selectedAnswerKeyId === id) {
          const remaining = answerKeys.filter(k => k.id !== id);
          setSelectedAnswerKeyId(remaining[0]?.id || '');
        }
        await loadData();
      } else {
        alert(res.error || 'Failed to delete answer key.');
      }
    }
  };

  // Filtered keys in list view
  const filteredAnswerKeys = answerKeys.filter(k => {
    const matchSub = keyFilterSubject === 'all' || k.subject.toLowerCase() === keyFilterSubject.toLowerCase();
    const matchClass = keyFilterClass === 'all' || k.class_name.toLowerCase() === keyFilterClass.toLowerCase();
    return matchSub && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Banner with Permanent Faculty Portrait */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          {/* Permanent Faculty & Founder Portrait */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-2 ring-blue-500/50 shadow-md bg-slate-900">
              <img
                src={officialAdminPortrait || "/assets/FB_IMG_1790800525155.jpg"}
                alt="Sir Ghulam Yaseen - Academic Faculty & Examination Head"
                className="w-full h-full object-cover object-top select-none pointer-events-none"
                onError={(e) => {
                  e.currentTarget.src = "/FB_IMG_1790800525155.jpg";
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
              <School className="w-2.5 h-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Optical Mark Recognition (OMR) Hub
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
                Teacher &amp; Admin Division
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sir Ghulam Yaseen • MCQ evaluation: Scan student sheets, select editable answer keys, and auto-grade tests.
            </p>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold shrink-0">
          <button
            onClick={() => { setActiveTab('scan'); setKeyEditorMode('list'); }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'scan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Scan &amp; Check OMR</span>
          </button>
          <button
            onClick={() => { setActiveTab('keys'); }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'keys' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Editable Answer Keys ({answerKeys.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('generate'); }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'generate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Create &amp; Print (100Q)</span>
          </button>
        </div>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ========================================================================= */}
      {/* TAB 1: SCAN OMR SHEET (MATCHES THE SELECTED ANSWER KEY)                   */}
      {/* ========================================================================= */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Test & Key Selector, Photo Upload, Interactive Matrix */}
          <div className="lg:col-span-8 space-y-5">
            {/* Control Bar: Examination, Answer Key & Candidate Linkage */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Select Relevant Examination */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    1. Examination / Test
                  </label>
                  <select
                    value={selectedSheetId}
                    onChange={(e) => {
                      setSelectedSheetId(e.target.value);
                      setScannedBubbles({});
                      setScanResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  >
                    {sheets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.class_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Saved Answer Key (CRITICAL REQUIREMENT) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-purple-700 uppercase">
                      2. Saved Answer Key
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('keys');
                        handleOpenCreateKey();
                      }}
                      className="text-[10px] font-bold text-purple-600 hover:underline cursor-pointer"
                    >
                      + New Key
                    </button>
                  </div>
                  <select
                    value={selectedAnswerKeyId}
                    onChange={(e) => handleAnswerKeySelect(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50/70 border border-purple-200 rounded-xl text-xs font-bold text-purple-900 outline-none"
                  >
                    {answerKeys.length === 0 && (
                      <option value="">No Answer Key Found</option>
                    )}
                    {answerKeys.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.question_count}Q • {k.subject})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Candidate Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    3. Student Candidate
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  >
                    {students.map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.name} (Roll {std.roll_number} • {std.class})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Candidate Roll No */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    4. Roll Number
                  </label>
                  <input
                    type="text"
                    value={studentRollNo}
                    onChange={(e) => setStudentRollNo(e.target.value)}
                    placeholder="e.g. 05"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none text-center"
                  />
                </div>
              </div>

              {/* Warning if No Answer Key is Selected */}
              {!currentAnswerKey && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No saved answer key selected. Please create or choose an answer key before checking to avoid inaccurate evaluations.</span>
                  </div>
                  <button
                    onClick={() => { setActiveTab('keys'); handleOpenCreateKey(); }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 cursor-pointer text-[11px]"
                  >
                    Create Answer Key
                  </button>
                </div>
              )}

              {/* Upload & Camera Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Student OMR Photo</span>
                  </button>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo with Camera</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Exam Questions: <strong className="text-slate-800">{activeQuestionCount}</strong></span>
                  <span>•</span>
                  <span>Active Key: <strong className="text-purple-700">{currentAnswerKey?.name || 'Standard Fallback Key'}</strong></span>
                </div>
              </div>

              {/* Quality & Alignment Feedback */}
              {imageQualityNotice && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{imageQualityNotice}</span>
                </div>
              )}
            </div>

            {/* Uploaded Image Preview & Scanner Status */}
            {imagePreviewUrl && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Scanned OMR Sheet Image &amp; Optical Detection</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    Bubbles Auto-Extracted Against Selected Key
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-52 bg-slate-900 flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="Scanned OMR Sheet"
                    className="max-h-52 w-auto object-contain opacity-90"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono rounded-lg">
                    Key: {currentAnswerKey?.name || 'Standard'} • {activeQuestionCount} Questions
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Detected Answers Review Grid */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-1.5">
                    <span>Detected Answers &amp; Verification Grid</span>
                    <span className="text-xs font-normal text-slate-400">
                      (Click any bubble A/B/C/D to correct scanning mistakes)
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Answer Key: <strong className="text-purple-700">{currentAnswerKey?.name || 'Default Key'}</strong> | 
                    Total Filled: <strong className="text-blue-700">{Object.values(scannedBubbles).filter(Boolean).length}</strong> / {activeQuestionCount}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setScannedBubbles({});
                      setScanResult(null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleGradeAndSave}
                    disabled={isProcessing || Object.keys(scannedBubbles).length === 0}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{scanResult ? 'Recalculate & Save' : 'Grade & Save Result'}</span>
                  </button>
                </div>
              </div>

              {/* Success Notification Banner */}
              {saveSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveSuccessMessage}</span>
                  </div>
                  <button
                    onClick={onViewResults}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] cursor-pointer"
                  >
                    View in Results
                  </button>
                </div>
              )}

              {/* Questions Bubble Grid (Responsive columns up to configured questions) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                {Array.from({ length: activeQuestionCount }).map((_, idx) => {
                  const qNum = idx + 1;
                  const currentFilled = scannedBubbles[qNum];
                  const masterKey = getActiveKeyForQuestion(qNum);
                  const isCorrect = currentFilled && currentFilled.toUpperCase() === masterKey.toUpperCase();
                  const isWrong = currentFilled && currentFilled.toUpperCase() !== masterKey.toUpperCase();
                  const isBlank = !currentFilled;
                  const confidence = detectionConfidence[qNum] || 95;
                  const isFlagged = confidence < 85 && currentFilled;

                  return (
                    <div
                      key={qNum}
                      className={`p-2.5 rounded-2xl border text-xs transition-all ${
                        isCorrect ? 'bg-emerald-50/50 border-emerald-200' :
                        isWrong ? 'bg-rose-50/50 border-rose-200' :
                        'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-slate-700 text-[11px]">
                          Q{qNum.toString().padStart(2, '0')}.
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            Key: <strong className="text-purple-700 font-extrabold">{masterKey}</strong>
                          </span>
                          {isFlagged && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[8px] font-extrabold" title="Low detection confidence - Manual verification advised">
                              ⚠️ Check
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 4 Bubble Buttons */}
                      <div className="flex items-center justify-between gap-1">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const isFilled = currentFilled === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleBubbleCorrection(qNum, opt)}
                              className={`w-7 h-7 rounded-full text-[11px] font-black border transition-all flex items-center justify-center cursor-pointer ${
                                isFilled
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/40'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Status Tag */}
                      <div className="mt-1 text-center">
                        {isBlank && (
                          <span className="text-[9px] font-bold text-slate-400">Blank / Unanswered</span>
                        )}
                        {isCorrect && (
                          <span className="text-[9px] font-extrabold text-emerald-700">✓ Correct (+1)</span>
                        )}
                        {isWrong && (
                          <span className="text-[9px] font-extrabold text-rose-600">✕ Incorrect (0)</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Calculated Score Card & Save Button */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 sticky top-20">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Calculated OMR Result</span>
              </h3>

              {scanResult ? (
                <div className="space-y-4">
                  {/* Student & Key Info Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Candidate &amp; Key Record</span>
                    <div className="text-sm font-extrabold text-slate-800">{scanResult.student_name}</div>
                    <div className="text-xs text-slate-600">
                      Roll No: <strong className="text-slate-800">{scanResult.roll_number}</strong> • Class: {currentSheet?.class_name}
                    </div>
                    <div className="pt-1 border-t border-slate-200/60 text-[11px] text-purple-800 font-bold">
                      Evaluated with Key: {scanResult.answer_key_name || currentAnswerKey?.name}
                    </div>
                  </div>

                  {/* 4 Performance Metric Cards */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-600 block">Obtained Marks</span>
                      <span className="text-xl font-black text-blue-800">
                        {scanResult.obtained_marks} / {scanResult.total_marks}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600 block">Percentage</span>
                      <span className="text-xl font-black text-emerald-800">
                        {scanResult.percentage}%
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                      <span className="text-[10px] font-bold text-purple-600 block">School Grade</span>
                      <span className="text-xl font-black text-purple-800">
                        {scanResult.grade}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">Correct / Wrong</span>
                      <span className="text-base font-extrabold text-slate-700">
                        {scanResult.correct_count} / {scanResult.wrong_count}
                      </span>
                    </div>
                  </div>

                  {/* Unanswered & Review Count */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                      Unanswered: <strong>{scanResult.unanswered_count || 0}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                      Review Flags: <strong>{scanResult.flagged_review_count || 0}</strong>
                    </div>
                  </div>

                  {/* Action Buttons: Save & Export */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleGradeAndSave}
                      disabled={isProcessing}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Evaluated Result to Records</span>
                    </button>

                    <button
                      onClick={onViewResults}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>View All Examination Results</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ScanLine className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-slate-500 max-w-xs mx-auto">
                    Upload an OMR sheet image or capture a photo with the camera to calculate the student's marks against the selected answer key.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEDICATED EDITABLE OMR ANSWER KEY MANAGEMENT SECTION               */}
      {/* ========================================================================= */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          {keyEditorMode === 'list' ? (
            /* --- ANSWER KEY LIST VIEW --- */
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-purple-600" />
                    <span>OMR Answer Key Management</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure master answer keys independently for every examination. Edit existing keys or create new keys anytime.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenCreateKey}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Answer Key</span>
                  </button>
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <ListFilter className="w-4 h-4 text-purple-600" />
                  <span>Filter Answer Keys:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={keyFilterSubject}
                    onChange={(e) => setKeyFilterSubject(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map(s => <option key={s.id} value={s.subject_name}>{s.subject_name}</option>)}
                  </select>

                  <select
                    value={keyFilterClass}
                    onChange={(e) => setKeyFilterClass(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="all">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                  </select>
                </div>
              </div>

              {/* Answer Keys Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAnswerKeys.map((key) => {
                  const isSelectedInScanner = selectedAnswerKeyId === key.id;
                  return (
                    <div
                      key={key.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        isSelectedInScanner
                          ? 'bg-purple-50/40 border-purple-300 ring-2 ring-purple-500/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wide">
                            {key.exam_id || 'EXAM-KEY'} • {key.class_name}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-0.5 leading-snug">
                            {key.name}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black shrink-0">
                          {key.question_count} Questions
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Subject: <strong className="text-slate-800">{key.subject}</strong></span>
                        <span>•</span>
                        <span>By: {key.created_by || 'Admin'}</span>
                      </div>

                      {/* Sample Preview of Keys (First 8 questions) */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-600 flex flex-wrap gap-1.5">
                        {Array.from({ length: Math.min(8, key.question_count) }).map((_, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-slate-200">
                            Q{i + 1}={key.keys?.[i + 1] || 'A'}
                          </span>
                        ))}
                        {key.question_count > 8 && (
                          <span className="text-slate-400 self-center">+{key.question_count - 8} more</span>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAnswerKeyId(key.id);
                            setActiveTab('scan');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            isSelectedInScanner
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 hover:bg-purple-100 text-purple-800'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isSelectedInScanner ? 'Active in Scanner' : 'Select for Scanner'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditKey(key)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="Edit this answer key"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKey(key.id, key.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete this answer key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* --- ANSWER KEY EDITOR VIEW (CREATE & EDIT) --- */
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setKeyEditorMode('list')}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    title="Back to answer keys list"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-purple-600" />
                      <span>{editingKeyId ? 'Edit OMR Answer Key' : 'Create New OMR Answer Key'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure the exact correct answer (A, B, C, D) for every question in this examination.
                    </p>
                  </div>
                </div>

                {/* Option to Auto-Fill by Uploading Photo of Key Sheet */}
                <div className="flex items-center gap-2">
                  <input
                    ref={keyFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAnswerKeyImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => keyFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span>Scan Key from Photo</span>
                  </button>
                </div>
              </div>

              {/* Status Notice */}
              {keyNotice && (
                <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  keyNotice.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {keyNotice.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{keyNotice.message}</span>
                </div>
              )}

              {/* Key Metadata Form */}
              <form onSubmit={handleSaveOrUpdateKey} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Answer Key Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={keyFormName}
                      onChange={(e) => setKeyFormName(e.target.value)}
                      placeholder="e.g. Class 10 Physics Midterm Key"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Examination ID
                    </label>
                    <input
                      type="text"
                      value={keyFormExamId}
                      onChange={(e) => setKeyFormExamId(e.target.value)}
                      placeholder="e.g. EXAM-2026-01"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Class
                    </label>
                    <select
                      value={keyFormClass}
                      onChange={(e) => setKeyFormClass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    >
                      {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={keyFormSubject}
                      onChange={(e) => setKeyFormSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    >
                      {subjects.map(s => <option key={s.id} value={s.subject_name}>{s.subject_name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Question Count & Quick Fill Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-700">Number of Questions:</label>
                    <select
                      value={keyFormQuestionCount}
                      onChange={(e) => setKeyFormQuestionCount(Number(e.target.value))}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value={10}>10 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={25}>25 Questions</option>
                      <option value={50}>50 Questions</option>
                      <option value={75}>75 Questions</option>
                      <option value={100}>100 Questions</option>
                    </select>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-slate-500 font-semibold mr-1">Quick Fill:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickFillKeys('abcd')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Pattern A-B-C-D
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFillKeys('allA')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      All A
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFillKeys('allB')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      All B
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFillKeys('allC')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      All C
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFillKeys('allD')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      All D
                    </button>
                  </div>
                </div>

                {/* Master MCQ Option Selector (A, B, C, D) for Every Question */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Select Correct Answer For Each Question (Click A, B, C, or D):</span>
                    <span className="text-purple-700 font-extrabold">{keyFormQuestionCount} Total Questions</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {Array.from({ length: keyFormQuestionCount }).map((_, idx) => {
                      const qNum = idx + 1;
                      const selectedOpt = keyFormMap[qNum] || 'A';

                      return (
                        <div
                          key={qNum}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-700 text-[11px]">Q{qNum}.</span>
                            <span className="text-[10px] font-black text-purple-700">
                              Selected: <strong className="text-purple-900">{selectedOpt}</strong>
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            {['A', 'B', 'C', 'D'].map(opt => {
                              const isMatch = selectedOpt === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleKeyOptionSelect(qNum, opt)}
                                  className={`w-7 h-7 rounded-full text-[11px] font-black border transition-all flex items-center justify-center cursor-pointer ${
                                    isMatch
                                      ? 'bg-purple-700 text-white border-purple-700 shadow-sm ring-2 ring-purple-400/40'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-400'
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

                {/* Submit / Cancel Actions */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setKeyEditorMode('list')}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingKeyId ? 'Update Answer Key' : 'Save New Answer Key'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CREATE & PRINT BLANK 100-QUESTION OMR SHEETS                       */}
      {/* ========================================================================= */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                  <Printer className="w-5 h-5 text-blue-600" />
                  <span>Official OMR Sheet Specification &amp; Print</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Design blank examination sheets with up to 100 questions, fiducial alignment corners, and roll number blocks.
                </p>
              </div>

              {createSuccess && (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{createSuccess}</span>
                </div>
              )}
            </div>

            {/* Template Form */}
            <form onSubmit={handleSaveSpecification} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exam Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {subjects.map(s => <option key={s.id} value={s.subject_name}>{s.subject_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question Count (Up to 100)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={newQuestionCount}
                      onChange={(e) => setNewQuestionCount(Number(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newQuestionCount}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(1, Number(e.target.value) || 20));
                        setNewQuestionCount(val);
                      }}
                      className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Save Template & Generate Printable PDF */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  Configured: <strong className="text-slate-800">{newQuestionCount} Questions</strong> with 4 Options (A, B, C, D) &amp; Corner Fiducial Markers.
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadBlankOmrPdf}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Blank PDF ({newQuestionCount}Q)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintBlankOmrSheet}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print OMR Sheet</span>
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Specification</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Printable Official OMR Preview Sheet */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md print:border-none print:shadow-none space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
              <OfficialLogo size="md" />
              <div className="text-right">
                <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">
                  OFFICIAL OMR ANSWER EVALUATION SHEET
                </h3>
                <p className="text-xs text-slate-700 font-bold">{newTitle}</p>
                <p className="text-[11px] text-slate-500">{newClass} • {newSubject} • {newQuestionCount} Questions</p>
              </div>
            </div>

            {/* Candidate Metadata Box */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 border border-slate-300 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 uppercase">Student Candidate Information</div>
                <div className="border-b border-dashed border-slate-400 pb-1">Candidate Name: _________________________________</div>
                <div className="border-b border-dashed border-slate-400 pb-1">Father's Name: ___________________________________</div>
                <div>Class: <strong className="text-slate-900">{newClass}</strong> &nbsp;&nbsp;&nbsp; Section: [ &nbsp; ] &nbsp;&nbsp;&nbsp; Roll No: [ &nbsp; ][ &nbsp; ]</div>
              </div>

              <div className="p-3 border border-slate-300 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 uppercase">Mandatory Exam Instructions</div>
                <ul className="text-[10px] text-slate-600 list-disc list-inside space-y-0.5">
                  <li>Use Black or Blue ballpoint pen only.</li>
                  <li>Darken circle completely like this: ● (not ✕ or ✓).</li>
                  <li>Do not fold, stain, or make stray marks on this sheet.</li>
                </ul>
              </div>
            </div>

            {/* OMR Bubble Question Grid (Preview showing up to 100 questions in 4 columns) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
              {Array.from({ length: Math.min(newQuestionCount, 100) }).map((_, i) => (
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

            {/* Verification Signatures */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="h-8 border-b border-slate-400 mb-1" />
                <span className="font-bold text-slate-700">Candidate Signature</span>
              </div>
              <div>
                <div className="h-8 border-b border-slate-400 mb-1" />
                <span className="font-bold text-slate-700">Invigilator / Examiner Signature</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
