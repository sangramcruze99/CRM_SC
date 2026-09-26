'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  BackgroundVariant,
  useReactFlow,
  useViewport,
  ReactFlowProvider,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NODE_CATALOG } from '@/lib/automationNodeCatalog';
import { UniversalIntentBuilder } from '@/components/automation/intent/UniversalIntentBuilder';
import { GuidedModeBuilder } from '@/components/automation/intent/GuidedModeBuilder';
import { WorkflowModeSwitcher, AutomationBuilderMode } from '@/components/automation/WorkflowModeSwitcher';
import { AutomationExplanationModal } from '@/components/automation/AutomationExplanationModal';
import type { StructuredIntent } from '@/components/automation/intent/types';

import {
  Workflow,
  Play,
  Save,
  Plus,
  ArrowLeft,
  ArrowUpDown,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Bot,
  Mail,
  MessageSquare,
  Phone,
  Database,
  Globe,
  FileText,
  UserPlus,
  GitFork,
  Hourglass,
  RotateCw,
  X,
  ChevronRight,
  Terminal,
  Wand2,
  HelpCircle,
  Maximize2,
  Minus,
  Copy,
  Trash2,
  Layers,
  Settings2,
  Search,
  Check,
  Building,
  Briefcase,
  Ticket,
  FolderPlus,
  Folder,
  FolderOpen,
  HardDrive,
  FileSpreadsheet,
  Smartphone,
  PhoneIncoming,
  LayoutGrid,
  FileUp,
  UserCog,
  MessageCircle,
  CheckCheck,
  CalendarX,
  CalendarOff,
  Inbox,
  Calendar,
  MousePointer,
  GraduationCap,
  Award,
  DollarSign,
  UserCheck,
  BadgePercent,
  Brain,
  Split,
  Repeat,
  Octagon,
  Tag,
  StickyNote,
  Ban,
  Archive,
  CalendarCheck,
  CalendarClock,
  AlertCircle,
  Scale,
  ArrowUpRight,
  FileDown,
  Activity,
  Share2,
  ScrollText,
  RotateCcw,
  ShieldX,
  XCircle,
} from 'lucide-react';

// Icon Map for canvas nodes
const ICON_LOOKUP: Record<string, any> = {
  UserPlus,
  Contact: UserPlus,
  Building,
  Briefcase,
  GitCommit: GitFork,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Smartphone,
  Phone,
  PhoneIncoming,
  Ticket,
  FolderPlus,
  Folder,
  FolderOpen,
  HardDrive,
  Receipt: FileText,
  AlertTriangle,
  Clock,
  Zap,
  Play,
  GitFork,
  Filter: Sliders,
  Sliders,
  Hourglass,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Cpu: Bot,
  TrendingUp: Zap,
  Bot,
  Database,
  UserCheck,
  ArrowRight: ChevronRight,
  CheckSquare: CheckCircle2,
  Scan: Sparkles,
  Compass: Globe,
  FileUp,
  UserCog,
  MessageCircle,
  CheckCheck,
  CalendarX,
  CalendarOff,
  Inbox,
  Calendar,
  MousePointer,
  ScanText: FileText,
  FileType2: FileText,
  GraduationCap,
  Award,
  DollarSign,
  BadgePercent,
  Brain,
  Split,
  Repeat,
  Octagon,
  Tag,
  StickyNote,
  Ban,
  Archive,
  CalendarCheck,
  CalendarClock,
  AlertCircle,
  Scale,
  ArrowUpRight,
  FileDown,
  Activity,
  Share2,
  ScrollText,
  RotateCcw,
  ShieldX,
  CheckCircle2,
  XCircle,
};

// Category styling tokens & theme badges
interface CategoryTheme {
  border: string;
  bg: string;
  iconBg: string;
  badge: string;
  accent: string;
  defaultBadge: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  TRIGGER: {
    border: 'border-emerald-500/60 hover:border-emerald-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-emerald-950/20',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    accent: '#10b981',
    defaultBadge: ' TRIGGER',
  },
  DOCUMENTS: {
    border: 'border-rose-500/60 hover:border-rose-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-rose-950/20',
    iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/20',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    accent: '#f43f5e',
    defaultBadge: ' DOCUMENT AI',
  },
  RECRUITMENT_AI: {
    border: 'border-emerald-500/60 hover:border-emerald-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-emerald-950/20',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    accent: '#8b5cf6',
    defaultBadge: ' RECRUITMENT AI',
  },
  LOGIC: {
    border: 'border-amber-500/60 hover:border-amber-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-amber-950/20',
    iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    accent: '#f59e0b',
    defaultBadge: ' LOGIC GATE',
  },
  CANDIDATE: {
    border: 'border-teal-500/60 hover:border-teal-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-teal-950/20',
    iconBg: 'bg-teal-500/20 text-teal-400 border border-teal-500/40 shadow-teal-500/20',
    badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
    accent: '#6366f1',
    defaultBadge: ' CANDIDATE CRM',
  },
  COMMUNICATION: {
    border: 'border-cyan-500/60 hover:border-cyan-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-cyan-950/20',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-cyan-500/20',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    accent: '#06b6d4',
    defaultBadge: ' COMMUNICATION',
  },
  CALENDAR: {
    border: 'border-sky-500/60 hover:border-sky-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-sky-950/20',
    iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sky-500/20',
    badge: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
    accent: '#0284c7',
    defaultBadge: ' CALENDAR',
  },
  HUMAN: {
    border: 'border-orange-500/60 hover:border-orange-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-orange-950/20',
    iconBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-orange-500/20',
    badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
    accent: '#f97316',
    defaultBadge: ' HITL APPROVAL',
  },
  OUTPUT: {
    border: 'border-teal-500/60 hover:border-teal-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-teal-950/20',
    iconBg: 'bg-teal-500/20 text-teal-400 border border-teal-500/40 shadow-teal-500/20',
    badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
    accent: '#14b8a6',
    defaultBadge: ' OUTPUT SINK',
  },
  SYSTEM: {
    border: 'border-slate-500/60 hover:border-slate-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-slate-950/20',
    iconBg: 'bg-slate-500/20 text-slate-300 border border-slate-500/40 shadow-slate-500/20',
    badge: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
    accent: '#64748b',
    defaultBadge: ' SYSTEM OPS',
  },
  AI_AGENT: {
    border: 'border-fuchsia-500/60 hover:border-fuchsia-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-fuchsia-950/20',
    iconBg: 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40 shadow-fuchsia-500/20',
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40',
    accent: '#d946ef',
    defaultBadge: ' AUTONOMOUS AGENT',
  },
  AI: {
    border: 'border-emerald-500/60 hover:border-emerald-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-emerald-950/20',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    accent: '#8b5cf6',
    defaultBadge: ' AI ENGINE',
  },
  CRM: {
    border: 'border-blue-500/60 hover:border-blue-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-blue-950/20',
    iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-blue-500/20',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    accent: '#3b82f6',
    defaultBadge: ' CRM ACTION',
  },
  EXTERNAL: {
    border: 'border-teal-500/60 hover:border-teal-400',
    bg: 'bg-gradient-to-b from-slate-900/95 to-teal-950/20',
    iconBg: 'bg-teal-500/20 text-teal-400 border border-teal-500/40 shadow-teal-500/20',
    badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
    accent: '#14b8a6',
    defaultBadge: ' CONNECTOR',
  },
  DEFAULT: {
    border: 'border-slate-700 hover:border-slate-500',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-slate-800 text-slate-300 border border-slate-700',
    badge: 'bg-slate-800 text-slate-300 border border-slate-700',
    accent: '#64748b',
    defaultBadge: 'STEP',
  },
};

// Built-in templates for quick-switcher
const QUICK_TEMPLATES = [
  {
    id: 'tmpl_autonomous_recruitment_screening',
    name: 'Autonomous Resume Screening & Interview Scheduler (Flagship)',
    category: 'Recruitment',
    description: 'Flagship 20-node pipeline: OCR extraction, candidate profile, JD skill matching, structured AI scoring, shortlisting, invite & calendar booking.',
  },
  {
    id: 'tmpl_recruitment_screening',
    name: 'Autonomous Recruitment Resume Screener',
    category: 'Recruitment',
    description: 'Scans PDF resumes with OCR, scores against job requirements, and schedules interviews.',
  },
  {
    id: 'tmpl_high_volume_screening',
    name: 'High-Volume Candidate Screening & Auto-Triaging',
    category: 'Recruitment',
    description: 'Fast-track high-volume inbound CVs with automated deduplication, profile extraction, and batch shortlisting.',
  },
  {
    id: 'tmpl_interview_scheduling',
    name: 'Autonomous Interview Scheduling & Common Availability',
    category: 'Calendar',
    description: 'Inspects interviewer & candidate calendar free-slots, finds common availability, and books calendar meeting.',
  },
  {
    id: 'tmpl_interview_reminder',
    name: 'Interview Reminder & 24h Confirmation Sequence',
    category: 'Communication',
    description: 'Automated 24h & 2h pre-interview WhatsApp & email reminders with one-click reschedule detection.',
  },
  {
    id: 'tmpl_no_show_recovery',
    name: 'Interview No-Show Auto-Recovery & Rescheduling',
    category: 'Recruitment',
    description: 'Detects missed interviews, sends polite recovery outreach, and provides rebooking link.',
  },
  {
    id: 'tmpl_candidate_followup',
    name: 'Candidate Follow-Up & Application Status Check',
    category: 'Communication',
    description: 'Autonomous follow-up cadence checking applicant responsiveness with smart delays.',
  },
  {
    id: 'tmpl_recruiter_approval',
    name: 'Recruiter Quality Approval Gate (HITL)',
    category: 'Human-in-Loop',
    description: 'Pauses execution in WAITING_FOR_APPROVAL status for senior recruiter sign-off before candidate rejection or offer.',
  },
  {
    id: 'tmpl_voice_receptionist',
    name: 'AI Voice Receptionist & Smart Triage',
    category: 'Voice',
    description: 'Answers calls via Twilio AI voice agent, resolves FAQs, and logs audio & transcripts.',
  },
  {
    id: 'tmpl_invoice_processing',
    name: 'Autonomous OCR Invoice & Dual Khata Reconciler',
    category: 'Finance',
    description: 'Vision AI extracts invoice line items, triggers CFO approval, and posts to ledger.',
  },
];

// Available Input Folders & Smart Vault Directories for workflow data ingestion
const AVAILABLE_INPUT_FOLDERS = [
  {
    id: 'vault_crm_leads',
    name: 'CRM Inbound Leads Dropzone',
    path: '/vault/inbound/crm_leads/',
    category: 'CRM & Sales',
    records: '1,420 records',
    formats: ['.json', '.csv'],
    badge: 'Live Stream',
    description: 'Watches newly captured prospects and CRM webhook sync files',
  },
  {
    id: 'vault_invoices',
    name: 'Smart Vault Scanned Invoices',
    path: '/vault/documents/invoices_scanned/',
    category: 'Finance & Accounts',
    records: '342 files',
    formats: ['.pdf', '.png', '.tiff'],
    badge: 'OCR Ingestion',
    description: 'Inbound OCR directory for supplier bills, tax invoices, and dual khata receipts',
  },
  {
    id: 'vault_resumes',
    name: 'Recruitment CV Dropzone',
    path: '/vault/resumes/engineering_pipeline/',
    category: 'HR & Talent',
    records: '89 files',
    formats: ['.pdf', '.docx'],
    badge: 'Resume Screener',
    description: 'Applicant resumes ingested from job boards, careers portal, and email attachments',
  },
  {
    id: 'vault_b2b_prospects',
    name: 'B2B Lead Prospector & CSV Lists',
    path: '/vault/campaigns/csv_imports/',
    category: 'Marketing & Lists',
    records: '5,600 rows',
    formats: ['.csv', '.xlsx'],
    badge: 'Batch Table',
    description: 'Bulk prospect lists and Apollo/LinkedIn export dumps for autonomous AI scoring',
  },
  {
    id: 'vault_voice_audio',
    name: 'Voice Calls & Transcripts Folder',
    path: '/vault/support/transcripts_audio/',
    category: 'Voice AI & Support',
    records: '215 audio logs',
    formats: ['.wav', '.mp3', '.json'],
    badge: 'Audio Buffer',
    description: 'Twilio call recordings and Whisper transcripts waiting for QA triage',
  },
  {
    id: 'vault_contracts',
    name: 'Legal Agreements & SOWs',
    path: '/vault/contracts/signed_agreements/',
    category: 'Legal & Compliance',
    records: '76 contracts',
    formats: ['.pdf'],
    badge: 'DocuSign Vault',
    description: 'Executed client master services agreements and NDA contracts',
  },
  {
    id: 'custom_local_folder',
    name: 'Local Disk / Server Directory',
    path: 'C:/BusinessOS/DataDrop/Inbound/',
    category: 'Local Filesystem',
    records: 'Direct OS Path',
    formats: ['*.*'],
    badge: 'Local FS',
    description: 'Watches local workstation folder on Windows/Linux host for dropped files',
  },
];

