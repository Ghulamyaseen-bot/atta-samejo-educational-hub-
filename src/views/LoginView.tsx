import React, { useState } from 'react';
import { OfficialLogo } from '../components/OfficialLogo';
import { api } from '../api/client';
import { User, Student, Teacher, Role } from '../types';
import { 
  Lock, 
  UserCheck, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  School,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  X,
  HelpCircle,
  Mail,
  RefreshCw
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User, student?: Student, teacher?: Teacher) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('ghulam');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotRole, setForgotRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify_staff' | 'student_submitted'>('request');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);
  const [dispatchedPin, setDispatchedPin] = useState<string | null>(null);

  // Staff PIN verification & Reset form
  const [recoveryPinInput, setRecoveryPinInput] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [confirmStaffPassword, setConfirmStaffPassword] = useState('');
  const [showNewStaffPass, setShowNewStaffPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your Student ID/Username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await api.login(username, password);
    setLoading(false);

    if (res.success && res.data) {
      onLoginSuccess(res.data.user, res.data.student, res.data.teacher);
    } else {
      setErrorMessage(res.error || 'Unable to connect to server. Please check your credentials and try again.');
    }
  };

  const setPreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  // Open Forgot Password Modal
  const handleOpenForgot = () => {
    setForgotUsername(username.trim());
    setForgotError(null);
    setForgotSuccessMsg(null);
    setDispatchedPin(null);
    setRecoveryPinInput('');
    setNewStaffPassword('');
    setConfirmStaffPassword('');

    // Preselect role based on username
    if (username.toLowerCase() === 'ghulamyaseen') {
      setForgotRole('teacher');
    } else {
      setForgotRole('student');
    }
    setForgotStep('request');
    setShowForgotModal(true);
  };

  // Submit Password Recovery Request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUsername.trim()) {
      setForgotError('Please enter your registered Username or Student ID.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccessMsg(null);

    const res = await api.requestPasswordReset(forgotUsername.trim(), forgotRole);
    setForgotLoading(false);

    if (res.success && res.data) {
      setForgotSuccessMsg(res.data.message);
      if (res.data.role === 'student') {
        setForgotStep('student_submitted');
      } else {
        // Teacher or Admin account
        setDispatchedPin(res.data.recoveryPin || null);
        setForgotStep('verify_staff');
      }
    } else {
      setForgotError(res.error || 'Failed to submit password recovery request.');
    }
  };

  // Staff Reset with PIN / Master Key
  const handleStaffResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryPinInput.trim()) {
      setForgotError('Please enter the 6-digit recovery PIN or Master Recovery Key.');
      return;
    }
    if (newStaffPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newStaffPassword !== confirmStaffPassword) {
      setForgotError('New password and confirmation password do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);

    const res = await api.resetPasswordWithPin(
      forgotUsername.trim(),
      recoveryPinInput.trim(),
      newStaffPassword,
      forgotRole
    );
    setForgotLoading(false);

    if (res.success) {
      setForgotSuccessMsg('Password successfully updated! You can now sign in with your new password.');
      setPassword(newStaffPassword);
      setUsername(forgotUsername.trim());
      setTimeout(() => {
        setShowForgotModal(false);
      }, 1500);
    } else {
      setForgotError(res.error || 'Failed to reset password. Please check your recovery PIN.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Brand Header */}
        <div className="pt-8 pb-6 px-6 text-center bg-slate-50/70 border-b border-slate-100 flex flex-col items-center">
          <OfficialLogo size="lg" className="mb-2" />
          <p className="text-slate-500 text-xs mt-2 max-w-xs font-medium">
            Android Educational Assessment &amp; Student Management
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
            <School className="w-3.5 h-3.5" />
            <span>Class 1 to Class 12 Portal</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username / Student ID
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ghulamyaseen or ghulam"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Clearly Visible "Forgot Password?" Link */}
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={handleOpenForgot}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot Password?</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              <>
                <span>Sign In to Hub</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Preset Selector for Testing All Roles */}
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Permanent System Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPreset('ghulamyaseen', 'ghulamyaseen123')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold text-center transition-all flex flex-col items-center gap-0.5 shadow-xs"
              >
                <School className="w-4 h-4 text-emerald-600" />
                <span>Teacher</span>
                <span className="text-[9px] text-emerald-600 font-semibold truncate max-w-full">ghulamyaseen123</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('ghulamyaseen', 'ghulamyaseen786')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold text-center transition-all flex flex-col items-center gap-0.5 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
                <span className="text-[9px] text-purple-600 font-semibold truncate max-w-full">ghulamyaseen786</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('ghulam', 'password123')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold text-center transition-all flex flex-col items-center gap-0.5 shadow-xs"
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Student</span>
                <span className="text-[9px] text-blue-600 font-semibold truncate max-w-full">ghulam</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Teacher &amp; Admin share username <code className="text-slate-600 font-semibold">ghulamyaseen</code> with separate passwords.
            </p>
          </div>
        </form>

        {/* Footer info */}
        <div className="py-3 px-6 bg-slate-50 text-center border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          Official System of ATTA SAMEJO EDUCATIONAL HUB • Class 1–12
        </div>
      </div>

      {/* --- FORGOT PASSWORD MODAL FLOW --- */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Password Recovery Portal</h3>
                  <p className="text-[11px] text-slate-500">ATTA SAMEJO EDUCATIONAL HUB</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {forgotError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{forgotSuccessMsg}</span>
                </div>
              )}

              {/* STEP 1: INITIAL REQUEST */}
              {forgotStep === 'request' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Account Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setForgotRole('student')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          forgotRole === 'student'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotRole('teacher');
                          if (!forgotUsername) setForgotUsername('ghulamyaseen');
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          forgotRole === 'teacher'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Teacher
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotRole('admin');
                          if (!forgotUsername) setForgotUsername('ghulamyaseen');
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          forgotRole === 'admin'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {forgotRole === 'student' ? 'Student ID / Username' : 'Username'}
                    </label>
                    <input
                      type="text"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      placeholder={forgotRole === 'student' ? 'e.g. ghulam or ASEH-2026-005' : 'e.g. ghulamyaseen'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 text-sm font-medium rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                      required
                    />
                  </div>

                  {forgotRole === 'student' ? (
                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                      <p className="font-bold mb-1">Student Password Policy:</p>
                      Students cannot reset passwords without staff oversight. Submitting this request sends an official notification to your authorized teacher/admin (Sir Ghulam Yaseen) to issue a new temporary password.
                    </div>
                  ) : (
                    <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] text-purple-800 leading-relaxed">
                      <p className="font-bold mb-1">Teacher / Administrator Security:</p>
                      A secure 6-digit recovery PIN will be generated and verified, or you may use the School Master Emergency Recovery Key.
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                      {forgotLoading ? 'Processing...' : 'Continue'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2A: STUDENT SUBMITTED CONFIRMATION */}
              {forgotStep === 'student_submitted' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-800">Request Registered Successfully</h4>
                    <p className="text-xs text-slate-600">
                      Your password reset request for <span className="font-bold text-slate-800">{forgotUsername}</span> has been queued for Sir Ghulam Yaseen.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
                    <div className="font-bold text-slate-700">What to do next:</div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>Contact your Class Teacher or School Administrator.</li>
                      <li>They will issue you a new temporary password from the Student Directory.</li>
                      <li>Upon signing in with the temporary password, you will be prompted to choose a permanent password.</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Return to Login
                  </button>
                </div>
              )}

              {/* STEP 2B: STAFF VERIFY PIN & SET NEW PASSWORD */}
              {forgotStep === 'verify_staff' && (
                <form onSubmit={handleStaffResetSubmit} className="space-y-3.5">
                  {dispatchedPin && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      <span className="font-bold block">Security Recovery PIN Generated:</span>
                      <span className="font-mono font-bold text-base tracking-widest text-amber-900 block mt-1">
                        {dispatchedPin}
                      </span>
                      <span className="text-[10px] text-amber-700 mt-1 block">
                        (Simulated security dispatch to registered email: rghulamyaseen1@gmail.com)
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      6-Digit Recovery PIN or Master Key
                    </label>
                    <input
                      type="text"
                      value={recoveryPinInput}
                      onChange={(e) => setRecoveryPinInput(e.target.value)}
                      placeholder="e.g. 123456 or ASEH-ADMIN-SECURE-2026"
                      className="w-full px-3.5 py-2.5 bg-slate-50 text-sm font-mono rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Password (Min 6 Characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewStaffPass ? 'text' : 'password'}
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewStaffPass(!showNewStaffPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewStaffPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewStaffPass ? 'text' : 'password'}
                      value={confirmStaffPassword}
                      onChange={(e) => setConfirmStaffPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                      {forgotLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

