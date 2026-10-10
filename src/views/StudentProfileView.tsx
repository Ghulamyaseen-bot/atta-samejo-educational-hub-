import React, { useState } from 'react';
import { Student, User, Teacher } from '../types';
import { api } from '../api/client';
import { OfficialLogo } from '../components/OfficialLogo';
import officialAdminPortrait from '../assets/FB_IMG_1790800525155.jpg';
import { 
  User as UserIcon, 
  Lock, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  School,
  Camera,
  KeyRound,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Check
} from 'lucide-react';

interface StudentProfileViewProps {
  student: Student;
  currentUser?: User | null;
  currentTeacher?: Teacher | null;
  onUpdateSuccess: (updated: Student) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  currentUser,
  currentTeacher,
  onUpdateSuccess,
}) => {
  const activeUser = currentUser || api.getCurrentUser();
  const role = activeUser?.role || 'student';

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Contact details form
  const [phone, setPhone] = useState(student.phone || '');
  const initialPhoto = (role === 'admin' || role === 'teacher')
    ? '/assets/FB_IMG_1790800525155.jpg'
    : (student.profile_photo && student.profile_photo !== '/assets/student_avatar.svg'
        ? student.profile_photo
        : (activeUser?.avatar && activeUser.avatar !== '/assets/student_avatar.svg'
            ? activeUser.avatar
            : '/assets/FB_IMG_1790800525155.jpg'));

  const [currentPhoto, setCurrentPhoto] = useState<string>(initialPhoto);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Handle immediate photo selection and preview
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG).');
      return;
    }

    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        // Appears immediately after selecting it
        setCurrentPhoto(dataUrl);

        // Auto-save immediately so the picture persists across refreshes and logins
        try {
          const res = await api.updateStudent(student.id, {
            profile_photo: dataUrl,
          });
          if (res.success && res.data) {
            onUpdateSuccess(res.data);
            setProfileSuccessMsg('Profile photograph updated successfully.');
            setTimeout(() => setProfileSuccessMsg(null), 3000);
          }
        } catch (err) {
          console.error('Failed to auto-save photograph', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Password rules validation
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = currentPassword.length > 0 && newPassword.length > 0 && currentPassword !== newPassword;

  const handleSavePermitted = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);

    const res = await api.updateStudent(student.id, {
      phone,
      profile_photo: currentPhoto,
    });

    setIsSavingProfile(false);
    if (res.success && res.data) {
      setProfileSuccessMsg('Profile contact information updated successfully.');
      onUpdateSuccess(res.data);
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!activeUser) {
      setPasswordError('No active user account found.');
      return;
    }

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!hasMinLength) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setIsChangingPassword(true);
    const res = await api.changePassword(activeUser.id, currentPassword, newPassword);
    setIsChangingPassword(false);

    if (res.success) {
      setPasswordSuccess('Your password has been changed successfully. You can now use your new password for all future logins.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 6000);
    } else {
      setPasswordError(res.error || 'Failed to update password. Please verify your current password.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group shrink-0">
          {role === 'student' && (
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
            />
          )}
          <div 
            onClick={() => {
              if (role === 'student') {
                fileInputRef.current?.click();
              }
            }}
            title={role === 'student' ? "Click to select new profile photograph" : "Official Educational Hub Portrait"}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-md relative ${
              role === 'student' ? 'cursor-pointer group transition-transform hover:scale-105' : ''
            } ${
              role === 'admin'
                ? 'ring-4 ring-amber-300 bg-slate-900'
                : role === 'teacher'
                ? 'ring-4 ring-blue-300 bg-slate-900'
                : 'ring-4 ring-emerald-300 bg-emerald-50'
            }`}
          >
            <img
              src={
                (role === 'admin' || role === 'teacher')
                  ? '/assets/FB_IMG_1790800525155.jpg'
                  : (currentPhoto && currentPhoto !== '/assets/student_avatar.svg' ? currentPhoto : '/assets/FB_IMG_1790800525155.jpg')
              }
              alt={activeUser?.name || student.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.src = '/assets/FB_IMG_1790800525155.jpg';
              }}
              referrerPolicy="no-referrer"
            />
            {/* Hover overlay to change picture strictly for students */}
            {role === 'student' && (
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold p-1">
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Change Photo</span>
              </div>
            )}
          </div>
          <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl text-white shadow-md ${
            role === 'admin' ? 'bg-purple-600' : role === 'teacher' ? 'bg-emerald-600' : 'bg-blue-600'
          }`}>
            {role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : role === 'teacher' ? <School className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              role === 'admin' 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : role === 'teacher' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              <School className="w-3.5 h-3.5" />
              <span>{role === 'admin' ? 'Official Hub Administrator' : role === 'teacher' ? 'Faculty Specialist' : 'Registered Student'}</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              User: @{activeUser?.username || 'user'}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-800">
            {role === 'teacher' ? (currentTeacher?.name || activeUser?.name || 'Sir Ghulam Yaseen') : activeUser?.name || student.name}
          </h2>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium">
            {role === 'student' ? (
              <>
                <span className="font-bold text-slate-700">ID: {student.student_id}</span>
                <span>•</span>
                <span className="font-bold text-blue-600">{student.class} - Section {student.section}</span>
                <span>•</span>
                <span className="font-semibold text-slate-600">Roll No: {student.roll_number}</span>
              </>
            ) : role === 'teacher' ? (
              <>
                <span className="font-bold text-slate-700">Teacher ID: {currentTeacher?.teacher_id || 'TCH-GY-101'}</span>
                <span>•</span>
                <span className="font-bold text-emerald-600">{currentTeacher?.qualification || 'M.Sc. Mathematics'}</span>
                <span>•</span>
                <span className="font-semibold text-slate-600">Classes: 9, 10, 11, 12</span>
              </>
            ) : (
              <>
                <span className="font-bold text-purple-700">Administrator Clearance: Full Authority</span>
                <span>•</span>
                <span className="font-semibold text-slate-600">ATTA SAMEJO EDUCATIONAL HUB</span>
              </>
            )}
          </div>
        </div>

        {/* Tab Selector in Header */}
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'password'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: PROFILE DETAILS --- */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Protected Institutional Academic Record */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Institutional Record</span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3" /> Official
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Institution</span>
                <span className="text-xs font-extrabold text-slate-800">ATTA SAMEJO EDUCATIONAL HUB</span>
              </div>

              {role === 'student' ? (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Father / Guardian Name</span>
                    <span className="text-xs font-bold text-slate-800">{student.father_name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Enrolled Class</span>
                      <span className="text-xs font-bold text-slate-800">{student.class}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Section</span>
                      <span className="text-xs font-bold text-slate-800">Section {student.section}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Roll Number</span>
                      <span className="text-xs font-bold text-slate-800">{student.roll_number}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Date of Birth</span>
                      <span className="text-xs font-bold text-slate-800">{student.date_of_birth}</span>
                    </div>
                  </div>
                </>
              ) : role === 'teacher' ? (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Teacher ID</span>
                    <span className="text-xs font-bold text-slate-800">{currentTeacher?.teacher_id || 'TCH-GY-101'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Subjects</span>
                    <span className="text-xs font-bold text-emerald-700">Mathematics, General Science, Physics</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Teaching Classes</span>
                    <span className="text-xs font-bold text-slate-800">Class 9, Class 10, Class 11, Class 12</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Access Role</span>
                    <span className="text-xs font-bold text-purple-700">Hub Administrator &amp; Academic Director</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Permitted Operations</span>
                    <span className="text-xs font-semibold text-slate-700">Manage Students, Issue Credentials, Reset Passwords, OMR Management</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Permitted Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span>Contact &amp; Display Settings</span>
              </h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Personal
              </span>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePermitted} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Contact Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 focus:bg-white text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>


              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Profile Photograph
                </label>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                    <img
                      src={currentPhoto || officialAdminPortrait || '/assets/FB_IMG_1790800525155.jpg'}
                      alt="Student Portrait"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Personal Photograph</p>
                    <p className="text-[10px] text-slate-500">JPG, PNG supported</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Select Photo</span>
                  </button>
                </div>
                {photoError && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{photoError}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {isSavingProfile ? 'Updating...' : 'Save Profile & Photograph'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Need to update your password?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('password')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Change Password →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 2: CHANGE PASSWORD --- */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Change Account Password</h3>
                <p className="text-xs text-slate-500">
                  Update your authentication credentials for <span className="font-bold text-slate-700">@{activeUser?.username}</span>
                </p>
              </div>
            </div>
          </div>

          {passwordError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">Password Changed Successfully!</span>
                <span className="mt-0.5 block">{passwordSuccess}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* 1. Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-sm font-medium rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2. New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-sm font-medium rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-sm font-medium rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Validation Checklist */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Password Requirements:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    hasMinLength ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {hasMinLength ? '✓' : '•'}
                  </div>
                  <span>At least 6 characters</span>
                </div>

                <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    passwordsMatch ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {passwordsMatch ? '✓' : '•'}
                  </div>
                  <span>Passwords match exactly</span>
                </div>

                <div className={`flex items-center gap-2 ${isDifferentFromCurrent ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isDifferentFromCurrent ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isDifferentFromCurrent ? '✓' : '•'}
                  </div>
                  <span>Different from current</span>
                </div>

                <div className={`flex items-center gap-2 ${hasLetter && hasNumber ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    hasLetter && hasNumber ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {hasLetter && hasNumber ? '✓' : '•'}
                  </div>
                  <span>Letters and numbers</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError(null);
                }}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isChangingPassword ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Save New Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
