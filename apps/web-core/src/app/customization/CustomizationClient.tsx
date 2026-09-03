'use client';

import { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  Database,
  Zap,
  Palette,
  Tag,
} from 'lucide-react';

interface CustomField {
  id: string;
  targetModule: 'CONTACTS' | 'DEALS' | 'TICKETS' | 'INVOICES';
  fieldName: string;
  fieldKey: string;
  fieldType: 'TEXT' | 'NUMBER' | 'CURRENCY' | 'DROPDOWN' | 'DATE' | 'BOOLEAN';
  options?: string[];
  isRequired: boolean;
}

interface CustomObject {
  id: string;
  name: string;
  pluralName: string;
  icon: string;
  description: string;
  recordCount: number;
  propertiesCount: number;
}

interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  condition: string;
  action: string;
  isActive: boolean;
  lastFired: string;
}

const initialFields: CustomField[] = [
  { id: 'cf_1', targetModule: 'CONTACTS', fieldName: 'LinkedIn Profile URL', fieldKey: 'linkedin_url', fieldType: 'TEXT', isRequired: false },
  { id: 'cf_2', targetModule: 'CONTACTS', fieldName: 'Khata Credit Limit', fieldKey: 'khata_credit_limit', fieldType: 'CURRENCY', isRequired: false },
  { id: 'cf_3', targetModule: 'DEALS', fieldName: 'Contract Term Length', fieldKey: 'contract_term_months', fieldType: 'DROPDOWN', options: ['Monthly', 'Annual (12mo)', '3-Year Lock'], isRequired: true },
  { id: 'cf_4', targetModule: 'TICKETS', fieldName: 'Root Cause Category', fieldKey: 'root_cause_cat', fieldType: 'DROPDOWN', options: ['Bug', 'SAML SSO', 'User Error', 'Billing'], isRequired: false },
];

const initialCustomObjects: CustomObject[] = [
  { id: 'co_1', name: 'Patient Health Record', pluralName: 'Patients EHR', icon: '🏥', description: 'HIPAA-compliant inpatient and clinical medical history', recordCount: 142, propertiesCount: 18 },
  { id: 'co_2', name: 'Real Estate Property', pluralName: 'MLS Properties', icon: '🏡', description: 'Residential and commercial MLS real estate listings', recordCount: 28, propertiesCount: 24 },
  { id: 'co_3', name: 'Delivery Fleet Vehicle', pluralName: 'Fleet Vehicles', icon: '🚚', description: 'Logistics vans, maintenance logs, and fuel tracking', recordCount: 16, propertiesCount: 12 },
];

const initialAutomations: AutomationRule[] = [
  { id: 'aut_1', name: 'Auto-Assign High-Value Deals ($50k+) to VP of Sales', triggerEvent: 'WHEN deal.created OR deal.updated', condition: 'IF deal.amount >= 50000', action: 'THEN assignToUser("Sangram Cruze") AND notifySlack("#enterprise-deals")', isActive: true, lastFired: '2 hours ago' },
  { id: 'aut_2', name: 'Trigger WhatsApp Invoice Reminder at Day 7', triggerEvent: 'WHEN invoice.status == "UNPAID"', condition: 'IF invoice.daysOverdue >= 7', action: 'THEN sendWhatsAppTemplate("payment_reminder") AND logAuditTrail()', isActive: true, lastFired: 'Yesterday' },
  { id: 'aut_3', name: 'Auto-Escalate Urgent P1 Support Incidents', triggerEvent: 'WHEN ticket.created', condition: 'IF ticket.priority == "URGENT"', action: 'THEN pageOnCallEngineer() AND sendSmsAlert()', isActive: true, lastFired: '3 days ago' },
];

