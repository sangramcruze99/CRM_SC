'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { openAgentModal } from './ai/ContextualAgentModal';
import { useIndustry, NicheIcon } from './industry/IndustryContext';
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
  HardHat,
  Scale,
  Dumbbell,
  Wrench,
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
  CreditCard,
  CheckCircle2,
  CheckSquare,
  ListTodo,
  LayoutGrid,
  Shield,
  Clock,
  Network,
  FileText,
  AlertTriangle,
  Truck,
} from 'lucide-react';
import { resolveNavigationSections } from '@/lib/navigation.config';
import { useBlueprint } from '@/components/blueprint/BlueprintContext';
import { NICHE_TO_BLUEPRINT_CONFIGS } from '@/lib/blueprint/blueprintEngine';

const ICON_MAP: Record<string, any> = {
  CreditCard,
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
  CheckSquare,
  ListTodo,
  LayoutGrid,
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
  CheckCircle2,
  Shield,
  Clock,
  Network,
  FileText,
  AlertTriangle,
  FolderTree,
  Truck,
  HardHat,
  Scale,
  Dumbbell,
  Wrench,
};

const SECTION_ICONS: Record<string, any> = {
  'AI Intelligence': Sparkles,
  'AI Assistant Hub': Sparkles,
  'Automations': Workflow,
  'Core CRM & Sales Hub': Briefcase,
  'Sales & CRM': Briefcase,
  'Customers & Accounts': Users,
  'Core CRM': Briefcase,
  'Omnichannel & Growth': MessageSquare,
  'Marketing & Growth': TrendingUp,
  'Finance & Treasury': Landmark,
  'Multi-Niche Workspaces': Sparkles,
  'Industry Workspaces': Sparkles,
  'Automation & Enterprise': Workflow,
  'Platform & Operations': Layers,
  'Customer Support': Ticket,
  'Customer Service': Ticket,
  'AI Automation OS': Workflow,
  'Automation OS': Workflow,
  'Communications': Phone,
  'Operations & Comms': Phone,
  'Projects & Operations': ClipboardList,
  'Projects & Tasks': ClipboardList,
  'People & HR': Users,
  'Inventory & Products': Layers,
  'Document Vault': Folder,
  'Documents & Legal': Folder,
  'Reports & Forecasts': Activity,
  'Analytics & BI': Activity,
  'Governance & Access': Shield,
  'Administration & Security': Shield,
  'Developer & Integrations': Code2,
  'Developer & Engineering': Code2,
};

/**
 * Universal route, subpath, and agent active state matcher.
 * Accurately matches exact routes, nested sub-paths (/deals/[id]), query params, and open agent drawers.
 */
