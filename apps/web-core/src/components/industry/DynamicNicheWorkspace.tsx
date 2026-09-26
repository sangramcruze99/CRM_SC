// apps/web-core/src/components/industry/DynamicNicheWorkspace.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Plus,
  Sparkles,
  X,
  FileText,
  Tag,
} from 'lucide-react';
import { useIndustry, IndustryNiche, NICHE_CONFIGS } from './IndustryContext';
import { useBlueprint } from '../blueprint/BlueprintContext';
import { NICHE_TO_BLUEPRINT_CONFIGS } from '@/lib/blueprint/blueprintEngine';
import { UniversalDashboard } from '@/components/dashboard/UniversalDashboard';
import { getDashboardConfig } from '@/components/dashboard/dashboardConfig';
import { DashboardAttentionItem } from '@/components/dashboard/dashboard.types';

interface DynamicRecordItem {
  id: string;
  name: string;
  status: string;
  statusColor: string;
  primaryField: string;
  secondaryField: string;
  amount?: string;
  date: string;
}

export function DynamicNicheWorkspace({ nicheKey }: { nicheKey: IndustryNiche }) {
  const { currentNiche, setNiche, nicheConfig, activeServiceIds } = useIndustry();
  const { effectiveBlueprint, selectIndustryAndType } = useBlueprint();
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<DynamicRecordItem[]>([]);
  const [role, setRole] = useState('admin');
  const [mode, setMode] = useState<'OPERATIONS' | 'ANALYTICS'>('OPERATIONS');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecordName, setNewRecordName] = useState('');
  const [newRecordDetail, setNewRecordDetail] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Sync niche and load data from backend on page visit
  useEffect(() => {
    setMounted(true);
    if (currentNiche !== nicheKey) {
      setNiche(nicheKey);
      const bp = NICHE_TO_BLUEPRINT_CONFIGS[nicheKey];
      if (bp) {
        selectIndustryAndType(bp.industry, bp.businessTypeId);
      }
    }

    fetch(`/api/niche/${nicheKey}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.records && Array.isArray(json.data.records) && json.data.records.length > 0) {
          setRecords(json.data.records);
        }
      })
      .catch((err) => console.error('Error fetching niche data:', err));
  }, [nicheKey]);

  const nicheMeta = NICHE_CONFIGS[nicheKey] || nicheConfig;

  const primaryRecordType = effectiveBlueprint.recordTypes[0] || {
    id: 'rec_primary',
    name: `${nicheMeta.shortName} Records`,
    singular: 'Record',
    plural: 'Records',
    fields: [],
    statuses: [
      { id: 'st_1', name: 'Open', label: 'Open', color: '#38bdf8', order: 1 },
      { id: 'st_2', name: 'In-Progress', label: 'In-Progress', color: '#f59e0b', order: 2 },
      { id: 'st_3', name: 'Completed', label: 'Completed', color: '#10b981', order: 3 },
    ],
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordName) return;

    const defaultStatus = primaryRecordType.statuses[0] || { name: 'Active', color: '#10b981' };
    const created: DynamicRecordItem = {
      id: `rec_${Date.now()}`,
      name: newRecordName,
      status: defaultStatus.name,
      statusColor: defaultStatus.color,
      primaryField: newRecordDetail || 'Custom Entry',
      secondaryField: 'Created by Operator',
      amount: '$12,000',
      date: 'Just now',
    };

    setRecords([created, ...records]);
    setNewRecordName('');
    setNewRecordDetail('');
    setIsAddModalOpen(false);
    setToast(`Created new ${primaryRecordType.singular} "${newRecordName}"!`);
    setTimeout(() => setToast(null), 3000);

    try {
      await fetch(`/api/niche/${nicheKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_record',
          payload: created,
        }),
      });
    } catch (err) {
      console.error('Failed to sync new record to backend:', err);
    }
  };

  const handleAttentionAction = (item: DashboardAttentionItem) => {
    setToast(`Attention item: "${item.title}" opened.`);
    setTimeout(() => setToast(null), 3000);
  };

  const dashboardConfig = getDashboardConfig(
    nicheKey,
    role,
    mode,
    {
      data: { records },
    },
    {
      onGeneralAction: (action) => {
        if (action === 'CREATE_RECORD') setIsAddModalOpen(true);
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
          toast ? (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{toast}</span>
            </div>
          ) : null
        }
        customModals={
          isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="relative w-full max-w-lg bg-slate-950/90 border border-white/[0.12] rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-2xl">
                <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
                  <div>
                    <h2 className="text-base font-bold text-white">Create New {primaryRecordType.singular}</h2>
                    <p className="text-xs text-slate-400">Add operational record to {nicheMeta.shortName} workspace</p>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddRecord} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Title / Subject</label>
                    <input
                      type="text"
                      required
                      placeholder={`e.g. ${nicheMeta.shortName} Key Deliverable`}
                      value={newRecordName}
                      onChange={(e) => setNewRecordName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Primary Reference / Code</label>
                    <input
                      type="text"
                      placeholder="e.g. Ref #9910-FL"
                      value={newRecordDetail}
                      onChange={(e) => setNewRecordDetail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white text-xs font-mono"
                    />
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                    >
                      Create Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      />
    </>
  );
}
