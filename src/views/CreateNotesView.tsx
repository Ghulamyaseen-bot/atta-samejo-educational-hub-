import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Eye, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft,
  ListPlus,
  FunctionSquare
} from 'lucide-react';
import { generateNotesPdf, EducationalNoteData } from '../utils/pdfGenerator';
import { PdfPreviewModal } from '../components/PdfPreviewModal';

const SAMPLE_NOTES: EducationalNoteData[] = [
  {
    id: 'note_1',
    title: 'Quadratic Equations & Roots Summary',
    class_name: 'Class 10',
    subject: 'Mathematics',
    chapter: 'Chapter 4: Quadratic Polynomials',
    content: `A quadratic equation in variable x is an equation of the form ax² + bx + c = 0, where a, b, c are real numbers and a ≠ 0.

The roots of the equation can be calculated using factorization, completing the square, or the quadratic formula.

Nature of Roots depends entirely on the Discriminant D = b² - 4ac:
1. If D > 0: Two distinct real roots exist.
2. If D = 0: Two equal real roots exist (repeated root).
3. If D < 0: No real roots exist (complex roots).

Standard Application: In projectile motion and architectural parabolas, quadratic equations determine maximum height and ground impact time.`,
    important_points: [
      'Standard form must always have a ≠ 0.',
      'Discriminant D = b² - 4ac indicates nature of roots.',
      'Sum of roots (α + β) = -b/a, Product of roots (αβ) = c/a.',
    ],
    formulas: [
      'ax² + bx + c = 0',
      'x = (-b ± √(b² - 4ac)) / (2a)',
      'D = b² - 4ac',
    ],
    created_at: '2026-10-05',
  },
  {
    id: 'note_2',
    title: "Newton's Three Laws of Motion",
    class_name: 'Class 9',
    subject: 'Physics',
    chapter: 'Chapter 3: Force & Motion',
    content: `First Law (Law of Inertia): An object remains at rest or in uniform motion unless acted upon by an external net force.

Second Law: The acceleration of an object is directly proportional to the net force applied and inversely proportional to its mass. Force equals mass times acceleration (F = ma).

Third Law: To every action, there is always an equal and opposite reaction. Forces always occur in matched pairs acting on two different bodies.`,
    important_points: [
      'Inertia depends directly on the mass of the object.',
      'Unit of Force is Newton (N), where 1 N = 1 kg·m/s².',
      'Momentum p = m × v is conserved in isolated systems.',
    ],
    formulas: [
      'F = m × a',
      'p = m × v',
      'v = u + at',
      's = ut + ½at²',
    ],
    created_at: '2026-10-06',
  },
];

interface CreateNotesViewProps {
  onBack?: () => void;
}

