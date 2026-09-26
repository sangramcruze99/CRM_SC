'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Receipt,
  Landmark,
  Workflow,
  UserPlus,
  Calendar,
  DollarSign,
  Building,
  Home,
  Key,
  FileText,
  Utensils,
  Clock,
  ShoppingBag,
  Barcode,
  PackagePlus,
  TrendingUp,
  Sparkles,
  CheckSquare,
  Plus,
  FileSignature,
  Stethoscope,
  Layers,
  Bot,
  Activity,
  BedDouble,
  Pill,
  Users,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useIndustry } from './IndustryContext';
import { IndustryQuickAction } from '@/lib/industry/nicheRegistry2';

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Receipt,
  Landmark,
  Workflow,
  UserPlus,
  Calendar,
  DollarSign,
  Building,
  Home,
  Key,
  FileText,
  Utensils,
  Clock,
  ShoppingBag,
  Barcode,
  PackagePlus,
  TrendingUp,
  Sparkles,
  CheckSquare,
  Plus,
  FileSignature,
  Stethoscope,
  Layers,
  Bot,
  Activity,
  BedDouble,
  Pill,
  Users,
  Compass,
};

interface NicheQuickActionsProps {
  className?: string;
  variant?: 'pills' | 'cards' | 'compact';
  limit?: number;
}

export function NicheQuickActions({
  className = '',
  variant = 'pills',
  limit,
}: NicheQuickActionsProps) {
  const { nicheConfig2, nicheConfig } = useIndustry();

  const actions: IndustryQuickAction[] = nicheConfig2?.quickActions || [
    { id: 'qa_record', label: nicheConfig2?.terminology?.actions?.createRecord || `Add ${nicheConfig.terminology?.contacts || 'Record'}`, href: '/contacts?action=new', iconName: 'Plus', primary: true },
    { id: 'qa_schedule', label: nicheConfig2?.terminology?.actions?.bookSchedule || 'Book Schedule', href: '/calendar', iconName: 'Calendar' },
    { id: 'qa_bill', label: nicheConfig2?.terminology?.actions?.generateBill || `Generate ${nicheConfig.terminology?.invoices || 'Invoice'}`, href: '/invoices?action=new', iconName: 'Receipt' },
    { id: 'qa_pipeline', label: nicheConfig2?.terminology?.actions?.viewPipeline || `View ${nicheConfig.terminology?.deals || 'Pipeline'}`, href: '/deals', iconName: 'Briefcase' },
  ];

  const displayedActions = limit ? actions.slice(0, limit) : actions;

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
        {displayedActions.map((action) => {
          const IconComp = ICON_MAP[action.iconName] || Plus;
          const isPrimary = action.primary;
          return (
            <Link
              key={action.id}
              href={action.href}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 group ${
                isPrimary
                  ? 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/40 hover:border-emerald-400 shadow-xs'
                  : 'bg-white/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isPrimary
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-400'
                  }`}
                >
                  <IconComp size={16} />
                </div>
                <ArrowRight
                  size={13}
                  className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5"
                />
              </div>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight leading-snug">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
        {displayedActions.map((action) => {
          const IconComp = ICON_MAP[action.iconName] || Plus;
          return (
            <Link
              key={action.id}
              href={action.href}
              title={action.label}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                action.primary
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20'
              }`}
            >
              <IconComp size={13} />
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  // Default 'pills' variant
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {displayedActions.map((action) => {
        const IconComp = ICON_MAP[action.iconName] || Plus;
        const isPrimary = action.primary;
        return (
          <Link
            key={action.id}
            href={action.href}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] ${
              isPrimary
                ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:border-emerald-400'
                : 'bg-white/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20'
            }`}
          >
            <IconComp
              size={14}
              className={isPrimary ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}
            />
            <span>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
