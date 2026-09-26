// apps/web-core/src/components/automation/intent/BusinessRuleEditor.tsx
'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Star,
  Sliders,
  Sparkles,
  HelpCircle,
  Tag,
  Hash,
  X,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  DomainPack,
  StructuredIntent,
  StructuredRule,
  RuleGroup,
  AtLeastNRule,
} from './types';

interface BusinessRuleEditorProps {
  intent: StructuredIntent;
  domainPack?: DomainPack;
  onChangeIntent: (updated: StructuredIntent) => void;
}

export function BusinessRuleEditor({
  intent,
  domainPack,
  onChangeIntent,
}: BusinessRuleEditorProps) {
  const [newSkillText, setNewSkillText] = useState('');

  const primaryGroup: RuleGroup = intent.ruleGroups[0] || {
    logic: 'ALL',
    rules: [],
  };

  const handleUpdateGroupLogic = (logic: 'ALL' | 'ANY') => {
    const updatedGroups = [...intent.ruleGroups];
    if (updatedGroups.length === 0) {
      updatedGroups.push({ logic, rules: [] });
    } else {
      updatedGroups[0] = { ...updatedGroups[0], logic };
    }
    onChangeIntent({ ...intent, ruleGroups: updatedGroups });
  };

  const handleAddRule = () => {
    const firstField = domainPack?.fields[0];
    const newRule: StructuredRule = {
      id: `rule_${Date.now()}`,
      field: firstField ? firstField.id : 'custom_field',
      fieldLabel: firstField ? firstField.name : 'Custom Condition',
      operator: firstField?.operators[0] || 'is_at_least',
      value: 1,
      priority: 'REQUIRED',
    };

    const updatedGroups = [...intent.ruleGroups];
    if (updatedGroups.length === 0) {
      updatedGroups.push({ logic: 'ALL', rules: [newRule] });
    } else {
      updatedGroups[0] = {
        ...updatedGroups[0],
        rules: [...updatedGroups[0].rules, newRule],
      };
    }
    onChangeIntent({ ...intent, ruleGroups: updatedGroups });
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<StructuredRule>) => {
    const updatedGroups = intent.ruleGroups.map((group) => ({
      ...group,
      rules: group.rules.map((rule) => {
        if (rule.id !== ruleId) return rule;
        const updated = { ...rule, ...updates };
        if (updates.field && domainPack) {
          const found = domainPack.fields.find((f) => f.id === updates.field);
          if (found) {
            updated.fieldLabel = found.name;
            if (!found.operators.includes(updated.operator)) {
              updated.operator = found.operators[0] || 'equals';
            }
          }
        }
        return updated;
      }),
    }));
    onChangeIntent({ ...intent, ruleGroups: updatedGroups });
  };

  const handleDeleteRule = (ruleId: string) => {
    const updatedGroups = intent.ruleGroups.map((group) => ({
      ...group,
      rules: group.rules.filter((rule) => rule.id !== ruleId),
    }));
    onChangeIntent({ ...intent, ruleGroups: updatedGroups });
  };

  const atLeastN = primaryGroup.atLeastNRules?.[0];

  const handleUpdateThreshold = (delta: number) => {
    if (!atLeastN) return;
    const newThreshold = Math.max(1, Math.min(atLeastN.items.length, atLeastN.threshold + delta));
    const updatedGroups = intent.ruleGroups.map((group) => ({
      ...group,
      atLeastNRules: group.atLeastNRules?.map((rule) => ({
        ...rule,
        threshold: newThreshold,
      })),
    }));
    onChangeIntent({ ...intent, ruleGroups: updatedGroups });
  };

  const handleAddSkill = () => {
    if (!newSkillText.trim() || !atLeastN) return;
    const clean = newSkillText.trim();
    if (atLeastN.items.includes(clean)) return;

    const newItems = [...atLeastN.items, clean];
    const updatedGroups = intent.ruleGroups.map((group) => ({
      ...group,
      atLeastNRules: group.atLeastNRules?.map((rule) => ({
        ...rule,
        items: newItems,
        total: newItems.length,
      })),
    }));
    setNewSkillText('');
    onChangeIntent({ ...intent, ruleGroups: updatedGroups });
  };

  const handleRemoveSkill = (skillName: string) => {
    if (!atLeastN) return;
    const newItems = atLeastN.items.filter((item) => item !== skillName);
    const newThreshold = Math.min(atLeastN.threshold, Math.max(1, newItems.length));
    const updatedGroups = intent.ruleGroups.map((group) => ({
      ...group,
      atLeastNRules: group.atLeastNRules?.map((rule) => ({
        ...rule,
        items: newItems,
        total: newItems.length,
        threshold: newThreshold,
      })),
    }));
    onChangeIntent({ ...intent, ruleGroups: updatedGroups });
  };

  return (
    <div className="bg-slate-900/90 border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Business Decision Criteria & Rules</h3>
            <p className="text-xs text-slate-400">
              Clear business conditions. No raw queries or database lookups required.
            </p>
          </div>
        </div>

        {/* Group Logic Toggle: ALL vs ANY */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => handleUpdateGroupLogic('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              primaryGroup.logic === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Must Match ALL
          </button>
          <button
            type="button"
            onClick={() => handleUpdateGroupLogic('ANY')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              primaryGroup.logic === 'ANY'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Match ANY
          </button>
        </div>
      </div>

      {/* 1. At-Least-N Criteria Card (If Present) */}
      {atLeastN && (
        <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono">
                N
              </span>
              <span className="text-sm font-bold text-white">
                Require At Least {atLeastN.threshold} of {atLeastN.items.length} Criteria
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {atLeastN.priority}
              </span>
            </div>

            {/* Threshold Counter Controls */}
            <div className="flex items-center gap-2 bg-slate-950/90 border border-white/[0.1] rounded-xl px-2 py-1">
              <span className="text-xs text-slate-400 font-medium">Threshold:</span>
              <button
                type="button"
                onClick={() => handleUpdateThreshold(-1)}
                disabled={atLeastN.threshold <= 1}
                className="w-6 h-6 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
              >
                -
              </button>
              <span className="px-2 font-mono font-bold text-emerald-400 text-sm">
                {atLeastN.threshold} / {atLeastN.items.length}
              </span>
              <button
                type="button"
                onClick={() => handleUpdateThreshold(1)}
                disabled={atLeastN.threshold >= atLeastN.items.length}
                className="w-6 h-6 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Interactive Criteria Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {atLeastN.items.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 group hover:border-emerald-400/50 transition-all"
              >
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(item)}
                  className="w-4 h-4 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer ml-1"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          {/* Add Item Input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add skill or requirement (e.g. QuickBooks, Leadership)..."
              className="bg-slate-950/70 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 flex-1"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-white/[0.08]"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Structured Rules List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold uppercase tracking-wider">
          <span>Individual Requirements & Thresholds</span>
          <span>{primaryGroup.rules.length} conditions</span>
        </div>

        {primaryGroup.rules.length === 0 && !atLeastN && (
          <div className="p-8 text-center bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl space-y-2">
            <Sparkles size={24} className="mx-auto text-slate-500" />
            <p className="text-sm font-semibold text-slate-300">No specific conditions configured yet</p>
            <p className="text-xs text-slate-500"> Add conditions below or use the natural language prompt above to generate them automatically.
            </p>
          </div>
        )}

        {primaryGroup.rules.map((rule) => {
          const matchedField = domainPack?.fields.find((f) => f.id === rule.field);

          return (
            <div
              key={rule.id}
              className="bg-slate-950/70 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
            >
              {/* Left: Field + Operator + Value */}
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Field Selector */}
                <select
                  value={rule.field}
                  onChange={(e) => handleUpdateRule(rule.id, { field: e.target.value })}
                  className="bg-slate-900 border border-white/[0.12] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500/80 cursor-pointer max-w-[200px] truncate"
                >
                  {domainPack?.fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                  {!domainPack?.fields.some((f) => f.id === rule.field) && (
                    <option value={rule.field}>{rule.fieldLabel || rule.field}</option>
                  )}
                </select>

                {/* Operator Selector */}
                <select
                  value={rule.operator}
                  onChange={(e) => handleUpdateRule(rule.id, { operator: e.target.value })}
                  className="bg-slate-900 border border-white/[0.12] rounded-xl px-3 py-2 text-xs font-semibold text-emerald-400 focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                >
                  <option value="is_at_least">is at least</option>
                  <option value="is_greater_than">is greater than</option>
                  <option value="is_less_than">is less than</option>
                  <option value="equals">equals</option>
                  <option value="contains">contains</option>
                  <option value="exists">exists</option>
                </select>

                {/* Value Input */}
                {matchedField?.options ? (
                  <select
                    value={rule.value}
                    onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                    className="bg-slate-900 border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                  >
                    {matchedField.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={typeof rule.value === 'number' ? 'number' : 'text'}
                    step="any"
                    value={rule.value}
                    onChange={(e) => {
                      const val = typeof rule.value === 'number' ? Number(e.target.value) : e.target.value;
                      handleUpdateRule(rule.id, { value: val });
                    }}
                    placeholder="Value..."
                    className="bg-slate-900 border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/80 w-32"
                  />
                )}
              </div>

              {/* Right: Priority Badge + Delete */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                {/* Priority Selector */}
                <select
                  value={rule.priority}
                  onChange={(e) =>
                    handleUpdateRule(rule.id, {
                      priority: e.target.value as StructuredRule['priority'],
                    })
                  }
                  className={`border rounded-xl px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer focus:outline-none ${
                    rule.priority === 'REQUIRED'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : rule.priority === 'PREFERRED'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                  }`}
                >
                  <option value="REQUIRED"> Must Have</option>
                  <option value="PREFERRED">○ Preferred</option>
                  <option value="OPTIONAL"> Optional</option>
                </select>

                {/* Delete Rule */}
                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/[0.06] flex items-center justify-center transition-all cursor-pointer"
                  title="Remove condition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Condition Button */}
        <button
          type="button"
          onClick={handleAddRule}
          className="w-full py-2.5 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white rounded-2xl border border-dashed border-white/[0.12] hover:border-emerald-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Plus size={14} className="text-emerald-400" />
          <span>Add Condition</span>
        </button>
      </div>
    </div>
  );
}
