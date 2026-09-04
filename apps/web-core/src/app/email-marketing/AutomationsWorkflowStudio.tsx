'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Play,
  Plus,
  Zap,
  Clock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  ArrowRight,
  TrendingUp,
  Sparkles,
  PhoneCall,
  Sliders,
  Check,
  RotateCcw,
  Tag,
  MousePointerClick,
  Eye,
  Settings2,
  Trash2,
  Copy,
  ChevronRight,
  HelpCircle,
  Flame,
  ShieldCheck,
  Edit3,
  MoveUp,
  MoveDown,
  X,
  Palette,
  ExternalLink,
  BarChart3,
  ListOrdered,
  UserPlus,
  CheckSquare,
  Send,
  Split,
  Filter,
  CheckCheck,
  Award,
  Layers,
  ArrowDown,
  ChevronDown,
  Building,
  Briefcase,
  Calendar,
  GripVertical,
  FileText,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { setBridgeTransfer } from '../../lib/emailBridge';

export type NodeType =
  | 'TRIGGER'
  | 'SEND_EMAIL'
  | 'DELAY'
  | 'CONDITION'
  | 'ADD_TAG'
  | 'REMOVE_TAG'
  | 'UPDATE_LEAD_SCORE'
  | 'ADD_TO_LIST'
  | 'REMOVE_FROM_LIST'
  | 'NOTIFY_SALES'
  | 'CREATE_CRM_TASK'
  | 'UPDATE_CONTACT'
  | 'WEBHOOK'
  | 'EXIT_WORKFLOW'
  | 'MOVE_TO_WORKFLOW';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle: string;
  branch?: 'MAIN' | 'YES' | 'NO';
  orderIndex?: number;
  config?: {
    // Trigger
    triggerEvent?: string;
    triggerDetail?: string;
    reEnrollmentAllowed?: boolean;

    // Email
    emailSubject?: string;
    senderName?: string;
    senderEmail?: string;
    replyTo?: string;
    templateId?: string;
    optimalSendTime?: boolean;
    predictedSendTime?: string;
    smartIndustrySwap?: boolean;
    dynamicCaseStudyText?: string;
    previewText?: string;

    // Delay
    delayDuration?: number;
    delayUnit?: 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS';
    waitUntilDate?: string;

    // Condition
    conditionType?: 'CLICKED_LINK' | 'OPENED_EMAIL' | 'VISITED_PAGE' | 'SCORE_ABOVE' | 'TAG_EXISTS' | 'INACTIVITY_DAYS';
    thresholdScore?: number;
    yesBranchLabel?: string;
    noBranchLabel?: string;

    // Lead Score
    scoreChange?: number;
    scoreReason?: string;

    // Tag & List
    tag?: string;
    listName?: string;

    // Sales & Tasks
    assignedRep?: string;
    notificationChannel?: 'SLACK' | 'SOFTPHONE' | 'EMAIL' | 'IN_APP';
    taskTitle?: string;
    taskPriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    taskDueIn?: string;

    // Contact Update
    contactField?: string;
    contactValue?: string;

    // Webhook
    webhookUrl?: string;
    webhookMethod?: 'POST' | 'PUT' | 'GET';

    // Goal
    goalType?: 'PURCHASED' | 'BOOKED_DEMO' | 'BECAME_CUSTOMER' | 'REACHED_SCORE' | 'CONVERTED' | 'UNRESPONSIVE';

    // Move to Workflow
    targetWorkflowId?: string;
  };
  analytics?: {
    sentCount: number;
    openRatePct: string;
    clickRatePct: string;
    dropoffPct: string;
    splitPct?: string;
  };
}

export type LaneKey = 'mainNodes' | 'yesNodes' | 'noNodes' | 'scoreGateYes' | 'scoreGateNo';

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'B2B Nurture' | 'Lead Scoring' | 'Cart & Trial Recovery' | 'Executive Outbound' | 'Custom';
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED';
  enrolledLeads: number;
  completedLeads: number;
  conversionRate: string;
  revenueAttributed: string;
  mainNodes: WorkflowNode[];
  yesNodes: WorkflowNode[];
  noNodes: WorkflowNode[];
  scoreGateNodes: {
    yesPath: WorkflowNode[];
    noPath: WorkflowNode[];
  };
}

