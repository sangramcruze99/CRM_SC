# Disaster Recovery & Backup Architecture (RPO / RTO)

## 1. Targets & Objectives
- **RPO (Recovery Point Objective)**: **< 15 minutes**. Maximum allowable data loss in the event of an infrastructure catastrophe.
- **RTO (Recovery Time Objective)**: **< 30 minutes**. Maximum acceptable downtime before primary platform capabilities (CRM, Auth, Billing) are restored.

## 2. Backup Strategy
1. **Automated Continuous WAL Archiving**:
   - Write-Ahead Logging (WAL) continuously streamed to geographically replicated, immutable object storage (AWS S3 Glacier / Cloudflare R2 with Object Lock).
2. **Periodic Database Snapshots**:
   - Daily full database dumps taken at 02:00 UTC.
   - Hourly differential snapshots.
   - 30-day snapshot retention with automated lifecycle expiration.
3. **Out-of-Region Geo-Replication**:
   - Primary Region: `us-east-1` (N. Virginia).
   - Secondary DR Region: `us-west-2` (Oregon).
   - Read replicas continuously synchronized with replication lag monitored (<2s).

## 3. Disaster Recovery Procedures
### Phase 1: Outage Detection & Triage (T+0 to T+5m)
1. Automated synthetic health probes (`/billing/health`, `/billing/ready`) trigger PagerDuty alerts on 3 consecutive failures.
2. SRE Incident Commander verifies whether outage is localized to single host or region-wide infrastructure failure.

### Phase 2: Traffic Redirection & DNS Failover (T+5m to T+15m)
1. Route 53 / Cloudflare DNS health checks fail over traffic from Primary Region to Secondary DR Region.
2. Ingress proxies route requests to hot standby microservices.

### Phase 3: Database Promotion & Point-in-Time Recovery (PITR) (T+15m to T+25m)
1. Promote secondary database read replica to primary read-write cluster.
2. Replay uncommitted WAL logs up to the timestamp of failure.
3. Validate database schema integrity using Prisma migration status check.

### Phase 4: Service Health Verification & Resumption (T+25m to T+30m)
1. Verify `/billing/ready`, `/api/health`, and CRM services report `status: ready`.
2. Resume background workers, BullMQ queues, and autonomous agent swarm daemons.
3. Notify stakeholders and publish incident update to status page.

## 4. Disaster Recovery Testing Cadence
- **Quarterly GameDay Drills**: Simulated primary database termination and cold restore to staging.
- **Verification Criterion**: A backup that has never been restored is an illusion. Every quarterly restore must pass automated regression test suites before sign-off.
