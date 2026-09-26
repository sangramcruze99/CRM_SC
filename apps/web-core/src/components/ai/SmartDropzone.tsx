'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Zap,
  X,
  CheckCircle2,
  Loader2,
  Bot,
  ArrowRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import { openResultDrawer } from './ResultDrawer';

export function SmartDropzone({ hideTrigger = false }: { hideTrigger?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+U or Ctrl+U to open Quick Run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-smart-dropzone', handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-smart-dropzone', handleOpenEvent);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Determine Event & Target Agent dynamically
  const detectRouting = (text: string, file: File | null) => {
    const combined = `${text} ${file ? file.name : ''}`.toLowerCase();

    if (combined.includes('invoice') || combined.includes('bill') || combined.includes('due') || combined.includes('payment')) {
      return { eventType: 'INVOICE_OVERDUE', agentName: 'Midas (Finance)', targetEntity: 'Invoice' };
    }
    if (combined.includes('resume') || combined.includes('cv') || combined.includes('candidate') || combined.includes('applicant')) {
      return { eventType: 'CANDIDATE_APPLIED', agentName: 'Recruitment Agent (HR)', targetEntity: 'Candidate' };
    }
    if (combined.includes('deal') || combined.includes('proposal') || combined.includes('pitch') || combined.includes('opportunity')) {
      return { eventType: 'DEAL_STAGE_CHANGED', agentName: 'Ares (Sales)', targetEntity: 'Deal' };
    }
    if (combined.includes('churn') || combined.includes('health') || combined.includes('retention') || combined.includes('csm')) {
      return { eventType: 'CUSTOMER_CHURN_RISK', agentName: 'Athena (CSM)', targetEntity: 'Customer' };
    }
    if (combined.includes('ticket') || combined.includes('bug') || combined.includes('issue') || combined.includes('support')) {
      return { eventType: 'TICKET_ESCALATED', agentName: 'Customer Support Agent', targetEntity: 'Ticket' };
    }
    if (combined.includes('escrow') || combined.includes('property') || combined.includes('deed') || combined.includes('realestate')) {
      return { eventType: 'ESCROW_CONTINGENCY_AUDIT', agentName: 'Vesta (Real Estate)', targetEntity: 'Transaction' };
    }
    if (combined.includes('content') || combined.includes('campaign') || combined.includes('post') || combined.includes('article')) {
      return { eventType: 'CONTENT_CREATED', agentName: 'Content & Social Agent', targetEntity: 'Campaign' };
    }

    return { eventType: 'DEAL_STAGE_CHANGED', agentName: 'Ares (Sales Intelligence)', targetEntity: 'Record' };
  };

  const handleSubmit = async () => {
    if (!inputText && !selectedFile) return;

    setIsProcessing(true);
    setProcessStep('Classifying document & resolving target agent...');

    const detected = detectRouting(inputText, selectedFile);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessStep(`Consulting ${detected.agentName} & checking safety policies...`);

      const payload: any = {
        title: selectedFile ? selectedFile.name : inputText.slice(0, 50),
        id: `inp_${Date.now().toString(36)}`,
        targetEntity: detected.targetEntity,
        rawInput: inputText,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
      };

      await new Promise((r) => setTimeout(r, 600));
      setProcessStep('Executing autonomous plan & assembling result contract...');

      const res = await fetch('/api/ai/orchestrator/trigger-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: detected.eventType,
          payload,
        }),
      });

      const data = await res.json();

      // Close input modal and pop open the Result Drawer smoothly!
      setIsOpen(false);
      setIsProcessing(false);
      setInputText('');
      setSelectedFile(null);

      // Open the universal Result Drawer with the execution result
      openResultDrawer(data.orchestrationId || data.executionResult?.id, data.executionResult);
    } catch (err) {
      console.error('Execution trigger failed', err);
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Top Bar Quick Action Trigger */}
      {!hideTrigger && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 hover:from-emerald-500/25 hover:to-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          title="Quick AI Drop & Run (Cmd+U)"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline"> AI Run & Drop</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.5 rounded bg-black/40 text-emerald-400 border border-emerald-500/20">
            U
          </kbd>
        </button>
      )}

      {/* Quick Run / Dropzone Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Smart Input & Execution Launcher</h3>
                  <p className="text-[11px] text-slate-400">
                    Drop any document or type instructions — AI routes and executes automatically
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Drag and Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-slate-950/80'
                    : 'border-white/10 hover:border-emerald-500/30 bg-slate-950/40 hover:bg-slate-950/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.txt,.csv,.json,image/*"
                />

                {selectedFile ? (
                  <div className="flex items-center gap-3 text-left">
                    <FileText className="w-8 h-8 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[280px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Agent Processing
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-medium text-white">
                      Drag & drop any file here, or <span className="text-emerald-400 underline">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Invoices, Resumes, Deals, Deeds, Contracts, Tickets (PDF, DOCX, TXT)
                    </p>
                  </>
                )}
              </div>

              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Or enter context / command:
                </label>
                <textarea
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. Ingest Invoice #3590 for Acme Corp $1,450, or Screen candidate Alex Chen for Senior Lead..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
                />
              </div>

              {/* Processing Progress Overlay */}
              {isProcessing && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 animate-in fade-in">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-emerald-300 block truncate">
                      Autonomous Pipeline Active
                    </span>
                    <span className="text-[11px] text-slate-300 block truncate font-mono">
                      {processStep}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-950/40">
              <span className="text-[11px] text-slate-500">
                Auto-classifies into Midas, Ares, Recruitment, Athena...
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing || (!inputText && !selectedFile)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <span>Execute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
