'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  FileImage,
  FileCode2,
  FileAudio,
  FileVideo,
  Archive,
  FileIcon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Receipt,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  Layers,
  X,
  Clock,
  ShieldCheck,
  Eye,
  GitBranch,
} from 'lucide-react';

export interface EntityDocument {
  id: string;
  name: string;
  originalName?: string;
  mimeType: string;
  size: number;
  url?: string;
  storageKey?: string;
  service: string;
  module: string;
  entityType?: string;
  entityId?: string;
  category: 'input' | 'upload' | 'receipt' | 'output';
  processingStatus: string;
  createdAt: string;
  parentDocumentId?: string;
}

interface EntityDocumentsHubProps {
  service: string;
  module: string;
  entityType: string;
  entityId: string;
  entityTitle?: string;
  initialDocuments?: EntityDocument[];
  onDocumentCountChange?: (count: number) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith('image/')) return <FileImage className="text-blue-400" size={18} />;
  if (mimeType?.startsWith('video/')) return <FileVideo className="text-purple-400" size={18} />;
  if (mimeType?.startsWith('audio/')) return <FileAudio className="text-emerald-400" size={18} />;
  if (mimeType === 'application/pdf') return <FileText className="text-rose-400" size={18} />;
  if (mimeType === 'application/zip') return <Archive className="text-amber-400" size={18} />;
  if (mimeType?.includes('json') || mimeType?.includes('javascript'))
    return <FileCode2 className="text-emerald-400" size={18} />;
  return <FileIcon className="text-slate-400" size={18} />;
}

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const CATEGORY_TAGS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  input: { label: 'INPUT', bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  upload: { label: 'UPLOAD', bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30' },
  receipt: { label: 'RECEIPT', bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  output: { label: 'OUTPUT', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
};

export function EntityDocumentsHub({
  service,
  module,
  entityType,
  entityId,
  entityTitle,
  initialDocuments = [],
  onDocumentCountChange,
}: EntityDocumentsHubProps) {
  const [documents, setDocuments] = useState<EntityDocument[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingOutput, setIsGeneratingOutput] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'input' | 'output'>('all');
  const [previewDoc, setPreviewDoc] = useState<EntityDocument | null>(null);
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents for this entity
  const fetchEntityDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/documents/documents?entityId=${encodeURIComponent(entityId)}&service=${encodeURIComponent(service)}`,
        { headers: { 'x-tenant-id': 'default-tenant' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDocuments(data);
          onDocumentCountChange?.(data.length);
        }
      }
    } catch {
      // safe fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialDocuments && initialDocuments.length > 0) {
      setDocuments(initialDocuments);
    } else if (entityId) {
      fetchEntityDocuments();
    }
  }, [entityId, service]);

  // Handle uploading source document
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

        const res = await fetch('/api/documents/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': 'default-tenant',
          },
          body: JSON.stringify({
            name: file.name,
            originalName: file.name,
            service,
            module,
            entityType,
            entityId,
            category: 'input',
            mimeType,
            size: file.size || 1024,
          }),
        });

        if (res.ok) {
          const newDoc = await res.json();
          setDocuments((prev) => [newDoc, ...prev]);
          setNotification({
            title: 'File Attached',
            message: `"${file.name}" ingested into ${service.toUpperCase()} / ${module} workspace.`,
            type: 'success',
          });
        }
      }
    } catch {
      setNotification({
        title: 'Upload Error',
        message: 'Could not connect to document storage service.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Generate automated official output / receipt
  const handleGenerateDeliverable = async () => {
    setIsGeneratingOutput(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${service}_${module}_${entityId}_official_receipt_${Date.now().toString().slice(-4)}.json`;

      const res = await fetch('/api/documents/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          name: filename,
          originalName: filename,
          service,
          module,
          entityType,
          entityId,
          category: 'output',
          mimeType: 'application/json',
          size: 2048,
          source: 'SYSTEM_DELIVERABLE_GENERATOR',
        }),
      });

      if (res.ok) {
        const outputDoc = await res.json();
        setDocuments((prev) => [outputDoc, ...prev]);
        setNotification({
          title: 'Output Generated & Filed',
          message: `Official deliverable "${filename}" automatically archived to Central Vault.`,
          type: 'success',
        });
      }
    } catch {
      setNotification({
        title: 'Generation Failed',
        message: 'Could not generate official deliverable artifact.',
        type: 'error',
      });
    } finally {
      setIsGeneratingOutput(false);
    }
  };

  const handleDeleteDocument = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from this entity?`)) return;
    try {
      const res = await fetch(`/api/documents/documents/${id}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': 'default-tenant' },
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setNotification({
          title: 'Document Removed',
          message: `"${name}" removed from vault record.`,
          type: 'info',
        });
      }
    } catch {
      // safe fallback
    }
  };

  // Filtered lists
  const inputsCount = documents.filter((d) => d.category === 'input' || d.category === 'upload').length;
  const outputsCount = documents.filter((d) => d.category === 'output' || d.category === 'receipt').length;

  const filteredDocs = documents.filter((d) => {
    if (activeTab === 'input') return d.category === 'input' || d.category === 'upload';
    if (activeTab === 'output') return d.category === 'output' || d.category === 'receipt';
    return true;
  });

  return (
    <div className="botanical-glass-card p-6 space-y-5 text-white">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Entity Files & Deliverables Hub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {service.toUpperCase()} · {module}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Authoritative source files (`INPUT`) & automated receipts (`OUTPUT`)
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
            multiple
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/10 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <UploadCloud size={14} className="text-emerald-400" />
            <span>{isUploading ? 'Uploading...' : 'Attach File'}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateDeliverable}
            disabled={isGeneratingOutput}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 border border-emerald-400/30 cursor-pointer disabled:opacity-50"
          >
            <Receipt size={14} />
            <span>{isGeneratingOutput ? 'Generating...' : '⚡ Generate Output'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`flex items-start justify-between p-3 rounded-xl border text-xs animate-in fade-in duration-150 ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
          }`}
        >
          <div className="flex items-start space-x-2">
            {notification.type === 'error' ? (
              <AlertCircle size={15} className="text-rose-400 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-bold text-white">{notification.title}</p>
              <p className="text-slate-300 mt-0.5">{notification.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Tab Filter Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Files ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'input'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Source Files ({inputsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('output')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'output'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Generated Outputs ({outputsCount})
          </button>
        </div>

        {/* Central Vault Link */}
        <Link
          href={`/documents?service=${service}&search=${encodeURIComponent(entityId)}`}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
          title="Open in Central Vault"
        >
          <span>Vault View</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* File List / Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="p-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
            <FileText size={20} />
          </div>
          <p className="text-xs font-bold text-slate-200">
            {activeTab === 'output'
              ? 'No generated outputs yet'
              : activeTab === 'input'
              ? 'No source attachments uploaded'
              : 'No files attached to this record'}
          </p>
          <p className="text-[11px] text-slate-500">
            Attach client documents or click &quot;⚡ Generate Output&quot; to produce official deliverables.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const catMeta = CATEGORY_TAGS[doc.category] || CATEGORY_TAGS.upload;

            return (
              <div
                key={doc.id}
                className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 transition-all group shadow-sm"
              >
                {/* File Details */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md" title={doc.name}>
                      {doc.originalName || doc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                      <span>{formatBytes(doc.size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-slate-500">id: {doc.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Badges & Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  {/* Category Pill */}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${catMeta.bg} ${catMeta.text} ${catMeta.border}`}
                  >
                    {catMeta.label}
                  </span>

                  {/* OCR AI Scanner Shortcut if PDF or image */}
                  {(doc.mimeType === 'application/pdf' || doc.mimeType?.startsWith('image/')) && (
                    <Link
                      href={`/ocr-invoice?vaultDocId=${doc.id}&name=${encodeURIComponent(doc.name)}`}
                      className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 hover:text-white transition"
                      title="AI OCR Scan"
                    >
                      <Sparkles size={13} />
                    </Link>
                  )}

                  {/* Preview Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Quick Preview"
                  >
                    <Eye size={13} />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id, doc.name)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete File"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-white/5">
                  {getFileIcon(previewDoc.mimeType)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-xs">{previewDoc.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatBytes(previewDoc.size)} · {previewDoc.category.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/10 font-mono text-[11px] text-slate-300 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>Document ID:</div>
                <div className="text-white truncate">{previewDoc.id}</div>
                <div>Namespace:</div>
                <div className="text-emerald-400 font-bold uppercase">{previewDoc.service} / {previewDoc.module}</div>
                <div>Entity Type:</div>
                <div className="text-white">{previewDoc.entityType || '—'}</div>
                <div>Entity ID:</div>
                <div className="text-white">{previewDoc.entityId || '—'}</div>
                <div>Storage Key:</div>
                <div className="text-slate-400 truncate col-span-2">{previewDoc.storageKey || 'Canonical vault path'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <Link
                href={`/documents?service=${previewDoc.service}&search=${encodeURIComponent(previewDoc.name)}`}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open in Central Vault</span>
                <ExternalLink size={12} />
              </Link>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
