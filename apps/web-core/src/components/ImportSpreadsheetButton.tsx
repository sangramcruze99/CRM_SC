'use client';

import React, { useState, useRef } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import { SmartAutoArrangerModal } from './SmartAutoArrangerModal';
import { useRouter } from 'next/navigation';

export function ImportSpreadsheetButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsModalOpen(true);
    }
    // reset input so the same file can be chosen again if needed
    e.target.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv, .xlsx, .xlsm, .xls, .tsv, .json"
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl transition-all shadow-xs border border-slate-200 dark:border-white/[0.1] flex items-center space-x-1.5 cursor-pointer active:scale-[0.98]"
        title="Upload CSV, Excel (.xlsx), or Macro-Enabled (.xlsm) spreadsheet"
      >
        <Upload size={14} className="text-emerald-600 dark:text-emerald-400" />
        <span>Import CSV / XLSM</span>
      </button>

      {isModalOpen && (
        <SmartAutoArrangerModal
          isOpen={isModalOpen}
          initialFile={selectedFile}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFile(null);
          }}
          onSuccess={(count) => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
