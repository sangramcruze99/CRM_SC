// apps/web-core/src/app/industry/hospital/HospitalClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Stethoscope,
  X,
  User,
  Hash,
  Building,
  Bed,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { DigitalRxPrescriptionMaker } from '@/components/industry/DigitalRxPrescriptionMaker';
import { UniversalDashboard } from '@/components/dashboard/UniversalDashboard';
import { getDashboardConfig } from '@/components/dashboard/dashboardConfig';
import { DashboardAttentionItem } from '@/components/dashboard/dashboard.types';
import { useIndustry } from '@/components/industry/IndustryContext';

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

export function HospitalClient() {
  const { activeServiceIds } = useIndustry();
  const [mounted, setMounted] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalBeds: 165,
    occupiedBeds: 78,
    occupancyRate: '47.2%',
    activeErQueue: 1,
    todayAppointments: 8,
    prescriptionsIssued: 4,
  });
  const [role, setRole] = useState('admin');
  const [mode, setMode] = useState<'OPERATIONS' | 'ANALYTICS'>('OPERATIONS');
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newDept, setNewDept] = useState('Cardiology');
  const [newTriage, setNewTriage] = useState<'CRITICAL' | 'URGENT' | 'STABLE'>('URGENT');
  const [newRoom, setNewRoom] = useState('Ward 3C - Bed 01');

  const fetchHospitalData = async () => {
    try {
      const res = await fetch('/api/niche/hospital');
      if (res.ok) {
        const json = await res.json();
        if (json.data?.patients) setPatients(json.data.patients);
        if (json.data?.appointments) setAppointments(json.data.appointments);
        if (json.metrics) setMetrics(json.metrics);
      }
    } catch (e) {
      console.error('Failed to fetch hospital data:', e);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchHospitalData();
  }, []);

  const handleAdmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAge) return;

    try {
      const res = await fetch('/api/niche/hospital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admit_patient',
          payload: {
            name: newName,
            age: parseInt(newAge) || 30,
            department: newDept,
            triageLevel: newTriage,
            roomNumber: newRoom,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.record) {
          setPatients((prev) => [json.record, ...prev]);
        }
        fetchHospitalData();
      }
    } catch (err) {
      console.error('Admit patient failed:', err);
    }

    setIsAdmitModalOpen(false);
    setNewName('');
    setNewAge('');
    setAlert(`Inpatient ${newName} admitted to ${newDept} (${newRoom}) successfully! Record persisted to EHR.`);
    setTimeout(() => setAlert(null), 4000);
  };

  const handleAttentionAction = (item: DashboardAttentionItem) => {
    setAlert(`Action triggered for attention item: "${item.title}". Directing to workflow.`);
    setTimeout(() => setAlert(null), 4000);
  };

  const dashboardConfig = getDashboardConfig(
    'hospital',
    role,
    mode,
    {
      data: { patients, appointments },
      metrics,
    },
    {
      onAdmit: () => setIsAdmitModalOpen(true),
      onAppointment: () => setIsAdmitModalOpen(true),
      onRx: () => {
        // DigitalRx maker trigger
        const rxEl = document.getElementById('digital-rx-trigger');
        if (rxEl) rxEl.click();
      },
    },
    activeServiceIds
  );

  return (
    <>
      <UniversalDashboard
        config={dashboardConfig}
        onRoleChange={setRole}
        onModeChange={setMode}
        onAttentionAction={handleAttentionAction}
        headerSlot={
          alert ? (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{alert}</span>
            </div>
          ) : null
        }
        customModals={
          <>
            {/* Admit Inpatient Modal via Portal */}
            {mounted &&
              isAdmitModalOpen &&
              createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="relative w-full max-w-lg bg-slate-950/90 border border-white/[0.12] rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                            HOSPITAL ADMISSIONS TRIAGE
                          </span>
                          <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Admit Inpatient to Center</h2>
                          <p className="text-xs text-slate-400 font-medium">Record patient triage level, ward assignment & bed allocation</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsAdmitModalOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleAdmitPatient} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Patient Full Name</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Jonathan Morris"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Age</label>
                          <div className="relative">
                            <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="number"
                              required
                              placeholder="42"
                              value={newAge}
                              onChange={(e) => setNewAge(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Triage Priority</label>
                          <select
                            value={newTriage}
                            onChange={(e: any) => setNewTriage(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                          >
                            <option value="STABLE">Stable (Routine)</option>
                            <option value="URGENT">Urgent (Priority)</option>
                            <option value="CRITICAL">Critical (ICU / STAT)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Department</label>
                          <div className="relative">
                            <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                              value={newDept}
                              onChange={(e) => setNewDept(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                            >
                              <option value="Cardiology">Cardiology</option>
                              <option value="Orthopedics">Orthopedics</option>
                              <option value="Neurology">Neurology</option>
                              <option value="Emergency Care">Emergency Care</option>
                              <option value="Pediatrics">Pediatrics</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Assigned Ward / Bed</label>
                          <div className="relative">
                            <Bed size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={newRoom}
                              onChange={(e) => setNewRoom(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono font-medium text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsAdmitModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles size={13} />
                          <span>Confirm Admission</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>,
                document.body
              )}

            {/* Digital Prescription Maker & Drug Interaction Engine */}
            <DigitalRxPrescriptionMaker />
          </>
        }
      />
    </>
  );
}
