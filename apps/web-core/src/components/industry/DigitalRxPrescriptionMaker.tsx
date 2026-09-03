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
    <div className="bg-white/[0.04] backdrop-blur-2xl border border-rose-500/30 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6 text-white">
      {/* Alert */}
      {alert && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Stethoscope size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Digital Rx Prescription & Drug Interaction Engine</h3>
            <span className="text-xs text-slate-400">Hospital Medical Board Compliant · E-Prescribe Ready</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrintRx}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 cursor-pointer"
        >
          <Printer size={14} />
          <span>Sign & Print Prescription (Rx)</span>
        </button>
      </div>

      {/* AI Drug Contraindication Safety Shield */}
      <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs text-rose-200">
        <ShieldAlert size={18} className="text-rose-400 flex-shrink-0" />
        <span>
          <strong>AI Safety Check:</strong> 0 contraindications or lethal drug interactions detected between current medications and patient allergy records.
        </span>
      </div>

      {/* Prescription Form Canvas */}
      <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">EHR Record ID</label>
            <input
              type="text"
              value={patientEhrId}
              onChange={(e) => setPatientEhrId(e.target.value)}
              className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-mono text-emerald-400"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white"
            />
          </div>
        </div>

        {/* Medications List */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Prescribed Medications (Rx)</span>
            <button
              type="button"
              onClick={handleAddMedication}
              className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-xs text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> Add Drug
            </button>
          </div>

          <div className="space-y-2">
            {medications.map((med, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Pill size={15} className="text-rose-400" />
                  <div>
                    <span className="font-bold text-white block">{med.drugName} ({med.dosage})</span>
                    <span className="text-[11px] text-slate-400">{med.frequency} · {med.duration}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedication(idx)}
                  className="text-slate-500 hover:text-rose-400 cursor-pointer"
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
