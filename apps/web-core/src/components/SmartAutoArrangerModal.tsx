'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  X,
  Upload,
  ChevronDown,
  Sparkles,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  FolderOpen,
  Folder,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { importArrangedLeads, ArrangedLeadPayload } from '../app/actions';

export interface SmartAutoArrangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFile?: File | null;
  onSuccess?: (count: number) => void;
}

interface AttributeField {
  key: string;
  label: string;
  required?: boolean;
  synonyms: string[];
  isCustom?: boolean;
}

const BASE_ATTRIBUTES: AttributeField[] = [
  {
    key: 'name',
    label: 'NAME *',
    required: true,
    synonyms: [
      'name',
      'customer_id',
      'client',
      'full_name',
      'contact_name',
      'lead_name',
      'account_name',
      'first_name',
      'customer',
      'contact',
      'id',
      'cust_id',
    ],
  },
  {
    key: 'phone',
    label: 'PHONE / PH. NO *',
    required: true,
    synonyms: [
      'phone',
      'phone_no',
      'ph. no',
      'ph_no',
      'mobile',
      'telephone',
      'contact_number',
      'cell',
      'tel',
    ],
  },
  {
    key: 'age',
    label: 'AGE',
    synonyms: ['age', 'years', 'dob', 'birth_year'],
  },
  {
    key: 'address',
    label: 'ADDRESS',
    synonyms: ['address', 'location', 'street', 'city', 'state', 'zip', 'country', 'residence'],
  },
  {
    key: 'email',
    label: 'EMAIL',
    synonyms: ['email', 'email_address', 'e-mail', 'mail', 'contact_email'],
  },
  {
    key: 'company',
    label: 'COMPANY',
    synonyms: ['company', 'organization', 'company_name', 'account', 'firm', 'employer', 'org'],
  },
  {
    key: 'leadScore',
    label: 'LEAD SCORE',
    synonyms: ['score', 'lead_score', 'rating', 'priority', 'rank'],
  },
  {
    key: 'tags',
    label: 'TAGS',
    synonyms: ['tag', 'tags', 'category', 'segment', 'type', 'group', 'label'],
  },
];

