# Task Slug: AI Automation Platform Architecture & Implementation

## Overview
Transform the existing multi-tenant Business OS / CRM into an enterprise AI-powered Business Automation OS where AI agents execute real business workflows across CRM, communications, documents, finance, sales, support, HR, and external services.

## Monorepo Context & System Audit (Phase 1)
- **Apps**: `apps/automation` (Port 3009), `apps/ai-engine` (Port 3010), `apps/crm` (3001), `apps/sales` (3005), `apps/platform` (3008), `apps/chat` (3014), `apps/developer` (3022), `apps/finance` (3015), `apps/helpdesk` (3016), `apps/hr` (3018), `apps/documents` (3020), `apps/audit` (3023), `apps/auth` (3011), `apps/web-core` (4000).
- **Packages**: `@repo/database` (Prisma + SQLite), `@repo/auth`, `@repo/core-types`, `@repo/config`, `@repo/ui`.
- **Existing Event Bus**: `BusinessEventBusService` in `apps/automation/src/event-bus` with `BusinessEvent` envelope, idempotency cache, dead-letter queue.
- **Existing Executor**: `WorkflowProcessor` (BullMQ) & `WorkflowExecutionService` (sequential steps, email via Resend, lead score updates).
- **Existing AI**: `PromptsService` with Groq & OpenRouter integrations, `KnowledgeService`, `OcrService`.
- **Existing Frontend**: Next.js 16 with Tailwind CSS v4, Lucide icons, `@xyflow/react` installed, Next.js API gateway proxy (`/api/[...route]`).

## Gap Matrix & Reuse Strategy
| Requested Capability | Codebase Status | Existing Foundation | Reuse & Extension Strategy |
| :--- | :--- | :--- | :--- |
| **1. Unified Visual Automation Studio** | Partially Exists | Basic `Workflow` schema & preset mock UI in `apps/web-core/src/app/automations` | Build full visual studio with `@xyflow/react` under `/automation/workflows/[id]` with 45+ nodes, config drawers, execution debugger |
| **2. AI Agent Runtime / Builder** | Partially Exists | Hardcoded in-memory `AgentFrameworkService` in `apps/ai-engine` | Implement ReAct tool-calling agent runtime in `apps/ai-engine` with memory, model routing, Prisma persistence |
| **3. WhatsApp Automation** | Partially Exists | Simple Twilio outbound call in `apps/automation/src/actions/twilio.service.ts` | Provider abstraction (`WhatsAppProvider` for Cloud API & Twilio), webhook ingestion, conversation state, AI qualification agent |
| **4. Autonomous Outbound Sales Agent** | Partially Exists | UI prospecting mock in `apps/web-core/src/app/lead-prospector` | Pre-configured agent with multi-channel outreach, ICP qualification, response classifier, cooldown & quotas |
| **5. AI Voice Agent Layer** | Partially Exists | UI dialer in `apps/web-core/src/app/voice` with simulated audio | Real Voice Agent engine with Whisper STT, tool calling, TTS synthesis, summary, sentiment, CRM activity creation |
| **6. Browser Automation Agent** | Missing | None | Sandboxed browser runner in `apps/automation` with secure domain whitelist, action limits, and HITL approval |
| **7. Autonomous Content Optimization Loop** | Partially Exists | UI in `apps/web-core/src/app/content-repurpose` & `social` | Closed-loop content agent: research -> generate -> review -> publish -> analyze metrics -> adapt strategy |
| **8. Recruitment Automation Agent** | Partially Exists | HR schema (`Employee`, `Department`, `OfferLetter`) & OCR | Full hiring agent pipeline: candidate ingest -> resume OCR -> scoring -> interview booking -> scorecard -> offer |
| **9. E-commerce Automation Agent** | Partially Exists | `DataSyncClient.tsx` has Shopify UI card, Retail POS client | Order events, inventory reconciliation, abandoned cart recovery, automated review requests |
| **10. Agent Tool/Action Framework** | Partially Exists | Static string arrays in `AgentDefinition` | Standardized `AgentToolRegistry` with schemas, tenant boundaries, and 4 risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| **11. Human Approval / HITL** | Partially Exists | In-memory `ProposedAction` in `agent-framework.service.ts` | Persistent `ApprovalRequest` system, workflow pause/resume capability, unified Approval Center at `/automation/approvals` |
| **12. Observability & Retry Engine** | Partially Exists | Disk JSON log in `ExecutionPersistenceService` | Node-by-node telemetry, retry policies, exponential backoff, circuit breaker, execution replay UI at `/automation/executions` |
| **13. Connector Framework** | Partially Exists | Ad-hoc Resend/Twilio calls & mock cards in `data-sync` | Extensible `ConnectorRegistry` with auth, schemas, triggers, actions, and `/automation/connectors` UI |

## Execution Roadmap & Phasing
1. **Prisma Schema Extensions**: Add `WorkflowExecution`, `WorkflowExecutionStep`, `WorkflowTrigger`, `WorkflowVariable`, `WorkflowTemplate`, `Agent`, `AgentMemory`, `AgentExecution`, `ApprovalRequest`, `ToolDefinition`, `ToolExecution`, `Connector`, `ConnectorAccount`, `Conversation`, `ConversationMessage`, `BrowserSession`, `BrowserExecution`.
2. **Backend Engine Extensions (`apps/automation`)**:
   - Unified node executor supporting all node categories (Triggers, Logic, AI, Communication, CRM, Documents, External).
   - Tool Permission Registry & HITL pause/resume execution engine.
   - WhatsApp module with provider abstraction & webhook handler.
   - Connector framework with communication, CRM, calendar, ecommerce adapters.
   - Browser agent sandbox.
   - Voice agent session runner.
3. **AI Engine Enhancements (`apps/ai-engine`)**:
   - ReAct Agent Runtime with live tool-calling loop, token budgeting, Groq/OpenRouter provider gateway.
   - Domain agents (Sales, Content, Recruitment, E-commerce, Support).
   - Multi-tier memory store (short-term, long-term, workflow, customer).
4. **API Gateway & Routing**:
   - Ensure all new `/api/automation/*` and `/api/ai/*` routes map cleanly through Next.js proxy with tenant isolation and JWT guards.
5. **Frontend Visual Automation Studio & Suite (`apps/web-core`)**:
   - `/automation/workflows` & `/automation/workflows/[id]` (XYFlow Visual Studio).
   - `/automation/templates` (13 exportable/importable templates).
   - `/automation/executions` (Node-by-node telemetry and inspector).
   - `/automation/approvals` (Approval Center).
   - `/automation/agents` & `/automation/agents/[id]` (AI Agent builder).
   - `/automation/tools` (Tool registry).
   - `/automation/connectors` (Connector configuration).
   - Global navigation updates (SidebarNav, RoleWorkspaceContext).
6. **Testing & Verification**:
   - Build validation across `@repo/database`, `automation`, `ai-engine`, and `web-core`.
   - Automated unit and integration tests.
   - End-to-end workflow execution tests.
