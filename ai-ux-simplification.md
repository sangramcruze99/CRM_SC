# AI UX Simplification & Human-Centered AI Control Layer

## Executive Summary
This document establishes the architecture, UI/UX specifications, and implementation plan for the **Human AI Control Layer** on top of the production Business OS / CRM SaaS. 

The objective is to make the entire enterprise AI ecosystem feel like having a **team of intelligent digital employees**, completely hiding underlying engineering complexities (agents, RAG, embeddings, vector databases, DAGs, token budgets, ReAct loops) behind simple, outcome-driven business controls.

---

## 1. Core Principles & Philosophy

### Language Transformation
| Engineering Concept | Human-Centered Replacement |
| :--- | :--- |
| Agent / Swarm | **AI Assistant / Digital Employee / AI Team** |
| Configure AI | **Tell AI what you want done** |
| Tool permissions & Risk classes | **What AI is allowed to do / Approval settings** |
| DAG / Workflow configuration | **Goal / Automation** |
| Model selection & Provider router | **⚡ Fast / ⚖️ Balanced / 🧠 Best** |
| Token limits & Metering | **AI usage & Monthly spending allowance** |
| Agent execution / Trace | **AI activity & Outcome report** |
| RAG Retrieval & Vector store | **What AI knows about your business** |

### The Three AI Autonomy Levels
1. **👀 RECOMMEND**: AI observes data and proactively gives recommendations; makes no changes.
2. **🤝 ASSIST**: AI drafts messages, prepares tasks, and stages changes for you to review and approve.
3. **⚡ AUTOPILOT**: AI completes approved routine actions automatically within strict, predefined safety boundaries.

---

## 2. Information Architecture & Navigation

### Customer AI Experience (`/ai`)
- **`/ai` (AI Command Center & Home)**:
  - Natural language "Ask AI anything" universal search/input bar.
  - Proactive "Good Morning / AI Today" briefing card with real data alerts (stalled deals, at-risk customers, overdue invoices).
  - Quick action suggestion chips.
  - At-a-glance AI Team status.
- **`/ai/team` (My AI Team)**:
  - Department cards: **Sales AI (Ares)**, **Customer Success AI (Athena)**, **Finance AI (Midas)**, **Support AI**, **Operations AI**, **Marketing AI**.
  - 3 Autonomy level toggles per department.
  - 3-Step Setup Wizard for new departments with real data preview.
- **`/ai/approvals` (Central Human Approval Center)**:
  - Centralized queue of staged actions waiting for human authorization.
  - Filtered by department.
  - One-click *Approve*, *Edit*, *Reject*.
  - Plain-English "Why this action?" explanation with collapsible progressive disclosure for technical details.
- **`/ai/activity` (AI Activity Timeline)**:
  - Real-time audit timeline of completed actions, recommendations, and decisions.
  - Natural explanations of what happened, why, and what result was produced.
- **`/ai/automations` (Conversational Automations & Templates)**:
  - "Describe an automation" natural language builder.
  - Visual stage preview (Trigger ➔ Decision ➔ Action) without complex node wiring.
  - 1-Click enterprise templates (stalled deal recovery, churn prevention, invoice reminders).
- **`/ai/usage` (Simple AI Usage & Limits)**:
  - Visual monthly budget gauge ($ used vs. $ allowance).
  - Department breakdown.
  - Quality selector (Fast / Balanced / Best).
  - "When limit is reached" policy selector.
- **`/ai/knowledge` (Business Knowledge & Memory)**:
  - "What AI knows about your business" (Documents, policies, company profile, communication style).
- **`/ai/trust` (Trust Center & Global Emergency Controls)**:
  - Clear boundaries of what AI can/cannot access or change.
  - **Emergency Pause AI** global switch.

### Developer / Power User Separation
All existing deep technical consoles remain 100% intact and accessible under the Platform/Developer section:
- `/ai-agents` (Fleet governance, model tuning, raw tool manifests)
- `/ai-studio` (Prompt engineering & evaluation)
- `/automation` (Raw workflow builder & BullMQ telemetry)
- `/observability` (Service mesh logs & distributed traces)

