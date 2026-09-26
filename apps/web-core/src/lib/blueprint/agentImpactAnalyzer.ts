// apps/web-core/src/lib/blueprint/agentImpactAnalyzer.ts
/**
 * Workspace Configuration → Agent Impact Analysis Engine
 * Evaluates the downstream blast radius on AI Agents, Workflows, Tools, and Dashboards
 * when a workspace service is disabled, removed, or changed.
 */

import { AgentConfigurationImpact } from '@repo/core-types';
import { NicheBlueprint } from './blueprintModel';
import { UNIVERSAL_SERVICE_CATALOG } from '../services/serviceCatalog';
import { SERVICE_TOOL_DEFINITIONS } from './agentContextResolver';
import { BUSINESS_AGENTS } from '../agents.config';

/**
 * Mapping of Business Agents to their primary dependent services
 */
const AGENT_SERVICE_DEPENDENCIES: Record<string, string[]> = {
  midas: ['srv_invoices_billing', 'srv_invoicing_ledger', 'srv_contacts', 'srv_healthcare_patients'],
  ares: ['srv_deals_pipeline', 'srv_pipeline_deals', 'srv_contacts', 'srv_b2b_prospector', 'srv_realestate_listings'],
  athena: ['srv_customer_360', 'srv_contacts', 'srv_support_desk', 'srv_helpdesk_sla'],
  support: ['srv_support_desk', 'srv_helpdesk_sla', 'srv_contacts', 'srv_marketing_studio', 'srv_omnichannel_comms'],
  recruitment: ['srv_recruitment_pipeline', 'srv_hr_people', 'srv_contacts'],
  csm: ['srv_customer_360', 'srv_contacts'],
  ecommerce: ['srv_retail_pos_cashier', 'srv_pos_checkout', 'srv_inventory_stock'],
  ops: ['srv_projects_tasks', 'srv_internal_tasks', 'srv_project_sprints'],
  front_desk: ['srv_healthcare_appointments', 'srv_calendar_meetings', 'srv_restaurant_floor_kds', 'srv_realestate_rentals', 'srv_contacts', 'srv_healthcare_patients'],
};

/**
 * Computes the blast radius when changing enabled services on a workspace blueprint.
 */
export function analyzeConfigurationImpact(
  currentBlueprint: NicheBlueprint,
  proposedDisabledServiceIds: string[]
): AgentConfigurationImpact {
  const disabledSet = new Set(proposedDisabledServiceIds);
  const affectedTools: string[] = [];
  const affectedAgents: AgentConfigurationImpact['affectedAgents'] = [];
  const affectedWorkflows: AgentConfigurationImpact['affectedWorkflows'] = [];
  const affectedDashboards: string[] = [];
  const affectedReports: string[] = [];
  const blockingReasons: string[] = [];

  // 1. Identify Affected Tools
  for (const srvId of proposedDisabledServiceIds) {
    const tools = SERVICE_TOOL_DEFINITIONS[srvId] || [];
    for (const t of tools) {
      if (!affectedTools.includes(t.name)) {
        affectedTools.push(t.name);
      }
    }
  }

  // 2. Identify Affected Agents
  for (const [agentKey, agentMeta] of Object.entries(BUSINESS_AGENTS)) {
    const requiredServices = AGENT_SERVICE_DEPENDENCIES[agentKey] || [];
    const disabledForAgent = requiredServices.filter((srv) => disabledSet.has(srv));

    if (disabledForAgent.length > 0) {
      const agentToolsDisabled = disabledForAgent.flatMap(
        (srv) => (SERVICE_TOOL_DEFINITIONS[srv] || []).map((t) => t.name)
      );

      const isCritical = disabledForAgent.length === requiredServices.length;

      affectedAgents.push({
        agentId: agentMeta.id,
        agentName: agentMeta.friendlyName,
        impactLevel: isCritical ? 'CRITICAL' : 'MODERATE',
        impactDetails: disabledForAgent.map(
          (srv) => `Loses access to ${UNIVERSAL_SERVICE_CATALOG[srv]?.name || srv}`
        ),
        disabledTools: agentToolsDisabled,
      });

      if (isCritical) {
        blockingReasons.push(
          `Agent "${agentMeta.friendlyName}" will be completely disabled because all required services are deactivated.`
        );
      }
    }
  }

  // 3. Identify Affected Workflows
  for (const wf of currentBlueprint.workflowTemplates || []) {
    for (const reqSrv of wf.requiredServiceIds) {
      if (disabledSet.has(reqSrv)) {
        affectedWorkflows.push({
          workflowId: wf.id,
          workflowName: wf.name,
          missingServiceId: reqSrv,
        });
        break;
      }
    }
  }

  // 4. Identify Affected Dashboard Widgets
  for (const widget of currentBlueprint.dashboards || []) {
    if (widget.dataSource && disabledSet.has(widget.dataSource)) {
      affectedDashboards.push(widget.title);
    }
  }

  // 5. Identify Affected Reports
  for (const rep of currentBlueprint.reports || []) {
    if (rep.dataSource && disabledSet.has(rep.dataSource)) {
      affectedReports.push(rep.title);
    }
  }

  const canSafelyApply = affectedAgents.every((a) => a.impactLevel !== 'CRITICAL');

  return {
    affectedAgents,
    affectedWorkflows,
    affectedTools,
    affectedDashboards,
    affectedReports,
    canSafelyApply,
    blockingReasons,
  };
}
