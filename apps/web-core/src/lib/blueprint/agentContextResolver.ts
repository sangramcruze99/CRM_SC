// apps/web-core/src/lib/blueprint/agentContextResolver.ts
/**
 * Agent ↔ Niche / Workspace Configuration Sync Engine
 * Master Agent Context & Capability Resolver
 *
 * Implements:
 * 1. AgentExecutionContext Resolution from Workspace Blueprint
 * 2. Service -> Tool Resolution with Strict Enablement Gating
 * 3. Configuration Inheritance (Global -> Industry -> Business Type -> Workspace -> Role)
 * 4. Dynamic Terminology Mapping (System Object -> Active Display Term)
 * 5. High-Risk Action & RBAC/ABAC Policy Evaluation
 * 6. Scoped Knowledge & Memory Context Formation
 * 7. Authoritative Deterministic Business Rules
 * 8. Compact Token-Budgeted Agent Prompt Synthesis
 */

import {
  AgentExecutionContext,
  AgentCapabilityManifest,
  ResolvedAgentTool,
  BlockedAgentTool,
  AgentTermInfo,
  ConfiguredRecordType,
  ScopedKnowledgeSource,
  ActiveBusinessRule,
  ActiveWorkflowInfo,
  ConnectedIntegrationInfo,
  AgentUserPermissions,
  UniversalAgentResult,
  RiskLevel,
} from '@repo/core-types';

export type {
  AgentExecutionContext,
  AgentCapabilityManifest,
  ResolvedAgentTool,
  BlockedAgentTool,
  AgentTermInfo,
  ConfiguredRecordType,
  ScopedKnowledgeSource,
  ActiveBusinessRule,
  ActiveWorkflowInfo,
  ConnectedIntegrationInfo,
  AgentUserPermissions,
  UniversalAgentResult,
  RiskLevel,
};

import { NicheBlueprint } from './blueprintModel';
import { UNIVERSAL_SERVICE_CATALOG } from '../services/serviceCatalog';

export interface ResolveContextOptions {
  blueprint: NicheBlueprint;
  agentId?: string;
  agentName?: string;
  agentRole?: string;
  userId?: string;
  userRole?: string;
  userPermissions?: Partial<AgentUserPermissions>;
  currentServiceId?: string;
  currentRecord?: { type: string; id: string; data?: Record<string, any> };
  query?: string;
  integrationsStatus?: Record<string, 'CONNECTED' | 'DISCONNECTED' | 'REQUIRES_SETUP'>;
}

/**
 * Service to Agent Tool mapping table.
 * Associates platform service capabilities with registered tools and risk profiles.
 */
export const SERVICE_TOOL_DEFINITIONS: Record<
  string,
  Array<{
    name: string;
    displayName: string;
    category: string;
    riskLevel: RiskLevel;
    requiresApproval: boolean;
    requiredPermission?: string;
    requiredIntegration?: string;
    description: string;
    inputSchema?: Record<string, any>;
  }>
