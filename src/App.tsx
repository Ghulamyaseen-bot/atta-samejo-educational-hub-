/**
 * ATTA SAMEJO EDUCATIONAL HUB
 * Android Educational Assessment & Student Management
 * Primary Application Controller
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './api/client';
import { User, Student, Teacher, TestResult, Test, Question, NotificationItem, AttendanceRecord } from './types';
import { NavigationSidebar, NavTab } from './components/NavigationSidebar';
import { HeaderBar } from './components/HeaderBar';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ClipboardCheck, FileText } from 'lucide-react';
import officialAdminPortrait from './assets/FB_IMG_1790800525155.jpg';

// Views
import { LoginView } from './views/LoginView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { MyTestsView } from './views/MyTestsView';
import { TakeTestView } from './views/TakeTestView';
import { CreateTestView } from './views/CreateTestView';
import { McqBankView } from './views/McqBankView';
import { DescriptiveTestView } from './views/DescriptiveTestView';
import { OmrSystemView } from './views/OmrSystemView';
import { ResultsAnalyticsView } from './views/ResultsAnalyticsView';
import { AttendanceView } from './views/AttendanceView';
import { StudentProfileView } from './views/StudentProfileView';
import { StudentsFormView } from './views/StudentsFormView';
import { StudyMaterialsView } from './views/StudyMaterialsView';
import { AdminManageView } from './views/AdminManageView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAndroidView, setIsAndroidView] = useState(false);

  // Data states
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [resultsList, setResultsList] = useState<TestResult[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n_1',
      title: 'Mathematics Unit Test Available',
      message: 'Monthly Assessment on Quadratic Equations is active.',
      date: 'Today',
      type: 'test',
      read: false,
    },
    {
      id: 'n_2',
      title: 'General Science Results Ready',
      message: 'Your recent science quiz has been evaluated.',
      date: 'Yesterday',
      type: 'result',
      read: false,
    },
    {
      id: 'n_3',
      title: 'OMR Practice Announcement',
      message: 'OMR Answer Sheet workshop tomorrow morning.',
      date: '2 days ago',
      type: 'announcement',
      read: false,
    },
  ]);

  // Active test being taken
  const [activeTest, setActiveTest] = useState<(Test & { questions: Question[] }) | null>(null);

  // First-time login / Temporary password update state
  const [firstTimeCurrentPassword, setFirstTimeCurrentPassword] = useState('');
  const [firstTimeNewPassword, setFirstTimeNewPassword] = useState('');
  const [firstTimeConfirmPassword, setFirstTimeConfirmPassword] = useState('');
  const [firstTimeError, setFirstTimeError] = useState<string | null>(null);
  const [firstTimeLoading, setFirstTimeLoading] = useState(false);
  const [showFirstTimePass, setShowFirstTimePass] = useState(false);

  // Initialize Auth
  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
    // Only restore session if user is explicitly authenticated with valid active session
    if (api.isAuthenticated()) {
      const user = api.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        if (user.role === 'student') {
          const stdRes = await api.getStudentById(user.id);
          if (stdRes.success && stdRes.data) {
            setCurrentStudent(stdRes.data);
            await loadUserData(stdRes.data.id);
          } else {
            await loadUserData('std_1');
          }
          setCurrentTab('dashboard');
        } else if (user.role === 'teacher') {
          const teacherRes = await api.getTeacherById(user.id);
          if (teacherRes.success && teacherRes.data) {
            setCurrentTeacher(teacherRes.data);
          }
          await loadUserData('std_1');
          setCurrentTab('omr-sheet');
        } else {
          // Admin role
          await loadUserData('std_1');
          setCurrentTab('admin-manage');
        }
      } else {
        setCurrentUser(null);
      }
    } else {
      // Unauthenticated: Strictly require login, never bypass or auto-login
      setCurrentUser(null);
    }
  };

  const loadUserData = async (studentId: string) => {
    const statsRes = await api.getStudentDashboardStats(studentId);
    if (statsRes.success && statsRes.data) {
      setDashboardStats(statsRes.data);
    }

    const resRes = await api.getResults(studentId);
    if (resRes.success && resRes.data) {
      setResultsList(resRes.data);
    }

    const attRes = await api.getAttendance(studentId);
    if (attRes.success && attRes.data) {
      setAttendanceRecords(attRes.data);
    }
  };

  const handleLoginSuccess = async (user: User, student?: Student, teacher?: Teacher) => {
    setCurrentUser(user);
    setCurrentStudent(student || null);
    setCurrentTeacher(teacher || null);
    
    // Redirect each user to the correct portal according to their assigned role
    if (user.role === 'admin') {
      setCurrentTab('admin-manage');
    } else if (user.role === 'teacher') {
      setCurrentTab('omr-sheet');
    } else {
      setCurrentTab('dashboard');
    }

    if (student) {
      await loadUserData(student.id);
    } else {
      await loadUserData('std_1');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentStudent(null);
    setCurrentTeacher(null);
    setActiveTest(null);
    setCurrentTab('dashboard');
  };

  const handleStartTest = async (testId?: string) => {
    const idToUse = testId || 'test_math_1';
    const res = await api.getTestById(idToUse);
    if (res.success && res.data) {
      setActiveTest(res.data);
    }
  };

  const handleFirstTimePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!firstTimeCurrentPassword.trim()) {
      setFirstTimeError('Please enter the temporary password you were assigned.');
      return;
    }
    if (firstTimeNewPassword.length < 6) {
      setFirstTimeError('Your new password must be at least 6 characters long.');
      return;
    }
    if (firstTimeNewPassword !== firstTimeConfirmPassword) {
      setFirstTimeError('New password and confirmation password do not match.');
      return;
    }
    setFirstTimeLoading(true);
    setFirstTimeError(null);
    const res = await api.changePassword(currentUser.id, firstTimeCurrentPassword.trim(), firstTimeNewPassword);
    setFirstTimeLoading(false);
    if (res.success) {
      setCurrentUser({ ...currentUser, must_change_password: false });
      setFirstTimeCurrentPassword('');
      setFirstTimeNewPassword('');
      setFirstTimeConfirmPassword('');
    } else {
      setFirstTimeError(res.error || 'Failed to update password. Please verify your temporary password.');
    }
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Active student record fallback
  const student = currentStudent || {
    id: 'std_1',
    user_id: currentUser.id,
    student_id: 'ASEH-2026-005',
    name: currentUser.name || 'Ghulam Yaseen',
    father_name: 'Muhammad Samejo',
    class: 'Class 10',
    section: 'A',
    roll_number: '05',
    profile_photo: (currentUser.role === 'admin' || currentUser.role === 'teacher')
      ? '/assets/FB_IMG_1790800525155.jpg'
      : (currentUser.avatar && currentUser.avatar !== '/assets/student_avatar.svg'
          ? currentUser.avatar
          : '/assets/FB_IMG_1790800525155.jpg'),
    date_of_birth: '2010-04-14',
    phone: '+92 300 1234567',
    gender: 'Male',
    created_at: '2026-09-01T08:00:00Z',
  };

  // Stats fallback matching reference dashboard image
  const stats = dashboardStats || {
    testsTaken: 12,
    testsTakenDelta: '↑ 3 this week',
    avgScore: 68,
    avgScoreDelta: '↑ 5%',
    studyHours: 24.5,
    studyHoursDelta: '↑ 5.2 hrs this week',
    classRank: '5 / 28',
    rankDelta: '↑ 2 positions',
    recentResults: resultsList,
  };

  // Primary Content Renderer
  const renderMainContent = () => {
    if (activeTest) {
      return (
        <TakeTestView
          test={activeTest}
          studentId={student.id}
          onBackToDashboard={() => {
            setActiveTest(null);
            loadUserData(student.id);
          }}
          onViewResults={(res) => {
            setActiveTest(null);
            loadUserData(student.id);
            setCurrentTab('results');
          }}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <StudentDashboardView
            student={student}
            stats={{
              ...stats,
              recentResults: resultsList.length > 0 ? resultsList.slice(0, 5) : stats.recentResults,
            }}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectResult={(res) => setCurrentTab('results')}
            onStartTest={(testId) => handleStartTest(testId)}
          />
        );

      case 'my-tests':
        return (
          <MyTestsView
            className={student.class}
            role={currentUser.role}
            onTakeTest={(testId) => handleStartTest(testId)}
            onCreateTest={() => setCurrentTab('create-test')}
          />
        );

      case 'create-test':
        if (currentUser.role === 'student') {
          return (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">Access Restricted</h3>
              <p className="text-xs text-slate-500">Students do not have permission to create or configure tests. You can attempt available tests from the Tests section.</p>
              <button onClick={() => setCurrentTab('my-tests')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">
                View Available Tests
              </button>
            </div>
          );
        }
        return (
          <CreateTestView
            onBack={() => setCurrentTab('my-tests')}
            onTestCreated={() => setCurrentTab('my-tests')}
          />
        );

      case 'mcq-bank':
        return <McqBankView />;

      case 'descriptive-tests':
        return <DescriptiveTestView onBack={() => setCurrentTab('dashboard')} />;

      case 'omr-sheet':
        if (currentUser.role === 'student') {
          return (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">Access Restricted</h3>
              <p className="text-xs text-slate-500">OMR sheet generation, scanning, and answer key management are reserved for Teachers and Administrators.</p>
              <button onClick={() => setCurrentTab('dashboard')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <OmrSystemView onViewResults={() => setCurrentTab('results')} currentUser={currentUser} />;

      case 'results':
        return (
          <ResultsAnalyticsView
            results={resultsList}
            student={student}
            role={currentUser.role}
            onTakeTestAgain={(testId) => handleStartTest(testId)}
          />
        );

      case 'attendance':
        return (
          <AttendanceView
            student={student}
            role={currentUser.role}
            records={attendanceRecords}
            onRefresh={() => loadUserData(student.id)}
          />
        );

      case 'study-materials':
        return <StudyMaterialsView className={student.class} role={currentUser.role} />;

      case 'profile':
        return (
          <StudentProfileView
            student={student}
            currentUser={currentUser}
            currentTeacher={currentTeacher}
            onUpdateSuccess={(updated) => {
              setCurrentStudent(updated);
              if (currentUser) {
                setCurrentUser({
                  ...currentUser,
                  avatar: updated.profile_photo || currentUser.avatar,
                  phone: updated.phone || currentUser.phone,
                });
              }
              loadUserData(updated.id);
            }}
          />
        );

      case 'students-form':
        return <StudentsFormView currentUser={currentUser} />;

      case 'admin-manage':
        return <AdminManageView />;

      default:
        return (
          <StudentDashboardView
            student={student}
            role={currentUser.role}
            stats={stats}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectResult={(res) => setCurrentTab('results')}
            onStartTest={(testId) => handleStartTest(testId)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Android View Mode Simulator Wrapper */}
      {isAndroidView ? (
        <div className="min-h-screen bg-slate-900 py-6 px-4 flex flex-col items-center justify-center">
          {/* Android Frame Top Header Bar Controls */}
          <div className="mb-3 flex items-center justify-between w-full max-w-sm px-2 text-white text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Android Mobile Simulator (Class 1–12)
            </span>
            <button
              onClick={() => setIsAndroidView(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
            >
              Exit Android View
            </button>
          </div>

          {/* Android Phone Body */}
          <div className="w-full max-w-sm h-[840px] bg-slate-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-white/20 relative flex flex-col overflow-hidden">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-8 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Android Screen Canvas */}
            <div className="w-full h-full bg-[#f8fafc] rounded-[38px] flex flex-col overflow-hidden relative pt-6">
              {/* Android Status Bar */}
              <div className="px-6 py-1 flex items-center justify-between text-[11px] font-bold text-slate-700 select-none">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Offline Status & In-app Header */}
              <OfflineStatusBanner onRefresh={() => loadUserData(student.id)} />
              <HeaderBar
                onToggleSidebar={() => setIsSidebarOpen(true)}
                currentUser={currentUser}
                onLogout={handleLogout}
                isAndroidView={isAndroidView}
                onToggleAndroidView={() => setIsAndroidView(false)}
                notifications={notifications}
                onNavigate={(tab) => {
                  setActiveTest(null);
                  setCurrentTab(tab as any);
                }}
              />

              {/* Main Scrollable Content */}
              <main className="flex-1 overflow-y-auto p-4 pb-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTest ? `test-${activeTest.id}` : currentTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full"
                  >
                    {renderMainContent()}
                  </motion.div>
                </AnimatePresence>
              </main>

              {/* Android Bottom Navigation */}
              <AndroidBottomNav
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  setActiveTest(null);
                  setCurrentTab(tab);
                }}
                isInsidePhoneSimulator={true}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Full Desktop / Tablet Dashboard Layout matching Reference Image */
        <div className="flex min-h-screen">
          {/* Left Navigation Sidebar */}
          <NavigationSidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setActiveTest(null);
              setCurrentTab(tab);
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            role={currentUser.role}
          />

          {/* Right Main Body */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Offline Status & Sticky Header */}
            <OfflineStatusBanner onRefresh={() => loadUserData(student.id)} />
            <HeaderBar
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              currentUser={currentUser}
              onLogout={handleLogout}
              isAndroidView={isAndroidView}
              onToggleAndroidView={() => setIsAndroidView(!isAndroidView)}
              notifications={notifications}
              onNavigate={(tab) => {
                setActiveTest(null);
                setCurrentTab(tab as any);
              }}
            />

            {/* Dashboard Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto pb-20 lg:pb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTest ? `test-${activeTest.id}` : currentTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full"
                >
                  {renderMainContent()}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Mobile Bottom Navigation for small screens */}
            <AndroidBottomNav
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setActiveTest(null);
                setCurrentTab(tab);
              }}
            />
          </div>
        </div>
      )}

      {/* Mandatory First-Time Password Change Modal for newly registered students */}
      {currentUser.must_change_password && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-blue-600 text-white text-center space-y-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto text-white">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg">First-Time Account Setup</h3>
              <p className="text-xs text-blue-100 max-w-xs mx-auto">
                Welcome to ATTA SAMEJO EDUCATIONAL HUB! You were issued a temporary password. Please set your permanent personal password to continue.
              </p>
            </div>

            <form onSubmit={handleFirstTimePasswordChange} className="p-6 space-y-4">
              {firstTimeError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{firstTimeError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Temporary Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={firstTimeCurrentPassword}
                    onChange={(e) => setFirstTimeCurrentPassword(e.target.value)}
                    placeholder="Enter assigned temporary password"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Permanent Password (Min. 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showFirstTimePass ? 'text' : 'password'}
                    value={firstTimeNewPassword}
                    onChange={(e) => setFirstTimeNewPassword(e.target.value)}
                    placeholder="Enter your new secure password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowFirstTimePass(!showFirstTimePass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showFirstTimePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showFirstTimePass ? 'text' : 'password'}
                  value={firstTimeConfirmPassword}
                  onChange={(e) => setFirstTimeConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={firstTimeLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
              >
                {firstTimeLoading ? (
                  <span>Saving Permanent Password...</span>
                ) : (
                  <>
                    <span>Activate Account &amp; Proceed to Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