// 👑 Flagship Workflow: Exact match to the enterprise Email Automation Flowchart
const FLAGSHIP_WORKFLOW: AutomationWorkflow = {
  id: 'wf_flagship_enterprise',
  name: '👑 Enterprise Omnichannel Nurture & Decision Tree',
  description: 'Behavioral decision tree matching industry best practice: Anonymous Tracking → Trigger → Email 1 with AI Send Time → 24h Telemetry Wait → Branch on Click (YES: Hot Leads +10 Score → 24h → Email 2A vs NO: 5d → Email 2B) → Score >= 50 Qualification Gate → Ongoing 5-Step Nurture to Customer Conversion.',
  category: 'B2B Nurture',
  status: 'ACTIVE',
  enrolledLeads: 1420,
  completedLeads: 1198,
  conversionRate: '34.8%',
  revenueAttributed: '$148,500',
  mainNodes: [
    {
      id: 'node_trig',
      type: 'TRIGGER',
      title: '1. Capture & Track: Visitor Submits Form',
      subtitle: 'Tracking pixel binds anonymous browsing history to CRM profile upon demo form submission.',
      config: {
        triggerEvent: 'FORM_SUBMITTED',
        triggerDetail: 'Website Demo Request or /pricing form',
      },
      analytics: { sentCount: 1420, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
    },
    {
      id: 'node_email_1',
      type: 'SEND_EMAIL',
      title: '2. Email 1 (Welcome / Value)',
      subtitle: 'Sent immediately or AI optimal send time. Automatically injects dynamic industry case study.',
      config: {
        emailSubject: 'Executive Briefing: Business OS ROI & Architecture Overview',
        senderName: 'Business OS Enterprise Solutions',
        senderEmail: 'solutions@businessos.io',
        optimalSendTime: true,
        predictedSendTime: 'Tuesday at 10:15 AM EST (Peak Open Probability)',
        smartIndustrySwap: true,
      },
      analytics: { sentCount: 1420, openRatePct: '58.2%', clickRatePct: '34.8%', dropoffPct: '2.1%' },
    },
    {
      id: 'node_delay_1',
      type: 'DELAY',
      title: '3. Wait 24 Hours (Delay)',
      subtitle: 'Active telemetry listener tracks opens, clicks, and page visit latency.',
      config: {
        delayDuration: 24,
        delayUnit: 'HOURS',
      },
      analytics: { sentCount: 1390, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
    },
    {
      id: 'node_cond_click',
      type: 'CONDITION',
      title: '4. Decision: Did contact click link in Email 1?',
      subtitle: 'Branching logic checks if click telemetry fired within 24-hour observation window.',
      config: {
        conditionType: 'CLICKED_LINK',
        yesBranchLabel: 'YES (Clicked Link in Email 1)',
        noBranchLabel: 'NO (Unopened / Did Not Click)',
      },
      analytics: { sentCount: 1390, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%', splitPct: '40% YES (556) / 60% NO (834)' },
    },
  ],
  yesNodes: [
    {
      id: 'node_yes_list',
      type: 'ADD_TO_LIST',
      branch: 'YES',
      title: 'Add to "Hot Leads" List',
      subtitle: 'Enrolls prospect into high-intent executive sales pipeline.',
      config: { listName: 'Hot Leads List' },
      analytics: { sentCount: 556, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
    },
    {
      id: 'node_yes_score',
      type: 'UPDATE_LEAD_SCORE',
      branch: 'YES',
      title: '+10 Lead Score Applied',
      subtitle: 'High-intent bonus added to contact CRM telemetry profile.',
      config: { scoreChange: 10 },
      analytics: { sentCount: 556, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
    },
    {
      id: 'node_yes_delay',
      type: 'DELAY',
      branch: 'YES',
      title: 'Wait 24 Hours (Delay)',
      subtitle: 'Strategic spacing before delivering deep technical proof.',
      config: { delayDuration: 24, delayUnit: 'HOURS' },
      analytics: { sentCount: 556, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
    },
    {
      id: 'node_yes_email_2a',
      type: 'SEND_EMAIL',
      branch: 'YES',
      title: 'Email 2A (Advanced Content / Case Study)',
      subtitle: 'Deep dive into ROI metrics & sub-10ms query benchmarks.',
      config: {
        emailSubject: 'Deep Dive: How Hyperion Consolidated 14 Subscriptions & Cut $4,200/mo',
        smartIndustrySwap: true,
      },
      analytics: { sentCount: 556, openRatePct: '64.5%', clickRatePct: '42.1%', dropoffPct: '1.4%' },
    },
  ],
  noNodes: [
    {
      id: 'node_no_remove',
      type: 'REMOVE_FROM_LIST',
      branch: 'NO',
      title: 'Remove from "Hot Leads" List',
      subtitle: 'Prevents unwanted sales outreach while lead is still exploring.',
      config: { listName: 'Hot Leads List' },
      analytics: { sentCount: 834, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
    },
    {
      id: 'node_no_delay',
      type: 'DELAY',
      branch: 'NO',
      title: 'Wait 5 Days (Extended Nurture Delay)',
      subtitle: 'Gives lead time to review prior to second non-intrusive touchpoint.',
      config: { delayDuration: 5, delayUnit: 'DAYS' },
      analytics: { sentCount: 834, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
    },
    {
      id: 'node_no_email_2b',
      type: 'SEND_EMAIL',
      branch: 'NO',
      title: 'Email 2B (Alternative Angle / Low Friction)',
      subtitle: 'Simple, lightweight question: "What is your biggest bottleneck this quarter?"',
      config: {
        emailSubject: 'Quick question regarding your current CRM infrastructure setup',
        smartIndustrySwap: true,
      },
      analytics: { sentCount: 812, openRatePct: '46.1%', clickRatePct: '18.9%', dropoffPct: '3.2%' },
    },
  ],
  scoreGateNodes: {
    yesPath: [
      {
        id: 'node_gate_notify',
        type: 'NOTIFY_SALES',
        branch: 'YES',
        title: 'Notify Sales Rep: "Hot Lead Alert: Elena Rostova (CEO)"',
        subtitle: 'Pushes priority Slack notification and WebRTC softphone battlecard.',
        config: { assignedRep: 'Account Executive', notificationChannel: 'SLACK' },
        analytics: { sentCount: 220, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
      },
      {
        id: 'node_gate_task',
        type: 'CREATE_CRM_TASK',
        branch: 'YES',
        title: 'Create CRM Task: "Schedule Architecture Review"',
        subtitle: 'Auto-schedules 24h task for assigned sales rep in universal CRM board.',
        config: { taskTitle: 'Schedule 15-min Architecture Review', taskPriority: 'HIGH' },
        analytics: { sentCount: 220, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
      },
      {
        id: 'node_gate_status',
        type: 'UPDATE_CONTACT',
        branch: 'YES',
        title: 'Update Contact: Set Stage = "Sales Qualified (SQL)"',
        subtitle: 'Advances pipeline stage automatically.',
        config: { contactField: 'lifecycleStage', contactValue: 'Sales Qualified Lead (SQL)' },
        analytics: { sentCount: 220, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
      },
    ],
    noPath: [
      {
        id: 'node_gate_email_3',
        type: 'SEND_EMAIL',
        branch: 'NO',
        title: 'Email 3 (Webinar / Educational Content)',
        subtitle: 'Shares recorded executive webinar on autonomous AI workflows.',
        config: { emailSubject: 'Executive Masterclass: Deploying Autonomous Voice & Data Pipelines' },
        analytics: { sentCount: 592, openRatePct: '41.2%', clickRatePct: '19.4%', dropoffPct: '4.8%' },
      },
      {
        id: 'node_gate_delay_3',
        type: 'DELAY',
        branch: 'NO',
        title: 'Wait 3 Days',
        subtitle: 'Observation window for webinar replay viewing.',
        config: { delayDuration: 3, delayUnit: 'DAYS' },
        analytics: { sentCount: 564, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
      },
      {
        id: 'node_gate_email_4',
        type: 'SEND_EMAIL',
        branch: 'NO',
        title: 'Email 4 (Social Proof & Customer Results)',
        subtitle: 'Case study highlights: "How Acme cut 4 hours/day with Business OS".',
        config: { emailSubject: 'See how Acme Corp reduced manual data entry by 85%' },
        analytics: { sentCount: 564, openRatePct: '39.8%', clickRatePct: '22.1%', dropoffPct: '2.5%' },
      },
      {
        id: 'node_gate_delay_4',
        type: 'DELAY',
        branch: 'NO',
        title: 'Wait 4 Days',
        subtitle: 'Spacing before final value offer.',
        config: { delayDuration: 4, delayUnit: 'DAYS' },
        analytics: { sentCount: 550, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
      },
      {
        id: 'node_gate_email_5',
        type: 'SEND_EMAIL',
        branch: 'NO',
        title: 'Email 5 (Product Demo / Free Trial Offer)',
        subtitle: 'Includes 1-click personalized sandbox environment activation link.',
        config: { emailSubject: 'Activate your private Business OS sandbox environment' },
        analytics: { sentCount: 550, openRatePct: '48.2%', clickRatePct: '29.9%', dropoffPct: '3.1%' },
      },
      {
        id: 'node_gate_goal',
        type: 'EXIT_WORKFLOW',
        branch: 'NO',
        title: 'Goal: Customer Conversion / Demo Booked',
        subtitle: 'Contact converted or booked demo; sequence completes successfully.',
        config: { goalType: 'BECAME_CUSTOMER' },
        analytics: { sentCount: 164, openRatePct: '100%', clickRatePct: '0%', dropoffPct: '0%' },
      },
    ],
  },
};

// Additional Presets
const PRESET_WORKFLOWS: AutomationWorkflow[] = [
  FLAGSHIP_WORKFLOW,
  {
    id: 'wf_cart_recovery',
    name: '🛒 SaaS Trial Drop-off & Cart Recovery',
    description: 'Autonomous 3-step reactivation sequence: Triggers on abandoned checkout > Injects personalized 15% discount > Schedules rep task if high deal value.',
    category: 'Cart & Trial Recovery',
    status: 'ACTIVE',
    enrolledLeads: 640,
    completedLeads: 412,
    conversionRate: '28.4%',
    revenueAttributed: '$52,800',
    mainNodes: [
      {
        id: 'cr_trig',
        type: 'TRIGGER',
        title: 'Trigger: Checkout Abandoned (/billing)',
        subtitle: 'User added license seats but exited without payment submission.',
        config: { triggerEvent: 'PAGE_VISITED', triggerDetail: '/billing/checkout' },
      },
      {
        id: 'cr_delay_1',
        type: 'DELAY',
        title: 'Wait 2 Hours',
        subtitle: 'Grace period for user to return organically.',
        config: { delayDuration: 2, delayUnit: 'HOURS' },
      },
      {
        id: 'cr_email_1',
        type: 'SEND_EMAIL',
        title: 'Send: "Did you leave something behind?"',
        subtitle: 'Friendly reminder with saved cart session link.',
        config: { emailSubject: 'Complete your Business OS setup in 1 click' },
      },
    ],
    yesNodes: [],
    noNodes: [],
    scoreGateNodes: { yesPath: [], noPath: [] },
  },
  {
    id: 'wf_healthcare_intake',
    name: '🏥 Healthcare Patient Intake & Clinical Triage',
    description: 'Patient appointment triage: Triggers on booking > Verifies insurance pre-auth > Sends preparation instructions > Alerts attending physician.',
    category: 'B2B Nurture',
    status: 'ACTIVE',
    enrolledLeads: 890,
    completedLeads: 845,
    conversionRate: '94.9%',
    revenueAttributed: '$210,000',
    mainNodes: [
      {
        id: 'hc_trig',
        type: 'TRIGGER',
        title: 'Trigger: Patient Booked Consult',
        subtitle: 'Fired from telemedicine portal or EHR integration.',
        config: { triggerEvent: 'FORM_SUBMITTED', triggerDetail: 'Patient Intake Portal' },
      },
      {
        id: 'hc_email_1',
        type: 'SEND_EMAIL',
        title: 'Send: Clinical Consultation Confirmation',
        subtitle: 'Includes pre-visit instructions and telehealth video link.',
        config: { emailSubject: 'Your upcoming medical appointment confirmation' },
      },
    ],
    yesNodes: [],
    noNodes: [],
    scoreGateNodes: { yesPath: [], noPath: [] },
  },
];

const LOCAL_STORAGE_KEY = 'crm_automation_workflows_v3';

interface AutomationsWorkflowStudioProps {
  onOpenEmailDesigner?: (emailSubject?: string, nodeId?: string, nodeTitle?: string) => void;
}

export function AutomationsWorkflowStudio({ onOpenEmailDesigner }: AutomationsWorkflowStudioProps) {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(PRESET_WORKFLOWS);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(FLAGSHIP_WORKFLOW.id);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAnalyticsMode, setIsAnalyticsMode] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  // Active Drag State
  const [activeDragItem, setActiveDragItem] = useState<{
    action: 'CREATE_NODE' | 'MOVE_NODE';
    nodeType?: NodeType;
    nodeId?: string;
    sourceLane?: LaneKey;
    sourceIndex?: number;
  } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ lane: LaneKey; index: number } | null>(null);

  // Quick Insert Menu State
  const [quickInsertTarget, setQuickInsertTarget] = useState<{ lane: LaneKey; index: number } | null>(null);

  // Palette Click-to-Add Quick Menu State
  const [paletteActionNode, setPaletteActionNode] = useState<{ type: NodeType; label: string } | null>(null);

  // Simulation State
  const [simulationPersona, setSimulationPersona] = useState<'Elena (CEO, SaaS)' | 'Dr. Gregory (Healthcare)' | 'Marcus (Unresponsive)'>('Elena (CEO, SaaS)');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  // Inspector Drawer State
  const [selectedNode, setSelectedNode] = useState<{ node: WorkflowNode; lane: LaneKey } | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Execution Logs & Audit Trail State
  const [isExecutionLogsOpen, setIsExecutionLogsOpen] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [selectedExecutionRun, setSelectedExecutionRun] = useState<any | null>(null);
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(false);
  const [testEventTrigger, setTestEventTrigger] = useState<'PAGE_VISITED' | 'FORM_SUBMITTED' | 'CART_ABANDONED'>('PAGE_VISITED');
  const [testEventEmail, setTestEventEmail] = useState('elena.rostova@hyperion.io');
  const [isTriggeringEvent, setIsTriggeringEvent] = useState(false);

  // AI Generated Outreach Modal
  const [isAiEmailModalOpen, setIsAiEmailModalOpen] = useState(false);
  const [liveGeneratedEmail, setLiveGeneratedEmail] = useState<{
    subject: string;
    body: string;
    to: string;
    activityId?: string;
  } | null>(null);

  // AI Sequence Architect Modal
  const [isAiArchitectOpen, setIsAiArchitectOpen] = useState(false);
  const [aiArchitectPrompt, setAiArchitectPrompt] = useState('Create a 4-step onboarding workflow for enterprise executives who requested a demo');
  const [isGeneratingAiSequence, setIsGeneratingAiSequence] = useState(false);

  // Create New Workflow Modal
  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false);
  const [newWorkflowTemplate, setNewWorkflowTemplate] = useState<string>('blank');
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [newWorkflowCategory, setNewWorkflowCategory] = useState<AutomationWorkflow['category']>('B2B Nurture');

  // Edit Flow Settings Modal
  const [isFlowSettingsOpen, setIsFlowSettingsOpen] = useState(false);
  const [editFlowName, setEditFlowName] = useState('');
  const [editFlowDescription, setEditFlowDescription] = useState('');
  const [editFlowCategory, setEditFlowCategory] = useState<AutomationWorkflow['category']>('B2B Nurture');
  const [editFlowStatus, setEditFlowStatus] = useState<AutomationWorkflow['status']>('ACTIVE');

  // Load from localStorage safely after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWorkflows(parsed);
            setSelectedWorkflowId(parsed[0].id);
          }
        }
      } catch (e) {
        console.warn('Failed to parse workflows from localStorage:', e);
      }
      setIsHydrated(true);
    }
  }, []);

  // Persist to localStorage on mutation
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined' && workflows.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workflows));
      } catch (e) {
        console.warn('Failed to save workflows to localStorage:', e);
      }
    }
  }, [workflows, isHydrated]);

  // Currently active workflow object
  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0] || FLAGSHIP_WORKFLOW;

  // Query executions for current workflow
  const fetchExecutions = async (wfId: string) => {
    setIsLoadingExecutions(true);
    try {
      const res = await fetch(`/api/automation/workflows/${wfId}/executions`);
      if (res.ok) {
        const data = await res.json();
        setExecutionLogs(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedExecutionRun(data[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load executions:', e);
    } finally {
      setIsLoadingExecutions(false);
    }
  };

  // Sync executions on workflow change
  useEffect(() => {
    if (activeWorkflow?.id) {
      fetchExecutions(activeWorkflow.id);
    }
  }, [activeWorkflow?.id]);

  // Sync real-time analytics when analytics mode is active
  useEffect(() => {
    if (isAnalyticsMode && activeWorkflow?.id) {
      fetch(`/api/automation/workflows/${activeWorkflow.id}/analytics`)
        .then((r) => (r.ok ? r.json() : null))
        .then((analytics) => {
          if (analytics) {
            updateActiveWorkflow((wf) => ({
              ...wf,
              enrolledLeads: analytics.enrolledLeads || wf.enrolledLeads,
              completedLeads: analytics.completedLeads || wf.completedLeads,
              conversionRate: analytics.conversionRate || wf.conversionRate,
              revenueAttributed: analytics.revenueAttributed || wf.revenueAttributed,
            }));
          }
        })
        .catch(() => {});
    }
  }, [isAnalyticsMode, activeWorkflow?.id]);

  // Helper: mutate active workflow
  const updateActiveWorkflow = (updater: (prev: AutomationWorkflow) => AutomationWorkflow) => {
    setWorkflows((all) => all.map((w) => (w.id === activeWorkflow.id ? updater(w) : w)));
  };

  // Get nodes array for a lane
  const getLaneNodes = (wf: AutomationWorkflow, lane: LaneKey): WorkflowNode[] => {
    switch (lane) {
      case 'mainNodes': return wf.mainNodes || [];
      case 'yesNodes': return wf.yesNodes || [];
      case 'noNodes': return wf.noNodes || [];
      case 'scoreGateYes': return wf.scoreGateNodes?.yesPath || [];
      case 'scoreGateNo': return wf.scoreGateNodes?.noPath || [];
    }
  };

  // Set nodes array for a lane
  const setLaneNodes = (wf: AutomationWorkflow, lane: LaneKey, newNodes: WorkflowNode[]): AutomationWorkflow => {
    switch (lane) {
      case 'mainNodes': return { ...wf, mainNodes: newNodes };
      case 'yesNodes': return { ...wf, yesNodes: newNodes };
      case 'noNodes': return { ...wf, noNodes: newNodes };
      case 'scoreGateYes': return { ...wf, scoreGateNodes: { ...wf.scoreGateNodes, yesPath: newNodes } };
      case 'scoreGateNo': return { ...wf, scoreGateNodes: { ...wf.scoreGateNodes, noPath: newNodes } };
    }
  };

  // Create a default node for any NodeType
  const createDefaultNode = (type: NodeType, branch?: 'MAIN' | 'YES' | 'NO'): WorkflowNode => {
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    switch (type) {
      case 'TRIGGER':
        return {
          id,
          type: 'TRIGGER',
          title: '⚡ Custom Trigger: Event Occurred',
          subtitle: 'Fires when contact triggers form, page visit, or CRM webhook',
          config: { triggerEvent: 'FORM_SUBMITTED', triggerDetail: 'Website Demo Request' },
        };
      case 'SEND_EMAIL':
        return {
          id,
          type: 'SEND_EMAIL',
          title: '📩 Send Custom Email',
          subtitle: 'Personalized email dispatch with dynamic CRM variable interpolation',
          config: {
            emailSubject: 'Business OS Overview & Capabilities',
            optimalSendTime: true,
            smartIndustrySwap: true,
            senderName: 'Business OS Team',
            senderEmail: 'hello@businessos.io',
          },
        };
      case 'DELAY':
        return {
          id,
          type: 'DELAY',
          title: '⏱️ Wait / Delay (24 Hours)',
          subtitle: 'Strategic pause to observe engagement telemetry',
          config: { delayDuration: 24, delayUnit: 'HOURS' },
        };
      case 'CONDITION':
        return {
          id,
          type: 'CONDITION',
          title: '🔀 Decision: If / Else Branch',
          subtitle: 'Evaluates if contact opened email, clicked link, or visited page',
          config: {
            conditionType: 'CLICKED_LINK',
            yesBranchLabel: 'YES (Clicked Link)',
            noBranchLabel: 'NO (Did Not Click)',
          },
        };
      case 'UPDATE_LEAD_SCORE':
        return {
          id,
          type: 'UPDATE_LEAD_SCORE',
          title: '📈 +10 Lead Score Applied',
          subtitle: 'Adjusts buyer intent score in universal CRM profile',
          config: { scoreChange: 10, scoreReason: 'Engaged with campaign content' },
        };
      case 'ADD_TAG':
        return {
          id,
          type: 'ADD_TAG',
          title: '🏷️ Add Tag: "Hot Lead"',
          subtitle: 'Labels contact profile in CRM',
          config: { tag: 'Hot Lead' },
        };
      case 'REMOVE_TAG':
        return {
          id,
          type: 'REMOVE_TAG',
          title: '🏷️ Remove Tag: "Unengaged"',
          subtitle: 'Strips inactive label from CRM contact',
          config: { tag: 'Unengaged' },
        };
      case 'ADD_TO_LIST':
        return {
          id,
          type: 'ADD_TO_LIST',
          title: '📋 Add to "VIP Pipeline" List',
          subtitle: 'Enrolls prospect into high-value marketing list',
          config: { listName: 'VIP Pipeline' },
        };
      case 'REMOVE_FROM_LIST':
        return {
          id,
          type: 'REMOVE_FROM_LIST',
          title: '📋 Remove from "Cold Nurture" List',
          subtitle: 'Removes prospect from general marketing blast',
          config: { listName: 'Cold Nurture' },
        };
      case 'NOTIFY_SALES':
        return {
          id,
          type: 'NOTIFY_SALES',
          title: '📞 Notify Sales: Account Executive Alert',
          subtitle: 'Pushes priority Slack notification and WebRTC softphone battlecard',
          config: { assignedRep: 'Account Executive', notificationChannel: 'SLACK' },
        };
      case 'CREATE_CRM_TASK':
        return {
          id,
          type: 'CREATE_CRM_TASK',
          title: '✅ Create CRM Task: Call Prospect',
          subtitle: 'Auto-schedules high priority task in universal CRM taskboard',
          config: { taskTitle: 'Schedule 15-min Architecture Review', taskPriority: 'HIGH', taskDueIn: 'Within 24 Hours' },
        };
      case 'UPDATE_CONTACT':
        return {
          id,
          type: 'UPDATE_CONTACT',
          title: '👤 Update CRM Contact Field',
          subtitle: 'Advances lifecycle stage to Sales Qualified Lead',
          config: { contactField: 'lifecycleStage', contactValue: 'Sales Qualified Lead' },
        };
      case 'WEBHOOK':
        return {
          id,
          type: 'WEBHOOK',
          title: '🌐 Outbound Webhook Dispatch',
          subtitle: 'Dispatches payload to external endpoint or Zapier/Make',
          config: { webhookUrl: 'https://api.external-crm.com/v1/event', webhookMethod: 'POST' },
        };
      case 'EXIT_WORKFLOW':
        return {
          id,
          type: 'EXIT_WORKFLOW',
          title: '🏁 Goal Achieved: Exit Sequence',
          subtitle: 'Account converted or booked demo; exits marketing sequence',
          config: { goalType: 'CONVERTED' },
        };
      case 'MOVE_TO_WORKFLOW':
        return {
          id,
          type: 'MOVE_TO_WORKFLOW',
          title: '🔀 Move to Workflow',
          subtitle: 'Transfers enrolled contact into another automation sequence',
          config: { targetWorkflowId: 'wf_cart_recovery' },
        };
    }
  };

  // Insert node at specific index in lane
  const insertNodeAt = (lane: LaneKey, index: number, newNode: WorkflowNode) => {
    updateActiveWorkflow((wf) => {
      const current = [...getLaneNodes(wf, lane)];
      current.splice(index, 0, newNode);
      return setLaneNodes(wf, lane, current);
    });
    setQuickInsertTarget(null);
  };

  // Delete node from lane
  const deleteNode = (lane: LaneKey, nodeId: string) => {
    updateActiveWorkflow((wf) => {
      const current = getLaneNodes(wf, lane).filter((n) => n.id !== nodeId);
      return setLaneNodes(wf, lane, current);
    });
    if (selectedNode?.node.id === nodeId) {
      setIsInspectorOpen(false);
      setSelectedNode(null);
    }
  };

  // Duplicate node in lane
  const duplicateNode = (lane: LaneKey, node: WorkflowNode) => {
    const clone: WorkflowNode = {
      ...node,
      id: `node_${Date.now()}`,
      title: `${node.title} (Copy)`,
    };
    updateActiveWorkflow((wf) => {
      const current = [...getLaneNodes(wf, lane)];
      const idx = current.findIndex((n) => n.id === node.id);
      current.splice(idx + 1, 0, clone);
      return setLaneNodes(wf, lane, current);
    });
  };

  // Move node within lane
  const moveNode = (lane: LaneKey, index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    updateActiveWorkflow((wf) => {
      const current = [...getLaneNodes(wf, lane)];
      if (targetIdx < 0 || targetIdx >= current.length) return wf;
      const temp = current[index];
      current[index] = current[targetIdx];
      current[targetIdx] = temp;
      return setLaneNodes(wf, lane, current);
    });
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent, lane: LaneKey, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = activeDragItem?.action === 'CREATE_NODE' ? 'copy' : 'move';
    setDragOverTarget({ lane, index });
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent, targetLane: LaneKey, targetIndex: number) => {
    e.preventDefault();
    setDragOverTarget(null);

    if (!activeDragItem) return;

    if (activeDragItem.action === 'CREATE_NODE' && activeDragItem.nodeType) {
      const branch = targetLane === 'yesNodes' || targetLane === 'scoreGateYes' ? 'YES' : (targetLane === 'noNodes' || targetLane === 'scoreGateNo' ? 'NO' : 'MAIN');
      const newNode = createDefaultNode(activeDragItem.nodeType, branch);
      insertNodeAt(targetLane, targetIndex, newNode);
    } else if (activeDragItem.action === 'MOVE_NODE' && activeDragItem.nodeId && activeDragItem.sourceLane && activeDragItem.sourceIndex !== undefined) {
      // Moving existing node
      const { sourceLane, sourceIndex } = activeDragItem;
      updateActiveWorkflow((wf) => {
        const sourceNodes = [...getLaneNodes(wf, sourceLane)];
        const [movedNode] = sourceNodes.splice(sourceIndex, 1);
        if (!movedNode) return wf;

        let updatedWf = setLaneNodes(wf, sourceLane, sourceNodes);

        // Adjust target index if dropping in same lane after removal
        let adjustedTarget = targetIndex;
        if (sourceLane === targetLane && sourceIndex < targetIndex) {
          adjustedTarget = targetIndex - 1;
        }

        const targetNodes = [...getLaneNodes(updatedWf, targetLane)];
        // Update branch tag on node
        movedNode.branch = targetLane === 'yesNodes' || targetLane === 'scoreGateYes' ? 'YES' : (targetLane === 'noNodes' || targetLane === 'scoreGateNo' ? 'NO' : 'MAIN');
        targetNodes.splice(adjustedTarget, 0, movedNode);
        return setLaneNodes(updatedWf, targetLane, targetNodes);
      });
    }

    setActiveDragItem(null);
  };

  // Create new workflow from templates
  const handleCreateNewWorkflow = () => {
    let newWf: AutomationWorkflow;
    const wfId = `wf_${Date.now()}`;
    const name = newWorkflowName.trim() || 'New Custom Workflow';
    const description = newWorkflowDescription.trim() || 'Custom enterprise automation sequence.';
    const category = newWorkflowCategory;

    if (newWorkflowTemplate === 'blank') {
      newWf = {
        id: wfId,
        name,
        description,
        category,
        status: 'ACTIVE',
        enrolledLeads: 0,
        completedLeads: 0,
        conversionRate: '0.0%',
        revenueAttributed: '$0',
        mainNodes: [createDefaultNode('TRIGGER')],
        yesNodes: [],
        noNodes: [],
        scoreGateNodes: { yesPath: [], noPath: [] },
      };
    } else if (newWorkflowTemplate === 'saas_onboarding') {
      newWf = {
        id: wfId,
        name,
        description,
        category,
        status: 'ACTIVE',
        enrolledLeads: 0,
        completedLeads: 0,
        conversionRate: '0.0%',
        revenueAttributed: '$0',
        mainNodes: [
          {
            id: `node_${Date.now()}_1`,
            type: 'TRIGGER',
            title: '1. Trigger: New User Signup (/register)',
            subtitle: 'Fired when user verifies email and creates team workspace.',
            config: { triggerEvent: 'CONTACT_CREATED', triggerDetail: 'Platform Signup' },
          },
          {
            id: `node_${Date.now()}_2`,
            type: 'SEND_EMAIL',
            title: '2. Email 1: Welcome to Business OS (Setup Guide)',
            subtitle: 'Includes 3-minute quickstart checklist and dynamic team invite button.',
            config: { emailSubject: 'Welcome to Business OS - Let’s get your team started', optimalSendTime: true },
          },
          {
            id: `node_${Date.now()}_3`,
            type: 'DELAY',
            title: '3. Wait 24 Hours',
            subtitle: 'Allows user time to test features.',
            config: { delayDuration: 24, delayUnit: 'HOURS' },
          },
          {
            id: `node_${Date.now()}_4`,
            type: 'CONDITION',
            title: '4. Decision: Did user invite team member?',
            subtitle: 'Evaluates workspace activation telemetry event.',
            config: { conditionType: 'TAG_EXISTS', tag: 'Team Invited', yesBranchLabel: 'YES (Team Active)', noBranchLabel: 'NO (Solo User)' },
          },
        ],
        yesNodes: [
          {
            id: `node_${Date.now()}_5`,
            type: 'UPDATE_LEAD_SCORE',
            branch: 'YES',
            title: '+25 Lead Score (High Expansion Probability)',
            subtitle: 'Multiplier applied for multi-user collaboration.',
            config: { scoreChange: 25 },
          },
          {
            id: `node_${Date.now()}_6`,
            type: 'SEND_EMAIL',
            branch: 'YES',
            title: 'Email 2A: Enterprise Security & Permissions',
            subtitle: 'Highlights SOC2 compliance, role-based access, and audit trails.',
            config: { emailSubject: 'Enterprise Security & Governance with Business OS' },
          },
        ],
        noNodes: [
          {
            id: `node_${Date.now()}_7`,
            type: 'SEND_EMAIL',
            branch: 'NO',
            title: 'Email 2B: Need help setting up your workflow?',
            subtitle: 'Offers complimentary 1-on-1 concierge onboarding call.',
            config: { emailSubject: 'Need a hand setting up your Business OS workspace?' },
          },
          {
            id: `node_${Date.now()}_8`,
            type: 'DELAY',
            branch: 'NO',
            title: 'Wait 3 Days',
            subtitle: 'Gentle spacing before next check-in.',
            config: { delayDuration: 3, delayUnit: 'DAYS' },
          },
        ],
        scoreGateNodes: {
          yesPath: [
            {
              id: `node_${Date.now()}_9`,
              type: 'NOTIFY_SALES',
              branch: 'YES',
              title: 'Notify Senior AE: Enterprise Expansion Opportunity',
              subtitle: 'Lead has invited team members and is ready for custom contract.',
              config: { assignedRep: 'Enterprise Account Executive', notificationChannel: 'SLACK' },
            },
            {
              id: `node_${Date.now()}_10`,
              type: 'CREATE_CRM_TASK',
              branch: 'YES',
              title: 'Create Task: Book 15-Min Executive Demo',
              subtitle: 'High-intent multi-seat trial conversion.',
              config: { taskTitle: 'Schedule 15-min Expansion Demo', taskPriority: 'HIGH' },
            },
          ],
          noPath: [
            {
              id: `node_${Date.now()}_11`,
              type: 'ADD_TO_LIST',
              branch: 'NO',
              title: 'Add to "Self-Serve Nurture" List',
              subtitle: 'Enrolls in weekly product tips and updates.',
              config: { listName: 'Self-Serve Nurture' },
            },
          ],
        },
      };
    } else {
      // Default to Flagship clone
      newWf = {
        ...FLAGSHIP_WORKFLOW,
        id: wfId,
        name,
        description,
        category,
        status: 'ACTIVE',
        enrolledLeads: 0,
        completedLeads: 0,
        conversionRate: '0.0%',
        revenueAttributed: '$0',
      };
    }

    setWorkflows([newWf, ...workflows]);
    setSelectedWorkflowId(newWf.id);
    setIsNewWorkflowModalOpen(false);
    setNewWorkflowName('');
    setNewWorkflowDescription('');
  };

  // Duplicate workflow
  const handleDuplicateCurrentWorkflow = () => {
    const clone: AutomationWorkflow = {
      ...activeWorkflow,
      id: `wf_dup_${Date.now()}`,
      name: `${activeWorkflow.name} (Copy)`,
    };
    setWorkflows([clone, ...workflows]);
    setSelectedWorkflowId(clone.id);
  };

  // Delete workflow
  const handleDeleteCurrentWorkflow = () => {
    if (workflows.length <= 1) {
      alert('You must have at least one workflow.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${activeWorkflow.name}"?`)) {
      const remaining = workflows.filter((w) => w.id !== activeWorkflow.id);
      setWorkflows(remaining);
      setSelectedWorkflowId(remaining[0].id);
    }
  };

  // Toggle active/paused with backend synchronization
  const handleToggleStatus = async () => {
    const nextStatus = activeWorkflow.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    updateActiveWorkflow((wf) => ({
      ...wf,
      status: nextStatus,
    }));
    try {
      await fetch(`/api/automation/workflows/${activeWorkflow.id}/${nextStatus === 'ACTIVE' ? 'resume' : 'pause'}`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Backend pause/resume sync warning:', err);
    }
  };

  // Export current workflow as JSON
  const handleExportWorkflow = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeWorkflow, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeWorkflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import workflow from JSON
  const handleImportWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.name && Array.isArray(imported.mainNodes)) {
          const newWf: AutomationWorkflow = {
            ...imported,
            id: `wf_imp_${Date.now()}`,
            name: `${imported.name} (Imported)`,
          };
          setWorkflows([newWf, ...workflows]);
          setSelectedWorkflowId(newWf.id);
          alert(`Successfully imported "${newWf.name}"!`);
        } else {
          alert('Invalid workflow JSON structure: missing name or mainNodes');
        }
      } catch (err) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to Factory Defaults
  const handleResetToDefaults = () => {
    if (confirm('Reset all automation workflows to original factory presets? Your custom workflows will be replaced.')) {
      setWorkflows(PRESET_WORKFLOWS);
      setSelectedWorkflowId(FLAGSHIP_WORKFLOW.id);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  };

  // Run simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationLog([`🏁 Initializing AI Decision Tree simulation with persona: ${simulationPersona}...`]);

    const isClicked = simulationPersona !== 'Marcus (Unresponsive)';
    const industry = simulationPersona === 'Dr. Gregory (Healthcare)' ? 'Healthcare' : 'Enterprise SaaS';
    const name = simulationPersona === 'Dr. Gregory (Healthcare)' ? 'Dr. Gregory House' : (simulationPersona === 'Marcus (Unresponsive)' ? 'Marcus Schmidt' : 'Elena Rostova');
    const role = simulationPersona === 'Dr. Gregory (Healthcare)' ? 'Chief of Medicine' : (simulationPersona === 'Marcus (Unresponsive)' ? 'VP of Operations' : 'CEO');
    const company = simulationPersona === 'Dr. Gregory (Healthcare)' ? 'Memorial Hospital' : (simulationPersona === 'Marcus (Unresponsive)' ? 'Bavaria Cloud' : 'Hyperion Technologies');
    const email = simulationPersona === 'Dr. Gregory (Healthcare)' ? 'gregory.house@memorial.org' : (simulationPersona === 'Marcus (Unresponsive)' ? 'm.schmidt@bavaria.de' : 'elena.rostova@hyperion.io');

    setTimeout(() => {
      setSimulationLog((prev) => [
        ...prev,
        `📍 Step 1 [Trigger]: Form capture event detected for "${name} (${role}, ${company})". Anonymous telemetry bound to CRM.`,
      ]);
    }, 500);

    setTimeout(async () => {
      setSimulationLog((prev) => [
        ...prev,
        `✉️ Step 2 [Email 1]: Synthesizing personalized briefing with Groq Turbo. Case study injected for "${industry}". Optimal Send Time: Tuesday at 10:15 AM EST.`,
      ]);

      try {
        const res = await fetch('/api/automation/workflows/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflowId: activeWorkflow.id,
            lead: {
              firstName: name.split(' ')[0],
              lastName: name.split(' ')[1] || '',
              email,
              company,
              jobTitle: role,
              industry,
              leadScore: isClicked ? 45 : 30,
              clickedEmail: isClicked,
            },
          }),
        });

        const data = await res.json();
        const emailAction = data?.results?.find((r: any) => r.actionType === 'SEND_EMAIL');
        if (emailAction) {
          setLiveGeneratedEmail({
            subject: emailAction.subject,
            body: emailAction.preview,
            to: emailAction.to,
            activityId: emailAction.activityId,
          });
        }
      } catch (err: any) {
        // simulation fallback
      }

      setTimeout(() => {
        setSimulationLog((prev) => [
          ...prev,
          '⏱️ Step 3 [Delay Gate]: 24h wait window elapsed. Evaluating link click telemetry...',
        ]);
      }, 1000);

      setTimeout(() => {
        if (isClicked) {
          setSimulationLog((prev) => [
            ...prev,
            '🔀 Step 4 [Branch Decision]: Click detected! Following [YES: Hot Leads] branch.',
            '⭐ Step 5 [Action]: Added to "Hot Leads List" • Added +10 Lead Score (New Total: 55 pts).',
            '📞 Step 6 [Score Gate]: Score 55 >= 50! Dispatched Sales Alert & Created CRM Task!',
            '✅ Simulation Completed successfully with live CRM Activity sync.',
          ]);
        } else {
          setSimulationLog((prev) => [
            ...prev,
            '🔀 Step 4 [Branch Decision]: 0 clicks detected. Following [NO: Alternative Value] branch.',
            '🏷️ Step 5 [Action]: Removed from Hot Leads • 5-day delay scheduled.',
            '📩 Step 6 [Ongoing Nurture]: Scheduled Email 2B (Lightweight question).',
            '✅ Simulation Completed.',
          ]);
        }
        fetchExecutions(activeWorkflow.id);
        setIsSimulating(false);
      }, 2000);
    }, 1000);
  };

  // Node Color Helper
  const getNodeColor = (type: NodeType, branch?: 'MAIN' | 'YES' | 'NO') => {
    if (branch === 'YES') {
      return {
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        border: 'border-emerald-500/50 hover:border-emerald-400',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        bg: 'from-emerald-950/40 via-slate-900/90 to-slate-950/95',
        icon: 'text-emerald-400',
      };
    }
    if (branch === 'NO') {
      return {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        border: 'border-amber-500/40 hover:border-amber-300',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
        bg: 'from-amber-950/30 via-slate-900/90 to-slate-950/95',
        icon: 'text-amber-400',
      };
    }

    switch (type) {
      case 'TRIGGER':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          border: 'border-cyan-500/40 hover:border-cyan-300',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
          bg: 'from-cyan-950/40 via-slate-900/90 to-slate-950/95',
          icon: 'text-cyan-400',
        };
      case 'SEND_EMAIL':
        return {
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          border: 'border-indigo-500/40 hover:border-indigo-300',
          glow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]',
          bg: 'from-indigo-950/40 via-slate-900/90 to-slate-950/95',
          icon: 'text-indigo-400',
        };
      case 'DELAY':
        return {
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          border: 'border-slate-600/40 hover:border-slate-400',
          glow: 'shadow-sm',
          bg: 'from-slate-900/90 via-slate-900/90 to-slate-950/95',
          icon: 'text-slate-400',
        };
      case 'CONDITION':
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          border: 'border-purple-500/40 hover:border-purple-300',
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
          bg: 'from-purple-950/40 via-slate-900/90 to-slate-950/95',
          icon: 'text-purple-400',
        };
      case 'UPDATE_LEAD_SCORE':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          border: 'border-emerald-500/40 hover:border-emerald-300',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
          bg: 'from-emerald-950/40 via-slate-900/90 to-slate-950/95',
          icon: 'text-emerald-400',
        };
      default:
        return {
          badge: 'bg-white/10 text-slate-300 border-white/15',
          border: 'border-white/10 hover:border-white/20',
          glow: 'shadow-sm',
          bg: 'from-slate-900/80 via-slate-900/90 to-slate-950/95',
          icon: 'text-slate-400',
        };
    }
  };

  // Render an Interactive Drop Target Zone
  const renderDropZone = (lane: LaneKey, index: number) => {
    const isTarget = dragOverTarget?.lane === lane && dragOverTarget?.index === index;
    const isQuickOpen = quickInsertTarget?.lane === lane && quickInsertTarget?.index === index;
    const isDragActive = activeDragItem !== null;

    return (
      <div
        onDragOver={(e) => handleDragOver(e, lane, index)}
        onDragLeave={() => setDragOverTarget(null)}
        onDrop={(e) => handleDrop(e, lane, index)}
        className="relative py-1 flex items-center justify-center group/drop"
      >
        <div
          className={`w-full transition-all duration-200 rounded-xl flex items-center justify-center gap-2 ${
            isTarget
              ? 'h-12 bg-emerald-500/25 border-2 border-dashed border-emerald-400 text-emerald-200 font-bold text-xs scale-[1.02] shadow-lg shadow-emerald-500/20'
              : isDragActive
              ? 'h-8 bg-emerald-500/10 border border-dashed border-emerald-500/40 text-emerald-300 text-[11px] font-bold animate-pulse'
              : 'h-3 hover:h-6 hover:bg-white/[0.04] border border-transparent hover:border-white/10'
          }`}
        >
          {isTarget ? (
            <span className="flex items-center gap-1.5 animate-bounce">
              <Plus size={15} /> Drop Step Here
            </span>
          ) : isDragActive ? (
            <span className="flex items-center gap-1 opacity-70">
              <Plus size={11} /> Drop Zone
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setQuickInsertTarget(isQuickOpen ? null : { lane, index })}
              className="opacity-0 group-hover/drop:opacity-100 p-1 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg"
              title="Click to insert step here"
            >
              <Plus size={12} />
            </button>
          )}
        </div>

        {/* Quick Insert Popover */}
        {isQuickOpen && (
          <div className="absolute top-8 z-50 p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-white space-y-2 w-72 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Insert Step Here</span>
              <button
                type="button"
                onClick={() => setQuickInsertTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {[
                { type: 'SEND_EMAIL' as const, label: 'Send Email' },
                { type: 'DELAY' as const, label: 'Wait / Delay' },
                { type: 'CONDITION' as const, label: 'Condition' },
                { type: 'UPDATE_LEAD_SCORE' as const, label: 'Lead Score' },
                { type: 'ADD_TAG' as const, label: 'Add Tag' },
                { type: 'ADD_TO_LIST' as const, label: 'Add to List' },
                { type: 'NOTIFY_SALES' as const, label: 'Notify Sales' },
                { type: 'CREATE_CRM_TASK' as const, label: 'CRM Task' },
                { type: 'WEBHOOK' as const, label: 'Webhook' },
                { type: 'EXIT_WORKFLOW' as const, label: 'Exit Flow' },
                { type: 'MOVE_TO_WORKFLOW' as const, label: 'Move Flow' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    const branch = lane === 'yesNodes' || lane === 'scoreGateYes' ? 'YES' : (lane === 'noNodes' || lane === 'scoreGateNo' ? 'NO' : 'MAIN');
                    insertNodeAt(lane, index, createDefaultNode(item.type, branch));
                  }}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-[10px] font-bold text-slate-200 hover:text-emerald-300 text-left cursor-pointer transition-colors truncate"
                >
                  + {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render a Single Draggable Node Card
  const renderNodeCard = (node: WorkflowNode, lane: LaneKey, index: number) => {
    const style = getNodeColor(node.type, node.branch);
    const isBeingDragged = activeDragItem?.nodeId === node.id;

    return (
      <div
        key={node.id}
        draggable
        onDragStart={(e) => {
          setActiveDragItem({
            action: 'MOVE_NODE',
            nodeId: node.id,
            sourceLane: lane,
            sourceIndex: index,
          });
          e.dataTransfer.setData('text/plain', node.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => {
          setActiveDragItem(null);
          setDragOverTarget(null);
        }}
        onClick={() => {
          setSelectedNode({ node, lane });
          setIsInspectorOpen(true);
        }}
        className={`group relative p-4 rounded-2xl bg-gradient-to-b ${style.bg} border ${style.border} ${style.glow} transition-all duration-200 cursor-pointer hover:scale-[1.01] space-y-2 ${
          isBeingDragged ? 'opacity-30 border-dashed scale-95 border-emerald-400' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <div
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 hover:text-slate-300 rounded"
              title="Drag to reorder anywhere"
            >
              <GripVertical size={14} />
            </div>

            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${style.badge}`}>
              {node.branch ? `${node.branch} • ` : ''}{node.type.replace('_', ' ')}
            </span>
            {node.config?.optimalSendTime && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles size={9} /> AI Send Time
              </span>
            )}
            {node.config?.smartIndustrySwap && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Industry Swap
              </span>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                moveNode(lane, index, 'up');
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Move Up"
            >
              <MoveUp size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                moveNode(lane, index, 'down');
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Move Down"
            >
              <MoveDown size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                duplicateNode(lane, node);
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Duplicate Step"
            >
              <Copy size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(lane, node.id);
              }}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              title="Delete Step"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
            {node.title}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
            {node.subtitle}
          </p>
        </div>

        {/* Dynamic Context Pills */}
        {node.config?.emailSubject && (
          <div className="pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[10px]">
            <span className="text-slate-400 truncate max-w-[240px]">Subject: &quot;{node.config.emailSubject}&quot;</span>
            {onOpenEmailDesigner && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEmailDesigner(node.config?.emailSubject, node.id, node.title);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer"
                  title="Design with visual newsletter editor"
                >
                  <span>Design</span>
                  <ExternalLink size={10} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBridgeTransfer({
                      source: 'automations',
                      targetTab: 'automations',
                      workflowNodeId: node.id,
                      workflowNodeTitle: node.title,
                      subject: node.config?.emailSubject || '',
                      preheader: '',
                      timestamp: Date.now(),
                    });
                    window.location.href = `/platform/templates/email?from=automations&nodeId=${encodeURIComponent(node.id)}&nodeTitle=${encodeURIComponent(node.title)}`;
                  }}
                  className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-0.5 cursor-pointer"
                  title="Open in Visual Template Studio (Pro Blocks)"
                >
                  <Palette size={10} />
                  <span>Studio</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Mode Data Badge */}
        {isAnalyticsMode && node.analytics && (
          <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-4 gap-1 text-center text-[10px] font-mono bg-black/20 p-2 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[8px] uppercase">Sent</span>
              <span className="font-bold text-white">{node.analytics.sentCount}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px] uppercase">Opens</span>
              <span className="font-bold text-emerald-400">{node.analytics.openRatePct}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px] uppercase">Clicks</span>
              <span className="font-bold text-emerald-400">{node.analytics.clickRatePct}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px] uppercase">Dropoff</span>
              <span className="font-bold text-slate-400">{node.analytics.dropoffPct}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Workflow Switcher & Management Bar */}
      <div className="p-4 rounded-3xl bg-slate-950/80 border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-md">
            <GitBranch size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Active Automation Flow:
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                {activeWorkflow.category}
              </span>
            </div>

            {/* Workflow Picker Dropdown */}
            <select
              value={selectedWorkflowId}
              onChange={(e) => setSelectedWorkflowId(e.target.value)}
              className="bg-transparent text-sm font-extrabold text-white focus:outline-none cursor-pointer mt-0.5 max-w-sm truncate"
            >
              {workflows.map((wf) => (
                <option key={wf.id} value={wf.id} className="bg-slate-900 text-white">
                  {wf.name} ({wf.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workflow Manager Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsNewWorkflowModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus size={14} />
            <span>+ Create New Flow</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditFlowName(activeWorkflow.name);
              setEditFlowDescription(activeWorkflow.description);
              setEditFlowCategory(activeWorkflow.category);
              setEditFlowStatus(activeWorkflow.status);
              setIsFlowSettingsOpen(true);
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Edit flow title & settings"
          >
            <Settings2 size={13} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicateCurrentWorkflow}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Duplicate current workflow"
          >
            <Copy size={13} />
            <span>Duplicate</span>
          </button>

          <button
            type="button"
            onClick={handleExportWorkflow}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 cursor-pointer"
            title="Export Flow as JSON"
          >
            <Download size={14} />
          </button>

          <label
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 cursor-pointer"
            title="Import Flow from JSON"
          >
            <input type="file" accept=".json" onChange={handleImportWorkflow} className="hidden" />
            <Upload size={14} />
          </label>

          <button
            type="button"
            onClick={handleToggleStatus}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              activeWorkflow.status === 'ACTIVE'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeWorkflow.status === 'ACTIVE' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{activeWorkflow.status === 'ACTIVE' ? 'Active' : 'Paused'}</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteCurrentWorkflow}
            disabled={workflows.length <= 1}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-30"
            title="Delete Flow"
          >
            <Trash2 size={15} />
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
            title="Reset to Factory Defaults"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Draggable Node Inserter Palette Bar */}
      <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/[0.08] shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles size={12} />
              Draggable Node Palette (14 Enterprise Types)
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Drag any node directly onto the canvas, or click to quick-append
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
          >
            {isPaletteOpen ? 'Collapse Palette' : 'Expand Palette'}
          </button>
        </div>

        {isPaletteOpen && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pr-2">
            {[
              { type: 'TRIGGER' as const, label: 'Trigger Event', icon: Zap, color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' },
              { type: 'SEND_EMAIL' as const, label: 'Send Email', icon: Mail, color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10' },
              { type: 'DELAY' as const, label: 'Wait / Delay', icon: Clock, color: 'border-slate-500/40 text-slate-300 bg-slate-500/10' },
              { type: 'CONDITION' as const, label: 'If / Else Branch', icon: Split, color: 'border-purple-500/40 text-purple-300 bg-purple-500/10' },
              { type: 'UPDATE_LEAD_SCORE' as const, label: 'Lead Score (+/-)', icon: Flame, color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
              { type: 'ADD_TAG' as const, label: 'Add Tag', icon: Tag, color: 'border-teal-500/40 text-teal-300 bg-teal-500/10' },
              { type: 'REMOVE_TAG' as const, label: 'Remove Tag', icon: Tag, color: 'border-rose-500/40 text-rose-300 bg-rose-500/10' },
              { type: 'ADD_TO_LIST' as const, label: 'Add to List', icon: ListOrdered, color: 'border-blue-500/40 text-blue-300 bg-blue-500/10' },
              { type: 'REMOVE_FROM_LIST' as const, label: 'Remove List', icon: ListOrdered, color: 'border-slate-500/40 text-slate-300 bg-slate-500/10' },
              { type: 'NOTIFY_SALES' as const, label: 'Notify Sales Rep', icon: PhoneCall, color: 'border-purple-500/40 text-purple-300 bg-purple-500/10' },
              { type: 'CREATE_CRM_TASK' as const, label: 'Create CRM Task', icon: CheckSquare, color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
              { type: 'UPDATE_CONTACT' as const, label: 'Update Contact', icon: UserPlus, color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' },
              { type: 'WEBHOOK' as const, label: 'Webhook', icon: Send, color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10' },
              { type: 'EXIT_WORKFLOW' as const, label: 'Exit / Goal', icon: Award, color: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
              { type: 'MOVE_TO_WORKFLOW' as const, label: 'Move Flow', icon: ArrowRight, color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => {
                    setActiveDragItem({ action: 'CREATE_NODE', nodeType: item.type });
                    e.dataTransfer.setData('text/plain', item.type);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onDragEnd={() => {
                    setActiveDragItem(null);
                    setDragOverTarget(null);
                  }}
                  onClick={() => setPaletteActionNode({ type: item.type, label: item.label })}
                  className={`px-3 py-2 rounded-xl border ${item.color} flex items-center gap-1.5 shrink-0 cursor-grab active:cursor-grabbing hover:scale-105 transition-all text-xs font-bold shadow-sm select-none`}
                  title="Drag onto canvas or click to add"
                >
                  <GripVertical size={11} className="opacity-50" />
                  <Icon size={13} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Click-to-Add Destination Menu */}
        {paletteActionNode && (
          <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3 animate-in fade-in">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Add <strong>{paletteActionNode.label}</strong> to:</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  insertNodeAt('mainNodes', activeWorkflow.mainNodes.length, createDefaultNode(paletteActionNode.type));
                  setPaletteActionNode(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 text-xs font-bold cursor-pointer"
              >
                + Main Flow (End)
              </button>
              <button
                type="button"
                onClick={() => {
                  insertNodeAt('mainNodes', 0, createDefaultNode(paletteActionNode.type));
                  setPaletteActionNode(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 text-xs font-bold cursor-pointer"
              >
                + Main Flow (Top)
              </button>
              <button
                type="button"
                onClick={() => {
                  insertNodeAt('yesNodes', activeWorkflow.yesNodes?.length || 0, createDefaultNode(paletteActionNode.type, 'YES'));
                  setPaletteActionNode(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold cursor-pointer"
              >
                + YES Branch
              </button>
              <button
                type="button"
                onClick={() => {
                  insertNodeAt('noNodes', activeWorkflow.noNodes?.length || 0, createDefaultNode(paletteActionNode.type, 'NO'));
                  setPaletteActionNode(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold cursor-pointer"
              >
                + NO Branch
              </button>
              <button
                type="button"
                onClick={() => setPaletteActionNode(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Top Bar with Telemetry Toggle & Simulator */}
      <div className="p-4 rounded-3xl bg-slate-950/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAnalyticsMode(!isAnalyticsMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isAnalyticsMode
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-md'
                : 'bg-white/[0.06] border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>{isAnalyticsMode ? 'Hide Telemetry Overlay' : 'View Telemetry Analytics'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsExecutionLogsOpen(true);
              fetchExecutions(activeWorkflow.id);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isExecutionLogsOpen
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md'
                : 'bg-white/[0.06] border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Inspect real-time execution audit logs, SHA-256 duplicate guards & CRM state"
          >
            <FileText size={14} className="text-emerald-400" />
            <span>Execution Audit Logs</span>
            {executionLogs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] font-mono font-bold text-emerald-300">
                {executionLogs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAiArchitectOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>✨ AI Sequence Architect</span>
          </button>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            <Users size={13} className="text-slate-400 ml-1.5" />
            <select
              value={simulationPersona}
              onChange={(e) => setSimulationPersona(e.target.value as any)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-2"
            >
              <option value="Elena (CEO, SaaS)" className="bg-slate-900 text-white">Elena (CEO, SaaS - High Intent)</option>
              <option value="Dr. Gregory (Healthcare)" className="bg-slate-900 text-white">Dr. Gregory (Healthcare)</option>
              <option value="Marcus (Unresponsive)" className="bg-slate-900 text-white">Marcus (Unresponsive)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            <Play size={14} />
            <span>{isSimulating ? 'Tracing Flow...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Decision Tree Canvas & Simulation Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="luxe-box rounded-3xl p-6 space-y-4 bg-slate-950/60 border border-white/[0.08]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitBranch className="text-emerald-400" size={17} />
                  <span>Interactive Drag &amp; Drop Canvas</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Drag cards to reorder, drag from top palette to insert, or click &quot;+&quot; between steps.
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {activeWorkflow.mainNodes.length + (activeWorkflow.yesNodes?.length || 0) + (activeWorkflow.noNodes?.length || 0)} Total Steps
              </span>
            </div>

            {/* Lane 1: Main Trunk */}
            <div className="space-y-1 max-w-2xl mx-auto">
              {renderDropZone('mainNodes', 0)}

              {activeWorkflow.mainNodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  {renderNodeCard(node, 'mainNodes', idx)}
                  {renderDropZone('mainNodes', idx + 1)}
                </React.Fragment>
              ))}

              {activeWorkflow.mainNodes.length === 0 && (
                <div className="py-12 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-slate-400">This flow is empty. Drag a node from the palette above to start.</p>
                </div>
              )}

              {/* Branch Decision Splitter Section */}
              {(activeWorkflow.yesNodes?.length > 0 || activeWorkflow.noNodes?.length > 0) ? (
                <div className="space-y-2 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md">
                      <Split size={12} />
                      <span>IF / ELSE DECISION FORK</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Clear both branches? Steps inside will be deleted.')) {
                          updateActiveWorkflow((wf) => ({ ...wf, yesNodes: [], noNodes: [] }));
                        }
                      }}
                      className="text-[10px] text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      Remove Branches
                    </button>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-4">
                    <div className="h-0.5 bg-emerald-500/40" />
                    <div className="h-0.5 bg-amber-500/40" />
                  </div>

                  {/* Side-by-Side Branch Lanes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* YES Lane */}
                    <div className="space-y-1 p-3.5 rounded-3xl bg-emerald-950/20 border border-emerald-500/30">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                        <span className="text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          YES BRANCH (HOT LEADS)
                        </span>
                        <button
                          type="button"
                          onClick={() => insertNodeAt('yesNodes', activeWorkflow.yesNodes.length, createDefaultNode('SEND_EMAIL', 'YES'))}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                          + Add Step
                        </button>
                      </div>

                      {renderDropZone('yesNodes', 0)}
                      {activeWorkflow.yesNodes.map((node, idx) => (
                        <React.Fragment key={node.id}>
                          {renderNodeCard(node, 'yesNodes', idx)}
                          {renderDropZone('yesNodes', idx + 1)}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* NO Lane */}
                    <div className="space-y-1 p-3.5 rounded-3xl bg-amber-950/20 border border-amber-500/30">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                        <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                          <Clock size={12} className="text-amber-400" />
                          NO BRANCH (ALTERNATIVE NURTURE)
                        </span>
                        <button
                          type="button"
                          onClick={() => insertNodeAt('noNodes', activeWorkflow.noNodes.length, createDefaultNode('SEND_EMAIL', 'NO'))}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          + Add Step
                        </button>
                      </div>

                      {renderDropZone('noNodes', 0)}
                      {activeWorkflow.noNodes.map((node, idx) => (
                        <React.Fragment key={node.id}>
                          {renderNodeCard(node, 'noNodes', idx)}
                          {renderDropZone('noNodes', idx + 1)}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      updateActiveWorkflow((wf) => ({
                        ...wf,
                        yesNodes: [createDefaultNode('UPDATE_LEAD_SCORE', 'YES')],
                        noNodes: [createDefaultNode('DELAY', 'NO')],
                      }));
                    }}
                    className="px-4 py-2 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-lg"
                  >
                    <Split size={14} />
                    <span>+ Add Decision Branch (YES / NO Lanes)</span>
                  </button>
                </div>
              )}

              {/* Lead Scoring Gate */}
              {activeWorkflow.scoreGateNodes && (activeWorkflow.scoreGateNodes.yesPath.length > 0 || activeWorkflow.scoreGateNodes.noPath.length > 0) ? (
                <>
                  <div className="pt-5 pb-1 flex flex-col items-center">
                    <div className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md">
                      <ShieldCheck size={12} />
                      <span>LEAD SCORE QUALIFICATION GATE (Score &gt;= 50?)</span>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-4 mt-2">
                      <div className="h-0.5 bg-rose-500/40" />
                      <div className="h-0.5 bg-cyan-500/40" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Score >= 50 */}
                    <div className="space-y-1 p-3.5 rounded-3xl bg-rose-950/20 border border-rose-500/30">
                      <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
                        <span className="text-[10px] font-mono font-bold text-rose-300 flex items-center gap-1">
                          <Flame size={12} className="text-rose-400" />
                          SCORE &gt;= 50: MQL QUALIFIED
                        </span>
                        <button
                          type="button"
                          onClick={() => insertNodeAt('scoreGateYes', activeWorkflow.scoreGateNodes.yesPath.length, createDefaultNode('NOTIFY_SALES', 'YES'))}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          + Add Step
                        </button>
                      </div>

                      {renderDropZone('scoreGateYes', 0)}
                      {activeWorkflow.scoreGateNodes.yesPath.map((node, idx) => (
                        <React.Fragment key={node.id}>
                          {renderNodeCard(node, 'scoreGateYes', idx)}
                          {renderDropZone('scoreGateYes', idx + 1)}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Score < 50 */}
                    <div className="space-y-1 p-3.5 rounded-3xl bg-cyan-950/20 border border-cyan-500/30">
                      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                        <span className="text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1">
                          <Layers size={12} className="text-cyan-400" />
                          SCORE &lt; 50: ONGOING NURTURE
                        </span>
                        <button
                          type="button"
                          onClick={() => insertNodeAt('scoreGateNo', activeWorkflow.scoreGateNodes.noPath.length, createDefaultNode('SEND_EMAIL', 'NO'))}
                          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                        >
                          + Add Step
                        </button>
                      </div>

                      {renderDropZone('scoreGateNo', 0)}
                      {activeWorkflow.scoreGateNodes.noPath.map((node, idx) => (
                        <React.Fragment key={node.id}>
                          {renderNodeCard(node, 'scoreGateNo', idx)}
                          {renderDropZone('scoreGateNo', idx + 1)}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="pt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      updateActiveWorkflow((wf) => ({
                        ...wf,
                        scoreGateNodes: {
                          yesPath: [createDefaultNode('NOTIFY_SALES', 'YES')],
                          noPath: [createDefaultNode('EXIT_WORKFLOW', 'NO')],
                        },
                      }));
                    }}
                    className="px-4 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-lg"
                  >
                    <ShieldCheck size={14} />
                    <span>+ Add Lead Score Qualification Gate (Score &gt;= 50)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Simulation Tracer & Telemetry Logs (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="luxe-box rounded-3xl p-5 space-y-3 bg-slate-950/80 border border-emerald-500/30 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap size={13} className="text-emerald-400" />
                <span>Live Decision Tree Tracer</span>
              </h3>
              {simulationLog.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSimulationLog([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {simulationLog.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center space-y-2 text-slate-400">
                <Clock size={24} className="mx-auto text-slate-500" />
                <p className="text-xs">
                  Select a persona and click <strong>&quot;Run Simulation&quot;</strong> to watch the flow execute live with Groq Turbo AI inference.
                </p>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-[10px] text-slate-300 max-h-96 overflow-y-auto pr-1">
                {simulationLog.map((log, i) => (
                  <div key={i} className="p-2 rounded-xl bg-white/[0.03] border-l-2 border-emerald-500/50 leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}

            {liveGeneratedEmail && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-500/40 space-y-2 animate-in fade-in duration-300 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase flex items-center gap-1">
                    <Sparkles size={11} className="text-emerald-400" />
                    Groq Turbo Outreach Ready
                  </span>
                  <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded font-bold">
                    Activity #{liveGeneratedEmail.activityId?.slice(-6) || 'SAVED'}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  Subject: {liveGeneratedEmail.subject}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                  &quot;{liveGeneratedEmail.body.slice(0, 110)}...&quot;
                </p>
                <button
                  type="button"
                  onClick={() => setIsAiEmailModalOpen(true)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Eye size={13} />
                  <span>Inspect Full Outreach Copy &amp; Sync</span>
                </button>
              </div>
            )}
          </div>

          {/* Workflow Stats Overview Card */}
          <div className="luxe-box rounded-3xl p-5 space-y-3 bg-slate-950/80 border border-white/10 shadow-lg">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={13} className="text-emerald-400" />
              <span>Telemetry &amp; Conversion Stats</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block">Enrolled Leads</span>
                <span className="text-sm font-extrabold text-white font-mono">{activeWorkflow.enrolledLeads.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block">Completed</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">{activeWorkflow.completedLeads.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block">Conversion Rate</span>
                <span className="text-sm font-extrabold text-cyan-300 font-mono">{activeWorkflow.conversionRate}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block">Pipeline Revenue</span>
                <span className="text-sm font-extrabold text-amber-300 font-mono">{activeWorkflow.revenueAttributed}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic leading-snug">
              {activeWorkflow.description}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🛠️ SLIDE-OVER INSPECTOR: CONFIGURE ALL 14 NODE TYPES */}
      {/* ========================================================================= */}
      {isInspectorOpen && selectedNode && (
        <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-md bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Settings2 className="text-emerald-400" size={17} />
                <h3 className="text-sm font-bold text-white">Configure Workflow Step</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* General Step Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Step Title</label>
                <input
                  type="text"
                  value={selectedNode.node.title}
                  onChange={(e) => {
                    const updated = { ...selectedNode.node, title: e.target.value };
                    setSelectedNode({ ...selectedNode, node: updated });
                    updateActiveWorkflow((wf) => {
                      const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                      return setLaneNodes(wf, selectedNode.lane, nodes);
                    });
                  }}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Description / Subtitle</label>
                <textarea
                  rows={2}
                  value={selectedNode.node.subtitle}
                  onChange={(e) => {
                    const updated = { ...selectedNode.node, subtitle: e.target.value };
                    setSelectedNode({ ...selectedNode, node: updated });
                    updateActiveWorkflow((wf) => {
                      const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                      return setLaneNodes(wf, selectedNode.lane, nodes);
                    });
                  }}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none"
                />
              </div>

              {/* 1. Trigger Config */}
              {selectedNode.node.type === 'TRIGGER' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">Trigger Source Settings</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Trigger Event</label>
                    <select
                      value={selectedNode.node.config?.triggerEvent || 'FORM_SUBMITTED'}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, triggerEvent: e.target.value },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none font-medium"
                    >
                      <option value="FORM_SUBMITTED">Form Submitted (Demo / Contact)</option>
                      <option value="PAGE_VISITED">Page Visited (URL Match)</option>
                      <option value="TAG_ADDED">CRM Tag Attached</option>
                      <option value="LIST_JOINED">Contact Added to List</option>
                      <option value="SCORE_REACHED">Lead Score Threshold Crossed</option>
                      <option value="WEBHOOK">Inbound API Webhook</option>
                      <option value="CONTACT_CREATED">New Contact Created</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Trigger Detail / Filter</label>
                    <input
                      type="text"
                      placeholder="e.g. /pricing or Demo Form"
                      value={selectedNode.node.config?.triggerDetail || ''}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, triggerDetail: e.target.value },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 2. Email Config */}
              {selectedNode.node.type === 'SEND_EMAIL' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Email Dispatch Settings</span>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={selectedNode.node.config?.emailSubject || ''}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, emailSubject: e.target.value },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sender Name</label>
                      <input
                        type="text"
                        value={selectedNode.node.config?.senderName || 'Business OS'}
                        onChange={(e) => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, senderName: e.target.value },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sender Email</label>
                      <input
                        type="email"
                        value={selectedNode.node.config?.senderEmail || 'outreach@businessos.io'}
                        onChange={(e) => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, senderEmail: e.target.value },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div>
                      <span className="text-xs font-bold text-white block">AI Optimal Send Time</span>
                      <span className="text-[10px] text-slate-400">Predicts individual recipient engagement</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedNode.node.config?.optimalSendTime ?? true}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, optimalSendTime: e.target.checked },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-4 h-4 rounded text-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div>
                      <span className="text-xs font-bold text-white block">Dynamic Industry Case Study</span>
                      <span className="text-[10px] text-slate-400">Healthcare vs SaaS vs Real Estate</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedNode.node.config?.smartIndustrySwap ?? true}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, smartIndustrySwap: e.target.checked },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-4 h-4 rounded text-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {onOpenEmailDesigner && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsInspectorOpen(false);
                          onOpenEmailDesigner(selectedNode.node.config?.emailSubject, selectedNode.node.id, selectedNode.node.title);
                        }}
                        className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Open Quick Newsletter Designer"
                      >
                        <Layers size={13} />
                        <span>Quick Editor</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setBridgeTransfer({
                          source: 'automations',
                          targetTab: 'automations',
                          workflowNodeId: selectedNode.node.id,
                          workflowNodeTitle: selectedNode.node.title,
                          subject: selectedNode.node.config?.emailSubject || '',
                          preheader: '',
                          timestamp: Date.now(),
                        });
                        window.location.href = `/platform/templates/email?from=automations&nodeId=${encodeURIComponent(selectedNode.node.id)}&nodeTitle=${encodeURIComponent(selectedNode.node.title)}`;
                      }}
                      className="w-full py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Open in Visual Template Studio with Calendly, Star Testimonials, and Metric Stats"
                    >
                      <Palette size={13} />
                      <span>Studio (Pro)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Delay Config */}
              {selectedNode.node.type === 'DELAY' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Delay Wait Settings</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Duration</label>
                      <input
                        type="number"
                        value={selectedNode.node.config?.delayDuration || 24}
                        onChange={(e) => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, delayDuration: parseInt(e.target.value, 10) },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Unit</label>
                      <select
                        value={selectedNode.node.config?.delayUnit || 'HOURS'}
                        onChange={(e) => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, delayUnit: e.target.value as any },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="MINUTES">Minutes</option>
                        <option value="HOURS">Hours</option>
                        <option value="DAYS">Days</option>
                        <option value="WEEKS">Weeks</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Condition Config */}
              {selectedNode.node.type === 'CONDITION' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-purple-400 block">Condition Rules &amp; Branch Labels</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Evaluation Rule</label>
                    <select
                      value={selectedNode.node.config?.conditionType || 'CLICKED_LINK'}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, conditionType: e.target.value as any },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none font-medium"
                    >
                      <option value="CLICKED_LINK">Contact Clicked Link in Email</option>
                      <option value="OPENED_EMAIL">Contact Opened Email</option>
                      <option value="VISITED_PAGE">Contact Visited Target URL</option>
                      <option value="SCORE_ABOVE">Lead Score Greater Than Threshold</option>
                      <option value="TAG_EXISTS">Contact Has CRM Tag</option>
                      <option value="INACTIVITY_DAYS">Inactivity Exceeds Days</option>
                    </select>
                  </div>

                  {selectedNode.node.config?.conditionType === 'SCORE_ABOVE' && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Score Threshold (points to qualify)</label>
                      <input
                        type="number"
                        value={selectedNode.node.config?.thresholdScore ?? 50}
                        onChange={(e) => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, thresholdScore: parseInt(e.target.value, 10) },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-emerald-300 font-mono font-bold focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">YES Branch Label</label>
                      <input
                        type="text"
                        value={selectedNode.node.config?.yesBranchLabel || 'YES'}
                        onChange={(e) => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, yesBranchLabel: e.target.value },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-emerald-300 font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">NO Branch Label</label>
                      <input
                        type="text"
                        value={selectedNode.node.config?.noBranchLabel || 'NO'}
                        onChange={(e) => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, noBranchLabel: e.target.value },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-amber-300 font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Lead Score Config */}
              {selectedNode.node.type === 'UPDATE_LEAD_SCORE' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Lead Score Modifier</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Points Delta (+/-)</label>
                    <input
                      type="number"
                      value={selectedNode.node.config?.scoreChange ?? 10}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, scoreChange: parseInt(e.target.value, 10) },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[+5, +10, +25, -10, -25].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, scoreChange: delta },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-xs font-mono font-bold text-slate-200 hover:text-emerald-300 cursor-pointer"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Tag Config */}
              {(selectedNode.node.type === 'ADD_TAG' || selectedNode.node.type === 'REMOVE_TAG') && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-teal-400 block">CRM Tag Management</span>
                  <input
                    type="text"
                    value={selectedNode.node.config?.tag || ''}
                    onChange={(e) => {
                      const updated = {
                        ...selectedNode.node,
                        config: { ...selectedNode.node.config, tag: e.target.value },
                      };
                      setSelectedNode({ ...selectedNode, node: updated });
                      updateActiveWorkflow((wf) => {
                        const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                        return setLaneNodes(wf, selectedNode.lane, nodes);
                      });
                    }}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {['Hot Lead', 'VIP Account', 'Enterprise', 'Demo Requested', 'Decision Maker', 'Churn Risk', 'Unengaged'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, tag: t },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-teal-500/20 text-[10px] font-mono text-slate-300 hover:text-teal-300 cursor-pointer"
                      >
                        +{t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. List Config */}
              {(selectedNode.node.type === 'ADD_TO_LIST' || selectedNode.node.type === 'REMOVE_FROM_LIST') && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-blue-400 block">Marketing List</span>
                  <input
                    type="text"
                    value={selectedNode.node.config?.listName || ''}
                    onChange={(e) => {
                      const updated = {
                        ...selectedNode.node,
                        config: { ...selectedNode.node.config, listName: e.target.value },
                      };
                      setSelectedNode({ ...selectedNode, node: updated });
                      updateActiveWorkflow((wf) => {
                        const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                        return setLaneNodes(wf, selectedNode.lane, nodes);
                      });
                    }}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {['Hot Leads List', 'Executive MQLs', 'Product Trial Users', 'Newsletter Subscribers', 'Cold Nurture'].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, listName: l },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-blue-500/20 text-[10px] font-mono text-slate-300 hover:text-blue-300 cursor-pointer"
                      >
                        +{l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Notify Sales Config */}
              {selectedNode.node.type === 'NOTIFY_SALES' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-purple-400 block">Sales Notification Alert</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assigned Sales Role / Rep</label>
                    <input
                      type="text"
                      value={selectedNode.node.config?.assignedRep || 'Account Executive'}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, assignedRep: e.target.value },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Notification Channel</label>
                    <select
                      value={selectedNode.node.config?.notificationChannel || 'SLACK'}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, notificationChannel: e.target.value as any },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="SLACK">Slack Channel Alert (#sales-hot-leads)</option>
                      <option value="SOFTPHONE">WebRTC Softphone Battlecard</option>
                      <option value="EMAIL">Direct Email Alert</option>
                      <option value="IN_APP">CRM In-App Notification</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 9. Task Config */}
              {selectedNode.node.type === 'CREATE_CRM_TASK' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">CRM Task Setup</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Task Title</label>
                    <input
                      type="text"
                      value={selectedNode.node.config?.taskTitle || ''}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, taskTitle: e.target.value },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Priority</label>
                      <select
                        value={selectedNode.node.config?.taskPriority || 'HIGH'}
                        onChange={(e) => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, taskPriority: e.target.value as any },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Due Duration</label>
                      <select
                        value={selectedNode.node.config?.taskDueIn || 'Within 24 Hours'}
                        onChange={(e) => {
                          const updated = {
                            ...selectedNode.node,
                            config: { ...selectedNode.node.config, taskDueIn: e.target.value },
                          };
                          setSelectedNode({ ...selectedNode, node: updated });
                          updateActiveWorkflow((wf) => {
                            const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                            return setLaneNodes(wf, selectedNode.lane, nodes);
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="Within 2 Hours">Within 2 Hours</option>
                        <option value="Within 24 Hours">Within 24 Hours</option>
                        <option value="Within 3 Days">Within 3 Days</option>
                        <option value="Within 1 Week">Within 1 Week</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. Contact Update Config */}
              {selectedNode.node.type === 'UPDATE_CONTACT' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">Update Contact Field</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Field Name</label>
                    <select
                      value={selectedNode.node.config?.contactField || 'lifecycleStage'}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, contactField: e.target.value },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none font-medium"
                    >
                      <option value="lifecycleStage">Lifecycle Stage</option>
                      <option value="leadStatus">Lead Status</option>
                      <option value="industry">Industry</option>
                      <option value="dealSize">Estimated Deal Size</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">New Value</label>
                    <input
                      type="text"
                      value={selectedNode.node.config?.contactValue || ''}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, contactValue: e.target.value },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 11. Webhook Config */}
              {selectedNode.node.type === 'WEBHOOK' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block">Outbound Webhook Settings</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Endpoint URL</label>
                    <input
                      type="url"
                      placeholder="https://api.yourdomain.com/v1/webhook"
                      value={selectedNode.node.config?.webhookUrl || ''}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, webhookUrl: e.target.value },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">HTTP Method</label>
                    <select
                      value={selectedNode.node.config?.webhookMethod || 'POST'}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, webhookMethod: e.target.value as any },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="POST">POST (JSON Body)</option>
                      <option value="PUT">PUT</option>
                      <option value="GET">GET (Query Params)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 12. Exit Workflow Config */}
              {selectedNode.node.type === 'EXIT_WORKFLOW' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Exit / Goal Criteria</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Goal Achieved Status</label>
                    <select
                      value={selectedNode.node.config?.goalType || 'CONVERTED'}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, goalType: e.target.value as any },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="CONVERTED">Goal: Converted to Customer</option>
                      <option value="BOOKED_DEMO">Goal: Booked Executive Demo</option>
                      <option value="PURCHASED">Goal: Completed Payment</option>
                      <option value="REACHED_SCORE">Goal: Reached Lead Score Threshold</option>
                      <option value="UNRESPONSIVE">Exit: Marked Inactive / Unresponsive</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 13. Move to Workflow Config */}
              {selectedNode.node.type === 'MOVE_TO_WORKFLOW' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">Move to Target Workflow</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Sequence</label>
                    <select
                      value={selectedNode.node.config?.targetWorkflowId || workflows[0]?.id}
                      onChange={(e) => {
                        const updated = {
                          ...selectedNode.node,
                          config: { ...selectedNode.node.config, targetWorkflowId: e.target.value },
                        };
                        setSelectedNode({ ...selectedNode, node: updated });
                        updateActiveWorkflow((wf) => {
                          const nodes = getLaneNodes(wf, selectedNode.lane).map((n) => (n.id === updated.id ? updated : n));
                          return setLaneNodes(wf, selectedNode.lane, nodes);
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    >
                      {workflows.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => deleteNode(selectedNode.lane, selectedNode.node.id)}
                className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Step</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 DRAWER / MODAL: WORKFLOW EXECUTION & AUDIT TRAIL */}
      {/* ========================================================================= */}
      {isExecutionLogsOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex justify-end animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl h-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-l border-emerald-500/30 p-6 shadow-2xl text-white flex flex-col space-y-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <FileText className="text-emerald-400" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Workflow Execution &amp; Audit Trail</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live Telemetry
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Step-by-step telemetry, SHA-256 duplicate guards &amp; live CRM sync for &quot;{activeWorkflow.name}&quot;
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchExecutions(activeWorkflow.id)}
                  disabled={isLoadingExecutions}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer"
                  title="Refresh Logs"
                >
                  <RefreshCw size={14} className={isLoadingExecutions ? 'animate-spin text-emerald-400' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExecutionLogsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Test Behavioral Event Dispatcher Bar */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-emerald-500/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap size={12} />
                  Trigger Website Behavioral Event
                </span>
                <span className="text-[10px] text-slate-400">Emulates real visitor telemetry</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-5">
                  <select
                    value={testEventTrigger}
                    onChange={(e) => setTestEventTrigger(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none font-medium"
                  >
                    <option value="PAGE_VISITED">PAGE_VISITED (/pricing)</option>
                    <option value="FORM_SUBMITTED">FORM_SUBMITTED (Demo Request)</option>
                    <option value="CART_ABANDONED">CART_ABANDONED (/checkout)</option>
                  </select>
                </div>
                <div className="sm:col-span-5">
                  <input
                    type="email"
                    value={testEventEmail}
                    onChange={(e) => setTestEventEmail(e.target.value)}
                    placeholder="recipient@domain.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    disabled={isTriggeringEvent}
                    onClick={async () => {
                      setIsTriggeringEvent(true);
                      try {
                        await fetch('/api/automation/workflows/events', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            eventType: testEventTrigger,
                            contactEmail: testEventEmail,
                            contactData: {
                              firstName: testEventEmail.split('@')[0],
                              company: 'Hyperion Technologies',
                              industry: 'Enterprise SaaS',
                              role: 'CEO',
                            },
                            eventData: {
                              url: testEventTrigger === 'PAGE_VISITED' ? '/pricing' : '/demo-request',
                              duration: 120,
                            },
                          }),
                        });
                        await fetchExecutions(activeWorkflow.id);
                      } catch (e) {
                        console.warn('Error dispatching test event:', e);
                      } finally {
                        setIsTriggeringEvent(false);
                      }
                    }}
                    className="w-full h-full py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isTriggeringEvent ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                    <span>Dispatch</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Split View: Execution Runs List & Selected Step Trace */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 flex-1 overflow-hidden">
              {/* Runs List (5 cols) */}
              <div className="sm:col-span-5 flex flex-col space-y-2 overflow-y-auto pr-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  Execution Runs ({executionLogs.length})
                </span>

                {executionLogs.length === 0 && !isLoadingExecutions && (
                  <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl space-y-2">
                    <p className="text-xs text-slate-400">No executions recorded yet.</p>
                    <p className="text-[11px] text-slate-500">Run a simulation or dispatch a test event above to track runs.</p>
                  </div>
                )}

                {executionLogs.map((run) => {
                  const isSelected = selectedExecutionRun?.id === run.id;
                  const isConverted = run.status === 'CONVERTED' || run.status === 'converted';
                  const isDuplicate = run.steps?.some((s: any) => s.status === 'DUPLICATE_PROTECTED');

                  return (
                    <div
                      key={run.id}
                      onClick={() => setSelectedExecutionRun(run)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">
                          {run.contactName || run.contactEmail}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                            isConverted
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : run.status === 'COMPLETED' || run.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : run.status === 'PAUSED'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 truncate font-mono">
                        {run.contactEmail}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/[0.04]">
                        <span>{new Date(run.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <div className="flex items-center gap-1.5">
                          {isDuplicate && (
                            <span className="text-purple-400 font-bold" title="Idempotency Guard: duplicate send protected">
                              🛡️ Deduped
                            </span>
                          )}
                          <span className="font-mono text-emerald-400 font-bold">
                            Score: {run.finalLeadScore} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step Audit Detail (7 cols) */}
              <div className="sm:col-span-7 flex flex-col space-y-2.5 overflow-y-auto pr-1 bg-slate-950/60 p-4 rounded-2xl border border-white/[0.06]">
                {selectedExecutionRun ? (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                          Run Audit: {selectedExecutionRun.id}
                        </span>
                        <span className="text-xs text-white font-bold">
                          {selectedExecutionRun.contactName} ({selectedExecutionRun.contactEmail})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {selectedExecutionRun.durationMs ? `${selectedExecutionRun.durationMs}ms total` : 'Instant'}
                      </span>
                    </div>

                    {/* Conversion banner if goal reached */}
                    {selectedExecutionRun.conversionGoal && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-300 text-xs font-bold">
                        <Award size={15} className="text-amber-400 shrink-0" />
                        <span>Conversion Goal Achieved: {selectedExecutionRun.conversionGoal}</span>
                      </div>
                    )}

                    {/* Steps Trace */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                        Executed Step Pipeline ({selectedExecutionRun.steps?.length || 0} Steps)
                      </span>

                      {selectedExecutionRun.steps?.map((step: any, idx: number) => {
                        const isProtected = step.status === 'DUPLICATE_PROTECTED';
                        return (
                          <div
                            key={step.stepId || idx}
                            className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                              isProtected
                                ? 'bg-purple-950/20 border-purple-500/40'
                                : 'bg-white/[0.02] border-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <span className="text-slate-500 font-mono text-[10px]">#{idx + 1}</span>
                                <span>{step.nodeTitle || step.nodeType}</span>
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                                  isProtected
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                    : step.status === 'SUCCESS'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                }`}
                              >
                                {step.status}
                              </span>
                            </div>

                            {/* Details Output */}
                            {step.output && (
                              <div className="text-[11px] text-slate-300 space-y-1 bg-black/30 p-2 rounded-lg font-mono">
                                {step.output.optimalSendTime && (
                                  <div className="text-purple-300 flex items-center gap-1">
                                    <Sparkles size={11} />
                                    <span>AI Send Time: {step.output.optimalSendTime}</span>
                                  </div>
                                )}
                                {step.output.message && (
                                  <div className="text-amber-300">{step.output.message}</div>
                                )}
                                {step.output.evaluationResult && (
                                  <div className="text-emerald-300">
                                    Evaluation: {step.output.evaluationResult} ({step.output.selectedBranch})
                                  </div>
                                )}
                                {step.output.newScore !== undefined && (
                                  <div className="text-teal-300">
                                    Lead Score: {step.output.previousScore} -&gt; {step.output.newScore} pts
                                  </div>
                                )}
                                {step.output.activityId && (
                                  <div className="text-slate-400 text-[10px]">
                                    Synced to CRM Activity ID: {step.output.activityId}
                                  </div>
                                )}
                                {step.output.taskTitle && (
                                  <div className="text-emerald-300">
                                    Task Created: &quot;{step.output.taskTitle}&quot; (Priority: {step.output.priority})
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Select an execution run from the left list to inspect its step-by-step telemetry audit trail.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Close Bar */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Active Deduplication Window: 24 Hours • Target CRM: SQLite Prisma Source of Truth
              </span>
              <button
                type="button"
                onClick={() => setIsExecutionLogsOpen(false)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📋 MODAL: CREATE BRAND NEW WORKFLOW WITH TEMPLATE CHOOSER */}
      {/* ========================================================================= */}
      {isNewWorkflowModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <GitBranch className="text-emerald-400" size={18} />
                <h3 className="text-sm font-bold text-white">Create New Automation Flow</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewWorkflowModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Select Architecture Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'blank',
                      name: '🌟 Blank Canvas',
                      badge: 'Custom Builder',
                      desc: 'Clean slate with 1 trigger step. Drag & drop any enterprise steps you desire.',
                    },
                    {
                      id: 'flagship',
                      name: '👑 Enterprise Nurture Tree',
                      badge: 'Decision Tree',
                      desc: 'Exact match to enterprise flowchart: Trigger > Email 1 > Click Branch > Score Gate.',
                    },
                    {
                      id: 'saas_onboarding',
                      name: '🚀 SaaS User Onboarding',
                      badge: 'Activation',
                      desc: 'Signup welcome > 24h wait > Team invite condition > Senior AE sales alert.',
                    },
                    {
                      id: 'cart_recovery',
                      name: '🛒 Abandoned Checkout',
                      badge: 'E-commerce',
                      desc: 'Drop-off trigger > 2h delay > Discount offer > Sales qualification.',
                    },
                  ].map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setNewWorkflowTemplate(tmpl.id);
                        if (!newWorkflowName || newWorkflowName === 'New Custom Workflow') {
                          setNewWorkflowName(tmpl.name.replace(/[^a-zA-Z0-9 ]/g, '').trim());
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        newWorkflowTemplate === tmpl.id
                          ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                          : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{tmpl.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{tmpl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Workflow Title</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Enterprise Healthcare Nurture"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={newWorkflowCategory}
                    onChange={(e) => setNewWorkflowCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="B2B Nurture">B2B Nurture</option>
                    <option value="Lead Scoring">Lead Scoring</option>
                    <option value="Cart & Trial Recovery">Cart &amp; Trial Recovery</option>
                    <option value="Executive Outbound">Executive Outbound</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                  <div className="flex items-center h-9 px-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-emerald-400 font-bold">
                    Active &amp; Listening
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Strategy / Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the target audience, conversion goal, and triggers..."
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewWorkflowModalOpen(false)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewWorkflow}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚙️ MODAL: EDIT ACTIVE WORKFLOW SETTINGS */}
      {/* ========================================================================= */}
      {isFlowSettingsOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Settings2 className="text-emerald-400" size={18} />
                <h3 className="text-sm font-bold text-white">Flow Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFlowSettingsOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Flow Name</label>
                <input
                  type="text"
                  value={editFlowName}
                  onChange={(e) => setEditFlowName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                <select
                  value={editFlowCategory}
                  onChange={(e) => setEditFlowCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="B2B Nurture">B2B Nurture</option>
                  <option value="Lead Scoring">Lead Scoring</option>
                  <option value="Cart & Trial Recovery">Cart &amp; Trial Recovery</option>
                  <option value="Executive Outbound">Executive Outbound</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                <select
                  value={editFlowStatus}
                  onChange={(e) => setEditFlowStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none font-semibold"
                >
                  <option value="ACTIVE">ACTIVE (Running &amp; Enrolling)</option>
                  <option value="PAUSED">PAUSED (Suspended)</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Description / Goal</label>
                <textarea
                  rows={3}
                  value={editFlowDescription}
                  onChange={(e) => setEditFlowDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFlowSettingsOpen(false)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateActiveWorkflow((wf) => ({
                    ...wf,
                    name: editFlowName.trim() || wf.name,
                    category: editFlowCategory,
                    status: editFlowStatus,
                    description: editFlowDescription.trim() || wf.description,
                  }));
                  setIsFlowSettingsOpen(false);
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✉️ MODAL: INSPECT REAL AI-GENERATED OUTREACH EMAIL */}
      {/* ========================================================================= */}
      {isAiEmailModalOpen && liveGeneratedEmail && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live AI Email Draft Inspector</h3>
                  <span className="text-[10px] text-slate-400">To: {liveGeneratedEmail.to}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiEmailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Subject</span>
                <p className="text-xs font-bold text-white mt-0.5">{liveGeneratedEmail.subject}</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Body Copy</span>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">
                  {liveGeneratedEmail.body}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <span className="text-[11px] text-emerald-300">Synchronized with CRM Activity Timeline</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Activity ID #{liveGeneratedEmail.activityId || 'ACT-302'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAiEmailModalOpen(false)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              {onOpenEmailDesigner && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAiEmailModalOpen(false);
                    onOpenEmailDesigner(liveGeneratedEmail.subject, selectedNode?.node?.id, selectedNode?.node?.title);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Palette size={13} />
                  <span>Open in Newsletter Designer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🤖 MODAL: AI SEQUENCE ARCHITECT (Prompt Groq Turbo to build custom flow) */}
      {/* ========================================================================= */}
      {isAiArchitectOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-400" size={18} />
                <h3 className="text-sm font-bold text-white">AI Sequence Architect (Groq Turbo)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAiArchitectOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Describe your target workflow in natural language</label>
              <textarea
                rows={3}
                value={aiArchitectPrompt}
                onChange={(e) => setAiArchitectPrompt(e.target.value)}
                placeholder="e.g. Create a 4-step onboarding sequence for healthcare clinics who booked a telemedicine demo..."
                className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none leading-relaxed"
              />

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  'B2B SaaS Trial Recovery',
                  'Healthcare Clinical Triage',
                  'High-Intent Lead Scoring',
                  'VIP Webinar Follow-up',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setAiArchitectPrompt(`Create a 5-step ${sug} automation workflow with behavioral branching`)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-[10px] text-slate-300 hover:text-emerald-300 border border-white/[0.06] cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAiArchitectOpen(false)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!aiArchitectPrompt.trim()) return;
                  setIsGeneratingAiSequence(true);
                  try {
                    const res = await fetch('/api/ai/ask', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        query: `You are an enterprise CRM automation architect. Design a multi-step email workflow with branching for: "${aiArchitectPrompt}".
Return ONLY a valid JSON object matching this structure with NO markdown backticks:
{
  "name": "Custom Workflow Name",
  "description": "Short description of the workflow",
  "category": "Custom",
  "mainNodes": [
    { "id": "trig_1", "type": "TRIGGER", "title": "Trigger Event", "subtitle": "Description" },
    { "id": "email_1", "type": "SEND_EMAIL", "title": "Welcome Email", "subtitle": "Description", "config": { "emailSubject": "Subject line" } },
    { "id": "delay_1", "type": "DELAY", "title": "Wait 24 Hours", "subtitle": "Description", "config": { "delayDuration": 24, "delayUnit": "HOURS" } },
    { "id": "cond_1", "type": "CONDITION", "title": "Did lead click?", "subtitle": "Description" }
  ]
}`,
                        provider: 'groq',
                      }),
                    });

                    if (!res.ok) throw new Error('AI generation failed');
                    const data = await res.json();
                    const rawText = data.reply || '';
                    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
                    const start = cleanJson.indexOf('{');
                    const end = cleanJson.lastIndexOf('}');
                    const jsonStr = start !== -1 && end !== -1 ? cleanJson.slice(start, end + 1) : cleanJson;
                    const parsed = JSON.parse(jsonStr);

                    if (parsed.mainNodes && Array.isArray(parsed.mainNodes)) {
                      const newWf: AutomationWorkflow = {
                        ...FLAGSHIP_WORKFLOW,
                        id: `wf_ai_${Date.now()}`,
                        name: parsed.name || 'AI Generated Flow',
                        description: parsed.description || aiArchitectPrompt,
                        category: 'Custom',
                        mainNodes: parsed.mainNodes.map((n: any, idx: number) => ({
                          id: n.id || `node_${idx}`,
                          type: n.type || 'SEND_EMAIL',
                          title: n.title || `Step ${idx + 1}`,
                          subtitle: n.subtitle || '',
                          config: n.config || {},
                        })),
                        yesNodes: [createDefaultNode('UPDATE_LEAD_SCORE', 'YES')],
                        noNodes: [createDefaultNode('DELAY', 'NO')],
                        scoreGateNodes: {
                          yesPath: [createDefaultNode('NOTIFY_SALES', 'YES')],
                          noPath: [createDefaultNode('EXIT_WORKFLOW', 'NO')],
                        },
                      };
                      setWorkflows([newWf, ...workflows]);
                      setSelectedWorkflowId(newWf.id);
                    }
                    setIsAiArchitectOpen(false);
                  } catch (e: any) {
                    alert('Could not synthesize sequence: ' + (e?.message || 'Please try again'));
                  } finally {
                    setIsGeneratingAiSequence(false);
                  }
                }}
                disabled={isGeneratingAiSequence || !aiArchitectPrompt.trim()}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
              >
                {isGeneratingAiSequence ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" />
                    <span>Synthesizing Workflow...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate &amp; Mount to Canvas</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
