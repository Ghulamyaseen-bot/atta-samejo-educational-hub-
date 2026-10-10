import React, { useState, useEffect } from 'react';
import { Student, PasswordRecoveryTicket, User } from '../types';
import { api } from '../api/client';
import { validatePakistaniPhone } from '../utils/pakistanPhone';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  X, 
  Filter,
  GraduationCap,
  KeyRound,
  ShieldAlert,
  AlertCircle,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

interface StudentsFormViewProps {
  currentUser?: User | null;
}

export const StudentsFormView: React.FC<StudentsFormViewProps> = ({ currentUser }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [tickets, setTickets] = useState<PasswordRecoveryTicket[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Reset password modal for a student
  const [studentToReset, setStudentToReset] = useState<Student | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('temp123');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [section, setSection] = useState('A');
  const [rollNumber, setRollNumber] = useState('');
  const [studentUsername, setStudentUsername] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('temp123');
  const [showTempPass, setShowTempPass] = useState(false);
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('2010-01-01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sRes = await api.getStudents();
    if (sRes.success && sRes.data) {
      setStudents(sRes.data);
    }
    const tRes = await api.getPasswordRecoveryTickets();
    if (tRes.success && tRes.data) {
      setTickets(tRes.data);
    }
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setName('');
    setFatherName('');
    setClassName('Class 10');
    setSection('A');
    const nextRoll = (students.length + 1).toString().padStart(2, '0');
    setRollNumber(nextRoll);
    setStudentUsername(`ASEH-2026-${Math.floor(100 + Math.random() * 900)}`);
    setTemporaryPassword('temp123');
    setPhone('');
    setDob('2010-01-01');
    setGender('Male');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setName(s.name);
    setFatherName(s.father_name);
    setClassName(s.class);
    setSection(s.section);
    setRollNumber(s.roll_number);
    setStudentUsername(s.student_id);
    setTemporaryPassword('');
    setPhone(s.phone || '');
    setDob(s.date_of_birth);
    setGender(s.gender);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate Pakistani phone number if provided or required
    if (phone.trim()) {
      const phoneCheck = validatePakistaniPhone(phone.trim());
      if (!phoneCheck.isValid) {
        setFormError(phoneCheck.error || 'Please enter a valid Pakistani mobile number in +92XXXXXXXXXX or 03XXXXXXXXX format.');
        return;
      }
    }

    if (editingStudent) {
      await api.updateStudent(editingStudent.id, {
        name,
        father_name: fatherName,
        class: className,
        section,
        roll_number: rollNumber,
        phone: phone.trim() ? validatePakistaniPhone(phone.trim()).display || phone.trim() : '',
        date_of_birth: dob,
        gender,
      });
    } else {
      // Create student with assigned Username / Student ID and Temporary Password
      const assignedUsername = studentUsername.trim() || `ASEH-2026-${Math.floor(100 + Math.random() * 900)}`;
      const assignedTempPass = temporaryPassword.trim() || 'temp123';

      await api.createStudentWithCredentials(
        {
          student_id: assignedUsername,
          name,
          father_name: fatherName,
          class: className,
          section,
          roll_number: rollNumber,
          profile_photo: '/assets/student_avatar.svg',
          date_of_birth: dob,
          phone: phone.trim() ? validatePakistaniPhone(phone.trim()).display || phone.trim() : '+92 300 1234567',
          gender,
        },
        assignedUsername,
        assignedTempPass
      );
    }
    setShowAddModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (currentUser?.role !== 'admin') {
      alert('Access restricted: Only administrators have permission to remove student accounts.');
      return;
    }
    if (confirm('Are you sure you want to remove this student record?')) {
      await api.deleteStudent(id);
      loadData();
    }
  };

  const handleOpenResetPassword = (s: Student) => {
    setStudentToReset(s);
    setNewTempPassword(`temp${Math.floor(100 + Math.random() * 900)}`);
    setResetSuccessMessage(null);
    setResetErrorMessage(null);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToReset) return;

    if (!newTempPassword || newTempPassword.length < 6) {
      setResetErrorMessage('Temporary password must be at least 6 characters long.');
      return;
    }

    const res = await api.resetStudentPasswordByStaff(studentToReset.id, newTempPassword);
    if (res.success) {
      setResetSuccessMessage(`Temporary password set to "${newTempPassword}". The student will be prompted to change it upon first login.`);
      loadData();
      setTimeout(() => {
        setStudentToReset(null);
      }, 3000);
    } else {
      setResetErrorMessage(res.error || 'Failed to reset student password.');
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    const tempPass = `temp${Math.floor(100 + Math.random() * 900)}`;
    const res = await api.resolvePasswordRecoveryTicket(ticketId, tempPass);
    if (res.success) {
      alert(`Recovery request approved! Temporary password assigned: "${tempPass}". Please share this with the student.`);
      loadData();
    }
  };

  const pendingTickets = tickets.filter(t => t.status === 'pending');

  const filtered = students.filter(s => {
    const matchClass = selectedClass === 'all' || s.class === selectedClass;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.roll_number.includes(searchQuery);
    return matchClass && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              Students Registry &amp; Account Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official enrollment, credential provisioning, and password recovery control (Class 1 to 12).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Pending Password Reset Requests Alert Banner */}
      {pendingTickets.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="text-xs font-extrabold text-amber-900">
                Pending Student Password Reset Requests ({pendingTickets.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pendingTickets.map(ticket => (
              <div key={ticket.id} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="text-xs font-bold text-slate-800">{ticket.student_name || ticket.username}</div>
                  <div className="text-[11px] text-slate-500">ID: {ticket.username} • {ticket.class_name}</div>
                </div>
                <button
                  onClick={() => handleResolveTicket(ticket.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs cursor-pointer shrink-0"
                >
                  Issue Temp Password
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <label className="text-xs font-bold text-slate-600">Filter Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Classes (1 to 12)</option>
            {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, ID, roll no..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Student ID / Login</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 text-center">Roll No</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-right">Actions &amp; Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 overflow-hidden ring-1 ring-slate-200 shrink-0">
                        <img src={s.profile_photo || '/assets/student_avatar.svg'} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">{s.student_id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{s.class} ({s.section})</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">{s.roll_number}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.father_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{s.phone || '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenResetPassword(s)}
                          title="Reset student password"
                          className="px-2.5 py-1 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reset Password</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Edit student record"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(s.id)}
                            title="Delete student (Admin only)"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Student (With Student ID & Temporary Password assignment) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-800">
                  {editingStudent ? 'Edit Student Record' : 'Register New Student'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {editingStudent ? 'Update student details.' : 'Create school student profile and credentials.'}
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bilal Ahmed"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Muhammad Samejo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Login Credentials Section (Assigned by Teacher/Admin) */}
              {!editingStudent && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                    <span>Login Credentials (Assigned by Staff)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Student ID / Username *</label>
                      <input
                        type="text"
                        value={studentUsername}
                        onChange={(e) => setStudentUsername(e.target.value)}
                        placeholder="e.g. ASEH-2026-009"
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-mono font-bold text-blue-800 focus:border-blue-600 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Temporary Password *</label>
                      <div className="relative">
                        <input
                          type={showTempPass ? 'text' : 'password'}
                          value={temporaryPassword}
                          onChange={(e) => setTemporaryPassword(e.target.value)}
                          placeholder="e.g. temp123"
                          className="w-full px-3 pr-8 py-2 bg-white border border-blue-200 rounded-xl text-xs font-mono font-semibold focus:border-blue-600 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowTempPass(!showTempPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showTempPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-700 leading-snug">
                    Student will be required to change this temporary password upon first login.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class (1 to 12) *</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 outline-none"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 05"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+923001234567 or 03001234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Format: +92XXXXXXXXXX or 03XXXXXXXXX</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Register & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Staff Reset Student Password */}
      {studentToReset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Reset Student Password</h4>
                  <p className="text-[11px] text-slate-500">Authorized Staff Security Action</p>
                </div>
              </div>
              <button onClick={() => setStudentToReset(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resetErrorMessage}</span>
              </div>
            )}

            {resetSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800">{studentToReset.name}</div>
                <div className="text-slate-500">Student ID / Login: <span className="font-mono text-blue-600 font-bold">{studentToReset.student_id}</span></div>
                <div className="text-slate-500">{studentToReset.class} • Roll No: {studentToReset.roll_number}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Temporary Password (Min. 6 chars)
                </label>
                <input
                  type="text"
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  placeholder="e.g. temp456"
                  className="w-full px-3.5 py-2.5 bg-slate-50 font-mono text-xs font-bold text-slate-800 rounded-xl border border-slate-200 focus:border-amber-500 outline-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  The student must change this password on their next login attempt.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStudentToReset(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Confirm &amp; Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
