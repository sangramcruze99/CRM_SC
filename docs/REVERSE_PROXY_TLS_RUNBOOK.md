# Business OS — Phase 6: Ingress Reverse Proxy & TLS Hardening Runbook

## Overview
Phase 6 deploys a perimeter defense and TLS termination reverse proxy ingress layer for Business OS. Internal raw microservice ports (`3001` - `3032`) are shielded on loopback (`127.0.0.1`), while the Ingress acts as the single public gateway enforcing TLS 1.3 encryption, automatic HTTP-to-HTTPS redirection, and enterprise security headers.

---

## 1. Ingress Architecture & Routing Mesh

```
       [ Public Client Traffic ]
                   │
      ┌────────────┴────────────┐
      │  Port 80 (HTTP)         │ ───► 301 Moved Permanently ───► Port 443 (HTTPS)
      └─────────────────────────┘
                   │
      ┌────────────▼────────────┐
      │  Port 443 (HTTPS)       │ (TLS 1.3 / AES-256-GCM / Strict Security Headers)
      └────────────┬────────────┘
                   │
     ┌─────────────┼─────────────┬─────────────┐
     ▼             ▼             ▼             ▼
  /healthz      /api/*        /vault/*        /*
  (Ingress   (API Gateway   (MinIO S3    (Next.js
   Liveness)   Port 3000)   Port 9000)  Port 4000)
                   │
      ┌────────────┴────────────┐
      │ Internal 28-Node Mesh   │ (127.0.0.1 loopback only)
      │ Ports 3001 - 3032       │
      └─────────────────────────┘
```

---

## 2. Security Headers Enforced

Every response leaving the ingress reverse proxy injects the following security headers:

| Header | Production Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS and prevents SSL stripping attacks |
| `X-Content-Type-Options` | `nosniff` | Disables MIME type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Mitigates Clickjacking attacks |
| `X-XSS-Protection` | `1; mode=block` | Enables legacy browser XSS filters |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protects sensitive path information in referrers |
| `Content-Security-Policy` | `default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob: ws: wss:; frame-ancestors 'self';` | Enforces defense against cross-site scripting |
| `X-Ingress-Proxy` | `BusinessOS-Production-Ingress/1.0` | Ingress provenance tracking |

---

## 3. Cryptographic Setup & Certificate Management

### Automated Self-Signed Certificate Generation
Generate SAN-enabled certificates for local staging and test environments:
```bash
node scripts/generate-tls-certs.mjs
```
Files generated:
- Private Key: `certs/tls.key` (2048-bit RSA)
- X.509 Certificate: `certs/tls.crt` (Valid for 365 days, SANs: `localhost`, `*.businessos.local`, `127.0.0.1`)

---

## 4. Reverse Proxy Deployments

### 1. Node.js Native Ingress Daemon (Development & Staging)
```bash
# Start Ingress Reverse Proxy
pnpm run ingress
# Default ports: HTTPS on 8443, HTTP on 8080 (configurable via INGRESS_HTTPS_PORT & INGRESS_HTTP_PORT)
```

### 2. Nginx Production Ingress (Docker / Kubernetes)
Configuration file located at: `infra/nginx/nginx.conf`
Features:
- Worker connections: 2048
- Rate limiting zones for general API (50r/s) and authentication endpoints (5r/s)
- SSL session caching (`shared:SSL:10m`)
- HTTP/2 support

### 3. Caddy Production Ingress (Zero-Config Automatic TLS)
Configuration file located at: `infra/caddy/Caddyfile`
Features:
- Automatic Let's Encrypt TLS provisioning
- HTTP/1.1, HTTP/2, and HTTP/3 support
- Clean reverse proxy block directives

---

## 5. Verification & Testing

Execute the automated test suite:
```bash
node scripts/verify-ingress-tls.mjs
```
The test verifies:
1. TLS 1.3 protocol negotiation and AEAD cipher suite.
2. X.509 certificate validity and SANs.
3. HTTP to HTTPS 301 redirection.
4. `/healthz` probe response.
5. All 6 mandatory security headers.
6. Reverse routing to Web-Core (Next.js).
7. Reverse routing to Enterprise API Gateway.
8. Reverse routing to MinIO S3 Object Storage.
9. Network perimeter protection of internal microservices.
