# Task Plan: Offline-First Local GPU / Python AI Engine & Cloud Fallback

**Task Slug:** `offline-first-gpu-ai-orchestration`  
**Target Hardware:** NVIDIA GeForce GTX 1060 (6 GB VRAM, Driver 582.66, CUDA 13.0) + 64 GB Host RAM + Intel Core i5-10400  
**Operating Principle:** **Local Machine First (Offline / GPU) $\rightarrow$ Cloud API Keys as Secondary Fallback**

---

## 1. Executive Objective

Transition the Business OS AI and OCR capabilities from an API-key-first design to an **Offline-First Local Compute Architecture**.

Your hardware profile (NVIDIA GTX 1060 6GB VRAM + 64 GB RAM) will serve as the primary execution engine:
- **Zero API costs** for standard business operations.
- **100% data privacy & offline autonomy** (documents, customer data, and invoices never leave the machine).
- **Graceful cloud fallback**: Cloud providers (OpenRouter, Gemini, Groq) are only queried if the local GPU is offline, times out, or encounters a document that exceeds local context limits.

---

## 2. Target Architecture & Request Routing

```
                     Business OS Frontend / Microservices
                                      │
                                      ▼
                   [ AI HYBRID ROUTER & DISPATCH GATEWAY ]
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
 [ PRIORITY 1: LOCAL MACHINE ]                         [ PRIORITY 2: CLOUD FALLBACK ]
   FastAPI Python AI (:3030)                             OpenRouter / Gemini / Groq
   NVIDIA GTX 1060 (6GB VRAM)                            Only invoked if:
   + 64GB System RAM                                     • Local service is offline
   ├── EasyOCR / PyTorch CUDA (Receipts/Invoices)        • Request timeout (>15s)
   ├── all-MiniLM-L6-v2 Embeddings (Vector search)       • Out of Memory (OOM)
   └── Ollama / Local GGUF (Llama-3.1 8B / Qwen 2.5)     • Document exceeds local context
```

---

## 3. Scope of Work & Work breakdown

### Pillar 1: Python AI Service Local Pipeline (`services/python-ai/`)
- **GPU Device Binding**: Verify `torch.cuda.is_available()` binds to `NVIDIA GeForce GTX 1060 6GB`.
- **Local OCR Extraction Pipeline**:
  - Add native Python OCR extraction (`easyocr` / `pytesseract`) running on CUDA.
  - Expose `POST /ocr/extract` on Port `3030` returning canonical bounding boxes, tables, and structured line items.
- **Local Embedding Vectorizer**:
  - Load `sentence-transformers/all-MiniLM-L6-v2` onto GPU memory (~350 MB VRAM footprint) for universal search and semantic memory.
- **Local LLM Model Server Connector**:
  - Connect to local model runner (Ollama / `llama-cpp-python` endpoint) running quantized `llama3.1:8b-instruct-q4_K_M` or `qwen2.5:7b`.

### Pillar 2: Next.js & Microservices Fallback Adapter (`apps/web-core/`, `apps/ai-engine/`)
- **Adaptive Fallback Client**:
  - Create `LocalFirstAiClient`:
    1. Ping `http://127.0.0.1:3030/health` or `http://127.0.0.1:11434/api/tags`.
    2. Attempt local inference with configurable timeout (e.g., 10s for OCR, 15s for LLM).
    3. If success: Return local result immediately with `provenance: "LOCAL_GPU_GTX1060"`.
    4. If failure/unreachable: Catch error, log warning, and seamlessly execute via cloud API keys (`OPENROUTER_API_KEY` / `GEMINI_API_KEY`).
- **Telemetry & UI Indicator**:
  - Add real-time badge in the Navigation / Cockpit / OCR Scanner showing:
    - 🟢 `Local GPU Engine Active (GTX 1060 6GB)`
    - 🟡 `Cloud Fallback Active (API Key)`

### Pillar 3: Integration with Service Runner (`scripts/dev-services.mjs`)
- Ensure `python-ai` (`services/python-ai`) boots automatically in fast development mode alongside web-core and finance.

---

## 4. Multi-Agent Implementation Allocation (Phase 2)

Following the strict orchestration protocol, minimum 3 specialized agents will execute the implementation:

| Agent | Responsibilities |
|---|---|
| **`backend-specialist`** | Python FastAPI (`services/python-ai`) local OCR & CUDA inference routes + Node.js adaptive fallback client. |
| **`frontend-specialist`** | UI hardware telemetry badge and OCR client updates in [`OcrInvoiceClient.tsx`](file:///e:/businessos/apps/web-core/src/app/ocr-invoice/OcrInvoiceClient.tsx). |
| **`devops-engineer`** | Local environment requirements (`requirements.txt`, PyTorch CUDA check script, `dev-services.mjs` integration). |
| **`test-engineer`** | Automated verification script testing local GPU execution, speed benchmark, and fallback trigger when local port is paused. |

---

## 5. Verification Plan

1. **Local GPU Execution Test**:
   - Submit sample invoice image to local Python service.
   - Verify GPU utilization on NVIDIA GeForce GTX 1060 via `nvidia-smi`.
   - Confirm zero external HTTP calls to cloud API gateways.
2. **Fallback Circuit-Breaker Test**:
   - Temporarily pause local Python AI service.
   - Send invoice request from UI.
   - Verify system automatically catches connection refusal and succeeds via secondary cloud API without crashing.
3. **Hardware Health & Memory Safety**:
   - Confirm VRAM usage remains under 5.2 GB (safe buffer below 6.0 GB ceiling).
   - Ensure 64 GB host RAM handles any spillover effortlessly.

---

## 6. Checkpoint: User Approval Gate

- [x] Plan approved by user (`Y`)
- [x] Proceed to multi-agent Phase 2 implementation

---

## 7. Multi-Agent Phase 2 Execution & Verification Results

| Agent | Milestone Executed | Status | Evidence |
|---|---|---|---|
| **`backend-specialist`** | Python AI Service (`services/python-ai`, :3030) with local OCR extraction & hardware query fallback | **COMPLETED** | `POST /v1/ocr/extract` active, 0 external API calls |
| **`frontend-specialist`** | Adaptive Local-First Cascade & UI Live Hardware Badge in [`OcrInvoiceClient.tsx`](file:///e:/businessos/apps/web-core/src/app/ocr-invoice/OcrInvoiceClient.tsx) | **COMPLETED** | 🟢 `Local GPU Active (NVIDIA GeForce GTX 1060 6GB)` live |
| **`devops-engineer`** | Service mesh integration in [`dev-services.mjs`](file:///e:/businessos/scripts/dev-services.mjs) & venv requirements | **COMPLETED** | `python-ai`, `finance`, and `documents` mapped as core services |
| **`test-engineer`** | Automated test suites for Offline AI & Enterprise Finance | **COMPLETED** | **31 Passed / 0 Failed** across both test suites |

### Test Suite Execution Summary:
- **`test-offline-first-ai.mjs`**: 5 Passed / 0 Failed (Local GPU extraction, telemetry probe, circuit breaker fallback).
- **`test-enterprise-finance-system.mjs`**: 26 Passed / 0 Failed (GL ledger debits=credits, 3-way matching, segregation of duties, payment recovery, outbox, Midas AI).
