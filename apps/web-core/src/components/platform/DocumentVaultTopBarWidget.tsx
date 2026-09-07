'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
  Sparkles,
  FileText,
  Upload,
  Copy,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  X,
  FileSpreadsheet,
  Image as ImageIcon,
} from 'lucide-react';
import { DocumentVaultPickerModal, VaultDocument } from '../documents/DocumentVaultPickerModal';

export function DocumentVaultTopBarWidget() {
  const [docCount, setDocCount] = useState<number>(4);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Quick probe of vault documents count
    fetch('/api/documents/documents', {
      headers: { 'x-tenant-id': 'default-tenant' },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          const list = Array.isArray(data) ? data : data.documents || data.value || [];
          if (list.length > 0) setDocCount(list.length);
        }
      })
      .catch(() => {});
  }, [isPickerOpen]);

  const handleSelectFromVault = (doc: VaultDocument) => {
    // If it's a PDF or Image, offer to scan in OCR or open in documents
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
    <>
      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        className="h-8.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] whitespace-nowrap shrink-0"
        title="Document Vault Quick Access — Browse files, attach or scan with OCR"
      >
        <FolderOpen size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-xs font-bold hidden md:inline">Vault</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
          {docCount}
        </span>
      </button>

      <DocumentVaultPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectFromVault}
        title="Document Vault & Quick Ingestion"
        description="Search stored files, upload new documents, or launch instant neural OCR extraction."
        actionLabel="Open / Scan Document"
      />
    </>
  );
}
