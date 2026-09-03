'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LayoutGrid, BarChart2, Table, Columns, Type, Hash, GripHorizontal } from 'lucide-react';

const availableWidgets = [
  { type: 'metric', name: 'Metric Card', icon: <Hash size={16} /> },
  { type: 'chart', name: 'Bar Chart', icon: <BarChart2 size={16} /> },
  { type: 'table', name: 'Data Table', icon: <Table size={16} /> },
  { type: 'text', name: 'Rich Text', icon: <Type size={16} /> },
  { type: 'kanban', name: 'Kanban Board', icon: <Columns size={16} /> },
];

function SortableWidget({ id, widgetType }: { id: string, widgetType: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const widget = availableWidgets.find(w => w.type === widgetType);

  return (
    <div ref={setNodeRef} style={style} className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden flex flex-col h-48 group text-white">
      <div 
        className="h-8 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between px-3 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes} 
        {...listeners}
      >
        <GripHorizontal size={14} className="text-slate-400" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">{widget?.name}</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-slate-400">
          <div className="mx-auto w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-2">
             {widget?.icon}
          </div>
          <p className="text-xs font-bold text-slate-300">{widget?.name} Component</p>
        </div>
      </div>
    </div>
  );
}

export function UIBuilder() {
  const [layout, setLayout] = useState([
    { id: 'w1', type: 'metric' },
    { id: 'w2', type: 'metric' },
    { id: 'w3', type: 'metric' },
    { id: 'w4', type: 'chart' },
    { id: 'w5', type: 'table' },
  ]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLayout(prev => {
        const oldIndex = prev.findIndex(w => w.id === active.id);
        const newIndex = prev.findIndex(w => w.id === over.id);
        const newLayout = [...prev];
        const [moved] = newLayout.splice(oldIndex, 1);
        newLayout.splice(newIndex, 0, moved);
        return newLayout;
      });
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto text-white space-y-6">
      {/* Topbar */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 px-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex items-center gap-3">
          <LayoutGrid size={20} className="text-emerald-400" />
          <div>
            <h1 className="font-bold text-white leading-tight">Sales Dashboard</h1>
            <p className="text-xs text-slate-400">Custom Page Layout</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl transition-colors cursor-pointer">
            Preview
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer">
            Save Page
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Widget Toolbox */}
        <div className="w-64 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 overflow-y-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Widget Library</h2>
          <div className="space-y-2.5">
            {availableWidgets.map(widget => (
              <div 
                key={widget.type}
                className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.08] rounded-2xl hover:border-emerald-500/40 hover:bg-white/[0.05] cursor-pointer transition-all group"
              >
                <div className="text-emerald-400">
                  {widget.icon}
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">{widget.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-6 bg-white/[0.02] border border-white/[0.08] rounded-3xl overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-3 gap-6">
                <SortableContext items={layout.map(w => w.id)} strategy={rectSortingStrategy}>
                  {layout.map((widget) => (
                    <div key={widget.id} className={widget.type === 'chart' || widget.type === 'table' ? 'col-span-3' : 'col-span-1'}>
                      <SortableWidget id={widget.id} widgetType={widget.type} />
                    </div>
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}