export function CustomizationClient() {
  const [activeTab, setActiveTab] = useState<'fields' | 'objects' | 'automations' | 'branding'>('fields');
  const [customFields, setCustomFields] = useState<CustomField[]>(initialFields);
  const [customObjects] = useState<CustomObject[]>(initialCustomObjects);
  const [automations, setAutomations] = useState<AutomationRule[]>(initialAutomations);
  const [alert, setAlert] = useState<string | null>(null);

  // Field creator state
  const [newFieldName, setNewFieldName] = useState('');
  const [newTargetModule, setNewTargetModule] = useState<'CONTACTS' | 'DEALS' | 'TICKETS' | 'INVOICES'>('CONTACTS');
  const [newFieldType, setNewFieldType] = useState<'TEXT' | 'NUMBER' | 'CURRENCY' | 'DROPDOWN' | 'DATE' | 'BOOLEAN'>('TEXT');
  const [newRequired, setNewRequired] = useState(false);

  // Branding state
  const [brandName, setBrandName] = useState('Business OS');
  const [customDomain, setCustomDomain] = useState('workspace.enterprise-crm.io');
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName) return;

    const key = newFieldName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newField: CustomField = {
      id: `cf_${Date.now()}`,
      targetModule: newTargetModule,
      fieldName: newFieldName,
      fieldKey: key,
      fieldType: newFieldType,
      isRequired: newRequired,
    };

    setCustomFields([...customFields, newField]);
    setNewFieldName('');
    setAlert(`✨ Custom field "${newField.fieldName}" (${newField.fieldType}) added to ${newField.targetModule}!`);
    setTimeout(() => setAlert(null), 3500);
  };

  const handleDeleteField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
    setAlert('Custom field removed.');
    setTimeout(() => setAlert(null), 2500);
  };

  const handleToggleAutomation = (id: string) => {
    setAutomations(
      automations.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
    setAlert('Automation rule state updated.');
    setTimeout(() => setAlert(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sliders className="text-emerald-400" size={24} />
            Platform Customization & Extensibility Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build custom fields, define custom business entities, configure visual automation graphs, and manage white-label branding.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white/[0.04] p-2 rounded-2xl border border-white/[0.08] backdrop-blur-xl">
        {[
          { id: 'fields', label: 'Custom Fields Builder', icon: Tag },
          { id: 'objects', label: 'Custom Objects & Entities', icon: Database },
          { id: 'automations', label: 'Visual Workflow Rules', icon: Zap },
          { id: 'branding', label: 'White-Label & Branding', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/25'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================== */}
      {/* 1. CUSTOM FIELDS BUILDER */}
      {/* ========================================== */}
      {activeTab === 'fields' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Creator Form (4 cols) */}
          <div className="lg:col-span-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.06] pb-2">
              Create New Custom Field
            </h3>

            <form onSubmit={handleAddField} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target CRM Module</label>
                <select
                  value={newTargetModule}
                  onChange={(e: any) => setNewTargetModule(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                >
                  <option value="CONTACTS">Contacts & Accounts</option>
                  <option value="DEALS">Deals Pipeline</option>
                  <option value="TICKETS">Helpdesk Tickets</option>
                  <option value="INVOICES">Commercial Invoices</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Field Label / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Khata Credit Limit ($)"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Data Type</label>
                <select
                  value={newFieldType}
                  onChange={(e: any) => setNewFieldType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                >
                  <option value="TEXT">Text String</option>
                  <option value="NUMBER">Numeric Value</option>
                  <option value="CURRENCY">Currency ($)</option>
                  <option value="DROPDOWN">Dropdown / Select</option>
                  <option value="DATE">Date / Timestamp</option>
                  <option value="BOOLEAN">Toggle (True / False)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="req_box"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-white/20 cursor-pointer"
                />
                <label htmlFor="req_box" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Mandatory Field (Required)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Custom Field</span>
              </button>
            </form>
          </div>

          {/* Fields List (8 cols) */}
          <div className="lg:col-span-8 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Field Name & Key</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Data Type</th>
                  <th className="px-6 py-4">Validation</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {customFields.map((field) => (
                  <tr key={field.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-xs text-white block">{field.fieldName}</span>
                      <span className="font-mono text-[10px] text-slate-400">custom.{field.fieldKey}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {field.targetModule}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white/[0.08] text-slate-300">
                        {field.fieldType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                      {field.isRequired ? <span className="text-rose-400 font-bold">Required *</span> : 'Optional'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. CUSTOM OBJECTS & ENTITIES STUDIO */}
      {/* ========================================== */}
      {activeTab === 'objects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Custom Business Entities & Schema Studio</h2>
              <p className="text-xs text-slate-400 mt-0.5">Extend Business OS with custom tables, data models, and entity associations.</p>
            </div>
            <button className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer">
              <Plus size={13} />
              <span>Define Custom Object</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {customObjects.map((obj) => (
              <div
                key={obj.id}
                className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-white/[0.05] border border-white/[0.08] rounded-2xl shadow-2xs">
                      {obj.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-white">{obj.name}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">Plural: {obj.pluralName}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{obj.description}</p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>{obj.recordCount} Records</span>
                  <span className="text-emerald-400">{obj.propertiesCount} Custom Attributes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. VISUAL AUTOMATION RULES (IF-THIS-THEN-THAT) */}
      {/* ========================================== */}
      {activeTab === 'automations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Visual If-This-Then-That Workflow Rules Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">Automate sales assignments, WhatsApp alerts, and webhook dispatches.</p>
            </div>
            <button className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer">
              <Plus size={13} />
              <span>Create Automation Rule</span>
            </button>
          </div>

          <div className="space-y-3">
            {automations.map((aut) => (
              <div
                key={aut.id}
                className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-xs text-white">{aut.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        aut.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/[0.08] text-slate-400'
                      }`}
                    >
                      {aut.isActive ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <p className="text-emerald-400 font-semibold">{aut.triggerEvent}</p>
                    <p className="text-sky-300 font-semibold">{aut.condition}</p>
                    <p className="text-emerald-300 font-semibold">{aut.action}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-medium">Fired {aut.lastFired}</span>
                  <button
                    onClick={() => handleToggleAutomation(aut.id)}
                    className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-white/[0.1] transition-colors cursor-pointer"
                  >
                    {aut.isActive ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. WHITE-LABEL & BRANDING */}
      {/* ========================================== */}
      {activeTab === 'branding' && (
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5 max-w-2xl">
          <h2 className="text-base font-bold text-white border-b border-white/[0.06] pb-3">
            White-Label & Enterprise Branding
          </h2>

          <div className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company Workspace Title</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Custom Portal Subdomain</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl font-mono text-xs text-white focus:outline-none focus:bg-white/[0.08]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Custom SMTP Relay Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl font-mono text-xs text-white focus:outline-none focus:bg-white/[0.08]"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setAlert('🎨 Branding and custom domain settings updated successfully!');
                  setTimeout(() => setAlert(null), 3000);
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                Save Branding Configurations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