> = {
  // 1. Contacts & CRM (Universal + Healthcare Patients)
  srv_contacts: [
    {
      name: 'search_crm_contacts',
      displayName: 'Search Contacts',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Search customer, patient, buyer, or guest records by name, email, or identifier.',
      inputSchema: { query: 'string' },
    },
    {
      name: 'create_crm_contact',
      displayName: 'Create Contact Record',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Create a new primary stakeholder, patient, or client record.',
      inputSchema: { firstName: 'string', lastName: 'string', email: 'string', phone: 'string' },
    },
    {
      name: 'update_crm_contact',
      displayName: 'Update Contact Record',
      category: 'CRM',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      description: 'Modify contact profile fields, tags, or contact data.',
      inputSchema: { contactId: 'string', fields: 'object' },
    },
    {
      name: 'add_crm_activity',
      displayName: 'Log Activity / Timeline Note',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Log interaction notes, clinical observations, or agent touchpoints to timeline.',
      inputSchema: { contactId: 'string', content: 'string', type: 'string' },
    },
  ],

  srv_healthcare_patients: [
    {
      name: 'search_crm_contacts',
      displayName: 'Search Patients',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Search patient directory by name, MRN, phone, or email.',
      inputSchema: { query: 'string' },
    },
    {
      name: 'create_crm_contact',
      displayName: 'Register Patient',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Register patient chart in healthcare workspace.',
      inputSchema: { firstName: 'string', lastName: 'string', email: 'string', phone: 'string' },
    },
    {
      name: 'update_crm_contact',
      displayName: 'Update Patient Chart',
      category: 'CRM',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      description: 'Update patient demographics or medical contact info.',
      inputSchema: { contactId: 'string', fields: 'object' },
    },
    {
      name: 'add_crm_activity',
      displayName: 'Log Clinical Note',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Add clinical interaction note to patient chart.',
      inputSchema: { contactId: 'string', content: 'string' },
    },
  ],

  // 2. Deals & Sales Pipeline
  srv_deals_pipeline: [
    {
      name: 'search_crm_deals',
      displayName: 'Search Deals / Pipeline Opportunities',
      category: 'SALES',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Find commercial opportunities, treatment plans, or listings by stage or title.',
      inputSchema: { query: 'string', stage: 'string' },
    },
    {
      name: 'create_crm_deal',
      displayName: 'Open Deal Opportunity',
      category: 'SALES',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      description: 'Register a new deal, estimate, proposal, or case opportunity.',
      inputSchema: { title: 'string', amount: 'number', stage: 'string', contactId: 'string' },
    },
    {
      name: 'move_crm_deal',
      displayName: 'Advance Deal Stage',
      category: 'SALES',
      riskLevel: 'HIGH',
      requiresApproval: false,
      description: 'Advance deal stage (e.g. Qualified -> Proposal -> Won/Closed).',
      inputSchema: { dealId: 'string', newStage: 'string' },
    },
  ],

  srv_pipeline_deals: [
    {
      name: 'search_crm_deals',
      displayName: 'Search Deals / Pipeline Opportunities',
      category: 'SALES',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Find commercial opportunities by stage or title.',
      inputSchema: { query: 'string', stage: 'string' },
    },
  ],

  // 3. Calendar, Appointments, Reservations & Showings
  srv_calendar_meetings: [
    {
      name: 'book_calendar',
      displayName: 'Book Appointment / Viewing / Table',
      category: 'CALENDAR',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      requiredIntegration: 'google_calendar',
      description: 'Schedule a confirmed slot for an appointment, property viewing, or reservation.',
      inputSchema: { attendeeEmail: 'string', slotTime: 'string', durationMinutes: 'number' },
    },
  ],

  srv_healthcare_appointments: [
    {
      name: 'book_calendar',
      displayName: 'Book Clinical Appointment',
      category: 'CALENDAR',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      requiredIntegration: 'google_calendar',
      description: 'Schedule a confirmed clinical appointment with an assigned provider.',
      inputSchema: { attendeeEmail: 'string', slotTime: 'string', durationMinutes: 'number' },
    },
  ],

  srv_restaurant_floor_kds: [
    {
      name: 'book_calendar',
      displayName: 'Reserve Dining Table',
      category: 'CALENDAR',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      description: 'Book table reservation conforming to floor capacity.',
      inputSchema: { attendeeEmail: 'string', slotTime: 'string', partySize: 'number' },
    },
  ],

  srv_realestate_rentals: [
    {
      name: 'book_calendar',
      displayName: 'Schedule Property Showing',
      category: 'CALENDAR',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      description: 'Schedule property viewing with licensed agent.',
      inputSchema: { attendeeEmail: 'string', slotTime: 'string', propertyId: 'string' },
    },
  ],

  // 4. Invoicing, Billing & Payments
  srv_invoices_billing: [
    {
      name: 'create_payment_link',
      displayName: 'Generate Dynamic Payment Link',
      category: 'FINANCE',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      requiredPermission: 'canAccessFinancials',
      description: 'Generate dynamic online checkout URL for invoice or service charge.',
      inputSchema: { amount: 'number', invoiceNum: 'string', description: 'string' },
    },
    {
      name: 'get_overdue_invoices',
      displayName: 'Fetch Overdue Invoices',
      category: 'FINANCE',
      riskLevel: 'LOW',
      requiresApproval: false,
      requiredPermission: 'canAccessFinancials',
      description: 'Query overdue balances and outstanding accounts receivable.',
      inputSchema: {},
    },
    {
      name: 'process_refund',
      displayName: 'Process Financial Refund',
      category: 'FINANCE',
      riskLevel: 'CRITICAL',
      requiresApproval: true,
      requiredPermission: 'canAccessFinancials',
      description: 'Issue partial or full payment refund to client account (strictly requires human approval).',
      inputSchema: { invoiceId: 'string', amount: 'number', reason: 'string' },
    },
  ],

  srv_invoicing_ledger: [
    {
      name: 'create_payment_link',
      displayName: 'Generate Dynamic Payment Link',
      category: 'FINANCE',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      requiredPermission: 'canAccessFinancials',
      description: 'Generate dynamic online checkout URL for invoice or service charge.',
      inputSchema: { amount: 'number', invoiceNum: 'string', description: 'string' },
    },
    {
      name: 'get_overdue_invoices',
      displayName: 'Fetch Overdue Invoices',
      category: 'FINANCE',
      riskLevel: 'LOW',
      requiresApproval: false,
      requiredPermission: 'canAccessFinancials',
      description: 'Query overdue balances and outstanding accounts receivable.',
      inputSchema: {},
    },
    {
      name: 'process_refund',
      displayName: 'Process Financial Refund',
      category: 'FINANCE',
      riskLevel: 'CRITICAL',
      requiresApproval: true,
      requiredPermission: 'canAccessFinancials',
      description: 'Issue partial or full payment refund to client account (strictly requires human approval).',
      inputSchema: { invoiceId: 'string', amount: 'number', reason: 'string' },
    },
  ],

  // 5. Helpdesk & Tickets
  srv_support_desk: [
    {
      name: 'create_support_ticket',
      displayName: 'Create Support / Issue Ticket',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Log a customer issue, clinical question, or maintenance request.',
      inputSchema: { title: 'string', description: 'string', priority: 'string' },
    },
    {
      name: 'reply_support_ticket',
      displayName: 'Reply to Support Ticket',
      category: 'COMMUNICATION',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      description: 'Dispatch helpful response or FAQ resolution to ticket author.',
      inputSchema: { ticketId: 'string', message: 'string' },
    },
  ],

  srv_helpdesk_sla: [
    {
      name: 'create_support_ticket',
      displayName: 'Create Support / Issue Ticket',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Log a customer issue, clinical question, or maintenance request.',
      inputSchema: { title: 'string', description: 'string', priority: 'string' },
    },
    {
      name: 'reply_support_ticket',
      displayName: 'Reply to Support Ticket',
      category: 'COMMUNICATION',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      description: 'Dispatch helpful response or FAQ resolution to ticket author.',
      inputSchema: { ticketId: 'string', message: 'string' },
    },
  ],

  // 6. Project & Task Management
  srv_projects_tasks: [
    {
      name: 'create_crm_task',
      displayName: 'Create Team Task',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Add real actionable task to workspace Kanban board.',
      inputSchema: { title: 'string', description: 'string', priority: 'string' },
    },
  ],

  srv_internal_tasks: [
    {
      name: 'create_crm_task',
      displayName: 'Create Team Task',
      category: 'CRM',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Add real actionable task to workspace Kanban board.',
      inputSchema: { title: 'string', description: 'string', priority: 'string' },
    },
  ],

  // 7. Omnichannel Comms
  srv_marketing_studio: [
    {
      name: 'send_email',
      displayName: 'Send Outbound Email',
      category: 'COMMUNICATION',
      riskLevel: 'HIGH',
      requiresApproval: true,
      requiredPermission: 'canTriggerExternalComms',
      requiredIntegration: 'resend_email',
      description: 'Send direct branded email message to client, patient, or lead.',
      inputSchema: { to: 'string', subject: 'string', body: 'string' },
    },
    {
      name: 'send_whatsapp',
      displayName: 'Send WhatsApp Message',
      category: 'COMMUNICATION',
      riskLevel: 'HIGH',
      requiresApproval: true,
      requiredPermission: 'canTriggerExternalComms',
      requiredIntegration: 'meta_whatsapp',
      description: 'Dispatch WhatsApp template or direct notification.',
      inputSchema: { to: 'string', message: 'string' },
    },
  ],

  srv_omnichannel_comms: [
    {
      name: 'send_email',
      displayName: 'Send Outbound Email',
      category: 'COMMUNICATION',
      riskLevel: 'HIGH',
      requiresApproval: true,
      requiredPermission: 'canTriggerExternalComms',
      requiredIntegration: 'resend_email',
      description: 'Send direct branded email message to client, patient, or lead.',
      inputSchema: { to: 'string', subject: 'string', body: 'string' },
    },
    {
      name: 'send_whatsapp',
      displayName: 'Send WhatsApp Message',
      category: 'COMMUNICATION',
      riskLevel: 'HIGH',
      requiresApproval: true,
      requiredPermission: 'canTriggerExternalComms',
      requiredIntegration: 'meta_whatsapp',
      description: 'Dispatch WhatsApp template or direct notification.',
      inputSchema: { to: 'string', message: 'string' },
    },
  ],

  // 8. Knowledge Base
  srv_knowledge_rag: [
    {
      name: 'search_knowledge_base',
      displayName: 'Search Scoped Knowledge Base',
      category: 'AI',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Vector RAG search across approved company SOPs, clinical protocols, and price lists.',
      inputSchema: { query: 'string' },
    },
  ],

  // 9. Inventory & Stock
  srv_inventory_stock: [
    {
      name: 'search_inventory_stock',
      displayName: 'Search Product / Stock Levels',
      category: 'INVENTORY',
      riskLevel: 'LOW',
      requiresApproval: false,
      description: 'Check stock on hand, warehouse locations, and restock thresholds.',
      inputSchema: { query: 'string' },
    },
    {
      name: 'adjust_stock_level',
      displayName: 'Adjust Inventory Quantity',
      category: 'INVENTORY',
      riskLevel: 'HIGH',
      requiresApproval: true,
      description: 'Perform stock count adjustment or record write-off (requires managerial approval).',
      inputSchema: { productId: 'string', quantityDelta: 'number', reason: 'string' },
    },
  ],

  // 10. Document Vault
  srv_documents_esign: [
    {
      name: 'generate_document',
      displayName: 'Generate Template Document',
      category: 'DOCUMENTS',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      description: 'Generate PDF or DOCX agreement, consent form, or clinical summary.',
      inputSchema: { templateId: 'string', recordId: 'string', data: 'object' },
    },
  ],

  srv_document_vault: [
    {
      name: 'generate_document',
      displayName: 'Generate Template Document',
      category: 'DOCUMENTS',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      description: 'Generate PDF or DOCX agreement, consent form, or clinical summary.',
      inputSchema: { templateId: 'string', recordId: 'string', data: 'object' },
    },
  ],
};