export const CreateNotesView: React.FC<CreateNotesViewProps> = ({ onBack }) => {
  const [notesList, setNotesList] = useState<EducationalNoteData[]>(SAMPLE_NOTES);
  const [selectedNote, setSelectedNote] = useState<EducationalNoteData | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('');
  const [content, setContent] = useState('');
  
  // Dynamic lists
  const [importantPoints, setImportantPoints] = useState<string[]>(['']);
  const [formulas, setFormulas] = useState<string[]>(['']);

  // PDF Preview State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<jsPDF | null>(null);
  const [pdfDocTitle, setPdfDocTitle] = useState('');

  const handleAddPoint = () => setImportantPoints(prev => [...prev, '']);
  const handleRemovePoint = (idx: number) => setImportantPoints(prev => prev.filter((_, i) => i !== idx));
  const handlePointChange = (idx: number, val: string) => {
    setImportantPoints(prev => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleAddFormula = () => setFormulas(prev => [...prev, '']);
  const handleRemoveFormula = (idx: number) => setFormulas(prev => prev.filter((_, i) => i !== idx));
  const handleFormulaChange = (idx: number, val: string) => {
    setFormulas(prev => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newNote: EducationalNoteData = {
      id: `note_${Date.now()}`,
      title,
      class_name: className,
      subject,
      chapter: chapter || 'General Assessment Chapter',
      content,
      important_points: importantPoints.filter(p => p.trim().length > 0),
      formulas: formulas.filter(f => f.trim().length > 0),
      created_at: new Date().toISOString().split('T')[0],
    };

    setNotesList(prev => [newNote, ...prev]);
    // Reset form
    setTitle('');
    setChapter('');
    setContent('');
    setImportantPoints(['']);
    setFormulas(['']);
    alert('Educational Notes saved successfully to school document library!');
  };

  const handleGeneratePdfForNote = (note: EducationalNoteData) => {
    const doc = generateNotesPdf(note);
    setGeneratedPdf(doc);
    setPdfDocTitle(note.title);
    setPdfModalOpen(true);
  };

  const handleGenerateCurrentPdf = () => {
    const noteData: EducationalNoteData = {
      title: title || 'Educational Chapter Notes',
      class_name: className,
      subject,
      chapter: chapter || 'General Topics',
      content: content || 'No content specified.',
      important_points: importantPoints.filter(p => p.trim().length > 0),
      formulas: formulas.filter(f => f.trim().length > 0),
    };
    const doc = generateNotesPdf(noteData);
    setGeneratedPdf(doc);
    setPdfDocTitle(noteData.title);
    setPdfModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 mr-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              Create &amp; Export Educational Notes
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Author school chapter study notes with formulas, bullet points, and printable PDF export.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateCurrentPdf}
          disabled={!title.trim() && !content.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Notes PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Create Notes */}
        <form onSubmit={handleSaveNote} className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">
            Notes Authoring Form
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Quadratic Equations & Roots Summary"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class (1 to 12)</label>
              <select
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, Science, English"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chapter / Unit</label>
              <input
                type="text"
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                placeholder="e.g. Chapter 4: Polynomials"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Key Points Section */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <ListPlus className="w-3.5 h-3.5" />
                <span>Important Points &amp; Key Definitions</span>
              </span>
              <button
                type="button"
                onClick={handleAddPoint}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Point
              </button>
            </div>

            {importantPoints.map((pt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={pt}
                  onChange={e => handlePointChange(idx, e.target.value)}
                  placeholder="e.g. Standard form must always have a ≠ 0"
                  className="flex-1 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                />
                {importantPoints.length > 1 && (
                  <button type="button" onClick={() => handleRemovePoint(idx)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Formulas Section */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <FunctionSquare className="w-3.5 h-3.5" />
                <span>Core Formulas &amp; Principles</span>
              </span>
              <button
                type="button"
                onClick={handleAddFormula}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Formula
              </button>
            </div>

            {formulas.map((fm, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={fm}
                  onChange={e => handleFormulaChange(idx, e.target.value)}
                  placeholder="e.g. x = (-b ± √(b² - 4ac)) / (2a)"
                  className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-mono"
                />
                {formulas.length > 1 && (
                  <button type="button" onClick={() => handleRemoveFormula(idx)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Detailed Content Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Content &amp; Explanation *</label>
            <textarea
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write comprehensive explanations, examples, theorems, and chapter notes here..."
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-600 outline-none leading-relaxed"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Save Note to Hub
            </button>
            <button
              type="button"
              onClick={handleGenerateCurrentPdf}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Preview &amp; Export PDF
            </button>
          </div>
        </form>

        {/* Right Column: Saved Notes Library */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">
              Saved Study Notes Library ({notesList.length})
            </h3>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {notesList.map(note => (
                <div key={note.id} className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/60 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {note.class_name} • {note.subject}
                      </span>
                      <h4 className="font-extrabold text-xs text-slate-800 mt-1.5 leading-snug">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {note.chapter}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {note.formulas?.length || 0} formulas • {note.important_points?.length || 0} key points
                    </span>
                    <button
                      onClick={() => handleGeneratePdfForNote(note)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Export PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        title={pdfDocTitle}
        category="Educational Study Notes"
        doc={generatedPdf}
        filename={`${pdfDocTitle.replace(/\s+/g, '_')}_Notes.pdf`}
      />
    </div>
  );
};
