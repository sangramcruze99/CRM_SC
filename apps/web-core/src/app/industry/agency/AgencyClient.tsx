// apps/web-core/src/app/industry/agency/AgencyClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Palette,
  TrendingUp,
  DollarSign,
  ClipboardList,
  Users,
  Search,
  Plus,
  CheckCircle2,
  X,
} from 'lucide-react';
import { UniversalDashboard } from '@/components/dashboard/UniversalDashboard';
import { getDashboardConfig } from '@/components/dashboard/dashboardConfig';
import { DashboardAttentionItem } from '@/components/dashboard/dashboard.types';
import { useIndustry } from '@/components/industry/IndustryContext';

interface ClientDeliverable {
  id: string;
  client: string;
  deliverable: string;
  type: 'UI/UX Design' | 'Brand Identity' | 'Ad Campaign Video' | 'Full-Stack Web' | 'SEO Sprint';
  status: 'IN_PRODUCTION' | 'CLIENT_REVIEW' | 'APPROVED' | 'LIVE';
  dueDate: string;
  leadDesigner: string;
}

export function AgencyClient() {
  const { activeServiceIds } = useIndustry();
  const [deliverables, setDeliverables] = useState<ClientDeliverable[]>([]);
  const [role, setRole] = useState('admin');
  const [mode, setMode] = useState<'OPERATIONS' | 'ANALYTICS'>('OPERATIONS');
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // New Deliverable Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newType, setNewType] = useState<ClientDeliverable['type']>('UI/UX Design');
  const [newDueDate, setNewDueDate] = useState('2026-10-30');
  const [newDesigner, setNewDesigner] = useState('Milo Vance');

  const fetchAgencyData = async () => {
    try {
      const res = await fetch('/api/niche/agency');
      if (res.ok) {
        const json = await res.json();
        if (json.data?.deliverables && Array.isArray(json.data.deliverables)) {
          setDeliverables(
            json.data.deliverables.map((d: any) => ({
              id: d.id,
              client: d.client || d.clientName || 'Client Account',
              deliverable: d.deliverable || d.milestone || 'Production Sprint',
              type: d.type || 'Full-Stack Web',
              status: d.status || 'IN_PRODUCTION',
              dueDate: d.dueDate || '2026-10-15',
              leadDesigner: d.leadDesigner || 'Creative Lead',
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to load agency deliverables:', err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchAgencyData();
  }, []);

  const handleCreateDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient || !newDeliverable) return;

    const newSprint: ClientDeliverable = {
      id: `del_${Date.now()}`,
      client: newClient,
      deliverable: newDeliverable,
      type: newType,
      status: 'IN_PRODUCTION',
      dueDate: newDueDate,
      leadDesigner: newDesigner,
    };

    setDeliverables([newSprint, ...deliverables]);
    setIsAddModalOpen(false);
    setNewClient('');
    setNewDeliverable('');
    setToast(`Created new deliverable sprint "${newSprint.deliverable}" for ${newSprint.client}!`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleApproveDeliverable = async (id: string) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'APPROVED' } : d))
    );

    try {
      await fetch('/api/niche/agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_deliverable',
          payload: { id },
        }),
      });
      setToast('Deliverable marked as APPROVED and synced to client portal!');
    } catch (err) {
      console.error('Failed to approve deliverable:', err);
      setToast('Deliverable marked as APPROVED!');
    }
    setTimeout(() => setToast(null), 4000);
  };

  const dashboardConfig = getDashboardConfig(
    'agency',
    role,
    mode,
    {
      data: { deliverables },
      metrics: {
        activeSprintsCount: deliverables.length,
        totalRetainerValue: 66500,
        inReviewDeliverables: deliverables.filter((d) => d.status === 'CLIENT_REVIEW').length,
      },
    },
    {
      onGeneralAction: (actionName: string) => {
        if (actionName === 'CREATE_DELIVERABLE' || actionName === 'CREATE_PROPOSAL') {
          setIsAddModalOpen(true);
        }
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
        onAttentionAction={(item: DashboardAttentionItem) => {
          setToast(`Attention action: "${item.title}". Directing to client sign-off studio.`);
          setTimeout(() => setToast(null), 4000);
        }}
        onRowClick={(rec) => {
          const item = deliverables.find((d) => d.id === rec.id);
          if (item && item.status === 'CLIENT_REVIEW') {
            handleApproveDeliverable(item.id);
          }
        }}
        headerSlot={
          toast ? (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{toast}</span>
            </div>
          ) : null
        }
        customModals={
          mounted && isAddModalOpen && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="relative w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="text-base font-bold text-white">Create Client Deliverable Sprint</h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateDeliverable} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Client Account</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lumina Cosmetics"
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Deliverable Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Q4 Brand Identity Guidelines & Spec"
                      value={newDeliverable}
                      onChange={(e) => setNewDeliverable(e.target.value)}
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Deliverable Type</label>
                      <select
                        value={newType}
                        onChange={(e: any) => setNewType(e.target.value)}
                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                      >
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Brand Identity">Brand Identity</option>
                        <option value="Ad Campaign Video">Ad Campaign Video</option>
                        <option value="Full-Stack Web">Full-Stack Web</option>
                        <option value="SEO Sprint">SEO Sprint</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Due Date</label>
                      <input
                        type="date"
                        required
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Lead Creative / Designer</label>
                    <input
                      type="text"
                      required
                      value={newDesigner}
                      onChange={(e) => setNewDesigner(e.target.value)}
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Provision Deliverable Sprint
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        }
      />
    </>
  );
}
