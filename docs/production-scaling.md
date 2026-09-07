# Production Scaling & Microservice Architecture

## 1. Scale Targets
The platform architecture is designed to scale horizontally across tenant tiers without requiring foundational redesign:
- **Phase 1**: 1 – 100 Tenants (Current Architecture).
- **Phase 2**: 1,000 – 10,000 Tenants (Connection pooling, Redis cluster, read replicas).
- **Phase 3**: 100,000+ Tenants (Tenant database sharding, geo-distributed cell architecture).

## 2. Horizontal Scaling Blueprint
```
                              INTERNET
                                 │
                     Cloudflare Global Anycast
                                 │
                     ALB / Ingress Controller
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
      Web Core Pod 1        Web Core Pod 2        Web Core Pod N
      (Next.js :4000)       (Next.js :4000)       (Next.js :4000)
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 │
              Internal Microservice Mesh (ClusterIP)
                                 │
      ┌─────────────┬────────────┼────────────┬─────────────┐
      ▼             ▼            ▼            ▼             ▼
   Billing         CRM         Sales      AI Engine     Automation
   (NestJS)      (NestJS)     (NestJS)     (NestJS)      (NestJS)
    :3027         :3001        :3005        :3010         :3009
      │             │            │            │             │
      └─────────────┴────────────┼────────────┴─────────────┘
                                 │
                        PgBouncer / Redis
                                 │
                   PostgreSQL Primary + Replicas
```

## 3. Key Scalability Pillars
1. **Stateless Service Layer**:
   - All 21 microservices are strictly stateless. Sessions and JWT tokens are verified cryptographically with zero sticky sessions.
   - Pods scale horizontally via Kubernetes HPA based on CPU (>70%) and request latency (>200ms).
2. **Asynchronous Non-Blocking Execution**:
   - Heavy operations (billing reconciliation, bulk usage aggregation, AI batch scoring, PDF generation) are offloaded to background workers via Redis/BullMQ.
   - Synchronous HTTP request handlers complete in under 50ms.
3. **Database Connection Pooling**:
   - Centralized PgBouncer connection pooling prevents backend connection exhaustion during traffic spikes.
   - Read-heavy queries (analytics, contact searches, invoice histories) target read-replicas.
4. **Redis Distributed Caching & Locking**:
   - Distributed locking via Redlock for reconciliation jobs, billing state transitions, and seat mutations prevents horizontal race conditions.
5. **Circuit Breakers & Graceful Degradation**:
   - In the event of upstream AI provider failure (Groq rate-limit or outage), inference fails over to OpenRouter or gracefully queues until capacity recovers without degrading CRM core operations.