/**
 * Authoritative Deterministic Business Rules by Industry
 */
export const INDUSTRY_BUSINESS_RULES: Record<string, ActiveBusinessRule[]> = {
  HEALTHCARE: [
    {
      id: 'rule_hc_provider_avail',
      serviceId: 'srv_healthcare_appointments',
      name: 'Provider Availability & Licensure',
      description: 'Appointments cannot be booked without an assigned licensed provider who has active office hours.',
      authoritative: true,
    },
    {
      id: 'rule_hc_hipaa_privacy',
      serviceId: 'srv_healthcare_patients',
      name: 'Medical Record Confidentiality',
      description: 'Protected Health Information (PHI) and clinical notes must never be dispatched to third-party tools.',
      authoritative: true,
    },
    {
      id: 'rule_hc_triage_override',
      serviceId: 'srv_healthcare_patients',
      name: 'Emergency Clinical Triage',
      description: 'Urgent/Critical clinical symptoms require immediate routing to the on-call medical doctor.',
      authoritative: true,
    },
  ],

  HOSPITALITY: [
    {
      id: 'rule_hosp_table_capacity',
      serviceId: 'srv_restaurant_floor_kds',
      name: 'Dining Capacity Constraint',
      description: 'Table reservations cannot exceed dining floor capacity or be scheduled after kitchen cut-off (22:00).',
      authoritative: true,
    },
    {
      id: 'rule_hosp_large_party',
      serviceId: 'srv_restaurant_floor_kds',
      name: 'Large Party Guarantee',
      description: 'Parties of 6 or more require a deposit or explicit manager approval before booking confirmation.',
      authoritative: true,
    },
  ],

  REAL_ESTATE: [
    {
      id: 'rule_re_viewing_escort',
      serviceId: 'srv_realestate_listings',
      name: 'Licensed Agent Showing Requirement',
      description: 'Property viewings must have an assigned licensed real estate agent attached.',
      authoritative: true,
    },
    {
      id: 'rule_re_earnest_money',
      serviceId: 'srv_realestate_escrow',
      name: 'Earnest Deposit Verification',
      description: 'Purchase offers cannot move to Under Contract without escrow deposit verification.',
      authoritative: true,
    },
  ],

  RETAIL: [
    {
      id: 'rule_ret_min_stock',
      serviceId: 'srv_inventory_stock',
      name: 'Safety Stock Reserve',
      description: 'Sales transactions cannot reduce inventory below the configured minimum safety stock threshold.',
      authoritative: true,
    },
  ],

  AGENCY: [
    {
      id: 'rule_ag_retainer_signoff',
      serviceId: 'srv_invoices_billing',
      name: 'Milestone Deliverable Sign-Off',
      description: 'Retainer invoices require milestone project manager approval before dispatch.',
      authoritative: true,
    },
  ],

  SAAS: [
    {
      id: 'rule_saas_seat_limit',
      serviceId: 'srv_contacts',
      name: 'Plan Entitlement Enforcement',
      description: 'User provisioning cannot exceed licensed plan seat quota without an upgrade.',
      authoritative: true,
    },
  ],
};

