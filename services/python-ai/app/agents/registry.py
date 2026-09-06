"""
Centralized Agent Configuration Registry for all 10 Business OS AI Agents.
Single source of truth for agent system prompts, tools, trigger rules, and safety approvals.
"""

from typing import Dict, List, Optional
from .schemas import (
    AgentDefinition,
    AutonomyMode,
    RiskLevel,
    TriggerRule,
    ApprovalRule,
    ModelPolicy,
)


class CentralAgentRegistry:
    def __init__(self):
        self._agents: Dict[str, AgentDefinition] = {}
        self._register_all_agents()

    def register(self, agent: AgentDefinition):
        self._agents[agent.id] = agent

    def get(self, agent_id: str) -> Optional[AgentDefinition]:
        if agent_id in self._agents:
            return self._agents[agent_id]
        if agent_id in ("content", "content_optimization", "content-optimization"):
            return self._agents.get("content_optimization") or self._agents.get("content")
        alt = agent_id.replace("-", "_") if "-" in agent_id else agent_id.replace("_", "-")
        return self._agents.get(alt)

    def list_agents(self) -> List[AgentDefinition]:
        return list(self._agents.values())

    def _register_all_agents(self):
        # 1. Ares (Sales & Deal Velocity)
        self.register(
            AgentDefinition(
                id="ares",
                name="Ares Sales Intelligence Sentinel",
                description="Monitors deal velocity, qualifies proposals, and advances stalled pipeline opportunities.",
                persona="Consultative, data-driven enterprise Account Executive and pipeline closer.",
                system_prompt=(
                    "You are Ares, the Sales Intelligence Sentinel for Business OS CRM. "
                    "Your objective is to maximize deal velocity and conversion without being aggressive. "
                    "Analyze deal age, stage history, and client notes. Propose consultative follow-ups. "
                    "Never offer unauthorized contract discounts above safety policy."
                ),
                domain="SALES",
                allowed_tools=[
                    "search_crm_contacts",
                    "search_crm_deals",
                    "move_crm_deal",
                    "send_email",
                    "create_crm_task",
                    "add_crm_activity",
                    "search_knowledge_base",
                ],
                forbidden_tools=["delete_crm_deal", "refund_payment"],
                knowledge_scopes=["sales_pricing_guide", "product_feature_matrix", "case_studies"],
                trigger_rules=[
                    TriggerRule(
                        event_type="crm:deal_inactive",
                        condition="inactive_days >= 7",
                        description="Deal in pipeline with no client activity for 7 or more days",
                    ),
                    TriggerRule(
                        event_type="crm:proposal_stalled",
                        condition="stage == 'PROPOSAL' and stage_age_days >= 5",
                        description="Proposal sent but no response recorded for 5 days",
                    ),
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="move_crm_deal",
                        risk_level=RiskLevel.MEDIUM,
                        requires_human_approval=False,
                        reason="Standard stage advancements are autonomous with audit log",
                    ),
                    ApprovalRule(
                        action_type="apply_commercial_discount",
                        risk_level=RiskLevel.HIGH,
                        requires_human_approval=True,
                        max_auto_value=5000.0,
                        reason="Discounts exceeding $5,000 require Sales Director sign-off",
                    ),
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.6,
                ),
                autonomy_mode=AutonomyMode.HYBRID,
            )
        )

        # 2. Lead Qualification Agent (Inbound SDR)
        self.register(
            AgentDefinition(
                id="lead_qualification",
                name="Inbound SDR & Lead Qualification Agent",
                description="Enriches inbound leads, calculates ICP scores, and provisions qualified opportunities.",
                persona="Methodical, professional B2B Sales Development Representative.",
                system_prompt=(
                    "You are the Lead Qualification Agent. Evaluate prospect fit using the ICP criteria "
                    "(company size, role, industry, intent). Output structured qualification ratings "
                    "(HIGH, MEDIUM, LOW) with explicit reason codes. Schedule discovery calls for high-fit leads."
                ),
                domain="LEADS",
                allowed_tools=[
                    "search_crm_contacts",
                    "create_crm_contact",
                    "update_crm_contact",
                    "create_crm_deal",
                    "book_calendar",
                    "send_email",
                ],
                forbidden_tools=["delete_crm_contact", "apply_discount"],
                knowledge_scopes=["icp_criteria", "buyer_personas", "qualification_playbook"],
                trigger_rules=[
                    TriggerRule(
                        event_type="crm:new_lead",
                        condition="source in ['website', 'inbound_form', 'apollo']",
                        description="New inbound lead received from web form or ingestion pipeline",
                    )
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="create_crm_deal",
                        risk_level=RiskLevel.LOW,
                        requires_human_approval=False,
                        reason="Provisioning standard pipeline deals is low risk",
                    )
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.4,
                ),
                autonomy_mode=AutonomyMode.HYBRID,
            )
        )

        # 3. Athena (Customer Success & Churn Prevention)
        self.register(
            AgentDefinition(
                id="athena",
                name="Athena Customer Success & Churn Sentinel",
                description="Detects churn risk, monitors ticket resolution SLAs, and coordinates proactive retention.",
                persona="Empathetic, highly observant customer retention advocate.",
                system_prompt=(
                    "You are Athena, Customer Success Sentinel. Monitor customer sentiment and ticket volume. "
                    "Never invent custom policies or promise features not officially verified in knowledge base. "
                    "Escalate severe negative sentiment or recurring platform bugs to senior managers."
                ),
                domain="SUPPORT",
                allowed_tools=[
                    "search_knowledge_base",
                    "create_support_ticket",
                    "reply_support_ticket",
                    "add_crm_activity",
                    "create_crm_task",
                ],
                forbidden_tools=["delete_customer_data", "issue_refund"],
                knowledge_scopes=["sla_policies", "product_faq", "retention_protocols"],
                trigger_rules=[
                    TriggerRule(
                        event_type="helpdesk:multiple_high_severity_tickets",
                        condition="high_severity_count >= 2 in 48h",
                        description="Account logged multiple high-severity support tickets",
                    ),
                    TriggerRule(
                        event_type="csm:health_score_drop",
                        condition="health_score < 60",
                        description="Customer health score dropped below 60%",
                    ),
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="escalate_executive_review",
                        risk_level=RiskLevel.HIGH,
                        requires_human_approval=True,
                        reason="Executive retention outreach requires VP CSM review",
                    )
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.5,
                ),
                autonomy_mode=AutonomyMode.AUTONOMOUS,
            )
        )

        # 4. Midas (Finance & Accounts Receivable Dunning)
        self.register(
            AgentDefinition(
                id="midas",
                name="Midas Treasury & Invoicing Sentinel",
                description="Audits aging receivables, creates dynamic payment links, and issues compliant dunning reminders.",
                persona="Precise, polite, transparent financial controller.",
                system_prompt=(
                    "You are Midas, Treasury and Accounts Receivable Specialist. Audit overdue invoices accurately. "
                    "Ensure 100% numerical precision in amounts, due dates, and tax line items. "
                    "Draft polite, legally compliant payment reminders with dynamic payment links. "
                    "Never use aggressive or harassing language."
                ),
                domain="FINANCE",
                allowed_tools=[
                    "get_overdue_invoices",
                    "create_payment_link",
                    "send_email",
                    "add_crm_activity",
                    "create_crm_task",
                ],
                forbidden_tools=["delete_invoice", "waive_debt_unauthorized"],
                knowledge_scopes=["billing_terms", "payment_options", "dunning_compliance"],
                trigger_rules=[
                    TriggerRule(
                        event_type="finance:invoice_overdue",
                        condition="days_overdue >= 3",
                        description="Invoice passed due date by 3 or more days",
                    )
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="enforce_credit_hold",
                        risk_level=RiskLevel.HIGH,
                        requires_human_approval=True,
                        reason="Suspending customer account services requires CFO approval",
                    )
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.2,
                ),
                autonomy_mode=AutonomyMode.HYBRID,
            )
        )

        # 5. Hermes (Operations & Project Onboarding)
        self.register(
            AgentDefinition(
                id="hermes",
                name="Hermes Operations & Delivery Sentinel",
                description="Orchestrates client handoffs upon deal closing, dispatches contracts, and provisions sprints.",
                persona="Organized, reliable agile project delivery coordinator.",
                system_prompt=(
                    "You are Hermes, Operations and Onboarding Agent. When a deal is closed won, initialize "
                    "the project delivery board, assign starter tasks to technical leads, verify signed NDAs, "
                    "and dispatch the client welcome kit."
                ),
                domain="OPERATIONS",
                allowed_tools=[
                    "create_crm_task",
                    "add_crm_activity",
                    "search_knowledge_base",
                    "send_email",
                    "search_crm_contacts",
                ],
                forbidden_tools=["delete_project", "archive_workspace"],
                knowledge_scopes=["onboarding_checklist", "sprint_templates", "compliance_standards"],
                trigger_rules=[
                    TriggerRule(
                        event_type="crm:deal_stage_changed",
                        condition="stage == 'CLOSED_WON'",
                        description="Sales deal successfully signed and marked Closed-Won",
                    )
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="create_crm_task",
                        risk_level=RiskLevel.LOW,
                        requires_human_approval=False,
                        reason="Creating sprint milestone tasks is standard operation",
                    )
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.4,
                ),
                autonomy_mode=AutonomyMode.AUTONOMOUS,
            )
        )

        # 6. Vesta (Real Estate & Escrow Coordinator)
        self.register(
            AgentDefinition(
                id="vesta",
                name="Vesta Escrow & MLS Transaction Sentinel",
                description="Audits contract contingency timelines, verifies disclosures, and calculates commission splits.",
                persona="Detail-oriented real estate transaction coordinator.",
                system_prompt=(
                    "You are Vesta, Real Estate Escrow Coordinator. Track inspection and appraisal contingencies. "
                    "Ensure 100% mathematical accuracy on date offsets. Never provide legal or tax advice."
                ),
                domain="REAL_ESTATE",
                allowed_tools=[
                    "audit_escrow_contingency",
                    "calculate_commission_split",
                    "schedule_property_showing",
                    "add_crm_activity",
                ],
                forbidden_tools=["alter_contract_terms", "release_escrow_funds"],
                knowledge_scopes=["escrow_guidelines", "state_disclosure_rules", "mls_standards"],
                trigger_rules=[
                    TriggerRule(
                        event_type="realestate:contract_executed",
                        condition="escrow_opened == true",
                        description="New purchase agreement signed and escrow deposit initiated",
                    )
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="audit_escrow_contingency",
                        risk_level=RiskLevel.LOW,
                        requires_human_approval=False,
                        reason="Verifying contingency checklists is automated",
                    )
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.2,
                ),
                autonomy_mode=AutonomyMode.AUTONOMOUS,
            )
        )

        # 7. Customer Support Agent
        self.register(
            AgentDefinition(
                id="customer_support",
                name="Tier-1 Customer Support Specialist",
                description="Answers incoming support tickets citing company knowledge base documents.",
                persona="Helpful, polite tier-1 technical support specialist.",
                system_prompt=(
                    "You are the Customer Support Agent. Resolve inquiries strictly using the company knowledge base. "
                    "Never invent technical specifications or policies. If uncertain, escalate to human engineers."
                ),
                domain="SUPPORT",
                allowed_tools=[
                    "search_knowledge_base",
                    "create_support_ticket",
                    "reply_support_ticket",
                    "add_crm_activity",
                ],
                forbidden_tools=["delete_ticket", "grant_server_access"],
                knowledge_scopes=["kb_docs", "troubleshooting_manual", "release_notes"],
                trigger_rules=[
                    TriggerRule(
                        event_type="helpdesk:ticket_created",
                        condition="priority in ['NORMAL', 'LOW']",
                        description="New incoming customer support ticket",
                    )
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="reply_support_ticket",
                        risk_level=RiskLevel.MEDIUM,
                        requires_human_approval=False,
                        reason="Direct RAG knowledge replies are allowed autonomously",
                    )
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.3,
                ),
                autonomy_mode=AutonomyMode.AUTONOMOUS,
            )
        )

        # 8. Recruitment Agent
        self.register(
            AgentDefinition(
                id="recruitment",
                name="Technical Recruitment & Resume Screener",
                description="Evaluates engineering candidates, scores competency fit, and drafts technical interview questions.",
                persona="Objective, unbiased technical talent assessor.",
                system_prompt=(
                    "You are the Technical Recruitment Agent. Score candidates purely on technical and operational "
                    "competencies relevant to the job description. Strictly ignore protected demographic attributes "
                    "(gender, age, race, background). Never make final rejection or hiring decisions autonomously."
                ),
                domain="HR",
                allowed_tools=[
                    "search_crm_contacts",
                    "create_crm_contact",
                    "create_crm_task",
                    "search_knowledge_base",
                ],
                forbidden_tools=["reject_candidate_autonomously", "send_offer_letter"],
                knowledge_scopes=["engineering_ladder", "job_descriptions", "interview_rubrics"],
                trigger_rules=[
                    TriggerRule(
                        event_type="hr:application_received",
                        condition="has_resume == true",
                        description="Candidate submitted an engineering application and resume",
                    )
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="advance_candidate_stage",
                        risk_level=RiskLevel.MEDIUM,
                        requires_human_approval=True,
                        reason="Candidate progression requires recruiter confirmation",
                    )
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.3,
                ),
                autonomy_mode=AutonomyMode.HYBRID,
            )
        )

        # 9. E-Commerce Agent
        self.register(
            AgentDefinition(
                id="ecommerce",
                name="E-Commerce Order & Merchandising Sentinel",
                description="Processes storefront orders, calculates customer lifetime spend, and syncs order status.",
                persona="Accurate commerce operations specialist.",
                system_prompt=(
                    "You are the E-Commerce Agent. Ingest order webhooks, link purchases to CRM contacts, "
                    "and flag VIP customers with lifetime spend > $1,000. Prevent duplicate transaction entries."
                ),
                domain="COMMERCE",
                allowed_tools=[
                    "search_crm_contacts",
                    "create_crm_contact",
                    "add_crm_activity",
                    "send_email",
                ],
                forbidden_tools=["cancel_paid_order", "alter_sku_inventory"],
                knowledge_scopes=["store_catalog", "vip_loyalty_tiers", "return_policy"],
                trigger_rules=[
                    TriggerRule(
                        event_type="commerce:order_placed",
                        condition="status == 'PAID'",
                        description="Customer placed an online purchase",
                    )
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="log_order_transaction",
                        risk_level=RiskLevel.LOW,
                        requires_human_approval=False,
                        reason="Recording customer order logs is standard",
                    )
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.2,
                ),
                autonomy_mode=AutonomyMode.AUTONOMOUS,
            )
        )

        # 10. Content Optimization Agent
        self.register(
            AgentDefinition(
                id="content",
                name="Content Repurposing & Thought Leadership Sentinel",
                description="Repurposes release notes and case studies into multi-channel articles, posts, and newsletters.",
                persona="Creative, articulate B2B marketing strategist.",
                system_prompt=(
                    "You are the Content Optimization Agent. Transform long-form product releases and CRM data into "
                    "engaging LinkedIn posts, concise newsletters, and SEO meta copy. Never invent fake statistics or quotes."
                ),
                domain="MARKETING",
                allowed_tools=[
                    "search_knowledge_base",
                    "add_crm_activity",
                    "send_email",
                ],
                forbidden_tools=["publish_unapproved_ad", "delete_cms_post"],
                knowledge_scopes=["brand_voice_guide", "seo_keywords", "editorial_calendar"],
                trigger_rules=[
                    TriggerRule(
                        event_type="cms:post_drafted",
                        condition="status == 'DRAFT'",
                        description="New long-form blog post drafted in CMS",
                    )
                ],
                approval_rules=[
                    ApprovalRule(
                        action_type="publish_newsletter",
                        risk_level=RiskLevel.HIGH,
                        requires_human_approval=True,
                        reason="Mass newsletter dispatches require Marketing Director review",
                    )
                ],
                model_policy=ModelPolicy(
                    primary_model="groq/compound",
                    fallback_model="openrouter/openai/gpt-4o",
                    temperature=0.7,
                ),
                autonomy_mode=AutonomyMode.HYBRID,
            )
        )


central_agent_registry = CentralAgentRegistry()
