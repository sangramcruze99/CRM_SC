'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIndustry } from './industry/IndustryContext';
import { useRoleWorkspace, WORKSPACE_ROLES, WorkspaceRole } from './platform/RoleWorkspaceContext';
import { useSidebar } from './platform/SidebarContext';
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
  Scan,
  ChevronDown,
  ChevronRight,
  Phone,
  Workflow,
  Trophy,
  Globe,
  Landmark,
  Presentation,
  ArrowRightLeft,
  Smartphone,
  Sliders,
  Palette,
  TrendingUp,
  FolderTree,
  ChevronsUpDown,
  PanelLeftClose,
  Layout,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Layout,
  Palette,
  Smartphone,
  ArrowRightLeft,
  Scan,
  Phone,
  Workflow,
  Trophy,
  Globe,
  Landmark,
  Presentation,
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

const SECTION_ICONS: Record<string, any> = {
  'Core CRM & Sales Hub': Briefcase,
  'Core CRM': Briefcase,
  'Omnichannel & Growth': MessageSquare,
  'Marketing & Growth': TrendingUp,
  'Finance & Treasury': Landmark,
  'Multi-Niche Workspaces': Sparkles,
  'Industry Workspaces': Sparkles,
  'Automation & Enterprise': Workflow,
  'Platform & Operations': Layers,
};

export function SidebarNav() {
  const pathname = usePathname();
  const { currentNiche, nicheConfig } = useIndustry();
  const { currentRole, setRole, roleConfig, allRoles, isPathVisible } = useRoleWorkspace();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  // Track open/collapsed state of each main navigation dropdown
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Auto-expand the dropdown category that contains the currently active page
  useEffect(() => {
    nicheConfig.navigationSections.forEach((section) => {
      const hasActiveChild = section.items.some((item) => item.href === pathname);
      if (hasActiveChild) {
        setOpenSections((prev) => ({ ...prev, [section.sectionTitle]: true }));
      }
    });
  }, [pathname, nicheConfig]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: prev[title] !== undefined ? !prev[title] : false,
    }));
  };

  const toggleAllSections = () => {
    const allOpen = Object.values(openSections).every(Boolean) && Object.keys(openSections).length === nicheConfig.navigationSections.length;
    const newState: Record<string, boolean> = {};
    nicheConfig.navigationSections.forEach((sec) => {
      newState[sec.sectionTitle] = !allOpen;
    });
    setOpenSections(newState);
  };

  return (
    <nav
      className={`bg-slate-950/85 dark:bg-slate-950/85 backdrop-blur-2xl border-r border-slate-200 dark:border-white/[0.08] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-20 h-screen transition-all duration-300 ease-in-out shrink-0 ${
        isCollapsed
          ? 'w-0 -translate-x-full opacity-0 pointer-events-none border-none p-0 overflow-hidden'
          : 'w-72 translate-x-0 opacity-100'
      }`}
    >
      {/* Logo & Brand Header with Collapse Trigger */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08]">
        <Link href="/dashboard" className="flex items-center space-x-3 group min-w-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform shrink-0 border border-amber-300/30">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight leading-tight block">
                Business OS
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 whitespace-nowrap">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {nicheConfig.shortName}
              </span>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          title="Hide Sidebar (⌘B / Ctrl+B)"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Role-Based Workspace Switcher Pill */}
      <div className="px-3 pt-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="w-full p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-left min-w-0">
              <span className="text-sm shrink-0">{roleConfig.icon}</span>
              <div className="min-w-0">
                <span className="text-[9px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider block">
                  Role Workspace
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px] block">
                  {roleConfig.badge}
                </span>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>

          {/* Role Dropdown Menu */}
          {isRoleDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 bg-white dark:bg-slate-950/95 border border-slate-200 dark:border-white/[0.15] rounded-2xl shadow-2xl backdrop-blur-2xl z-50 space-y-1 animate-in fade-in zoom-in-95">
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
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{role.icon}</span>
                    <span>{role.title}</span>
                  </span>
                  {currentRole === role.id && <span className="text-[10px] text-amber-500 dark:text-amber-400 font-mono">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Options Accordion Navigation */}
      <div className="p-3 flex-1 space-y-2 overflow-y-auto">
        <div className="flex items-center justify-between px-2 pt-1 pb-0.5 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
          <span className="flex items-center gap-1.5">
            <FolderTree size={12} className="text-amber-500 dark:text-amber-400" />
            <span>Navigation Hub</span>
          </span>
          <button
            type="button"
            onClick={toggleAllSections}
            className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer font-bold lowercase text-[10px]"
            title="Expand / Collapse All Dropdowns"
          >
            <ChevronsUpDown size={11} />
            <span>toggle all</span>
          </button>
        </div>

        {nicheConfig.navigationSections.map((section, idx) => {
          // Filter items based on active role workspace
          const visibleItems = section.items.filter((item) => isPathVisible(item.href));
          if (visibleItems.length === 0) return null;

          // Check if dropdown is open (default: first section open or explicitly opened)
          const isOpen = openSections[section.sectionTitle] !== undefined ? openSections[section.sectionTitle] : idx === 0;
          const hasActiveChild = visibleItems.some((item) => item.href === pathname);
          const SectionIcon = SECTION_ICONS[section.sectionTitle] || Layers;

          return (
            <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.015]">
              {/* Main Option (Dropdown Header Trigger) */}
              <button
                type="button"
                onClick={() => toggleSection(section.sectionTitle)}
                className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-all cursor-pointer select-none group ${
                  hasActiveChild
                    ? 'bg-amber-500/10 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border-l-2 border-amber-500'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SectionIcon
                    size={15}
                    className={hasActiveChild ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors'}
                  />
                  <span className="text-xs font-bold truncate">
                    {section.sectionTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                    {visibleItems.length}
                  </span>
                  <ChevronRight
                    size={13}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90 text-amber-500 dark:text-amber-400' : ''}`}
                  />
                </div>
              </button>

              {/* Sub-Options List (Accordion Body with Tree Connector Line) */}
              {isOpen && (
                <div className="pl-2.5 pr-2 py-1.5 space-y-1 border-l-2 border-slate-200 dark:border-white/[0.08] ml-3.5 my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {visibleItems.map((item) => {
                    const IconComp = ICON_MAP[item.iconName] || Layers;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl font-medium text-xs transition-all group ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/40 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 pr-1">
                          <IconComp
                            size={14}
                            className={isActive ? 'text-amber-600 dark:text-amber-400 shrink-0' : 'text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors shrink-0'}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold shrink-0 ${
                            isActive
                              ? 'bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-500/40'
                              : 'bg-slate-200 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: Niche Switcher Card */}
      <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02] space-y-2">
        <Link
          href="/industry"
          className="p-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl flex items-center justify-between hover:border-amber-500/40 hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all shadow-xs group block"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{nicheConfig.icon}</span>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                Niche Profile
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                {nicheConfig.shortName}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Switch</span>
        </Link>
      </div>
    </nav>
  );
}
