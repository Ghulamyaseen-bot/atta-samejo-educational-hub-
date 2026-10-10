import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  EyeOff, 
  Lock, 
  Sparkles,
  Smartphone,
  RefreshCw,
  User,
  GraduationCap,
  School
} from 'lucide-react';
import { api } from '../api/client';
import { User as UserType, Student, Teacher, Role } from '../types';
import { validatePakistaniPhone } from '../utils/pakistanPhone';

interface AccountOption {
  userId: string;
  name: string;
  username: string;
  role: Role;
  studentId?: string;
  className?: string;
  profilePhoto?: string;
}

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername?: string;
  onSuccessLogin?: (user: UserType, student?: Student, teacher?: Teacher) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialUsername = '',
  onSuccessLogin,
}) => {
  // Navigation Steps: 'mobile_request' | 'verify_otp' | 'success' | 'staff_pin_fallback'
  const [step, setStep] = useState<'mobile_request' | 'verify_otp' | 'success' | 'staff_pin_fallback'>('mobile_request');
  
  // Step 1: Mobile request state
  const [mobileNumber, setMobileNumber] = useState('');
  const [usernameFilter, setUsernameFilter] = useState(initialUsername);
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [requestLoading, setRequestLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Step 2: Verification state
  const [ticketId, setTicketId] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [matchedAccounts, setMatchedAccounts] = useState<AccountOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);

  // Success state
  const [resolvedUser, setResolvedUser] = useState<UserType | null>(null);
  const [resolvedStudent, setResolvedStudent] = useState<Student | undefined>(undefined);
  const [resolvedTeacher, setResolvedTeacher] = useState<Teacher | undefined>(undefined);

  // Fallback Staff PIN state
  const [staffUsername, setStaffUsername] = useState(initialUsername);
  const [staffPin, setStaffPin] = useState('');
  const [staffNewPass, setStaffNewPass] = useState('');
  const [staffConfirmPass, setStaffConfirmPass] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('mobile_request');
      setMobileNumber('');
      setUsernameFilter(initialUsername || '');
      setRoleFilter('all');
      setErrorMessage(null);
      setSuccessInfo(null);
      setOtpInput('');
      setNewPassword('');
      setConfirmPassword('');
      setSimulatedOtp('');
      setResendCooldown(45);
    }
  }, [isOpen, initialUsername]);

  // Cooldown countdown for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'verify_otp' && resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCooldown]);

  if (!isOpen) return null;

  // Step 1: Submit mobile number to request OTP
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    const clean = mobileNumber.trim();
    if (!clean) {
      setErrorMessage('Please enter your registered mobile number.');
      return;
    }

    const phoneCheck = validatePakistaniPhone(clean);
    if (!phoneCheck.isValid) {
      setErrorMessage(phoneCheck.error || 'Please enter a valid Pakistani mobile number in +92XXXXXXXXXX or 03XXXXXXXXX format.');
      return;
    }

    setRequestLoading(true);
    const roleArg = roleFilter === 'all' ? undefined : roleFilter;
    const res = await api.requestPasswordResetByMobile(clean, usernameFilter.trim() || undefined, roleArg);
    setRequestLoading(false);

    if (res.success && res.data) {
      setTicketId(res.data.ticketId);
      setMaskedPhone(res.data.maskedPhone);
      setSimulatedOtp(res.data.otpCode || '');
      setMatchedAccounts(res.data.accounts || []);
      if (res.data.accounts && res.data.accounts.length > 0) {
        setSelectedUserId(res.data.accounts[0].userId);
      }
      setResendCooldown(45);
      setStep('verify_otp');
    } else {
      setErrorMessage(res.error || 'No registered account found with this mobile number.');
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !mobileNumber) return;
    setErrorMessage(null);
    setRequestLoading(true);
    const roleArg = roleFilter === 'all' ? undefined : roleFilter;
    const res = await api.requestPasswordResetByMobile(mobileNumber.trim(), usernameFilter.trim() || undefined, roleArg);
    setRequestLoading(false);

    if (res.success && res.data) {
      setTicketId(res.data.ticketId);
      setMaskedPhone(res.data.maskedPhone);
      setSimulatedOtp(res.data.otpCode || '');
      setResendCooldown(45);
      setSuccessInfo('A new verification code has been dispatched to your mobile number.');
    } else {
      setErrorMessage(res.error || 'Failed to resend code. Please try again.');
    }
  };

  // Step 2: Verify OTP and set new password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpInput.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Password confirmation does not match.');
      return;
    }

    setVerifyLoading(true);
    const res = await api.verifyOtpAndResetPassword(ticketId, otpInput.trim(), newPassword, selectedUserId || undefined);
    setVerifyLoading(false);

    if (res.success && res.data) {
      setResolvedUser(res.data.user || null);
      setResolvedStudent(res.data.student);
      setResolvedTeacher(res.data.teacher);
      setStep('success');
    } else {
      setErrorMessage(res.error || 'Failed to verify OTP code.');
    }
  };

  // Fallback: Staff PIN Reset
  const handleStaffPinReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!staffUsername.trim()) {
      setErrorMessage('Username is required.');
      return;
    }
    if (!staffPin.trim()) {
      setErrorMessage('Recovery PIN is required.');
      return;
    }
    if (staffNewPass.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (staffNewPass !== staffConfirmPass) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStaffLoading(true);
    const res = await api.resetPasswordWithPin(staffUsername.trim(), staffPin.trim(), staffNewPass);
    setStaffLoading(false);

    if (res.success) {
      setSuccessInfo('Password updated successfully! You can now log in.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMessage(res.error || 'Staff PIN verification failed.');
    }
  };

  // Quick fill demo numbers
  const handleQuickFill = (phone: string, role?: 'student' | 'teacher' | 'admin', uname?: string) => {
    setMobileNumber(phone);
    if (role) setRoleFilter(role);
    if (uname) setUsernameFilter(uname);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                  Password Recovery
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Mobile Reset
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                ATTA SAMEJO EDUCATIONAL HUB • Class 1–12 Security
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Info Alert */}
          {successInfo && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="leading-relaxed font-medium">{successInfo}</div>
            </div>
          )}

          {/* ================= STEP 1: MOBILE REQUEST ================= */}
          {step === 'mobile_request' && (
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Reset via Registered Mobile Number</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Enter the registered mobile phone number associated with your student or staff profile. A 6-digit verification code will be dispatched to authenticate your account.
                </p>
              </div>

              {/* Registered Mobile Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Registered Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. +92 300 1234567 or 03001234567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Fill / Known Account Shortcuts for easy testing */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Select Registered Accounts:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('+92 300 1234567', 'student', 'ghulam')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    Ghulam Yaseen (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('+92 301 2345678', 'student', 'aisha')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    Aisha Khan (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('+92 300 1234567', 'teacher', 'ghulamyaseen')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    Sir Ghulam Yaseen (Teacher/Admin)
                  </button>
                </div>
              </div>

              {/* Optional: Filter by Username or Student ID */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Student ID <span className="text-slate-400 font-normal">(Optional — narrows down match)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameFilter}
                    onChange={(e) => setUsernameFilter(e.target.value)}
                    placeholder="e.g. ghulam or ASEH-2026-005"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={requestLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {requestLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying Mobile Number...
                  </span>
                ) : (
                  <>
                    <span>Send Verification Code via SMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Alternative recovery method toggle */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep('staff_pin_fallback');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Have a Master Recovery PIN or Admin Key instead?
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2: VERIFY OTP & SET PASSWORD ================= */}
          {step === 'verify_otp' && (
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              {/* SMS Dispatched Info Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>SMS Code Dispatched</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-[11px]">
                    {maskedPhone}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  A 6-digit OTP code has been transmitted to your mobile number. Enter the code below to authorize your password change.
                </p>

                {/* Simulated SMS banner for preview testability */}
                {simulatedOtp && (
                  <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-300 text-[11px] text-emerald-950 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="font-bold text-emerald-800">SMS Simulator:</span>
                      <span>Your OTP is <strong className="font-mono text-emerald-700 text-xs">{simulatedOtp}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpInput(simulatedOtp)}
                      className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}
              </div>

              {/* If multiple accounts match this phone number, let the user pick which account */}
              {matchedAccounts.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Account to Reset
                  </label>
                  <div className="space-y-1.5">
                    {matchedAccounts.map((acc) => (
                      <div
                        key={acc.userId}
                        onClick={() => setSelectedUserId(acc.userId)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedUserId === acc.userId
                            ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            acc.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            acc.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {acc.role === 'admin' ? 'A' : acc.role === 'teacher' ? 'T' : 'S'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{acc.name}</div>
                            <div className="text-[10px] text-slate-500">
                              @{acc.username} {acc.className ? `• ${acc.className}` : ''}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          acc.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          acc.role === 'teacher' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {acc.role.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6-Digit OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    6-Digit Verification Code <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || requestLoading}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 disabled:text-slate-400 cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${requestLoading ? 'animate-spin' : ''}`} />
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center tracking-[0.4em] py-2.5 px-3 bg-slate-50 text-base font-black rounded-xl border border-slate-200 focus:border-blue-600 focus:bg-white outline-none"
                  required
                  autoFocus
                />
              </div>

              {/* New Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span> (Min. 6 chars)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep('mobile_request');
                  }}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {verifyLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Password...
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 3: SUCCESS ================= */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/15">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-800">
                  Password Updated Successfully!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your credentials have been securely updated and verified via mobile authentication.
                </p>
              </div>

              {resolvedUser && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left max-w-sm mx-auto space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Details:</div>
                  <div className="text-xs font-bold text-slate-800">{resolvedUser.name}</div>
                  <div className="text-xs text-slate-600">Username: <strong className="font-mono text-blue-700">{resolvedUser.username}</strong></div>
                  <div className="text-xs text-slate-600">Role: <span className="capitalize font-semibold text-slate-700">{resolvedUser.role}</span></div>
                </div>
              )}

              <div className="space-y-2 pt-2 max-w-sm mx-auto">
                {onSuccessLogin && resolvedUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSuccessLogin(resolvedUser, resolvedStudent, resolvedTeacher);
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Sign In to Dashboard Immediately</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Return to Login Screen
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: STAFF PIN FALLBACK ================= */}
          {step === 'staff_pin_fallback' && (
            <form onSubmit={handleStaffPinReset} className="space-y-3.5">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold">Administrative Recovery Key:</span> Enter the master institutional security key (e.g. <code>ASEH-ADMIN-SECURE-2026</code> or <code>atta786</code>) or a staff PIN issued by IT administration.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Staff ID
                </label>
                <input
                  type="text"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  placeholder="e.g. ghulamyaseen"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Master Recovery Key / PIN
                </label>
                <input
                  type="text"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  placeholder="Enter recovery key or PIN"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password (Min. 6 chars)
                </label>
                <input
                  type="password"
                  value={staffNewPass}
                  onChange={(e) => setStaffNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={staffConfirmPass}
                  onChange={(e) => setStaffConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep('mobile_request');
                  }}
                  className="py-2.5 px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Back to Mobile Reset
                </button>
                <button
                  type="submit"
                  disabled={staffLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {staffLoading ? 'Resetting Password...' : 'Verify Key & Reset'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium shrink-0">
          Official Institutional Authentication • ATTA SAMEJO EDUCATIONAL HUB
        </div>
      </motion.div>
    </div>
  );
};
