'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Building,
  Mail,
  Phone,
  Search,
  SlidersHorizontal,
  Download,
  Trash2,
  Check,
  ChevronDown,
  Sparkles,
  MapPin,
  Tag,
  Star,
  Folder,
  FolderOpen,
  Calendar,
  Layers,
  RotateCcw,
  Loader2,
  Edit3,
  FolderPlus,
  FolderMinus,
  CheckSquare,
  Square,
} from 'lucide-react';
import { DeleteActionButton } from './DeleteActionButton';
import {
  deleteContact,
  deleteBatchContacts,
  renameBatchFolder,
  moveContactsToFolder,
  removeFolderFromContacts,
  deleteFolderOnly,
} from '../app/actions';
import { useRouter } from 'next/navigation';

export interface ContactRecord {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  companyId?: string | null;
  company?: { id: string; name: string } | null;
  customData?: string | Record<string, any> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface DynamicContactsDataGridProps {
  contacts: ContactRecord[];
}

interface BatchFolder {
  name: string;
  contactIds: string[];
  batchId?: string;
  importedAt?: string;
}

// Convert camelCase or snake_case key to clean title
function formatColumnTitle(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

export function DynamicContactsDataGrid({ contacts }: DynamicContactsDataGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  // Parse customData for all contacts
  const processedContacts = useMemo(() => {
    return contacts.map((c) => {
      let customObj: Record<string, any> = {};
      if (typeof c.customData === 'string') {
        try {
          customObj = JSON.parse(c.customData);
        } catch {
          customObj = {};
        }
      } else if (typeof c.customData === 'object' && c.customData !== null) {
        customObj = c.customData;
      }
      return {
        ...c,
        parsedCustom: customObj,
      };
    });
  }, [contacts]);

  // Extract all batch folders from imported contacts
  const batchFolders: BatchFolder[] = useMemo(() => {
    const folderMap = new Map<string, BatchFolder>();

    processedContacts.forEach((c) => {
      const fName = c.parsedCustom?.folderName || c.parsedCustom?.batchFileName || null;
      if (fName) {
        if (!folderMap.has(fName)) {
          folderMap.set(fName, {
            name: fName,
            contactIds: [],
            batchId: c.parsedCustom?.batchId,
            importedAt: c.parsedCustom?.importedAt,
          });
        }
        folderMap.get(fName)!.contactIds.push(c.id);
      }
    });

    return Array.from(folderMap.values()).sort((a, b) => b.contactIds.length - a.contactIds.length);
  }, [processedContacts]);

  // Active folder details
  const activeFolder = useMemo(() => {
    if (selectedFolder === 'all') return null;
    return batchFolders.find((f) => f.name === selectedFolder) || null;
  }, [selectedFolder, batchFolders]);

  // Contacts filtered by selected folder
  const folderFilteredContacts = useMemo(() => {
    if (selectedFolder === 'all') return processedContacts;
    return processedContacts.filter((c) => {
      const fName = c.parsedCustom?.folderName || c.parsedCustom?.batchFileName;
      return fName === selectedFolder;
    });
  }, [processedContacts, selectedFolder]);

  // Discover all unique custom columns across currently filtered contacts (excluding internal batch fields)
  const discoveredCustomKeys = useMemo(() => {
    const internalKeys = [
      'name',
      'firstName',
      'lastName',
      'email',
      'phone',
      'company',
      'companyId',
      'folderName',
      'batchId',
      'batchFileName',
      'importedAt',
    ];
    const keySet = new Set<string>();
    folderFilteredContacts.forEach((c) => {
      Object.keys(c.parsedCustom || {}).forEach((k) => {
        if (!internalKeys.includes(k)) {
          keySet.add(k);
        }
      });
    });
    return Array.from(keySet);
  }, [folderFilteredContacts]);

  // Standard column keys
  const standardColumns = [
    { key: 'company', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
  ];

  // Column visibility state: all columns active by default
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});

  const activeColumnKeys = useMemo(() => {
    const all = [...standardColumns.map((c) => c.key), ...discoveredCustomKeys];
    return all.filter((k) => (visibleColumns[k] !== undefined ? visibleColumns[k] : true));
  }, [standardColumns, discoveredCustomKeys, visibleColumns]);

  const toggleColumn = (colKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colKey]: prev[colKey] !== undefined ? !prev[colKey] : false,
    }));
  };

  // Filter contacts by search query
  const finalFilteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return folderFilteredContacts;
    const q = searchQuery.toLowerCase();

    return folderFilteredContacts.filter((c) => {
      const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const company = (c.company?.name || '').toLowerCase();

      if (fullName.includes(q) || email.includes(q) || phone.includes(q) || company.includes(q)) {
        return true;
      }

      return Object.values(c.parsedCustom || {}).some((val) =>
        String(val).toLowerCase().includes(q)
      );
    });
  }, [folderFilteredContacts, searchQuery]);

  // Export CSV
  const handleExportCsv = () => {
    if (finalFilteredContacts.length === 0) return;

    const headers = ['First Name', 'Last Name', 'Company', 'Email', 'Phone', ...discoveredCustomKeys.map(formatColumnTitle)];
    const rows = finalFilteredContacts.map((c) => {
      const base = [
        `"${c.firstName || ''}"`,
        `"${c.lastName || ''}"`,
        `"${c.company?.name || ''}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
      ];
      const customVals = discoveredCustomKeys.map((k) => `"${c.parsedCustom[k] !== undefined ? c.parsedCustom[k] : ''}"`);
      return [...base, ...customVals].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedFolder === 'all' ? 'all_contacts' : selectedFolder}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isRenaming, setIsRenaming] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isDeletingFolderOnly, setIsDeletingFolderOnly] = useState(false);
  const [isBatchActionInProgress, setIsBatchActionInProgress] = useState(false);

  // Toggle single contact selection
  const handleToggleSelectContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle all contacts in current view
  const handleToggleSelectAll = () => {
    if (selectedContactIds.length === finalFilteredContacts.length && finalFilteredContacts.length > 0) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(finalFilteredContacts.map((c) => c.id));
    }
  };

  // Rename current active folder
  const handleRenameFolder = async () => {
    if (!activeFolder) return;
    const newName = window.prompt(`Rename folder "${activeFolder.name}" to:`, activeFolder.name);
    if (!newName || !newName.trim() || newName.trim() === activeFolder.name) return;

    setIsRenaming(true);
    try {
      const res = await renameBatchFolder(activeFolder.name, newName.trim());
      if (res.success && res.newFolderName) {
        setSelectedFolder(res.newFolderName);
        router.refresh();
      }
    } catch (err) {
      console.error('Error renaming folder:', err);
      alert('Failed to rename folder.');
    } finally {
      setIsRenaming(false);
    }
  };

  // Create empty folder or switch to new named category
  const handleCreateNewFolder = () => {
    const folderName = window.prompt('Enter new folder name (e.g. Inbound Q4, VIP Accounts):');
    if (!folderName || !folderName.trim()) return;
    const trimmed = folderName.trim();
    setSelectedFolder(trimmed);
  };

  // Option 1: Delete folder ONLY (untags folder so leads remain in All Contacts)
  const handleDeleteFolderOnly = async () => {
    if (!activeFolder) return;
    const confirmed = window.confirm(
      `Remove folder "${activeFolder.name}"?\n\nAll ${activeFolder.contactIds.length} leads will REMAIN SAFE in "All Contacts". Only the folder category will be deleted.`
    );
    if (!confirmed) return;

    setIsDeletingFolderOnly(true);
    try {
      await deleteFolderOnly(activeFolder.name);
      setSelectedFolder('all');
      setSelectedContactIds([]);
      router.refresh();
    } catch (err) {
      console.error('Failed to remove folder:', err);
      alert('Error removing folder.');
    } finally {
      setIsDeletingFolderOnly(false);
    }
  };

  // Option 2: Delete entire batch folder AND purge all leads inside it
  const handleDeleteActiveBatch = async () => {
    if (!activeFolder) return;
    const confirmed = window.confirm(
      ` PERMANENT DELETE:\nAre you sure you want to permanently delete folder "${activeFolder.name}" AND PURGE ALL ${activeFolder.contactIds.length} leads inside it?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeletingBatch(true);
    try {
      await deleteBatchContacts(activeFolder.contactIds);
      setSelectedFolder('all');
      setSelectedContactIds([]);
      router.refresh();
    } catch (err) {
      console.error('Failed to delete batch:', err);
      alert('Error deleting batch folder contacts.');
    } finally {
      setIsDeletingBatch(false);
    }
  };

  // Mark/Delete selected leads from CRM
  const handleDeleteSelectedLeads = async () => {
    if (selectedContactIds.length === 0) return;
    const confirmed = window.confirm(
      `Permanently delete ${selectedContactIds.length} selected lead(s) from CRM?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setIsBatchActionInProgress(true);
    try {
      await deleteBatchContacts(selectedContactIds);
      setSelectedContactIds([]);
      router.refresh();
    } catch (err) {
      console.error('Error deleting selected leads:', err);
      alert('Error deleting leads.');
    } finally {
      setIsBatchActionInProgress(false);
    }
  };

  // Remove selected leads from current folder (they remain safe in All Contacts)
  const handleRemoveSelectedFromFolder = async () => {
    if (selectedContactIds.length === 0) return;
    const confirmed = window.confirm(
      `Remove ${selectedContactIds.length} lead(s) from folder "${activeFolder?.name || 'this folder'}"?\n\nThey will remain safe in "All Contacts".`
    );
    if (!confirmed) return;

    setIsBatchActionInProgress(true);
    try {
      await removeFolderFromContacts(selectedContactIds);
      setSelectedContactIds([]);
      router.refresh();
    } catch (err) {
      console.error('Error removing leads from folder:', err);
      alert('Error removing leads from folder.');
    } finally {
      setIsBatchActionInProgress(false);
    }
  };

  // Move selected leads to another folder
  const handleMoveSelectedToFolder = async () => {
    if (selectedContactIds.length === 0) return;
    const destFolder = window.prompt(
      `Move ${selectedContactIds.length} selected lead(s) to folder (enter folder name):`,
      activeFolder?.name || 'Inbound Leads'
    );
    if (!destFolder || !destFolder.trim()) return;

    setIsBatchActionInProgress(true);
    try {
      await moveContactsToFolder(selectedContactIds, destFolder.trim());
      setSelectedContactIds([]);
      setSelectedFolder(destFolder.trim());
      router.refresh();
    } catch (err) {
      console.error('Error moving leads to folder:', err);
      alert('Error moving leads.');
    } finally {
      setIsBatchActionInProgress(false);
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden flex flex-col shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      
      {/* Folder Navigation Bar (Batch Upload Folders) */}
      <div className="p-3 px-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-100/60 dark:bg-black/40 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 pl-1">
            <Layers size={13} className="text-emerald-500" />
            <span>Folders:</span>
          </span>

          {/* All Contacts Tab */}
          <button
            type="button"
            onClick={() => setSelectedFolder('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedFolder === 'all'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold'
                : 'bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.06]'
            }`}
          >
            <Users size={13} />
            <span>All Contacts</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              selectedFolder === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
            }`}>
              {contacts.length}
            </span>
          </button>

          {/* Dynamic Batch Folders */}
          {batchFolders.map((folder) => {
            const isCurrent = selectedFolder === folder.name;
            return (
              <button
                key={folder.name}
                type="button"
                onClick={() => setSelectedFolder(folder.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                    : 'bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                {isCurrent ? <FolderOpen size={13} className="text-blue-200" /> : <Folder size={13} className="text-slate-400" />}
                <span className="truncate max-w-[180px]" title={folder.name}>
                  {folder.name}
                </span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                }`}>
                  {folder.contactIds.length}
                </span>
              </button>
            );
          })}

          {/* + New Folder Tab */}
          <button
            type="button"
            onClick={handleCreateNewFolder}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-dashed border-slate-300 dark:border-white/[0.15]"
            title="Create new named folder"
          >
            <FolderPlus size={13} className="text-emerald-500" />
            <span>+ New Folder</span>
          </button>
        </div>
      </div>

      {/* Active Folder Banner (When viewing a specific batch upload) */}
      {activeFolder && (
        <div className="p-3 px-4 bg-blue-500/10 border-b border-blue-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <FolderOpen size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Folder: {activeFolder.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 font-mono">
                  {activeFolder.contactIds.length} records
                </span>
              </div>
              {activeFolder.importedAt && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <Calendar size={11} />
                  <span>Imported on {new Date(activeFolder.importedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Rename Folder Button */}
            <button
              type="button"
              onClick={handleRenameFolder}
              disabled={isRenaming}
              className="px-2.5 py-1.5 bg-white dark:bg-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.15] text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-white/[0.1] flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
              title="Rename this folder"
            >
              {isRenaming ? (
                <Loader2 size={12} className="animate-spin text-blue-500" />
              ) : (
                <Edit3 size={12} className="text-blue-500" />
              )}
              <span>Rename</span>
            </button>

            {/* Option 1: Remove Folder Only (Keep Leads Safe) */}
            <button
              type="button"
              onClick={handleDeleteFolderOnly}
              disabled={isDeletingFolderOnly}
              className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/25 flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
              title="Remove this folder tag while keeping all leads safe in All Contacts"
            >
              {isDeletingFolderOnly ? (
                <Loader2 size={12} className="animate-spin text-amber-500" />
              ) : (
                <FolderMinus size={12} className="text-amber-500" />
              )}
              <span>Remove Folder (Keep Leads)</span>
            </button>

            {/* Option 2: Delete Folder & All Leads */}
            <button
              type="button"
              onClick={handleDeleteActiveBatch}
              disabled={isDeletingBatch}
              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-500/20 flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
              title="Permanently delete this folder and delete all contacts inside it"
            >
              {isDeletingBatch ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={12} />
                  <span>Delete Folder & All Leads</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 bg-white dark:bg-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.15] text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-white/[0.1] flex items-center space-x-1 transition-all cursor-pointer"
            >
              <Download size={12} className="text-blue-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Filter & Column Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.02]">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search across ${discoveredCustomKeys.length + 4} attributes...`}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Column Visibility Toggler Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="px-3 py-2 bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-white/[0.1] flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Columns ({activeColumnKeys.length + 1})</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-40 space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span>Toggle Visible Columns</span>
                  <span className="text-emerald-500 font-mono">{activeColumnKeys.length + 1} active</span>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-0.5 pt-1">
                  {standardColumns.map((col) => {
                    const isVisible = visibleColumns[col.key] !== undefined ? visibleColumns[col.key] : true;
                    return (
                      <button
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span>{col.label}</span>
                        {isVisible && <Check size={14} className="text-emerald-500" />}
                      </button>
                    );
                  })}

                  {discoveredCustomKeys.map((key) => {
                    const isVisible = visibleColumns[key] !== undefined ? visibleColumns[key] : true;
                    return (
                      <button
                        key={key}
                        onClick={() => toggleColumn(key)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          <span>{formatColumnTitle(key)}</span>
                        </span>
                        {isVisible && <Check size={14} className="text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-white/[0.1] flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            title="Download CSV with all columns included"
          >
            <Download size={13} className="text-slate-500 dark:text-slate-400" />
            <span>Export ({finalFilteredContacts.length})</span>
          </button>
        </div>
      </div>

      {/* Batch Actions Bar for Marked/Selected Leads */}
      {selectedContactIds.length > 0 && (
        <div className="p-3 px-5 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-blue-500/15 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{selectedContactIds.length} lead(s) selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Remove marked leads from current folder */}
            {selectedFolder !== 'all' && (
              <button
                type="button"
                onClick={handleRemoveSelectedFromFolder}
                disabled={isBatchActionInProgress}
                className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Remove selected leads from this folder (keeps them in All Contacts)"
              >
                <FolderMinus size={13} />
                <span>Remove from Folder</span>
              </button>
            )}

            {/* Move marked leads to another folder */}
            <button
              type="button"
              onClick={handleMoveSelectedToFolder}
              disabled={isBatchActionInProgress}
              className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Reassign selected leads to another folder"
            >
              <FolderOpen size={13} />
              <span>Move to Folder...</span>
            </button>

            {/* Mark Delete Selected Leads */}
            <button
              type="button"
              onClick={handleDeleteSelectedLeads}
              disabled={isBatchActionInProgress}
              className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl border border-red-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Permanently delete marked leads from CRM"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedContactIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedContactIds([])}
              className="px-2.5 py-1.5 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Table with Dynamic Columns */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="w-12 px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={selectedContactIds.length > 0 && selectedContactIds.length === finalFilteredContacts.length}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 cursor-pointer"
                  title="Select All Leads in View"
                />
              </th>
              <th className="px-6 py-4">Client Name</th>

              {/* Standard Columns */}
              {activeColumnKeys.includes('company') && <th className="px-6 py-4">Company</th>}
              {activeColumnKeys.includes('email') && <th className="px-6 py-4">Email</th>}
              {activeColumnKeys.includes('phone') && <th className="px-6 py-4">Phone</th>}

              {/* Dynamically Rendered Custom Columns */}
              {discoveredCustomKeys
                .filter((key) => activeColumnKeys.includes(key))
                .map((key) => (
                  <th key={key} className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-blue-500 dark:text-blue-300 font-mono text-[9px] uppercase bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                        {formatColumnTitle(key)}
                      </span>
                    </span>
                  </th>
                ))}

              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-white/[0.05]">
            {finalFilteredContacts.map((contact) => (
              <tr
                key={contact.id}
                className={`transition-colors group ${
                  selectedContactIds.includes(contact.id)
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                    : 'hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                {/* Selection Checkbox */}
                <td className="w-12 px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedContactIds.includes(contact.id)}
                    onChange={() => handleToggleSelectContact(contact.id)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 cursor-pointer"
                  />
                </td>

                {/* Client Name Column */}
                <td className="px-6 py-4">
                  <Link href={`/contacts/${contact.id}`} className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shadow-2xs">
                      {contact.firstName?.[0] || 'C'}{contact.lastName?.[0] || ''}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block text-sm">
                        {contact.firstName} {contact.lastName}
                      </span>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                        <span>{contact.id}</span>
                        {contact.parsedCustom?.folderName && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-sans">
                             {contact.parsedCustom.folderName}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </td>

                {/* Company Column */}
                {activeColumnKeys.includes('company') && (
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Building size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span className="font-medium text-xs text-slate-900 dark:text-white">
                        {contact.company?.name || contact.parsedCustom?.company || '—'}
                      </span>
                    </div>
                  </td>
                )}

                {/* Email Column */}
                {activeColumnKeys.includes('email') && (
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-xs">
                    {contact.email ? (
                      <div className="flex items-center space-x-1.5">
                        <Mail size={13} className="text-slate-400" />
                        <span>{contact.email}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>
                )}

                {/* Phone Column */}
                {activeColumnKeys.includes('phone') && (
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-xs">
                    {contact.phone ? (
                      <div className="flex items-center space-x-1.5">
                        <Phone size={13} className="text-slate-400" />
                        <span>{contact.phone}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>
                )}

                {/* Custom Attributes */}
                {discoveredCustomKeys
                  .filter((key) => activeColumnKeys.includes(key))
                  .map((key) => {
                    const rawVal = contact.parsedCustom[key];
                    const isSet = rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '';

                    if (!isSet) {
                      return (
                        <td key={key} className="px-6 py-4 text-slate-400 dark:text-slate-600 text-xs">
                          —
                        </td>
                      );
                    }

                    // Lead Score badge
                    if (key.toLowerCase().includes('score') || key.toLowerCase().includes('rating')) {
                      return (
                        <td key={key} className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span>{String(rawVal)}</span>
                          </span>
                        </td>
                      );
                    }

                    // Tags / Category badge
                    if (key.toLowerCase().includes('tag') || key.toLowerCase().includes('category') || key.toLowerCase().includes('segment')) {
                      return (
                        <td key={key} className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            <Tag size={10} />
                            <span>{String(rawVal)}</span>
                          </span>
                        </td>
                      );
                    }

                    // Age pill
                    if (key.toLowerCase() === 'age') {
                      return (
                        <td key={key} className="px-6 py-4 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {String(rawVal)} yrs
                        </td>
                      );
                    }

                    // Address with pin
                    if (key.toLowerCase().includes('address') || key.toLowerCase().includes('city') || key.toLowerCase().includes('location')) {
                      return (
                        <td key={key} className="px-6 py-4 text-xs text-slate-700 dark:text-slate-300">
                          <div className="flex items-center space-x-1.5 max-w-xs truncate">
                            <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">{String(rawVal)}</span>
                          </div>
                        </td>
                      );
                    }

                    // Default text/number rendering
                    return (
                      <td key={key} className="px-6 py-4 text-xs text-slate-800 dark:text-slate-200 font-mono">
                        {String(rawVal)}
                      </td>
                    );
                  })}

                {/* Actions Column */}
                <td className="px-6 py-4 text-right">
                  <DeleteActionButton
                    onDeleteAction={async () => {
                      await deleteContact(contact.id);
                    }}
                    confirmTitle={`Delete contact ${contact.firstName} ${contact.lastName}?`}
                  />
                </td>
              </tr>
            ))}

            {finalFilteredContacts.length === 0 && (
              <tr>
                <td colSpan={activeColumnKeys.length + 3} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  <Users className="mx-auto text-slate-400 dark:text-slate-600 mb-2" size={36} />
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {searchQuery ? 'No matching contacts found' : 'No contacts in your CRM yet'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    {searchQuery
                      ? 'No records match your search filter. Try clearing your search or checking another folder.'
                      : activeFolder
                      ? `No contacts are currently categorized under folder "${activeFolder.name}".`
                      : 'Contacts you add or import will appear here. Start by importing a spreadsheet, finding verified leads, or creating a contact.'}
                  </p>
                  {!searchQuery && (
                    <div className="mt-4 flex items-center justify-center gap-2.5">
                      <Link
                        href="/lead-prospector"
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                      >
                        Find Leads (Prospector)
                      </Link>
                      <Link
                        href="/migration"
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-white/10 transition-all"
                      > Import from CSV
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
