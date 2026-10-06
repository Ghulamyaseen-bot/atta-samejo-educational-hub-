import React, { useState } from 'react';
import { AttendanceRecord, Student, Role } from '../types';
import { api } from '../api/client';
import { 
  CalendarCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface AttendanceViewProps {
  student: Student;
  role: Role;
  records: AttendanceRecord[];
  onRefresh: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  student,
  role,
  records,
  onRefresh,
}) => {
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState<'present' | 'absent' | 'leave'>('present');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const leaveCount = records.filter(r => r.status === 'leave').length;
  const totalDays = records.length;
  const attendancePercentage = totalDays > 0
    ? Math.round((presentCount / totalDays) * 1000) / 10
    : 100;

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await api.markAttendance({
      student_id: student.id,
      class_name: student.class,
      date: newDate,
      status: newStatus,
      remarks: remarks || undefined,
    });
    setIsSubmitting(false);
    setShowMarkModal(false);
    setRemarks('');
    onRefresh();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CalendarCheck className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              Student Attendance Record
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official daily school attendance log for {student.name} ({student.class} - {student.section}).
          </p>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <button
            onClick={() => setShowMarkModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Daily Attendance</span>
          </button>
        )}
      </div>

      {/* 4 Summary Stat Cards matching school prompt specifications */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Attendance Percentage */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Attendance Percentage</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {attendancePercentage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Standard: 75% required</div>
        </div>

        {/* Present Days */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Present Days</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mt-2">
            {presentCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Active classes attended</div>
        </div>

        {/* Absent Days */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Absent Days</span>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">
            {absentCount}
          </div>
          <div className="text-[11px] text-rose-500 font-semibold mt-1">Unexcused absences</div>
        </div>

        {/* Authorized Leaves */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Approved Leaves</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mt-2">
            {leaveCount}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Official parent notices</div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-800">Attendance Activity Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.date}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{r.class_name}</td>
                    <td className="py-3 px-4">
                      {r.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present
                        </span>
                      ) : r.status === 'absent' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" /> Absent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> Leave
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic">
                      {r.remarks || 'Regular school session'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal (Teachers & Admins) */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h4 className="text-lg font-extrabold text-slate-800">Mark Student Attendance</h4>
            <form onSubmit={handleMarkAttendance} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['present', 'absent', 'leave'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewStatus(s)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                        newStatus === s
                          ? s === 'present'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : s === 'absent'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-amber-500 text-white border-amber-500'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Approved medical leave"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
