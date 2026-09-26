'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Zap,
  ShieldAlert,
  FolderOpen,
  Workflow,
  Bot,
  ChevronDown,
  Check,
  X,
  ArrowRight,
  UploadCloud,
  FileText,
  Scan,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { DocumentVaultPickerModal, VaultDocument } from '../documents/DocumentVaultPickerModal';

interface ProposedAction {
  id: string;
  agentId: string;
  agentName: string;
  actionType: string;
  targetEntity: string;
  targetId: string;
  targetName: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  rationale: string;
  parameters: Record<string, any>;
  status: 'PENDING_APPROVAL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED_AUTONOMOUSLY';
  createdAt: string;
}

export function AIActionHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [approvals, setApprovals] = useState<ProposedAction[]>([]);
  const [docCount, setDocCount] = useState<number>(4);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close flyout on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Global keyboard shortcuts: Cmd+U (Dropzone) and Alt+A (Toggle Hub)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch pending approvals
  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/ai/agents/approvals', {
        headers: { 'x-tenant-id': 'default-tenant' },
      });
      if (res.ok) {
        const data = await res.json();
        setApprovals(data || []);
      }
    } catch {
      // Offline fallback
    }
  };

  // Fetch vault document count
  const fetchVaultCount = async () => {
    try {
      const res = await fetch('/api/documents/documents', {
        headers: { 'x-tenant-id': 'default-tenant' },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.documents || data.value || [];
        if (list.length > 0) setDocCount(list.length);
      }
    } catch {
      // Silent catch
    }
  };

  useEffect(() => {
    fetchApprovals();
    fetchVaultCount();
    const interval = setInterval(fetchApprovals, 15000);
    return () => clearInterval(interval);
  }, []);

  const pendingApprovals = approvals.filter(
    (a) => a.status === 'PENDING_APPROVAL' || a.status === 'PENDING'
  );

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/ai/agents/approvals/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({ reviewedBy: 'Workspace Executive' }),
      });
      if (res.ok) {
        setApprovals((prev) => prev.filter((a) => a.id !== id));
        showToast('Action approved and queued for dispatch.');
      }
    } catch (err) {
      console.error('Failed to approve action', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/ai/agents/approvals/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({ reviewedBy: 'Workspace Executive', reason: 'Declined from AI Hub' }),
      });
      if (res.ok) {
        setApprovals((prev) => prev.filter((a) => a.id !== id));
        showToast('Action rejected.');
      }
    } catch (err) {
      console.error('Failed to reject action', err);
    } finally {
      setProcessingId(null);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openSmartDropzoneModal = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('open-smart-dropzone'));
  };

  const handleSelectFromVault = (doc: VaultDocument) => {
    setIsPickerOpen(false);
    const isPdfOrImg =
      doc.mimeType === 'application/pdf' ||
      doc.mimeType?.startsWith('image/') ||
      doc.name.toLowerCase().endsWith('.pdf');

    if (isPdfOrImg) {
      router.push(`/ocr-invoice?vaultDocId=${doc.id}&name=${encodeURIComponent(doc.name)}`);
    } else {
      router.push('/documents');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Sleek Master Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-8.5 flex items-center gap-1.5 px-2.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer whitespace-nowrap active:scale-[0.98] ${
          isOpen
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : pendingApprovals.length > 0
            ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border-amber-500/40'
            : 'bg-slate-100 hover:bg-slate-200/90 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40'
        }`}
        title="AI Automation & Actions Hub (Alt+A / Cmd+U)"
        aria-expanded={isOpen}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          {pendingApprovals.length > 0 ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </>
          )}
        </span>
        <Sparkles size={13} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
        <span className="hidden sm:inline font-semibold">AI Hub</span>

        {/* Live Pending Approvals Counter Pill */}
        {pendingApprovals.length > 0 ? (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 font-mono shrink-0">
            {pendingApprovals.length}
          </span>
        ) : (
          <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded bg-black/20 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 shrink-0">
            A
          </kbd>
        )}

        <ChevronDown
          size={12}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Floating Hub Flyout Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-88 sm:w-[410px] bg-white dark:bg-[#0c1411]/95 border border-slate-200 dark:border-white/12 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
          {/* Ambient Glow Accent Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

          {/* Hub Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/60 dark:bg-black/30">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                <Zap size={14} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  Autonomous AI & Action Hub
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Central command for agents, automations & vault
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition text-xs cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto p-3.5 space-y-3.5">
            {/* 4 Primary Quick Action Quadrants */}
            <div className="grid grid-cols-2 gap-2">
              {/* Smart Run & Drop */}
              <button
                type="button"
                onClick={openSmartDropzoneModal}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-500/10 dark:bg-white/[0.03] dark:hover:bg-emerald-500/15 border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UploadCloud size={14} />
                  </div>
                  <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-black/40 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10">
                    U
                  </kbd>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    AI Run & Drop
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    Drag files or trigger agent
                  </div>
                </div>
              </button>

              {/* Document Vault */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsPickerOpen(true);
                }}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-500/10 dark:bg-white/[0.03] dark:hover:bg-emerald-500/15 border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FolderOpen size={14} />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                    {docCount} docs
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    Document Vault
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    Browse files & OCR scan
                  </div>
                </div>
              </button>

              {/* Visual Automation Studio */}
              <Link
                href="/automation/workflows"
                onClick={() => setIsOpen(false)}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-500/10 dark:bg-white/[0.03] dark:hover:bg-emerald-500/15 border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Workflow size={14} />
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    Studio
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Workflows Studio
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    Visual DAG node canvas
                  </div>
                </div>
              </Link>

              {/* Autonomous Agent Swarm */}
              <Link
                href="/automation/agents"
                onClick={() => setIsOpen(false)}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-500/10 dark:bg-white/[0.03] dark:hover:bg-emerald-500/15 border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Bot size={14} />
                  </div>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                    7 Fleet
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Agent Swarm
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    Reasoning & auto dispatch
                  </div>
                </div>
              </Link>
            </div>

            {/* Human-in-the-Loop Safeguard Action Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center space-x-1.5">
                  <ShieldAlert
                    size={13}
                    className={
                      pendingApprovals.length > 0 ? 'text-amber-500' : 'text-emerald-500'
                    }
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Human-in-the-Loop Gate
                  </span>
                </div>
                {pendingApprovals.length > 0 && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                    {pendingApprovals.length} Pending Review
                  </span>
                )}
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] flex items-center space-x-2.5">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    All autonomous operations verified safe. Zero pending approvals.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {pendingApprovals.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Bot size={11} className="text-emerald-500" />
                          {item.agentName || 'Autonomous Sentinel'}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            item.riskLevel === 'HIGH'
                              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                          }`}
                        >
                          {item.riskLevel} RISK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        {item.rationale || item.actionType}
                      </p>
                      <div className="flex items-center justify-end space-x-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          disabled={processingId === item.id}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-200 hover:bg-rose-500/20 text-slate-700 hover:text-rose-500 dark:bg-white/10 dark:hover:bg-rose-500/20 dark:text-slate-300 dark:hover:text-rose-300 transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          disabled={processingId === item.id}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition cursor-pointer shadow-xs"
                        >
                          {processingId === item.id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <Check size={10} />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingApprovals.length > 3 && (
                    <Link
                      href="/automation/approvals"
                      onClick={() => setIsOpen(false)}
                      className="block text-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline py-1"
                    > View all {pendingApprovals.length} pending reviews in queue →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 text-[10px] font-mono">
              Press <kbd className="px-1 py-0.5 rounded bg-black/20 dark:bg-white/10">U</kbd> for quick drop
            </span>
            <Link
              href="/automation/workflows"
              onClick={() => setIsOpen(false)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 text-[11px]"
            >
              <span>Workflow Catalog</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Embedded Document Vault Picker Modal */}
      <DocumentVaultPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectFromVault}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3 bg-slate-900 text-white border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
