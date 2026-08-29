'use client';

import { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Bed,
  HeartPulse,
  Calendar,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  department: string;
  attendingPhysician: string;
  triageLevel: 'CRITICAL' | 'URGENT' | 'STABLE';
  roomNumber: string;
  admitDate: string;
  insuranceStatus: 'VERIFIED' | 'SELF_PAY' | 'PENDING';
}

const initialPatients: Patient[] = [
  {
    id: 'PT-8942',
    name: 'Eleanor Vance',
    age: 64,
    gender: 'Female',
    department: 'Cardiology',
    attendingPhysician: 'Dr. Marcus Webb (Chief of Card)',
    triageLevel: 'URGENT',
    roomNumber: 'Ward 4B - Bed 12',
    admitDate: '2026-08-28',
    insuranceStatus: 'VERIFIED',
  },
  {
    id: 'PT-8943',
    name: 'Carlos Mendoza',
    age: 38,
    gender: 'Male',
    department: 'Orthopedics',
    attendingPhysician: 'Dr. Sarah Jenkins',
    triageLevel: 'STABLE',
    roomNumber: 'Ward 2A - Bed 04',
    admitDate: '2026-08-29',
    insuranceStatus: 'VERIFIED',
  },
  {
    id: 'PT-8944',
    name: 'Amina Al-Mansoor',
    age: 29,
    gender: 'Female',
    department: 'Neurology',
    attendingPhysician: 'Dr. David Cho',
    triageLevel: 'CRITICAL',
    roomNumber: 'ICU Suite 02',
    admitDate: '2026-08-29',
    insuranceStatus: 'VERIFIED',
  },
  {
    id: 'PT-8945',
    name: 'Robert Sterling',
    age: 52,
    gender: 'Male',
    department: 'Emergency Care',
    attendingPhysician: 'Dr. Rachel Green',
    triageLevel: 'STABLE',
    roomNumber: 'Observation B-08',
    admitDate: '2026-08-29',
    insuranceStatus: 'PENDING',
  },
];

const initialAppointments = [
  { id: 'APT-101', patient: 'Arthur Pendelton', time: '10:30 AM', doctor: 'Dr. Marcus Webb', type: 'Post-Op Echo Followup', status: 'CONFIRMED' },
  { id: 'APT-102', patient: 'Maya Lin', time: '11:15 AM', doctor: 'Dr. Sarah Jenkins', type: 'MRI Knee Assessment', status: 'IN_ROOM' },
  { id: 'APT-103', patient: 'Daniel Kim', time: '01:45 PM', doctor: 'Dr. David Cho', type: 'EEG Neuro-Scan Review', status: 'SCHEDULED' },
  { id: 'APT-104', patient: 'Fatima Zahra', time: '02:30 PM', doctor: 'Dr. Elena Rostova', type: 'Pediatric Vaccine & Check', status: 'SCHEDULED' },
];

export function HospitalClient() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [search, setSearch] = useState('');
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newDept, setNewDept] = useState('Cardiology');
  const [newTriage, setNewTriage] = useState<'CRITICAL' | 'URGENT' | 'STABLE'>('URGENT');
  const [newRoom, setNewRoom] = useState('Ward 3C - Bed 01');

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdmitPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAge) return;

    const newPatient: Patient = {
      id: `PT-${Math.floor(8950 + Math.random() * 50)}`,
      name: newName,
      age: parseInt(newAge) || 30,
      gender: 'Other',
      department: newDept,
      attendingPhysician: 'Dr. On-Duty Specialist',
      triageLevel: newTriage,
      roomNumber: newRoom,
      admitDate: new Date().toISOString().split('T')[0],
      insuranceStatus: 'VERIFIED',
    };

    setPatients([newPatient, ...patients]);
    setIsAdmitModalOpen(false);
    setNewName('');
    setNewAge('');
    setAlert(`🏥 Inpatient ${newName} admitted to ${newDept} (${newRoom}) successfully!`);
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              HEALTHCARE & HOSPITAL ERP
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <Stethoscope className="text-rose-400" size={24} />
            Clinical Operations & Patient Care Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ER bed management, EHR patient records, clinical consultation triage, and HIPAA-compliant audit logs.
          </p>
        </div>

        <button
          onClick={() => setIsAdmitModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-500/25 active:scale-[0.98] border border-rose-400/40 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={15} />
          <span>Admit Inpatient</span>
        </button>
      </div>

      {/* Hospital KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bed Occupancy Rate</span>
            <Bed size={18} className="text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">86.4%</div>
          <div className="text-xs text-rose-400 mt-2 font-bold">142 of 165 Beds Occupied</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active ER Triage Queue</span>
            <HeartPulse size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{patients.length} Active</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Avg wait time: 14 mins</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Consultations Today</span>
            <Calendar size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">48 Appts</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">Across 8 Medical Specialties</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">HIPAA Audit Compliance</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">100% SECURE</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">End-to-End EHR Encrypted</div>
        </div>
      </div>

      {/* Main Grid: Patient Registry & Appointment Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inpatients & Triage Registry (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by patient name, ID, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-medium"
            />
          </div>

          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4">Patient EHR ID & Name</th>
                  <th className="px-6 py-4">Department & Doctor</th>
                  <th className="px-6 py-4">Triage Level</th>
                  <th className="px-6 py-4">Room / Ward</th>
                  <th className="px-6 py-4 text-right">Insurance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-xs text-white">{p.name}</div>
                      <div className="text-[11px] font-mono text-rose-400 font-semibold">{p.id} · {p.age}y</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-white">{p.department}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{p.attendingPhysician}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.triageLevel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : p.triageLevel === 'URGENT'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {p.triageLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-300">
                      {p.roomNumber}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/[0.08] text-slate-300 border border-white/10">
                        {p.insuranceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Today's Appointments & Consultations (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-rose-400" />
                <span>Today's Consultation Schedule</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Sync</span>
            </h3>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{apt.patient}</span>
                    <span className="font-mono text-[11px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                      {apt.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">{apt.type}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-white/[0.06]">
                    <span>{apt.doctor}</span>
                    <span className="font-bold text-emerald-400">{apt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admit Patient Modal */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Admit Inpatient to Medical Center</h2>
              <button onClick={() => setIsAdmitModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdmitPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jonathan Morris"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    placeholder="42"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Triage Priority</label>
                  <select
                    value={newTriage}
                    onChange={(e: any) => setNewTriage(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-medium"
                  >
                    <option value="STABLE">Stable</option>
                    <option value="URGENT">Urgent</option>
                    <option value="CRITICAL">Critical (ICU)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-medium"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Emergency Care">Emergency Care</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Room</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-rose-500/25 cursor-pointer"
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
