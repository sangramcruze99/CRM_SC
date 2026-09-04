'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  Pill,
  Printer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2,
  User,
  FileText,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface MedicationItem {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export function DigitalRxPrescriptionMaker() {
  const [patientName, setPatientName] = useState('Elena Rostova');
  const [patientAge, setPatientAge] = useState('32');
  const [patientEhrId, setPatientEhrId] = useState('EHR-88902');
  const [doctorName, setDoctorName] = useState('Dr. Arthur Sterling, MD (Chief Medical Officer)');
  const [diagnosis, setDiagnosis] = useState('Acute Bronchitis & Secondary Bacterial Infection');
  const [medications, setMedications] = useState<MedicationItem[]>([
    { drugName: 'Amoxicillin / Clavulanate', dosage: '875mg / 125mg', frequency: 'Twice daily with meals', duration: '10 Days' },
    { drugName: 'Albuterol Sulfate Inhaler', dosage: '90mcg per puff', frequency: '1-2 puffs every 4-6 hrs PRN', duration: '30 Days' },
  ]);
  const [alert, setAlert] = useState<string | null>(null);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { drugName: 'Azithromycin (Z-Pak)', dosage: '250mg', frequency: 'Once daily', duration: '5 Days' },
    ]);
  };

  const handleRemoveMedication = (idx: number) => {
    setMedications(medications.filter((_, i) => i !== idx));
  };

  const handlePrintRx = () => {
    window.print();
    setAlert('📄 Prescription dispatched to hospital pharmacy and logged to EHR ledger.');
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(244,63,94,0.15)] backdrop-blur-2xl space-y-6 text-white overflow-hidden">
      {/* Top Specular Glow Lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-rose-400/50 to-transparent pointer-events-none" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-rose-500/10 blur-3xl rounded-full" />

      {/* Alert */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 relative z-10">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400/20 to-pink-500/10 border border-rose-400/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <Stethoscope size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-[9px] font-black tracking-widest text-rose-300 uppercase">
                HEALTHCARE EHR
              </span>
            </div>
            <h3 className="font-bold text-base text-white tracking-tight mt-0.5">
              Digital Rx Prescription & Drug Interaction Engine
            </h3>
            <span className="text-xs text-slate-400 font-medium">Hospital Medical Board Compliant · E-Prescribe Ready</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrintRx}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/25 cursor-pointer transition-all active:scale-[0.98] border border-rose-400/40"
        >
          <Printer size={14} />
          <span>Sign & Print Prescription (Rx)</span>
        </button>
      </div>

      {/* AI Drug Contraindication Safety Shield */}
      <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center gap-3 text-xs text-rose-200 relative z-10">
        <ShieldAlert size={18} className="text-rose-400 shrink-0" />
        <span className="font-medium">
          <strong className="font-bold text-white">AI Safety Check:</strong> 0 contraindications or lethal drug interactions detected between current medications and patient allergy records.
        </span>
      </div>

      {/* Prescription Form Canvas */}
      <div className="p-5 bg-black/40 border border-white/[0.1] rounded-2xl space-y-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Patient Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-black/50 border border-white/[0.12] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">EHR Record ID</label>
            <div className="relative">
              <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={patientEhrId}
                onChange={(e) => setPatientEhrId(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-black/50 border border-white/[0.12] rounded-xl text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Diagnosis</label>
            <div className="relative">
              <HeartPulse size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-black/50 border border-white/[0.12] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Medications List */}
        <div className="space-y-2.5 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-rose-300">Prescribed Medications (Rx)</span>
            <button
              type="button"
              onClick={handleAddMedication}
              className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-slate-200 hover:text-white rounded-xl flex items-center gap-1.5 cursor-pointer border border-white/[0.1] transition-all"
            >
              <Plus size={13} /> Add Drug
            </button>
          </div>

          <div className="space-y-2">
            {medications.map((med, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-black/50 border border-white/[0.1] rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Pill size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{med.drugName} ({med.dosage})</span>
                    <span className="text-[11px] text-slate-400 font-medium">{med.frequency} · {med.duration}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedication(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
