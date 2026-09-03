'use client';

import React, { useState, useMemo } from 'react';
import { SchemaDefinition } from './SchemaBuilder';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanBuilderProps {
  schema: SchemaDefinition;
  records: any[];
  onRecordUpdate: (recordId: string, updatedData: any) => Promise<void>;
}

function SortableItem({ id, record, titleField }: { id: string, record: any, titleField: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white/[0.04] p-3.5 rounded-2xl shadow-sm border border-white/[0.08] cursor-grab active:cursor-grabbing hover:border-emerald-500/40 hover:shadow transition-all text-white"
    >
      <div className="font-bold text-white text-xs">
        {record.data[titleField] || `Record ${record.id.substring(0, 8)}`}
      </div>
      <div className="text-[10px] text-slate-400 mt-2 font-medium">
        {new Date(record.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

function Column({ id, title, records, titleField }: { id: string, title: string, records: any[], titleField: string }) {
  return (
    <div className="flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-3xl w-72 flex-shrink-0 max-h-full">
      <div className="p-3.5 border-b border-white/[0.08] bg-white/[0.02] rounded-t-3xl flex items-center justify-between">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">{title}</h3>
        <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">{records.length}</span>
      </div>
      <div className="p-3.5 flex-1 overflow-y-auto space-y-3 min-h-[150px]">
        <SortableContext items={records.map(r => r.id)} strategy={verticalListSortingStrategy}>
          {records.map(record => (
            <SortableItem key={record.id} id={record.id} record={record} titleField={titleField} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBuilder({ schema, records, onRecordUpdate }: KanbanBuilderProps) {
  // Find SELECT fields for grouping
  const selectFields = schema.fields.filter(f => f.fieldType === 'SELECT');
  const textFields = schema.fields.filter(f => f.fieldType === 'TEXT');
  const titleField = textFields.length > 0 ? textFields[0].apiName : 'id';
  
  const [groupByField, setGroupByField] = useState<string>(selectFields.length > 0 ? selectFields[0].apiName : '');
  
  // Local state for optimistic UI updates during drag
  const [localRecords, setLocalRecords] = useState(records);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync when prop records change
  React.useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  const activeRecord = useMemo(() => localRecords.find(r => r.id === activeId), [activeId, localRecords]);

  if (selectFields.length === 0) {
    return (
      <div className="p-8 text-center bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/[0.08] border-dashed text-white">
        <h3 className="text-sm font-bold text-white mb-2">Kanban Board Requires a Select Field</h3>
        <p className="text-xs text-slate-400">To use the Kanban view, please add a "Select" field to your schema (e.g. Status, Stage) which will be used as the columns.</p>
      </div>
    );
  }

  const selectedFieldDef = selectFields.find(f => f.apiName === groupByField);
  const columns = selectedFieldDef?.options?.choices || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getRecordColumn = (record: any) => {
    return record.data[groupByField] || columns[0] || 'Uncategorized';
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    let overColumn = '';
    const overRecord = localRecords.find(r => r.id === overId);
    if (overRecord) {
      overColumn = getRecordColumn(overRecord);
    } else if (columns.includes(overId as string) || overId === 'Uncategorized') {
      overColumn = overId as string;
    }

    if (!overColumn) return;

    const activeRecord = localRecords.find(r => r.id === activeId);
    if (!activeRecord) return;

    const activeColumn = getRecordColumn(activeRecord);

    if (activeColumn !== overColumn) {
      // Optimistic update
      const updatedRecord = { ...activeRecord, data: { ...activeRecord.data, [groupByField]: overColumn } };
      setLocalRecords(prev => prev.map(r => r.id === activeId ? updatedRecord : r));
      
      try {
        await onRecordUpdate(activeId as string, updatedRecord.data);
      } catch (err) {
        // Revert
        setLocalRecords(records);
        console.error("Failed to update record column", err);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent text-white">
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-400">Group By:</label>
          <select 
            value={groupByField} 
            onChange={e => setGroupByField(e.target.value)}
            className="text-xs bg-white/[0.05] border border-white/[0.1] rounded-xl text-white px-3 py-1.5 focus:outline-none"
          >
            {selectFields.map(f => (
              <option key={f.apiName} value={f.apiName} className="bg-slate-900 text-white">{f.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-6 h-full items-start">
            {[...columns, 'Uncategorized'].map(col => {
              const colRecords = localRecords.filter(r => getRecordColumn(r) === col);
              // Only render Uncategorized if it has items
              if (col === 'Uncategorized' && colRecords.length === 0) return null;
              
              return (
                <SortableContext key={col} id={col} items={colRecords.map(r => r.id)} strategy={verticalListSortingStrategy}>
                  <Column id={col} title={col} records={colRecords} titleField={titleField} />
                </SortableContext>
              );
            })}
          </div>

          <DragOverlay>
            {activeId && activeRecord ? (
              <div className="bg-slate-900/95 p-3.5 rounded-2xl shadow-xl border border-amber-400/50 rotate-2 opacity-90 w-72 text-white">
                <div className="font-bold text-white text-xs">
                  {activeRecord.data[titleField] || `Record ${activeRecord.id.substring(0, 8)}`}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