---

## 3. UI Component Specifications

### 3.1 AI Command Center (`apps/web-core/src/app/ai/page.tsx`)
- **Ask AI Input**: Full-width interactive input with keyboard shortcut hint (`⌘K`), quick prompt presets, loading skeleton, and streaming/instant response rendering.
- **Today's Action Feed**: Cards generated from live CRM data:
  - 🔥 Stalled deal follow-up
  - 💰 Overdue invoice collection
  - ❤️ At-risk customer check-in
  - 📩 Unanswered lead follow-up

### 3.2 AI Team Roster (`apps/web-core/src/app/ai/team/page.tsx`)
- Cards for each department showing:
  - Name, friendly avatar/icon, description of business value.
  - Active autonomy mode badge (`Recommend` / `Assist` / `Autopilot`).
  - Today's metrics (e.g., "12 opportunities reviewed", "4 follow-ups prepared").
  - Primary button: "Configure AI Assistant" (opens the 3-step setup wizard).

### 3.3 Setup Wizard Modal (`apps/web-core/src/components/ai/AiSetupWizardModal.tsx`)
- **Step 1**: "What do you want help with?" (Friendly checkboxes: e.g. "Find stalled deals", "Draft follow-ups", "Score leads").
- **Step 2**: "How much should AI do?" (Select one of the 3 Autonomy Levels).
- **Step 3**: Boundaries & Real Data Preview:
  - Shows clear "AI will" and "AI will NOT" lists.
  - Fetches real data (e.g., 3 actual deals that match) and shows preview of proposed action.
  - Final "Enable Assistant" confirmation.

### 3.4 Approval Center (`apps/web-core/src/app/ai/approvals/page.tsx`)
- Connects directly to `GET /api/automation/approvals?status=PENDING`.
- Card layout with:
  - Target entity title (e.g., Customer Name, Invoice #, Deal Name).
  - Department badge (e.g., "Sales AI").
  - Content preview (e.g., draft email or field change).
  - "Why did AI do this?" box.
  - Action buttons: `Approve` (`POST /approvals/:id/approve`), `Reject` (`POST /approvals/:id/reject`), `Edit`.

### 3.5 Global Shortcut & Record Contextual AI
- **Global `Ctrl+K / ⌘K` Modal**: Opens universal conversational bar from any page.
- **Record AI Menu Component (`apps/web-core/src/components/ai/RecordAiMenu.tsx`)**:
  - Drops into CRM Contact, Deal, and Invoice detail headers.
  - Contextual actions: *Summarize*, *Explain next step*, *Draft message*, *Create task*.

---

## 4. API & Backend Integration Plan

### New Human AI Control Proxy Endpoints
1. `GET /api/ai/control/overview`: Aggregates active departments, pending approvals count, today's metrics, and proactive alerts from CRM, Sales, and Finance databases.
2. `POST /api/ai/control/ask`: Natural language intent router that analyzes business queries, dispatches to the corresponding service/department, and formats the output into clean conversational responses with actionable follow-up buttons.
3. `GET /api/ai/control/team`: Fetches digital employee departments, active autonomy levels, and today's activity stats.
4. `PATCH /api/ai/control/team/:departmentId`: Updates department autonomy mode and enabled capabilities.
5. `POST /api/ai/control/pause`: Toggles global emergency pause state.
6. `GET /api/ai/control/usage`: Computes simple monthly allowance usage, department cost breakdown, and spending limits from the billing database.

---

## 5. Verification & Testing Plan
1. **Automated User Scenarios**:
   - Verify `/ai` loads without technical jargon.
   - Verify natural language query to "Find deals that need attention" returns real opportunities.
   - Verify enabling a digital employee via Setup Wizard updates autonomy level.
   - Verify approving an action in `/ai/approvals` executes properly and updates status.
   - Verify emergency pause halts autonomous executions.
2. **Quality Verification**:
   - TypeScript compilation (`pnpm --filter @repo/web-core build`).
   - Lint & style check.
   - Responsive verification on mobile & desktop viewports.
