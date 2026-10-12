# Enterprise Services Expansion: 5 New Microservices & Notification Center UI

## Executive Summary
This task delivers a major expansion to Business OS by scaffolding and integrating 5 new enterprise-grade microservices and delivering an interactive Topbar Notification Center in the web application.

---

## 1. Scope & Services
1. **`apps/notifications` (Port 3028)** - Unified Notification & Alerting Hub (Prisma model, categories, SSE/REST, read/unread status).
2. **`apps/portal` (Port 3029)** - Client Extranet & Self-Service Portal (Client login, invoice payment, e-signatures, support tickets).
3. **`apps/gateway` (Port 3000)** - Enterprise API Gateway & Security Perimeter (Routing, rate limiting, quota validation).
4. **`apps/storage` (Port 3031)** - Media, Object Storage & Document Asset Engine (Presigned URLs, asset streaming, metadata).
5. **`apps/events` (Port 3032)** - Transactional Event Broker & PubSub Mesh (Domain events, subscriptions, replay, outbox dispatch).
6. **Next.js Gateway & Polish** - Add `python-ai` (3030) and all 5 new services to `[...route]/route.ts` proxy map.
7. **Interactive Notification Center UI** - Glassmorphism topbar bell, categorized tabs (Approvals, System, Billing, CRM), unread count pill, and quick-action links.
8. **AG Kit Manifest Synchronization** - Regenerate `manifest.lock.json` and verify with `validate_kit.py`.

---

## 2. Implementation Checklist
- [x] Step 1: Add `model Notification` to `packages/database/prisma/schema.prisma` & regenerate Prisma client.
- [x] Step 2: Scaffold `apps/notifications` (Port 3028) with NestJS controller, service, module, and endpoints.
- [x] Step 3: Scaffold `apps/portal` (Port 3029) with NestJS client extranet endpoints.
- [x] Step 4: Scaffold `apps/gateway` (Port 3000) with rate-limiting & reverse routing.
- [x] Step 5: Scaffold `apps/storage` (Port 3031) with presigned uploads & asset management.
- [x] Step 6: Scaffold `apps/events` (Port 3032) with domain event publish & subscription broker.
- [x] Step 7: Update `scripts/dev-services.mjs` & `packages/config/src/index.ts` to register all new services in the mesh.
- [x] Step 8: Update `apps/web-core/src/app/api/[...route]/route.ts` with `python-ai` and new services.
- [x] Step 9: Build `<NotificationCenter />` glassmorphism component in `apps/web-core/src/components/NotificationCenter.tsx`.
- [x] Step 10: Wire `<NotificationCenter />` into `WorkspaceShell.tsx` header (Zone 3).
- [x] Step 11: Sync AG Kit lockfile (`py .agents/scripts/generate_manifest.py`).
- [x] Step 12: Verify builds and TypeScript check across all updated projects.
