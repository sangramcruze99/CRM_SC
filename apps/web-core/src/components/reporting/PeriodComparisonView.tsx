'use client';

import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  DollarSign,
  Briefcase,
  LifeBuoy,
  CheckSquare,
  Bot,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export interface ComparisonItem {
  key: string;
  label: string;
  current: number;
  previous: number;
  absoluteDelta: number;
  percentDelta: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  isPositive: boolean;
}

export interface AnomalyItem {
  id: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  metricKey: string;
  evidence: string;
}

interface PeriodComparisonViewProps {
  periodType: string;
  periodKey: string;
  comparisons: Record<string, ComparisonItem>;
  anomalies: AnomalyItem[];
  executiveSummary?: string;
}

export function PeriodComparisonView({
  periodType,
  periodKey,
  comparisons = {},
  anomalies = [],
  executiveSummary,
}: PeriodComparisonViewProps) {
  const comparisonList = Object.values(comparisons);

  const getPriorLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case 'DAY':
        return 'Yesterday (DoD)';
      case 'WEEK':
        return 'Previous Week (WoW)';
      case 'MONTH':
        return 'Previous Month (MoM)';
      case 'QUARTER':
        return 'Previous Quarter (QoQ)';
      case 'YEAR':
        return 'Previous Year (YoY)';
      default:
        return 'Prior Period';
    }
  };

  const getMetricIcon = (key: string) => {
    if (key.includes('revenue') || key.includes('payment') || key.includes('cash'))
      return <DollarSign size={16} className="text-emerald-400" />;
    if (key.includes('deal')) return <Briefcase size={16} className="text-amber-400" />;
    if (key.includes('ticket') || key.includes('sla')) return <LifeBuoy size={16} className="text-blue-400" />;
    if (key.includes('task')) return <CheckSquare size={16} className="text-purple-400" />;
    if (key.includes('ai')) return <Bot size={16} className="text-teal-400" />;
    return <Zap size={16} className="text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Grounded AI Executive Summary Card */}
      {executiveSummary && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-900 border border-emerald-500/20 backdrop-blur-xl space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>AI Executive Narrative (Grounded Analysis)</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {executiveSummary}
          </p>
        </div>
      )}

      {/* Anomalies Alert Banner */}
      {anomalies && anomalies.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle size={15} />
            <span>Unusual Business Deviation Detected ({anomalies.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-3 bg-black/40 rounded-xl border border-amber-500/20 text-xs space-y-1"
              >
                <div className="font-bold text-amber-200 flex items-center justify-between">
                  <span>{anom.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    {anom.severity}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{anom.description}</p>
                <p className="text-[10px] font-mono text-slate-400">{anom.evidence}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Scorecard Grid */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <span>Comparative Performance Scorecard</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Period vs {getPriorLabel(periodType)}
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-300">
            {comparisonList.length} Analyzed Metrics
          </span>
        </div>

        {comparisonList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No comparative baseline data available for this timeframe.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonList.map((item) => {
              const isPositive = item.isPositive;
              const isUp = item.trend === 'UP';
              const isDown = item.trend === 'DOWN';

              return (
                <div
                  key={item.key}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      {getMetricIcon(item.key)}
                      <span>{item.label}</span>
                    </div>

                    {/* Growth % Badge */}
                    <div
                      className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isPositive
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : item.trend === 'FLAT'
                          ? 'bg-white/[0.05] border-white/[0.08] text-slate-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {isUp && <TrendingUp size={12} />}
                      {isDown && <TrendingDown size={12} />}
                      {item.trend === 'FLAT' && <Minus size={12} />}
                      <span>
                        {item.percentDelta > 0 ? `+${item.percentDelta}%` : `${item.percentDelta}%`}
                      </span>
                    </div>
                  </div>

                  {/* Current vs Prior Value */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div className="text-xl font-mono font-extrabold text-white">
                      {item.key.includes('revenue') || item.key.includes('payment') || item.key.includes('expense') || item.key.includes('cash')
                        ? `$${item.current.toLocaleString()}`
                        : item.current.toLocaleString()}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      prior:{' '}
                      {item.key.includes('revenue') || item.key.includes('payment') || item.key.includes('expense') || item.key.includes('cash')
                        ? `$${item.previous.toLocaleString()}`
                        : item.previous.toLocaleString()}
                    </div>
                  </div>

                  {/* Absolute Delta Footer */}
                  <div className="pt-2 border-t border-white/[0.04] text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Absolute Delta</span>
                    <span
                      className={
                        item.absoluteDelta > 0
                          ? 'text-emerald-400 font-bold'
                          : item.absoluteDelta < 0
                          ? 'text-rose-400 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      {item.absoluteDelta > 0 ? `+${item.absoluteDelta.toLocaleString()}` : item.absoluteDelta.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
