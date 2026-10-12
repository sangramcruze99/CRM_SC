# Private Cloud Object Storage Runbook (S3 / MinIO / R2)

**Document Version:** 1.0.0  
**Target Environment:** Business OS Production / Staging  
**Component:** Document Vault, Presigned URLs & Cloud Storage  
**Status:** Operational (Verified)

---

## 1. Architecture Overview

Business OS decouples file storage from application containers using an S3-compatible cloud object storage abstraction layer (`apps/documents` and `apps/storage`):
1. **Private S3 / MinIO Engine**: Runs on port 9000 with console on 9001. All buckets enforce private ACLs. Anonymous direct read/write is forbidden (returns HTTP 403 Forbidden).
2. **Direct-to-Cloud Uploads**: Clients request time-bounded AWS SigV4 presigned upload URLs (`POST /documents/presign-upload`), streaming heavy files directly to S3 without saturating microservice memory.
3. **Time-Bounded Secure Downloads**: Authorized users access private documents via presigned download URLs (`GET /documents/:id/presign-download`) with configurable TTL (default: 3600 seconds).
4. **Canonical Namespace Hierarchy**:
   `tenant/{tenantId}/{service}/{module}/{entityType}/{entityId}/{category}/{sanitizedFilename}`
5. **Local Vault Migration**: Complete automated migration tool with SHA-256 hash verification.

```
                           ┌────────────────────────────┐
                           │      Client / Browser      │
                           └──────┬──────────────▲──────┘
             1. Presign Upload URL│              │ 2. Direct PUT / GET
                                  ▼              │    (SigV4 Signed)
                    ┌─────────────────────────┐  │
                    │ apps/documents (:3020)  │  │
                    │ apps/storage   (:3031)  │  │
                    └─────────────┬───────────┘  │
                                  │              │
                                  ▼              ▼
                    ┌───────────────────────────────────┐
                    │  MinIO / AWS S3 / Cloudflare R2   │
                    │  Bucket: [business-os-vault]      │
                    │  ACL: Private (403 for anonymous) │
                    └───────────────────────────────────┘
```

---

## 2. Environment Variables

| Variable | Staging / Local | Production (AWS / Cloudflare) | Description |
| :--- | :--- | :--- | :--- |
| `S3_ENDPOINT` | `http://127.0.0.1:9000` | Empty (AWS) or `https://<id>.r2.cloudflarestorage.com` | Custom S3 endpoint |
| `S3_REGION` | `us-east-1` | Target Cloud Region (`us-east-1`, `eu-west-1`) | S3 region |
| `S3_ACCESS_KEY_ID` | `business_os_minio_admin` | Vault/IAM Key ID | S3 access key |
| `S3_SECRET_ACCESS_KEY` | Secure secret | Vault/IAM Secret | S3 secret key |
| `S3_BUCKET` | `business-os-vault` | `business-os-prod-vault` | Private bucket name |
| `S3_FORCE_PATH_STYLE` | `true` | `false` (AWS) / `true` (MinIO/R2) | Path style vs Virtual-hosted |

---

## 3. Operational API Commands

### 1. Request Presigned Upload URL
```bash
curl -X POST "http://localhost:3020/documents/presign-upload" \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: default-tenant" \
  -d '{
    "filename": "executive_nda.pdf",
    "mimeType": "application/pdf",
    "service": "sales",
    "module": "contracts",
    "category": "legal"
  }'
```

### 2. Direct Upload via Presigned URL (Client-Side)
```bash
curl -X PUT "<UPLOAD_URL>" \
  -H "Content-Type: application/pdf" \
  --data-binary "@executive_nda.pdf"
```

### 3. Request Presigned Download URL
```bash
curl -X GET "http://localhost:3020/documents/<DOC_ID>/presign-download" \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "x-tenant-id: default-tenant"
```

### 4. Migrate Local Vault Files to S3
```bash
curl -X POST "http://localhost:3020/documents/migrate-vault" \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "x-tenant-id: default-tenant"
```

---

## 4. Automated Verification Test Suite

Run the full verification suite:
```bash
node scripts/verify-cloud-storage.mjs
```

### Verified Test Matrix (9/9 Passing):
1. `MinIO Health: Live endpoint returns 200 OK`
2. `S3 Bucket: Target private bucket exists and is accessible`
3. `S3 Security: Anonymous direct access without SigV4 is rejected (403 Forbidden)`
4. `Presigned Upload: POST /documents/presign-upload returns SigV4 PUT URL`
5. `S3 Verification: Uploaded object exists in bucket with exact byte length`
6. `Document Ingestion: POST /documents uploads file and stores in S3`
7. `Presigned Download: GET /documents/:id/presign-download generates GET URL`
8. `Vault Migration: POST /documents/migrate-vault migrates all files with 100% hash verification`
9. `Storage Service: POST /storage/presign generates SigV4 upload URL`
