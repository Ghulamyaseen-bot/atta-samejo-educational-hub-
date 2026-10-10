import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  FileText, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { downloadPdf, printPdf, sharePdf } from '../utils/pdfGenerator';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
  doc?: jsPDF | null;
  pdfDataUrl?: string;
  filename?: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  doc,
  pdfDataUrl,
  filename = 'ATTA_SAMEJO_Document.pdf',
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || (!doc && !pdfDataUrl)) return null;

  const dataUri = pdfDataUrl || (doc ? doc.output('datauristring') : '');

  const handleDownload = () => {
    if (pdfDataUrl) {
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (doc) {
      downloadPdf(doc, filename);
    }
  };

  const handlePrint = () => {
    if (pdfDataUrl) {
      const printWin = window.open(pdfDataUrl);
      if (printWin) {
        printWin.focus();
        printWin.print();
      }
    } else if (doc) {
      printPdf(doc);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    if (doc) {
      await sharePdf(doc, filename, title);
    } else {
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: `Study Material: ${title} from ATTA SAMEJO EDUCATIONAL HUB`,
          });
        } catch {
          // ignore cancelled share
        }
      } else {
        await navigator.clipboard.writeText(`${title} - ATTA SAMEJO EDUCATIONAL HUB\n${window.location.origin}`);
      }
    }
    setIsSharing(false);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[92vh] max-h-[850px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Top Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {category}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">• ATTA SAMEJO EDUCATIONAL HUB</span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 truncate">
                {title}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              title="Print Document"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleShare}
              disabled={isSharing}
              title="Share Document"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-blue-600" />}
              <span className="hidden sm:inline">{isCopied ? 'Shared!' : 'Share'}</span>
            </button>

            <button
              onClick={handleDownload}
              title="Download PDF"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 bg-slate-200 relative overflow-hidden">
          <iframe
            src={dataUri}
            title={title}
            className="w-full h-full border-none"
          />
        </div>

        {/* Bottom Bar Info */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Official Printable PDF Format • A4 Vector Layout</span>
          <span className="font-semibold text-slate-700">Class 1 to 12 Certified Record</span>
        </div>
      </div>
    </div>
  );
};
