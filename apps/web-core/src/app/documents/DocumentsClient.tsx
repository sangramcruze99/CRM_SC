"use client";

import { useState, useEffect } from "react";
import {
  Folder as FolderIcon,
  File as FileIcon,
  MoreVertical,
  Search,
  Upload,
  Plus,
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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith('image/')) return <FileImage className="text-blue-400" size={24} />;
  if (mimeType?.startsWith('video/')) return <FileVideo className="text-purple-400" size={24} />;
  if (mimeType?.startsWith('audio/')) return <FileAudio className="text-emerald-400" size={24} />;
  if (mimeType === 'application/pdf') return <FileText className="text-rose-400" size={24} />;
  if (mimeType === 'application/zip') return <Archive className="text-emerald-400" size={24} />;
  if (mimeType?.includes('json') || mimeType?.includes('javascript') || mimeType?.includes('text/html'))
    return <FileCode2 className="text-emerald-400" size={24} />;
  return <FileIcon className="text-slate-400" size={24} />;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function DocumentsClient({
  initialFolders,
  initialDocuments,
  currentFolder,
  currentFolderId,
}: {
  initialFolders: any[];
  initialDocuments: any[];
  currentFolder: any | null;
  currentFolderId: string;
}) {
  const [folders, setFolders] = useState(initialFolders);
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  // Sync state whenever props update on navigation
  useEffect(() => {
    setFolders(initialFolders);
    setDocuments(initialDocuments);
  }, [initialFolders, initialDocuments, currentFolderId]);

  const handleOpenFolder = (folderId: string) => {
    router.push(`/documents?folderId=${folderId}`);
  };

  const handleCreateFolder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;

    try {
      const res = await fetch(`/api/documents/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          name,
          parentId: currentFolderId === 'root' ? null : currentFolderId,
        }),
      });

      if (res.ok) {
        const newFolder = await res.json();
        setFolders((prev) => [...prev, newFolder]);
        setNewFolderName("");
        setIsCreatingFolder(false);
        router.refresh();
      }
    } catch {
      // safe fallback
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

  const handleUploadFile = async () => {
    const name = prompt("Upload File Name (e.g. quarterly_report.pdf):", "report_2026.pdf");
    if (!name) return;

    setIsUploading(true);
    try {
      const res = await fetch(`/api/documents/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          name,
          folderId: currentFolderId === 'root' ? null : currentFolderId,
          mimeType: name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
          size: Math.floor(Math.random() * 4000000) + 150000,
        }),
      });

      if (res.ok) {
        const newDoc = await res.json();
        setDocuments((prev) => [newDoc, ...prev]);
        router.refresh();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string, name: string) => {
    if (!confirm(`Delete file "${name}"?`)) return;

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

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDocuments = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white p-2">
      {/* Toolbar & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          {currentFolder ? (
            <Link
              href="/documents"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition border border-white/10"
              title="Back to All Files"
            >
              <ArrowLeft size={14} />
              <span>All Files</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <FolderIcon size={16} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white">Document Vault</h2>
                <span className="text-[11px] text-slate-400">Root Directory</span>
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
              placeholder="Search files & folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-full sm:w-56 transition-all font-medium shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingFolder(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <FolderPlus size={14} className="text-emerald-400" />
            <span>New Folder</span>
          </button>

          <button
            type="button"
            onClick={handleUploadFile}
            disabled={isUploading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-95 border border-emerald-400/40 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Upload size={14} />
            <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
          </button>
        </div>
      </div>

      {/* Inline Create Folder Input Modal */}
      {isCreatingFolder && (
        <form
          onSubmit={handleCreateFolder}
          className="flex items-center space-x-2 bg-slate-900/90 border border-emerald-500/40 p-3 rounded-2xl backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <FolderPlus size={18} className="text-emerald-400 ml-1 shrink-0" />
          <input
            type="text"
            placeholder="Enter folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreatingFolder(false);
              setNewFolderName("");
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-medium text-xs transition"
          >
            Cancel
          </button>
        </form>
      )}

      {/* File Explorer Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredFolders.length === 0 && filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-3xl p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <FolderOpen size={28} />
            </div>
            <div>
              <p className="text-slate-200 font-bold text-sm">
                {currentFolder ? `Folder "${currentFolder.name}" is empty` : 'Document Vault is empty'}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Create a subfolder or upload files directly into this directory
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={handleUploadFile}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition"
              >
                + Upload File Here
              </button>
              {currentFolder && (
                <Link
                  href="/documents"
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition"
                >
                  ← Back to All Files
                </Link>
              )}
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
                      onClick={() => handleOpenFolder(folder.id)}
                      className="group p-5 bg-white/[0.04] backdrop-blur-2xl hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer relative shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:scale-[1.02] active:scale-[0.99]"
                    >
                      <FolderIcon
                        size={44}
                        className="text-emerald-400/90 group-hover:text-emerald-400 mb-2.5 transition-colors group-hover:scale-105"
                      />
                      <span className="text-xs font-bold text-white text-center w-full truncate px-1" title={folder.name}>
                        {folder.name}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 font-medium">Click to open</span>

                      {/* Delete Folder Button */}
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

            {/* Documents Section */}
            {filteredDocuments.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <span>Files</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/5 text-slate-400">
                    {filteredDocuments.length}
                  </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="group p-5 bg-white/[0.04] backdrop-blur-2xl hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl flex flex-col items-center justify-center transition-all relative shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                    >
                      <div className="h-14 flex items-center justify-center mb-2">
                        {getFileIcon(doc.mimeType)}
                      </div>
                      <span className="text-xs font-bold text-white text-center w-full truncate px-1" title={doc.name}>
                        {doc.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono font-medium">
                        {formatBytes(doc.size)}
                      </span>

                      {/* Delete File Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc.id, doc.name);
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-white/10"
                        title="Delete file"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
