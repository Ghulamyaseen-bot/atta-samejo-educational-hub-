/**
 * ATTA SAMEJO EDUCATIONAL HUB
 * School Types (Classes 1 - 12 only)
 * Strictly NO GPA / CGPA - School Marks, Percentage & Grade only.
 */

export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  avatar?: string;
  password_hash: string;
  phone?: string;
  must_change_password?: boolean;
  status?: 'active' | 'deactivated';
  created_at: string;
}

export interface PasswordRecoveryTicket {
  id: string;
  user_id: string;
  username: string;
  role: Role;
  student_name?: string;
  class_name?: string;
  phone?: string;
  masked_phone?: string;
  status: 'pending' | 'resolved';
  requested_at: string;
  reset_pin?: string;
  otp_code?: string;
  otp_expires_at?: string;
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  name: string;
  father_name: string;
  class: string; // e.g. "Class 10" (Class 1 to 12 only)
  section: string; // e.g. "A"
  roll_number: string;
  profile_photo: string;
  date_of_birth: string;
  phone?: string;
  gender: 'Male' | 'Female' | 'Other';
  created_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  teacher_id: string;
  name: string;
  subjects: string[];
  classes: string[];
  profile_photo: string;
  phone?: string;
  qualification?: string;
  created_at: string;
}

export interface SchoolClass {
  id: string;
  class_name: string; // "Class 1" through "Class 12"
  sections: string[];
  display_order: number;
}

export interface Subject {
  id: string;
  subject_name: string;
  class_name: string;
  code?: string;
}

export type QuestionType = 'mcq' | 'descriptive';

export interface Question {
  id: string;
  test_id?: string;
  class_name: string;
  subject: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  question_type: QuestionType;
  marks: number;
  options?: string[]; // 4 options for MCQ [A, B, C, D]
  correct_answer: string; // '0', '1', '2', '3' for MCQ index or key points for descriptive
  explanation?: string;
}

export type TestType = 'mcq' | 'descriptive' | 'mixed';
export type TestStatus = 'draft' | 'published' | 'completed' | 'archived';

export interface Test {
  id: string;
  title: string;
  description: string;
  class_name: string;
  subject: string;
  total_marks: number;
  duration_minutes: number;
  start_date: string;
  end_date: string;
  created_by: string;
  status: TestStatus;
  test_type: TestType;
  instructions?: string;
  questions?: Question[];
}

export interface StudentAnswer {
  question_id: string;
  question_type: QuestionType;
  selected_option?: number; // 0 for A, 1 for B, etc.
  descriptive_text?: string;
  is_correct?: boolean;
  marks_awarded?: number;
  teacher_feedback?: string;
}

export interface TestResult {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  section: string;
  roll_number: string;
  test_id: string;
  test_title: string;
  subject: string;
  obtained_marks: number;
  total_marks: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  answers: StudentAnswer[];
  submitted_at: string;
  evaluation_status: 'evaluated' | 'pending_review';
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_name: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  remarks?: string;
}

export interface AttendanceSummary {
  total_days: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

export interface OMRAnswerKey {
  id: string;
  name: string;
  exam_id?: string;
  class_name: string;
  subject: string;
  question_count: number;
  keys: Record<number, string>; // e.g. { 1: 'B', 2: 'D', 3: 'A', ... }
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OMRQuestionDetail {
  question_number: number;
  detected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  is_unanswered: boolean;
  needs_review?: boolean;
}

export interface OMRSheet {
  id: string;
  title: string;
  class_name: string;
  subject: string;
  test_id?: string;
  answer_key_id?: string;
  question_count: number; // e.g. 20, 50, 100
  options_per_question: number; // 4 (A, B, C, D)
  answer_key: string[]; // ['A', 'C', 'B', ...]
  created_at: string;
  created_by: string;
}

export interface OMRScanResult {
  sheet_id: string;
  answer_key_id?: string;
  answer_key_name?: string;
  student_id: string;
  student_name?: string;
  roll_number: string;
  total_questions: number;
  scanned_answers: Record<number, string>; // question 1 -> 'A'
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  flagged_review_count?: number;
  obtained_marks: number;
  total_marks: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  question_details?: OMRQuestionDetail[];
  processed_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'test' | 'exam' | 'result' | 'announcement';
  read: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  class_name: string; // e.g. "Class 10"
  subject: string;
  chapter: string;
  description: string;
  file_name?: string;
  file_size?: string;
  file_data?: string; // data URL or mock PDF identifier
  uploaded_by: string;
  uploaded_at: string;
}

export interface ParsedMcqQuestion {
  id: string;
  question_text: string;
  options: string[]; // 4 options
  correct_answer: string; // '0', '1', '2', '3'
  class_name: string;
  subject: string;
  chapter?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  approved?: boolean;
}
