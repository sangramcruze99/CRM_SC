'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LayoutList, GripVertical, Settings2, Plus, Box, FileText } from 'lucide-react';

interface NavItem {
  id: string;
  title: string;
  type: string;
}

function SortableNavItem({ item }: { item: NavItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl shadow-sm mb-2.5 group hover:border-amber-500/40 transition-colors">
      <div {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-white">
        <GripVertical size={18} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-sm text-white">{item.title}</div>
        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
          {item.type === 'object' ? <Box size={11} className="text-amber-400" /> : <FileText size={11} className="text-amber-400" />}
          <span>{item.type === 'object' ? 'Custom Object' : 'Custom Page'}</span>
        </div>
      </div>
      <button className="p-1.5 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <Settings2 size={16} />
      </button>
    </div>
  );
}

export default function NavigationBuilderPage() {
  const [items, setItems] = useState<NavItem[]>([
    { id: '1', title: 'Dashboard', type: 'page' },
    { id: '2', title: 'Deals', type: 'object' },
    { id: '3', title: 'Contacts', type: 'object' },
    { id: '4', title: 'Vehicles', type: 'object' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="p-6 h-full text-white max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <LayoutList className="text-amber-400" size={24} />
            Navigation Builder
          </h1>
          <p className="text-sm text-slate-400 mt-1">Drag and drop to configure the sidebar menu for your users.</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer">
          Save Layout
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] p-5 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Items</h3>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2">Custom Objects</div>
              <button className="w-full flex items-center justify-between p-2.5 text-xs text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/30 rounded-xl transition-colors cursor-pointer">
                <span className="flex items-center gap-2 font-medium"><Box size={14} className="text-amber-400" /> Properties</span>
                <Plus size={14} className="text-amber-400" />
              </button>
            </div>
            
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2">Custom Pages</div>
              <button className="w-full flex items-center justify-between p-2.5 text-xs text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/30 rounded-xl transition-colors cursor-pointer">
                <span className="flex items-center gap-2 font-medium"><FileText size={14} className="text-amber-400" /> Sales Report</span>
                <Plus size={14} className="text-amber-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Sidebar Layout (Drag to Reorder)</h3>
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map(item => (
                <SortableNavItem key={item.id} item={item} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
