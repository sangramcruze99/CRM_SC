'use client';

import React, { useState } from 'react';
import {
  Users,
  ChevronDown,
  ChevronRight,
  UserPlus,
  ArrowRight,
  DollarSign,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Building,
  Edit2,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Layers,
  Network,
  Cpu,
  HeartHandshake,
} from 'lucide-react';
import { EmployeeNode, EmployeeTier, TIER_DEFINITIONS, getTierFromLevel } from '@/lib/hrData';
import { useIndustry } from '@/components/industry/IndustryContext';

interface OrgHierarchyTreeProps {
  employees: EmployeeNode[];
  onSelectEmployee: (emp: EmployeeNode) => void;
  onReassignManager: (empId: string, newManagerId: string | null) => void;
  onRemoveEmployee: (empId: string) => void;
  onOpenAddModal: () => void;
  onResetNicheEmployees?: () => void;
}

export function OrgHierarchyTree({
  employees,
  onSelectEmployee,
  onReassignManager,
  onRemoveEmployee,
  onOpenAddModal,
  onResetNicheEmployees,
}: OrgHierarchyTreeProps) {
  const { nicheConfig } = useIndustry();
  const [viewMode, setViewMode] = useState<'tree' | 'matrix'>('matrix');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [editingManagerFor, setEditingManagerFor] = useState<string | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Group employees by manager for tree view
  const getDirectReports = (managerId: string | null) => {
    return employees.filter((e) => e.managerId === managerId);
  };

  const rootEmployees = getDirectReports(null);

  // Group employees by 4 Tiers for Matrix view
  const tierAEmployees = employees.filter((e) => e.level === 0 || e.tier === 'TIER_A');
  const tierBEmployees = employees.filter((e) => e.level === 1 || e.tier === 'TIER_B');
  const tierCEmployees = employees.filter((e) => e.level === 2 || e.tier === 'TIER_C');
  const tierDEmployees = employees.filter((e) => e.level === 3 || e.tier === 'TIER_D');

  const getTierMeta = (emp: EmployeeNode) => {
    const tier = emp.tier || getTierFromLevel(emp.level);
    return TIER_DEFINITIONS[tier] || TIER_DEFINITIONS.TIER_C;
  };

  const renderEmployeeCard = (emp: EmployeeNode, isCompact = false) => {
    const directReports = getDirectReports(emp.id);
    const isCollapsed = collapsedNodes[emp.id];
    const hasReports = directReports.length > 0;
    const tierMeta = getTierMeta(emp);

    return (
      <div
        key={emp.id}
        className={`p-4 rounded-3xl border transition-all shadow-xl backdrop-blur-2xl relative group bg-white/[0.04] dark:bg-slate-900/80 ${
          emp.level === 0
            ? 'border-amber-500/60 ring-2 ring-amber-500/20 shadow-amber-500/15'
            : emp.level === 1
            ? 'border-sky-500/40 ring-1 ring-sky-500/20 hover:border-sky-400/60'
            : emp.level === 2
            ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 hover:border-emerald-400/60'
            : 'border-purple-500/40 ring-1 ring-purple-500/20 hover:border-purple-400/60'
        } ${isCompact ? 'w-64 sm:w-72' : 'w-72 sm:w-80'}`}
      >
        {/* Tier Badge Pill & Salary + Quick Remove Action */}
        <div className="flex items-center justify-between mb-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border font-mono ${tierMeta.badgeBg} ${tierMeta.badgeText} ${tierMeta.badgeBorder}`}
          >
            {tierMeta.code}: {tierMeta.title}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-emerald-400">
              ${emp.salary.netMonthly.toLocaleString()}/mo
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  confirm(
                    `Are you sure you want to remove ${emp.firstName} ${emp.lastName} (${emp.jobTitle}) from the organization tree?`
                  )
                ) {
                  onRemoveEmployee(emp.id);
                }
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title={`Remove ${emp.firstName} ${emp.lastName}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-3">
          <img
            src={emp.avatar}
            alt={emp.firstName}
            className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-white truncate group-hover:text-emerald-300 transition-colors">
              {emp.firstName} {emp.lastName}
            </h4>
            <p className="text-[11px] text-emerald-400/90 font-medium truncate">{emp.jobTitle}</p>
            <span className="text-[10px] text-slate-400 block truncate">{emp.department}</span>
          </div>
        </div>

        {/* Quick Actions & Reporting Line Editor */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => onSelectEmployee(emp)}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View Payslip</span>
            <ArrowRight size={11} />
          </button>

          {/* Re-assign Manager Trigger */}
          {emp.level > 0 && (
            <div className="relative">
              {editingManagerFor === emp.id ? (
                <select
                  defaultValue={emp.managerId || ''}
                  onChange={(e) => {
                    onReassignManager(emp.id, e.target.value || null);
                    setEditingManagerFor(null);
                  }}
                  onBlur={() => setEditingManagerFor(null)}
                  autoFocus
                  className="px-2 py-1 bg-slate-900 border border-amber-500 rounded-lg text-[10px] text-white focus:outline-none"
                >
                  <option value="">Executive Leadership</option>
                  {employees
                    .filter((m) => m.id !== emp.id && m.level < emp.level)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        Mgr: {m.firstName} ({m.jobTitle})
                      </option>
                    ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingManagerFor(emp.id)}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.08]"
                >
                  <Edit2 size={10} />
                  <span>Change Mgr</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Expand / Collapse Sub-Tree Toggle (Tree View Only) */}
        {hasReports && viewMode === 'tree' && (
          <button
            type="button"
            onClick={() => toggleCollapse(emp.id)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
            title={isCollapsed ? 'Expand Direct Reports' : 'Collapse Direct Reports'}
          >
            {isCollapsed ? <ChevronDown size={13} /> : <ChevronRight size={13} className="rotate-90" />}
          </button>
        )}
      </div>
    );
  };

  const renderTreeNode = (emp: EmployeeNode) => {
    const directReports = getDirectReports(emp.id);
    const isCollapsed = collapsedNodes[emp.id];
    const hasReports = directReports.length > 0;

    return (
      <div key={emp.id} className="flex flex-col items-center space-y-3 relative">
        {renderEmployeeCard(emp)}

        {/* Child Subtree Nodes */}
        {hasReports && !isCollapsed && (
          <div className="pt-6 relative flex flex-col items-center">
            {/* Top Connector Line */}
            <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500/40 to-white/15 -mt-6" />

            {/* Horizontal Branch Bar */}
            {directReports.length > 1 && (
              <div
                className="h-0.5 bg-white/15 mb-6"
                style={{
                  width: `${Math.min(900, (directReports.length - 1) * 320)}px`,
                }}
              />
            )}

            {/* Sub-Tree Cards Container */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-start">
              {directReports.map((report) => renderTreeNode(report))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {nicheConfig.name} — 4-Tier Organizational Pipeline
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              {employees.length} Staff Members
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Structured 4-Tier hierarchy: <span className="text-amber-600 dark:text-amber-300 font-semibold">Tier A (Upper Mgmt)</span> ➔{' '}
            <span className="text-sky-600 dark:text-sky-300 font-semibold">Tier B (Middle Mgmt)</span> ➔{' '}
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Tier C (Operations)</span> &{' '}
            <span className="text-purple-700 dark:text-purple-300 font-semibold">Tier D (Support)</span>.
          </p>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>4-Tier Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Network size={13} />
              <span>Reporting Tree</span>
            </button>
          </div>

          {onResetNicheEmployees && (
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    `Reset employee roster to full ${nicheConfig.shortName} 4-tier default hierarchy template?`
                  )
                ) {
                  onResetNicheEmployees();
                }
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset to default template for this niche"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset Preset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <UserPlus size={14} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* 4-Tier Key Mapping Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.values(TIER_DEFINITIONS).map((def) => {
          const count = employees.filter((e) => e.level === def.level || e.tier === def.tier).length;
          return (
            <div
              key={def.tier}
              className={`p-3.5 rounded-2xl border bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] shadow-xs backdrop-blur-xl ${def.badgeBorder} flex items-center justify-between`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase ${def.badgeBg} ${def.badgeText} border ${def.badgeBorder}`}
                  >
                    {def.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{def.title}</h4>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{def.subtitle}</p>
              </div>
              <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400 px-2 py-1 bg-slate-100 dark:bg-white/[0.04] rounded-lg border border-slate-200 dark:border-white/[0.06]">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Visual Hierarchy Canvas */}
      {employees.length === 0 ? (
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-12 text-center shadow-xs">
          <Users className="mx-auto text-slate-400 dark:text-slate-600 mb-3" size={44} />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Team Members in Hierarchy</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            Load the default 4-tier template or add your first Upper Management executive.
          </p>
          <div className="flex items-center justify-center gap-3">
            {onResetNicheEmployees && (
              <button
                type="button"
                onClick={onResetNicheEmployees}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-200 dark:border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Load {nicheConfig.shortName} Template</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus size={13} />
              <span>Add First Employee</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'matrix' ? (
        /* =========================================================================
           4-TIER KEY MAPPING ARCHITECTURE MATRIX VIEW
           [ TIER A: UPPER MANAGEMENT ]
                      │
           [ TIER B: MIDDLE MANAGEMENT ]
                      │
               ┌──────┴──────┐
           [ TIER C ]    [ TIER D ]
           ========================================================================= */
        <div className="space-y-8 bg-white/[0.02] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-inner overflow-x-auto">
          {/* TIER A: UPPER MANAGEMENT */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider font-mono shadow-lg shadow-amber-500/10">
              <span>👑 [ TIER A: UPPER MANAGEMENT ]</span>
              <span className="text-[10px] text-amber-400/80 font-normal">
                (CEO, CFO, CTO, Managing Directors)
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-5">
              {tierAEmployees.map((emp) => renderEmployeeCard(emp, true))}
            </div>
          </div>

          {/* Central Vertical Connector Line */}
          <div className="flex justify-center -my-3">
            <div className="w-0.5 h-10 bg-gradient-to-b from-amber-500 to-sky-500" />
          </div>

          {/* TIER B: MIDDLE MANAGEMENT */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs font-extrabold uppercase tracking-wider font-mono shadow-lg shadow-sky-500/10">
              <span>👔 [ TIER B: MIDDLE MANAGEMENT ]</span>
              <span className="text-[10px] text-sky-400/80 font-normal">
                (General Managers, Department Leads, Supervisors)
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-5">
              {tierBEmployees.map((emp) => renderEmployeeCard(emp, true))}
            </div>
          </div>

          {/* Fork Connector (Branching bus line to Tier C & Tier D) */}
          <div className="flex flex-col items-center -my-3">
            <div className="w-0.5 h-6 bg-gradient-to-b from-sky-500 to-emerald-500" />
            <div className="w-full max-w-2xl h-0.5 bg-gradient-to-r from-emerald-500 via-white/20 to-purple-500" />
            <div className="w-full max-w-2xl flex justify-between px-24">
              <div className="w-0.5 h-6 bg-emerald-500" />
              <div className="w-0.5 h-6 bg-purple-500" />
            </div>
          </div>

          {/* SPLIT ROW: TIER C (OPERATIONS) & TIER D (SUPPORT) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-2">
            {/* TIER C: OPERATIONS */}
            <div className="p-5 rounded-3xl bg-emerald-500/[0.03] border border-emerald-500/25 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold uppercase tracking-wider font-mono shadow-md">
                <span>⚙️ [ TIER C: OPERATIONS ]</span>
                <span className="text-[10px] text-emerald-400/80 font-normal">
                  ({tierCEmployees.length} Staff)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 text-center">
                Associates, Specialists, Technicians, Engineers, Doctors, Cooks
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full justify-items-center">
                {tierCEmployees.map((emp) => renderEmployeeCard(emp, true))}
              </div>
            </div>

            {/* TIER D: SUPPORT STAFF */}
            <div className="p-5 rounded-3xl bg-purple-500/[0.03] border border-purple-500/25 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs font-extrabold uppercase tracking-wider font-mono shadow-md">
                <span>🛠️ [ TIER D: SUPPORT ]</span>
                <span className="text-[10px] text-purple-400/80 font-normal">
                  ({tierDEmployees.length} Staff)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 text-center">
                Clerks, Janitors, Maintenance, Sanitation, Porters, Receptionists
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full justify-items-center">
                {tierDEmployees.map((emp) => renderEmployeeCard(emp, true))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           ORGANIZATIONAL REPORTING PIPELINE TREE VIEW
           ========================================================================= */
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 overflow-x-auto min-h-[500px] flex justify-center items-center shadow-inner">
          <div className="flex flex-col items-center space-y-8 min-w-max">
            {rootEmployees.map((root) => renderTreeNode(root))}
          </div>
        </div>
      )}
    </div>
  );
}