/**
 * Resolves the complete AgentExecutionContext for an agent request.
 */
export function resolveAgentExecutionContext(options: ResolveContextOptions): AgentExecutionContext {
  const {
    blueprint,
    agentId = 'agent_universal',
    agentName = 'Business OS Autonomous Agent',
    agentRole = 'General Operations & Intelligence Specialist',
    userId = 'usr_current',
    userRole = 'ADMIN',
    userPermissions = {},
    integrationsStatus = {
      google_calendar: 'CONNECTED',
      resend_email: 'CONNECTED',
      meta_whatsapp: 'CONNECTED',
      stripe_payments: 'CONNECTED',
    },
  } = options;

  const enabledServiceIds = new Set(blueprint.activeServiceIds || []);
  const allCatalogServiceIds = Object.keys(UNIVERSAL_SERVICE_CATALOG);
  const disabledServiceIds = allCatalogServiceIds.filter((id) => !enabledServiceIds.has(id));

  // 1. Resolve User Permissions
  const permissions: AgentUserPermissions = {
    userId,
    role: userRole,
    allowedActions: userPermissions.allowedActions || ['*'],
    canAccessFinancials: userPermissions.canAccessFinancials ?? (userRole === 'ADMIN' || userRole === 'FINANCE_MANAGER'),
    canDeleteRecords: userPermissions.canDeleteRecords ?? (userRole === 'ADMIN'),
    canTriggerExternalComms: userPermissions.canTriggerExternalComms ?? true,
    canApproveActions: userPermissions.canApproveActions ?? (userRole === 'ADMIN' || userRole === 'MANAGER'),
  };

  // 2. Resolve Terminology (Configuration Inheritance)
  const terminologyMap = blueprint.terminology || {};
  const terminology: Record<string, AgentTermInfo> = {
    customer: {
      systemObject: 'customer',
      displayTerm: terminologyMap.contacts?.singular || 'Customer',
      singular: terminologyMap.contacts?.singular || 'Customer',
      plural: terminologyMap.contacts?.plural || 'Customers',
      verbAdd: terminologyMap.contacts?.verbAdd || 'Add Customer',
    },
    deal: {
      systemObject: 'deal',
      displayTerm: terminologyMap.deals?.singular || 'Deal',
      singular: terminologyMap.deals?.singular || 'Deal',
      plural: terminologyMap.deals?.plural || 'Deals',
      verbAdd: terminologyMap.deals?.verbAdd || 'Create Deal',
    },
    project: {
      systemObject: 'project',
      displayTerm: terminologyMap.projects?.singular || 'Project',
      singular: terminologyMap.projects?.singular || 'Project',
      plural: terminologyMap.projects?.plural || 'Projects',
      verbAdd: terminologyMap.projects?.verbAdd || 'Launch Project',
    },
    invoice: {
      systemObject: 'invoice',
      displayTerm: terminologyMap.invoices?.singular || 'Invoice',
      singular: terminologyMap.invoices?.singular || 'Invoice',
      plural: terminologyMap.invoices?.plural || 'Invoices',
      verbAdd: terminologyMap.invoices?.verbAdd || 'Generate Invoice',
    },
    ticket: {
      systemObject: 'ticket',
      displayTerm: terminologyMap.tickets?.singular || 'Ticket',
      singular: terminologyMap.tickets?.singular || 'Ticket',
      plural: terminologyMap.tickets?.plural || 'Tickets',
      verbAdd: terminologyMap.tickets?.verbAdd || 'Open Ticket',
    },
    product: {
      systemObject: 'product',
      displayTerm: terminologyMap.products?.singular || 'Product',
      singular: terminologyMap.products?.singular || 'Product',
      plural: terminologyMap.products?.plural || 'Products',
      verbAdd: terminologyMap.products?.verbAdd || 'Add Product',
    },
    record: {
      systemObject: 'record',
      displayTerm: terminologyMap.records?.singular || 'Record',
      singular: terminologyMap.records?.singular || 'Record',
      plural: terminologyMap.records?.plural || 'Records',
      verbAdd: terminologyMap.records?.verbAdd || 'Create Record',
    },
  };

  // 3. Resolve Tools (Service Enablement + Permission + Integration Resolver)
  const availableToolsMap = new Map<string, ResolvedAgentTool>();
  const blockedToolsMap = new Map<string, BlockedAgentTool>();

  for (const [srvId, toolDefs] of Object.entries(SERVICE_TOOL_DEFINITIONS)) {
    const isServiceEnabled = enabledServiceIds.has(srvId);
    const serviceMeta = (UNIVERSAL_SERVICE_CATALOG as any)[srvId];
    const serviceName = serviceMeta?.name || srvId;

    for (const tool of toolDefs) {
      if (!isServiceEnabled) {
        if (!availableToolsMap.has(tool.name) && !blockedToolsMap.has(tool.name)) {
          blockedToolsMap.set(tool.name, {
            name: tool.name,
            displayName: tool.displayName,
            serviceId: srvId,
            category: tool.category,
            reason: `${serviceName} is not enabled for this workspace.`,
          });
        }
        continue;
      }

      // Check RBAC / ABAC Permissions
      if (tool.requiredPermission && !(permissions as any)[tool.requiredPermission]) {
        availableToolsMap.delete(tool.name);
        blockedToolsMap.set(tool.name, {
          name: tool.name,
          displayName: tool.displayName,
          serviceId: srvId,
          category: tool.category,
          reason: `User role "${userRole}" does not have permission to execute this action (${tool.requiredPermission}).`,
        });
        continue;
      }

      // If already added as available, don't overwrite
      if (availableToolsMap.has(tool.name)) {
        continue;
      }

      // Check Integration Dependencies (e.g. Calendar, Stripe, WhatsApp)
      if (tool.requiredIntegration) {
        const intStatus = integrationsStatus[tool.requiredIntegration] || 'CONNECTED';
        if (intStatus !== 'CONNECTED') {
          availableToolsMap.set(tool.name, {
            name: tool.name,
            displayName: tool.displayName,
            serviceId: srvId,
            serviceName,
            category: tool.category,
            riskLevel: tool.riskLevel,
            requiresApproval: tool.requiresApproval,
            status: 'REQUIRES_CONNECTION',
            statusReason: `Integration "${tool.requiredIntegration}" is ${intStatus}. Action requires connection.`,
            description: tool.description,
            inputSchema: tool.inputSchema,
          });
          blockedToolsMap.delete(tool.name);
          continue;
        }
      }

      // Check Approval Requirement
      const status = tool.requiresApproval ? 'REQUIRES_APPROVAL' : 'AVAILABLE';
      availableToolsMap.set(tool.name, {
        name: tool.name,
        displayName: tool.displayName,
        serviceId: srvId,
        serviceName,
        category: tool.category,
        riskLevel: tool.riskLevel,
        requiresApproval: tool.requiresApproval,
        status,
        statusReason: tool.requiresApproval ? 'High-risk or financial action requires human approval' : 'Ready for autonomous execution',
        description: tool.description,
        inputSchema: tool.inputSchema,
      });
      blockedToolsMap.delete(tool.name);
    }
  }

  const availableTools = Array.from(availableToolsMap.values());
  const blockedTools = Array.from(blockedToolsMap.values());

  // 4. Resolve Record Types & Schemas
  const recordTypes: ConfiguredRecordType[] = (blueprint.recordTypes || []).map((rt) => ({
    id: rt.id,
    name: rt.name,
    singular: rt.singular,
    plural: rt.plural,
    category: rt.category,
    isCustom: rt.isCustom,
    fields: (rt.fields || []).map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      required: f.required,
      visibility: f.visibility,
    })),
    statuses: rt.statuses || [],
  }));

  // 5. Resolve Scoped Knowledge Sources
  const knowledgeSources: ScopedKnowledgeSource[] = [
    {
      id: 'kn_global_platform',
      title: 'Business OS Enterprise Operating Guide',
      scope: 'GLOBAL',
      summary: 'General enterprise governance, multi-channel protocols, and data safety policies.',
    },
    {
      id: `kn_ind_${blueprint.industry.toLowerCase()}`,
      title: `${blueprint.industry} Industry Operations Standard`,
      scope: 'INDUSTRY',
      industry: blueprint.industry,
      summary: `Standard operational procedures, compliance standards, and workflows for ${blueprint.industry}.`,
    },
    {
      id: `kn_btype_${blueprint.activeBusinessTypeId}`,
      title: `${blueprint.name} Business Type Protocol`,
      scope: 'BUSINESS_TYPE',
      businessType: blueprint.activeBusinessTypeId,
      summary: blueprint.description,
    },
    {
      id: `kn_ws_${blueprint.id}`,
      title: `${blueprint.name} Workspace Knowledge & Policies`,
      scope: 'WORKSPACE',
      summary: blueprint.aiContext?.systemPromptDirective || 'Workspace-specific directives and rules.',
    },
  ];

  // 6. Resolve Business Rules
  const industryRules = INDUSTRY_BUSINESS_RULES[blueprint.industry] || [];
  const applicableRules = industryRules.filter(
    (r) => enabledServiceIds.has(r.serviceId) || r.serviceId === 'all'
  );

  // 7. Resolve Active Workflows
  const activeWorkflows: ActiveWorkflowInfo[] = (blueprint.workflowTemplates || [])
    .filter((wf) => wf.requiredServiceIds.every((srv) => enabledServiceIds.has(srv)))
    .map((wf) => ({
      id: wf.id,
      name: wf.name,
      trigger: wf.trigger,
      actions: wf.actions,
      category: wf.category,
    }));

  // 8. Integrations
  const integrations: ConnectedIntegrationInfo[] = Object.entries(integrationsStatus).map(([id, status]) => ({
    id,
    name: id.replace(/_/g, ' ').toUpperCase(),
    category: id.includes('calendar') ? 'CALENDAR' : id.includes('pay') ? 'PAYMENTS' : 'COMMUNICATION',
    status,
    missingReason: status !== 'CONNECTED' ? `Please link your ${id.replace(/_/g, ' ')} credentials.` : undefined,
  }));

  // 9. Output Destinations
  const outputDestinations: string[] = [
    'RETURN_TO_CHAT',
    'CREATE_RECORD',
    'UPDATE_RECORD',
    'CREATE_TASK',
    'LOG_TIMELINE_ACTIVITY',
  ];
  if (enabledServiceIds.has('srv_omnichannel_comms')) {
    outputDestinations.push('SEND_EMAIL', 'SEND_WHATSAPP');
  }
  if (enabledServiceIds.has('srv_document_vault')) {
    outputDestinations.push('SAVE_DOCUMENT_VAULT');
  }
  if (enabledServiceIds.has('srv_invoicing_ledger')) {
    outputDestinations.push('CREATE_INVOICE', 'CREATE_PAYMENT_LINK');
  }
  outputDestinations.push('TRIGGER_WORKFLOW', 'SUBMIT_APPROVAL_REQUEST');

  return {
    agent: {
      id: agentId,
      name: agentName,
      role: agentRole,
      domain: blueprint.industry,
      model: 'gemma4:e4b',
      autonomyMode: 'HYBRID',
    },
    workspace: {
      id: blueprint.id,
      name: blueprint.name,
      tenantId: blueprint.slug || 'tenant_default',
      region: blueprint.profile?.businessRegion || 'North America',
      currency: blueprint.profile?.currency || 'USD ($)',
    },
    industry: blueprint.industry,
    businessType: blueprint.activeBusinessTypeId,
    enabledServices: Array.from(enabledServiceIds),
    disabledServices: disabledServiceIds,
    terminology,
    recordTypes,
    permissions,
    availableTools,
    blockedTools,
    knowledgeSources,
    memoryScopes: {
      globalAgentId: agentId,
      workspaceId: blueprint.id,
      serviceId: options.currentServiceId,
      recordId: options.currentRecord?.id,
    },
    memories: {
      globalAgentFacts: ['Operate with executive precision', 'Never hallucinate unavailable services'],
      workspaceFacts: [
        `Active operating hours: ${blueprint.profile?.operatingHours || '09:00 - 18:00'}`,
        `Primary facility: ${blueprint.branches?.[0]?.city || 'Main Office'}`,
      ],
      businessFacts: [
        `Business Name: ${blueprint.name}`,
        `Industry: ${blueprint.industry} (${blueprint.activeBusinessTypeId})`,
      ],
      serviceFacts: [],
      customerFacts: [],
      recordFacts: options.currentRecord
        ? [`Active Record (${options.currentRecord.type}): ${options.currentRecord.id}`]
        : [],
      conversationHistory: [],
    },
    integrations,
    businessRules: applicableRules,
    activeWorkflows,
    outputDestinations,
    configurationVersion: blueprint.version || 1,
  };
}

