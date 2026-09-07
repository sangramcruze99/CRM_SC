"use client";

import { useState, useEffect, useRef } from "react";
import {
  Folder as FolderIcon,
  File as FileIcon,
  Search,
  Upload,
  ChevronRight,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  Archive,
  FileCode2,
  ArrowLeft,
  Trash2,
  FolderPlus,
  FolderOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  X,
  Layers,
  GitBranch,
  ShieldCheck,
  Tag,
  Hash,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith('image/')) return <FileImage className="text-blue-400" size={22} />;
  if (mimeType?.startsWith('video/')) return <FileVideo className="text-purple-400" size={22} />;
  if (mimeType?.startsWith('audio/')) return <FileAudio className="text-emerald-400" size={22} />;
  if (mimeType === 'application/pdf') return <FileText className="text-rose-400" size={22} />;
  if (mimeType === 'application/zip') return <Archive className="text-amber-400" size={22} />;
  if (mimeType?.includes('json') || mimeType?.includes('javascript') || mimeType?.includes('text/html'))
    return <FileCode2 className="text-emerald-400" size={22} />;
  return <FileIcon className="text-slate-400" size={22} />;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  input: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  upload: { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30' },
  receipt: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  output: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const SERVICE_COLORS: Record<string, string> = {
  finance: 'from-amber-500 to-orange-600',
  crm: 'from-blue-500 to-cyan-600',
  sales: 'from-violet-500 to-purple-600',
  hr: 'from-pink-500 to-rose-600',
  helpdesk: 'from-teal-500 to-emerald-600',
  projects: 'from-indigo-500 to-blue-600',
  inventory: 'from-yellow-500 to-amber-600',
  ai: 'from-fuchsia-500 to-purple-600',
  documents: 'from-emerald-500 to-teal-600',
};

const REGISTERED_SERVICES = [
  { id: 'all', label: 'All Services' },
  { id: 'finance', label: 'Finance' },
  { id: 'crm', label: 'CRM' },
  { id: 'sales', label: 'Sales' },
  { id: 'hr', label: 'HR' },
  { id: 'helpdesk', label: 'Helpdesk' },
  { id: 'projects', label: 'Projects' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'documents', label: 'General Vault' },
];

export function DocumentsClient({
  initialFolders,
  initialDocuments,
  availableServices,
  currentFolder,
  currentFolderId,
  initialService = 'all',
  initialCategory = 'all',
}: {
  initialFolders: any[];
  initialDocuments: any[];
  availableServices?: any[];
  currentFolder: any | null;
  currentFolderId: string;
  initialService?: string;
  initialCategory?: string;
}) {
  const [folders, setFolders] = useState(initialFolders);
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeService, setActiveService] = useState(initialService || 'all');
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && initialCategory !== '' ? initialCategory : 'all'
  );

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderService, setNewFolderService] = useState('finance');
  const [isSubmittingFolder, setIsSubmittingFolder] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Upload configuration
  const [uploadService, setUploadService] = useState('finance');
  const [uploadModule, setUploadModule] = useState('invoices');
  const [uploadCategory, setUploadCategory] = useState<'input' | 'upload' | 'receipt' | 'output'>('input');
  const [uploadEntityId, setUploadEntityId] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const openCreateFolderModal = () => {
    const defaultSvc = currentFolder?.service || (activeService !== 'all' ? activeService : 'finance');
    setNewFolderService(defaultSvc);
    setNewFolderName('');
    setIsCreatingFolder(true);
  };

  const openUploadModal = () => {
    const defaultSvc = currentFolder?.service || (activeService !== 'all' ? activeService : 'finance');
    setUploadService(defaultSvc);
    if (defaultSvc === 'finance') setUploadModule('invoices');
    else if (defaultSvc === 'crm') setUploadModule('deals');
    else if (defaultSvc === 'sales') setUploadModule('quotes');
    else if (defaultSvc === 'hr') setUploadModule('employees');
    else if (defaultSvc === 'helpdesk') setUploadModule('tickets');
    else setUploadModule('general');
    setShowUploadModal(true);
  };

  // Lineage modal
  const [lineageDoc, setLineageDoc] = useState<any | null>(null);
  const [lineageData, setLineageData] = useState<{
    document?: any;
    receipts: any[];
    outputs: any[];
    children: any[];
    references: any[];
  } | null>(null);
  const [isLoadingLineage, setIsLoadingLineage] = useState(false);

  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type?: 'success' | 'info' | 'error';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setFolders(initialFolders);
    setDocuments(initialDocuments);
    setActiveCategory(initialCategory && initialCategory !== '' ? initialCategory : 'all');
    setActiveService(initialService && initialService !== '' ? initialService : 'all');
  }, [initialFolders, initialDocuments, currentFolderId, initialCategory, initialService]);

  const handleSelectService = (serviceId: string) => {
    setActiveService(serviceId);
    const params = new URLSearchParams(searchParams.toString());
    if (serviceId === 'all') {
      params.delete('service');
    } else {
      params.set('service', serviceId);
    }
    router.push(`/documents?${params.toString()}`);
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    const params = new URLSearchParams(searchParams.toString());
    if (catId === 'all') {
      params.delete('category');
    } else {
      params.set('category', catId);
    }
    router.push(`/documents?${params.toString()}`);
  };

  const handleOpenFolder = (folder: any) => {
    const serviceToUse =
      activeService && activeService !== 'all'
        ? activeService
        : (folder.service || 'all');
    router.push(`/documents?folderId=${folder.id}&service=${serviceToUse}`);
  };

  const handleCreateFolder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newFolderName.trim();
    if (!name || isSubmittingFolder) return;

    setIsSubmittingFolder(true);
    try {
      const folderService = newFolderService || (activeService !== 'all' ? activeService : 'documents');
      const res = await fetch(`/api/documents/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          name,
          service: folderService,
          parentId: currentFolderId === 'root' ? null : currentFolderId,
        }),
      });

      if (res.ok) {
        const newFolder = await res.json();
        setFolders((prev) => [...prev, newFolder]);
        setNewFolderName("");
        setIsCreatingFolder(false);
        setNotification({
          title: 'Folder Created',
          message: `Directory "${newFolder.name}" successfully created in ${newFolder.service?.toUpperCase() || 'GENERAL'} namespace.`,
          type: 'success',
        });
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        setNotification({
          title: 'Failed to Create Folder',
          message: err.message || 'Server error while creating directory.',
          type: 'error',
        });
      }
    } catch {
      setNotification({
        title: 'Connection Error',
        message: 'Could not connect to Document Vault service.',
        type: 'error',
      });
    } finally {
      setIsSubmittingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId: string, name: string) => {
    if (!confirm(`Delete folder "${name}"?`)) return;

    try {
      const res = await fetch(`/api/documents/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-id': 'default-tenant',
        },
      });

      if (res.ok) {
        setFolders((prev) => prev.filter((f) => f.id !== folderId));
        router.refresh();
      }
    } catch {
      // safe fallback
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

        // Target service context
        const targetService = uploadService || (activeService !== 'all' ? activeService : 'documents');
        const targetModule = uploadModule || 'general';
        const targetCategory = uploadCategory || 'upload';
        const targetEntityId = uploadEntityId || 'root';

        const res = await fetch(`/api/documents/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': 'default-tenant',
          },
          body: JSON.stringify({
            name: file.name,
            originalName: file.name,
            service: targetService,
            module: targetModule,
            entityType: targetModule.slice(0, -1) || 'item',
            entityId: targetEntityId,
            category: targetCategory,
            folderId: currentFolderId === 'root' ? null : currentFolderId,
            mimeType,
            size: file.size || 1024,
          }),
        });

        if (res.ok) {
          const newDoc = await res.json();
          setDocuments((prev) => [newDoc, ...prev]);

          setNotification({
            title: `Ingested "${file.name}"`,
            message: `Document registered in ${newDoc.service.toUpperCase()}/${newDoc.module}/${newDoc.category} namespace. State: ${newDoc.processingStatus || 'UPLOADED'}.`,
            type: 'success',
          });
        } else {
          setNotification({
            title: `Upload Failed`,
            message: `Server rejected upload for "${file.name}".`,
            type: 'error',
          });
        }
      }
      setShowUploadModal(false);
      router.refresh();
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDeleteDoc = async (docId: string, name: string) => {
    if (!confirm(`Delete file "${name}" from Document Vault?`)) return;

    try {
      const res = await fetch(`/api/documents/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-id': 'default-tenant',
        },
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        router.refresh();
      }
    } catch {
      // safe fallback
    }
  };

  const handleViewLineage = async (doc: any) => {
    setLineageDoc(doc);
    setIsLoadingLineage(true);
    try {
      const res = await fetch(`/api/documents/documents/${doc.id}/lineage`, {
        headers: { 'x-tenant-id': 'default-tenant' },
      });
      if (res.ok) {
        const data = await res.json();
        setLineageData(data);
      } else {
        setLineageData({
          document: doc,
          receipts: [],
          outputs: [],
          children: [],
          references: [],
        });
      }
    } catch {
      setLineageData({
        document: doc,
        receipts: [],
        outputs: [],
        children: [],
        references: [],
      });
    } finally {
      setIsLoadingLineage(false);
    }
  };

  // Filtered lists
  const filteredFolders = folders.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService =
      !activeService ||
      activeService === 'all' ||
      (f.service || 'documents').toLowerCase() === activeService.toLowerCase();
    return matchesSearch && matchesService;
  });

  const filteredDocuments = documents.filter((d) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.originalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.entityId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService =
      !activeService || activeService === 'all' || (d.service || '').toLowerCase() === activeService.toLowerCase();

    const matchesCategory =
      !activeCategory || activeCategory === 'all' || (d.category || '').toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesService && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white p-2">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          {currentFolder ? (
            <Link
              href={`/documents?service=${activeService}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition border border-white/10"
              title="Back to All Files"
            >
              <ArrowLeft size={14} />
              <span>All Files</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/30 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Layers size={18} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Central Document Vault</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Service-Aware Namespaces
                  </span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  Authoritative Metadata · Canonical Deduplication · OCR & Automation Lineage
                </span>
              </div>
            </div>
          )}

          {currentFolder && (
            <>
              <ChevronRight size={14} className="text-slate-500" />
              <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-xl text-emerald-300 font-bold">
                <FolderOpen size={14} className="text-emerald-400" />
                <span>{currentFolder.name}</span>
              </div>
            </>
          )}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by file, entity, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-full sm:w-56 transition-all font-medium shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={openCreateFolderModal}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <FolderPlus size={14} className="text-emerald-400" />
            <span>New Folder</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleNativeFileUpload}
            multiple
            className="hidden"
          />

          <button
            type="button"
            onClick={openUploadModal}
            disabled={isUploading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-95 border border-emerald-400/40 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Upload size={14} />
            <span>{isUploading ? 'Ingesting...' : 'Ingest Document'}</span>
          </button>
        </div>
      </div>

      {/* Service Namespaces Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.08] p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
            Namespace:
          </span>
          {REGISTERED_SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectService(s.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeService === s.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-extrabold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Category:</span>
          {['all', 'input', 'upload', 'receipt', 'output'].map((cat) => {
            const isSelected =
              activeCategory === cat ||
              (!activeCategory && cat === 'all') ||
              (activeCategory === '' && cat === 'all');

            return (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`flex items-start justify-between p-3 rounded-2xl border text-xs animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
          }`}
        >
          <div className="flex items-start space-x-2.5">
            {notification.type === 'error' ? (
              <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-bold text-white">{notification.title}</p>
              <p className="text-slate-300 mt-0.5">{notification.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Modal (Service Context Selector) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UploadCloud size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Ingest into Service Namespace</h3>
                  <p className="text-[11px] text-slate-400">Configure authoritative document metadata</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Target Service</label>
                <select
                  value={uploadService}
                  onChange={(e) => {
                    setUploadService(e.target.value);
                    if (e.target.value === 'finance') setUploadModule('invoices');
                    else if (e.target.value === 'crm') setUploadModule('deals');
                    else if (e.target.value === 'sales') setUploadModule('quotes');
                    else if (e.target.value === 'hr') setUploadModule('employees');
                    else if (e.target.value === 'helpdesk') setUploadModule('tickets');
                    else setUploadModule('general');
                  }}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="finance">Finance & Billing</option>
                  <option value="crm">CRM & Pipeline</option>
                  <option value="sales">Sales & Quotes</option>
                  <option value="hr">Human Resources</option>
                  <option value="helpdesk">Helpdesk & Support</option>
                  <option value="projects">Projects</option>
                  <option value="inventory">Inventory</option>
                  <option value="documents">General Vault</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Module</label>
                <input
                  type="text"
                  value={uploadModule}
                  onChange={(e) => setUploadModule(e.target.value)}
                  placeholder="e.g. invoices, deals, tickets"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="input">input (Source document)</option>
                  <option value="upload">upload (General file)</option>
                  <option value="receipt">receipt (Processing receipt)</option>
                  <option value="output">output (Extracted / generated)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Entity ID (Optional)</label>
                <input
                  type="text"
                  value={uploadEntityId}
                  onChange={(e) => setUploadEntityId(e.target.value)}
                  placeholder="e.g. INV-1001, DEAL-501"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
            >
              <UploadCloud size={24} className="text-emerald-400" />
              <p className="text-xs font-bold text-white">Click to Select File(s)</p>
              <p className="text-[11px] text-slate-400">
                PDFs, PNG, JPG, JSON, CSV. Canonical key will be generated automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lineage Drawer Modal */}
      {lineageDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <GitBranch size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Document Lineage & Artifacts</h3>
                  <p className="text-[11px] text-slate-400">Original document, receipts, and structured outputs</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setLineageDoc(null);
                  setLineageData(null);
                }}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Original Document Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText size={18} className="text-blue-400" />
                  <span className="text-xs font-bold text-white">{lineageDoc.name}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">
                  {lineageDoc.category?.toUpperCase() || 'INPUT'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-2 font-mono">
                <div>Namespace: {lineageDoc.service}/{lineageDoc.module}/{lineageDoc.entityId || 'root'}</div>
                <div>Size: {formatBytes(lineageDoc.size)}</div>
                <div className="col-span-2 truncate">Storage: {lineageDoc.storageKey || 'Canonical storage'}</div>
              </div>
            </div>

            {/* Child Artifacts: Receipts & Outputs */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>Associated Artifacts (Receipts & Outputs)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/5 text-slate-400">
                  {(lineageData?.receipts?.length || 0) + (lineageData?.outputs?.length || 0)}
                </span>
              </h4>

              {isLoadingLineage ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading lineage tree...</div>
              ) : (lineageData?.receipts?.length === 0 && lineageData?.outputs?.length === 0) ? (
                <div className="p-5 text-center text-slate-500 text-xs bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                  No child receipts or outputs recorded yet for this document.
                </div>
              ) : (
                <div className="space-y-2">
                  {lineageData?.receipts?.map((rec: any) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Archive size={16} className="text-amber-400" />
                        <div>
                          <p className="text-xs font-bold text-white">{rec.name}</p>
                          <p className="text-[10px] text-amber-300 font-mono">
                            Receipt · {formatBytes(rec.size)} · {new Date(rec.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        RECEIPT
                      </span>
                    </div>
                  ))}

                  {lineageData?.outputs?.map((out: any) => (
                    <div
                      key={out.id}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <FileCode2 size={16} className="text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-white">{out.name}</p>
                          <p className="text-[10px] text-emerald-300 font-mono">
                            Structured Output · {formatBytes(out.size)} · {new Date(out.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        OUTPUT
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cross-Service References */}
            {lineageData?.references && lineageData.references.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Cross-Service Canonical References
                </h4>
                {lineageData.references.map((ref: any) => (
                  <div key={ref.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <span className="font-bold text-purple-400 uppercase">{ref.service}</span>
                    <span className="text-slate-400"> / {ref.module} / {ref.entityId}</span>
                    <span className="text-[10px] text-slate-500 ml-2">({ref.notes || 'Canonical link'})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create New Folder Modal */}
      {isCreatingFolder && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            setIsCreatingFolder(false);
            setNewFolderName('');
          }}
        >
          <div 
            className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Specular Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                  <FolderPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create New Folder</h3>
                  <p className="text-[11px] text-slate-400">
                    {currentFolder ? `Inside "${currentFolder.name}"` : 'In Central Document Vault root'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Folder Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Invoices 2026, Contracts, Q3 Reports..."
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Service Namespace
                </label>
                <select
                  value={newFolderService}
                  onChange={(e) => setNewFolderService(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="finance">Finance & Billing</option>
                  <option value="crm">CRM & Pipeline</option>
                  <option value="sales">Sales & Quotes</option>
                  <option value="hr">Human Resources</option>
                  <option value="helpdesk">Helpdesk & Support</option>
                  <option value="projects">Projects</option>
                  <option value="inventory">Inventory</option>
                  <option value="documents">General Vault</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Target Location:</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <FolderIcon size={12} />
                  <span>{currentFolder ? currentFolder.name : 'Vault Root (/)'}</span>
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim() || isSubmittingFolder}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-95 border border-emerald-400/40 cursor-pointer disabled:opacity-50"
                >
                  <FolderPlus size={14} />
                  <span>{isSubmittingFolder ? 'Creating...' : 'Create Folder'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {filteredFolders.length === 0 && filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-3xl p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <FolderOpen size={28} />
            </div>
            <div>
              <p className="text-slate-200 font-bold text-sm">
                {currentFolder
                  ? `Folder "${currentFolder.name}" is empty`
                  : activeService !== 'all'
                  ? `No documents found in "${activeService.toUpperCase()}" namespace`
                  : 'Document Vault is empty'}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Ingest files into this service namespace or create subfolders
              </p>
            </div>
            <div className="flex items-center space-x-2.5 pt-2">
              <button
                type="button"
                onClick={openCreateFolderModal}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-xs border border-white/15 transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
              >
                <FolderPlus size={14} className="text-emerald-400" />
                <span>+ New Folder</span>
              </button>
              <button
                type="button"
                onClick={openUploadModal}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95"
              >
                + Ingest Document
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders Section */}
            {filteredFolders.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <span>Folders</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/5 text-slate-400">
                    {filteredFolders.length}
                  </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredFolders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleOpenFolder(folder)}
                      className="group p-5 bg-white/[0.04] backdrop-blur-2xl hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer relative shadow-lg hover:scale-[1.02] active:scale-[0.99]"
                    >
                      <FolderIcon
                        size={40}
                        className="text-emerald-400/90 group-hover:text-emerald-400 mb-2.5 transition-colors group-hover:scale-105"
                      />
                      <span className="text-xs font-bold text-white text-center w-full truncate px-1" title={folder.name}>
                        {folder.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {folder.service || 'documents'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 font-medium">Click to open</span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id, folder.name);
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-white/10"
                        title="Delete folder"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service-Aware Documents Table */}
            {filteredDocuments.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <span>Documents</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/5 text-slate-400">
                      {filteredDocuments.length}
                    </span>
                  </h3>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/[0.04] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                      <tr>
                        <th className="py-3 px-4">Document / Name</th>
                        <th className="py-3 px-3">Service & Module</th>
                        <th className="py-3 px-3">Entity</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Size</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {filteredDocuments.map((doc) => {
                        const catStyle = CATEGORY_COLORS[doc.category?.toLowerCase()] || CATEGORY_COLORS.upload;

                        return (
                          <tr key={doc.id} className="hover:bg-white/[0.04] transition group">
                            {/* File Name & Icon */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
                                  {getFileIcon(doc.mimeType)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-white truncate max-w-xs sm:max-w-sm" title={doc.name}>
                                    {doc.originalName || doc.name}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs" title={doc.storageKey}>
                                    {doc.storageKey || `id: ${doc.id}`}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Service & Module */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white uppercase text-[11px]">
                                  {doc.service || 'documents'}
                                </span>
                                <span className="text-slate-500 text-[10px]">/ {doc.module || 'general'}</span>
                              </div>
                            </td>

                            {/* Entity Link */}
                            <td className="py-3 px-3">
                              {doc.entityId && doc.entityId !== 'root' ? (
                                <Link
                                  href={
                                    doc.module === 'deals'
                                      ? `/deals/${doc.entityId}`
                                      : doc.module === 'invoices' || doc.service === 'finance'
                                      ? `/invoices`
                                      : doc.module === 'contacts'
                                      ? `/contacts/${doc.entityId}`
                                      : `/documents?search=${encodeURIComponent(doc.entityId)}`
                                  }
                                  className="font-mono text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 font-bold group/entity"
                                  title={`Jump to ${doc.entityType || 'record'} #${doc.entityId}`}
                                >
                                  <span>{doc.entityId}</span>
                                  <ExternalLink size={10} className="opacity-0 group-hover/entity:opacity-100 transition-opacity" />
                                </Link>
                              ) : (
                                <span className="font-mono text-[11px] text-slate-500">—</span>
                              )}
                            </td>

                            {/* Category Badge */}
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                              >
                                {doc.category || 'upload'}
                              </span>
                            </td>

                            {/* Processing Status */}
                            <td className="py-3 px-3">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  doc.processingStatus === 'COMPLETED' || doc.processingStatus === 'PROCESSED'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : doc.processingStatus === 'PROCESSING' || doc.processingStatus === 'QUEUED'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : doc.processingStatus === 'FAILED'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}
                              >
                                {doc.processingStatus || 'UPLOADED'}
                              </span>
                            </td>

                            {/* Size */}
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                              {formatBytes(doc.size)}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {/* Lineage Viewer */}
                                <button
                                  type="button"
                                  onClick={() => handleViewLineage(doc)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-purple-200 transition cursor-pointer"
                                  title="View Lineage (Receipts, Outputs, References)"
                                >
                                  <GitBranch size={13} />
                                </button>

                                {/* AI OCR Scanner Shortcut for PDFs and Images */}
                                {(doc.mimeType === 'application/pdf' ||
                                  doc.mimeType?.startsWith('image/') ||
                                  doc.name?.endsWith('.pdf')) && (
                                  <Link
                                    href={`/ocr-invoice?vaultDocId=${doc.id}&name=${encodeURIComponent(doc.name)}`}
                                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 hover:text-white transition cursor-pointer"
                                    title="Scan with AI OCR"
                                  >
                                    <Sparkles size={13} />
                                  </Link>
                                )}

                                {/* Delete File */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDoc(doc.id, doc.name)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                  title="Delete from Vault"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
