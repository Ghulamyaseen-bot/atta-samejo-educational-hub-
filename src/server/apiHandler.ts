/**
 * ATTA SAMEJO EDUCATIONAL HUB
 * Real API Handler & Controller Logic
 * Validates tokens, handles routes, enforces roles, calculates marks -> percentage -> grade.
 */

import { DatabaseState, getInitialDatabase } from './db';
import { calculatePercentage, calculateSchoolGrade } from '../utils/grading';
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
  OMRQuestionDetail, 
  Subject, 
  PasswordRecoveryTicket, 
  Role, 
  StudyMaterial 
} from '../types';
import { hashPasswordSync, verifyPassword } from '../utils/crypto';
import { validatePakistaniPhone } from '../utils/pakistanPhone';

const STORAGE_KEY = 'atta_samejo_hub_db_v5';

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
            if (!Array.isArray(parsed.omrAnswerKeys) || parsed.omrAnswerKeys.length === 0) {
              const init = getInitialDatabase();
              parsed.omrAnswerKeys = init.omrAnswerKeys;
            }
            // Permanently enforce official photo for admin and teacher users across app restarts/refreshes
            for (const u of parsed.users) {
              if (u.role === 'admin' || u.role === 'teacher') {
                u.avatar = '/assets/FB_IMG_1790800525155.jpg';
              }
              if (u.username === 'ghulam' && (!u.avatar || u.avatar === '/assets/student_avatar.svg')) {
                u.avatar = '/assets/FB_IMG_1790800525155.jpg';
              }
            }
            if (Array.isArray(parsed.students)) {
              for (const s of parsed.students) {
                if (s.id === 'std_1' && (!s.profile_photo || s.profile_photo === '/assets/student_avatar.svg')) {
                  s.profile_photo = '/assets/FB_IMG_1790800525155.jpg';
                }
              }
            }
            if (Array.isArray(parsed.teachers)) {
              for (const t of parsed.teachers) {
                if (t.user_id === 'usr_teacher_ghulam' || t.name.includes('Ghulam') || t.name.includes('Samejo')) {
                  t.profile_photo = '/assets/FB_IMG_1790800525155.jpg';
                }
              }
            }
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
      teacherUser = {
        id: 'usr_teacher_ghulam',
        name: 'Sir Ghulam Yaseen',
        username: 'ghulamyaseen',
        role: 'teacher',
        avatar: '/assets/FB_IMG_1790800525155.jpg',
        password_hash: teacherHash,
        phone: '+92 300 1234567',
        must_change_password: false,
        created_at: '2026-08-01T08:00:00Z',
      };
      this.state.users.push(teacherUser);
    } else {
      teacherUser.password_hash = teacherHash;
      teacherUser.avatar = '/assets/FB_IMG_1790800525155.jpg';
      if (!teacherUser.phone) teacherUser.phone = '+92 300 1234567';
    }

    // 2. Admin account: ghulamyaseen / ghulamyaseen786
    let adminUser = this.state.users.find(u => u.username === 'ghulamyaseen' && u.role === 'admin');
    if (!adminUser) {
      adminUser = {
        id: 'usr_admin_ghulam',
        name: 'Ghulam Yaseen (Administrator)',
        username: 'ghulamyaseen',
        role: 'admin',
        avatar: '/assets/FB_IMG_1790800525155.jpg',
        password_hash: adminHash,
        phone: '+92 300 1234567',
        must_change_password: false,
        created_at: '2026-08-01T08:00:00Z',
      };
      this.state.users.push(adminUser);
    } else {
      adminUser.password_hash = adminHash;
      adminUser.avatar = '/assets/FB_IMG_1790800525155.jpg';
      if (!adminUser.phone) adminUser.phone = '+92 300 1234567';
    }

    // 3. Student default account: ghulam / password123
    let studentUser = this.state.users.find(u => u.username === 'ghulam' && u.role === 'student');
    if (!studentUser) {
      this.state.users.push({
        id: 'usr_student_1',
        name: 'Ghulam Yaseen',
        username: 'ghulam',
        role: 'student',
        avatar: '/assets/FB_IMG_1790800525155.jpg',
        password_hash: studentHash,
        phone: '+92 300 1234567',
        must_change_password: false,
        created_at: '2026-09-01T08:00:00Z',
      });
    } else {
      if (!studentUser.password_hash) studentUser.password_hash = studentHash;
      if (!studentUser.phone) studentUser.phone = '+92 300 1234567';
      if (!studentUser.avatar || studentUser.avatar === '/assets/student_avatar.svg') {
        studentUser.avatar = '/assets/FB_IMG_1790800525155.jpg';
      }
    }

    // Ensure student record std_1 has official photo
    const std1 = this.state.students.find(s => s.id === 'std_1');
    if (std1 && (!std1.profile_photo || std1.profile_photo === '/assets/student_avatar.svg')) {
      std1.profile_photo = '/assets/FB_IMG_1790800525155.jpg';
    }

    // Ensure teacher record linked to teacher user
    let teacherRec = this.state.teachers.find(t => t.user_id === 'usr_teacher_ghulam' || t.name.includes('Ghulam'));
    if (!teacherRec) {
      this.state.teachers.unshift({
        id: 'tch_ghulam_1',
        user_id: 'usr_teacher_ghulam',
        teacher_id: 'TCH-GY-101',
        name: 'Sir Ghulam Yaseen',
        subjects: ['Mathematics', 'General Science', 'Physics'],
        classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
        profile_photo: '/assets/FB_IMG_1790800525155.jpg',
        phone: '+92 300 1234567',
        qualification: 'M.Sc. Mathematics & Educational Assessment',
        created_at: '2026-08-01T08:00:00Z',
      });
    } else {
      teacherRec.profile_photo = '/assets/FB_IMG_1790800525155.jpg';
    }

    if (!Array.isArray(this.state.passwordRecoveryTickets)) {
      this.state.passwordRecoveryTickets = [];
    }

    if (!Array.isArray(this.state.studyMaterials) || this.state.studyMaterials.length === 0) {
      this.state.studyMaterials = getInitialDatabase().studyMaterials;
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

    if (authenticatedUser.status === 'deactivated') {
      return { deactivated: true, user: authenticatedUser } as any;
    }

    const token = `aseh_token_${authenticatedUser.id}_${Date.now()}`;
    let student: Student | undefined;
    let teacher: Teacher | undefined;

    if (authenticatedUser.role === 'student') {
      student = this.state.students.find(s => s.user_id === authenticatedUser.id);
      if (!student) {
        student = this.state.students.find(
          s => s.student_id.toLowerCase() === authenticatedUser.username.toLowerCase()
        );
      }
      if (!student) {
        student = {
          id: `std_${authenticatedUser.id}`,
          user_id: authenticatedUser.id,
          student_id: authenticatedUser.username.toUpperCase(),
          name: authenticatedUser.name,
          father_name: 'Guardian',
          class: 'Class 10',
          section: 'A',
          roll_number: '01',
          profile_photo: authenticatedUser.avatar || '/assets/student_avatar.svg',
          date_of_birth: '2010-01-01',
          phone: authenticatedUser.phone || '+92 300 1234567',
          gender: 'Male',
          created_at: authenticatedUser.created_at || new Date().toISOString(),
        };
        this.state.students.push(student);
        this.saveState();
      }

      // Synchronize profile photo if one was saved
      if (authenticatedUser.avatar && authenticatedUser.avatar !== '/assets/student_avatar.svg') {
        student.profile_photo = authenticatedUser.avatar;
      } else if (student.profile_photo && student.profile_photo !== '/assets/student_avatar.svg') {
        authenticatedUser.avatar = student.profile_photo;
      }
    } else if (authenticatedUser.role === 'teacher') {
      teacher = this.state.teachers.find(t => t.user_id === authenticatedUser.id);
      if (!teacher && this.state.teachers.length > 0) {
        teacher = this.state.teachers.find(t => t.name.includes('Ghulam')) || this.state.teachers[0];
      }
      if (teacher) {
        teacher.profile_photo = '/assets/FB_IMG_1790800525155.jpg';
      }
      authenticatedUser.avatar = '/assets/FB_IMG_1790800525155.jpg';
    } else if (authenticatedUser.role === 'admin') {
      authenticatedUser.avatar = '/assets/FB_IMG_1790800525155.jpg';
    }

    // Never return password_hash to client
    const safeUser: User = {
      ...authenticatedUser,
      avatar: (authenticatedUser.role === 'admin' || authenticatedUser.role === 'teacher')
        ? '/assets/FB_IMG_1790800525155.jpg'
        : (authenticatedUser.avatar || student?.profile_photo || '/assets/FB_IMG_1790800525155.jpg'),
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

  // --- Mobile-Number Based Password Reset Flow ---
  public requestPasswordResetByMobile(
    mobileNumber: string,
    usernameOrId?: string,
    targetRole?: Role
  ): {
    success: boolean;
    error?: string;
    ticketId?: string;
    maskedPhone?: string;
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
  } {
    const rawClean = (mobileNumber || '').trim();
    // Normalize phone number (digits only, match suffixes)
    const normDigits = rawClean.replace(/\D/g, '');
    if (!normDigits || normDigits.length < 8) {
      return {
        success: false,
        error: 'Please enter a valid registered mobile number (at least 8-11 digits).',
      };
    }

    // Helper to extract significant trailing digits (last 9-10 digits)
    const getSignificant = (p: string) => {
      const d = p.replace(/\D/g, '');
      return d.length > 9 ? d.slice(-9) : d;
    };

    const targetSignif = getSignificant(normDigits);

    // Find all users who match this mobile number either in User, Student, or Teacher records
    const matched: Array<{
      user: User;
      student?: Student;
      teacher?: Teacher;
      phone: string;
    }> = [];

    for (const u of this.state.users) {
      const student = this.state.students.find(s => s.user_id === u.id);
      const teacher = this.state.teachers.find(t => t.user_id === u.id);

      const phones = [u.phone, student?.phone, teacher?.phone].filter(Boolean) as string[];
      const isMatched = phones.some(p => {
        const s = getSignificant(p);
        return s && (s === targetSignif || s.endsWith(targetSignif) || targetSignif.endsWith(s));
      });

      if (isMatched) {
        matched.push({
          user: u,
          student,
          teacher,
          phone: phones[0] || rawClean,
        });
      }
    }

    if (matched.length === 0) {
      return {
        success: false,
        error: `No registered student or staff account found with mobile number "${rawClean}". Please verify the number or contact institutional support.`,
      };
    }

    // Filter by usernameOrId if specified
    let filtered = matched;
    if (usernameOrId && usernameOrId.trim()) {
      const q = usernameOrId.trim().toLowerCase();
      const byQuery = filtered.filter(item =>
        item.user.username.toLowerCase() === q ||
        item.student?.student_id.toLowerCase() === q ||
        item.teacher?.teacher_id.toLowerCase() === q
      );
      if (byQuery.length > 0) {
        filtered = byQuery;
      }
    }

    // Filter by role if specified
    if (targetRole && filtered.length > 1) {
      const byRole = filtered.filter(item => item.user.role === targetRole);
      if (byRole.length > 0) {
        filtered = byRole;
      }
    }

    const primary = filtered[0];
    const resolvedPhone = primary.phone || rawClean;
    
    // Mask phone number for security display: e.g. +92 300 ••••567
    const last3 = resolvedPhone.slice(-3);
    const firstPart = resolvedPhone.slice(0, Math.max(4, resolvedPhone.length - 6));
    const maskedPhone = `${firstPart}••••${last3}`;

    // Generate 6-digit OTP code
    const otpCode = `${Math.floor(100000 + Math.random() * 900000)}`;
    const ticketId = `ticket_sms_${Date.now()}`;

    const ticket: PasswordRecoveryTicket = {
      id: ticketId,
      user_id: primary.user.id,
      username: primary.user.username,
      role: primary.user.role,
      student_name: primary.student?.name || primary.teacher?.name || primary.user.name,
      class_name: primary.student?.class,
      phone: resolvedPhone,
      masked_phone: maskedPhone,
      status: 'pending',
      requested_at: new Date().toISOString(),
      reset_pin: otpCode,
      otp_code: otpCode,
      otp_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    this.state.passwordRecoveryTickets.unshift(ticket);
    this.saveState();

    const accountsSummary = filtered.map(item => ({
      userId: item.user.id,
      name: item.student?.name || item.teacher?.name || item.user.name,
      username: item.user.username,
      role: item.user.role,
      studentId: item.student?.student_id || item.teacher?.teacher_id,
      className: item.student?.class,
      profilePhoto: item.student?.profile_photo || item.teacher?.profile_photo || item.user.avatar,
    }));

    return {
      success: true,
      ticketId,
      maskedPhone,
      rawPhone: resolvedPhone,
      otpCode,
      accounts: accountsSummary,
      message: `A secure 6-digit verification code has been dispatched to ${maskedPhone}.`,
    };
  }

  public verifyOtpAndResetPassword(
    ticketId: string,
    otpCode: string,
    newPassword: string,
    selectedUserId?: string
  ): {
    success: boolean;
    error?: string;
    message?: string;
    user?: User;
    student?: Student;
    teacher?: Teacher;
  } {
    const cleanOtp = (otpCode || '').trim();
    if (!cleanOtp) {
      return { success: false, error: 'Please enter the 6-digit verification code sent to your mobile.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const ticket = this.state.passwordRecoveryTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { success: false, error: 'Recovery session expired or not found. Please request a new verification code.' };
    }

    if (ticket.status !== 'pending') {
      return { success: false, error: 'This recovery session has already been used. Please request a new verification code.' };
    }

    // Verify OTP code or emergency master bypass
    const isMasterBypass = cleanOtp === 'ASEH-ADMIN-SECURE-2026' || cleanOtp === 'atta786';
    if (!isMasterBypass && ticket.otp_code !== cleanOtp && ticket.reset_pin !== cleanOtp) {
      return { success: false, error: 'Invalid verification code. Please check your SMS and try again.' };
    }

    if (ticket.otp_expires_at) {
      const expTime = new Date(ticket.otp_expires_at).getTime();
      if (Date.now() > expTime && !isMasterBypass) {
        return { success: false, error: 'Verification code has expired. Please request a new code.' };
      }
    }

    const targetUserId = selectedUserId || ticket.user_id;
    const user = this.state.users.find(u => u.id === targetUserId);
    if (!user) {
      return { success: false, error: 'Target account not found.' };
    }

    // Update password
    user.password_hash = hashPasswordSync(newPassword);
    user.must_change_password = false;
    ticket.status = 'resolved';
    this.saveState();

    let student: Student | undefined;
    let teacher: Teacher | undefined;
    if (user.role === 'student') {
      student = this.state.students.find(s => s.user_id === user.id);
    } else if (user.role === 'teacher') {
      teacher = this.state.teachers.find(t => t.user_id === user.id);
    }

    const safeUser: User = {
      ...user,
      password_hash: 'PROTECTED',
    };

    return {
      success: true,
      message: `Password updated successfully for ${user.name} (${user.username}).`,
      user: safeUser,
      student,
      teacher,
    };
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
      phone: studentData.phone,
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

  // Student self-registration with mandatory photograph upload & own credentials
  public registerStudent(data: {
    name: string;
    father_name: string;
    phone: string;
    class: string;
    section: string;
    student_id?: string;
    username: string;
    password: string;
    profile_photo: string;
  }): { success: boolean; error?: string; user?: User; student?: Student; token?: string } {
    const cleanUsername = data.username.toLowerCase().trim();
    if (!cleanUsername) return { success: false, error: 'Username is required.' };
    if (!data.name.trim()) return { success: false, error: 'Full Name is required.' };
    if (!data.father_name.trim()) return { success: false, error: 'Father Name is required.' };
    const phoneCheck = validatePakistaniPhone(data.phone);
    if (!phoneCheck.isValid) {
      return { success: false, error: phoneCheck.error || 'Please enter a valid Pakistani mobile number (+92XXXXXXXXXX or 03XXXXXXXXX).' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    // Mandatory student photograph check
    if (!data.profile_photo || !data.profile_photo.trim() || data.profile_photo === '/assets/student_avatar.svg') {
      return { success: false, error: 'Profile photo is required to complete registration.' };
    }
    const studentAvatar = data.profile_photo.trim();

    const usernameExists = this.state.users.some(u => u.username.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return { success: false, error: 'Username is already taken. Please choose another username.' };
    }

    const userId = `usr_std_${Date.now()}`;
    const studentId = `std_${Date.now()}`;
    const formattedStudentId = data.student_id?.trim() || `ASEH-2026-${String(this.state.students.length + 1).padStart(3, '0')}`;
    const rollNo = String(this.state.students.filter(s => s.class === data.class).length + 1).padStart(2, '0');

    const newUser: User = {
      id: userId,
      name: data.name.trim(),
      username: cleanUsername,
      role: 'student',
      avatar: studentAvatar,
      password_hash: hashPasswordSync(data.password),
      phone: phoneCheck.display || data.phone.trim(),
      must_change_password: false,
      created_at: new Date().toISOString(),
    };

    const newStudent: Student = {
      id: studentId,
      user_id: userId,
      student_id: formattedStudentId,
      name: data.name.trim(),
      father_name: data.father_name.trim(),
      class: data.class || 'Class 10',
      section: data.section || 'A',
      roll_number: rollNo,
      profile_photo: studentAvatar,
      date_of_birth: '2010-01-01',
      phone: phoneCheck.display || data.phone.trim(),
      gender: 'Male',
      created_at: new Date().toISOString(),
    };

    this.state.users.push(newUser);
    this.state.students.push(newStudent);
    this.saveState();

    const token = `aseh_token_${newUser.id}_${Date.now()}`;
    return {
      success: true,
      user: newUser,
      student: newStudent,
      token,
    };
  }

  public getPasswordRecoveryTickets(): PasswordRecoveryTicket[] {
    return this.state.passwordRecoveryTickets || [];
  }

  public getUserById(userId: string): User | undefined {
    return this.state.users.find(u => u.id === userId);
  }

  public getUsers(): User[] {
    return this.state.users.map(u => ({
      ...u,
      password_hash: 'PROTECTED',
    }));
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
    if (updates.profile_photo) {
      const uId = this.state.students[idx].user_id;
      if (uId) {
        const uIdx = this.state.users.findIndex(u => u.id === uId);
        if (uIdx !== -1) {
          this.state.users[uIdx].avatar = updates.profile_photo;
        }
      }
    }
    this.saveState();
    return this.state.students[idx];
  }

  public deleteStudent(id: string, actorRole?: Role): boolean {
    if (actorRole && actorRole !== 'admin') return false;
    const student = this.state.students.find(s => s.id === id);
    if (!student) return false;
    
    // Remove student record
    this.state.students = this.state.students.filter(s => s.id !== id);
    // Also remove associated login user account if exists
    if (student.user_id) {
      this.state.users = this.state.users.filter(u => u.id !== student.user_id);
    }
    // Also clear associated results & attendance
    this.state.results = this.state.results.filter(r => r.student_id !== student.id);
    this.state.attendance = this.state.attendance.filter(a => a.student_id !== student.id);
    
    this.saveState();
    return true;
  }

  public toggleStudentStatus(studentId: string, actorRole?: Role): { success: boolean; status?: 'active' | 'deactivated'; error?: string } {
    if (actorRole !== 'admin') {
      return { success: false, error: 'Only administrators have permission to deactivate or activate student accounts.' };
    }
    const student = this.state.students.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    const user = this.state.users.find(u => u.id === student.user_id);
    if (!user) return { success: false, error: 'Student login user account not found.' };

    const newStatus = user.status === 'deactivated' ? 'active' : 'deactivated';
    user.status = newStatus;
    this.saveState();
    return { success: true, status: newStatus };
  }

  // --- Teachers ---
  public getTeachers(): Teacher[] {
    return this.state.teachers;
  }

  public getTeacherById(userIdOrTeacherId: string): Teacher | null {
    return this.state.teachers.find(t => t.id === userIdOrTeacherId || t.user_id === userIdOrTeacherId) || null;
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

  public createTest(
    testData: Omit<Test, 'id'>, 
    testQuestions?: Omit<Question, 'id' | 'test_id'>[],
    actorRole?: Role
  ): Test | null {
    if (actorRole === 'student') {
      return null;
    }
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

  public deleteTest(id: string, actorRole?: Role): boolean {
    if (actorRole === 'student') return false;
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

  public addQuestion(questionData: Omit<Question, 'id'>, actorRole?: Role): Question | null {
    if (actorRole === 'student') return null;
    const id = `q_${Date.now()}`;
    const newQuestion: Question = { ...questionData, id };
    this.state.questions.push(newQuestion);
    this.saveState();
    return newQuestion;
  }

  public importQuestions(
    importedQuestions: Array<Omit<Question, 'id'>>,
    actorRole?: Role
  ): { success: boolean; count: number; error?: string } {
    if (actorRole === 'student') {
      return { success: false, count: 0, error: 'Unauthorized: Students are not permitted to import questions into the MCQ Bank.' };
    }
    let added = 0;
    for (const q of importedQuestions) {
      const newQ: Question = {
        ...q,
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      this.state.questions.unshift(newQ);
      added++;
    }
    this.saveState();
    return { success: true, count: added };
  }

  // --- Study Materials ---
  public getStudyMaterials(classFilter?: string, actorRole?: Role): StudyMaterial[] {
    let list = this.state.studyMaterials || [];
    if (actorRole === 'student' && classFilter && classFilter !== 'all') {
      list = list.filter(m => m.class_name.toLowerCase() === classFilter.toLowerCase());
    } else if (classFilter && classFilter !== 'all') {
      list = list.filter(m => m.class_name.toLowerCase() === classFilter.toLowerCase());
    }
    return list;
  }

  public addStudyMaterial(
    materialData: Omit<StudyMaterial, 'id' | 'uploaded_at'>,
    actorRole?: Role
  ): { success: boolean; data?: StudyMaterial; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to upload study materials.' };
    }
    const newMaterial: StudyMaterial = {
      ...materialData,
      id: `mat_${Date.now()}`,
      uploaded_at: new Date().toISOString(),
    };
    if (!Array.isArray(this.state.studyMaterials)) {
      this.state.studyMaterials = [];
    }
    this.state.studyMaterials.unshift(newMaterial);
    this.saveState();
    return { success: true, data: newMaterial };
  }

  public deleteStudyMaterial(id: string, actorRole?: Role): { success: boolean; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are not permitted to delete study materials.' };
    }
    const idx = (this.state.studyMaterials || []).findIndex(m => m.id === id);
    if (idx === -1) return { success: false, error: 'Material not found.' };
    this.state.studyMaterials.splice(idx, 1);
    this.saveState();
    return { success: true };
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

  public updateResult(
    resultId: string, 
    obtainedMarks: number, 
    feedback?: string, 
    actorRole?: Role
  ): { success: boolean; data?: TestResult; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are strictly forbidden from modifying test results.' };
    }
    const res = this.state.results.find(r => r.id === resultId);
    if (!res) return { success: false, error: 'Result record not found.' };

    const total = res.total_marks || 100;
    const cleanObtained = Math.min(Math.max(0, obtainedMarks), total);
    const percentage = calculatePercentage(cleanObtained, total);
    const grade = calculateSchoolGrade(percentage);

    res.obtained_marks = cleanObtained;
    res.percentage = percentage;
    res.grade = grade;
    res.evaluation_status = 'evaluated';
    if (feedback && res.answers && res.answers.length > 0) {
      res.answers[0].teacher_feedback = feedback;
    }
    this.saveState();
    return { success: true, data: res };
  }

  public deleteResult(resultId: string, actorRole?: Role): { success: boolean; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are strictly forbidden from deleting results.' };
    }
    const idx = this.state.results.findIndex(r => r.id === resultId);
    if (idx === -1) return { success: false, error: 'Result record not found.' };
    this.state.results.splice(idx, 1);
    this.saveState();
    return { success: true };
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

  // --- OMR Sheets, Answer Keys & Processing ---
  public getOMRSheets(): OMRSheet[] {
    return this.state.omrSheets;
  }

  public getOMRSheetById(id: string): OMRSheet | null {
    return this.state.omrSheets.find(s => s.id === id) || null;
  }

  public createOMRSheet(sheetData: Omit<OMRSheet, 'id' | 'created_at'>, actorRole?: Role): { success: boolean; data?: OMRSheet; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are strictly forbidden from creating OMR sheets.' };
    }
    const id = `omr_${Date.now()}`;
    const newSheet: OMRSheet = {
      ...sheetData,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.omrSheets.push(newSheet);
    this.saveState();
    return { success: true, data: newSheet };
  }

  public deleteOMRSheet(sheetId: string, actorRole?: Role): { success: boolean; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are strictly forbidden from deleting OMR sheets.' };
    }
    const idx = this.state.omrSheets.findIndex(s => s.id === sheetId);
    if (idx === -1) return { success: false, error: 'OMR sheet not found.' };
    this.state.omrSheets.splice(idx, 1);
    this.saveState();
    return { success: true };
  }

  // Dedicated Editable OMR Answer Key Management (Teacher & Admin Only)
  public getOMRAnswerKeys(subject?: string, className?: string): OMRAnswerKey[] {
    let list = this.state.omrAnswerKeys || [];
    if (subject && subject !== 'all') {
      list = list.filter(k => k.subject.toLowerCase() === subject.toLowerCase());
    }
    if (className && className !== 'all') {
      list = list.filter(k => k.class_name.toLowerCase() === className.toLowerCase());
    }
    return list;
  }

  public getOMRAnswerKeyById(id: string): OMRAnswerKey | null {
    return (this.state.omrAnswerKeys || []).find(k => k.id === id) || null;
  }

  public createOMRAnswerKey(
    keyData: Omit<OMRAnswerKey, 'id' | 'created_at' | 'updated_at'>,
    actorRole?: Role
  ): { success: boolean; data?: OMRAnswerKey; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are strictly forbidden from creating answer keys.' };
    }
    const id = `key_${Date.now()}`;
    const now = new Date().toISOString();
    const newKey: OMRAnswerKey = {
      ...keyData,
      id,
      created_at: now,
      updated_at: now,
    };
    if (!this.state.omrAnswerKeys) this.state.omrAnswerKeys = [];
    this.state.omrAnswerKeys.unshift(newKey);
    this.saveState();
    return { success: true, data: newKey };
  }

  public updateOMRAnswerKeyDetails(
    id: string,
    updates: Partial<OMRAnswerKey>,
    actorRole?: Role
  ): { success: boolean; data?: OMRAnswerKey; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are strictly forbidden from editing answer keys.' };
    }
    if (!this.state.omrAnswerKeys) this.state.omrAnswerKeys = [];
    const idx = this.state.omrAnswerKeys.findIndex(k => k.id === id);
    if (idx === -1) {
      return { success: false, error: 'Answer key not found.' };
    }
    const updated: OMRAnswerKey = {
      ...this.state.omrAnswerKeys[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.state.omrAnswerKeys[idx] = updated;

    // Also sync to matching sheet if applicable
    const matchingSheet = this.state.omrSheets.find(s => s.answer_key_id === id);
    if (matchingSheet && updated.keys) {
      const arr = Array.from({ length: matchingSheet.question_count }, (_, i) => updated.keys[i + 1] || 'A');
      matchingSheet.answer_key = arr;
    }

    this.saveState();
    return { success: true, data: updated };
  }

  public deleteOMRAnswerKey(id: string, actorRole?: Role): { success: boolean; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are strictly forbidden from deleting answer keys.' };
    }
    if (!this.state.omrAnswerKeys) this.state.omrAnswerKeys = [];
    const idx = this.state.omrAnswerKeys.findIndex(k => k.id === id);
    if (idx === -1) {
      return { success: false, error: 'Answer key not found.' };
    }
    this.state.omrAnswerKeys.splice(idx, 1);
    this.saveState();
    return { success: true };
  }

  public updateOMRAnswerKey(sheetId: string, answerKey: string[], actorRole?: Role): { success: boolean; data?: OMRSheet; error?: string } {
    if (actorRole === 'student') {
      return { success: false, error: 'Unauthorized: Students are strictly forbidden from editing answer keys.' };
    }
    const sheet = this.state.omrSheets.find(s => s.id === sheetId);
    if (!sheet) return { success: false, error: 'OMR sheet not found.' };
    sheet.answer_key = answerKey;
    this.saveState();
    return { success: true, data: sheet };
  }

  public processOMRScan(
    sheetId: string,
    studentRollNumber: string,
    scannedBubbles: Record<number, string>,
    actorRole?: Role,
    answerKeyId?: string,
    customKeys?: Record<number, string>
  ): OMRScanResult | null {
    if (actorRole === 'student') return null;
    const sheet = this.state.omrSheets.find(s => s.id === sheetId);
    if (!sheet) return null;

    // Resolve the Answer Key to check against
    let keyName = 'Standard Examination Answer Key';
    let keyMap: Record<number, string> = {};

    if (customKeys && Object.keys(customKeys).length > 0) {
      keyMap = customKeys;
      keyName = 'Custom Evaluator Key';
    } else if (answerKeyId) {
      const selectedKey = (this.state.omrAnswerKeys || []).find(k => k.id === answerKeyId);
      if (selectedKey) {
        keyMap = selectedKey.keys;
        keyName = selectedKey.name;
      }
    }

    // Fallback to sheet's embedded answer key if no key map resolved
    if (Object.keys(keyMap).length === 0) {
      sheet.answer_key.forEach((k, idx) => {
        keyMap[idx + 1] = k;
      });
    }

    const student = this.state.students.find(s => s.roll_number === studentRollNumber && s.class === sheet.class_name) 
      || this.state.students.find(s => s.roll_number === studentRollNumber)
      || this.state.students[0];

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let flaggedCount = 0;
    const questionDetails: OMRQuestionDetail[] = [];

    const totalQuestions = sheet.question_count || 20;

    for (let q = 1; q <= totalQuestions; q++) {
      const expected = (keyMap[q] || 'A').toUpperCase();
      const detectedRaw = scannedBubbles[q];
      const detected = detectedRaw ? detectedRaw.trim().toUpperCase() : '';

      const isUnanswered = !detected;
      const isCorrect = !isUnanswered && detected === expected;
      const needsReview = isUnanswered || !['A', 'B', 'C', 'D'].includes(detected);

      if (isUnanswered) {
        unansweredCount++;
        flaggedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      if (needsReview && !isUnanswered) {
        flaggedCount++;
      }

      questionDetails.push({
        question_number: q,
        detected_answer: detected,
        correct_answer: expected,
        is_correct: isCorrect,
        is_unanswered: isUnanswered,
        needs_review: needsReview,
      });
    }

    const marksPerQ = 1;
    const totalMarks = totalQuestions * marksPerQ;
    const obtainedMarks = correctCount * marksPerQ;
    const percentage = calculatePercentage(obtainedMarks, totalMarks);
    const grade = calculateSchoolGrade(percentage);

    // Save as persistent result record
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
      answers: questionDetails.map(qd => ({
        question_id: `q_omr_${qd.question_number}`,
        question_type: 'mcq' as const,
        selected_option: qd.detected_answer ? ['A', 'B', 'C', 'D'].indexOf(qd.detected_answer) : undefined,
        is_correct: qd.is_correct,
        marks_awarded: qd.is_correct ? 1 : 0,
        teacher_feedback: qd.needs_review ? 'Flagged for review during scan' : undefined,
      })),
      submitted_at: new Date().toISOString(),
      evaluation_status: 'evaluated',
    };
    this.state.results.unshift(newResult);
    this.saveState();

    return {
      sheet_id: sheet.id,
      answer_key_id: answerKeyId,
      answer_key_name: keyName,
      student_id: student.id,
      student_name: student.name,
      roll_number: student.roll_number,
      total_questions: totalQuestions,
      scanned_answers: scannedBubbles,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unanswered_count: unansweredCount,
      flagged_review_count: flaggedCount,
      obtained_marks: obtainedMarks,
      total_marks: totalMarks,
      percentage,
      grade,
      question_details: questionDetails,
      processed_at: new Date().toISOString(),
    };
  }

  // --- Student Dashboard Summary (Real Stored School Stats - strictly NO GPA) ---
  public getStudentDashboardStats(studentId: string) {
    const student = this.getStudentById(studentId) || this.state.students[0];
    const results = this.state.results.filter(r => r.student_id === student.id);
    const attendance = this.state.attendance.filter(a => a.student_id === student.id);
    const publishedTestsForClass = this.state.tests.filter(t => t.class_name.toLowerCase() === student.class.toLowerCase());

    const totalTestsTaken = results.length;
    const hasData = totalTestsTaken > 0;
    const avgScore = hasData
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalTestsTaken)
      : 0;

    const totalPublished = publishedTestsForClass.length || 1;
    const completedProgress = hasData 
      ? Math.min(100, Math.round((totalTestsTaken / totalPublished) * 100))
      : 0;
    const studyGoalProgress = hasData
      ? Math.min(100, Math.round((avgScore / 85) * 100))
      : 0;

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const leaveCount = attendance.filter(a => a.status === 'leave').length;
    const totalDays = attendance.length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 1000) / 10 : 0;

    // Subject breakdown from real results
    const subjectMap: Record<string, { total: number; count: number }> = {};
    results.forEach(r => {
      if (!subjectMap[r.subject]) {
        subjectMap[r.subject] = { total: 0, count: 0 };
      }
      subjectMap[r.subject].total += r.percentage;
      subjectMap[r.subject].count += 1;
    });

    const subjectPerformance = Object.keys(subjectMap).map(sub => ({
      subject: sub,
      average: Math.round(subjectMap[sub].total / subjectMap[sub].count),
    }));

    return {
      student,
      hasData,
      testsTaken: totalTestsTaken,
      testsTakenDelta: hasData ? `↑ ${totalTestsTaken} completed` : '0 completed',
      avgScore,
      avgScoreDelta: hasData ? `↑ ${avgScore}% overall` : 'No score yet',
      studyHours: hasData ? Math.round(totalTestsTaken * 2.2 * 10) / 10 : 0,
      studyHoursDelta: hasData ? `${Math.round(totalTestsTaken * 2.2)} hrs logged` : '0 hrs',
      classRank: hasData ? `Top ${Math.max(1, Math.min(10, Math.round(11 - (avgScore / 10))))}` : 'Unranked',
      rankDelta: hasData ? 'Active student' : 'Pending tests',
      completedTestsProgress: completedProgress,
      studyGoalProgress: studyGoalProgress,
      subjectPerformance,
      recentResults: results.slice(0, 5),
      upcomingTests: publishedTestsForClass.slice(0, 3).map((t, idx) => ({
        id: t.id,
        date: t.start_date || 'Upcoming',
        title: t.title,
        subject: t.subject,
        time: `${t.duration_minutes || 60} mins`,
      })),
      attendanceSummary: {
        total_days: totalDays,
        present: presentCount,
        absent: absentCount,
        leave: leaveCount,
        percentage: attendancePercentage,
      },
    };
  }
}

export const dbManager = new SchoolDatabaseManager();
