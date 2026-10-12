# Business OS — Production Secrets Management & Access Governance Policy

## 1. Overview
This policy establishes strict zero-trust standards for secret management, administrator access, and CI/CD leak prevention across the 28 microservices and Web Core of Business OS.

---

## 2. Insecure Fallback Elimination
- **Zero Fallback Invariant:** All placeholder secrets (`super-secret-business-os-[REDACTED]`, `replace-with-a-secure-random...`) have been completely purged from all 28 microservice modules, guards, web-core, and docker-compose templates.
- **Fail-Closed Startup (`assertProductionSecrets`):** In `NODE_ENV=production`, if any required secret (`JWT_SECRET`, `DATABASE_URL`) is missing, low entropy (< 32 chars), or matches a known default, the service throws a fatal error and terminates immediately before accepting traffic.
- **Dynamic Retrieval (`getJwtSecret`):** Microservices import `getJwtSecret()` from `@repo/auth` rather than directly reading unvalidated `process.env`.

---

## 3. Environment Separation Architecture

| Environment | Secret Source | Isolation Level | Fail-Closed Policy |
|---|---|---|---|
| **Production** | Private Secret Manager (AWS Secrets Manager / Vault / Doppler) | Strict prod VPC / DB isolated | Fail closed (strict 256-bit entropy) |
| **Staging** | Staging Secret Vault | Isolated staging sandbox DB / Redis | Fail closed (isolated staging keys) |
| **Development** | `.env` / Local Environment | Local developer machine | Warn with ephemeral fallback |

Templates provided:
- `.env.production.template`
- `.env.staging.template`
- `.env.development.template`

---

## 4. Secure Initial Administrator Provisioning & Rotation

Initial provisioning and emergency credential rotation are managed through:
```bash
# Provision or rotate administrator password
node scripts/provision-admin.mjs [--email=admin@example.com] [--password=SECURE_PASSWORD] [--rotate]
```

### Security Guarantees:
1. **Password Complexity:** Minimum 14 characters, uppercase, lowercase, numbers, and special characters enforced.
2. **Key Derivation:** Hashed using `bcrypt` with 12 salt rounds before persisting to PostgreSQL.
3. **Zero Plaintext Persistence:** Plaintext passwords are displayed once to standard output and never written to disk, database, or application logs.

---

## 5. Automated CI/CD Secret-Leak Scanner

Automated pipeline script:
```bash
node scripts/scan-secret-leaks.mjs
```
- Integrated into GitHub Actions workflow: `.github/workflows/secret-scan.yml`.
- Scans all repository files on every PR and commit for:
  - Private certificate keys (`BEGIN PRIVATE KEY`)
  - AWS Access Keys (`AKIA...`)
  - Stripe live secret keys (`sk_live_...`)
  - GitHub & Slack tokens
  - Insecure placeholder secrets
