import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { 
  FolderArchive, 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  Grid, 
  Award, 
  BookOpen, 
  Plus,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { 
  generateCandidateSlipPdf, 
  generateIndividualResultPdf, 
  generateClassResultSheetPdf, 
  generateOmrSheetPdf, 
  generateTestQuestionPaperPdf, 
  generateNotesPdf,
  downloadPdf,
  printPdf,
  sharePdf
} from '../utils/pdfGenerator';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { Student, TestResult, OMRSheet, Test } from '../types';

export interface DocumentEntry {
  id: string;
  title: string;
  category: 'slips' | 'results' | 'omr' | 'tests' | 'notes';
  categoryLabel: string;
  className: string;
  date: string;
  size: string;
  generateDoc: () => jsPDF;
}

interface PdfLibraryViewProps {
  student?: Student;
  results?: TestResult[];
  onNavigateToCreator?: (type: string) => void;
}

export const PdfLibraryView: React.FC<PdfLibraryViewProps> = ({
  student,
  results = [],
  onNavigateToCreator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Preview State
  const [previewDoc, setPreviewDoc] = useState<jsPDF | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewCategory, setPreviewCategory] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Documents State with instant pre-loaded official records
  const [documents, setDocuments] = useState<DocumentEntry[]>([
    {
      id: 'doc_1',
      title: 'Candidate Roll No Slip - Ghulam Yaseen',
      category: 'slips',
      categoryLabel: 'Student Slip',
      className: 'Class 10',
      date: 'Oct 06, 2026',
      size: '42 KB',
      generateDoc: () => generateCandidateSlipPdf({
        student_name: 'Ghulam Yaseen',
        father_name: 'Muhammad Samejo',
        class_name: 'Class 10',
        roll_number: '05',
        student_id: 'ASEH-2026-005',
        exam_name: 'First Term Academic Assessment 2026',
        exam_date: 'October 15, 2026',
        reporting_time: '08:30 AM',
        venue: 'ATTA SAMEJO EDUCATIONAL HUB, Hall A',
      }),
    },
    {
      id: 'doc_2',
      title: 'Progress Result Card - Mathematics Assessment',
      category: 'results',
      categoryLabel: 'Results',
      className: 'Class 10',
      date: 'Oct 05, 2026',
      size: '58 KB',
      generateDoc: () => generateIndividualResultPdf(
        {
          id: 'res_sample_1',
          student_id: 'std_1',
          student_name: 'Ghulam Yaseen',
          class_name: 'Class 10',
          section: 'A',
          roll_number: '05',
          test_id: 'test_1',
          test_title: 'Mathematics Unit Test (Quadratic Equations)',
          subject: 'Mathematics',
          obtained_marks: 42,
          total_marks: 50,
          percentage: 84.0,
          grade: 'A+',
          answers: [],
          submitted_at: '2026-10-05T09:00:00Z',
          evaluation_status: 'evaluated',
        },
        student || {
          id: 'std_1',
          user_id: 'usr_1',
          student_id: 'ASEH-2026-005',
          name: 'Ghulam Yaseen',
          father_name: 'Muhammad Samejo',
          class: 'Class 10',
          section: 'A',
          roll_number: '05',
          profile_photo: '',
          date_of_birth: '2010-04-14',
          gender: 'Male',
          created_at: '2026-09-01',
        }
      ),
    },
    {
      id: 'doc_3',
      title: 'Class 10 Combined Academic Result Sheet',
      category: 'results',
      categoryLabel: 'Results',
      className: 'Class 10',
      date: 'Oct 04, 2026',
      size: '64 KB',
      generateDoc: () => generateClassResultSheetPdf(
        [
          {
            id: 'r_1',
            student_id: 'ASEH-2026-005',
            student_name: 'Ghulam Yaseen',
            class_name: 'Class 10',
            section: 'A',
            roll_number: '05',
            test_id: 't_1',
            test_title: 'General Assessment',
            subject: 'Mathematics',
            obtained_marks: 42,
            total_marks: 50,
            percentage: 84,
            grade: 'A+',
            answers: [],
            submitted_at: '2026-10-04',
            evaluation_status: 'evaluated',
          },
          {
            id: 'r_2',
            student_id: 'ASEH-2026-006',
            student_name: 'Aisha Khan',
            class_name: 'Class 10',
            section: 'A',
            roll_number: '06',
            test_id: 't_1',
            test_title: 'General Assessment',
            subject: 'Mathematics',
            obtained_marks: 38,
            total_marks: 50,
            percentage: 76,
            grade: 'A',
            answers: [],
            submitted_at: '2026-10-04',
            evaluation_status: 'evaluated',
          },
          {
            id: 'r_3',
            student_id: 'ASEH-2026-007',
            student_name: 'Bilal Ahmed',
            class_name: 'Class 10',
            section: 'A',
            roll_number: '07',
            test_id: 't_1',
            test_title: 'General Assessment',
            subject: 'Mathematics',
            obtained_marks: 35,
            total_marks: 50,
            percentage: 70,
            grade: 'A',
            answers: [],
            submitted_at: '2026-10-04',
            evaluation_status: 'evaluated',
          },
        ],
        'Class 10',
        'Monthly Assessment Oct 2026'
      ),
    },
    {
      id: 'doc_4',
      title: 'Official OMR Evaluation Sheet (50 Questions)',
      category: 'omr',
      categoryLabel: 'OMR Sheet',
      className: 'Class 10',
      date: 'Oct 02, 2026',
      size: '52 KB',
      generateDoc: () => generateOmrSheetPdf({
        id: 'omr_sample_1',
        title: 'Class 10 Mathematics Monthly Assessment OMR',
        class_name: 'Class 10',
        subject: 'Mathematics',
        question_count: 50,
        options_per_question: 4,
        answer_key: Array(50).fill('A'),
        created_at: '2026-10-02',
        created_by: 'Sir Ghulam Yaseen',
      }),
    },
    {
      id: 'doc_5',
      title: 'Class 10 Examination Paper - Quadratic Equations',
      category: 'tests',
      categoryLabel: 'Tests',
      className: 'Class 10',
      date: 'Sep 29, 2026',
      size: '60 KB',
      generateDoc: () => generateTestQuestionPaperPdf(
        {
          id: 't_q_1',
          title: 'Class 10 Mathematics Examination Paper',
          description: 'Standard school assessment paper',
          class_name: 'Class 10',
          subject: 'Mathematics',
          total_marks: 50,
          duration_minutes: 45,
          start_date: '2026-10-01',
          end_date: '2026-10-15',
          created_by: 'Sir Ghulam Yaseen',
          status: 'published',
          test_type: 'mixed',
          instructions: 'Attempt all questions. Calculator is not permitted.',
        },
        [
          {
            id: 'q1',
            class_name: 'Class 10',
            subject: 'Mathematics',
            difficulty: 'medium',
            question_text: 'What is the discriminant of the quadratic equation 2x² - 4x + 3 = 0?',
            question_type: 'mcq',
            marks: 5,
            options: ['-8', '8', '-16', '16'],
            correct_answer: '0',
          },
          {
            id: 'q2',
            class_name: 'Class 10',
            subject: 'Mathematics',
            difficulty: 'medium',
            question_text: 'If the roots of ax² + bx + c = 0 are real and equal, what must be true?',
            question_type: 'mcq',
            marks: 5,
            options: ['b² - 4ac > 0', 'b² - 4ac = 0', 'b² - 4ac < 0', 'b² + 4ac = 0'],
            correct_answer: '1',
          },
          {
            id: 'q3',
            class_name: 'Class 10',
            subject: 'Mathematics',
            difficulty: 'hard',
            question_text: 'Solve by quadratic formula: 3x² - 5x + 2 = 0. Show complete steps and mention both roots.',
            question_type: 'descriptive',
            marks: 10,
            correct_answer: 'x = 1 or x = 2/3',
          },
        ]
      ),
    },
    {
      id: 'doc_6',
      title: 'Study Notes - Quadratic Polynomials Chapter 4',
      category: 'notes',
      categoryLabel: 'Notes',
      className: 'Class 10',
      date: 'Sep 28, 2026',
      size: '48 KB',
      generateDoc: () => generateNotesPdf({
        title: 'Quadratic Polynomials & Equations Notes',
        class_name: 'Class 10',
        subject: 'Mathematics',
        chapter: 'Chapter 4',
        content: `A quadratic equation in variable x is an equation of form ax² + bx + c = 0.
Roots can be found by factorization or the quadratic formula.
Nature of roots is governed by discriminant D = b² - 4ac.`,
        important_points: [
          'Standard form requires a ≠ 0.',
          'Discriminant determines real or complex roots.',
        ],
        formulas: [
          'ax² + bx + c = 0',
          'x = (-b ± √(b² - 4ac)) / (2a)',
        ],
      }),
    },
  ]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this generated document from your library?')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const handlePreview = (docEntry: DocumentEntry) => {
    const doc = docEntry.generateDoc();
    setPreviewDoc(doc);
    setPreviewTitle(docEntry.title);
    setPreviewCategory(docEntry.categoryLabel);
    setPreviewOpen(true);
  };

  const handleDownload = (docEntry: DocumentEntry) => {
    const doc = docEntry.generateDoc();
    downloadPdf(doc, `${docEntry.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrint = (docEntry: DocumentEntry) => {
    const doc = docEntry.generateDoc();
    printPdf(doc);
  };

  const handleShare = async (docEntry: DocumentEntry) => {
    const doc = docEntry.generateDoc();
    await sharePdf(doc, `${docEntry.title.replace(/\s+/g, '_')}.pdf`, docEntry.title);
  };

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'slips', label: 'Student Slips' },
    { id: 'results', label: 'Results' },
    { id: 'omr', label: 'OMR Sheets' },
    { id: 'tests', label: 'Tests' },
    { id: 'notes', label: 'Notes' },
  ];

  const filteredDocs = documents.filter(d => {
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        d.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FolderArchive className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              PDF Documents &amp; Records Library
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse, preview, download, print, and share verified school PDFs across all categories.
          </p>
        </div>

        {/* Quick Generation Shortcuts */}
        {onNavigateToCreator && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateToCreator('candidate-slip')}
              className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 cursor-pointer"
            >
              + Exam Slip
            </button>
            <button
              onClick={() => onNavigateToCreator('create-notes')}
              className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 cursor-pointer"
            >
              + Notes PDF
            </button>
          </div>
        )}
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No documents found in this category.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-xs">{doc.title}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {doc.categoryLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{doc.className}</td>
                    <td className="py-3.5 px-4 text-slate-500">{doc.date}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{doc.size}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handlePreview(doc)}
                          title="Preview PDF"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          title="Download PDF"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(doc)}
                          title="Print PDF"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(doc)}
                          title="Share PDF"
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          title="Delete Document"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        category={previewCategory}
        doc={previewDoc}
        filename={`${previewTitle.replace(/\s+/g, '_')}.pdf`}
      />
    </div>
  );
};
