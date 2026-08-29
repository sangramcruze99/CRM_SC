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
} from 'lucide-react';
import { EmployeeNode } from '@/lib/hrData';
import { useIndustry } from '@/components/industry/IndustryContext';

interface OrgHierarchyTreeProps {
  employees: EmployeeNode[];
  onSelectEmployee: (emp: EmployeeNode) => void;
  onReassignManager: (empId: string, newManagerId: string | null) => void;
  onOpenAddModal: () => void;
}

export function OrgHierarchyTree({
  employees,
  onSelectEmployee,
  onReassignManager,
  onOpenAddModal,
}: OrgHierarchyTreeProps) {
  const { nicheConfig } = useIndustry();
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [editingManagerFor, setEditingManagerFor] = useState<string | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Group employees by manager
  const getDirectReports = (managerId: string | null) => {
    return employees.filter((e) => e.managerId === managerId);
  };

  const rootEmployees = getDirectReports(null);

  // Level badge formatting
  const getLevelLabel = (level: number) => {
    switch (level) {
      case 0:
        return 'Level 0: CEO / Executive Leader';
      case 1:
        return 'Level 1: VP / Department Manager';
      case 2:
        return 'Level 2: Team Lead / Supervisor';
      case 3:
        return 'Level 3: Clerk / Associate / Staff';
      default:
        return `Level ${level}`;
    }
  };

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 1:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 2:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 3:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-white/10 text-slate-300 border-white/20';
    }
  };

  const renderNode = (emp: EmployeeNode) => {
    const directReports = getDirectReports(emp.id);
    const isCollapsed = collapsedNodes[emp.id];
    const hasReports = directReports.length > 0;

    return (
      <div key={emp.id} className="flex flex-col items-center space-y-3 relative">
        {/* Employee Card Node */}
        <div
          className={`p-4 rounded-3xl border transition-all shadow-xl backdrop-blur-2xl relative w-72 sm:w-80 group ${
            emp.level === 0
              ? 'bg-gradient-to-tr from-amber-500/20 via-white/[0.04] to-orange-500/15 border-amber-500/60 ring-2 ring-amber-500/20 shadow-orange-500/15'
              : emp.level === 1
              ? 'bg-white/[0.04] border-sky-500/40 hover:border-sky-400/60'
              : emp.level === 2
              ? 'bg-white/[0.04] border-emerald-500/40 hover:border-emerald-400/60'
              : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.18]'
          }`}
        >
          {/* Level Badge Pill */}
          <div className="flex items-center justify-between mb-2.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border font-mono ${getLevelBadgeColor(
                emp.level
              )}`}
            >
              {getLevelLabel(emp.level).split(':')[0]}
            </span>

            <span className="text-[11px] font-mono font-bold text-amber-400">
              ${emp.salary.netMonthly.toLocaleString()}/mo
            </span>
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-3">
            <img
              src={emp.avatar}
              alt={emp.firstName}
              className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                {emp.firstName} {emp.lastName}
              </h4>
              <p className="text-[11px] text-amber-400/90 font-medium truncate">{emp.jobTitle}</p>
              <span className="text-[10px] text-slate-400 block truncate">{emp.department}</span>
            </div>
          </div>

          {/* Quick Actions & Reporting Line Editor */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onSelectEmployee(emp)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
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
                    <span>Change Manager</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Expand / Collapse Sub-Tree Toggle */}
          {hasReports && (
            <button
              type="button"
              onClick={() => toggleCollapse(emp.id)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-950 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
              title={isCollapsed ? 'Expand Direct Reports' : 'Collapse Direct Reports'}
            >
              {isCollapsed ? <ChevronDown size={13} /> : <ChevronRight size={13} className="rotate-90" />}
            </button>
          )}
        </div>

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
              {directReports.map((report) => renderNode(report))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              {nicheConfig.name} — Organizational Pipeline Tree
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {employees.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual hierarchy pipeline mapping from Executive Leadership (CEO) ➔ Department Managers ➔ Team Leads ➔ Clerks & Staff.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus size={14} />
          <span>Add Employee Node</span>
        </button>
      </div>

      {/* Hierarchy Tree Canvas */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 overflow-x-auto min-h-[500px] flex justify-center items-start shadow-inner">
        <div className="flex flex-col items-center space-y-8 min-w-max">
          {rootEmployees.map((root) => renderNode(root))}
        </div>
      </div>
    </div>
  );
}
