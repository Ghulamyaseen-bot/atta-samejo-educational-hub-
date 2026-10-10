import React, { useState, useEffect, useRef } from 'react';
import { 
  BookMarked, 
  Download, 
  FileText, 
  Search, 
  Upload, 
  Trash2, 
  Share2, 
  Eye, 
  Plus, 
  X, 
  CheckCircle2, 
  Filter,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { StudyMaterial, Role } from '../types';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { generateNotesPdf } from '../utils/pdfGenerator';
import jsPDF from 'jspdf';

interface StudyMaterialsViewProps {
  className?: string;
  role?: Role;
}

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({
  className = 'Class 10',
  role = 'student',
}) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>(role === 'student' ? className : 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload modal state (Admin & Teacher only)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadClass, setUploadClass] = useState(className);
  const [uploadSubject, setUploadSubject] = useState('Mathematics');
  const [uploadChapter, setUploadChapter] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('1.5 MB');
  const [uploadedFileData, setUploadedFileData] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF Preview Modal
  const [previewDoc, setPreviewDoc] = useState<jsPDF | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [selectedClass]);

  const loadMaterials = async () => {
    setLoading(true);
    const filterToUse = role === 'student' ? className : (selectedClass === 'all' ? undefined : selectedClass);
    const res = await api.getStudyMaterials(filterToUse);
    if (res.success && res.data) {
      setMaterials(res.data);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Invalid format. Please select a valid PDF file (.pdf).');
      return;
    }

    setUploadError(null);
    setUploadedFileName(file.name);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFileSize(`${sizeMb} MB`);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedFileData(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the selected PDF file.');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Material title is required.');
      return;
    }
    if (!uploadChapter.trim()) {
      setUploadError('Chapter or topic is required.');
      return;
    }

    setUploadError(null);
    const res = await api.addStudyMaterial({
      title: uploadTitle.trim(),
      class_name: uploadClass,
      subject: uploadSubject,
      chapter: uploadChapter.trim(),
      description: uploadDescription.trim() || 'Official curriculum revision notes and chapter materials.',
      file_name: uploadedFileName || `${uploadTitle.replace(/\s+/g, '_')}.pdf`,
      file_size: uploadedFileSize || '1.8 MB',
      file_data: uploadedFileData || undefined,
      uploaded_by: role === 'admin' ? 'Administrator' : 'Teacher',
    });

    if (res.success) {
      setUploadSuccess('Study material PDF uploaded and saved successfully!');
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(null);
        // reset form
        setUploadTitle('');
        setUploadChapter('');
        setUploadDescription('');
        setUploadedFileName('');
        setUploadedFileData(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadMaterials();
      }, 900);
    } else {
      setUploadError(res.error || 'Failed to upload study material.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;
    const res = await api.deleteStudyMaterial(id);
    if (res.success) {
      loadMaterials();
    } else {
      alert(res.error || 'Failed to delete material.');
    }
  };

  const handlePreviewPdf = (mat: StudyMaterial) => {
    setPreviewTitle(mat.title);
    if (mat.file_data) {
      setPreviewPdfUrl(mat.file_data);
      setPreviewDoc(null);
    } else {
      const doc = generateNotesPdf({
        title: mat.title,
        class_name: mat.class_name,
        subject: mat.subject,
        chapter: mat.chapter,
        content: mat.description,
        important_points: [
          `Curriculum Chapter: ${mat.chapter}`,
          `Class Enrolled: ${mat.class_name}`,
          `Subject Category: ${mat.subject}`,
          'Study guidelines aligned with ATTA SAMEJO EDUCATIONAL HUB criteria.',
        ],
        created_at: new Date(mat.uploaded_at).toLocaleDateString(),
      });
      setPreviewDoc(doc);
      setPreviewPdfUrl(null);
    }
    setShowPreviewModal(true);
  };

  const handleDownload = (mat: StudyMaterial) => {
    const filename = mat.file_name || `${mat.title.replace(/\s+/g, '_')}.pdf`;
    if (mat.file_data) {
      const link = document.createElement('a');
      link.href = mat.file_data;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const doc = generateNotesPdf({
        title: mat.title,
        class_name: mat.class_name,
        subject: mat.subject,
        chapter: mat.chapter,
        content: mat.description,
        important_points: [
          `Curriculum Chapter: ${mat.chapter}`,
          `Class Enrolled: ${mat.class_name}`,
          `Subject: ${mat.subject}`,
          'Study guidelines aligned with ATTA SAMEJO EDUCATIONAL HUB criteria.',
        ],
        created_at: new Date(mat.uploaded_at).toLocaleDateString(),
      });
      doc.save(filename);
    }
  };

  const handleShare = async (mat: StudyMaterial) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: mat.title,
          text: `[ATTA SAMEJO EDUCATIONAL HUB] ${mat.title} (${mat.class_name} - ${mat.subject}) - Chapter: ${mat.chapter}`,
          url: window.location.href,
        });
        return;
      } catch {
        // fall back to copy
      }
    }
    try {
      await navigator.clipboard.writeText(
        `[ATTA SAMEJO EDUCATIONAL HUB] Study Material: ${mat.title}\nClass: ${mat.class_name} | Subject: ${mat.subject}\nChapter: ${mat.chapter}\nDescription: ${mat.description}\nAvailable at: ${window.location.origin}`
      );
      setCopiedId(mat.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback
    }
  };

  const filtered = materials.filter(m => {
    const matchClass = role === 'student' 
      ? m.class_name.toLowerCase() === className.toLowerCase()
      : (selectedClass === 'all' || m.class_name.toLowerCase() === selectedClass.toLowerCase());
    const matchSub = selectedSubject === 'all' || m.subject === selectedSubject;
    const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSub && matchSearch;
  });

  const subjectsList = [
    'Mathematics',
    'General Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English Language',
    'Pakistan Studies',
    'Sindhi',
    'Urdu & Literature',
    'Computer Science',
    'Islamiat',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shadow-xs">
              <BookMarked className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              Study Materials &amp; Educational PDFs
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'student'
              ? `Curriculum syllabi, notes, and PDF revisions authorized for your class (${className}).`
              : 'Institutional textbook guides, chapter handouts, and downloadable class materials.'}
          </p>
        </div>

        {/* Upload Button visible ONLY to Admin & Teacher */}
        {role !== 'student' && (
          <button
            onClick={() => {
              setShowUploadModal(true);
              setUploadError(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Study Material PDF</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter (only for teacher/admin; students are locked to their own class) */}
          {role !== 'student' && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-600">Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Classes</option>
                {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-slate-600">Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjectsList.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search material title or chapter..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          Loading authorized study materials...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 text-slate-400 space-y-2">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-slate-700">No Study Materials Found</h4>
          <p className="text-xs">
            {role === 'student'
              ? `There are no PDF notes uploaded for ${className} matching your filters yet.`
              : 'No materials matching your search criteria. Click "Upload Study Material PDF" to add.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {mat.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {mat.class_name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{mat.file_size || '1.8 MB'}</span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                  {mat.title}
                </h3>

                <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Chapter / Unit:</span>
                  <span>{mat.chapter}</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {mat.description}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Added {new Date(mat.uploaded_at).toLocaleDateString()} by {mat.uploaded_by}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center flex-wrap gap-1.5">
                  <button
                    onClick={() => handlePreviewPdf(mat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownload(mat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    title={`Download ${mat.file_name || 'PDF'}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => handleShare(mat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Share study material link or syllabus info"
                  >
                    {copiedId === mat.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Delete button only for Teacher & Admin */}
                {role !== 'student' && (
                  <button
                    onClick={() => handleDelete(mat.id, mat.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Study Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- UPLOAD STUDY MATERIAL MODAL (Admin & Teacher Only) --- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Upload Study Material PDF</h3>
                  <p className="text-[11px] text-slate-400">Class 1–12 educational resource repository</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Mathematics Unit 1: Quadratic Equations Handbook"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={uploadClass}
                    onChange={(e) => setUploadClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:border-blue-600 outline-none cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:border-blue-600 outline-none cursor-pointer"
                  >
                    {subjectsList.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter / Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadChapter}
                  onChange={(e) => setUploadChapter(e.target.value)}
                  placeholder="e.g. Chapter 2: Optical Ray Diagrams"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Study Guidance
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Provide guidance on key formulas, solved questions, or exam tips..."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                />
              </div>

              {/* PDF File Picker */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />

                <FileText className="w-8 h-8 text-blue-600 mb-2" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs cursor-pointer"
                >
                  {uploadedFileName ? 'Change Selected PDF' : 'Select PDF File'}
                </button>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {uploadedFileName ? `${uploadedFileName} (${uploadedFileSize})` : 'Supports educational PDF files up to 25 MB.'}
                </p>
                {uploadedFileName && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName('');
                      setUploadedFileSize('1.5 MB');
                      setUploadedFileData(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-1.5 text-[11px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    Remove Selected File
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-colors"
              >
                Publish Study Material
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewDoc(null);
          setPreviewPdfUrl(null);
        }}
        title={previewTitle}
        category="Study Material Notes"
        doc={previewDoc}
        pdfDataUrl={previewPdfUrl || undefined}
        filename={`${previewTitle.replace(/\s+/g, '_')}.pdf`}
      />
    </div>
  );
};
