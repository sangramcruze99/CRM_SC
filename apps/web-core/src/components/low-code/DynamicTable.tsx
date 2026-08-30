'use client';

import React from 'react';
import { SchemaDefinition, FieldDefinition } from './SchemaBuilder';
import {
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Phone,
  Tag,
  Hash,
} from 'lucide-react';

interface DynamicTableProps {
  schema: SchemaDefinition;
  data: any[];
  onEdit?: (record: any) => void;
  onDelete?: (id: string) => void;
}

// Smart status color mapping
function getStatusBadgeClass(val: string): string {
  const v = String(val).toLowerCase();
  if (['active', 'paid', 'won', 'completed', 'approved', 'success', 'verified'].some((k) => v.includes(k))) {
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  }
  if (['pending', 'in review', 'in progress', 'review', 'warm', 'medium'].some((k) => v.includes(k))) {
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
  }
  if (['urgent', 'high', 'critical', 'overdue', 'cancelled', 'lost', 'failed', 'rejected'].some((k) => v.includes(k))) {
    return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
  }
  if (['new', 'draft', 'scheduled', 'cold', 'open', 'info', 'mql', 'sql'].some((k) => v.includes(k))) {
    return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
  }
  return 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]';
}

export function DynamicTable({ schema, data, onEdit, onDelete }: DynamicTableProps) {
  // If no fields, nothing to render
  if (!schema.fields || schema.fields.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 luxe-box rounded-2xl">
        No schema fields defined for this object.
      </div>
    );
  }

  const renderFieldValue = (field: FieldDefinition, val: any) => {
    if (val === undefined || val === null || val === '') {
      return <span className="text-slate-400 dark:text-slate-600 font-mono text-[11px]">—</span>;
    }

    // Boolean Type
    if (field.fieldType === 'BOOLEAN') {
      return val ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 size={11} />
          <span>Yes</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
          <XCircle size={11} />
          <span>No</span>
        </span>
      );
    }

    // Date Type
    if (field.fieldType === 'DATE') {
      const dateStr = new Date(val).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
          <Calendar size={12} className="text-amber-500 dark:text-amber-400 shrink-0" />
          <span>{dateStr}</span>
        </span>
      );
    }

    // Number / Currency Type
    if (field.fieldType === 'NUMBER') {
      const num = Number(val);
      const isCurrency = field.name.toLowerCase().includes('price') ||
        field.name.toLowerCase().includes('amount') ||
        field.name.toLowerCase().includes('value') ||
        field.name.toLowerCase().includes('revenue') ||
        field.name.toLowerCase().includes('cost') ||
        field.name.toLowerCase().includes('salary');

      return (
        <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
          {isCurrency ? `$${num.toLocaleString()}` : num.toLocaleString()}
        </span>
      );
    }

    // Status / Picklist / Tag detection
    const strVal = String(val);
    const isTagLike =
      field.fieldType === 'SELECT' ||
      field.name.toLowerCase().includes('status') ||
      field.name.toLowerCase().includes('stage') ||
      field.name.toLowerCase().includes('priority') ||
      field.name.toLowerCase().includes('tier') ||
      field.name.toLowerCase().includes('category');

    if (isTagLike) {
      return (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
            strVal
          )}`}
        >
          {strVal}
        </span>
      );
    }

    // Email link
    if (strVal.includes('@') && strVal.includes('.')) {
      return (
        <a
          href={`mailto:${strVal}`}
          className="inline-flex items-center gap-1 text-xs text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-mono"
        >
          <Mail size={12} className="text-slate-400 shrink-0" />
          <span className="truncate max-w-[180px]">{strVal}</span>
        </a>
      );
    }

    // Default string
    return (
      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[240px] block">
        {strVal}
      </span>
    );
  };

  return (
    <div className="luxe-box rounded-3xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-slate-950/60 backdrop-blur-2xl shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          {/* Table Header */}
          <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08] text-[10px] uppercase tracking-wider select-none">
            <tr>
              <th className="px-5 py-3.5 w-24">
                <span className="flex items-center gap-1">
                  <Hash size={11} className="text-amber-500 dark:text-amber-400" />
                  <span>ID</span>
                </span>
              </th>

              {schema.fields.map((field) => (
                <th key={field.apiName} className="px-5 py-3.5 whitespace-nowrap">
                  <span>{field.name}</span>
                </th>
              ))}

              {(onEdit || onDelete) && (
                <th className="px-5 py-3.5 text-right w-24">Actions</th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={schema.fields.length + 2}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs"
                >
                  No {schema.pluralName?.toLowerCase() || schema.name.toLowerCase() + 's'} found in this workspace.
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-amber-500/[0.03] dark:hover:bg-amber-500/[0.04] transition-colors group"
                >
                  {/* Record ID Chip */}
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                      #{record.id.slice(-5)}
                    </span>
                  </td>

                  {/* Field Values */}
                  {schema.fields.map((field) => {
                    const val = record.data ? record.data[field.apiName] : record[field.apiName];
                    return (
                      <td key={field.apiName} className="px-5 py-3.5">
                        {renderFieldValue(field, val)}
                      </td>
                    );
                  })}

                  {/* Actions Column */}
                  {(onEdit || onDelete) && (
                    <td className="px-5 py-3.5 text-right space-x-1.5 shrink-0">
                      {onEdit && (
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer inline-flex items-center"
                          onClick={() => onEdit(record)}
                          title="Edit Record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition-all cursor-pointer inline-flex items-center"
                          onClick={() => onDelete(record.id)}
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