export function SmartAutoArrangerModal({
  isOpen,
  onClose,
  initialFile = null,
  onSuccess,
}: SmartAutoArrangerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(initialFile);
  const [fileName, setFileName] = useState<string>('spreadsheet.xlsx');
  const [folderName, setFolderName] = useState<string>('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  
  // Custom extra attributes discovered from file headers or added by user
  const [customAttributes, setCustomAttributes] = useState<AttributeField[]>([]);
  
  // Attribute key -> Chosen Spreadsheet Header
  const [mappings, setMappings] = useState<Record<string, string>>({});
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialFile) {
      processFile(initialFile);
    }
  }, [initialFile]);

  // Combined list of all attribute cards
  const allAttributes = useMemo(() => {
    return [...BASE_ATTRIBUTES, ...customAttributes];
  }, [customAttributes]);

  // Process file with XLSX (handles .xlsx, .xlsm, .xls, .csv, .tsv)
  const processFile = async (uploadedFile: File) => {
    setIsProcessing(true);
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setFolderName(uploadedFile.name.replace(/\.[^/.]+$/, ''));
    setStatusMessage(null);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonData.length === 0) {
        setStatusMessage('Uploaded spreadsheet contains no data rows.');
        setIsProcessing(false);
        return;
      }

      // Extract detected column headers
      const detectedHeaders = Object.keys(jsonData[0] || {});
      setRawHeaders(detectedHeaders);
      setRawRows(jsonData);

      // Auto-arrange columns using smart semantic matching
      const autoMatched: Record<string, string> = {};
      const usedHeaders = new Set<string>();

      // 1. Match Base standard attributes
      BASE_ATTRIBUTES.forEach((attr) => {
        // Priority 1: Exact or synonym match
        let bestMatch = detectedHeaders.find((header) => {
          if (usedHeaders.has(header)) return false;
          const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
          return attr.synonyms.some((syn) => {
            const synNorm = syn.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalized === synNorm;
          });
        });

        // Priority 2: Substring match
        if (!bestMatch) {
          bestMatch = detectedHeaders.find((header) => {
            if (usedHeaders.has(header)) return false;
            const normalized = header.toLowerCase();
            return attr.synonyms.some((syn) => normalized.includes(syn));
          });
        }

        if (bestMatch) {
          autoMatched[attr.key] = bestMatch;
          usedHeaders.add(bestMatch);
        } else {
          autoMatched[attr.key] = ''; // unmapped
        }
      });

      // 2. Discover remaining spreadsheet columns and automatically create custom attribute cards
      const remainingHeaders = detectedHeaders.filter((h) => !usedHeaders.has(h));
      const newCustomAttrs: AttributeField[] = remainingHeaders.map((header) => {
        const cleanKey = header.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        autoMatched[cleanKey] = header;
        usedHeaders.add(header);
        return {
          key: cleanKey,
          label: header.toUpperCase(),
          synonyms: [header.toLowerCase()],
          isCustom: true,
        };
      });

      setCustomAttributes(newCustomAttrs);
      setMappings(autoMatched);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Error parsing spreadsheet:', err);
      setStatusMessage(`Error parsing file: ${err.message || 'Unsupported format'}`);
      setIsProcessing(false);
    }
  };

  const handleMappingChange = (attrKey: string, headerValue: string) => {
    setMappings((prev) => ({
      ...prev,
      [attrKey]: headerValue === '-- None --' ? '' : headerValue,
    }));
  };

  const handleRemoveCustomAttribute = (attrKey: string) => {
    setCustomAttributes((prev) => prev.filter((a) => a.key !== attrKey));
    setMappings((prev) => {
      const copy = { ...prev };
      delete copy[attrKey];
      return copy;
    });
  };

  const handleAddCustomField = () => {
    const fieldName = window.prompt('Enter new custom column name (e.g. Salary, Country, Plan):');
    if (!fieldName || !fieldName.trim()) return;

    const trimmed = fieldName.trim();
    const cleanKey = trimmed.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Avoid duplicates
    if (allAttributes.some((a) => a.key === cleanKey)) {
      alert('A column with this name already exists.');
      return;
    }

    const newAttr: AttributeField = {
      key: cleanKey,
      label: trimmed.toUpperCase(),
      synonyms: [trimmed.toLowerCase()],
      isCustom: true,
    };

    setCustomAttributes((prev) => [...prev, newAttr]);
    setMappings((prev) => ({ ...prev, [cleanKey]: '' }));
  };

  // Dynamically determine which columns to display in preview table
  // Shows every attribute that has a mapped column selected
  const activePreviewColumns = useMemo(() => {
    return allAttributes.filter((attr) => Boolean(mappings[attr.key]));
  }, [allAttributes, mappings]);

  // Preview the first 5 records with current mapping
  const previewRows = useMemo(() => {
    return rawRows.slice(0, 5).map((row) => {
      const mapped: Record<string, string> = {};
      allAttributes.forEach((attr) => {
        const sourceHeader = mappings[attr.key];
        mapped[attr.key] = sourceHeader && row[sourceHeader] !== undefined && row[sourceHeader] !== ''
          ? String(row[sourceHeader])
          : '—';
      });
      return mapped;
    });
  }, [rawRows, allAttributes, mappings]);

  // Ingest records into live CRM
  const handleConfirmImport = async () => {
    if (rawRows.length === 0) return;

    setIsImporting(true);
    setStatusMessage(null);

    const nameCol = mappings['name'];
    const phoneCol = mappings['phone'];
    const emailCol = mappings['email'];
    const companyCol = mappings['company'];

    const batchId = `batch_${Date.now()}`;
    const finalFolderName = folderName.trim() || fileName.replace(/\.[^/.]+$/, '');

    const payloads: ArrangedLeadPayload[] = rawRows.map((row) => {
      const rawName = nameCol && row[nameCol] ? String(row[nameCol]).trim() : '';
      const nameParts = rawName ? rawName.split(' ') : ['Lead'];
      const firstName = nameParts[0] || rawName || 'Lead';
      const lastName = nameParts.slice(1).join(' ') || '';

      const customObj: Record<string, any> = {
        folderName: finalFolderName,
        batchId,
        batchFileName: fileName,
        importedAt: new Date().toISOString(),
      };

      // Store all mapped attributes into customData
      allAttributes.forEach((attr) => {
        const sourceHeader = mappings[attr.key];
        if (sourceHeader && row[sourceHeader] !== undefined && row[sourceHeader] !== '') {
          customObj[attr.key] = row[sourceHeader];
        }
      });

      // Also preserve any unmapped raw columns
      rawHeaders.forEach((h) => {
        if (!Object.values(mappings).includes(h) && row[h] !== undefined && row[h] !== '') {
          customObj[h] = row[h];
        }
      });

      return {
        firstName,
        lastName,
        email: emailCol && row[emailCol] ? String(row[emailCol]).trim() : undefined,
        phone: phoneCol && row[phoneCol] ? String(row[phoneCol]).trim() : undefined,
        companyId: companyCol && row[companyCol] ? String(row[companyCol]).trim() : undefined,
        customData: JSON.stringify(customObj),
      };
    });

    try {
      const res = await importArrangedLeads(payloads);
      setIsImporting(false);
      if (res.success) {
        if (onSuccess) onSuccess(res.importedCount);
        onClose();
      } else {
        setStatusMessage('Import finished with partial errors.');
      }
    } catch (err: any) {
      setIsImporting(false);
      setStatusMessage(`Import failed: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[94vh] overflow-y-auto bg-[#0B0E14] border border-slate-800/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-slate-200 flex flex-col">
        
        {/* Hidden File Picker to change file */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv, .xlsx, .xlsm, .xls, .tsv, .json"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) processFile(f);
          }}
        />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Smart Auto-Arranger & Lead Ingestion
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Arranged <span className="font-bold text-white">{rawRows.length} rows</span> from{' '}
                <span
                  className="font-mono text-blue-400 underline decoration-blue-500/40 cursor-pointer"
                  title="Click to replace spreadsheet"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {fileName}
                </span>
                {' '}({rawHeaders.length} columns detected)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Status Alert if any */}
          {statusMessage && (
            <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Section 1: Automatic Column Mapping */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                  AUTOMATIC COLUMN MAPPING
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Our neural system automatically matched your spreadsheet columns to CRM standard & custom attributes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                  <span>Add Column</span>
                </button>

                <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Auto-Arranged ({activePreviewColumns.length} Active)</span>
                </div>
              </div>
            </div>

            {/* Flexible Mapping Grid: All Attributes (Standard + Discovered Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
              {allAttributes.map((attr) => {
                const currentVal = mappings[attr.key] || '';
                return (
                  <div
                    key={attr.key}
                    className={`p-3.5 bg-[#121622] border rounded-2xl space-y-2 hover:border-slate-700 transition-colors ${
                      attr.isCustom ? 'border-blue-900/40 bg-blue-950/10' : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 truncate max-w-[170px]" title={attr.label}>
                        <span>{attr.label}</span>
                        {attr.isCustom && (
                          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 rounded font-mono">
                            custom
                          </span>
                        )}
                      </label>

                      <div className="flex items-center gap-1">
                        {currentVal && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Mapped"></span>
                        )}
                        {attr.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomAttribute(attr.key)}
                            className="text-slate-600 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                            title="Remove attribute"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <select
                        value={currentVal || '-- None --'}
                        onChange={(e) => handleMappingChange(attr.key, e.target.value)}
                        className="w-full bg-[#080B10] border border-slate-700/80 text-white rounded-xl px-3 py-2 pr-8 text-xs font-mono appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="-- None --">-- None --</option>
                        {rawHeaders.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Batch Folder Destination Card */}
          <div className="p-4 bg-[#121622] border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <FolderOpen size={18} />
              </div>
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Save Batch As Dedicated Folder</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                    Bulk Folder Grouping
                  </span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  All {rawRows.length} contacts will be grouped into this folder for instant filtering and 1-click bulk deletion.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Folder Name:</span>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Folder name..."
                className="px-3 py-1.5 bg-[#080B10] border border-slate-700/80 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 min-w-[220px]"
              />
            </div>
          </div>

          {/* Section 2: Dynamic Preview Table (Shows ALL active mapped columns) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                PREVIEW FIRST 5 AUTO-ARRANGED RECORDS ({activePreviewColumns.length} COLUMNS DISPLAYED)
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {rawRows.length} total records in file
              </span>
            </div>

            <div className="border border-slate-800/90 rounded-2xl overflow-hidden bg-[#080B10]/70 backdrop-blur-md">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-[#121622] border-b border-slate-800/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider sticky top-0 z-10">
                    <tr>
                      {activePreviewColumns.map((attr) => (
                        <th key={attr.key} className="px-5 py-3 text-slate-300 font-bold">
                          {attr.key === 'name' ? 'ARRANGED NAME' : attr.label.replace(' *', '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {previewRows.length === 0 ? (
                      <tr>
                        <td colSpan={activePreviewColumns.length || 1} className="px-5 py-6 text-center text-slate-500 italic">
                          No rows available to preview.
                        </td>
                      </tr>
                    ) : (
                      previewRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          {activePreviewColumns.map((attr) => (
                            <td key={attr.key} className="px-5 py-3">
                              {row[attr.key] !== '—' ? (
                                <span className={attr.key === 'name' ? 'font-bold text-white' : 'text-slate-300'}>
                                  {row[attr.key]}
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 px-6 border-t border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#080B10]/90">
          <div className="text-xs text-slate-400">
            Ready to commit <span className="font-bold text-white">{rawRows.length} contacts</span> ({activePreviewColumns.length} mapped fields) to CRM
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting || rawRows.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isImporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Importing {rawRows.length} Leads...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Confirm & Import Leads</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