/**
 * Builds an AgentCapabilityManifest defining the operational boundary.
 */
export function generateAgentCapabilityManifest(context: AgentExecutionContext): AgentCapabilityManifest {
  return {
    agentId: context.agent.id,
    agentName: context.agent.name,
    workspaceId: context.workspace.id,
    industry: context.industry,
    businessType: context.businessType,
    configurationVersion: context.configurationVersion,
    services: {
      enabled: context.enabledServices,
      disabled: context.disabledServices,
    },
    tools: {
      available: context.availableTools.filter((t) => t.status === 'AVAILABLE').map((t) => t.name),
      requiresApproval: context.availableTools.filter((t) => t.status === 'REQUIRES_APPROVAL').map((t) => t.name),
      requiresConnection: context.availableTools.filter((t) => t.status === 'REQUIRES_CONNECTION').map((t) => t.name),
      blocked: context.blockedTools.map((t) => t.name),
    },
    permissions: {
      role: context.permissions.role,
      allowedActions: context.permissions.allowedActions,
      canAccessFinancials: context.permissions.canAccessFinancials,
    },
    knowledgeScopes: ['GLOBAL', 'INDUSTRY', 'BUSINESS_TYPE', 'WORKSPACE', 'SERVICE'],
    memoryScopes: ['WORKSPACE', 'BUSINESS', 'SERVICE', 'CUSTOMER', 'RECORD'],
    records: context.recordTypes.map((r) => r.name),
    outputDestinations: context.outputDestinations,
    approvalRules: context.availableTools
      .filter((t) => t.requiresApproval)
      .map((t) => ({ action: t.name, reason: t.statusReason || 'Human sign-off required' })),
  };
}