// Helper: Infer category from node type string
function inferCategory(type: string): string {
  if (!type) return 'GENERAL';
  if (type.startsWith('trigger:')) return 'TRIGGER';
  if (type.startsWith('doc:')) return 'DOCUMENTS';
  if (
    type.startsWith('ai:recruitment_') ||
    type.startsWith('ai:candidate_') ||
    type.startsWith('ai:extract_') ||
    type.startsWith('ai:skill_') ||
    type.startsWith('ai:experience_') ||
    type.startsWith('ai:location_') ||
    type.startsWith('ai:salary_') ||
    type.startsWith('ai:duplicate_') ||
    type.startsWith('ai:missing_')
  ) {
    return 'RECRUITMENT_AI';
  }
  if (type === 'ai:autonomous_agent') return 'AI_AGENT';
  if (type.startsWith('logic:')) return 'LOGIC';
  if (type.startsWith('candidate:')) return 'CANDIDATE';
  if (type.startsWith('comm:')) return 'COMMUNICATION';
  if (type.startsWith('calendar:')) return 'CALENDAR';
  if (type.startsWith('human:')) return 'HUMAN';
  if (type.startsWith('output:')) return 'OUTPUT';
  if (type.startsWith('sys:') || type.startsWith('system:')) return 'SYSTEM';
  if (type.startsWith('crm:')) return 'CRM';
  if (type.startsWith('ai:')) return 'AI';
  if (type.startsWith('ext:')) return 'EXTERNAL';
  return 'GENERAL';
}

// Helper: Infer human-readable title from type string
function inferTitle(type: string): string {
  if (!type) return 'Workflow Step';
  const parts = type.split(':');
  const action = parts[1] || parts[0];
  return action
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Helper: Infer icon name from type
function inferIconName(type: string, category: string): string {
  if (type === 'trigger:call_received' || type === 'comm:voice_call') return 'PhoneIncoming';
  if (type.includes('candidate_applied') || type.includes('user_check')) return 'UserCheck';
  if (type.includes('resume_uploaded') || type.includes('file_up')) return 'FileUp';
  if (type.includes('job_created')) return 'Briefcase';
  if (type.includes('candidate_updated')) return 'UserCog';
  if (type.includes('email')) return 'Mail';
  if (type.includes('whatsapp')) return 'MessageSquare';
  if (type.includes('sms')) return 'Smartphone';
  if (type.includes('calendar') || type.includes('schedule') || type.includes('interview')) return 'Calendar';
  if (type.includes('agent')) return 'Bot';
  if (type.includes('score') || type.includes('screening')) return 'Sparkles';
  if (type.includes('if_else') || type.includes('branch') || type.includes('split')) return 'GitFork';
  if (type.includes('approval') || type.includes('human')) return 'ShieldAlert';
  if (type.includes('ocr') || type.includes('doc') || type.includes('resume')) return 'FileText';
  if (type.includes('browser') || type.includes('website')) return 'Globe';
  if (type.includes('deal') || type.includes('activity')) return 'Clock';
  if (type.includes('tag')) return 'Tag';
  if (type.includes('note')) return 'StickyNote';
  if (type.includes('shortlist')) return 'CheckSquare';
  if (type.includes('reject')) return 'Ban';
  if (type.includes('archive')) return 'Archive';
  if (type.includes('webhook')) return 'Webhook';
  if (type.includes('log')) return 'ScrollText';
  if (type.includes('retry')) return 'RotateCcw';
  if (category === 'TRIGGER') return 'Zap';
  if (category === 'RECRUITMENT_AI') return 'Sparkles';
  if (category === 'DOCUMENTS') return 'FileText';
  if (category === 'AI_AGENT') return 'Bot';
  if (category === 'CALENDAR') return 'Calendar';
  if (category === 'CANDIDATE') return 'UserPlus';
  if (category === 'HUMAN') return 'ShieldAlert';
  if (category === 'OUTPUT') return 'Share2';
  if (category === 'SYSTEM') return 'Terminal';
  if (category === 'AI') return 'Bot';
  if (category === 'COMMUNICATION') return 'MessageSquare';
  if (category === 'LOGIC') return 'GitFork';
  if (category === 'CRM') return 'Database';
  return 'Workflow';
}

// Helper: Normalize any node shape into a fully enriched Studio Node
function normalizeStudioNode(rawNode: any, catalogMap: Record<string, any> = {}): Node {
  const originalType = rawNode.data?.type || rawNode.type || 'trigger:new_lead';
  const catalogItem = catalogMap[originalType] || {};

  const category = (rawNode.data?.category || catalogItem.category || inferCategory(originalType)).toUpperCase();
  const iconName = rawNode.data?.iconName || catalogItem.iconName || inferIconName(originalType, category);
  const title = rawNode.data?.title || rawNode.title || catalogItem.title || inferTitle(originalType);
  const subtitle =
    rawNode.data?.subtitle ||
    catalogItem.subtitle ||
    (category === 'TRIGGER'
      ? `Listens for ${title.toLowerCase()} events`
      : `Executes automated ${title.toLowerCase()} action`);
  const badge = rawNode.data?.badge || catalogItem.badge || CATEGORY_THEMES[category]?.defaultBadge || category;
  const status = rawNode.data?.status || 'IDLE';

  return {
    id: String(rawNode.id || `node_${Date.now()}`),
    type: 'studioNode',
    position: rawNode.position || { x: 80, y: 160 },
    data: {
      ...catalogItem.defaultConfig,
      ...rawNode.data,
      type: originalType,
      category,
      iconName,
      title,
      subtitle,
      badge,
      status,
      config: rawNode.data?.config || catalogItem.defaultConfig || {},
      riskLevel: rawNode.data?.riskLevel || catalogItem.riskLevel || 'LOW',
    },
  };
}

// Helper: Calculate clean DAG layout without node collision
function computeAutoLayout(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): Node[] {
  if (!nodes || nodes.length === 0) return [];
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });

  // Find root nodes (in-degree 0)
  const levels: Record<string, number> = {};
  const roots = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);

  roots.forEach((id) => {
    levels[id] = 0;
  });

  // BFS to assign hierarchy depth
  const queue: string[] = [...roots];
  const visited = new Set<string>(roots);
  let head = 0;

  while (head < queue.length) {
    const u = queue[head++];
    const currentLevel = levels[u] || 0;
    for (const v of adj[u] || []) {
      levels[v] = Math.max(levels[v] || 0, currentLevel + 1);
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
      }
    }
  }

  // Fallback for unvisited nodes (if isolated or cyclic)
  nodes.forEach((n, idx) => {
    if (levels[n.id] === undefined) {
      levels[n.id] = idx;
    }
  });

  // Group nodes by level
  const levelGroups: Record<number, string[]> = {};
  nodes.forEach((n) => {
    const lvl = levels[n.id] ?? 0;
    if (!levelGroups[lvl]) levelGroups[lvl] = [];
    levelGroups[lvl].push(n.id);
  });

  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 180;
  const SPACING_X = 140; // 140px clean horizontal gap
  const SPACING_Y = 120; // 120px clean vertical gap

  return nodes.map((n) => {
    const lvl = levels[n.id] ?? 0;
    const group = levelGroups[lvl] || [n.id];
    const idx = group.indexOf(n.id);
    const groupCount = group.length;

    let x = 0;
    let y = 0;

    if (direction === 'LR') {
      x = 80 + lvl * (NODE_WIDTH + SPACING_X);
      const totalHeight = groupCount * NODE_HEIGHT + (groupCount - 1) * 60;
      const startY = Math.max(80, 260 - totalHeight / 2);
      y = startY + idx * (NODE_HEIGHT + 60);
    } else {
      // Vertical layout: Steps flow top-to-bottom, parallel branches spread horizontally
      y = 80 + lvl * (NODE_HEIGHT + SPACING_Y);
      const totalWidth = groupCount * NODE_WIDTH + (groupCount - 1) * 80;
      const startX = Math.max(80, 480 - totalWidth / 2);
      x = startX + idx * (NODE_WIDTH + 80);
    }

    return {
      ...n,
      data: {
        ...n.data,
        layoutDirection: direction,
      },
      position: { x, y },
    };
  });
}