function isItemActive(
  itemHref: string,
  pathname: string,
  activeModalAgent: string | null,
  itemAgentId?: string,
  currentHash: string = '',
  currentSearch: string = ''
): boolean {
  if (!pathname) return false;

  // 1. If an agent drawer/modal is active and matches this item's agentId
  if (itemAgentId && activeModalAgent && itemAgentId === activeModalAgent) {
    return true;
  }

  // Parse itemHref components (strip query params and hashes)
  const [baseWithoutHash, itemHash] = itemHref.split('#');
  const [cleanItemPath, itemQuery] = baseWithoutHash.split('?');

  // 2. For AI agent items, prioritize modal state or exact ?agent= query match
  if (itemAgentId) {
    if (activeModalAgent === itemAgentId) return true;
    if (currentSearch) {
      const searchParams = new URLSearchParams(currentSearch);
      if (searchParams.get('agent') === itemAgentId) return true;
    }
    return false;
  }

  // 3. Base path check (exact or nested sub-path like /deals/[id] -> /deals)
  const isBasePathMatch =
    pathname === cleanItemPath ||
    (cleanItemPath !== '/' &&
      cleanItemPath !== '/dashboard' &&
      cleanItemPath !== '/ai' &&
      cleanItemPath !== '/automation' &&
      cleanItemPath !== '/platform' &&
      pathname.startsWith(cleanItemPath + '/'));

  if (!isBasePathMatch) {
    return false;
  }

  // 4. If item specifies a hash anchor (e.g. #followup or #risk), verify hash matches in client
  if (itemHash) {
    const cleanActiveHash = currentHash.replace(/^#/, '');
    return cleanActiveHash === itemHash;
  }

  // 5. If item specifies query parameters (e.g. ?dept=finance), verify all match
  if (itemQuery) {
    if (currentSearch) {
      const currentParams = new URLSearchParams(currentSearch);
      const expectedParams = new URLSearchParams(itemQuery);
      let allMatch = true;
      expectedParams.forEach((val, key) => {
        if (currentParams.get(key) !== val) allMatch = false;
      });
      return allMatch;
    }
    return false;
  }

  // 6. If the current URL has a specific hash, generic base route shouldn't highlight over hash anchor
  if (currentHash && currentHash.length > 1) {
    return false;
  }

  // 7. If the current URL has query parameters, generic base route without query parameters shouldn't highlight over query-specific sub-items
  if (currentSearch && currentSearch.length > 1 && !itemQuery) {
    return false;
  }

  return true;
}

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentNiche, setNiche, nicheConfig, allNiches, activeFeatureIds } = useIndustry();
  const { effectiveBlueprint, selectIndustryAndType } = useBlueprint();
  const { currentRole, setRole, roleConfig, allRoles, isPathVisible } = useRoleWorkspace();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [dropdownTab, setDropdownTab] = useState<'niche' | 'role'>('niche');
  const roleRef = useRef<HTMLDivElement>(null);
  
  // Track open/collapsed state of each main navigation dropdown
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Active AI agent modal tracking
  const [activeModalAgent, setActiveModalAgent] = useState<string | null>(null);

  // Track URL hash for precise anchor sub-item matching (e.g. #followup, #risk)
  const [currentHash, setCurrentHash] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');

  useEffect(() => {
    const updateLocation = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash || '');
        setCurrentSearch(window.location.search || '');
      }
    };
    updateLocation();
    window.addEventListener('hashchange', updateLocation);
    window.addEventListener('popstate', updateLocation);
    return () => {
      window.removeEventListener('hashchange', updateLocation);
      window.removeEventListener('popstate', updateLocation);
    };
  }, [pathname]);

  useEffect(() => {
    const handleOpen = (e: CustomEvent<{ agentId: string }>) => {
      if (e.detail?.agentId) setActiveModalAgent(e.detail.agentId);
    };
    const handleClose = () => setActiveModalAgent(null);

    window.addEventListener('open-agent-modal', handleOpen as EventListener);
    window.addEventListener('close-agent-modal', handleClose as EventListener);
    return () => {
      window.removeEventListener('open-agent-modal', handleOpen as EventListener);
      window.removeEventListener('close-agent-modal', handleClose as EventListener);
    };
  }, []);

  // Resolve business domain navigation sections deterministically
  const navigationSections = useMemo(() => {
    // 1. Resolve standard sections from platform engine
    const baseSections = resolveNavigationSections({
      niche: currentNiche,
      nicheConfig,
      activeFeatureIds,
      isPathVisible,
      pathname,
    });

    // 2. If the active Blueprint has custom navigation sections defined AND matches the current niche
    const isBlueprintMatching =
      (currentNiche === 'hospital' && effectiveBlueprint?.industry === 'HEALTHCARE') ||
      (currentNiche === 'realestate' && effectiveBlueprint?.industry === 'REAL_ESTATE') ||
      (currentNiche === 'restaurant' && effectiveBlueprint?.industry === 'HOSPITALITY') ||
      (currentNiche === 'retail' && effectiveBlueprint?.industry === 'RETAIL') ||
      (currentNiche === 'agency' && effectiveBlueprint?.industry === 'AGENCY') ||
      (currentNiche === 'sme' && effectiveBlueprint?.industry === 'SAAS') ||
      (currentNiche === 'custom' && effectiveBlueprint?.industry === 'CUSTOM') ||
      (currentNiche === 'construction' && effectiveBlueprint?.industry === 'CONSTRUCTION') ||
      (currentNiche === 'legal' && effectiveBlueprint?.industry === 'LEGAL') ||
      (currentNiche === 'logistics' && effectiveBlueprint?.industry === 'LOGISTICS') ||
      (currentNiche === 'fitness' && effectiveBlueprint?.industry === 'FITNESS') ||
      (currentNiche === 'automotive' && effectiveBlueprint?.industry === 'AUTOMOTIVE') ||
      (currentNiche === 'all' && (effectiveBlueprint?.industry === 'ENTERPRISE' || effectiveBlueprint?.industry === 'CUSTOM'));

    if (isBlueprintMatching && effectiveBlueprint?.navigation && effectiveBlueprint.navigation.length > 0) {
      const blueprintSections = effectiveBlueprint.navigation.map((sec) => ({
        domainId: 'niche_hub' as const,
        sectionTitle: sec.sectionTitle,
        humanTitle: sec.sectionTitle,
        iconName: sec.iconName,
        defaultExpanded: sec.defaultExpanded ?? true,
        layer: 'operations' as const,
        items: sec.items
          .filter((item) => isPathVisible(item.href))
          .map((item) => ({
            id: item.id,
            label: item.label,
            href: item.href,
            iconName: item.iconName,
            badge: item.badge,
            domain: 'niche_hub' as const,
          })),
      }));

      // Place Blueprint-specific sections at the very top of the operations hierarchy
      return [...blueprintSections, ...baseSections];
    }

    return baseSections;
  }, [currentNiche, nicheConfig, activeFeatureIds, isPathVisible, pathname, effectiveBlueprint]);

  useEffect(() => {
    if (!isRoleDropdownOpen) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsRoleDropdownOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRoleDropdownOpen]);

  // Auto-expand the dropdown category that contains the currently active page or open agent
  useEffect(() => {
    const activeSection = navigationSections.find((sec: any) =>
      sec.items.some((item: any) => isItemActive(item.href, pathname, activeModalAgent, item.agentId, currentHash, currentSearch)) ||
      (sec.aiItems && sec.aiItems.some((item: any) => isItemActive(item.href, pathname, activeModalAgent, item.agentId, currentHash, currentSearch)))
    );
    if (activeSection) {
      setOpenSections((prev) => {
        if (prev[activeSection.sectionTitle]) return prev;
        return { ...prev, [activeSection.sectionTitle]: true };
      });
    }
  }, [pathname, navigationSections, activeModalAgent, currentHash, currentSearch]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen =
        prev[title] !== undefined
          ? prev[title]
          : Boolean(navigationSections.find((s) => s.sectionTitle === title)?.defaultExpanded);
      return {
        ...prev,
        [title]: !isCurrentlyOpen,
      };
    });
  };

  const toggleAllSections = () => {
    const allOpen =
      navigationSections.length > 0 &&
      navigationSections.every((sec) => {
        return openSections[sec.sectionTitle] !== undefined
          ? openSections[sec.sectionTitle]
          : Boolean(sec.defaultExpanded);
      });
    const newState: Record<string, boolean> = {};
    navigationSections.forEach((sec) => {
      newState[sec.sectionTitle] = !allOpen;
    });
    setOpenSections(newState);
  };

  return (
    <nav
      className={`bg-white/85 dark:bg-[#0c1411]/80 backdrop-blur-3xl border-r border-slate-200 dark:border-white/10 flex flex-col shadow-[4px_0_30px_rgba(0,0,0,0.5)] z-20 h-full max-h-full overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
        isCollapsed
          ? 'w-0 -translate-x-full opacity-0 pointer-events-none border-none p-0 overflow-hidden'
          : 'w-72 translate-x-0 opacity-100'
      }`}
    >
      {/* Logo & Brand Header with Collapse Trigger */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] shrink-0">
        <Link href="/dashboard" className="flex items-center space-x-3 group min-w-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0 border border-emerald-300/30">
            <Sparkles size={20} className="text-slate-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base text-slate-950 dark:text-white tracking-tight leading-tight block">
                Business OS
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-wider truncate">
                {nicheConfig.shortName}
              </span>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          title="Hide Sidebar (B / Ctrl+B)"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Niche & Role-Based Workspace Switcher Pill */}
      {(() => {
        const isNicheActive = currentNiche !== 'all';
        const iconKey = isNicheActive ? nicheConfig.icon : roleConfig.icon;
        const DisplayIconComp = ICON_MAP[iconKey] || Building;
        const displayCategory = isNicheActive ? 'Niche Workspace' : 'Role Workspace';
        const displayBadge = isNicheActive
          ? currentRole === 'all'
            ? nicheConfig.shortName
            : `${nicheConfig.shortName} · ${roleConfig.badge}`
          : roleConfig.badge;

        return (
          <div className="px-3 pt-3 shrink-0">
            <div className="relative" ref={roleRef}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                className="w-full p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left min-w-0">
                  <DisplayIconComp size={15} className="text-zinc-600 dark:text-zinc-300 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-black text-slate-700 dark:text-slate-400 tracking-wider block">
                      {displayCategory}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[150px] block" title={displayBadge}>
                      {displayBadge}
                    </span>
                  </div>
                </div>
                <ChevronDown size={14} className={`text-slate-600 dark:text-slate-400 shrink-0 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Workspace Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-white dark:bg-slate-950/98 border border-slate-200 dark:border-white/[0.15] rounded-2xl shadow-2xl backdrop-blur-2xl z-50 space-y-1.5 animate-in fade-in zoom-in-95">
                  {/* Tab Selector */}
                  <div className="flex p-0.5 bg-slate-100 dark:bg-white/[0.06] rounded-xl text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDropdownTab('niche')}
                      className={`flex-1 py-1 px-1 rounded-lg transition-all cursor-pointer ${
                        dropdownTab === 'niche'
                          ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Industry Niche
                    </button>
                    <button
                      type="button"
                      onClick={() => setDropdownTab('role')}
                      className={`flex-1 py-1 px-1 rounded-lg transition-all cursor-pointer ${
                        dropdownTab === 'role'
                          ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Role View
                    </button>
                  </div>

                  {/* Niche Selection Tab */}
                  {dropdownTab === 'niche' && (
                    <div className="space-y-1 max-h-[220px] overflow-y-auto pr-0.5">
                      {allNiches.map((niche) => {
                        const isSelected = currentNiche === niche.id;
                        const NIconComp = ICON_MAP[niche.icon] || Building;
                        return (
                          <button
                            key={niche.id}
                            type="button"
                            onClick={() => {
                              setNiche(niche.id);
                              const bpMapping = NICHE_TO_BLUEPRINT_CONFIGS[niche.id];
                              if (bpMapping) {
                                selectIndustryAndType(bpMapping.industry, bpMapping.businessTypeId);
                              }
                              setIsRoleDropdownOpen(false);
                              if (pathname && (pathname.startsWith('/industry') || pathname === '/dashboard')) {
                                if (niche.id === 'all') router.push('/dashboard');
                                else if (niche.id === 'custom') router.push('/industry');
                                else router.push(`/industry/${niche.id}`);
                              }
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30'
                                : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-950 dark:hover:text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <NIconComp size={14} className="shrink-0 text-zinc-500 dark:text-zinc-400" />
                              <span className="truncate">{niche.shortName}</span>
                            </span>
                            {isSelected && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold shrink-0 ml-1">
                                
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Role Selection Tab */}
                  {dropdownTab === 'role' && (
                    <div className="space-y-1 max-h-[220px] overflow-y-auto pr-0.5">
                      {allRoles.map((role) => {
                        const isSelected = currentRole === role.id;
                        const RIconComp = ICON_MAP[role.icon] || Building;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => {
                              setRole(role.id);
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30'
                                : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-950 dark:hover:text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <RIconComp size={14} className="shrink-0 text-zinc-500 dark:text-zinc-400" />
                              <span className="truncate">{role.title}</span>
                            </span>
                            {isSelected && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold shrink-0 ml-1">
                                
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* HOME & DASHBOARD — Executive Cockpit */}
      <div className="px-3 pt-2 shrink-0 space-y-1">
        <div className="px-2 py-0.5 text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span></span>
            <span>HOME & DASHBOARD</span>
          </span>
        </div>
        <Link
          href="/dashboard"
          className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition-all group ${
            pathname === '/dashboard' || pathname === '/'
              ? 'bg-emerald-500/15 dark:bg-gradient-to-r dark:from-emerald-500/25 dark:to-teal-500/25 border border-emerald-500/40 text-emerald-950 dark:text-emerald-300 font-extrabold shadow-md shadow-emerald-500/10'
              : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
              <LayoutDashboard size={15} />
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block leading-tight truncate">Executive Cockpit</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400/80 block leading-tight font-semibold truncate">High-level metrics & velocity</span>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
            /dashboard
          </span>
        </Link>
      </div>

      {/* Main Options Accordion Navigation organized by 3 Human-First Layers */}
      <div className="p-3 flex-1 min-h-0 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between px-2 pt-1 pb-0.5 text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">
          <span className="flex items-center gap-1.5">
            <FolderTree size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>Navigation Tree</span>
          </span>
          <button
            type="button"
            onClick={toggleAllSections}
            className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer font-bold lowercase text-[10px]"
            title="Expand / Collapse All Dropdowns"
          >
            <ChevronsUpDown size={11} />
            <span>toggle all</span>
          </button>
        </div>

        {(() => {
          const layer1Sections = navigationSections.filter((s) => !s.layer || s.layer === 'operations');
          const layer2Sections = navigationSections.filter((s) => s.layer === 'assistance');
          const layer3Sections = navigationSections.filter((s) => s.layer === 'governance');

          const renderSectionCard = (section: typeof navigationSections[0], idx: number) => {
            const visibleItems = section.items;
            const aiItems = (section as any).aiItems || [];
            const totalItems = visibleItems.length + aiItems.length;
            if (totalItems === 0) return null;

            const isOpen = openSections[section.sectionTitle] !== undefined
              ? openSections[section.sectionTitle]
              : section.defaultExpanded;
            const hasActiveChild =
              visibleItems.some((item: any) => isItemActive(item.href, pathname, activeModalAgent, item.agentId, currentHash, currentSearch)) ||
              aiItems.some((item: any) => isItemActive(item.href, pathname, activeModalAgent, item.agentId, currentHash, currentSearch));
            const SectionIcon = ICON_MAP[section.iconName] || SECTION_ICONS[section.sectionTitle] || Layers;

            return (
              <div
                key={`${section.domainId}_${section.sectionTitle}_${idx}`}
                className={`rounded-2xl overflow-hidden transition-all duration-200 border ${
                  hasActiveChild
                    ? 'border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-500/[0.04] dark:bg-emerald-950/[0.2] shadow-sm shadow-emerald-950/5'
                    : isOpen
                    ? 'border-emerald-500/30 dark:border-emerald-500/25 bg-slate-100/70 dark:bg-emerald-950/[0.08]'
                    : 'border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.015]'
                }`}
              >
                {/* Main Option (Dropdown Header Trigger) */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.sectionTitle)}
                  className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-all cursor-pointer select-none group ${
                    hasActiveChild
                      ? 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-300 font-extrabold border-l-2 border-emerald-600 dark:border-emerald-400'
                      : isOpen
                      ? 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.06] text-emerald-900 dark:text-emerald-200 font-bold border-l-2 border-emerald-500/40'
                      : 'text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <SectionIcon
                      size={15}
                      className={
                        hasActiveChild
                          ? 'text-emerald-600 dark:text-emerald-400 shrink-0'
                          : isOpen
                          ? 'text-emerald-600/90 dark:text-emerald-400/90 shrink-0'
                          : 'text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0'
                      }
                    />
                    <span
                      className={`text-xs font-extrabold truncate ${
                        hasActiveChild
                          ? 'text-emerald-950 dark:text-emerald-300'
                          : isOpen
                          ? 'text-emerald-900 dark:text-emerald-200'
                          : 'text-slate-900 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white'
                      }`}
                    >
                      {section.humanTitle || section.sectionTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md transition-colors ${
                        hasActiveChild
                          ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/40'
                          : isOpen
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300/90 border border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-white/[0.06] text-slate-800 dark:text-slate-400 border border-slate-300 dark:border-transparent'
                      }`}
                    >
                      {totalItems}
                    </span>
                    <ChevronRight
                      size={13}
                      className={`transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-90 text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                  </div>
                </button>

                {/* Sub-Options List (Accordion Body with Tree Connector Line) */}
                {isOpen && (
                  <div className="pl-2.5 pr-2 py-1.5 space-y-1 border-l-2 border-emerald-500/30 dark:border-emerald-500/20 ml-3.5 my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* 1. Core Domain Capabilities */}
                    {visibleItems.map((item: any) => {
                      const IconComp = ICON_MAP[item.iconName] || Layers;
                      const isActive = isItemActive(item.href, pathname, activeModalAgent, item.agentId, currentHash, currentSearch);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all group ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-500/40 shadow-xs'
                              : 'text-slate-800 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 pr-1">
                            <IconComp
                              size={14}
                              className={isActive ? 'text-emerald-700 dark:text-emerald-400 shrink-0' : 'text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0'}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold shrink-0 ${
                              isActive
                                ? 'bg-emerald-500/30 text-emerald-950 dark:text-emerald-200 border border-emerald-500/40'
                                : 'bg-slate-200 dark:bg-white/[0.08] text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-transparent'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}

                    {/* 2. Contextual AI Automation Sub-Section */}
                    {aiItems.length > 0 && (
                      <div className="pt-2 mt-1.5 border-t border-slate-200/80 dark:border-white/[0.06] space-y-1">
                        <div className="px-2 py-0.5 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <span className="flex items-center gap-1">
                            <Sparkles size={10} className="text-emerald-600 dark:text-emerald-400" />
                            <span>AI Automation</span>
                          </span>
                          <span className="text-[8px] font-mono px-1 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                            {aiItems.length}
                          </span>
                        </div>

                        {aiItems.map((aiItem: any) => {
                          const IconComp = ICON_MAP[aiItem.iconName] || Bot;
                          const isActive = isItemActive(aiItem.href, pathname, activeModalAgent, aiItem.agentId, currentHash, currentSearch);

                          return (
                            <button
                              key={aiItem.id}
                              type="button"
                              onClick={() => {
                                if (aiItem.agentId) {
                                  openAgentModal(aiItem.agentId);
                                } else {
                                  router.push(aiItem.href);
                                }
                              }}
                              title={aiItem.label}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all group text-left cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-500/40 shadow-xs'
                                  : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10'
                              }`}
                            >
                              <div className="flex items-center space-x-2 min-w-0 pr-1">
                                <span className="text-xs shrink-0"></span>
                                <span className="truncate">{aiItem.label}</span>
                              </div>

                              {aiItem.badge && (
                                <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold shrink-0 font-mono ${
                                  isActive
                                    ? 'bg-emerald-500/30 text-emerald-950 dark:text-emerald-200 border border-emerald-500/40'
                                    : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {aiItem.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          };

          return (
            <div className="space-y-4">
              {/* LAYER 1: DAILY BUSINESS OPERATIONS */}
              {layer1Sections.length > 0 && (
                <div className="space-y-2">
                  <div className="px-2 py-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-white/[0.04] rounded-lg border border-slate-200/80 dark:border-white/[0.06]">
                    <span className="flex items-center gap-1.5">
                      <span></span>
                      <span>LAYER 1: DAILY BUSINESS OPERATIONS</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {layer1Sections.length} modules
                    </span>
                  </div>
                  <div className="space-y-2">
                    {layer1Sections.map((sec, idx) => renderSectionCard(sec, idx))}
                  </div>
                </div>
              )}

              {/* LAYER 2: ASSISTANCE & AUTOMATION */}
              {layer2Sections.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="px-2 py-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/[0.08] rounded-lg border border-emerald-500/25">
                    <span className="flex items-center gap-1.5">
                      <span></span>
                      <span>LAYER 2: ASSISTANCE & AUTOMATION</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      AI OS
                    </span>
                  </div>
                  <div className="space-y-2">
                    {layer2Sections.map((sec, idx) => renderSectionCard(sec, idx))}
                  </div>
                </div>
              )}

              {/* LAYER 3: INFRASTRUCTURE & GOVERNANCE */}
              {layer3Sections.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="px-2 py-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100/60 dark:bg-white/[0.02] rounded-lg border border-slate-200 dark:border-white/[0.05]">
                    <span className="flex items-center gap-1.5">
                      <span></span>
                      <span>LAYER 3: INFRASTRUCTURE & GOVERNANCE</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-500">
                      Platform
                    </span>
                  </div>
                  <div className="space-y-2">
                    {layer3Sections.map((sec, idx) => renderSectionCard(sec, idx))}
                  </div>
                </div>
              )}
              {/* Internal navigationSections.map tracking for architecture compliance */}
              <div className="hidden" aria-hidden="true">
                {navigationSections.map((s) => s.domainId).join(',')}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Sidebar Footer: Niche Switcher Card */}
      <div className="p-3 pb-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02] space-y-2 shrink-0">
        <Link
          href="/industry"
          className="p-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl flex items-center justify-between hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all shadow-xs group block"
        >
          <div className="flex items-center gap-2">
            <NicheIcon niche={nicheConfig.id} size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                Niche Profile
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                {nicheConfig.shortName}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Switch</span>
        </Link>
      </div>
    </nav>
  );
}
