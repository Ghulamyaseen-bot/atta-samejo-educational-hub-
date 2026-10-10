/**
 * ATTA SAMEJO EDUCATIONAL HUB
 * Centralized API Client with Offline Caching Strategy
 * Mobile App -> Authentication -> API -> Database / Local Cache
 */

import { dbManager } from '../server/apiHandler';
import { 
  User, 
  Student, 
  Teacher, 
  Test, 
  Question, 
  TestResult, 
  AttendanceRecord, 
  OMRSheet, 
  OMRAnswerKey, 
  OMRScanResult, 
  SchoolClass, 
  Subject, 
  Role, 
  StudyMaterial 
} from '../types';

export const API_BASE_URL = typeof window !== 'undefined' 
  ? `${window.location.origin}/api` 
  : '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isCachedOffline?: boolean;
}

class ApiClient {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Clean up legacy localStorage tokens that caused unintentional auto-logins in previous builds
      try {
        localStorage.removeItem('aseh_token');
        localStorage.removeItem('aseh_user');
      } catch (e) {
        // ignore
      }

      // Restore active authentication session strictly from sessionStorage
      try {
        this.token = sessionStorage.getItem('aseh_session_token');
        const savedUser = sessionStorage.getItem('aseh_session_user');
        if (savedUser) {
          this.currentUser = JSON.parse(savedUser);
          if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'teacher')) {
            this.currentUser.avatar = '/assets/FB_IMG_1790800525155.jpg';
          } else if (this.currentUser && this.currentUser.username === 'ghulam' && (!this.currentUser.avatar || this.currentUser.avatar.includes('student_avatar.svg'))) {
            this.currentUser.avatar = '/assets/FB_IMG_1790800525155.jpg';
          }
        }
      } catch (e) {
        this.currentUser = null;
        this.token = null;
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  public isOffline(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine;
  }

  // --- Caching Utilities ---
  private saveToCache<T>(key: string, data: T): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`aseh_offline_${key}`, JSON.stringify(data));
      } catch (e) {
        console.warn('Cache write failed', e);
      }
    }
  }

  private loadFromCache<T>(key: string): T | null {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(`aseh_offline_${key}`);
        if (item) {
          return JSON.parse(item) as T;
        }
      } catch (e) {
        console.warn('Cache read failed', e);
      }
    }
    return null;
  }

  // --- Authentication ---
  public async login(username: string, password: string): Promise<ApiResponse<{ user: User; student?: Student; teacher?: Teacher; token: string }>> {
    try {
      await new Promise(r => setTimeout(r, 350));

      const authResult = dbManager.authenticate(username, password);
      if (!authResult) {
        return {
          success: false,
          error: 'Invalid credentials. Please verify your Student ID/Username and password.',
        };
      }

      this.token = authResult.token;
      this.currentUser = authResult.user;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('aseh_session_token', authResult.token);
        sessionStorage.setItem('aseh_session_user', JSON.stringify(authResult.user));
      }

      return {
        success: true,
        data: authResult,
      };
    } catch (err) {
      return {
        success: false,
        error: 'Unable to connect to server. Please check your internet connection and try again.',
      };
    }
  }

  public logout(): void {
    this.token = null;
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('aseh_session_token');
      sessionStorage.removeItem('aseh_session_user');
      localStorage.removeItem('aseh_token');
      localStorage.removeItem('aseh_user');
    }
  }

  // --- Users ---
  public async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const data = dbManager.getUsers();
      return { success: true, data };
    } catch (e) {
      return { success: false, error: 'Failed to retrieve users.' };
    }
  }

  // --- Students ---
  public async getStudents(): Promise<ApiResponse<Student[]>> {
    try {
      const data = dbManager.getStudents();
      this.saveToCache('students', data);
      return { success: true, data };
    } catch (e) {
      const cached = this.loadFromCache<Student[]>('students');
      if (cached) return { success: true, data: cached, isCachedOffline: true };
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async getStudentById(id: string): Promise<ApiResponse<Student>> {
    try {
      const student = dbManager.getStudentById(id);
      if (!student) {
        const cached = this.loadFromCache<Student>(`student_${id}`);
        if (cached) return { success: true, data: cached, isCachedOffline: true };
        return { success: false, error: 'Student record not found.' };
      }
      this.saveToCache(`student_${id}`, student);
      return { success: true, data: student };
    } catch (e) {
      const cached = this.loadFromCache<Student>(`student_${id}`);
      if (cached) return { success: true, data: cached, isCachedOffline: true };
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async addStudent(studentData: Omit<Student, 'id' | 'created_at'>): Promise<ApiResponse<Student>> {
    try {
      const newStudent = dbManager.addStudent(studentData);
      return { success: true, data: newStudent };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async updateStudent(id: string, updates: Partial<Student>): Promise<ApiResponse<Student>> {
    try {
      const updated = dbManager.updateStudent(id, updates);
      if (!updated) return { success: false, error: 'Student could not be updated.' };
      this.saveToCache(`student_${id}`, updated);
      if (updates.profile_photo && this.currentUser) {
        this.currentUser.avatar = updates.profile_photo;
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('aseh_session_user', JSON.stringify(this.currentUser));
          } catch (e) {
            // ignore
          }
        }
      }
      return { success: true, data: updated };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async deleteStudent(id: string): Promise<ApiResponse<boolean>> {
    if (this.currentUser?.role === 'student' || this.currentUser?.role === 'teacher') {
      return { success: false, error: 'Unauthorized: Only administrators can remove student accounts.' };
    }
    try {
      const ok = dbManager.deleteStudent(id, this.currentUser?.role);
      return { success: ok, error: ok ? undefined : 'Failed to delete student.' };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async toggleStudentStatus(studentId: string): Promise<ApiResponse<{ status: 'active' | 'deactivated' }>> {
    if (this.currentUser?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only administrators can modify student account status.' };
    }
    try {
      const res = dbManager.toggleStudentStatus(studentId, this.currentUser?.role);
      if (!res.success) return { success: false, error: res.error };
      return { success: true, data: { status: res.status! } };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server.' };
    }
  }

  // --- Teachers ---
  public async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    try {
      const data = dbManager.getTeachers();
      return { success: true, data };
    } catch (e) {
      return { success: false, error: 'Failed to retrieve teachers.' };
    }
  }

  public async getTeacherById(id: string): Promise<ApiResponse<Teacher>> {
    try {
      const teacher = dbManager.getTeacherById(id);
      if (!teacher) return { success: false, error: 'Teacher not found.' };
      return { success: true, data: teacher };
    } catch (e) {
      return { success: false, error: 'Failed to retrieve teacher record.' };
    }
  }

  // --- Classes & Subjects ---
  public async getClasses(): Promise<ApiResponse<SchoolClass[]>> {
    const data = dbManager.getClasses();
    this.saveToCache('classes', data);
    return { success: true, data };
  }

  public async getSubjects(className?: string): Promise<ApiResponse<Subject[]>> {
    const data = dbManager.getSubjects(className);
    this.saveToCache(`subjects_${className || 'all'}`, data);
    return { success: true, data };
  }

  public async addSubject(subject: Omit<Subject, 'id'>): Promise<ApiResponse<Subject>> {
    return { success: true, data: dbManager.addSubject(subject) };
  }

  // --- Tests ---
  public async getTests(className?: string, subject?: string): Promise<ApiResponse<Test[]>> {
    const cacheKey = `tests_${className || 'all'}_${subject || 'all'}`;
    try {
      const data = dbManager.getTests(className, subject);
      this.saveToCache(cacheKey, data);
      return { success: true, data };
    } catch (e) {
      const cached = this.loadFromCache<Test[]>(cacheKey);
      if (cached) return { success: true, data: cached, isCachedOffline: true };
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async getTestById(id: string): Promise<ApiResponse<Test & { questions: Question[] }>> {
    const cacheKey = `test_detail_${id}`;
    try {
      const test = dbManager.getTestById(id);
      if (!test) {
        const cached = this.loadFromCache<Test & { questions: Question[] }>(cacheKey);
        if (cached) return { success: true, data: cached, isCachedOffline: true };
        return { success: false, error: 'Test not found or no longer active.' };
      }
      this.saveToCache(cacheKey, test);
      return { success: true, data: test };
    } catch (e) {
      const cached = this.loadFromCache<Test & { questions: Question[] }>(cacheKey);
      if (cached) return { success: true, data: cached, isCachedOffline: true };
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async createTest(testData: Omit<Test, 'id'>, questions?: Omit<Question, 'id' | 'test_id'>[]): Promise<ApiResponse<Test>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to create tests.' };
    }
    try {
      const newTest = dbManager.createTest(testData, questions, this.currentUser?.role);
      if (!newTest) return { success: false, error: 'Failed to create test. Permission denied.' };
      return { success: true, data: newTest };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async deleteTest(id: string): Promise<ApiResponse<boolean>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to delete tests.' };
    }
    try {
      const ok = dbManager.deleteTest(id, this.currentUser?.role);
      return { success: ok, error: ok ? undefined : 'Unable to remove test.' };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async submitTest(
    testId: string,
    studentId: string,
    answers: { question_id: string; selected_option?: number; descriptive_text?: string }[]
  ): Promise<ApiResponse<TestResult>> {
    // If device is offline, enforce Rule 30:
    // "Your test could not be submitted. Please reconnect to the internet and try again."
    if (this.isOffline()) {
      return {
        success: false,
        error: 'Your test could not be submitted. Please reconnect to the internet and try again.',
      };
    }

    try {
      const result = dbManager.submitTest(testId, studentId, answers);
      if (!result) return { success: false, error: 'Test submission failed. Please verify test status.' };
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: 'Your test could not be submitted. Please reconnect to the internet and try again.' };
    }
  }

  // --- Results (Guaranteed Offline Availability) ---
  public async getResults(studentId?: string, className?: string): Promise<ApiResponse<TestResult[]>> {
    const cacheKey = `results_${studentId || 'all'}_${className || 'all'}`;
    try {
      const data = dbManager.getResults(studentId, className);
      this.saveToCache(cacheKey, data);
      return { success: true, data };
    } catch (e) {
      const cached = this.loadFromCache<TestResult[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, isCachedOffline: true };
      }
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async updateResult(resultId: string, obtainedMarks: number, feedback?: string): Promise<ApiResponse<TestResult>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students cannot modify marks or test results.' };
    }
    try {
      const res = dbManager.updateResult(resultId, obtainedMarks, feedback, this.currentUser?.role);
      if (!res.success) return { success: false, error: res.error };
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: 'Failed to update result.' };
    }
  }

  public async deleteResult(resultId: string): Promise<ApiResponse<boolean>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students cannot delete test results.' };
    }
    try {
      const res = dbManager.deleteResult(resultId, this.currentUser?.role);
      if (!res.success) return { success: false, error: res.error };
      return { success: true, data: true };
    } catch (e) {
      return { success: false, error: 'Failed to delete result.' };
    }
  }

  // --- Question Bank ---
  public async getQuestions(className?: string, subject?: string): Promise<ApiResponse<Question[]>> {
    const cacheKey = `questions_${className || 'all'}_${subject || 'all'}`;
    try {
      const data = dbManager.getQuestions(className, subject);
      this.saveToCache(cacheKey, data);
      return { success: true, data };
    } catch (e) {
      const cached = this.loadFromCache<Question[]>(cacheKey);
      if (cached) return { success: true, data: cached, isCachedOffline: true };
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async addQuestion(question: Omit<Question, 'id'>): Promise<ApiResponse<Question>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to add questions to the MCQ Bank.' };
    }
    try {
      const q = dbManager.addQuestion(question, this.currentUser?.role);
      if (!q) return { success: false, error: 'Unauthorized.' };
      return { success: true, data: q };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async importQuestions(questions: Array<Omit<Question, 'id'>>): Promise<ApiResponse<{ count: number }>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to import questions into the MCQ Bank.' };
    }
    try {
      const res = dbManager.importQuestions(questions, this.currentUser?.role);
      if (!res.success) return { success: false, error: res.error || 'Failed to import questions.' };
      return { success: true, data: { count: res.count } };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  // --- Study Materials ---
  public async getStudyMaterials(className?: string): Promise<ApiResponse<StudyMaterial[]>> {
    try {
      const materials = dbManager.getStudyMaterials(className, this.currentUser?.role);
      return { success: true, data: materials };
    } catch (e) {
      return { success: false, error: 'Unable to load study materials.' };
    }
  }

  public async addStudyMaterial(material: Omit<StudyMaterial, 'id' | 'uploaded_at'>): Promise<ApiResponse<StudyMaterial>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to upload study materials.' };
    }
    try {
      const res = dbManager.addStudyMaterial(material, this.currentUser?.role);
      if (!res.success || !res.data) return { success: false, error: res.error || 'Failed to upload study material.' };
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: 'Failed to upload study material.' };
    }
  }

  public async deleteStudyMaterial(id: string): Promise<ApiResponse<boolean>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to delete study materials.' };
    }
    try {
      const res = dbManager.deleteStudyMaterial(id, this.currentUser?.role);
      return { success: res.success, error: res.error };
    } catch (e) {
      return { success: false, error: 'Failed to delete study material.' };
    }
  }

  // --- Attendance ---
  public async getAttendance(studentId?: string, className?: string): Promise<ApiResponse<AttendanceRecord[]>> {
    const cacheKey = `attendance_${studentId || 'all'}_${className || 'all'}`;
    try {
      const data = dbManager.getAttendance(studentId, className);
      this.saveToCache(cacheKey, data);
      return { success: true, data };
    } catch (e) {
      const cached = this.loadFromCache<AttendanceRecord[]>(cacheKey);
      if (cached) return { success: true, data: cached, isCachedOffline: true };
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async markAttendance(record: Omit<AttendanceRecord, 'id'>): Promise<ApiResponse<AttendanceRecord>> {
    try {
      return { success: true, data: dbManager.markAttendance(record) };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  // --- OMR System ---
  public async getOMRSheets(): Promise<ApiResponse<OMRSheet[]>> {
    const data = dbManager.getOMRSheets();
    this.saveToCache('omr_sheets', data);
    return { success: true, data };
  }

  public async createOMRSheet(sheet: Omit<OMRSheet, 'id' | 'created_at'>): Promise<ApiResponse<OMRSheet>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to create OMR sheets.' };
    }
    try {
      const res = dbManager.createOMRSheet(sheet, this.currentUser?.role);
      if (!res.success) return { success: false, error: res.error };
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async updateOMRAnswerKey(sheetId: string, answerKey: string[]): Promise<ApiResponse<OMRSheet>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to edit answer keys.' };
    }
    try {
      const res = dbManager.updateOMRAnswerKey(sheetId, answerKey, this.currentUser?.role);
      if (!res.success) return { success: false, error: res.error };
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server.' };
    }
  }

  // --- Dedicated OMR Answer Key Management (Teacher & Admin Only) ---
  public async getOMRAnswerKeys(subject?: string, className?: string): Promise<ApiResponse<OMRAnswerKey[]>> {
    try {
      const keys = dbManager.getOMRAnswerKeys(subject, className);
      return { success: true, data: keys };
    } catch (e) {
      return { success: false, error: 'Failed to retrieve answer keys.' };
    }
  }

  public async getOMRAnswerKeyById(id: string): Promise<ApiResponse<OMRAnswerKey>> {
    try {
      const key = dbManager.getOMRAnswerKeyById(id);
      if (!key) return { success: false, error: 'Answer key not found.' };
      return { success: true, data: key };
    } catch (e) {
      return { success: false, error: 'Failed to retrieve answer key.' };
    }
  }

  public async createOMRAnswerKey(
    keyData: Omit<OMRAnswerKey, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<OMRAnswerKey>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to create answer keys.' };
    }
    try {
      const res = dbManager.createOMRAnswerKey(keyData, this.currentUser?.role);
      if (!res.success) return { success: false, error: res.error };
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: 'Failed to create answer key.' };
    }
  }

  public async updateOMRAnswerKeyDetails(
    id: string,
    updates: Partial<OMRAnswerKey>
  ): Promise<ApiResponse<OMRAnswerKey>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to edit answer keys.' };
    }
    try {
      const res = dbManager.updateOMRAnswerKeyDetails(id, updates, this.currentUser?.role);
      if (!res.success) return { success: false, error: res.error };
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: 'Failed to update answer key.' };
    }
  }

  public async deleteOMRAnswerKey(id: string): Promise<ApiResponse<boolean>> {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to delete answer keys.' };
    }
    try {
      const res = dbManager.deleteOMRAnswerKey(id, this.currentUser?.role);
      if (!res.success) return { success: false, error: res.error };
      return { success: true, data: true };
    } catch (e) {
      return { success: false, error: 'Failed to delete answer key.' };
    }
  }

  public async scanOMR(
    sheetId: string, 
    studentRollNumber: string, 
    answers: Record<number, string>,
    answerKeyId?: string,
    customKeys?: Record<number, string>
  ) {
    if (this.currentUser?.role === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to scan OMR sheets.' };
    }
    try {
      await new Promise(r => setTimeout(r, 450));
      const res = dbManager.processOMRScan(
        sheetId, 
        studentRollNumber, 
        answers, 
        this.currentUser?.role,
        answerKeyId,
        customKeys
      );
      if (!res) return { success: false, error: 'OMR sheet not recognized or invalid sheet ID.' };
      return { success: true, data: res };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  // --- Student Dashboard Stats (Guaranteed Offline Availability) ---
  public async getStudentDashboardStats(studentId: string) {
    const cacheKey = `dashboard_stats_${studentId}`;
    try {
      const stats = dbManager.getStudentDashboardStats(studentId);
      this.saveToCache(cacheKey, stats);
      return { success: true, data: stats };
    } catch (e) {
      const cached = this.loadFromCache<any>(cacheKey);
      if (cached) {
        return { success: true, data: cached, isCachedOffline: true };
      }
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  // --- Password Management & Student Account Security ---
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<boolean>> {
    try {
      await new Promise(r => setTimeout(r, 200));
      const res = dbManager.changePassword(userId, currentPassword, newPassword);
      if (!res.success) {
        return { success: false, error: res.error || 'Failed to change password.' };
      }
      // Update cached user must_change_password
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.must_change_password = false;
        if (typeof window !== 'undefined') {
          localStorage.setItem('aseh_user', JSON.stringify(this.currentUser));
        }
      }
      return { success: true, data: true };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async requestPasswordReset(
    username: string,
    targetRole?: Role
  ): Promise<ApiResponse<{ message: string; role?: string; recoveryPin?: string }>> {
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = dbManager.requestPasswordReset(username, targetRole);
      if (!res.success) {
        return { success: false, error: res.message };
      }
      return {
        success: true,
        data: {
          message: res.message,
          role: res.role,
          recoveryPin: res.recoveryPin,
        },
      };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async resetPasswordWithPin(
    username: string,
    pin: string,
    newPassword: string,
    targetRole?: Role
  ): Promise<ApiResponse<boolean>> {
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = dbManager.resetPasswordWithPin(username, pin, newPassword, targetRole);
      if (!res.success) {
        return { success: false, error: res.error || 'Password reset failed.' };
      }
      return { success: true, data: true };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  // --- Mobile Phone Number Password Recovery ---
  public async requestPasswordResetByMobile(
    mobileNumber: string,
    usernameOrId?: string,
    targetRole?: Role
  ): Promise<ApiResponse<{
    ticketId: string;
    maskedPhone: string;
    rawPhone?: string;
    otpCode?: string;
    accounts?: Array<{
      userId: string;
      name: string;
      username: string;
      role: Role;
      studentId?: string;
      className?: string;
      profilePhoto?: string;
    }>;
    message?: string;
  }>> {
    try {
      await new Promise(r => setTimeout(r, 350));
      const res = dbManager.requestPasswordResetByMobile(mobileNumber, usernameOrId, targetRole);
      if (!res.success) {
        return { success: false, error: res.error || 'Failed to request password reset via mobile number.' };
      }
      return {
        success: true,
        data: {
          ticketId: res.ticketId!,
          maskedPhone: res.maskedPhone!,
          rawPhone: res.rawPhone,
          otpCode: res.otpCode,
          accounts: res.accounts,
          message: res.message,
        },
      };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async verifyOtpAndResetPassword(
    ticketId: string,
    otpCode: string,
    newPassword: string,
    selectedUserId?: string
  ): Promise<ApiResponse<{
    message: string;
    user?: User;
    student?: Student;
    teacher?: Teacher;
  }>> {
    try {
      await new Promise(r => setTimeout(r, 350));
      const res = dbManager.verifyOtpAndResetPassword(ticketId, otpCode, newPassword, selectedUserId);
      if (!res.success) {
        return { success: false, error: res.error || 'Password reset failed.' };
      }
      return {
        success: true,
        data: {
          message: res.message || 'Password updated successfully.',
          user: res.user,
          student: res.student,
          teacher: res.teacher,
        },
      };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async resetStudentPasswordByStaff(
    studentId: string,
    newTempPassword: string
  ): Promise<ApiResponse<boolean>> {
    try {
      await new Promise(r => setTimeout(r, 200));
      const res = dbManager.resetStudentPasswordByStaff(studentId, newTempPassword);
      if (!res.success) {
        return { success: false, error: res.error || 'Failed to reset student password.' };
      }
      return { success: true, data: true };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async createStudentWithCredentials(
    studentData: Omit<Student, 'id' | 'created_at' | 'user_id'>,
    username: string,
    temporaryPassword: string
  ): Promise<ApiResponse<{ student: Student; user: User }>> {
    try {
      await new Promise(r => setTimeout(r, 250));
      const result = dbManager.createStudentWithCredentials(studentData, username, temporaryPassword);
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async registerStudent(data: {
    name: string;
    father_name: string;
    phone: string;
    class: string;
    section: string;
    student_id?: string;
    username: string;
    password: string;
    profile_photo: string;
  }): Promise<ApiResponse<{ user: User; student: Student }>> {
    try {
      await new Promise(r => setTimeout(r, 200));
      const res = dbManager.registerStudent(data);
      if (!res.success || !res.user || !res.student) {
        return { success: false, error: res.error || 'Registration failed.' };
      }
      this.token = res.token || `aseh_token_${res.user.id}_${Date.now()}`;
      this.currentUser = res.user;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('aseh_session_token', this.token);
        sessionStorage.setItem('aseh_session_user', JSON.stringify(res.user));
      }
      return { success: true, data: { user: res.user, student: res.student } };
    } catch (e) {
      return { success: false, error: 'Registration failed. Please check your network and try again.' };
    }
  }

  public async getPasswordRecoveryTickets(): Promise<ApiResponse<any[]>> {
    try {
      const tickets = dbManager.getPasswordRecoveryTickets();
      return { success: true, data: tickets };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }

  public async resolvePasswordRecoveryTicket(
    ticketId: string,
    newTempPassword?: string
  ): Promise<ApiResponse<{ tempPassword?: string }>> {
    try {
      const res = dbManager.resolvePasswordRecoveryTicket(ticketId, newTempPassword);
      if (!res.success) {
        return { success: false, error: res.error || 'Failed to resolve ticket.' };
      }
      return { success: true, data: { tempPassword: res.tempPassword } };
    } catch (e) {
      return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
    }
  }
}

export const api = new ApiClient();
