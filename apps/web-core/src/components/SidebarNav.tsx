'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIndustry } from './industry/IndustryContext';
import { useRoleWorkspace, WORKSPACE_ROLES, WorkspaceRole } from './platform/RoleWorkspaceContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  Receipt,
  Ticket,
  Contact,
  Folder,
  Database,
  Brain,
  MessageSquare,
  Building,
  DollarSign,
  FileBadge,
  Layers,
  Zap,
  FileSignature,
  FileCheck,
  Activity,
  ShieldAlert,
  ShieldCheck,
  CloudUpload,
  Globe2,
  SearchCheck,
  Bot,
  Code2,
  Share2,
  Mail,
  Sparkles,
  Stethoscope,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Settings,
  Sliders,
  Scan,
  ChevronDown,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Scan,
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  Receipt,
  Ticket,
  Contact,
  Folder,
  Database,
  Brain,
  MessageSquare,
  Building,
  DollarSign,
  FileBadge,
  Layers,
  Zap,
  FileSignature,
  FileCheck,
  Activity,
  ShieldAlert,
  ShieldCheck,
  CloudUpload,
  Globe2,
  SearchCheck,
  Bot,
  Code2,
  Share2,
  Mail,
  Sparkles,
  Stethoscope,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Settings,
  Sliders,
};

export function SidebarNav() {
  const pathname = usePathname();
  const { currentNiche, nicheConfig } = useIndustry();
  const { currentRole, setRole, roleConfig, allRoles, isPathVisible } = useRoleWorkspace();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  return (
    <nav className="w-64 bg-slate-950/75 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-20 h-screen">
      {/* Logo & Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/[0.08]">
        <Link href="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight block">Business OS</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block -mt-0.5">
                Glassmorphism
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-white/[0.08] text-slate-300 border border-white/[0.1]">
                {nicheConfig.icon} {nicheConfig.shortName.split(' ')[0]}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Role-Based Workspace Switcher Pill */}
      <div className="px-3 pt-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="w-full p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-left">
              <span className="text-sm">{roleConfig.icon}</span>
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block">
                  Role Workspace
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[130px] block">
                  {roleConfig.badge}
                </span>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Role Dropdown Menu */}
          {isRoleDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 bg-slate-950/95 border border-white/[0.15] rounded-2xl shadow-2xl backdrop-blur-2xl z-50 space-y-1 animate-in fade-in zoom-in-95">
              {allRoles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setRole(role.id);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    currentRole === role.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{role.icon}</span>
                    <span>{role.title}</span>
                  </span>
                  {currentRole === role.id && <span className="text-[10px] text-amber-400 font-mono">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections (Filtered by Role Workspace) */}
      <div className="p-3 flex-1 space-y-4 overflow-y-auto">
        {nicheConfig.navigationSections.map((section, idx) => {
          // Filter items based on active role workspace
          const visibleItems = section.items.filter((item) => isPathVisible(item.href));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 px-3">
                {section.sectionTitle}
              </div>

              {visibleItems.map((item) => {
                const IconComp = ICON_MAP[item.iconName] || Layers;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent text-amber-400 font-semibold border border-amber-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <IconComp
                        size={15}
                        className={isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400 transition-colors'}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                        isActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/[0.08] text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: Niche Switcher Card */}
      <div className="p-3 border-t border-white/[0.08] bg-white/[0.02] space-y-2">
        <Link
          href="/industry"
          className="p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-between hover:border-amber-500/40 hover:bg-white/[0.07] transition-all shadow-sm group block"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{nicheConfig.icon}</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Niche Profile
              </span>
              <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                {nicheConfig.shortName}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-amber-400 font-bold">Switch</span>
        </Link>
      </div>
    </nav>
  );
}
