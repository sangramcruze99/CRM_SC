'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Loader2, FileText, X, Sparkles } from 'lucide-react';

export default function SmartUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleProcess = async () => {
    if (!preview) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ai/ocr/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Data: preview }),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process document');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-6xl mx-auto text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Sparkles className="text-amber-400" size={24} />
          Smart Ingestion & Schema Synthesizer
        </h1>
        <p className="text-sm text-slate-400 mt-1">Upload an invoice, receipt, or agreement. Our AI will automatically infer a relational schema and extract the structured data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Upload Column */}
        <div className="space-y-6">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">1. Upload Document Source</h2>
              {file && (
                <button onClick={reset} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="p-6">
              {!file ? (
                <div 
                  className="border-2 border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-amber-400/50 hover:bg-white/[0.02] transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-2xs">
                    <UploadCloud size={28} />
                  </div>
                  <p className="text-white font-bold text-sm mb-1">Click to upload or drag & drop</p>
                  <p className="text-slate-400 text-xs font-medium">PNG, JPG, PDF documents up to 10MB</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                    <div className="w-10 h-10 bg-amber-500/15 text-amber-400 flex items-center justify-center rounded-xl border border-amber-500/30">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-white font-bold text-xs truncate">{file.name}</p>
                      <p className="text-slate-400 text-[11px]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <CheckCircle className="text-emerald-400" size={18} />
                  </div>
                  
                  {preview && file.type.startsWith('image/') && (
                    <div className="relative h-60 rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
                      <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-contain" />
                    </div>
                  )}
                  
                  <button 
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Analyzing Document with Neural Vision...</span>
                      </>
                    ) : (
                      <>
                        <span>Extract Data & Infer Schema</span>
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          <div className={`bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-opacity duration-300 ${result ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
              <h2 className="text-sm font-bold text-white">2. Review Inferred Schema & Data</h2>
            </div>
            
            {result ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-amber-400 mb-3 uppercase tracking-wider">Inferred Custom Object Schema</h3>
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-xs">{result.schema?.name}</span>
                      <span className="text-[11px] bg-amber-500/15 border border-amber-500/30 font-mono text-amber-300 px-2 py-0.5 rounded-lg font-bold">API: {result.schema?.apiName}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{result.schema?.description}</p>
                    
                    <div className="space-y-1.5">
                      {result.schema?.fields?.map((field: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-t border-white/[0.06] font-medium">
                          <span className="text-slate-300">{field.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded">{field.fieldType}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-emerald-400 mb-3 uppercase tracking-wider">Extracted Entity Values</h3>
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-2">
                    {Object.entries(result.data || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start border-b border-white/[0.06] pb-1.5 last:border-0 last:pb-0 text-xs">
                        <span className="text-slate-400 font-mono font-medium">{key}</span>
                        <span className="text-white text-right font-semibold max-w-[60%]">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/25 cursor-pointer">
                  Accept Schema & Commit Entity
                </button>
              </div>
            ) : (
              <div className="p-6 h-64 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white/[0.06] rounded-2xl flex items-center justify-center mb-3">
                  <CheckCircle size={22} className="text-slate-500" />
                </div>
                <p className="text-xs font-medium text-slate-500">Awaiting document extraction...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
