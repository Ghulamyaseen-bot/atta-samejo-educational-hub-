import React, { useState, useRef } from 'react';
import { OfficialLogo } from '../components/OfficialLogo';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { api } from '../api/client';
import { User, Student, Teacher } from '../types';
import { validatePakistaniPhone } from '../utils/pakistanPhone';
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
  Camera,
  Upload,
  Phone,
  User as UserIcon
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User, student?: Student, teacher?: Teacher) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state — strictly EMPTY by default
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Student Registration form state
  const [regName, setRegName] = useState('');
  const [regFatherName, setRegFatherName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regClass, setRegClass] = useState('Class 10');
  const [regSection, setRegSection] = useState('A');
  const [regStudentId, setRegStudentId] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhoto, setRegPhoto] = useState<string>('');
  const [regPhotoPreview, setRegPhotoPreview] = useState<string | null>(null);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Handle Photo selection for Registration
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setRegError('Please upload a valid image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setRegPhoto(dataUrl);
        setRegPhotoPreview(dataUrl);
        setRegError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sign In submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await api.login(username.trim(), password);
    setLoading(false);

    if (res.success && res.data) {
      onLoginSuccess(res.data.user, res.data.student, res.data.teacher);
    } else {
      // Clear password field and display strict error message
      setPassword('');
      setErrorMessage('Invalid username or password.');
    }
  };

  // Student Registration submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Form validations
    if (!regName.trim()) {
      setRegError('Full Name is required.');
      return;
    }
    if (!regFatherName.trim()) {
      setRegError('Father/Guardian Name is required.');
      return;
    }
    // Strict Pakistani mobile number validation (+92XXXXXXXXXX or 03XXXXXXXXX)
    const phoneCheck = validatePakistaniPhone(regPhone);
    if (!phoneCheck.isValid) {
      setRegError(phoneCheck.error || 'Please enter a valid Pakistani mobile number in +92XXXXXXXXXX or 03XXXXXXXXX format.');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Username is required.');
      return;
    }
    if (regUsername.trim().length < 3) {
      setRegError('Username must be at least 3 characters long.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Password and confirmation password do not match.');
      return;
    }
    // Mandatory student photograph requirement
    if (!regPhoto || !regPhoto.trim()) {
      setRegError('Profile photo is required to complete registration.');
      return;
    }
    const studentPhoto = regPhoto.trim();

    setRegLoading(true);
    const res = await api.registerStudent({
      name: regName.trim(),
      father_name: regFatherName.trim(),
      phone: regPhone.trim(),
      class: regClass,
      section: regSection,
      student_id: regStudentId.trim() || undefined,
      username: regUsername.trim(),
      password: regPassword,
      profile_photo: studentPhoto,
    });
    setRegLoading(false);

    if (res.success && res.data) {
      setRegSuccess('Student account created successfully! Signing in...');
      setTimeout(() => {
        onLoginSuccess(res.data!.user, res.data!.student);
      }, 1000);
    } else {
      setRegError(res.error || 'Registration failed. Please check your information and try again.');
    }
  };

  // Open Forgot Password Modal
  const handleOpenForgot = () => {
    setShowForgotModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      {/* Container */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Brand Header */}
        <div className="pt-8 pb-5 px-6 text-center bg-slate-50/70 border-b border-slate-100 flex flex-col items-center">
          <OfficialLogo size="lg" className="mb-2" />
          <p className="text-slate-500 text-xs mt-1 max-w-xs font-medium">
            Android Educational Assessment &amp; Student Management
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
            <School className="w-3.5 h-3.5" />
            <span>Classes 1–12 Institutional System</span>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Student Registration */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setRegError(null);
              setRegSuccess(null);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>New Student Registration</span>
          </button>
        </div>

        {/* --- SIGN IN FORM --- */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
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
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your username or Student ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                  required
                  autoComplete="off"
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                  required
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Note on Student Account creation */}
            <div className="pt-4 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Are you a new student?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* --- STUDENT REGISTRATION FORM --- */
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
            {regError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* Mandatory Student Photo Upload During Registration */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
              !regPhotoPreview ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <label className="block text-xs font-extrabold text-slate-800">
                  Student Profile Picture <span className="text-rose-600 font-extrabold">* (Compulsory)</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 max-w-xs">
                Upload your official portrait once during registration. It is saved permanently to your profile and student records.
              </p>

              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
              />

              <div 
                onClick={() => photoInputRef.current?.click()}
                className={`relative group w-24 h-28 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden cursor-pointer shadow-xs transition-all ${
                  regPhotoPreview 
                    ? 'border-blue-500 bg-slate-100 ring-2 ring-blue-500/20' 
                    : 'border-dashed border-amber-300 hover:border-blue-500 bg-white hover:bg-slate-50'
                }`}
              >
                {regPhotoPreview ? (
                  <img
                    src={regPhotoPreview}
                    alt="Student Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-slate-500">
                    <Camera className="w-7 h-7 mb-1 text-amber-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-[10px] font-bold text-center leading-tight text-slate-700">Select Photo *</span>
                    <span className="text-[8px] text-rose-500 font-semibold mt-0.5">Required</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                  {regPhotoPreview ? 'Change Photo' : 'Upload'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{regPhotoPreview ? 'Change Selected Photo' : 'Upload Profile Photo (Required)'}</span>
              </button>
              <p className="text-[10px] text-slate-500 font-medium mt-1.5">
                PNG, JPG or WebP • Profile photo is required to complete registration.
              </p>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Aisha Khan"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Father / Guardian Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regFatherName}
                  onChange={(e) => setRegFatherName(e.target.value)}
                  placeholder="Father's full name"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
              </div>
            </div>

            {/* Contact & Class */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+923001234567 or 03001234567"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Format: <span className="font-semibold text-slate-600">+92XXXXXXXXXX</span> or <span className="font-semibold text-slate-600">03XXXXXXXXX</span> (11 digits)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enrolled Class <span className="text-rose-500">*</span>
                </label>
                <select
                  value={regClass}
                  onChange={(e) => setRegClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:border-blue-600 outline-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={regSection}
                  onChange={(e) => setRegSection(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:border-blue-600 outline-none cursor-pointer"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            {/* Student ID (Optional/Custom) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student ID / Roll Reference (Optional)
              </label>
              <input
                type="text"
                value={regStudentId}
                onChange={(e) => setRegStudentId(e.target.value)}
                placeholder="Leave blank to auto-generate (e.g. ASEH-2026-006)"
                className="w-full px-3.5 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
              />
            </div>

            {/* Account Credentials created by Student */}
            <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 space-y-3">
              <div className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Create Student Login Credentials</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Desired Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. aisha_khan"
                    className="w-full pl-9 pr-3 py-2 bg-white text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password (Min. 6 chars) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 pr-8 py-2 bg-white text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer"
            >
              {regLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Student Account...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Student Registration</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="py-3 px-6 bg-slate-50 text-center border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          Official System of ATTA SAMEJO EDUCATIONAL HUB • Class 1–12
        </div>
      </div>

      {/* --- FORGOT PASSWORD MODAL COMPONENT (Mobile Number Recovery) --- */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialUsername={username.trim()}
        onSuccessLogin={(user, student, teacher) => {
          onLoginSuccess(user, student, teacher);
        }}
      />
    </div>
  );
};
