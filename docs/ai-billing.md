# AI Billing, Unit Economics & Autonomous Budgeting

## 1. Provider Cost (COGS) vs Customer Charge Separation
Business OS enforces a strict mathematical separation between:
1. **Raw Provider Cost (COGS)**: What we pay upstream vendors (Groq, OpenRouter, Anthropic) for input, reasoning, and output tokens.
2. **Customer Charge (Revenue)**: What the tenant consumes from their plan quota or pays for overage tokens.

```
                    AI EXECUTION TELEMETRY
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       RAW PROVIDER COST             CUSTOMER CHARGE
     (Groq / OpenRouter)          ($2.00/1M or 2.5x Markup)
               │                             │
               └──────────────┬──────────────┘
                              ▼
                 GROSS MARGIN & UNIT ECONOMICS
                 (Gross Profit = Charge - COGS)
                 (Target Margin: 65% – 98%)
```

## 2. Provider Benchmark Rates (per 1,000,000 Tokens)
| Provider & Model | Input Cost (USD) | Output Cost (USD) | Effective Role |
|---|:---:|:---:|:---|
| **Groq / Llama-3.3-70b-versatile** | $0.05 | $0.08 | Primary ultra-low latency agent reasoning |
| **Groq / Compound** | $0.06 | $0.09 | Multi-step reasoning loops |
| **OpenRouter / Claude-3.5-Sonnet** | $3.00 | $15.00 | Deep strategic synthesis & contract drafting |
| **OpenRouter / Llama-3.3-70b** | $0.12 | $0.30 | Secondary fallback router |
| **Standard Customer Charge** | $2.00 | $2.00 | Base plan token consumption valuation |
| **Protective Markup Policy** | — | — | Minimum 2.5x raw provider cost on premium models |

## 3. Specialized Agent AI Unit Economics Breakdown
Unit economics are measured and aggregated for every autonomous agent:
- **Ares (Sales Intelligence SDR)**:
  - High-frequency lead scoring and cold outreach generation on Groq.
  - Generates high gross margin (>97%).
- **Athena (Customer Success Sentinel)**:
  - Account scanning, ticket triage, and churn prevention on Groq with occasional strategic Claude synthesis.
  - Maintained at ~94% gross margin.
- **Midas (Finance & Accounts Receivable)**:
  - Dual-khata invoice auditing and dunning outreach.
  - ~95% gross margin.
- **Hermes (Autonomous Workflow DAG)**:
  - Background task scheduling and multi-step pipeline execution.
  - ~96% gross margin.
- **Vesta (Enterprise Knowledge & RAG)**:
  - Multimodal document OCR, vector indexing, and contract parsing.
  - ~92% gross margin.

## 4. Autonomous AI Budgets & Hard Guardrails
To prevent recursive runaway agent loops or unanticipated billing surges, each tenant configures multi-level AI budgets:
- **Monthly Budget Cap ($ USD)**: Maximum allowable AI spend in a 30-day window.
- **Daily Velocity Cap ($ USD)**: Prevents single-day spikes.
- **Agent Allocations ($ USD)**: E.g., Ares ($30), Athena ($25), Midas ($15), Others ($30).
- **Threshold State Progression**:
  - `NOMINAL` (<50%): Green status.
  - `THRESHOLD_50` (50%): Early informational notification.
  - `THRESHOLD_75` (75%): Usage advisory.
  - `THRESHOLD_80` (80%): Warning banner displayed in Billing UI.
  - `THRESHOLD_90` (90%): High-priority email notification.
  - `EXHAUSTED` (100%): Triggers policy action.
- **Policy Actions on Exhaustion**:
  - `BLOCK`: Hard stop. Rejects agent prompts and API calls with 403 Forbidden until budget is raised or period resets.
  - `THROTTLE`: Deprioritizes reasoning queues with intentional delay backoffs.
  - `WARN`: Allows execution overages while logging critical audit alerts.
  - `REQUIRE_APPROVAL`: Demands human operator sign-off in the Human-in-the-Loop Safety Gate.

## 5. Emergency AI Kill Switches (`AiKillSwitchesService`)
Server-authoritative kill switches can immediately halt AI capabilities without redeploying code:
- `GLOBAL_AI`: Master workspace switch that freezes all LLM inference across all agents.
- **Agent Switches**: `ares`, `athena`, `midas`, `hermes`, `vesta`.
- **High-Risk Tool Switches**: `crm.delete_customer`, `stripe.refund`, `email.blast`.
- Toggling a switch propagates instantaneously to all agent runtime guards.
