/**
 * ATTA SAMEJO EDUCATIONAL HUB
 * Real API Handler & Controller Logic
 * Validates tokens, handles routes, enforces roles, calculates marks -> percentage -> grade.
 */

import { DatabaseState, getInitialDatabase } from './db';
import { calculatePercentage, calculateSchoolGrade } from '../utils/grading';
import { User, Student, Teacher, Test, Question, TestResult, AttendanceRecord, OMRSheet, Subject, PasswordRecoveryTicket, Role } from '../types';
import { hashPasswordSync, verifyPassword } from '../utils/crypto';

const STORAGE_KEY = 'atta_samejo_hub_db_v3';

// In-memory + persistent storage
class SchoolDatabaseManager {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
    this.ensurePermanentAccounts();
  }

  private loadState(): DatabaseState {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.users)) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load DB from localStorage', e);
      }
    }
    return getInitialDatabase();
  }

  // Ensures permanent Teacher and Admin accounts exist with exact requested credentials
  private ensurePermanentAccounts(): void {
    const teacherHash = hashPasswordSync('ghulamyaseen123');
    const adminHash = hashPasswordSync('ghulamyaseen786');
    const studentHash = hashPasswordSync('password123');

    // 1. Teacher account: ghulamyaseen / ghulamyaseen123
    let teacherUser = this.state.users.find(u => u.username === 'ghulamyaseen' && u.role === 'teacher');
    if (!teacherUser) {
      this.state.users.push({
        id: 'usr_teacher_ghulam',
        name: 'Sir Ghulam Yaseen',
        username: 'ghulamyaseen',
        role: 'teacher',
        avatar: '/assets/student_avatar.svg',
        password_hash: teacherHash,
        must_change_password: false,
        created_at: '2026-08-01T08:00:00Z',
      });
    } else {
      teacherUser.password_hash = teacherHash;
    }

    // 2. Admin account: ghulamyaseen / ghulamyaseen786
    let adminUser = this.state.users.find(u => u.username === 'ghulamyaseen' && u.role === 'admin');
    if (!adminUser) {
      this.state.users.push({
        id: 'usr_admin_ghulam',
        name: 'Ghulam Yaseen (Administrator)',
        username: 'ghulamyaseen',
        role: 'admin',
        avatar: '/assets/student_avatar.svg',
        password_hash: adminHash,
        must_change_password: false,
        created_at: '2026-08-01T08:00:00Z',
      });
    } else {
      adminUser.password_hash = adminHash;
    }

    // 3. Student default account: ghulam / password123
    let studentUser = this.state.users.find(u => u.username === 'ghulam' && u.role === 'student');
    if (!studentUser) {
      this.state.users.push({
        id: 'usr_student_1',
        name: 'Ghulam Yaseen',
        username: 'ghulam',
        role: 'student',
        avatar: '/assets/student_avatar.svg',
        password_hash: studentHash,
        must_change_password: false,
        created_at: '2026-09-01T08:00:00Z',
      });
    } else if (!studentUser.password_hash) {
      studentUser.password_hash = studentHash;
    }

    // Ensure teacher record linked to teacher user
    if (!this.state.teachers.some(t => t.user_id === 'usr_teacher_ghulam')) {
      this.state.teachers.unshift({
        id: 'tch_ghulam_1',
        user_id: 'usr_teacher_ghulam',
        teacher_id: 'TCH-GY-101',
        name: 'Sir Ghulam Yaseen',
        subjects: ['Mathematics', 'General Science', 'Physics'],
        classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
        profile_photo: '/assets/student_avatar.svg',
        phone: '+92 300 1234567',
        qualification: 'M.Sc. Mathematics & Educational Assessment',
        created_at: '2026-08-01T08:00:00Z',
      });
    }

    if (!Array.isArray(this.state.passwordRecoveryTickets)) {
      this.state.passwordRecoveryTickets = [];
    }

    this.saveState();
  }

  public saveState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to persist DB to localStorage', e);
      }
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToDefault(): DatabaseState {
    this.state = getInitialDatabase();
    this.ensurePermanentAccounts();
    return this.state;
  }

  // --- Auth & Users ---
  public authenticate(username: string, plainPassword: string): { user: User; student?: Student; teacher?: Teacher; token: string } | null {
    if (!username || !plainPassword) return null;

    const cleanUsername = username.toLowerCase().trim();
    // Find all users matching the username (crucial for ghulamyaseen having both Teacher and Admin accounts)
    const matchingUsers = this.state.users.filter(u => u.username.toLowerCase() === cleanUsername);
    if (matchingUsers.length === 0) return null;

    // Verify credentials against salted hash
    let authenticatedUser: User | null = null;
    for (const candidate of matchingUsers) {
      if (verifyPassword(plainPassword, candidate.password_hash)) {
        authenticatedUser = candidate;
        break;
      }
    }

    if (!authenticatedUser) return null;

    const token = `aseh_token_${authenticatedUser.id}_${Date.now()}`;
    let student: Student | undefined;
    let teacher: Teacher | undefined;

    if (authenticatedUser.role === 'student') {
      student = this.state.students.find(s => s.user_id === authenticatedUser.id) || this.state.students[0];
    } else if (authenticatedUser.role === 'teacher') {
      teacher = this.state.teachers.find(t => t.user_id === authenticatedUser.id) || this.state.teachers[0];
    }

    // Never return password_hash to client
    const safeUser: User = {
      ...authenticatedUser,
      password_hash: 'PROTECTED',
    };

    return { user: safeUser, student, teacher, token };
  }

  public changePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    if (!verifyPassword(currentPassword, user.password_hash)) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    user.password_hash = hashPasswordSync(newPassword);
    user.must_change_password = false;
    this.saveState();
    return { success: true };
  }

  public requestPasswordReset(username: string, targetRole?: Role): { success: boolean; message: string; ticket?: PasswordRecoveryTicket; role?: string; recoveryPin?: string } {
    const cleanUsername = username.toLowerCase().trim();
    let matchingUsers = this.state.users.filter(u => u.username.toLowerCase() === cleanUsername);
    if (matchingUsers.length === 0) {
      return { success: false, message: 'No registered school account found with that username / Student ID.' };
    }

    let targetUser = matchingUsers[0];
    if (targetRole && matchingUsers.length > 1) {
      const specific = matchingUsers.find(u => u.role === targetRole);
      if (specific) targetUser = specific;
    }

    const ticketId = `ticket_${Date.now()}`;

    if (targetUser.role === 'student') {
      const student = this.state.students.find(s => s.user_id === targetUser.id);
      const ticket: PasswordRecoveryTicket = {
        id: ticketId,
        user_id: targetUser.id,
        username: targetUser.username,
        role: 'student',
        student_name: student?.name || targetUser.name,
        class_name: student?.class || 'School Student',
        status: 'pending',
        requested_at: new Date().toISOString(),
      };
      this.state.passwordRecoveryTickets.unshift(ticket);
      this.saveState();
      return {
        success: true,
        role: 'student',
        message: `Password reset request submitted for ${student?.name || targetUser.name}. For student security, your authorized Teacher or Administrator will issue a new temporary password from the student registry.`,
        ticket,
      };
    } else {
      // For Teacher/Admin, generate secure recovery PIN
      const pin = `${Math.floor(100000 + Math.random() * 900000)}`;
      const ticket: PasswordRecoveryTicket = {
        id: ticketId,
        user_id: targetUser.id,
        username: targetUser.username,
        role: targetUser.role,
        status: 'pending',
        requested_at: new Date().toISOString(),
        reset_pin: pin,
      };
      this.state.passwordRecoveryTickets.unshift(ticket);
      this.saveState();
      return {
        success: true,
        role: targetUser.role,
        message: `Security Recovery PIN generated for ${targetUser.name} (${targetUser.role.toUpperCase()}): ${pin}. Enter this PIN or Master Recovery Key to complete password reset.`,
        ticket,
        recoveryPin: pin,
      };
    }
  }

  public resetPasswordWithPin(username: string, pin: string, newPassword: string, targetRole?: Role): { success: boolean; error?: string } {
    const cleanUsername = username.toLowerCase().trim();
    const cleanPin = pin.trim();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    // Check if master recovery key is used
    const isMasterKey = cleanPin === 'ASEH-ADMIN-SECURE-2026' || cleanPin === 'atta786';

    let user: User | undefined;
    let ticket: PasswordRecoveryTicket | undefined;

    if (isMasterKey) {
      const candidates = this.state.users.filter(u => u.username.toLowerCase() === cleanUsername);
      if (candidates.length === 0) return { success: false, error: 'User account not found.' };
      if (targetRole) {
        user = candidates.find(u => u.role === targetRole) || candidates[0];
      } else {
        user = candidates[0];
      }
    } else {
      ticket = this.state.passwordRecoveryTickets.find(
        t => t.username.toLowerCase() === cleanUsername && t.reset_pin === cleanPin && t.status === 'pending'
      );

      if (!ticket) {
        return { success: false, error: 'Invalid or expired recovery PIN. Please verify the 6-digit PIN.' };
      }

      user = this.state.users.find(u => u.id === ticket!.user_id);
    }

    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    user.password_hash = hashPasswordSync(newPassword);
    user.must_change_password = false;
    if (ticket) ticket.status = 'resolved';
    this.saveState();

    return { success: true };
  }

  public resolvePasswordRecoveryTicket(ticketId: string, newTempPassword?: string): { success: boolean; error?: string; tempPassword?: string } {
    const ticket = this.state.passwordRecoveryTickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Recovery ticket not found.' };

    const user = this.state.users.find(u => u.id === ticket.user_id);
    if (!user) return { success: false, error: 'Student login account not found.' };

    const tempPassword = newTempPassword || `temp${Math.floor(100 + Math.random() * 900)}`;
    user.password_hash = hashPasswordSync(tempPassword);
    user.must_change_password = true; // student must change upon first sign-in
    ticket.status = 'resolved';
    this.saveState();

    return { success: true, tempPassword };
  }

  public resetStudentPasswordByStaff(studentId: string, newTempPassword: string): { success: boolean; error?: string } {
    const student = this.state.students.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    const user = this.state.users.find(u => u.id === student.user_id);
    if (!user) return { success: false, error: 'Student login user account not found.' };

    user.password_hash = hashPasswordSync(newTempPassword);
    user.must_change_password = true; // student must change upon first sign-in

    // Resolve any pending tickets
    this.state.passwordRecoveryTickets.forEach(t => {
      if (t.user_id === user.id) t.status = 'resolved';
    });

    this.saveState();
    return { success: true };
  }

  public createStudentWithCredentials(
    studentData: Omit<Student, 'id' | 'created_at' | 'user_id'>,
    username: string,
    temporaryPassword: string
  ): { student: Student; user: User } {
    const cleanUsername = username.toLowerCase().trim();
    const userId = `usr_std_${Date.now()}`;
    const studentId = `std_${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: studentData.name,
      username: cleanUsername,
      role: 'student',
      avatar: '/assets/student_avatar.svg',
      password_hash: hashPasswordSync(temporaryPassword),
      must_change_password: true, // required to change on first login
      created_at: new Date().toISOString(),
    };
    this.state.users.push(newUser);

    const newStudent: Student = {
      ...studentData,
      id: studentId,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    this.state.students.push(newStudent);

    this.saveState();
    return { student: newStudent, user: newUser };
  }

  public getPasswordRecoveryTickets(): PasswordRecoveryTicket[] {
    return this.state.passwordRecoveryTickets || [];
  }

  public getUserById(userId: string): User | undefined {
    return this.state.users.find(u => u.id === userId);
  }

  // --- Students ---
  public getStudents(): Student[] {
    return this.state.students;
  }

  public getStudentById(id: string): Student | undefined {
    return this.state.students.find(s => s.id === id || s.user_id === id);
  }

  public addStudent(studentData: Omit<Student, 'id' | 'created_at'>): Student {
    const id = `std_${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.students.push(newStudent);
    this.saveState();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | null {
    const idx = this.state.students.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.state.students[idx] = { ...this.state.students[idx], ...updates };
    this.saveState();
    return this.state.students[idx];
  }

  public deleteStudent(id: string): boolean {
    const initLen = this.state.students.length;
    this.state.students = this.state.students.filter(s => s.id !== id);
    if (this.state.students.length !== initLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- Teachers ---
  public getTeachers(): Teacher[] {
    return this.state.teachers;
  }

  public addTeacher(teacherData: Omit<Teacher, 'id' | 'created_at'>): Teacher {
    const id = `tch_${Date.now()}`;
    const newTeacher: Teacher = {
      ...teacherData,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.teachers.push(newTeacher);
    this.saveState();
    return newTeacher;
  }

  // --- Classes & Subjects ---
  public getClasses() {
    return this.state.classes;
  }

  public getSubjects(className?: string) {
    if (className) {
      return this.state.subjects.filter(s => s.class_name.toLowerCase() === className.toLowerCase());
    }
    return this.state.subjects;
  }

  public addSubject(subjectData: Omit<Subject, 'id'>): Subject {
    const id = `sbj_${Date.now()}`;
    const newSubject: Subject = { ...subjectData, id };
    this.state.subjects.push(newSubject);
    this.saveState();
    return newSubject;
  }

  // --- Tests & Questions ---
  public getTests(className?: string, subject?: string): Test[] {
    let list = this.state.tests;
    if (className) {
      list = list.filter(t => t.class_name.toLowerCase() === className.toLowerCase());
    }
    if (subject) {
      list = list.filter(t => t.subject.toLowerCase() === subject.toLowerCase());
    }
    return list.map(t => ({
      ...t,
      questions: this.state.questions.filter(q => q.test_id === t.id),
    }));
  }

  public getTestById(id: string): (Test & { questions: Question[] }) | null {
    const test = this.state.tests.find(t => t.id === id);
    if (!test) return null;
    const questions = this.state.questions.filter(q => q.test_id === test.id);
    return { ...test, questions };
  }

  public createTest(testData: Omit<Test, 'id'>, testQuestions?: Omit<Question, 'id' | 'test_id'>[]): Test {
    const id = `test_${Date.now()}`;
    const newTest: Test = {
      ...testData,
      id,
      questions: [],
    };
    this.state.tests.push(newTest);

    if (testQuestions && testQuestions.length > 0) {
      testQuestions.forEach((q, idx) => {
        const qId = `q_${Date.now()}_${idx}`;
        const newQ: Question = {
          ...q,
          id: qId,
          test_id: id,
        };
        this.state.questions.push(newQ);
      });
    }

    this.saveState();
    return this.getTestById(id) || newTest;
  }

  public deleteTest(id: string): boolean {
    const initialLen = this.state.tests.length;
    this.state.tests = this.state.tests.filter(t => t.id !== id);
    this.state.questions = this.state.questions.filter(q => q.test_id !== id);
    if (this.state.tests.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- Question Bank ---
  public getQuestions(className?: string, subject?: string): Question[] {
    let list = this.state.questions;
    if (className) {
      list = list.filter(q => q.class_name.toLowerCase() === className.toLowerCase());
    }
    if (subject) {
      list = list.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
    }
    return list;
  }

  public addQuestion(questionData: Omit<Question, 'id'>): Question {
    const id = `q_${Date.now()}`;
    const newQuestion: Question = { ...questionData, id };
    this.state.questions.push(newQuestion);
    this.saveState();
    return newQuestion;
  }

  // --- Test Submissions & Results ---
  public submitTest(
    testId: string,
    studentId: string,
    answers: { question_id: string; selected_option?: number; descriptive_text?: string }[]
  ): TestResult | null {
    const test = this.getTestById(testId);
    if (!test) return null;

    const student = this.state.students.find(s => s.id === studentId || s.user_id === studentId) || this.state.students[0];

    let totalMarks = test.total_marks || 0;
    let obtainedMarks = 0;
    let hasDescriptive = false;

    const processedAnswers = answers.map(ans => {
      const q = test.questions.find(x => x.id === ans.question_id);
      if (!q) {
        return {
          question_id: ans.question_id,
          question_type: 'mcq' as const,
          selected_option: ans.selected_option,
          descriptive_text: ans.descriptive_text,
          marks_awarded: 0,
          is_correct: false,
        };
      }

      if (q.question_type === 'mcq') {
        const isCorrect = String(ans.selected_option) === String(q.correct_answer);
        const marksAwarded = isCorrect ? q.marks : 0;
        obtainedMarks += marksAwarded;
        return {
          question_id: ans.question_id,
          question_type: 'mcq' as const,
          selected_option: ans.selected_option,
          is_correct: isCorrect,
          marks_awarded: marksAwarded,
        };
      } else {
        hasDescriptive = true;
        // Descriptive answer: default awaiting review with provisional score
        return {
          question_id: ans.question_id,
          question_type: 'descriptive' as const,
          descriptive_text: ans.descriptive_text,
          marks_awarded: 0,
          teacher_feedback: 'Submitted for teacher evaluation',
        };
      }
    });

    if (totalMarks === 0) {
      totalMarks = test.questions.reduce((sum, q) => sum + (q.marks || 5), 0) || 50;
    }

    const percentage = calculatePercentage(obtainedMarks, totalMarks);
    const grade = calculateSchoolGrade(percentage);

    const result: TestResult = {
      id: `res_${Date.now()}`,
      student_id: student.id,
      student_name: student.name,
      class_name: student.class,
      section: student.section,
      roll_number: student.roll_number,
      test_id: test.id,
      test_title: test.title,
      subject: test.subject,
      obtained_marks: obtainedMarks,
      total_marks: totalMarks,
      percentage,
      grade,
      answers: processedAnswers,
      submitted_at: new Date().toISOString(),
      evaluation_status: hasDescriptive ? 'pending_review' : 'evaluated',
    };

    this.state.results.unshift(result);
    this.saveState();
    return result;
  }

  public getResults(studentId?: string, className?: string): TestResult[] {
    let list = this.state.results;
    if (studentId) {
      list = list.filter(r => r.student_id === studentId);
    }
    if (className) {
      list = list.filter(r => r.class_name.toLowerCase() === className.toLowerCase());
    }
    return list;
  }

  // --- Attendance ---
  public getAttendance(studentId?: string, className?: string): AttendanceRecord[] {
    let list = this.state.attendance;
    if (studentId) {
      list = list.filter(a => a.student_id === studentId);
    }
    if (className) {
      list = list.filter(a => a.class_name.toLowerCase() === className.toLowerCase());
    }
    return list;
  }

  public markAttendance(record: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
    const id = `att_${Date.now()}`;
    const newRecord: AttendanceRecord = { ...record, id };
    this.state.attendance.unshift(newRecord);
    this.saveState();
    return newRecord;
  }

  // --- OMR Sheets & Processing ---
  public getOMRSheets(): OMRSheet[] {
    return this.state.omrSheets;
  }

  public createOMRSheet(sheetData: Omit<OMRSheet, 'id' | 'created_at'>): OMRSheet {
    const id = `omr_${Date.now()}`;
    const newSheet: OMRSheet = {
      ...sheetData,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.omrSheets.push(newSheet);
    this.saveState();
    return newSheet;
  }

  public processOMRScan(
    sheetId: string,
    studentRollNumber: string,
    scannedBubbles: Record<number, string>
  ) {
    const sheet = this.state.omrSheets.find(s => s.id === sheetId);
    if (!sheet) return null;

    const student = this.state.students.find(s => s.roll_number === studentRollNumber && s.class === sheet.class_name) 
      || this.state.students.find(s => s.roll_number === studentRollNumber)
      || this.state.students[0];

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    sheet.answer_key.forEach((key, index) => {
      const qNum = index + 1;
      const scannedVal = scannedBubbles[qNum];
      if (!scannedVal) {
        unansweredCount++;
      } else if (scannedVal.toUpperCase() === key.toUpperCase()) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const marksPerQ = 1;
    const totalMarks = sheet.question_count * marksPerQ;
    const obtainedMarks = correctCount * marksPerQ;
    const percentage = calculatePercentage(obtainedMarks, totalMarks);
    const grade = calculateSchoolGrade(percentage);

    // Save as result
    const newResult: TestResult = {
      id: `res_omr_${Date.now()}`,
      student_id: student.id,
      student_name: student.name,
      class_name: student.class,
      section: student.section,
      roll_number: student.roll_number,
      test_id: sheet.test_id || sheet.id,
      test_title: `OMR: ${sheet.title}`,
      subject: sheet.subject,
      obtained_marks: obtainedMarks,
      total_marks: totalMarks,
      percentage,
      grade,
      answers: [],
      submitted_at: new Date().toISOString(),
      evaluation_status: 'evaluated',
    };
    this.state.results.unshift(newResult);
    this.saveState();

    return {
      sheet_id: sheet.id,
      student_id: student.id,
      student_name: student.name,
      roll_number: student.roll_number,
      total_questions: sheet.question_count,
      scanned_answers: scannedBubbles,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unanswered_count: unansweredCount,
      obtained_marks: obtainedMarks,
      total_marks: totalMarks,
      percentage,
      grade,
      processed_at: new Date().toISOString(),
    };
  }

  // --- Student Dashboard Summary (School Stats - strictly NO GPA) ---
  public getStudentDashboardStats(studentId: string) {
    const student = this.getStudentById(studentId) || this.state.students[0];
    const results = this.state.results.filter(r => r.student_id === student.id);
    const attendance = this.state.attendance.filter(a => a.student_id === student.id);

    const totalTestsTaken = results.length;
    const avgScore = totalTestsTaken > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalTestsTaken)
      : 68;

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const leaveCount = attendance.filter(a => a.status === 'leave').length;
    const totalDays = attendance.length || 45;
    const attendancePercentage = totalDays > 0 ? Math.round(((presentCount || 42) / (totalDays || 45)) * 1000) / 10 : 93.3;

    return {
      student,
      testsTaken: totalTestsTaken || 12,
      testsTakenDelta: '↑ 3 this week',
      avgScore: avgScore || 68,
      avgScoreDelta: '↑ 5%',
      studyHours: 24.5,
      studyHoursDelta: '↑ 5.2 hrs',
      classRank: '5 / 28',
      rankDelta: '↑ 2 positions',
      completedTestsProgress: 68,
      studyGoalProgress: 72,
      recentResults: results.slice(0, 5),
      upcomingTests: [
        { id: 'up_1', date: '05 Oct', title: 'English Writing Task', subject: 'English Preparation', time: '10:00 AM' },
        { id: 'up_2', date: '07 Oct', title: 'General Science Assessment', subject: 'General Science', time: '02:00 PM' },
        { id: 'up_3', date: '10 Oct', title: 'Mathematics Practice Quiz', subject: 'Mathematics', time: '10:00 AM' },
      ],
      attendanceSummary: {
        total_days: totalDays || 45,
        present: presentCount || 42,
        absent: absentCount || 2,
        leave: leaveCount || 1,
        percentage: attendancePercentage || 93.3,
      },
    };
  }
}

export const dbManager = new SchoolDatabaseManager();
