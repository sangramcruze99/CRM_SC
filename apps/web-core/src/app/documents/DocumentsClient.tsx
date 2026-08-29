"use client";

import { useState } from "react";
import { Folder as FolderIcon, File as FileIcon, MoreVertical, Search, Upload, Plus, ChevronRight, FileText, FileImage, FileAudio, FileVideo, Archive, FileCode2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <FileImage className="text-blue-400" size={24} />;
  if (mimeType.startsWith('video/')) return <FileVideo className="text-purple-400" size={24} />;
  if (mimeType.startsWith('audio/')) return <FileAudio className="text-amber-400" size={24} />;
  if (mimeType === 'application/pdf') return <FileText className="text-rose-400" size={24} />;
  if (mimeType === 'application/zip') return <Archive className="text-emerald-400" size={24} />;
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('text/html')) return <FileCode2 className="text-amber-400" size={24} />;
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
  currentFolderId
}: { 
  initialFolders: any[], 
  initialDocuments: any[],
  currentFolder: any | null,
  currentFolderId: string
}) {
  const [folders, setFolders] = useState(initialFolders);
  const [documents, setDocuments] = useState(initialDocuments);
  const router = useRouter();

  const handleCreateFolder = async () => {
    const name = prompt("Folder name:");
    if (!name) return;
    
    const res = await fetch(`/api/documents/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'default-tenant'
      },
      body: JSON.stringify({ name, parentId: currentFolderId })
    });
    
    if (res.ok) {
      const newFolder = await res.json();
      setFolders([...folders, newFolder]);
      router.refresh();
    }
  };

  const handleUploadFile = async () => {
    const name = prompt("Mock File Name (e.g. presentation.pdf):", "new_document.pdf");
    if (!name) return;
    
    const res = await fetch(`/api/documents/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'default-tenant'
      },
      body: JSON.stringify({ 
        name, 
        folderId: currentFolderId,
        mimeType: name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
        size: Math.floor(Math.random() * 5000000) + 10240
      })
    });
    
    if (res.ok) {
      const newDoc = await res.json();
      setDocuments([newDoc, ...documents]);
      router.refresh();
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Link href="/documents" className="hover:text-amber-400 transition-colors">Files & Assets</Link>
          {currentFolder && (
            <>
              <ChevronRight size={14} className="text-slate-500" />
              <span className="text-white font-bold">{currentFolder.name}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] w-56 transition-all font-medium shadow-xs"
            />
          </div>
          <button 
            onClick={handleCreateFolder}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] shadow-xs cursor-pointer"
          >
            <FolderIcon size={14} className="text-amber-400" />
            <span>New Folder</span>
          </button>
          <button 
            onClick={handleUploadFile}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* File Explorer Grid */}
      <div className="flex-1 overflow-y-auto">
        {(folders.length === 0 && documents.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-3xl">
            <Upload size={40} className="text-slate-600 mb-3" />
            <p className="text-slate-300 font-bold text-sm">This folder is empty</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Upload a file or create a folder to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {/* Folders */}
            {folders.map(folder => (
              <Link 
                href={`/documents?folderId=${folder.id}`} 
                key={folder.id}
                className="group p-5 bg-white/[0.04] backdrop-blur-2xl hover:bg-white/[0.08] border border-white/[0.08] hover:border-amber-500/40 rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer relative shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
              >
                <FolderIcon size={44} className="text-amber-400/90 group-hover:text-amber-400 mb-2.5 transition-colors" />
                <span className="text-xs font-bold text-white text-center w-full truncate px-1">{folder.name}</span>
                <button className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={13} />
                </button>
              </Link>
            ))}

            {/* Documents */}
            {documents.map(doc => (
              <div 
                key={doc.id}
                className="group p-5 bg-white/[0.04] backdrop-blur-2xl hover:bg-white/[0.08] border border-white/[0.08] hover:border-amber-500/40 rounded-3xl flex flex-col items-center justify-center transition-all relative shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
              >
                <div className="h-14 flex items-center justify-center mb-2">
                  {getFileIcon(doc.mimeType)}
                </div>
                <span className="text-xs font-bold text-white text-center w-full truncate px-1">{doc.name}</span>
                <span className="text-[10px] text-slate-400 mt-1 font-mono font-medium">{formatBytes(doc.size)}</span>
                <button className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
