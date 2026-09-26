'use client';

import React from 'react';
import { Sparkles, Sliders, Workflow } from 'lucide-react';

export type AutomationBuilderMode = 'SIMPLE' | 'GUIDED' | 'ADVANCED';

interface WorkflowModeSwitcherProps {
  currentMode: AutomationBuilderMode;
  onChangeMode: (mode: AutomationBuilderMode) => void;
}

export function WorkflowModeSwitcher({
  currentMode,
  onChangeMode,
}: WorkflowModeSwitcherProps) {
  const MODES: { id: AutomationBuilderMode; label: string; icon: React.ElementType; desc: string }[] = [
    {
      id: 'SIMPLE',
      label: 'Simple Mode',
      icon: Sparkles,
      desc: 'Natural language assistant',
    },
    {
      id: 'GUIDED',
      label: 'Guided Mode',
      icon: Sliders,
      desc: '11 business steps',
    },
    {
      id: 'ADVANCED',
      label: 'Advanced Canvas',
      icon: Workflow,
      desc: 'Visual node graph & schemas',
    },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-inner">
      {MODES.map((m) => {
        const Icon = m.icon;
        const isActive = currentMode === m.id;

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChangeMode(m.id)}
            title={m.desc}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              isActive
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Icon size={14} className={isActive ? 'text-zinc-950' : 'text-zinc-400'} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
