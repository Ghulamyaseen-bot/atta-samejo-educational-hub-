import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Eye, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';
import { api } from '../api/client';
import { Student } from '../types';
import { generateCandidateSlipPdf, CandidateSlipData } from '../utils/pdfGenerator';
import { PdfPreviewModal } from '../components/PdfPreviewModal';

interface CandidateSlipViewProps {
  currentStudent?: Student | null;
  onBack?: () => void;
}

export const CandidateSlipView: React.FC<CandidateSlipViewProps> = ({
  currentStudent,
  onBack,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudent?.id || 'std_1');

  // Slip form data
  const [studentName, setStudentName] = useState(currentStudent?.name || 'Ghulam Yaseen');
  const [fatherName, setFatherName] = useState(currentStudent?.father_name || 'Muhammad Samejo');
  const [className, setClassName] = useState(currentStudent?.class || 'Class 10');
  const [rollNumber, setRollNumber] = useState(currentStudent?.roll_number || '05');
  const [studentId, setStudentId] = useState(currentStudent?.student_id || 'ASEH-2026-005');
  const [examName, setExamName] = useState('First Term Academic Assessment 2026');
  const [examDate, setExamDate] = useState('October 15, 2026');
  const [reportingTime, setReportingTime] = useState('08:30 AM (Sharp)');
  const [venue, setVenue] = useState('ATTA SAMEJO EDUCATIONAL HUB, Main Hall A');

  // PDF Preview State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<jsPDF | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const res = await api.getStudents();
    if (res.success && res.data) {
      setStudents(res.data);
      if (res.data.length > 0 && !currentStudent) {
        handleSelectStudent(res.data[0]);
      }
    }
  };

  const handleSelectStudent = (s: Student) => {
    setSelectedStudentId(s.id);
    setStudentName(s.name);
    setFatherName(s.father_name);
    setClassName(s.class);
    setRollNumber(s.roll_number);
    setStudentId(s.student_id);
  };

  const handleGeneratePdf = () => {
    const data: CandidateSlipData = {
      student_name: studentName,
      father_name: fatherName,
      class_name: className,
      roll_number: rollNumber,
      student_id: studentId,
      exam_name: examName,
      exam_date: examDate,
      reporting_time: reportingTime,
      venue: venue,
    };

    const doc = generateCandidateSlipPdf(data);
    setGeneratedPdf(doc);
    setPdfModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 mr-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              Candidate Examination Slip Generator
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate official printable Roll No. Admit Slips with institution watermark, candidate data, and instructions.
          </p>
        </div>

        <button
          onClick={handleGeneratePdf}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all"
        >
          <Eye className="w-4 h-4" />
          <span>Preview &amp; Generate PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-800">
              Candidate &amp; Exam Particulars
            </h3>
            {students.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-400">Quick Select:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    const match = students.find(s => s.id === e.target.value);
                    if (match) handleSelectStudent(match);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Father's / Guardian's Name *</label>
              <input
                type="text"
                value={fatherName}
                onChange={e => setFatherName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class *</label>
              <select
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
              <input
                type="text"
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student ID *</label>
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none font-mono text-blue-700"
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Examination Scheduling Details
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exam / Assessment Name *</label>
              <input
                type="text"
                value={examName}
                onChange={e => setExamName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Examination Date</label>
                <input
                  type="text"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  placeholder="e.g. October 15, 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reporting Time</label>
                <input
                  type="text"
                  value={reportingTime}
                  onChange={e => setReportingTime(e.target.value)}
                  placeholder="e.g. 08:30 AM"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exam Venue / Hall Location</label>
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleGeneratePdf}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Official Candidate Slip (PDF)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visual Slip Preview Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Live Slip Layout</span>
              <h3 className="text-sm font-extrabold text-slate-800 mt-0.5">Admit Card Preview Card</h3>
            </div>

            {/* Slip Paper Mockup */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 space-y-3">
              <div className="text-center pb-2 border-b border-blue-200/60">
                <div className="font-extrabold text-xs text-blue-900 uppercase">ATTA SAMEJO EDUCATIONAL HUB</div>
                <div className="text-[10px] text-blue-700 font-semibold">{examName}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">CANDIDATE</span>
                  <span className="font-bold text-slate-800">{studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">FATHER NAME</span>
                  <span className="font-semibold text-slate-700">{fatherName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">CLASS &amp; ROLL NO</span>
                  <span className="font-bold text-blue-600">{className} • Roll {rollNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">STUDENT ID</span>
                  <span className="font-mono text-[11px] font-bold text-slate-700">{studentId}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-blue-200/80 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Date: {examDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Time: {reportingTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">Venue: {venue}</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-400">
                Official Seal &amp; Principal Signature included in generated PDF
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Ready for Exam Day</span>
            <button
              onClick={handleGeneratePdf}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
            >
              Open PDF
            </button>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        title={`Candidate Slip - ${studentName}`}
        category="Exam Admit Slip"
        doc={generatedPdf}
        filename={`${studentName.replace(/\s+/g, '_')}_Exam_Slip.pdf`}
      />
    </div>
  );
};
