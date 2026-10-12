# Task: Business OS Security Audit & Hardening

**Branch:** `fix/security-audit-hardening`  
**Lead Agent:** `security-auditor`  
**Skills Active:** `vulnerability-scanner`, `clean-code`, `red-team-tactics`, `verify-changes`, `api-patterns`  
**Execution Strategy:** Autonomous Full-Pass (Application-Level Defense-in-Depth, Hardened Dual-Mode Auth)

---

## 8-Phase Execution Roadmap

- [x] **PHASE 1 — Discover the repository & attack surface**
  - [x] Map services (`apps/*`, `packages/*`, `services/*`)
  - [x] Identify entrypoints, HTTP frameworks, database connectors, and background workers
- [x] **PHASE 2 — Map routes, authentication, permissions, data access, uploads, webhooks, secrets, and dependencies**
  - [x] Gateway routing & microservice proxies
  - [x] Authentication (`packages/auth`, `apps/auth`, session & JWT handling)
  - [x] Authorization & multi-tenant isolation (`tenantId` enforcement, BOLA/IDOR)
  - [x] Webhook handlers & signature verification (Stripe, Twilio, external automation)
  - [x] Central Document Vault & file upload / storage security
  - [x] AI Engine tools & prompt injection protections
  - [x] Rate limiting & abuse prevention
  - [x] Secrets & environmental config audit
- [x] **PHASE 3 — Run baseline scans and safe security tests**
  - [x] Run `security_scan.py` baseline
  - [x] Run secret scan across repository
  - [x] Audit dependencies for known vulnerabilities
- [x] **PHASE 4 — Fix critical and high-severity findings first**
  - [x] Injection vulnerabilities (SSRF in automation/webhooks neutralized with `validateSafeUrl` and `safeFetchSsrf`)
  - [x] Auth & Authorization bypasses (eliminated fake SUPERADMIN token fallback in `apps/web-core/src/app/api/[...route]/route.ts`)
  - [x] BOLA/IDOR tenant spoofing (prevented header overrides; verified token tenant matching)
  - [x] Insecure webhook signature verification (enforced HMAC-SHA256 signature checks on Stripe webhooks)
  - [x] User registration tenant hijacking & privilege escalation fixed in `apps/auth/src/users/users.service.ts`
- [x] **PHASE 5 — Fix medium and low-severity findings**
  - [x] Hardened JWT configuration (`algorithms: ['HS256']`, timing-safe signature comparison, dual-mode cookies)
  - [x] Stored/DOM XSS neutralized with HTML sanitizer in `apps/web-core/src/lib/richTextRenderer.ts` and `EmailRichTextToolbar.tsx`
  - [x] Sensitive data redaction (passwords, tokens, keys) in `packages/database/src/audit.middleware.ts`
  - [x] AI Agent Tool BOLA/IDOR and human approval gating enforced in `apps/ai-engine/src/agents/agent-tool-registry.service.ts`
  - [x] Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS) added to `apps/web-core/next.config.ts`
  - [x] CORS restrictiveness added to `apps/gateway/src/main.ts`
  - [x] Gateway distributed rate limiting via `GatewayThrottlerGuard` with burst (25 req/s) and sustained (300 req/min) limits
  - [x] CSRF protections for cookie-authenticated mutating requests with `sec-fetch-site` and `Origin`/`Referer` matching
  - [x] Document Vault magic bytes verification and EICAR anti-malware hook in `apps/documents/src/documents/storage-path.util.ts`
  - [x] Webhook timestamp tolerance window (5 min) added to Stripe signature verification to prevent replay attacks
  - [x] Next.js dependency advisory resolved by upgrading `@repo/web-core` to Next.js 16.3.8
- [x] **PHASE 6 — Add regression tests and verify cross-service behavior**
  - [x] Automated security regression suite `scripts/verify-security-hardening.mjs` (29 tests across 10 security suites covering SSRF, XSS, JWT alg confusion, audit redaction, webhook HMAC & replay, Document Vault path traversal & magic bytes, tenant isolation, AI prompt boundaries, and CSRF) — 100% PASS (29/29)
- [x] **PHASE 7 — Run existing application tests and build checks**
  - [x] AI engine unit tests (34 tests passed)
  - [x] CRM unit tests passed
  - [x] Auth unit tests passed
  - [x] Documents unit tests passed
  - [x] Full workspace turbo build (31 of 31 projects built successfully)
  - [x] Full TypeScript typecheck across `@repo/web-core` passed with 0 errors
- [x] **PHASE 8 — Final security regression & evidence-backed report**
  - [x] Comprehensive evidence-backed security report produced