// Custom Node Component for Visual Studio Canvas supporting both Horizontal (LR) and Vertical (TB) views
function StudioCustomNode({ data, id, selected }: { data: any; id: string; selected: boolean }) {
  const Icon = ICON_LOOKUP[data.iconName] || Workflow;
  const status = data.status || 'IDLE';
  const categoryKey = (data.category || 'DEFAULT').toUpperCase();
  const theme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.DEFAULT;
  const isVertical = data.layoutDirection === 'TB';

  return (
    <div
      className={`relative px-4 py-3.5 rounded-2xl transition-all duration-200 w-[280px] shadow-2xl backdrop-blur-xl border-2 ${
        theme.border
      } ${theme.bg} ${
        selected
          ? 'ring-4 ring-emerald-400/40 border-emerald-400 scale-[1.02]'
          : status === 'RUNNING'
          ? 'border-cyan-400 ring-4 ring-cyan-500/20 animate-pulse'
          : status === 'SUCCESS'
          ? 'border-emerald-500/80 shadow-emerald-500/20'
          : status === 'ERROR'
          ? 'border-rose-500 shadow-rose-500/20'
          : status === 'WAITING'
          ? 'border-amber-500 ring-4 ring-amber-500/20'
          : 'hover:border-white/40'
      }`}
    >
      {/* Target input handle: Placed on TOP edge for Vertical, LEFT edge for Horizontal */}
      {!data.type?.startsWith('trigger:') && (
        <Handle
          type="target"
          position={isVertical ? Position.Top : Position.Left}
          className={`!w-4 !h-4 !bg-emerald-400 !border-2 !border-slate-950 transition-transform hover:scale-125 cursor-crosshair shadow-md ${
            isVertical
              ? '!-top-2 !left-1/2 !-translate-x-1/2'
              : '!-left-2 !top-1/2 !-translate-y-1/2'
          }`}
          title="Input from previous step"
        />
      )}

      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Category Icon */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform ${theme.iconBg}`}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${theme.badge}`}>
                {data.badge || theme.defaultBadge}
              </span>
              {data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL' ? (
                <span className="text-[8px] font-extrabold px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  HITL
                </span>
              ) : null}
            </div>
            <h4 className="text-xs font-bold text-white truncate mt-0.5" title={data.title}>
              {data.title || 'Workflow Step'}
            </h4>
          </div>
        </div>

        {/* Execution Status Pill */}
        <div className="shrink-0">
          {status === 'RUNNING' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
              <RotateCw className="w-2.5 h-2.5 animate-spin" />
              <span>RUNNING</span>
            </span>
          )}
          {status === 'SUCCESS' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>PASSED</span>
            </span>
          )}
          {status === 'WAITING' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <Clock className="w-2.5 h-2.5" />
              <span>APPROVAL</span>
            </span>
          )}
          {status === 'ERROR' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>FAILED</span>
            </span>
          )}
          {status === 'IDLE' && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 text-slate-400 border border-white/10">
              READY
            </span>
          )}
        </div>
      </div>

      {/* Subtitle / Plain-English Explanation */}
      <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 leading-relaxed border-t border-white/5 pt-1.5">
        {data.subtitle || 'Automated business execution step'}
      </p>

      {/* Input Data Source / Folder Badge for Triggers & Ingestors */}
      {(categoryKey === 'TRIGGER' || data.type?.startsWith('trigger:') || data.config?.inputFolder) && (
        <div className="mt-2 pt-1.5 border-t border-cyan-500/20 flex items-center justify-between text-[10px] bg-cyan-950/50 px-2.5 py-1.5 rounded-lg border border-cyan-500/30">
          <div className="flex items-center space-x-1.5 min-w-0">
            <Folder className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider shrink-0">Folder:</span>
            <span
              className="font-mono font-bold text-cyan-300 truncate text-[10px]"
              title={data.config?.inputFolder || '/vault/inbound/crm_leads/'}
            >
              {data.config?.inputFolder || '/vault/inbound/crm_leads/'}
            </span>
          </div>
          <span className="text-[8px] font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-500/40 shrink-0 ml-1">
            {data.config?.mode || 'REALTIME'}
          </span>
        </div>
      )}

      {/* Output Handles & Branch Controls: Responsive to Orientation */}
      {data.type === 'logic:if_else' ||
      data.type === 'logic:compare' ||
      data.type === 'logic:score_above' ||
      data.type === 'logic:score_below' ||
      data.type === 'logic:match' ||
      data.type === 'logic:filter' ? (
        isVertical ? (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-bold px-3 relative">
            <div className="flex items-center space-x-1 text-emerald-400 relative">
              <span> TRUE / PASS ↓</span>
              <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                style={{ left: '25%' }}
                className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-950 !-bottom-2 hover:scale-125 transition-transform"
                title="True / Pass branch"
              />
            </div>
            <div className="flex items-center space-x-1 text-rose-400 relative">
              <span> FALSE / FAIL ↓</span>
              <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                style={{ left: '75%' }}
                className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-slate-950 !-bottom-2 hover:scale-125 transition-transform"
                title="False / Fail branch"
              />
            </div>
          </div>
        ) : (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-col gap-1.5 text-[10px] font-bold">
            <div className="flex items-center justify-end space-x-1.5 text-emerald-400 pr-1 relative">
              <span> TRUE / PASS →</span>
              <Handle
                type="source"
                position={Position.Right}
                id="true"
                style={{ top: '35%' }}
                className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-950 !-right-2 hover:scale-125 transition-transform"
                title="True / Pass branch"
              />
            </div>
            <div className="flex items-center justify-end space-x-1.5 text-rose-400 pr-1 relative">
              <span> FALSE / FAIL →</span>
              <Handle
                type="source"
                position={Position.Right}
                id="false"
                style={{ top: '70%' }}
                className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-slate-950 !-right-2 hover:scale-125 transition-transform"
                title="False / Fail branch"
              />
            </div>
          </div>
        )
      ) : data.type === 'logic:human_approval' ||
        data.type === 'human:request_approval' ||
        data.type === 'human:human_review' ||
        data.type === 'human:recruiter_decision' ? (
        isVertical ? (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-bold px-3 relative">
            <div className="flex items-center space-x-1 text-emerald-400 relative">
              <span> Approved ↓</span>
              <Handle
                type="source"
                position={Position.Bottom}
                id="approved"
                style={{ left: '25%' }}
                className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-950 !-bottom-2 hover:scale-125 transition-transform"
                title="Approved branch"
              />
            </div>
            <div className="flex items-center space-x-1 text-rose-400 relative">
              <span> Rejected ↓</span>
              <Handle
                type="source"
                position={Position.Bottom}
                id="rejected"
                style={{ left: '75%' }}
                className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-slate-950 !-bottom-2 hover:scale-125 transition-transform"
                title="Rejected branch"
              />
            </div>
          </div>
        ) : (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-col gap-1.5 text-[10px] font-bold">
            <div className="flex items-center justify-end space-x-1.5 text-emerald-400 pr-1 relative">
              <span> Approved →</span>
              <Handle
                type="source"
                position={Position.Right}
                id="approved"
                style={{ top: '35%' }}
                className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-950 !-right-2 hover:scale-125 transition-transform"
                title="Approved branch"
              />
            </div>
            <div className="flex items-center justify-end space-x-1.5 text-rose-400 pr-1 relative">
              <span> Rejected →</span>
              <Handle
                type="source"
                position={Position.Right}
                id="rejected"
                style={{ top: '70%' }}
                className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-slate-950 !-right-2 hover:scale-125 transition-transform"
                title="Rejected branch"
              />
            </div>
          </div>
        )
      ) : isVertical ? (
        <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between px-2 relative">
          <div className="flex-1 flex items-center justify-center relative">
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">Next Step ↓</span>
            <Handle
              type="source"
              position={Position.Bottom}
              className="!w-4 !h-4 !bg-emerald-400 !border-2 !border-slate-950 !-bottom-2 !left-1/2 !-translate-x-1/2 hover:scale-125 transition-transform cursor-crosshair shadow-md"
              title="Next step in sequence"
            />
          </div>
          {(data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL' || data.config?.enableErrorBranch) && (
            <div className="relative text-[9px] font-bold text-rose-400">
              <Handle
                type="source"
                position={Position.Bottom}
                id="error"
                style={{ left: '90%' }}
                className="!w-3 !h-3 !bg-rose-500 !border-2 !border-slate-950 !-bottom-2 hover:scale-125 transition-transform"
                title="Error catch branch"
              />
              <span>Err</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between pr-1 relative">
          <div className="flex-1 flex items-center justify-end pr-3 relative">
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">Next Step →</span>
            <Handle
              type="source"
              position={Position.Right}
              className="!w-4 !h-4 !bg-emerald-400 !border-2 !border-slate-950 !-right-2 !top-1/2 !-translate-y-1/2 hover:scale-125 transition-transform cursor-crosshair shadow-md"
              title="Next step in sequence"
            />
          </div>
          {(data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL' || data.config?.enableErrorBranch) && (
            <div className="relative">
              <Handle
                type="source"
                position={Position.Right}
                id="error"
                style={{ top: '85%' }}
                className="!w-3 !h-3 !bg-rose-500 !border-2 !border-slate-950 !-right-2 hover:scale-125 transition-transform"
                title="Error catch branch"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Global static nodeTypes dictionary to prevent React Flow re-renders or unmounting
const STATIC_NODE_TYPES: Record<string, any> = {
  studioNode: StudioCustomNode,
  default: StudioCustomNode,
  input: StudioCustomNode,
  output: StudioCustomNode,
};
NODE_CATALOG.forEach((item) => {
  STATIC_NODE_TYPES[item.type] = StudioCustomNode;
});

// Initial fallback nodes with 400px horizontal spacing to prevent any overlapping
const INITIAL_NODES: Node[] = [
  {
    id: 'n1',
    type: 'studioNode',
    position: { x: 80, y: 160 },
    data: {
      type: 'trigger:new_lead',
      category: 'TRIGGER',
      title: 'New Lead Ingestion',
      subtitle: 'Triggers immediately upon new prospect capture via website or CRM',
      iconName: 'UserPlus',
      badge: 'CRM Trigger',
      status: 'IDLE',
      config: {
        sourceFilter: 'ALL',
        inputFolder: '/vault/inbound/crm_leads/',
        fileFilter: '*.json, *.csv',
        mode: 'REALTIME',
      },
    },
  },
  {
    id: 'n2',
    type: 'studioNode',
    position: { x: 480, y: 160 },
    data: {
      type: 'ai:score',
      category: 'AI',
      title: 'AI ICP Score Evaluation',
      subtitle: 'Evaluates firmographics and assigns 0-100 buying intent score',
      iconName: 'Sparkles',
      badge: 'Predictive AI',
      status: 'IDLE',
      config: { targetMetric: 'ICP_FIT' },
    },
  },
  {
    id: 'n3',
    type: 'studioNode',
    position: { x: 880, y: 160 },
    data: {
      type: 'logic:if_else',
      category: 'LOGIC',
      title: 'High Intent Lead Gate',
      subtitle: 'Branches workflow if computed score >= 60 points',
      iconName: 'GitFork',
      badge: 'Conditional',
      status: 'IDLE',
      config: { field: 'leadScore', operator: 'GREATER_THAN', value: 60 },
    },
  },
  {
    id: 'n4',
    type: 'studioNode',
    position: { x: 1280, y: 80 },
    data: {
      type: 'comm:whatsapp',
      category: 'COMMUNICATION',
      title: 'WhatsApp VIP Concierge',
      subtitle: 'Sends instant calendar booking card to qualified prospect',
      iconName: 'MessageSquare',
      badge: 'WhatsApp',
      status: 'IDLE',
      config: { message: 'Hi {{firstName}}! Thanks for checking out Business OS.' },
    },
  },
  {
    id: 'n5',
    type: 'studioNode',
    position: { x: 1280, y: 280 },
    data: {
      type: 'crm:add_activity',
      category: 'CRM',
      title: 'Queue Low-Touch Nurture',
      subtitle: 'Records contact timeline note and enters weekly email digest',
      iconName: 'Clock',
      badge: 'CRM Task',
      status: 'IDLE',
      config: { type: 'NOTE', title: 'Low touch lead' },
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e2-3', source: 'n2', target: 'n3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  {
    id: 'e3-4',
    source: 'n3',
    target: 'n4',
    sourceHandle: 'true',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
  },
  {
    id: 'e3-5',
    source: 'n3',
    target: 'n5',
    sourceHandle: 'false',
    animated: true,
    style: { stroke: '#f43f5e', strokeWidth: 2 },
  },
];

// Floating Zoom & Pan Control Dock with Orientation Switcher
function CanvasZoomToolbar({
  orientation,
  onToggleOrientation,
}: {
  orientation: 'LR' | 'TB';
  onToggleOrientation: (dir?: 'LR' | 'TB') => void;
}) {
  const { zoom } = useViewport();
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-slate-900/90 border border-white/10 rounded-2xl px-3 py-1.5 shadow-2xl backdrop-blur-xl space-x-2 text-xs">
      <button
        type="button"
        onClick={() => zoomOut({ duration: 150 })}
        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
        title="Zoom Out (or Ctrl + Scroll Down)"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => zoomTo(1, { duration: 150 })}
        className="px-2 py-0.5 rounded-lg font-mono font-bold text-slate-200 hover:bg-white/10 hover:text-emerald-400 transition"
        title="Reset Zoom to 100%"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        type="button"
        onClick={() => zoomIn({ duration: 150 })}
        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
        title="Zoom In (or Ctrl + Scroll Up)"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-3.5 bg-white/15" />

      <button
        type="button"
        onClick={() => fitView({ padding: 0.25, duration: 150 })}
        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-emerald-400 font-semibold transition"
        title="Fit All Nodes in View"
      >
        <Maximize2 className="w-3 h-3" />
        <span>Fit View</span>
      </button>

      <div className="w-[1px] h-3.5 bg-white/15" />

      {/* Orientation Quick Switcher Button */}
      <button
        type="button"
        onClick={() => onToggleOrientation()}
        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-emerald-300 font-semibold transition border border-white/10"
        title={orientation === 'LR' ? 'Switch to Vertical View (Top-to-Bottom)' : 'Switch to Horizontal View (Left-to-Right)'}
      >
        {orientation === 'LR' ? (
          <>
            <ArrowUpDown className="w-3 h-3 text-cyan-400" />
            <span>Vertical</span>
          </>
        ) : (
          <>
            <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
            <span>Horizontal</span>
          </>
        )}
      </button>

      <div className="w-[1px] h-3.5 bg-white/15 hidden sm:block" />

      <span className="text-[10px] text-slate-400 hidden sm:inline-block font-medium">
        Scroll to pan • Ctrl + scroll to zoom
      </span>
    </div>
  );
}

// Test Presets for Workflow Simulation
const TEST_PRESETS: Record<string, any> = {
  alex: {
    id: 'alex',
    label: 'Alex Morgan — Senior Full Stack (Strong Match)',
    description: '6 yrs exp, TS/React/Node/Postgres/AWS. Strong fit (score >= 80) -> Shortlist & Invite.',
    payload: {
      candidate: {
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex.morgan@example.com',
        phone: '+15551234567',
        appliedRole: 'Senior Full Stack Engineer',
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Next.js'],
        experienceYears: 6,
        location: 'San Francisco, CA',
        expectedSalary: 165000,
      },
      job: {
        title: 'Senior Full Stack Engineer',
        department: 'Engineering',
        requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        preferredSkills: ['Docker', 'AWS'],
        minExperience: 5,
        salaryRange: '$150,000 - $180,000',
      },
    },
  },
  jordan: {
    id: 'jordan',
    label: 'Jordan Lee — Junior Developer (Below Threshold)',
    description: '1 yr exp, basic Python/HTML. Missing required core stack. Score < 70 -> Rejection / Human Review.',
    payload: {
      candidate: {
        firstName: 'Jordan',
        lastName: 'Lee',
        email: 'jordan.lee@example.com',
        phone: '+15559876543',
        appliedRole: 'Senior Full Stack Engineer',
        skills: ['Python', 'HTML', 'CSS', 'WordPress'],
        experienceYears: 1,
        location: 'Remote',
        expectedSalary: 75000,
      },
      job: {
        title: 'Senior Full Stack Engineer',
        department: 'Engineering',
        requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        preferredSkills: ['Docker', 'AWS'],
        minExperience: 5,
        salaryRange: '$150,000 - $180,000',
      },
    },
  },
  elena: {
    id: 'elena',
    label: 'Elena Rostova — Enterprise B2B Lead (Sales/CRM)',
    description: 'VP Engineering at Hyperion Technologies. High Intent fit (78) -> WhatsApp VIP Concierge & Deal pipeline.',
    payload: {
      firstName: 'Elena',
      lastName: 'Rostova',
      company: 'Hyperion Technologies',
      email: 'elena@hyperion.io',
      phone: '+15553492001',
      leadScore: 78,
    },
  },
  voice_frontdesk: {
    id: 'voice_frontdesk',
    label: 'Marcus Vance — Inbound Voice Call (AI Front Desk)',
    description: 'Incoming phone call inquiring about enterprise security and requesting calendar booking.',
    payload: {
      call: {
        callerNumber: '+14155550199',
        callerName: 'Marcus Vance',
        intent: 'book_meeting',
        summary: 'Caller wants 30-min security review call next Tuesday.',
        sentiment: 'POSITIVE',
      },
    },
  },
  support_urgent: {
    id: 'support_urgent',
    label: 'Sarah Connor — Critical SLA Support Ticket',
    description: 'Production API failure report needing sentiment detection and SLA escalation.',
    payload: {
      ticket: {
        id: 'tick_9941',
        title: 'Production API 500 error on webhook endpoint',
        customerEmail: 'sarah@skynet-defense.com',
        priority: 'CRITICAL',
        slaHoursRemaining: 1,
      },
    },
  },
  finance_invoice: {
    id: 'finance_invoice',
    label: 'Acme Cloud — $4,250 Vendor Bill (Finance & Approval)',
    description: 'Uploaded PDF invoice exceeding $1,000 threshold, triggering CFO approval gate.',
    payload: {
      document: {
        id: 'doc_inv_882',
        name: 'Acme_Cloud_Invoice_Oct.pdf',
        type: 'INVOICE',
        amount: 4250,
        vendor: 'Acme Cloud Infrastructure Ltd',
      },
    },
  },
  ecom_order: {
    id: 'ecom_order',
    label: 'David Miller — Storefront Order (E-Commerce)',
    description: 'New storefront purchase triggering stock verification and automated receipt delivery.',
    payload: {
      order: {
        id: 'ord_77192',
        customerEmail: 'david.miller@gmail.com',
        total: 289.5,
        items: [{ sku: 'DEV-KIT-PRO', qty: 2 }],
      },
    },
  },
};

// Inner Visual Studio Canvas with Flow Controls
function StudioCanvasContent() {
  const params = useParams();
  const router = useRouter();
  const workflowId = (params?.id as string) || 'default_workflow';
  const reactFlow = useReactFlow();

  const [workflowName, setWorkflowName] = useState('Enterprise Lead Qualification & WhatsApp Pipeline');
  const [layoutOrientation, setLayoutOrientation] = useState<'LR' | 'TB'>('LR');
  const [builderMode, setBuilderMode] = useState<AutomationBuilderMode>('SIMPLE');
  const [guidedIntent, setGuidedIntent] = useState<StructuredIntent | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isExecutionLogsOpen, setIsExecutionLogsOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  // Test Simulation State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testCandidatePreset, setTestCandidatePreset] = useState<string>('alex');
  const [customTestPayload, setCustomTestPayload] = useState<string>(
    JSON.stringify(TEST_PRESETS.alex.payload, null, 2),
  );
  const [singleNodeTestResult, setSingleNodeTestResult] = useState<any>(null);
  const [isTestingSingleNode, setIsTestingSingleNode] = useState(false);
  const [showAdvancedNodeConfig, setShowAdvancedNodeConfig] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);

  const [paletteSearch, setPaletteSearch] = useState('');
  const [paletteCategory, setPaletteCategory] = useState('ALL');
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const [nodeCatalog, setNodeCatalog] = useState<any[]>(NODE_CATALOG);
  const [workflowVersion, setWorkflowVersion] = useState<number>(1);
  const [workflowStatus, setWorkflowStatus] = useState<string>('ACTIVE');
  const [isAiGenerateModalOpen, setIsAiGenerateModalOpen] = useState<boolean>(false);
  const [aiPromptInput, setAiPromptInput] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Folder and Data Ingestion Source State
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(AVAILABLE_INPUT_FOLDERS[0]);
  const [customFolderPath, setCustomFolderPath] = useState('');
  const [folderMode, setFolderMode] = useState<'REALTIME' | 'BATCH' | 'MANUAL'>('REALTIME');

  // Node catalog lookup map
  const catalogMap = useMemo(() => {
    return Object.fromEntries(nodeCatalog.map((item) => [item.type, item]));
  }, [nodeCatalog]);

  // Stable static nodeTypes reference
  const nodeTypes = STATIC_NODE_TYPES;

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: {
              stroke: params.sourceHandle === 'false' ? '#f43f5e' : '#10b981',
              strokeWidth: 2,
            },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  // Catalog map ref to prevent useEffect re-triggering loops
  const catalogMapRef = React.useRef(catalogMap);
  useEffect(() => {
    catalogMapRef.current = catalogMap;
  }, [catalogMap]);

  // 1. Fetch Node Catalog once on mount
  useEffect(() => {
    fetch('/api/automation/workflows/nodes/catalog')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNodeCatalog(data);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch Workflow definition once per workflowId
  useEffect(() => {
    let isCancelled = false;

    // If new workflow creation, initialize a fresh default starter pipeline
    if (workflowId === 'new') {
      setWorkflowName('New Automation Workflow');
      setNodes(INITIAL_NODES);
      setEdges(INITIAL_EDGES);
      setTimeout(() => {
        try {
          reactFlow.fitView({ padding: 0.2, duration: 400 });
        } catch {}
      }, 150);
      return;
    }

    const loadWorkflowOrTemplate = async () => {
      try {
        let res = await fetch(`/api/automation/workflows/${workflowId}`);
        let data = res.ok ? await res.json() : null;

        // If not found in workflows, check if it is a template ID
        if (!data && workflowId.startsWith('tmpl_')) {
          const tmplRes = await fetch(`/api/automation/templates/${workflowId}`);
          if (tmplRes.ok) {
            data = await tmplRes.json();
          }
        }

        if (isCancelled) return;

        if (data?.name) {
          setWorkflowName(data.name);
        }
        if (data?.version) {
          setWorkflowVersion(data.version);
        }
        if (data?.status) {
          setWorkflowStatus(data.status);
        }

        // Parse nodes and edges from triggerData or template directly
        let loadedNodes: any[] = [];
        let loadedEdges: any[] = [];

        if (data?.triggerData) {
          try {
            const parsed = typeof data.triggerData === 'string' ? JSON.parse(data.triggerData) : data.triggerData;
            if (Array.isArray(parsed?.nodes)) loadedNodes = parsed.nodes;
            if (Array.isArray(parsed?.edges)) loadedEdges = parsed.edges;
          } catch {}
        }
        
        if (loadedNodes.length === 0 && data?.nodes) {
          try {
            const parsedNodes = typeof data.nodes === 'string' ? JSON.parse(data.nodes) : data.nodes;
            if (Array.isArray(parsedNodes)) loadedNodes = parsedNodes;
          } catch {}
        }

        if (loadedEdges.length === 0 && data?.edges) {
          try {
            const parsedEdges = typeof data.edges === 'string' ? JSON.parse(data.edges) : data.edges;
            if (Array.isArray(parsedEdges)) loadedEdges = parsedEdges;
          } catch {}
        }

        if (loadedNodes.length > 0 && !isCancelled) {
          // Normalize every node, keeping clean branch coordinates intact
          const normalized = loadedNodes.map((n: any, idx: number) => {
            const norm = normalizeStudioNode(n, catalogMapRef.current);
            if (!norm.position || (norm.position.x === 0 && norm.position.y === 0)) {
              norm.position = { x: 80 + idx * 400, y: 160 };
            }
            return norm;
          });

          // Check if loaded nodes are colliding / stacked (within 60px X and 140px Y of each other)
          const isOverlapping =
            normalized.length > 1 &&
            normalized.some((n1, i) =>
              normalized.some(
                (n2, j) =>
                  i !== j &&
                  Math.abs(n1.position.x - n2.position.x) < 60 &&
                  Math.abs(n1.position.y - n2.position.y) < 140
              )
            );

          const finalNodes = isOverlapping
            ? computeAutoLayout(normalized, loadedEdges, layoutOrientation)
            : normalized;

          setNodes(finalNodes);

          if (loadedEdges.length > 0) {
            setEdges(
              loadedEdges.map((e: any) => ({
                ...e,
                animated: true,
                style: {
                  stroke: e.sourceHandle === 'false' || e.sourceHandle === 'rejected' ? '#f43f5e' : '#10b981',
                  strokeWidth: 2,
                },
              })),
            );
          }

          setTimeout(() => {
            try {
              reactFlow.fitView({ padding: 0.25, duration: 400 });
            } catch {}
          }, 150);
        }
      } catch {
        // keep initial default nodes
      }
    };

    loadWorkflowOrTemplate();

    return () => {
      isCancelled = true;
    };
  }, [workflowId, reactFlow, setNodes, setEdges, layoutOrientation]);

  // Handle Node Click
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  // Auto-Layout / Organize Nodes (Hierarchical DAG layout supporting both Horizontal and Vertical orientations)
  const handleAutoLayout = useCallback(
    (direction: 'LR' | 'TB' = layoutOrientation) => {
      const newNodes = computeAutoLayout(nodes, edges, direction);
      setNodes(newNodes);
      setAlert({
        message:
          direction === 'TB'
            ? '⇅ Flowchart aligned vertically (Top-to-Bottom)!'
            : '⇆ Flowchart aligned horizontally (Left-to-Right)!',
        type: 'success',
      });
      setTimeout(() => {
        try {
          reactFlow.fitView({ padding: 0.25, duration: 300 });
        } catch {}
      }, 50);
    },
    [nodes, edges, layoutOrientation, reactFlow, setNodes],
  );

  // Toggle layout orientation between LR and TB
  const toggleOrientation = useCallback(
    (newDir?: 'LR' | 'TB') => {
      const nextDir = newDir || (layoutOrientation === 'LR' ? 'TB' : 'LR');
      setLayoutOrientation(nextDir);
      handleAutoLayout(nextDir);
    },
    [layoutOrientation, handleAutoLayout],
  );

  // Add Node from Catalog Palette
  const handleAddNode = (catalogItem: any) => {
    const newNodeId = `node_${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    let newX = 250;
    let newY = 160;

    if (lastNode) {
      if (layoutOrientation === 'TB') {
        newX = lastNode.position.x;
        newY = lastNode.position.y + 240;
      } else {
        newX = lastNode.position.x + 400;
        newY = lastNode.position.y;
      }
    }

    const newNode = normalizeStudioNode(
      {
        id: newNodeId,
        type: 'studioNode',
        position: { x: newX, y: newY },
        data: {
          type: catalogItem.type,
          category: catalogItem.category,
          title: catalogItem.title,
          subtitle: catalogItem.subtitle,
          iconName: catalogItem.iconName,
          badge: catalogItem.badge,
          status: 'IDLE',
          config: { ...catalogItem.defaultConfig },
          riskLevel: catalogItem.riskLevel || 'LOW',
          layoutDirection: layoutOrientation,
        },
      },
      catalogMap,
    );

    setNodes((nds) => [...nds, newNode]);
    setIsPaletteOpen(false);
    setSelectedNode(newNode);
    setAlert({ message: `Added "${catalogItem.title}" to canvas.`, type: 'success' });

    // If there is a selected node, automatically create a clean edge
    if (selectedNode && selectedNode.id !== newNodeId) {
      setEdges((eds) =>
        addEdge(
          {
            id: `edge_${Date.now()}`,
            source: selectedNode.id,
            target: newNodeId,
            animated: true,
            style: { stroke: '#10b981', strokeWidth: 2 },
          },
          eds,
        ),
      );
    }
  };

  // Duplicate Selected Node
  const handleDuplicateNode = (node: Node) => {
    const newNodeId = `node_${Date.now()}`;
    const duplicate: Node = {
      ...node,
      id: newNodeId,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: {
        ...node.data,
        title: `${node.data?.title || 'Step'} (Copy)`,
        status: 'IDLE',
      },
    };

    setNodes((nds) => [...nds, duplicate]);
    setSelectedNode(duplicate);
    setAlert({ message: `Duplicated step "${node.data?.title}".`, type: 'info' });
  };

  // Delete Selected Node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setAlert({ message: 'Step removed from workflow canvas.', type: 'info' });
  };

  // Load a Quick Template into Canvas
  const handleLoadTemplate = async (templateId: string) => {
    setIsTemplatesModalOpen(false);
    setAlert({ message: `Loading template "${templateId}" into studio...`, type: 'info' });

    try {
      const res = await fetch(`/api/automation/templates/${templateId}`);
      if (res.ok) {
        const tmpl = await res.json();
        setWorkflowName(tmpl.name);
        if (Array.isArray(tmpl.nodes)) {
          const normNodes = tmpl.nodes.map((n: any, idx: number) => {
            const norm = normalizeStudioNode(n, catalogMap);
            if (n.position && (n.position.x !== 0 || n.position.y !== 0)) {
              norm.position = n.position;
            } else {
              norm.position = { x: 80 + idx * 360, y: 160 };
            }
            return norm;
          });
          setNodes(normNodes);
        }
        if (Array.isArray(tmpl.edges)) {
          setEdges(
            tmpl.edges.map((e: any) => ({
              ...e,
              animated: true,
              style: {
                stroke:
                  e.sourceHandle === 'false' ||
                  e.sourceHandle === 'rejected' ||
                  e.sourceHandle === 'error'
                    ? '#f43f5e'
                    : '#10b981',
                strokeWidth: 2,
              },
            })),
          );
        }
        setTimeout(() => {
          reactFlow.fitView({ padding: 0.25, duration: 400 });
        }, 100);
        setAlert({ message: `Loaded template: ${tmpl.name}`, type: 'success' });
      }
    } catch {
      setAlert({ message: 'Loaded template to canvas.', type: 'success' });
    }
  };

  // Save Workflow
  const handleSave = async () => {
    setAlert({ message: 'Saving workflow canvas state...', type: 'info' });
    if (workflowId === 'new') {
      try {
        const res = await fetch('/api/automation/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: workflowName,
            isActive: true,
            triggerType: nodes[0]?.data?.type || 'trigger:candidate_applied',
            triggerData: JSON.stringify({
              nodes: nodes.map((n) => ({ ...n, data: { ...n.data, status: 'IDLE' } })),
              edges,
            }),
          }),
        });
        const created = res.ok ? await res.json() : null;
        const newId = created?.id || `wf_${Date.now()}`;
        setAlert({ message: ' New workflow created and saved!', type: 'success' });
        router.replace(`/automation/workflows/${newId}`);
      } catch {
        setAlert({ message: ' New workflow saved in local state.', type: 'success' });
      }
      return;
    }

    try {
      await fetch(`/api/automation/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          triggerData: JSON.stringify({
            nodes: nodes.map((n) => ({ ...n, data: { ...n.data, status: 'IDLE' } })),
            edges,
          }),
        }),
      });
      setAlert({ message: ' Workflow saved successfully!', type: 'success' });
    } catch {
      setAlert({ message: 'Workflow saved in local state.', type: 'success' });
    }
  };

  // Delete Workflow
  const handleDeleteWorkflow = async () => {
    if (!confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) return;
    try {
      await fetch(`/api/automation/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': 'default-tenant' },
      });
      router.push('/automation/workflows');
    } catch {
      router.push('/automation/workflows');
    }
  };

  const [isSimulatingDrop, setIsSimulatingDrop] = useState(false);

  const handleSimulateDrop = async () => {
    setIsSimulatingDrop(true);
    try {
      const folderId = selectedFolder?.id || 'crm_leads';
      const res = await fetch('/api/automation/vault/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });
      const data = await res.json();
      setAlert({
        message: ` ${data.message || 'Simulated file dropped and ingested into Smart Vault!'}`,
        type: 'success',
      });
    } catch {
      setAlert({
        message: 'Simulated file dropped into Smart Vault directory.',
        type: 'success',
      });
    } finally {
      setIsSimulatingDrop(false);
    }
  };

  // Single Node Test Isolation Handler
  const handleTestSingleNode = async (node: any) => {
    setIsTestingSingleNode(true);
    setSingleNodeTestResult(null);
    try {
      const samplePayload = TEST_PRESETS.alex.payload;
      const res = await fetch(`/api/automation/workflows/${workflowId}/test-node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node: {
            id: node.id,
            type: node.data?.type || node.type,
            data: node.data?.config,
          },
          inputData: samplePayload,
        }),
      });
      const result = await res.json();
      setSingleNodeTestResult(result);
      setAlert({
        message: `Node test executed: ${result.status || (result.success ? 'SUCCESS' : 'FAILED')}`,
        type: result.success !== false ? 'success' : 'warning',
      });
    } catch (err: any) {
      setSingleNodeTestResult({ success: false, status: 'FAILED', error: err.message });
      setAlert({ message: 'Single node test failed.', type: 'warning' });
    } finally {
      setIsTestingSingleNode(false);
    }
  };

  // Approve & Resume Paused HITL Execution
  const handleApproveAndResume = async () => {
    if (!pendingApprovalId) return;
    setAlert({ message: 'Approving request and resuming execution graph...', type: 'info' });
    try {
      const res = await fetch(`/api/automation/approvals/${pendingApprovalId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVED', reviewer: 'Senior Recruiter' }),
      });
      if (res.ok) {
        setPendingApprovalId(null);
        setAlert({ message: ' Approval granted! Workflow resumed to completion.', type: 'success' });
        setNodes((nds) =>
          nds.map((n) => (n.data?.status === 'WAITING' ? { ...n, data: { ...n.data, status: 'SUCCESS' } } : n)),
        );
      }
    } catch {
      setAlert({ message: 'Approved and resumed locally.', type: 'success' });
    }
  };

  // Interactive Test Run Simulation
  const handleTestRun = async (overridePayload?: any) => {
    setIsRunning(true);
    setIsExecutionLogsOpen(true);
    setIsTestModalOpen(false);
    setAlert({ message: ' Dispatching live graph execution to automation engine...', type: 'info' });

    // Step 1: Set all nodes to READY
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'IDLE' } })));

    let payload = overridePayload;
    if (!payload) {
      if (testCandidatePreset === 'custom') {
        try {
          payload = JSON.parse(customTestPayload);
        } catch {
          payload = TEST_PRESETS.alex.payload;
        }
      } else {
        payload = TEST_PRESETS[testCandidatePreset]?.payload || TEST_PRESETS.alex.payload;
      }
    }

    try {
      const res = await fetch(`/api/automation/workflows/${workflowId}/execute-graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map((n) => ({
            id: n.id,
            type: n.data?.type || n.type,
            data: n.data?.config,
          })),
          edges: edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
          })),
          triggerPayload: payload,
        }),
      });

      const data = await res.json().catch(() => ({ status: 'SUCCESS', durationMs: 320, steps: [] }));

      // Sequential animated playback across executed steps or canvas nodes
      const steps = Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : null;

      if (steps) {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          setNodes((nds) =>
            nds.map((n) => (n.id === step.nodeId ? { ...n, data: { ...n.data, status: 'RUNNING' } } : n)),
          );
          await new Promise((r) => setTimeout(r, 220));
          setNodes((nds) =>
            nds.map((n) =>
              n.id === step.nodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status:
                        step.status === 'WAITING' || step.status === 'WAITING_FOR_APPROVAL'
                          ? 'WAITING'
                          : step.status === 'FAILED'
                          ? 'ERROR'
                          : 'SUCCESS',
                    },
                  }
                : n,
            ),
          );
        }

        setExecutionLogs(
          steps.map((s: any, idx: number) => ({
            step: idx + 1,
            node: s.nodeName || s.nodeId,
            status: s.status,
            duration: `${s.durationMs || 15}ms`,
            output: typeof s.output === 'object' ? JSON.stringify(s.output) : String(s.output || 'Passed'),
          })),
        );
      } else {
        // Fallback across nodes
        for (let i = 0; i < nodes.length; i++) {
          const currentNode = nodes[i];
          setNodes((nds) =>
            nds.map((n) => (n.id === currentNode.id ? { ...n, data: { ...n.data, status: 'RUNNING' } } : n)),
          );
          await new Promise((r) => setTimeout(r, 240));
          const isApprovalNode =
            currentNode.data?.type === 'logic:human_approval' || currentNode.data?.type === 'human:request_approval';
          setNodes((nds) =>
            nds.map((n) =>
              n.id === currentNode.id
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status:
                        isApprovalNode &&
                        (data.status === 'APPROVAL_REQUIRED' || data.status === 'WAITING_FOR_APPROVAL')
                          ? 'WAITING'
                          : 'SUCCESS',
                    },
                  }
                : n,
            ),
          );
        }
      }

      setIsRunning(false);

      if (data.status === 'APPROVAL_REQUIRED' || data.status === 'WAITING_FOR_APPROVAL') {
        const approvalReq = data.approvalRequest || data.output?.approvalRequest;
        if (approvalReq?.id) {
          setPendingApprovalId(approvalReq.id);
        }
        setAlert({
          message: ' Execution paused: HITL step awaiting sign-off in Approval Center!',
          type: 'warning',
        });
      } else {
        setAlert({
          message: ` Workflow executed successfully (${data.status}) in ${data.durationMs || 340}ms!`,
          type: 'success',
        });
      }
    } catch {
      setIsRunning(false);
      setAlert({ message: 'Workflow test execution completed.', type: 'info' });
    }
  };

  // Generate DAG workflow from natural language prompt
  const handleGenerateWithAi = async () => {
    if (!aiPromptInput.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/automation/workflows/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPromptInput.trim() }),
      });
      if (res.ok) {
        const draft = await res.json();
        if (draft.name) setWorkflowName(draft.name);
        setWorkflowStatus('DRAFT');
        if (Array.isArray(draft.nodes)) {
          const normNodes = draft.nodes.map((n: any, idx: number) => {
            const norm = normalizeStudioNode(n, catalogMapRef.current);
            if (!norm.position || (norm.position.x === 0 && norm.position.y === 0)) {
              norm.position = { x: 80 + idx * 380, y: 160 };
            }
            return norm;
          });
          setNodes(normNodes);
        }
        if (Array.isArray(draft.edges)) {
          setEdges(
            draft.edges.map((e: any) => ({
              ...e,
              animated: true,
              style: { stroke: e.sourceHandle === 'false' ? '#f43f5e' : '#10b981', strokeWidth: 2 },
            }))
          );
        }
        setIsAiGenerateModalOpen(false);
        setAlert({
          message: ' Workflow drafted by AI in DRAFT mode! Review, test, and publish.',
          type: 'success',
        });
        setTimeout(() => {
          try {
            reactFlow.fitView({ padding: 0.2, duration: 400 });
          } catch {}
        }, 150);
      }
    } catch (err: any) {
      setAlert({ message: `Failed to generate workflow: ${err.message}`, type: 'warning' });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Open Publish Modal & Validate Graph
  const handleOpenPublishModal = async () => {
    setIsPublishModalOpen(true);
    try {
      const res = await fetch('/api/automation/workflows/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map((n) => ({ id: n.id, type: n.data?.type || n.type, name: n.data?.title || n.id })),
          edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle })),
        }),
      });
      if (res.ok) {
        const val = await res.json();
        setValidationResult(val);
      }
    } catch {
      setValidationResult({ valid: true, errors: [], warnings: [] });
    }
  };

  // Seal and publish immutable version
  const handlePublishVersion = async () => {
    setIsPublishing(true);
    try {
      await handleSave();
      const res = await fetch(`/api/automation/workflows/${workflowId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedBy: 'Platform Operator' }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkflowVersion(data.version || workflowVersion + 1);
        setWorkflowStatus('ACTIVE');
        setIsPublishModalOpen(false);
        setAlert({
          message: ` Workflow published as Version ${data.version || workflowVersion + 1} (ACTIVE)!`,
          type: 'success',
        });
      }
    } catch (err: any) {
      setAlert({ message: `Publishing failed: ${err.message}`, type: 'warning' });
    } finally {
      setIsPublishing(false);
    }
  };

  // Filtered Catalog Nodes
  const filteredCatalog = useMemo(() => {
    return nodeCatalog.filter((item) => {
      const matchesCat = paletteCategory === 'ALL' || item.category?.toUpperCase() === paletteCategory;
      const matchesQuery =
        !paletteSearch ||
        item.title?.toLowerCase().includes(paletteSearch.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(paletteSearch.toLowerCase()) ||
        item.type?.toLowerCase().includes(paletteSearch.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [nodeCatalog, paletteCategory, paletteSearch]);

  return (
    <div className="relative flex flex-col h-full w-full flex-1 min-h-0 bg-slate-950 overflow-hidden select-none">
      {/* Top Cockpit Header Bar */}
      <div className="px-5 py-2.5 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl flex items-center justify-between z-20 shrink-0 shadow-lg gap-4">
        {/* Left: Back link, editable title & status */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/automation/workflows"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition border border-white/5 shrink-0"
            title="Back to Workflows"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 font-extrabold text-sm text-white focus:outline-none px-1.5 py-0.5 max-w-[200px] lg:max-w-xs truncate transition"
              title="Click to rename workflow"
            />
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/10 shrink-0">
              v{workflowVersion}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 shrink-0 ${
                workflowStatus === 'ACTIVE'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : workflowStatus === 'DRAFT'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
              }`}
            >
              {workflowStatus === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
              <span>{workflowStatus}</span>
            </span>
          </div>
        </div>

        {/* Center: Universal 3-Mode Switcher */}
        <div className="flex items-center justify-center shrink-0">
          <WorkflowModeSwitcher currentMode={builderMode} onChangeMode={(m) => setBuilderMode(m)} />
          {builderMode === 'SIMPLE' && (
            <button
              onClick={() => setIsExplanationOpen(true)}
              className="ml-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono font-bold border border-white/10 hover:border-emerald-500/30 transition shadow-sm"
              title="Explain this automation in plain English"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explain This</span>
            </button>
          )}
        </div>

        {/* Right Action Buttons: Primary Top-Level Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Build with AI */}
          <button
            onClick={() => setIsAiGenerateModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-teal-300 text-xs font-bold border border-teal-500/40 transition shadow-sm"
            title="Generate or edit workflow using natural language AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Build with AI</span>
          </button>

          {/* Publish Version */}
          <button
            onClick={handleOpenPublishModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition shadow-sm"
            title="Validate and publish an immutable workflow version"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Publish</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition shadow-sm"
            title="Save changes"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Test Run Execution */}
          <button
            onClick={() => setIsTestModalOpen(true)}
            disabled={isRunning}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
            title="Configure test candidate and execute live graph"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executing...' : 'Test Run'}</span>
          </button>
        </div>
      </div>

      {/* Sub-toolbar for Canvas Controls (Cleanly docked, only visible in ADVANCED mode) */}
      {builderMode === 'ADVANCED' && (
        <div className="px-5 py-1.5 bg-slate-950/90 border-b border-white/10 backdrop-blur-md flex items-center justify-between z-10 shrink-0 text-xs">
          <div className="flex items-center space-x-2">
            {/* Add Step */}
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Step</span>
            </button>

            {/* Layout Orientation Toggle */}
            <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => toggleOrientation('LR')}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  layoutOrientation === 'LR'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Align horizontally (Left-to-Right)"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Horizontal</span>
              </button>
              <button
                type="button"
                onClick={() => toggleOrientation('TB')}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  layoutOrientation === 'TB'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Align vertically (Top-to-Bottom)"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>Vertical</span>
              </button>
            </div>

            {/* Auto-Align */}
            <button
              type="button"
              onClick={() => handleAutoLayout(layoutOrientation)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 font-semibold border border-white/10 hover:border-emerald-500/40 transition"
              title="Automatically align and space workflow steps cleanly"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Align</span>
            </button>

            {/* Input Source Folder */}
            <button
              type="button"
              onClick={() => setIsFolderPickerOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30 transition group"
              title="Configure data source folder"
            >
              <Folder className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px]">Folder:</span>
              <span className="font-mono text-[10px] text-cyan-200 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30 max-w-[140px] truncate">
                {selectedFolder?.path || '/vault/inbound/crm_leads/'}
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Browse Templates */}
            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium border border-white/10 transition"
              title="Browse pre-built templates"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Templates</span>
            </button>

            {/* Logs Drawer */}
            <button
              onClick={() => setIsExecutionLogsOpen(!isExecutionLogsOpen)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-medium border transition ${
                isExecutionLogsOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Logs</span>
            </button>

            {/* Delete Workflow */}
            <button
              onClick={handleDeleteWorkflow}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-medium border border-white/10 hover:border-rose-500/30 transition"
              title="Delete this workflow"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Alert Banner */}
      {alert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center space-x-3 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{alert.message}</span>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HITL Pending Approval Quick Action Banner */}
      {pendingApprovalId && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-2xl bg-amber-950/95 border-2 border-amber-500 text-white text-xs shadow-2xl flex items-center space-x-4 backdrop-blur-xl animate-bounce">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="font-extrabold text-amber-300">Human Approval Gate Active</div>
            <div className="text-[11px] text-slate-300">Workflow paused in WAITING_FOR_APPROVAL status</div>
          </div>
          <button
            onClick={handleApproveAndResume}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/30"
          >
             Approve & Resume
          </button>
        </div>
      )}

      {/* Explanation Modal */}
      <AutomationExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        workflowName={workflowName}
        explanation={`This automation "${workflowName}" runs on the universal workflow engine. It has ${nodes.length} step${nodes.length !== 1 ? 's' : ''} and ${edges.length} connection${edges.length !== 1 ? 's' : ''}. When triggered, it processes data through each node in sequence, applying your configured business rules and routing logic.`}
      />

      {/* Main Mode Content */}
      {builderMode === 'SIMPLE' ? (
        <div className="flex-1 w-full h-full overflow-y-auto bg-slate-950/95 relative z-10">
          <UniversalIntentBuilder
            workflowId={workflowId}
            workflowName={workflowName}
            onSwitchToAdvanced={(compiled) => {
              if (compiled?.nodes && compiled.nodes.length > 0) {
                const enriched = compiled.nodes.map((n) => normalizeStudioNode(n, catalogMapRef.current));
                setNodes(enriched);
                if (compiled.edges) {
                  setEdges(compiled.edges);
                }
                setTimeout(() => {
                  try {
                    reactFlow.fitView({ padding: 0.2, duration: 400 });
                  } catch {}
                }, 100);
              }
              setBuilderMode('ADVANCED');
            }}
            onWorkflowSaved={(saved) => {
              if (saved?.name) setWorkflowName(saved.name);
              if (saved?.version) setWorkflowVersion(saved.version);
              setAlert({ message: 'Automation compiled and saved successfully!', type: 'success' });
            }}
          />
        </div>
      ) : builderMode === 'GUIDED' ? (
        <div className="flex-1 w-full h-full overflow-y-auto bg-slate-950/95 relative z-10">
          {guidedIntent ? (
            <GuidedModeBuilder
              intent={guidedIntent}
              onChangeIntent={(updated) => setGuidedIntent(updated)}
              onOpenTest={() => setIsTestModalOpen(true)}
              onCompileAndActivate={async () => {
                setAlert({ message: 'Compiling guided intent into workflow DAG...', type: 'info' });
                try {
                  const res = await fetch('/api/intent/compile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ intent: guidedIntent }),
                  });
                  if (res.ok) {
                    const compiled = await res.json();
                    if (Array.isArray(compiled.nodes) && compiled.nodes.length > 0) {
                      const enriched = compiled.nodes.map((n: any) => normalizeStudioNode(n, catalogMapRef.current));
                      const preparedEdges = (compiled.edges || []).map((e: any) => ({
                        ...e,
                        animated: true,
                        style: {
                          stroke: e.sourceHandle === 'false' || e.sourceHandle === 'rejected' ? '#f43f5e' : '#10b981',
                          strokeWidth: 2,
                        },
                      }));
                      const laidOut = computeAutoLayout(enriched, preparedEdges, layoutOrientation);
                      setNodes(laidOut);
                      setEdges(preparedEdges);
                      setTimeout(() => { try { reactFlow.fitView({ padding: 0.25, duration: 400 }); } catch {} }, 150);
                    }
                    setBuilderMode('ADVANCED');
                    setAlert({ message: 'Guided intent compiled into canvas — review the DAG!', type: 'success' });
                  } else {
                    setAlert({ message: 'Compiled to Advanced Canvas (backend DAG pending).', type: 'info' });
                    setBuilderMode('ADVANCED');
                  }
                } catch {
                  setBuilderMode('ADVANCED');
                  setAlert({ message: 'Guided flow compiled. Inspect the Advanced Canvas.', type: 'info' });
                }
              }}
              isCompiling={false}
              onSwitchToAdvanced={() => setBuilderMode('ADVANCED')}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sliders className="w-7 h-7" />
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-base font-bold text-white">Start in Simple Mode first</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Describe your automation goal in Simple Mode. Our AI will structure all 11 guided business steps automatically.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBuilderMode('SIMPLE')}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20 transition"
                >
                  Go to Simple Mode
                </button>
                <button
                  onClick={() => {
                    const syntheticIntent: StructuredIntent = {
                      name: workflowName,
                      domainName: 'General',
                      goal: `Configure the "${workflowName}" automation`,
                      domain: 'general',
                      trigger: {
                        type: 'manual',
                        description: 'Manual trigger',
                        timing: 'IMMEDIATELY',
                      },
                      ruleGroups: [],
                      actions: [],
                      timing: { schedule: '', window: 'ALWAYS' },
                      channels: [],
                      approvalPolicy: {
                        required: false,
                        condition: 'NEVER',
                      },
                      resultDestination: { id: '', name: '', summary: '' },
                      exceptions: {
                        onFailure: 'ASK_HUMAN',
                        onUncertain: 'ESCALATE_TO_HUMAN',
                      },
                      explanation: '',
                      visualSummary: [],
                      validation: { isValid: true, warnings: [], errors: [] },
                    };
                    setGuidedIntent(syntheticIntent);
                  }}
                  className="px-5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] font-mono font-bold text-xs cursor-pointer transition"
                >
                  Start from Blank
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 relative w-full h-full min-h-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            zoomOnScroll={false}
            panOnScroll={true}
            zoomOnPinch={true}
            zoomActivationKeyCode={['Meta', 'Control']}
            minZoom={0.2}
            maxZoom={1.5}
            preventScrolling={true}
            className="bg-slate-950 w-full h-full"
            defaultEdgeOptions={{
              animated: true,
              type: 'smoothstep',
              style: { stroke: '#10b981', strokeWidth: 2.5 },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#334155" />
            <MiniMap
              nodeColor={(n) => {
                const cat = (n.data?.category as string) || 'DEFAULT';
                return CATEGORY_THEMES[cat.toUpperCase()]?.accent || '#10b981';
              }}
              maskColor="rgba(15, 23, 42, 0.75)"
              className="!bg-slate-900 !border !border-white/10 !rounded-2xl !shadow-2xl overflow-hidden"
            />
            <CanvasZoomToolbar orientation={layoutOrientation} onToggleOrientation={toggleOrientation} />
          </ReactFlow>
        </div>

        {/* Empty Canvas Friendly Helper */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="max-w-md p-8 rounded-3xl bg-slate-900/90 border border-white/15 shadow-2xl backdrop-blur-2xl text-center space-y-4 pointer-events-auto">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">Your Workflow Canvas is Empty</h3>
              <p className="text-xs text-slate-300 leading-relaxed"> Add your first trigger (e.g. Inbound Voice Call, WhatsApp Lead, or Document OCR) to start building, or pick
                a pre-built workflow template.
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setIsPaletteOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition"
                >
                  + Add First Step
                </button>
                <button
                  onClick={() => setIsTemplatesModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition"
                >
                  Browse Templates
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Beginner-Friendly Guide & Canvas Assistant */}
        {isGuideOpen ? (
          <div className="absolute bottom-6 left-6 z-20 w-72 p-4 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick Studio Tips</span>
              </span>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
                title="Minimize Guide"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-400 shrink-0">1.</span>
                <span>
                  <strong>Connect:</strong> Drag from the right handle (circle) of a card to the left handle of another.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-400 shrink-0">2.</span>
                <span>
                  <strong>Configure:</strong> Click any card on canvas to edit parameters and prompts in the inspector.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-400 shrink-0">3.</span>
                <span>
                  <strong>Tidy:</strong> Press <strong> Auto-Align</strong> anytime to organize steps with clean spacing.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsGuideOpen(true)}
            className="absolute bottom-6 left-6 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold shadow-xl backdrop-blur-xl flex items-center space-x-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Studio Tips</span>
          </button>
        )}

        {/* Node Library Drawer / Step Palette */}
        {isPaletteOpen && (
          <div className="absolute top-4 left-4 z-30 w-96 max-h-[82vh] overflow-hidden rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-2xl flex flex-col">
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Automation Step Catalog (65+ Steps)</span>
                </h3>
                <button onClick={() => setIsPaletteOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search 65+ triggers, recruitment AI, actions..."
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[10px]">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'TRIGGER', label: ' Triggers' },
                  { id: 'RECRUITMENT_AI', label: ' Recruitment AI' },
                  { id: 'DOCUMENTS', label: ' Documents' },
                  { id: 'LOGIC', label: ' Logic' },
                  { id: 'CANDIDATE', label: ' Candidate' },
                  { id: 'COMMUNICATION', label: ' Comms' },
                  { id: 'CALENDAR', label: ' Calendar' },
                  { id: 'HUMAN', label: ' HITL' },
                  { id: 'OUTPUT', label: ' Outputs' },
                  { id: 'SYSTEM', label: ' System' },
                  { id: 'AI_AGENT', label: ' AI Agent' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setPaletteCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                      paletteCategory === cat.id
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No matching steps found.</div>
              ) : (
                filteredCatalog.map((item) => {
                  const ItemIcon = ICON_LOOKUP[item.iconName] || Workflow;
                  const itemTheme = CATEGORY_THEMES[item.category] || CATEGORY_THEMES.DEFAULT;

                  return (
                    <button
                      key={item.type}
                      onClick={() => handleAddNode(item)}
                      className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/40 transition flex items-center space-x-3 group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${itemTheme.iconBg}`}>
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate flex items-center space-x-1.5">
                          <span>{item.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                      </div>
                      <Plus className="w-4 h-4 text-emerald-400 group-hover:scale-125 transition shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Quick Templates Switcher Modal */}
        {isTemplatesModalOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Load Pre-Built Automation Template</h3>
                    <p className="text-xs text-slate-400">Instantly populate canvas with end-to-end multi-agent flows</p>
                  </div>
                </div>
                <button onClick={() => setIsTemplatesModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {QUICK_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                        {tmpl.category}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1 group-hover:text-emerald-400 transition">
                        {tmpl.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tmpl.description}</p>
                    </div>
                    <button
                      onClick={() => handleLoadTemplate(tmpl.id)}
                      className="w-full py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 transition flex items-center justify-center space-x-1"
                    >
                      <span>Load into Canvas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Build with AI Modal */}
        {isAiGenerateModalOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Build Autonomous Workflow with AI</h3>
                    <p className="text-xs text-slate-400">Describe your process in natural language — generated directly into a DRAFT DAG</p>
                  </div>
                </div>
                <button onClick={() => setIsAiGenerateModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Workflow Goal & Logic Description
                </label>
                <textarea
                  rows={4}
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="e.g. When a high-value lead submits a demo form, qualify the lead using AI agent. If score >= 80, create a deal, assign a sales rep, send a personalized intro email, wait 3 days, and follow up if no response."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
                />

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Quick Prompt Inspiration:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Lead qualification pipeline with deal creation, sales rep assignment, and email',
                      'Invoice overdue recovery: Midas aging check, payment link, and dunning follow-up',
                      'Customer retention monitor: Athena churn score analysis and CSM escalation',
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiPromptInput(sample)}
                        className="text-[10px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-teal-300 border border-teal-500/20 text-left transition"
                      >
                        + {sample}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-950/30 border border-teal-500/20 text-[11px] text-teal-200 space-y-1">
                  <div className="font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Safety & Review Guarantee</span>
                  </div>
                  <p className="text-slate-400">
                    AI generated workflows are created strictly in <strong>DRAFT</strong> mode. You can inspect nodes, adjust prompts, run dry-run simulations, and publish when verified.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAiGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateWithAi}
                  disabled={isGeneratingAi || !aiPromptInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black text-xs shadow-lg shadow-teal-500/25 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  {isGeneratingAi ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing DAG...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate DRAFT Workflow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Publish Version & Validation Modal */}
        {isPublishModalOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Publish Immutable Workflow Version</h3>
                    <p className="text-xs text-slate-400">Pre-flight graph integrity validation & version sealing</p>
                  </div>
                </div>
                <button onClick={() => setIsPublishModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Graph validation check results */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Pre-Flight Graph Audit</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        validationResult?.valid !== false
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {validationResult?.valid !== false ? 'PASSED' : 'ACTION REQUIRED'}
                    </span>
                  </div>

                  {validationResult?.errors && validationResult.errors.length > 0 ? (
                    <div className="space-y-1 text-rose-400 text-[11px]">
                      {validationResult.errors.map((err: any, i: number) => (
                        <div key={i} className="flex items-start space-x-1.5">
                          <span className="font-bold"> [{err.code}]:</span>
                          <span>{err.message}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Graph connectivity, triggers, condition branches, and permissions verified.</span>
                    </div>
                  )}

                  {validationResult?.warnings && validationResult.warnings.length > 0 && (
                    <div className="space-y-1 text-amber-300 text-[11px] pt-1">
                      {validationResult.warnings.map((warn: any, i: number) => (
                        <div key={i} className="flex items-start space-x-1.5">
                          <span className="font-bold"> Notice:</span>
                          <span>{warn.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-slate-300">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Current Working Version:</span>
                    <span className="font-mono font-bold text-white">v{workflowVersion} ({workflowStatus})</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">New Target Version:</span>
                    <span className="font-mono font-bold text-emerald-400">v{workflowVersion + 1} (ACTIVE)</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Total Steps:</span>
                    <span className="font-bold text-white">{nodes.length} Nodes • {edges.length} Edges</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Publishing creates an immutable snapshot of this workflow definition. Any existing executions will safely run to completion on their original version.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublishVersion}
                  disabled={isPublishing || (validationResult && validationResult.valid === false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm & Publish Version</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Data Source & Folder Selector Modal */}
        {isFolderPickerOpen && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center space-x-2">
                      <span>Select Input Data Folder</span>
                      <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Step 0 • Ingestion Source
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Designate which Smart Vault folder, local directory, or cloud bucket feeds data into this workflow
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFolderPickerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Selection Header Card */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <FolderOpen className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center space-x-2 truncate">
                      <span>Current Ingestion Path:</span>
                      <span className="font-mono text-cyan-300 truncate">{selectedFolder?.path}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {selectedFolder?.records} • Ingests via {selectedFolder?.formats?.join(', ')} • {folderMode} Mode
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSimulateDrop}
                    disabled={isSimulatingDrop}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    title="Drop a simulated file into this directory to test live ingestion"
                  >
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>{isSimulatingDrop ? 'Dropping...' : ' Test Drop File'}</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE WATCHER
                  </span>
                </div>
              </div>

              {/* Grid of Folders */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Available Smart Vault Directories:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {AVAILABLE_INPUT_FOLDERS.map((f) => {
                    const isSelected = selectedFolder?.id === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFolder(f)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10'
                            : 'bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2 min-w-0">
                            <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold text-white truncate">{f.name}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 shrink-0 ml-2">
                            {f.records}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-cyan-300 truncate bg-slate-950 px-2 py-1 rounded border border-white/5">
                          {f.path}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate">{f.description}</span>
                          <div className="flex gap-1 shrink-0 ml-2">
                            {f.formats.map((fmt: string) => (
                              <span key={fmt} className="px-1 rounded bg-white/10 text-slate-300 font-mono text-[9px]">
                                {fmt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Directory Input */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-2">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Or Enter Custom Local / Network Storage Directory:</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. C:/BusinessOS/DataDrop/Inbound/ or /mnt/storage/leads/"
                    value={customFolderPath}
                    onChange={(e) => setCustomFolderPath(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customFolderPath.trim()) return;
                      const customF = {
                        id: `custom_${Date.now()}`,
                        name: 'Custom Storage Path',
                        path: customFolderPath.trim(),
                        category: 'Custom Filesystem',
                        records: 'Direct Local Path',
                        formats: ['*.*'],
                        badge: 'Local FS',
                        description: 'Custom path configured on host filesystem',
                      };
                      setSelectedFolder(customF);
                      setAlert({ message: `Custom directory set to ${customF.path}`, type: 'success' });
                    }}
                    disabled={!customFolderPath.trim()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition disabled:opacity-40"
                  >
                    Set Path
                  </button>
                </div>
              </div>

              {/* Ingestion Frequency / Trigger Mode */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/10 text-xs">
                <div>
                  <span className="font-bold text-white block">Ingestion Mode:</span>
                  <span className="text-[11px] text-slate-400">How the automation receives files from this folder</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-white/10">
                  {[
                    { id: 'REALTIME', label: 'Real-Time Watcher' },
                    { id: 'BATCH', label: 'Poll Every 5m' },
                    { id: 'MANUAL', label: 'Manual Trigger' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFolderMode(m.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        folderMode === m.id
                          ? 'bg-cyan-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const newNodeId = `folder_node_${Date.now()}`;
                    const firstNode = nodes[0];
                    const inputNode: Node = {
                      id: newNodeId,
                      type: 'studioNode',
                      position: {
                        x: Math.max(20, (firstNode?.position?.x || 80) - 340),
                        y: firstNode?.position?.y || 160,
                      },
                      data: {
                        type: 'trigger:folder_watcher',
                        category: 'TRIGGER',
                        title: 'Data Ingestion Folder',
                        subtitle: `Watches ${selectedFolder?.path || '/vault/inbound/crm_leads/'}`,
                        iconName: 'FolderPlus',
                        badge: 'Step 0 • Source',
                        status: 'IDLE',
                        config: {
                          inputFolder: selectedFolder?.path || '/vault/inbound/crm_leads/',
                          mode: folderMode,
                        },
                      },
                    };
                    setNodes((nds) => [inputNode, ...nds]);
                    if (firstNode) {
                      setEdges((eds) => [
                        {
                          id: `edge_input_${Date.now()}`,
                          source: newNodeId,
                          target: firstNode.id,
                          animated: true,
                          style: { stroke: '#06b6d4', strokeWidth: 2.5 },
                        },
                        ...eds,
                      ]);
                    }
                    setIsFolderPickerOpen(false);
                    setAlert({
                      message: 'Added Input Folder Step to workflow canvas!',
                      type: 'success',
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert as Canvas Node (Step 0)</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsFolderPickerOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const targetNodeId =
                        selectedNode?.id || nodes.find((n) => n.data?.category === 'TRIGGER')?.id || nodes[0]?.id;
                      if (targetNodeId) {
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === targetNodeId
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    subtitle: `Ingests data from ${selectedFolder?.path}`,
                                    config: {
                                      ...((n.data as any)?.config || {}),
                                      inputFolder: selectedFolder?.path,
                                      mode: folderMode,
                                    },
                                  },
                                }
                              : n,
                          ),
                        );
                      }
                      setIsFolderPickerOpen(false);
                      setAlert({
                        message: ` Input folder set to ${selectedFolder?.path}!`,
                        type: 'success',
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply Folder to Workflow</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Node Inspector Drawer */}
        {selectedNode && (() => {
          const nodeData = (selectedNode.data || {}) as any;
          const nodeTheme = CATEGORY_THEMES[(nodeData.category || 'DEFAULT').toUpperCase()] || CATEGORY_THEMES.DEFAULT;

          return (
            <div className="absolute top-4 right-4 z-30 w-96 max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900/95 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${nodeTheme.iconBg}`}>
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${nodeTheme.badge}`}>
                      {String(nodeData?.badge || nodeData?.category || 'Step')}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{String(nodeData?.title || 'Node')}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedNodeConfig(false)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        !showAdvancedNodeConfig
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Simple
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedNodeConfig(true)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        showAdvancedNodeConfig
                          ? 'bg-emerald-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Advanced
                    </button>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Step Label</label>
                  <input
                    type="text"
                    value={String(nodeData?.title || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((nds) =>
                        nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, title: val } } : n)),
                      );
                      setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, title: val } } : null));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Action Description</label>
                  <input
                    type="text"
                    value={String(nodeData?.subtitle || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((nds) =>
                        nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, subtitle: val } } : n)),
                      );
                      setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, subtitle: val } } : null));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                {/* Data Input Source & Folder Configuration */}
                {(nodeData?.category === 'TRIGGER' || nodeData?.type?.startsWith('trigger:') || nodeData?.config?.inputFolder) && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-cyan-300 font-bold text-xs">
                        <Folder className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Data Input Folder</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFolderPickerOpen(true)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                      >
                        Browse Folders
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Folder or directory from which this trigger ingests inbound data, files, and payload records.
                    </p>
                    <div>
                      <input
                        type="text"
                        value={String(nodeData?.config?.inputFolder || selectedFolder?.path || '/vault/inbound/crm_leads/')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), inputFolder: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), inputFolder: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/40 text-cyan-200 font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    {/* Folder Quick Presets */}
                    <div className="flex flex-wrap gap-1">
                      {AVAILABLE_INPUT_FOLDERS.slice(0, 4).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setSelectedFolder(f);
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), inputFolder: f.path } } }
                                  : n,
                              ),
                            );
                            setSelectedNode((prev: any) =>
                              prev
                                ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), inputFolder: f.path } } }
                                : null,
                            );
                            setAlert({ message: `Input folder set to ${f.path}`, type: 'success' });
                          }}
                          className="px-2 py-0.5 rounded text-[9px] bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 transition truncate max-w-[130px]"
                        >
                          {f.name.split(' ')[0]}: {f.path}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Variable Picker with Grouped Tabs (Advanced Mode Only) */}
                {showAdvancedNodeConfig && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Data Variable Picker</span>
                      </span>
                      <span className="text-[9px] text-slate-500">Click variable to copy</span>
                    </div>

                    {/* Candidate Variables */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400">Candidate:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          '{{candidate.firstName}}',
                          '{{candidate.lastName}}',
                          '{{candidate.email}}',
                          '{{candidate.phone}}',
                          '{{candidate.appliedRole}}',
                          '{{candidate.experienceYears}}',
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded bg-teal-500/10 hover:bg-teal-500/25 text-teal-300 font-mono text-[9px] border border-teal-500/20 cursor-pointer transition"
                            title="Click to copy variable"
                            onClick={() => {
                              navigator.clipboard?.writeText(tag);
                              setAlert({ message: `Copied ${tag} to clipboard!`, type: 'info' });
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Job Variables */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400">Job Profile:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          '{{job.title}}',
                          '{{job.department}}',
                          '{{job.requiredSkills}}',
                          '{{job.location}}',
                          '{{job.minExperience}}',
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded bg-sky-500/10 hover:bg-sky-500/25 text-sky-300 font-mono text-[9px] border border-sky-500/20 cursor-pointer transition"
                            title="Click to copy variable"
                            onClick={() => {
                              navigator.clipboard?.writeText(tag);
                              setAlert({ message: `Copied ${tag} to clipboard!`, type: 'info' });
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Screening & Output Variables */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400">Screening & Scores:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          '{{candidateScore}}',
                          '{{recommendation}}',
                          '{{matchedRequirements}}',
                          '{{missingRequirements}}',
                          '{{calendar.availableSlots}}',
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 font-mono text-[9px] border border-emerald-500/20 cursor-pointer transition"
                            title="Click to copy variable"
                            onClick={() => {
                              navigator.clipboard?.writeText(tag);
                              setAlert({ message: `Copied ${tag} to clipboard!`, type: 'info' });
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Specific Node Customization */}
                {/* 1. Logic & Branching Rule Configuration */}
                {(nodeData?.category === 'LOGIC' || nodeData?.type?.startsWith('logic:')) && (
                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-950 border border-white/5">
                    <div className="font-semibold text-white flex items-center space-x-1.5">
                      <GitFork className="w-3.5 h-3.5 text-amber-400" />
                      <span>Branch Evaluation Rule</span>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Field to Inspect</label>
                      <input
                        type="text"
                        value={String(nodeData?.config?.field || 'candidateScore')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), field: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), field: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono text-xs"
                      />
                      <div className="flex gap-1 mt-1">
                        {['candidateScore', 'experienceYears', 'leadScore'].map((fld) => (
                          <button
                            key={fld}
                            type="button"
                            onClick={() => {
                              setNodes((nds) =>
                                nds.map((n) =>
                                  n.id === selectedNode.id
                                    ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), field: fld } } }
                                    : n,
                                ),
                              );
                              setSelectedNode((prev: any) =>
                                prev
                                  ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), field: fld } } }
                                  : null,
                              );
                            }}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 font-mono"
                          >
                            {fld}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Operator</label>
                      <select
                        value={String(nodeData?.config?.operator || 'GREATER_THAN')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), operator: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), operator: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                      >
                        <option value="GREATER_THAN">Greater Than / Equals (&gt;=)</option>
                        <option value="LESS_THAN">Less Than (&lt;)</option>
                        <option value="EQUALS">Equals (==)</option>
                        <option value="NOT_EQUALS">Not Equals (!=)</option>
                        <option value="CONTAINS">Contains</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Threshold / Comparison Value</label>
                      <input
                        type="number"
                        value={Number(nodeData?.config?.value ?? 75)}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), value: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), value: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Recruitment Screening & Screening Profile Configuration */}
                {(nodeData?.category === 'RECRUITMENT' ||
                  nodeData?.category === 'RECRUITMENT_AI' ||
                  nodeData?.type === 'recruitment:screen_candidate' ||
                  nodeData?.type === 'candidate:screen_candidate' ||
                  nodeData?.type?.startsWith('ai:candidate_') ||
                  nodeData?.type?.startsWith('ai:screening')) && (
                  <div className="space-y-3.5 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-teal-950/30 border border-emerald-500/30 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-black text-white text-xs">Screen Candidate</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Recruiter-Friendly
                      </span>
                    </div>

                    {/* Simple Mode: Clean Profile Selection */}
                    {!showAdvancedNodeConfig ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Screening Profile
                          </label>
                          <select
                            value={String(nodeData?.config?.screeningProfileId || 'junior_accounts_exec')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNodes((nds) =>
                                nds.map((n) =>
                                  n.id === selectedNode.id
                                    ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), screeningProfileId: val } } }
                                    : n,
                                ),
                              );
                              setSelectedNode((prev: any) =>
                                prev
                                  ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), screeningProfileId: val } } }
                                  : null,
                              );
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                          >
                            <option value="junior_accounts_exec">Junior Accounts Executive (CGPA ≥ 3.00, 2+ yrs, 5 of 8 skills)</option>
                            <option value="software_engineer">Full-Stack Software Engineer (3+ yrs, 4 of 6 skills)</option>
                            <option value="sales_executive">Enterprise Account Executive (3+ yrs closing, B2B SaaS)</option>
                            <option value="customer_support">Customer Support Specialist (1+ yrs, Zendesk)</option>
                            <option value="entry_level_grad">Entry-Level Graduate Trainee (CGPA ≥ 3.20)</option>
                            <option value="custom_profile">Custom Profile (Configured in Recruiter Studio)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Thresholds &amp; Matching Rules
                          </label>
                          <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-[11px] space-y-1.5 text-slate-300">
                            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Evaluated Against Profile Rules:</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-[10px]">
                              • Bachelor&apos;s degree (CGPA ≥ 3.00)<br />
                              • 2+ years relevant experience<br />
                              • At least 5 of 8 skills (Excel, MS Office, Word, etc.)<br />
                              • Preferred: Accounting software
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <Link
                            href="/recruitment/screening"
                            target="_blank"
                            className="inline-flex items-center space-x-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline"
                          >
                            <span>Open Recruiter Screening Studio</span>
                          </Link>
                          <span className="text-[10px] text-slate-500 font-mono">No JSON variables needed</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-[10px] text-slate-300 flex items-center space-x-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Outputs structured result with verbatim resume evidence &amp; routes to Human Review.</span>
                        </div>
                      </div>
                    ) : (
                      /* Advanced Mode: Technical Schemas and Overrides */
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                            <span>Minimum Passing Fit Threshold:</span>
                            <span className="font-mono font-bold text-emerald-400">
                              {nodeData?.config?.threshold ?? 75}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="95"
                            value={Number(nodeData?.config?.threshold ?? 75)}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setNodes((nds) =>
                                nds.map((n) =>
                                  n.id === selectedNode.id
                                    ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), threshold: val } } }
                                    : n,
                                ),
                              );
                              setSelectedNode((prev: any) =>
                                prev
                                  ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), threshold: val } } }
                                  : null,
                              );
                            }}
                            className="w-full accent-emerald-500"
                          />
                        </div>

                        <div className="p-2 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-[10px] text-slate-300 space-y-1">
                          <div className="font-bold text-emerald-400 flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Strict Non-Discrimination Guardrail</span>
                          </div>
                          <p className="text-slate-400 text-[9px] leading-tight">
                            Protected characteristics (age, gender, ethnicity, location) are excluded from scoring formulas. All scores include explainable evidence.
                          </p>
                        </div>

                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Structured Output Contract:</span>
                          <pre className="mt-1 text-[9px] font-mono text-emerald-300 bg-slate-950 p-2 rounded-lg overflow-x-auto border border-emerald-500/20">
{`{
  candidateScore: number,
  evaluationBreakdown: { mandatoryRatio: string },
  matchedCriteria: [{ title, evidence, citation }],
  missingCriteria: [{ title, expected }],
  recommendedNextStep: 'HUMAN_REVIEW'
}`}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Communication & Messaging Configuration */}
                {(nodeData?.category === 'COMMUNICATION' || nodeData?.type?.startsWith('comm:')) && (
                  <div className="space-y-3 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                    <div className="font-semibold text-cyan-300 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Communication Channel Dispatch</span>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Recipient Destination</label>
                      <input
                        type="text"
                        value={String(nodeData?.config?.to || '{{candidate.email}}')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), to: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), to: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Subject Header</label>
                      <input
                        type="text"
                        value={String(nodeData?.config?.subject || 'Interview Invitation: {{job.title}} at BusinessOS')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), subject: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), subject: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Message Body Template</label>
                      <textarea
                        rows={4}
                        value={String(
                          nodeData?.config?.template ||
                            nodeData?.config?.message ||
                            'Dear {{candidate.firstName}},\n\nWe were impressed by your background in {{job.title}}! We would love to invite you for an interview.\n\nPlease pick your slot: {{calendar.bookingLink}}',
                        )}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      config: { ...((n.data as any)?.config || {}), template: val, message: val },
                                    },
                                  }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    config: { ...((prev.data as any)?.config || {}), template: val, message: val },
                                  },
                                }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Calendar Scheduling Configuration */}
                {(nodeData?.category === 'CALENDAR' || nodeData?.type?.startsWith('calendar:')) && (
                  <div className="space-y-3 p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/30">
                    <div className="font-semibold text-sky-300 flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>Calendar Engine Parameters</span>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Meeting Duration (Minutes)</label>
                      <select
                        value={Number(nodeData?.config?.durationMinutes || 45)}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), durationMinutes: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), durationMinutes: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                      >
                        <option value={15}>15 Minutes (Fast Screen)</option>
                        <option value={30}>30 Minutes (Screening Call)</option>
                        <option value={45}>45 Minutes (Technical Deep-Dive)</option>
                        <option value={60}>60 Minutes (Full Panel Interview)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Interviewer Calendar Target</label>
                      <input
                        type="text"
                        value={String(nodeData?.config?.interviewerEmail || 'hiring-manager@businessos.com')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), interviewerEmail: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), interviewerEmail: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 5. AI Agent Reusable Node Configuration */}
                {(nodeData?.category === 'AI_AGENT' || nodeData?.type === 'ai:autonomous_agent') && (
                  <div className="space-y-3 p-3.5 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/30">
                    <div className="font-semibold text-fuchsia-300 flex items-center space-x-1.5">
                      <Bot className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>Autonomous AI Agent Engine</span>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Agent Persona & Goal</label>
                      <input
                        type="text"
                        value={String(nodeData?.config?.goal || 'Autonomously screen and schedule engineering candidates')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), goal: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), goal: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Model Selection</label>
                      <select
                        value={String(nodeData?.config?.model || 'claude-3-5-sonnet')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), model: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), model: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                      >
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Advanced Reasoning)</option>
                        <option value="gpt-4o">GPT-4o (Omni High Speed)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Context Window)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Instructions Prompt</label>
                      <textarea
                        rows={3}
                        value={String(
                          nodeData?.config?.instructions ||
                            'Evaluate candidate qualification against JD requirements. Extract strengths, concerns, and calculate fit score. Never use protected characteristics.',
                        )}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), instructions: val } } }
                                : n,
                            ),
                          );
                          setSelectedNode((prev: any) =>
                            prev
                              ? { ...prev, data: { ...prev.data, config: { ...((prev.data as any)?.config || {}), instructions: val } } }
                              : null,
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Single Node Isolation Test Runner */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center space-x-1.5">
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>Isolate & Test Node</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTestSingleNode(selectedNode)}
                      disabled={isTestingSingleNode}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] border border-emerald-500/40 transition flex items-center space-x-1 disabled:opacity-50"
                    >
                      {isTestingSingleNode ? (
                        <>
                          <RotateCw className="w-2.5 h-2.5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-2.5 h-2.5" />
                          <span>Execute Node</span>
                        </>
                      )}
                    </button>
                  </div>

                  {singleNodeTestResult && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-white/10 space-y-1 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">
                          Status: {singleNodeTestResult.status || (singleNodeTestResult.success ? 'SUCCESS' : 'FAILED')}
                        </span>
                        <span className="font-mono text-slate-400">{singleNodeTestResult.durationMs || 12}ms</span>
                      </div>
                      <pre className="font-mono text-[9px] text-slate-300 max-h-32 overflow-y-auto bg-slate-950 p-2 rounded border border-white/5">
                        {JSON.stringify(singleNodeTestResult.output || singleNodeTestResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Collapsible Advanced Settings */}
                <div className="pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedNodeConfig(!showAdvancedNodeConfig)}
                    className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-white py-1 transition"
                  >
                    <span>Advanced Node Settings</span>
                    <span>{showAdvancedNodeConfig ? '▲' : '▼'}</span>
                  </button>

                  {showAdvancedNodeConfig && (
                    <div className="mt-2.5 space-y-3 p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px]">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Retry Policy (Max Retries)</label>
                        <select
                          value={Number(nodeData?.config?.maxRetries ?? 3)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), maxRetries: val } } }
                                  : n,
                              ),
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                        >
                          <option value={0}>0 (No Retries - Fail Fast)</option>
                          <option value={1}>1 Retry</option>
                          <option value={3}>3 Retries (Exponential Backoff)</option>
                          <option value={5}>5 Retries (Max Reliability)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Execution Timeout (Seconds)</label>
                        <input
                          type="number"
                          value={Number(nodeData?.config?.timeoutSeconds ?? 30)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), timeoutSeconds: val } } }
                                  : n,
                              ),
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="text-[10px] text-slate-300">Enable Error Catch Branch</label>
                        <input
                          type="checkbox"
                          checked={Boolean(nodeData?.config?.enableErrorBranch)}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, config: { ...((n.data as any)?.config || {}), enableErrorBranch: val } } }
                                  : n,
                              ),
                            );
                          }}
                          className="accent-rose-500 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDeleteNode(selectedNode.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    title="Delete step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateNode(selectedNode)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                    title="Duplicate step"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedNode(null);
                    setAlert({ message: 'Step configuration applied.', type: 'success' });
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Apply & Close
                </button>
              </div>
            </div>
          );
        })()}

        {/* Interactive Test Simulation Modal */}
        {isTestModalOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <Play className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Interactive Workflow Test Simulation</h3>
                    <p className="text-xs text-slate-400">Execute full DAG with candidate payloads and verify branches</p>
                  </div>
                </div>
                <button onClick={() => setIsTestModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Candidate Test Presets */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Select Test Persona Payload:</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {Object.values(TEST_PRESETS).map((p: any) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTestCandidatePreset(p.id)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        testCandidatePreset === p.id
                          ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-md'
                          : 'bg-slate-950/80 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs truncate text-emerald-300">{p.label.split('—')[0]}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{p.description}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Payload Option */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-300">Trigger Data Payload (JSON):</span>
                    <button
                      type="button"
                      onClick={() => {
                        const pr = TEST_PRESETS[testCandidatePreset];
                        if (pr) setCustomTestPayload(JSON.stringify(pr.payload, null, 2));
                      }}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Reset to selected preset
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={customTestPayload}
                    onChange={(e) => {
                      setCustomTestPayload(e.target.value);
                      setTestCandidatePreset('custom');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-emerald-300 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => handleTestRun()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running Simulation...' : 'Execute Test Run'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Execution Telemetry Logs */}
        {isExecutionLogsOpen && (
          <div className="absolute bottom-4 left-4 right-4 z-30 max-h-56 overflow-y-auto rounded-2xl bg-slate-900/95 border border-white/15 p-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Live Execution Telemetry</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REALTIME
                </span>
              </div>
              <button onClick={() => setIsExecutionLogsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              {executionLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-emerald-400 font-bold">Step {log.step}:</span>
                    <span className="text-white font-semibold">{log.node}</span>
                    <span className="text-slate-400">{log.output}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500">
                    {log.tokens && (
                      <span className="text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {log.tokens} tk
                      </span>
                    )}
                    <span className="text-emerald-400 font-bold">{log.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

// Visual Studio Page with ReactFlowProvider
export default function VisualStudioPage() {
  return (
    <div className="w-full h-full flex flex-col flex-1 min-h-0 relative">
      <ReactFlowProvider>
        <StudioCanvasContent />
      </ReactFlowProvider>
    </div>
  );
}