/**
 * Generates a compact, highly targeted system prompt injecting active workspace context.
 */
export function formatContextPromptForAgent(
  context: AgentExecutionContext,
  currentRecord?: { type: string; id: string; data?: Record<string, any> },
  userQuery?: string
): string {
  const t = context.terminology;

  // Render terminology directive
  const terminologyDirectives = [
    `- Address customers/contacts strictly as: "${t.customer?.displayTerm || 'Client'}" (Plural: "${t.customer?.plural || 'Clients'}")`,
    `- Opportunities/deals are referred to as: "${t.deal?.displayTerm || 'Deal'}"`,
    `- Projects/cases are referred to as: "${t.project?.displayTerm || 'Project'}"`,
    `- Invoices/bills are referred to as: "${t.invoice?.displayTerm || 'Invoice'}"`,
  ].join('\n');

  // Render enabled vs disabled services
  const enabledNames = context.enabledServices
    .map((id) => UNIVERSAL_SERVICE_CATALOG[id]?.name || id)
    .join(', ');

  const disabledNames = context.disabledServices
    .slice(0, 10)
    .map((id) => UNIVERSAL_SERVICE_CATALOG[id]?.name || id)
    .join(', ');

  // Render available tools
  const toolList = context.availableTools
    .map(
      (tool) =>
        `- ${tool.name}: ${tool.description} [Status: ${tool.status}, Risk: ${tool.riskLevel}${
          tool.requiresApproval ? ', REQUIRES HUMAN APPROVAL' : ''
        }]`
    )
    .join('\n');

  // Render authoritative business rules
  const rulesList = context.businessRules
    .map((r) => `- [AUTHORITATIVE RULE] ${r.name}: ${r.description}`)
    .join('\n');

  return `You are ${context.agent.name} (${context.agent.role}).
You are operating inside the Business OS platform for:
Workspace: ${context.workspace.name} (ID: ${context.workspace.id}, Version: v${context.configurationVersion})
Industry: ${context.industry}
Business Type: ${context.businessType}

═══════════════════════════════════════════════════════
ACTIVE WORKSPACE TERMINOLOGY (MANDATORY TO USE)
═══════════════════════════════════════════════════════
${terminologyDirectives}
Note: Database models remain standardized internally (e.g. systemObject="customer"), but all user interactions must use the active display terminology.

═══════════════════════════════════════════════════════
SERVICE AWARENESS & CAPABILITIES
═══════════════════════════════════════════════════════
Enabled Capabilities in this Workspace:
${enabledNames || 'None'}

Disabled Services in this Workspace:
${disabledNames || 'None'}

CRITICAL SERVICE REFUSAL RULE:
If the user requests an action, search, or operation for a DISABLED service (such as asking for inventory when inventory is disabled), you MUST NOT hallucinate, pretend, or fabricate results.
You MUST reply directly and honestly:
"<Service Name> is not enabled for this workspace."

═══════════════════════════════════════════════════════
AVAILABLE TOOLS FOR THIS TASK
═══════════════════════════════════════════════════════
${toolList}

═══════════════════════════════════════════════════════
AUTHORITATIVE BUSINESS RULES (DETERMINISTIC — CANNOT OVERRIDE)
═══════════════════════════════════════════════════════
${rulesList || 'No custom business rules active.'}

${
  currentRecord
    ? `═══════════════════════════════════════════════════════
ACTIVE RECORD CONTEXT
═══════════════════════════════════════════════════════
Type: ${currentRecord.type}
ID: ${currentRecord.id}
Data: ${JSON.stringify(currentRecord.data || {})}
`
    : ''
}
Respond with executive conciseness, structured facts, and adhere strictly to your workspace boundary.`;
}
