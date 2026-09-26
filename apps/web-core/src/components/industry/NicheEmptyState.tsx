'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Receipt,
  FolderOpen,
  Package,
  LifeBuoy,
  Plus,
  ArrowRight,
  Database,
  Calendar,
  Building,
  Utensils,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useIndustry } from './IndustryContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  Briefcase,
  Receipt,
  FolderOpen,
  Package,
  LifeBuoy,
  Calendar,
  Building,
  Utensils,
  ShoppingBag,
  Database,
};

interface NicheEmptyStateProps {
  moduleKey: 'contacts' | 'deals' | 'invoices' | 'projects' | 'products' | 'tickets' | string;
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function NicheEmptyState({
  moduleKey,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: NicheEmptyStateProps) {
  const { nicheConfig2, nicheConfig } = useIndustry();

  const configuredEmpty = nicheConfig2?.emptyStates?.[moduleKey];

  // Derive contextual defaults from niche terminology if not explicitly defined
  const termName =
    (nicheConfig.terminology as any)?.[moduleKey] ||
    (moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1));

  const resolvedTitle =
    title ||
    configuredEmpty?.title ||
    `No ${termName} Registered Yet`;

  const resolvedMessage =
    message ||
    configuredEmpty?.message ||
    `Your active workspace is configured for ${nicheConfig.name}. Start by creating your first ${termName.toLowerCase()} record to trigger automated workflows.`;

  const resolvedActionLabel =
    actionLabel ||
    configuredEmpty?.actionLabel ||
    `Add First ${termName}`;

  const resolvedActionHref =
    actionHref ||
    configuredEmpty?.actionHref ||
    `/${moduleKey}?action=new`;

  const iconName = configuredEmpty?.iconName || 'Database';
  const IconComp = ICON_MAP[iconName] || ICON_MAP[moduleKey] || Database;

  return (
    <div
      className={`rounded-2xl border border-dashed border-zinc-300 dark:border-white/10 bg-white/40 dark:bg-zinc-900/30 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-xs">
        <IconComp size={26} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-2">
        <Sparkles size={10} />
        <span>{nicheConfig.shortName} Empty State</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
        {resolvedTitle}
      </h3>

      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mb-6">
        {resolvedMessage}
      </p>

      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <Plus size={14} />
          <span>{resolvedActionLabel}</span>
        </button>
      ) : (
        <Link
          href={resolvedActionHref}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <Plus size={14} />
          <span>{resolvedActionLabel}</span>
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
