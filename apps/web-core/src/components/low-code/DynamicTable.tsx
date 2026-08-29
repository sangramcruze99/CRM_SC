'use client';

import React from 'react';
import { SchemaDefinition } from './SchemaBuilder';
import { Edit, Trash2 } from 'lucide-react';

interface DynamicTableProps {
  schema: SchemaDefinition;
  data: any[];
  onEdit?: (record: any) => void;
  onDelete?: (id: string) => void;
}

export function DynamicTable({ schema, data, onEdit, onDelete }: DynamicTableProps) {
  // If no fields, nothing to render
  if (!schema.fields || schema.fields.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
        No schema fields defined.
      </div>
    );
  }

  return (
    <div className="bg-transparent overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/[0.08] text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 w-24">ID</th>
              {schema.fields.map((field) => (
                <th key={field.apiName} className="px-6 py-4 whitespace-nowrap">
                  {field.name}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-right w-24">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={schema.fields.length + 2} className="px-6 py-12 text-center text-slate-500">
                  No {schema.pluralName?.toLowerCase() || schema.name.toLowerCase() + 's'} found.
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {record.id.slice(-6)}
                  </td>
                  {schema.fields.map((field) => {
                    const val = record.data ? record.data[field.apiName] : undefined;
                    return (
                      <td key={field.apiName} className="px-6 py-4 text-xs text-white">
                        {field.fieldType === 'BOOLEAN' ? (
                          val ? <span className="text-emerald-400 font-bold">Yes</span> : <span className="text-slate-500">No</span>
                        ) : field.fieldType === 'DATE' && val ? (
                          new Date(val).toLocaleDateString()
                        ) : (
                          String(val ?? '')
                        )}
                      </td>
                    );
                  })}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right space-x-2">
                      {onEdit && (
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer" onClick={() => onEdit(record)}>
                        <Edit className="w-4 h-4" />
                      </button>
                      )}
                      {onDelete && (
                        <button className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer" onClick={() => onDelete(record.id)}>
                        <Trash2 className="w-4 h-4" />
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
