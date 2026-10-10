/**
 * ATTA SAMEJO EDUCATIONAL HUB
 * Professional PDF Generation Engine (Client-Side Vector PDF)
 * Strictly Class 1 to Class 12 - NO GPA / CGPA
 */

import jsPDF from 'jspdf';
import { Student, TestResult, OMRSheet, Test, Question } from '../types';

export interface CandidateSlipData {
  student_name: string;
  father_name: string;
  class_name: string;
  roll_number: string;
  student_id: string;
  exam_name: string;
  exam_date: string;
  reporting_time?: string;
  venue?: string;
  profile_photo?: string;
}

export interface EducationalNoteData {
  id?: string;
  title: string;
  class_name: string;
  subject: string;
  chapter: string;
  content: string;
  headings?: string[];
  important_points?: string[];
  formulas?: string[];
  created_at?: string;
}

// Brand Colors
const NAVY_COLOR: [number, number, number] = [17, 24, 39]; // #111827
const BLUE_COLOR: [number, number, number] = [26, 86, 219]; // #1a56db
const DARK_GRAY: [number, number, number] = [55, 65, 81];
const LIGHT_BG: [number, number, number] = [243, 244, 246];
const BORDER_COLOR: [number, number, number] = [209, 213, 219];

/**
 * Common PDF Header with ATTA SAMEJO EDUCATIONAL HUB branding
 */
function drawSchoolHeader(doc: jsPDF, documentTypeTitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top decorative bar
  doc.setFillColor(...BLUE_COLOR);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // School Emblem / Diamond
  doc.setFillColor(...BLUE_COLOR);
  doc.roundedRect(14, 10, 14, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AS', 18.5, 19.5);

  // School Title
  doc.setTextColor(...NAVY_COLOR);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTA SAMEJO EDUCATIONAL HUB', 32, 16);

  // School Subtitle
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('School Academic Assessment & Student Management System (Class 1 to 12)', 32, 21);

  // Right Side: Document Type Badge
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(pageWidth - 68, 10, 54, 14, 2, 2, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(pageWidth - 68, 10, 54, 14, 2, 2, 'S');

  doc.setTextColor(...BLUE_COLOR);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(documentTypeTitle.toUpperCase(), pageWidth - 41, 18.5, { align: 'center' });

  // Divider Line
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.5);
  doc.line(14, 28, pageWidth - 14, 28);
}

/**
 * Common Footer with Page Numbers & Timestamp
 */
function drawSchoolFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text('ATTA SAMEJO EDUCATIONAL HUB • Official Assessment Document • System Generated', 14, pageHeight - 7);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
}

