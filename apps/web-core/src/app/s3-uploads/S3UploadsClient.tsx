'use client';

import { useState } from 'react';
import { UploadCloud, File, Download, CheckCircle, HardDrive, Copy, Cloud } from 'lucide-react';

interface S3File {
  id: string;
  filename: string;
  fileSize: string;
  mimeType: string;
  bucket: string;
  uploadedDate: string;
  url: string;
}

const initialDemoFiles: S3File[] = [];

export function S3UploadsClient({ initialFiles = [] }: { initialFiles?: any[] }) {
  const [files, setFiles] = useState<S3File[]>(
    initialFiles.length > 0 ? initialFiles : initialDemoFiles
  );
  const [isUploading, setIsUploading] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  function handleSimulateUpload() {
    setIsUploading(true);
    setTimeout(() => {
      const newFile: S3File = {
        id: `s3_${Math.floor(100 + Math.random() * 900)}`,
        filename: `Uploaded_Asset_${Date.now().toString().slice(-4)}.pdf`,
        fileSize: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
        mimeType: 'application/pdf',
        bucket: 'businessos-enterprise-vault',
        uploadedDate: new Date().toISOString().split('T')[0],
        url: `https://s3.us-east-2.amazonaws.com/businessos-vault/asset-${Date.now()}.pdf`,
      };
      setFiles([newFile, ...files]);
      setIsUploading(false);
      setAlert(`Uploaded "${newFile.filename}" directly to AWS S3 vault!`);
      setTimeout(() => setAlert(null), 3000);
    }, 1500);
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard?.writeText(url);
    setAlert('Pre-signed S3 URL copied to clipboard!');
    setTimeout(() => setAlert(null), 2500);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Cloud className="text-emerald-400" size={24} />
            AWS S3 Direct Storage Vault
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Secure multi-part cloud uploads with pre-signed URLs, IAM encryption, and direct downloads.
          </p>
        </div>
        <button
          onClick={handleSimulateUpload}
          disabled={isUploading}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <UploadCloud size={16} />
          <span>{isUploading ? 'Uploading to S3...' : 'Upload File to S3'}</span>
        </button>
      </div>

      {/* Storage Gauge */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-2xs">
              <HardDrive size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Active Vault Storage Allocation</h3>
              <p className="text-xs text-slate-400 font-medium">AWS us-east-2 (Ohio) — businessos-enterprise-vault</p>
            </div>
          </div>
          <span className="font-mono text-sm font-extrabold text-white">67.9 MB / 100 GB</span>
        </div>

        <div className="w-full bg-white/[0.08] h-2.5 rounded-full overflow-hidden border border-white/10">
          <div style={{ width: '4%' }} className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" />
        </div>
      </div>

      {/* Uploads Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">File Name</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">S3 Bucket</th>
              <th className="px-6 py-4">Uploaded</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white flex items-center gap-2 text-sm">
                    <File size={16} className="text-emerald-400 flex-shrink-0" />
                    <span className="truncate max-w-sm">{file.filename}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 font-semibold">{file.id}</div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-300 font-semibold">{file.fileSize}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{file.bucket}</td>
                <td className="px-6 py-4 text-xs text-slate-400 font-medium">{file.uploadedDate}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleCopyUrl(file.url)}
                      className="p-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-lg text-xs transition-colors border border-white/[0.1] cursor-pointer"
                      title="Copy S3 URL"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setAlert(`Downloading ${file.filename}...`);
                        setTimeout(() => setAlert(null), 2500);
                      }}
                      className="p-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-lg text-xs transition-colors border border-white/[0.1] cursor-pointer"
                      title="Download from S3"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                  No files uploaded to S3 vault yet. Upload an asset or document above to generate secure presigned S3 URLs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
