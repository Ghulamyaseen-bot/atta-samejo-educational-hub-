/**
 * ATTA SAMEJO EDUCATIONAL HUB
 * Real Database Storage & Initial Seeding
 * Specifically for Class 1 to Class 12
 */

import {
  User,
  Student,
  Teacher,
  SchoolClass,
  Subject,
  Test,
  Question,
  TestResult,
  AttendanceRecord,
  OMRSheet,
  NotificationItem,
  PasswordRecoveryTicket,
} from '../types';
import { calculatePercentage, calculateSchoolGrade } from '../utils/grading';

export interface DatabaseState {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  subjects: Subject[];
  tests: Test[];
  questions: Question[];
  results: TestResult[];
  attendance: AttendanceRecord[];
  omrSheets: OMRSheet[];
  notifications: NotificationItem[];
  passwordRecoveryTickets: PasswordRecoveryTicket[];
}

export function getInitialDatabase(): DatabaseState {
  // Initial Users with Salted SHA-256 password hashes
  const users: User[] = [
    // 1. Permanent Teacher Account: ghulamyaseen / ghulamyaseen123
    {
      id: 'usr_teacher_ghulam',
      name: 'Sir Ghulam Yaseen',
      username: 'ghulamyaseen',
      role: 'teacher',
      avatar: '/assets/student_avatar.svg',
      password_hash: 'bc4933e96592c9af03e18e9e21a1984eca09ec60882798ba794f8796618d6f76', // ghulamyaseen123
      must_change_password: false,
      created_at: '2026-08-01T08:00:00Z',
    },
    // 2. Permanent Admin Account: ghulamyaseen / ghulamyaseen786
    {
      id: 'usr_admin_ghulam',
      name: 'Ghulam Yaseen (Administrator)',
      username: 'ghulamyaseen',
      role: 'admin',
      avatar: '/assets/student_avatar.svg',
      password_hash: '33edb22d668717bb3bdede364c6874cf62288f572412d05379edeb930ec4c39d', // ghulamyaseen786
      must_change_password: false,
      created_at: '2026-08-01T08:00:00Z',
    },
    // 3. Permanent Student Account: ghulam / password123
    {
      id: 'usr_student_1',
      name: 'Ghulam Yaseen',
      username: 'ghulam',
      role: 'student',
      avatar: '/assets/student_avatar.svg',
      password_hash: '50f4815bc807aebc557b8fe92f374afb927181274049cf9fce4690f3755b9143', // password123
      must_change_password: false,
      created_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'usr_student_2',
      name: 'Aisha Khan',
      username: 'aisha',
      role: 'student',
      avatar: '/assets/student_avatar.svg',
      password_hash: '50f4815bc807aebc557b8fe92f374afb927181274049cf9fce4690f3755b9143', // password123
      must_change_password: false,
      created_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'usr_student_3',
      name: 'Bilal Ahmed',
      username: 'bilal',
      role: 'student',
      avatar: '/assets/student_avatar.svg',
      password_hash: '50f4815bc807aebc557b8fe92f374afb927181274049cf9fce4690f3755b9143', // password123
      must_change_password: false,
      created_at: '2026-09-01T08:00:00Z',
    },
  ];

  // Initial Students
  const students: Student[] = [
    {
      id: 'std_1',
      user_id: 'usr_student_1',
      student_id: 'ASEH-2026-005',
      name: 'Ghulam Yaseen',
      father_name: 'Muhammad Samejo',
      class: 'Class 10',
      section: 'A',
      roll_number: '05',
      profile_photo: '/assets/student_avatar.svg',
      date_of_birth: '2010-04-14',
      phone: '+92 300 1234567',
      gender: 'Male',
      created_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'std_2',
      user_id: 'usr_student_2',
      student_id: 'ASEH-2026-012',
      name: 'Aisha Khan',
      father_name: 'Tariq Khan',
      class: 'Class 10',
      section: 'A',
      roll_number: '12',
      profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
      date_of_birth: '2010-08-20',
      phone: '+92 301 2345678',
      gender: 'Female',
      created_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'std_3',
      user_id: 'usr_student_3',
      student_id: 'ASEH-2026-019',
      name: 'Bilal Ahmed',
      father_name: 'Saeed Ahmed',
      class: 'Class 9',
      section: 'B',
      roll_number: '19',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      date_of_birth: '2011-02-11',
      phone: '+92 302 3456789',
      gender: 'Male',
      created_at: '2026-09-01T08:00:00Z',
    },
  ];

  // Teachers
  const teachers: Teacher[] = [
    {
      id: 'tch_1',
      user_id: 'usr_teacher_1',
      teacher_id: 'TCH-101',
      name: 'Sir Atta Samejo',
      subjects: ['Mathematics', 'General Science', 'Physics'],
      classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      phone: '+92 300 9876543',
      qualification: 'M.Sc. Mathematics & Educational Assessment',
      created_at: '2026-08-15T08:00:00Z',
    },
  ];

  // School Classes: strictly Class 1 through Class 12
  const classes: SchoolClass[] = Array.from({ length: 12 }, (_, i) => ({
    id: `cls_${i + 1}`,
    class_name: `Class ${i + 1}`,
    sections: ['A', 'B', 'C'],
    display_order: i + 1,
  }));

  // School Subjects for Classes
  const subjects: Subject[] = [
    // Class 10
    { id: 'sbj_10_1', subject_name: 'Mathematics', class_name: 'Class 10', code: 'MATH-10' },
    { id: 'sbj_10_2', subject_name: 'General Science', class_name: 'Class 10', code: 'SCI-10' },
    { id: 'sbj_10_3', subject_name: 'English Language', class_name: 'Class 10', code: 'ENG-10' },
    { id: 'sbj_10_4', subject_name: 'Urdu & Literature', class_name: 'Class 10', code: 'URD-10' },
    { id: 'sbj_10_5', subject_name: 'Pakistan Studies', class_name: 'Class 10', code: 'PST-10' },
    { id: 'sbj_10_6', subject_name: 'Islamiat', class_name: 'Class 10', code: 'ISL-10' },
    { id: 'sbj_10_7', subject_name: 'Computer Science', class_name: 'Class 10', code: 'CS-10' },
    // Class 9
    { id: 'sbj_9_1', subject_name: 'Mathematics', class_name: 'Class 9', code: 'MATH-09' },
    { id: 'sbj_9_2', subject_name: 'General Science', class_name: 'Class 9', code: 'SCI-09' },
    { id: 'sbj_9_3', subject_name: 'English Language', class_name: 'Class 9', code: 'ENG-09' },
    // Class 5 (Primary)
    { id: 'sbj_5_1', subject_name: 'Mathematics', class_name: 'Class 5', code: 'MATH-05' },
    { id: 'sbj_5_2', subject_name: 'General Science', class_name: 'Class 5', code: 'SCI-05' },
    { id: 'sbj_5_3', subject_name: 'English', class_name: 'Class 5', code: 'ENG-05' },
    { id: 'sbj_5_4', subject_name: 'Social Studies', class_name: 'Class 5', code: 'SST-05' },
    { id: 'sbj_5_5', subject_name: 'Urdu', class_name: 'Class 5', code: 'URD-05' },
    { id: 'sbj_5_6', subject_name: 'Islamiat', class_name: 'Class 5', code: 'ISL-05' },
  ];

  // Question Bank & Test Questions
  const questions: Question[] = [
    {
      id: 'q_1',
      test_id: 'test_math_1',
      class_name: 'Class 10',
      subject: 'Mathematics',
      topic: 'Algebra & Quadratic Equations',
      difficulty: 'medium',
      question_text: 'What is the standard form of a quadratic equation?',
      question_type: 'mcq',
      marks: 5,
      options: [
        'ax² + bx + c = 0 (where a ≠ 0)',
        'ax + by = c',
        'y = mx + c',
        'ax³ + bx² + cx + d = 0',
      ],
      correct_answer: '0',
      explanation: 'Standard form requires quadratic degree 2 with non-zero leading coefficient.',
    },
    {
      id: 'q_2',
      test_id: 'test_math_1',
      class_name: 'Class 10',
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      difficulty: 'medium',
      question_text: 'What is the discriminant formula for ax² + bx + c = 0?',
      question_type: 'mcq',
      marks: 5,
      options: ['b² - 4ac', 'b² + 4ac', '2a - 4bc', '-b ± √(b² - 4ac)'],
      correct_answer: '0',
      explanation: 'Discriminant is Δ = b² - 4ac.',
    },
    {
      id: 'q_3',
      test_id: 'test_math_1',
      class_name: 'Class 10',
      subject: 'Mathematics',
      topic: 'Matrices & Determinants',
      difficulty: 'easy',
      question_text: 'A matrix with an equal number of rows and columns is called a:',
      question_type: 'mcq',
      marks: 5,
      options: ['Row matrix', 'Column matrix', 'Square matrix', 'Zero matrix'],
      correct_answer: '2',
      explanation: 'When rows equal columns (n × n), it is defined as a square matrix.',
    },
    {
      id: 'q_4',
      test_id: 'test_math_1',
      class_name: 'Class 10',
      subject: 'Mathematics',
      topic: 'Trigonometry',
      difficulty: 'medium',
      question_text: 'What is the trigonometric identity for sin²(θ) + cos²(θ)?',
      question_type: 'mcq',
      marks: 5,
      options: ['0', '1', 'tan(θ)', '2'],
      correct_answer: '1',
      explanation: 'Fundamental Pythagorean trigonometric identity equals 1.',
    },
    {
      id: 'q_5',
      test_id: 'test_sci_1',
      class_name: 'Class 10',
      subject: 'General Science',
      topic: 'Physics - Optics',
      difficulty: 'easy',
      question_text: 'The bending of light when it passes from one medium to another is called:',
      question_type: 'mcq',
      marks: 5,
      options: ['Refraction', 'Reflection', 'Dispersion', 'Absorption'],
      correct_answer: '0',
      explanation: 'Change in speed across media causes refraction.',
    },
    {
      id: 'q_6',
      test_id: 'test_sci_1',
      class_name: 'Class 10',
      subject: 'General Science',
      topic: 'Chemistry - Acids & Bases',
      difficulty: 'medium',
      question_text: 'What is the pH value of pure distilled water at 25°C?',
      question_type: 'mcq',
      marks: 5,
      options: ['0', '5', '7 (Neutral)', '14'],
      correct_answer: '2',
      explanation: 'Pure water has neutral pH 7.',
    },
    {
      id: 'q_7',
      test_id: 'test_eng_1',
      class_name: 'Class 10',
      subject: 'English Language',
      topic: 'Grammar - Tenses',
      difficulty: 'easy',
      question_text: 'Identify the sentence in the Present Perfect Continuous tense:',
      question_type: 'mcq',
      marks: 5,
      options: [
        'He is reading a book.',
        'He has been studying for three hours.',
        'He will study tomorrow.',
        'He studied yesterday.',
      ],
      correct_answer: '1',
      explanation: 'Has/Have + been + verb-ing indicates present perfect continuous.',
    },
    {
      id: 'q_8',
      test_id: 'test_eng_desc',
      class_name: 'Class 10',
      subject: 'English Language',
      topic: 'Essay & Essay Writing',
      difficulty: 'medium',
      question_text: 'Explain the role of discipline in a student’s academic life in 100-150 words.',
      question_type: 'descriptive',
      marks: 15,
      correct_answer: 'Key points: time management, focus, character development, achieving educational milestones.',
      explanation: 'Evaluated for structure, vocabulary, and relevance.',
    },
  ];

  // Tests
  const tests: Test[] = [
    {
      id: 'test_math_1',
      title: 'Mathematics Unit Test 1',
      description: 'Monthly school assessment on Quadratic Equations, Matrices and Trigonometry.',
      class_name: 'Class 10',
      subject: 'Mathematics',
      total_marks: 20,
      duration_minutes: 25,
      start_date: '2026-10-01T08:00:00Z',
      end_date: '2026-10-15T23:59:59Z',
      created_by: 'Sir Atta Samejo',
      status: 'published',
      test_type: 'mcq',
      instructions: 'Choose the best option for each question. Time limit is 25 minutes. No negative marking.',
    },
    {
      id: 'test_sci_1',
      title: 'General Science Assessment',
      description: 'Comprehensive assessment covering Physics Optics and Acid-Base Chemistry.',
      class_name: 'Class 10',
      subject: 'General Science',
      total_marks: 20,
      duration_minutes: 20,
      start_date: '2026-10-02T08:00:00Z',
      end_date: '2026-10-18T23:59:59Z',
      created_by: 'Sir Atta Samejo',
      status: 'published',
      test_type: 'mcq',
      instructions: 'Answer all questions. Review your selections before submitting.',
    },
    {
      id: 'test_eng_1',
      title: 'English Grammar & Vocabulary Quiz',
      description: 'Assessment on tenses, passive voice, and reading comprehension.',
      class_name: 'Class 10',
      subject: 'English Language',
      total_marks: 25,
      duration_minutes: 30,
      start_date: '2026-10-04T08:00:00Z',
      end_date: '2026-10-20T23:59:59Z',
      created_by: 'Sir Atta Samejo',
      status: 'published',
      test_type: 'mcq',
      instructions: 'Carefully read each grammatical passage.',
    },
    {
      id: 'test_eng_desc',
      title: 'English Descriptive Writing Test',
      description: 'Descriptive composition and analytical writing.',
      class_name: 'Class 10',
      subject: 'English Language',
      total_marks: 15,
      duration_minutes: 40,
      start_date: '2026-10-05T08:00:00Z',
      end_date: '2026-10-25T23:59:59Z',
      created_by: 'Sir Atta Samejo',
      status: 'published',
      test_type: 'descriptive',
      instructions: 'Write answers clearly in paragraph format. Teacher will evaluate and assign marks.',
    },
  ];

  // Recent Results matching the reference image bottom table:
  // Math Practice Test (82%), Science MCQs (76%), English Reading (68%), Social Studies Quiz (92%), Urdu (74%)
  const results: TestResult[] = [
    {
      id: 'res_1',
      student_id: 'std_1',
      student_name: 'Ghulam Yaseen',
      class_name: 'Class 10',
      section: 'A',
      roll_number: '05',
      test_id: 'test_math_1',
      test_title: 'Mathematics Practice Test',
      subject: 'Mathematics',
      obtained_marks: 41,
      total_marks: 50,
      percentage: 82,
      grade: 'A+',
      answers: [],
      submitted_at: '2026-10-03T10:30:00Z',
      evaluation_status: 'evaluated',
    },
    {
      id: 'res_2',
      student_id: 'std_1',
      student_name: 'Ghulam Yaseen',
      class_name: 'Class 10',
      section: 'A',
      roll_number: '05',
      test_id: 'test_sci_1',
      test_title: 'General Science MCQs',
      subject: 'General Science',
      obtained_marks: 38,
      total_marks: 50,
      percentage: 76,
      grade: 'A',
      answers: [],
      submitted_at: '2026-10-02T14:15:00Z',
      evaluation_status: 'evaluated',
    },
    {
      id: 'res_3',
      student_id: 'std_1',
      student_name: 'Ghulam Yaseen',
      class_name: 'Class 10',
      section: 'A',
      roll_number: '05',
      test_id: 'test_eng_1',
      test_title: 'English Reading Test',
      subject: 'English Language',
      obtained_marks: 34,
      total_marks: 50,
      percentage: 68,
      grade: 'B',
      answers: [],
      submitted_at: '2026-10-01T11:00:00Z',
      evaluation_status: 'evaluated',
    },
    {
      id: 'res_4',
      student_id: 'std_1',
      student_name: 'Ghulam Yaseen',
      class_name: 'Class 10',
      section: 'A',
      roll_number: '05',
      test_id: 'test_pst_1',
      test_title: 'Pakistan Studies Quiz',
      subject: 'Pakistan Studies',
      obtained_marks: 46,
      total_marks: 50,
      percentage: 92,
      grade: 'A+',
      answers: [],
      submitted_at: '2026-09-30T09:45:00Z',
      evaluation_status: 'evaluated',
    },
    {
      id: 'res_5',
      student_id: 'std_1',
      student_name: 'Ghulam Yaseen',
      class_name: 'Class 10',
      section: 'A',
      roll_number: '05',
      test_id: 'test_urd_1',
      test_title: 'Urdu Literature Practice',
      subject: 'Urdu & Literature',
      obtained_marks: 37,
      total_marks: 50,
      percentage: 74,
      grade: 'A',
      answers: [],
      submitted_at: '2026-09-28T12:20:00Z',
      evaluation_status: 'evaluated',
    },
  ];

  // Attendance Records (e.g. 45 days, 42 Present, 2 Absent, 1 Leave = 93.3%)
  const attendance: AttendanceRecord[] = [
    { id: 'att_1', student_id: 'std_1', class_name: 'Class 10', date: '2026-10-06', status: 'present' },
    { id: 'att_2', student_id: 'std_1', class_name: 'Class 10', date: '2026-10-05', status: 'present' },
    { id: 'att_3', student_id: 'std_1', class_name: 'Class 10', date: '2026-10-04', status: 'present' },
    { id: 'att_4', student_id: 'std_1', class_name: 'Class 10', date: '2026-10-03', status: 'present' },
    { id: 'att_5', student_id: 'std_1', class_name: 'Class 10', date: '2026-10-02', status: 'present' },
    { id: 'att_6', student_id: 'std_1', class_name: 'Class 10', date: '2026-10-01', status: 'present' },
    { id: 'att_7', student_id: 'std_1', class_name: 'Class 10', date: '2026-09-30', status: 'leave', remarks: 'Medical leave' },
    { id: 'att_8', student_id: 'std_1', class_name: 'Class 10', date: '2026-09-29', status: 'present' },
    { id: 'att_9', student_id: 'std_1', class_name: 'Class 10', date: '2026-09-28', status: 'present' },
    { id: 'att_10', student_id: 'std_1', class_name: 'Class 10', date: '2026-09-27', status: 'absent' },
  ];

  // OMR Sheets
  const omrSheets: OMRSheet[] = [
    {
      id: 'omr_101',
      title: 'Class 10 Mathematics Monthly OMR Exam',
      class_name: 'Class 10',
      subject: 'Mathematics',
      test_id: 'test_math_1',
      question_count: 20,
      options_per_question: 4,
      answer_key: ['A', 'A', 'C', 'B', 'D', 'B', 'A', 'C', 'D', 'A', 'B', 'C', 'A', 'D', 'B', 'A', 'C', 'B', 'D', 'A'],
      created_at: '2026-10-01T09:00:00Z',
      created_by: 'Sir Atta Samejo',
    },
    {
      id: 'omr_102',
      title: 'Class 10 General Science Diagnostic Sheet',
      class_name: 'Class 10',
      subject: 'General Science',
      test_id: 'test_sci_1',
      question_count: 20,
      options_per_question: 4,
      answer_key: ['A', 'C', 'C', 'B', 'A', 'D', 'B', 'A', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'],
      created_at: '2026-10-02T10:00:00Z',
      created_by: 'Sir Atta Samejo',
    },
  ];

  // Notifications
  const notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      title: 'New Mathematics Test Available',
      message: 'Unit Test on Quadratic Equations is active until Oct 15.',
      date: 'Today, 09:30 AM',
      type: 'test',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'General Science Results Published',
      message: 'MCQs assessment scores are now ready in your Results tab.',
      date: 'Yesterday',
      type: 'result',
      read: false,
    },
    {
      id: 'notif_3',
      title: 'School Hub Notice: OMR Sheet Session',
      message: 'Class 10 OMR practice session scheduled for tomorrow morning.',
      date: '2 days ago',
      type: 'announcement',
      read: false,
    },
  ];

  return {
    users,
    students,
    teachers,
    classes,
    subjects,
    tests,
    questions,
    results,
    attendance,
    omrSheets,
    notifications,
    passwordRecoveryTickets: [
      {
        id: 'ticket_sample_1',
        user_id: 'usr_student_2',
        username: 'aisha',
        role: 'student',
        student_name: 'Aisha Khan',
        class_name: 'Class 10',
        status: 'pending',
        requested_at: '2026-10-06T12:00:00Z',
      },
    ],
  };
}
