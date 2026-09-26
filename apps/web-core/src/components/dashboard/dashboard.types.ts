// apps/web-core/src/components/dashboard/dashboard.types.ts

export type AttentionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';

export interface DashboardAttentionItem {
  id: string;
  severity: AttentionSeverity;
  title: string;
  reason: string;
  timeAgo: string;
  owner: string;
  actionLabel: string;
  onAction?: (item: DashboardAttentionItem) => void;
}

export interface DashboardTodayMetric {
  id: string;
  label: string;
  value: string | number;
  subtext: string;
  iconName?: string;
  status?: 'normal' | 'active' | 'warning' | 'success';
}

export interface DashboardPrimaryKpi {
  id: string;
  label: string;
  value: string | number;
  delta: string;
  isPositive?: boolean;
  subtext: string;
  iconName?: string;
}

export interface DashboardOperationalRecord {
  id: string;
  primaryText: string;
  secondaryText: string;
  groupText: string;
  ownerText: string;
  priority: 'CRITICAL' | 'URGENT' | 'STABLE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
  location: string;
  status: string;
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  actionLabel?: string;
  raw?: any;
}

export interface DashboardTimelineItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  owner: string;
  status: string;
  statusVariant?: 'success' | 'warning' | 'danger' | 'info';
}

export interface DashboardRecentActivity {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor?: string;
  badge?: string;
}

export interface DashboardQuickAction {
  id: string;
  label: string;
  iconName?: string;
  primary?: boolean;
  onClick: () => void;
}

export interface DashboardSecondaryCard {
  id: string;
  title: string;
  value: string | number;
  detail: string;
  iconName?: string;
  trend?: string;
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export interface DashboardConfig {
  industry: string;
  businessType: string;
  title: string;
  subtitle: string;
  categoryBadge: string;
  availableRoles: Array<{ id: string; label: string }>;
  currentRole: string;
  mode: 'OPERATIONS' | 'ANALYTICS';
  attentionItems: DashboardAttentionItem[];
  todayMetrics: DashboardTodayMetric[];
  primaryKpis: DashboardPrimaryKpi[];
  mainOperationTitle: string;
  mainOperationSubtitle: string;
  searchPlaceholder?: string;
  records: DashboardOperationalRecord[];
  timelineTitle: string;
  timelineSubtitle?: string;
  timelineItems: DashboardTimelineItem[];
  secondaryCards: DashboardSecondaryCard[];
  recentActivity: DashboardRecentActivity[];
  quickActions: DashboardQuickAction[];
}
