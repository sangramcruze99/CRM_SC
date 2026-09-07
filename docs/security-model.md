# Security Model, Multi-Tenant Isolation & AI Guardrails

## 1. Multi-Tenant Cryptographic & Logical Isolation
Business OS enforces strict tenant boundary separation across every layer of the software stack:
- **Tenant ID Extraction**:
  - `tenantId` is **never** accepted directly from untrusted client request bodies.
  - It is verified from cryptographic JWT claims, session cookies, or mutual TLS gateway headers.
- **Database Query Guardrails**:
  - Every SQL/Prisma query mandates a `where: { tenantId }` clause.
  - Multi-tenant foreign keys and composite indexes `@@index([tenantId, createdAt])` prevent table scans and cross-tenant leakage.
- **Cache Key Namespace Isolation**:
  - All Redis cache keys use strict namespace prefixing: `tenant:{tenantId}:{entity}:{id}`.
- **Search & Vector Isolation**:
  - Embedding searches and vector indexes filter strictly on `tenant_id` before similarity ranking.

## 2. Authentication & Authorization Pipeline
Every incoming request passes through an immutable security pipeline:
```
1. TLS 1.3 Termination & DDoS Filtering
2. Rate Limiting (IP & Tenant token bucket)
3. JWT Signature & Expiration Verification
4. Tenant Context & Isolation Enforcement
5. Role-Based Access Control (RBAC: Admin, Manager, Member, Read-Only)
6. Subscription Status & Entitlement Gating
7. Usage Headroom Pre-flight Check
8. Human-in-the-Loop Risk Policy Gate (for high-risk mutations)
9. Microservice Action Execution
10. Immutable Audit Logging (SOC2 Type II compliant)
```

## 3. Autonomous AI Security & Safety Gates
AI agents operate under strict sandboxing constraints:
1. **Tool Registry & Schema Validation**:
   - Every AI agent can only invoke tools registered in `AgentToolRegistryService`.
   - All tool arguments must pass Zod / JSON Schema validation.
2. **Permission & Tenant Boundary Check**:
   - Tools inherit the calling tenant's permissions. An agent cannot query or modify another tenant's records under any circumstance.
3. **Prompt Injection & Data Leakage Protection**:
   - System prompts forbid revealing internal instructions, credentials, or billing configurations.
   - PII filtering masks sensitive credit card numbers, SSNs, and passwords before passing prompts to external LLMs.
4. **Human-in-the-Loop (HITL) Safety Gate**:
   - Financial mutations (refunds, large discounts >15%, custom contract modifications, permanent customer deletions) require explicit human operator approval before execution.

## 4. Support Impersonation Protocol
If customer support impersonation is authorized:
- Requires time-limited (max 60 minutes), signed impersonation tokens.
- Displays a persistent, un-dismissible high-visibility amber banner in the UI: *"SUPPORT OPERATOR IMPERSONATION ACTIVE"*.
- All administrative mutations are flagged with `impersonatedBy: operator@businessos.internal` in the immutable audit log.
- Financial actions (Stripe payout changes, card updates, permanent account deletion) are strictly prohibited during support sessions.
