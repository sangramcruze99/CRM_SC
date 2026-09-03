"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { SchemaDefinition } from "@/components/low-code/SchemaBuilder";
import { DynamicTable } from "@/components/low-code/DynamicTable";
import { DynamicForm } from "@/components/low-code/DynamicForm";
import { KanbanBuilder } from "@/components/low-code/KanbanBuilder";

interface ObjectClientProps {
  customObject: SchemaDefinition;
  initialRecords: any[];
}

export function ObjectClient({ customObject, initialRecords }: ObjectClientProps) {
  const [records, setRecords] = useState(initialRecords);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const handleSave = async (data: any) => {
    const isEditing = !!editingRecord;
    const url = isEditing 
      ? `/api/custom-objects/${customObject.id}/records/${editingRecord.id}`
      : `/api/custom-objects/${customObject.id}/records`;
      
    const method = isEditing ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });

    if (res.ok) {
      const saved = await res.json();
      if (isEditing) {
        setRecords(records.map(r => r.id === saved.id ? saved : r));
      } else {
        setRecords([saved, ...records]);
      }
      setIsCreating(false);
      setEditingRecord(null);
    } else {
      throw new Error("Failed to save record");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    
    const res = await fetch(`/api/custom-objects/${customObject.id}/records/${id}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handleRecordUpdate = async (recordId: string, updatedData: any) => {
    const res = await fetch(`/api/custom-objects/${customObject.id}/records/${recordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: updatedData })
    });
    if (!res.ok) {
      throw new Error("Failed to update record");
    }
  };

  if (isCreating || editingRecord) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-white">
        <DynamicForm 
          schema={customObject} 
          initialData={editingRecord ? editingRecord.data : {}}
          onSubmit={handleSave}
          onCancel={() => {
            setIsCreating(false);
            setEditingRecord(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto text-white space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex items-center gap-4">
          <Link href="/platform/schema" className="p-2 hover:bg-white/[0.08] rounded-xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {customObject.pluralName || customObject.name + 's'}
              <span className="font-mono text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-lg ml-2 font-semibold">
                {customObject.apiName}
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">{customObject.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/[0.06] p-1 rounded-xl border border-white/[0.08]">
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Table
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${viewMode === 'kanban' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Kanban
            </button>
          </div>
          <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl flex items-center transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer">
            <Plus className="w-4 h-4 mr-1.5" /> New {customObject.name}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'table' ? (
          <div className="h-full p-6 overflow-y-auto bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <DynamicTable 
              schema={customObject} 
              data={records} 
              onEdit={(record) => setEditingRecord(record)}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <KanbanBuilder 
            schema={customObject}
            records={records}
            onRecordUpdate={handleRecordUpdate}
          />
        )}
      </div>
    </div>
  );
}