// ============================================================================
// 1. STUDENT / CANDIDATE SLIP PDF
// ============================================================================
export function generateCandidateSlipPdf(data: CandidateSlipData): jsPDF {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  drawSchoolHeader(doc, 'Candidate Exam Slip');

  // Examination Title Banner
  doc.setFillColor(239, 246, 255); // light blue
  doc.roundedRect(14, 33, pageWidth - 28, 14, 2, 2, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(14, 33, pageWidth - 28, 14, 2, 2, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE_COLOR);
  doc.text(data.exam_name || 'Official Monthly Assessment Examination', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Session 2026 • Verified Candidate Roll No. Slip`, pageWidth / 2, 44.5, { align: 'center' });

  // Candidate Details Section Box
  const startY = 53;
  const colWidth = (pageWidth - 28) / 2;

  doc.setDrawColor(...BORDER_COLOR);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, startY, pageWidth - 28, 85, 2, 2, 'F');
  doc.roundedRect(14, startY, pageWidth - 28, 85, 2, 2, 'S');

  // Photo box area (top right of details)
  const photoX = pageWidth - 48;
  const photoY = startY + 6;
  doc.setFillColor(...LIGHT_BG);
  doc.rect(photoX, photoY, 30, 36, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.rect(photoX, photoY, 30, 36, 'S');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Candidate Photo', photoX + 15, photoY + 16, { align: 'center' });
  doc.text('(Official Seal)', photoX + 15, photoY + 22, { align: 'center' });

  // Fields table
  const fields = [
    { label: 'Candidate Full Name', value: data.student_name },
    { label: "Father's / Guardian's Name", value: data.father_name },
    { label: 'Student ID / Registration No.', value: data.student_id },
    { label: 'Enrolled Class & Section', value: `${data.class_name}` },
    { label: 'Assigned Roll Number', value: data.roll_number },
    { label: 'Scheduled Exam Date', value: data.exam_date || 'October 15, 2026' },
    { label: 'Reporting & Entry Time', value: data.reporting_time || '08:30 AM (Sharp)' },
    { label: 'Examination Center / Hall', value: data.venue || 'ATTA SAMEJO EDUCATIONAL HUB, Main Hall A' },
  ];

  let currentFieldY = startY + 10;
  fields.forEach((f, i) => {
    // Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(f.label.toUpperCase(), 20, currentFieldY);

    // Value
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY_COLOR);
    doc.text(f.value || '—', 82, currentFieldY);

    // Dotted separator line
    doc.setDrawColor(241, 245, 249);
    doc.line(20, currentFieldY + 2.5, photoX - 5, currentFieldY + 2.5);

    currentFieldY += 9;
  });

  // Important Exam Instructions Box
  const instY = 145;
  doc.setFillColor(254, 252, 232); // light yellow
  doc.roundedRect(14, instY, pageWidth - 28, 55, 2, 2, 'F');
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(14, instY, pageWidth - 28, 55, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(161, 98, 7);
  doc.text('MANDATORY EXAMINATION INSTRUCTIONS', 20, instY + 7);

  const instructions = [
    '1. The candidate MUST bring this printed slip to the examination room along with their school identity badge.',
    '2. Candidates arriving 15 minutes after the scheduled start time will not be permitted into the exam hall.',
    '3. For OMR Answer Sheets: Use only Black or Dark Blue ballpoint pens. Pencils and gel pens are strictly disallowed.',
    '4. Electronic devices, smartwatches, and programmable calculators are strictly prohibited in the exam hall.',
    '5. Any form of unfair means or communication during the exam will result in immediate disqualification.',
  ];

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(68, 64, 60);
  let lineY = instY + 14;
  instructions.forEach(ins => {
    doc.text(ins, 20, lineY);
    lineY += 7.5;
  });

  // Verification Signatures Area
  const sigY = 215;
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.4);

  // Student Sign
  doc.line(25, sigY + 20, 75, sigY + 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY_COLOR);
  doc.text('Candidate Signature', 50, sigY + 25, { align: 'center' });

  // Invigilator Sign
  doc.line(85, sigY + 20, 135, sigY + 20);
  doc.text('Hall Invigilator Signature', 110, sigY + 25, { align: 'center' });

  // Controller of Examinations Stamp
  doc.line(145, sigY + 20, pageWidth - 25, sigY + 20);
  doc.text('Controller of Examinations', (145 + pageWidth - 25) / 2, sigY + 25, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ATTA SAMEJO EDUCATIONAL HUB', (145 + pageWidth - 25) / 2, sigY + 29, { align: 'center' });

  drawSchoolFooter(doc, 1, 1);
  return doc;
}

// ============================================================================
// 2. RESULTS PDF (Individual & Class Result Sheet)
// ============================================================================
export function generateIndividualResultPdf(result: TestResult, student: Student, classRank?: string): jsPDF {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  drawSchoolHeader(doc, 'Official Academic Result');

  // Student & Test Overview Header
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(14, 33, pageWidth - 28, 28, 2, 2, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(14, 33, pageWidth - 28, 28, 2, 2, 'S');

  // Student Info Left
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT NAME:', 20, 41);
  doc.setTextColor(...NAVY_COLOR);
  doc.text(student.name, 50, 41);

  doc.setTextColor(100, 116, 139);
  doc.text("FATHER'S NAME:", 20, 48);
  doc.setTextColor(...NAVY_COLOR);
  doc.text(student.father_name || 'Muhammad Samejo', 50, 48);

  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT ID:', 20, 55);
  doc.setTextColor(...BLUE_COLOR);
  doc.text(student.student_id, 50, 55);

  // Student Info Right
  doc.setTextColor(100, 116, 139);
  doc.text('CLASS / SECTION:', 110, 41);
  doc.setTextColor(...NAVY_COLOR);
  doc.text(`${student.class} (Section ${student.section})`, 145, 41);

  doc.setTextColor(100, 116, 139);
  doc.text('ROLL NUMBER:', 110, 48);
  doc.setTextColor(...NAVY_COLOR);
  doc.text(student.roll_number, 145, 48);

  doc.setTextColor(100, 116, 139);
  doc.text('ASSESSMENT DATE:', 110, 55);
  doc.setTextColor(...NAVY_COLOR);
  doc.text(result.submitted_at ? new Date(result.submitted_at).toLocaleDateString() : 'October 2026', 145, 55);

  // Big Score Card Summary
  const isPass = result.percentage >= 40;
  doc.setFillColor(isPass ? 240 : 254, isPass ? 253 : 242, isPass ? 244 : 242);
  doc.roundedRect(14, 67, pageWidth - 28, 30, 3, 3, 'F');
  doc.setDrawColor(isPass ? 187 : 254, isPass ? 247 : 202, isPass ? 208 : 202);
  doc.roundedRect(14, 67, pageWidth - 28, 30, 3, 3, 'S');

  // Obtained / Total Marks
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('OBTAINED MARKS', 35, 76, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(...NAVY_COLOR);
  doc.text(`${result.obtained_marks} / ${result.total_marks}`, 35, 87, { align: 'center' });

  // Percentage %
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('PERCENTAGE', 85, 76, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(...BLUE_COLOR);
  doc.text(`${result.percentage.toFixed(1)}%`, 85, 87, { align: 'center' });

  // School Grade
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SCHOOL GRADE', 135, 76, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(isPass ? 22 : 220, isPass ? 101 : 38, isPass ? 52 : 38);
  doc.text(result.grade, 135, 87, { align: 'center' });

  // Pass / Fail Status
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('FINAL STATUS', 175, 76, { align: 'center' });
  doc.setFontSize(14);
  doc.text(isPass ? 'PASSED' : 'RE-APPEAR', 175, 87, { align: 'center' });

  // Detailed Assessment Breakdown Table
  const tableY = 106;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY_COLOR);
  doc.text('Subject Assessment Particulars', 14, tableY);

  // Table Header
  const thY = tableY + 4;
  doc.setFillColor(...NAVY_COLOR);
  doc.rect(14, thY, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Assessment Title', 18, thY + 5.5);
  doc.text('Subject', 85, thY + 5.5);
  doc.text('Max Marks', 125, thY + 5.5);
  doc.text('Marks Obtained', 150, thY + 5.5);
  doc.text('Grade', 185, thY + 5.5);

  // Table Row
  const rowY = thY + 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, rowY, pageWidth - 28, 10, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.rect(14, rowY, pageWidth - 28, 10, 'S');

  doc.setTextColor(...NAVY_COLOR);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(result.test_title, 18, rowY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(result.subject, 85, rowY + 6.5);
  doc.text(result.total_marks.toString(), 125, rowY + 6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(result.obtained_marks.toString(), 150, rowY + 6.5);
  doc.text(result.grade, 185, rowY + 6.5);

  // Grading Standard Legend Table (Class 1-12 Official Scale)
  const legendY = 135;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY_COLOR);
  doc.text('Official Class 1–12 School Grading Scale', 14, legendY);

  const scaleY = legendY + 4;
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, scaleY, pageWidth - 28, 16, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.rect(14, scaleY, pageWidth - 28, 16, 'S');

  const scales = [
    { grade: 'A+', range: '80% & Above', label: 'Outstanding' },
    { grade: 'A', range: '70% – 79.9%', label: 'Excellent' },
    { grade: 'B', range: '60% – 69.9%', label: 'Good' },
    { grade: 'C', range: '50% – 59.9%', label: 'Satisfactory' },
    { grade: 'D', range: '40% – 49.9%', label: 'Pass' },
    { grade: 'F', range: 'Below 40%', label: 'Needs Improvement' },
  ];

  const colStep = (pageWidth - 28) / 6;
  scales.forEach((s, idx) => {
    const cx = 14 + idx * colStep + colStep / 2;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE_COLOR);
    doc.text(s.grade, cx, scaleY + 5.5, { align: 'center' });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(s.range, cx, scaleY + 10, { align: 'center' });
    doc.text(s.label, cx, scaleY + 13.5, { align: 'center' });
  });

  // Remarks & Signatures
  const bottomY = 195;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY_COLOR);
  doc.text('Academic Assessment Remarks:', 14, bottomY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    isPass 
      ? 'Commendable academic effort demonstrated. Consistently maintain regular attendance and test participation.' 
      : 'Targeted academic remedial coaching recommended. Please attend subject support workshops.',
    14,
    bottomY + 6
  );

  // Signatures
  const signY = 240;
  doc.setDrawColor(...BORDER_COLOR);
  doc.line(20, signY, 70, signY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY_COLOR);
  doc.text('Subject Specialist / Teacher', 45, signY + 5, { align: 'center' });

  doc.line(pageWidth - 70, signY, pageWidth - 20, signY);
  doc.text('Principal / Headmaster Stamp', pageWidth - 45, signY + 5, { align: 'center' });

  drawSchoolFooter(doc, 1, 1);
  return doc;
}

export function generateClassResultSheetPdf(results: TestResult[], className: string, examName: string): jsPDF {
  const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' }); // Landscape
  const pageWidth = doc.internal.pageSize.getWidth();

  drawSchoolHeader(doc, 'Class Result Sheet');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE_COLOR);
  doc.text(`Class: ${className} • Exam: ${examName}`, 14, 34);

  // Table Header
  const thY = 40;
  doc.setFillColor(...NAVY_COLOR);
  doc.rect(14, thY, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('S.No', 18, thY + 5.5);
  doc.text('Roll No', 32, thY + 5.5);
  doc.text('Student ID', 55, thY + 5.5);
  doc.text('Candidate Name', 90, thY + 5.5);
  doc.text('Subject', 150, thY + 5.5);
  doc.text('Total Marks', 190, thY + 5.5);
  doc.text('Obtained', 215, thY + 5.5);
  doc.text('Percentage', 240, thY + 5.5);
  doc.text('Grade', 265, thY + 5.5);

  let curY = thY + 8;
  results.forEach((r, i) => {
    doc.setFillColor(i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 251);
    doc.rect(14, curY, pageWidth - 28, 7, 'F');
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(14, curY + 7, pageWidth - 14, curY + 7);

    doc.setTextColor(...NAVY_COLOR);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text((i + 1).toString(), 18, curY + 5);
    doc.text(r.roll_number || '—', 32, curY + 5);
    doc.text(r.student_id || '—', 55, curY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(r.student_name, 90, curY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(r.subject, 150, curY + 5);
    doc.text(r.total_marks.toString(), 190, curY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(r.obtained_marks.toString(), 215, curY + 5);
    doc.text(`${r.percentage.toFixed(1)}%`, 240, curY + 5);
    doc.text(r.grade, 265, curY + 5);

    curY += 7;
  });

  drawSchoolFooter(doc, 1, 1);
  return doc;
}

// ============================================================================
// 3. OMR SHEET GENERATOR PDF
// ============================================================================
export function generateOmrSheetPdf(sheet: OMRSheet): jsPDF {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Corner Fiducial Markers for Optical/Camera Scanner Recognition
  doc.setFillColor(0, 0, 0);
  doc.rect(6, 6, 6, 6, 'F');
  doc.rect(pageWidth - 12, 6, 6, 6, 'F');
  doc.rect(6, 285, 6, 6, 'F');
  doc.rect(pageWidth - 12, 285, 6, 6, 'F');

  // Title Block
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTA SAMEJO EDUCATIONAL HUB', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(9);
  doc.text('OFFICIAL OMR ANSWER EVALUATION SHEET', pageWidth / 2, 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${sheet.title} • ${sheet.class_name} • ${sheet.subject}`, pageWidth / 2, 24, { align: 'center' });

  // Top Student Identification Grid
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(14, 28, pageWidth - 28, 22, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT FULL NAME:', 18, 34);
  doc.line(55, 34, 115, 34);

  doc.text('FATHER NAME:', 18, 41);
  doc.line(55, 41, 115, 41);

  doc.text('CLASS / SECTION:', 18, 47);
  doc.line(55, 47, 115, 47);

  // Roll Number Grid on Right
  doc.text('ROLL NO (2 DIGITS):', 125, 34);
  doc.rect(160, 30, 8, 8, 'S');
  doc.rect(170, 30, 8, 8, 'S');

  doc.text('EXAM DATE:', 125, 44);
  doc.line(148, 44, 185, 44);

  // Instructions Bar
  doc.setFillColor(240, 240, 240);
  doc.rect(14, 53, pageWidth - 28, 8, 'F');
  doc.rect(14, 53, pageWidth - 28, 8, 'S');
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTRUCTIONS: Fill circle completely like [●]. Use Black/Blue pen only. Do not fold or make stray marks.', pageWidth / 2, 58, { align: 'center' });

  // OMR Bubble Columns
  // 4 columns of questions (e.g. up to 100 questions, or 20/50 questions)
  const questionCount = sheet.question_count || 20;
  const numColumns = questionCount <= 20 ? 2 : 4;
  const qPerCol = Math.ceil(questionCount / numColumns);
  const colWidth = (pageWidth - 32) / numColumns;
  const options = ['A', 'B', 'C', 'D'];

  const startBubbleY = 66;

  for (let q = 1; q <= questionCount; q++) {
    const colIndex = Math.floor((q - 1) / qPerCol);
    const rowIndex = (q - 1) % qPerCol;

    const qX = 16 + colIndex * colWidth;
    const qY = startBubbleY + rowIndex * 9.5;

    // Question number box
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(q.toString().padStart(2, '0'), qX, qY + 2.5);

    // 4 Options Bubbles
    options.forEach((opt, optIdx) => {
      const bubbleX = qX + 11 + optIdx * 8.5;
      const bubbleY = qY + 1.5;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.circle(bubbleX, bubbleY, 3, 'S');

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text(opt, bubbleX, bubbleY + 1.8, { align: 'center' });
    });
  }

  // Bottom Signature & Verification
  const bottomY = 275;
  doc.setDrawColor(0, 0, 0);
  doc.line(25, bottomY, 75, bottomY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate Signature', 50, bottomY + 4, { align: 'center' });

  doc.line(pageWidth - 75, bottomY, pageWidth - 25, bottomY);
  doc.text('Invigilator / Examiner Signature', pageWidth - 50, bottomY + 4, { align: 'center' });

  return doc;
}

// ============================================================================
// 4. TEST QUESTION PAPER PDF
// ============================================================================
export function generateTestQuestionPaperPdf(test: Test, questions: Question[] = []): jsPDF {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  drawSchoolHeader(doc, 'Examination Question Paper');

  // Examination Metadata Card
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(14, 32, pageWidth - 28, 20, 2, 2, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(14, 32, pageWidth - 28, 20, 2, 2, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY_COLOR);
  doc.text(test.title, 18, 39);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Class: ${test.class_name} • Subject: ${test.subject} • Time Allowed: ${test.duration_minutes || 30} Minutes • Total Marks: ${test.total_marks || 50}`, 18, 46);

  // Student details blank fill-in box
  doc.setDrawColor(...BORDER_COLOR);
  doc.setFillColor(255, 255, 255);
  doc.rect(14, 55, pageWidth - 28, 11, 'S');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY_COLOR);
  doc.text('STUDENT NAME: ___________________________', 18, 62);
  doc.text('ROLL NO: ___________', 105, 62);
  doc.text('DATE: ____________', 150, 62);

  // General Instructions
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(test.instructions || 'Attempt all questions. Choose the most appropriate option for multiple-choice questions.', 14, 71);

  // Questions List
  let curY = 78;
  const questionsToRender = questions.length > 0 ? questions : (test.questions || []);

  questionsToRender.forEach((q, idx) => {
    // Check if new page is needed
    if (curY > 260) {
      doc.addPage();
      drawSchoolHeader(doc, 'Question Paper (Cont.)');
      curY = 36;
    }

    // Question Number & Text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY_COLOR);
    doc.text(`Q${idx + 1}.`, 14, curY);

    const questionLines = doc.splitTextToSize(q.question_text, pageWidth - 42);
    doc.setFont('helvetica', 'normal');
    doc.text(questionLines, 24, curY);

    // Marks badge on right
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE_COLOR);
    doc.text(`[${q.marks} Marks]`, pageWidth - 14, curY, { align: 'right' });

    curY += questionLines.length * 5 + 2;

    // If MCQ options exist
    if (q.options && q.options.length === 4) {
      const optLabels = ['(A)', '(B)', '(C)', '(D)'];
      const optWidth = (pageWidth - 30) / 2;

      for (let o = 0; o < 4; o++) {
        const col = o % 2;
        const row = Math.floor(o / 2);
        const optX = 24 + col * optWidth;
        const optY = curY + row * 6;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text(optLabels[o], optX, optY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...NAVY_COLOR);
        doc.text(q.options[o] || '—', optX + 8, optY);
      }
      curY += 15;
    } else {
      // Descriptive question answer space lines
      doc.setDrawColor(226, 232, 240);
      doc.line(24, curY + 6, pageWidth - 14, curY + 6);
      doc.line(24, curY + 12, pageWidth - 14, curY + 12);
      curY += 16;
    }

    curY += 3;
  });

  drawSchoolFooter(doc, 1, 1);
  return doc;
}

// ============================================================================
// 5. EDUCATIONAL NOTES PDF
// ============================================================================
export function generateNotesPdf(note: EducationalNoteData): jsPDF {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  drawSchoolHeader(doc, 'Educational Study Notes');

  // Notes Title Banner
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(14, 32, pageWidth - 28, 20, 2, 2, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(14, 32, pageWidth - 28, 20, 2, 2, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY_COLOR);
  doc.text(note.title, 18, 40);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLUE_COLOR);
  doc.text(`Class: ${note.class_name} • Subject: ${note.subject} • Chapter: ${note.chapter}`, 18, 47);

  let curY = 58;

  // Important Points Callout (if any)
  if (note.important_points && note.important_points.length > 0) {
    doc.setFillColor(254, 252, 232);
    doc.roundedRect(14, curY, pageWidth - 28, 8 + note.important_points.length * 6.5, 2, 2, 'F');
    doc.setDrawColor(254, 240, 138);
    doc.roundedRect(14, curY, pageWidth - 28, 8 + note.important_points.length * 6.5, 2, 2, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(161, 98, 7);
    doc.text('KEY DEFINITIONS & CRITICAL EXAM POINTS:', 18, curY + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(87, 83, 78);
    note.important_points.forEach((pt, pIdx) => {
      doc.text(`• ${pt}`, 20, curY + 12 + pIdx * 6.5);
    });

    curY += 14 + note.important_points.length * 6.5;
  }

  // Formulas / Rules (if any)
  if (note.formulas && note.formulas.length > 0) {
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(14, curY, pageWidth - 28, 8 + note.formulas.length * 6.5, 2, 2, 'F');
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(14, curY, pageWidth - 28, 8 + note.formulas.length * 6.5, 2, 2, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 105, 161);
    doc.text('FORMULAS & CORE PRINCIPLES:', 18, curY + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 58, 138);
    note.formulas.forEach((fm, fIdx) => {
      doc.text(`√ ${fm}`, 20, curY + 12 + fIdx * 6.5);
    });

    curY += 14 + note.formulas.length * 6.5;
  }

  // Body Content (supports multiple paragraphs)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY_COLOR);
  doc.text('Detailed Notes & Concepts:', 14, curY);
  curY += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const paragraphs = note.content.split('\n');
  paragraphs.forEach(para => {
    if (!para.trim()) {
      curY += 4;
      return;
    }
    const splitLines = doc.splitTextToSize(para, pageWidth - 28);
    if (curY + splitLines.length * 5 > 265) {
      doc.addPage();
      drawSchoolHeader(doc, 'Study Notes (Cont.)');
      curY = 36;
    }
    doc.text(splitLines, 14, curY);
    curY += splitLines.length * 5 + 3;
  });

  drawSchoolFooter(doc, 1, 1);
  return doc;
}

// ============================================================================
// PDF ACTIONS: Download, Preview, Print, Share
// ============================================================================

export function downloadPdf(doc: jsPDF, filename: string) {
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(safeName);
}

export function getPdfPreviewDataUri(doc: jsPDF): string {
  return doc.output('datauristring');
}

export function printPdf(doc: jsPDF) {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  } else {
    // Fallback direct download
    doc.save('document.pdf');
  }
}

export async function sharePdf(doc: jsPDF, filename: string, title: string = 'School Document'): Promise<boolean> {
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = doc.output('blob');

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    const file = new File([blob], safeName, { type: 'application/pdf' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `ATTA SAMEJO EDUCATIONAL HUB - ${title}`,
          text: `Official Document from ATTA SAMEJO EDUCATIONAL HUB.`,
          files: [file],
        });
        return true;
      } catch (e) {
        console.warn('Share dismissed or cancelled', e);
      }
    }
  }

  // Fallback download if Web Share API not supported on desktop
  downloadPdf(doc, safeName);
  return true;
}
