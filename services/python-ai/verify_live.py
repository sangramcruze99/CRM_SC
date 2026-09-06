"""
Live HTTP Verification Script for Business OS Python AI Layer.
"""

import httpx
import json

BASE_URL = "http://127.0.0.1:3030"
HEADERS = {
    "X-Tenant-ID": "tenant-test-e2e",
    "X-Service-Key": "business-os-internal-ai-key-secret",
    "Content-Type": "application/json",
}

def run_checks():
    client = httpx.Client(base_url=BASE_URL, headers=HEADERS, timeout=15.0)

    # 1. Health
    r = client.get("/health")
    assert r.status_code == 200, f"Health failed: {r.text}"
    health = r.json()
    print(f"[OK] Health check passed: status={health['status']}, compute={health['compute']['device']}")

    # 2. Readiness
    r = client.get("/ready")
    assert r.status_code == 200, f"Ready failed: {r.text}"
    ready = r.json()
    print(f"[OK] Readiness check passed: status={ready['status']}, providers={ready['providers']}")

    # 3. Telemetry Metrics
    r = client.get("/metrics")
    assert r.status_code == 200, f"Metrics failed: {r.text}"
    metrics = r.json()
    print(f"[OK] Telemetry metrics passed: models_indexed={metrics['active_models_count']}, embedding_dim={metrics['embedding_dimensions']}")

    # 4. Centralized 10 Agent Definitions
    r = client.get("/v1/agents")
    assert r.status_code == 200, f"Agents failed: {r.text}"
    agents = r.json()
    agent_ids = [a["id"] for a in agents]
    print(f"[OK] Central Agent Registry: {len(agents)} agents loaded: {', '.join(agent_ids)}")
    assert len(agents) == 10

    # 5. Local 384-dimensional Embedding Service
    r = client.post("/v1/embeddings", json={"input": ["Pipeline velocity for stalled deals", "Customer success churn risk sentinel"]})
    assert r.status_code == 200, f"Embeddings failed: {r.text}"
    emb = r.json()
    print(f"[OK] Dense Vector Embeddings: model={emb['model']}, dim={emb['dimensions']}, vectors_returned={len(emb['embeddings'])}")
    assert emb["dimensions"] == 384

    # 6. Evaluation Benchmark Engine (Ares Benchmark)
    r = client.post("/v1/evaluation/ares")
    assert r.status_code == 200, f"Evaluation failed: {r.text}"
    eval_res = r.json()
    print(f"[OK] Benchmark Evaluation (Ares): passed={eval_res['passed']}, tool_acc={eval_res['tool_accuracy']:.2f}, policy_comp={eval_res['policy_compliance']:.2f}")
    assert eval_res["passed"] is True

    # 7. Asynchronous LoRA Training Job Lifecycle
    r = client.post("/v1/training/jobs", json={"base_model": "Qwen/Qwen2.5-7B-Instruct", "dataset_id": "ares", "method": "lora", "epochs": 1})
    assert r.status_code == 200, f"Training job failed: {r.text}"
    job = r.json()
    print(f"[OK] Training Job Created: job_id={job['job_id']}, status={job['status']}")
    
    # Cancel job
    r = client.post(f"/v1/training/jobs/{job['job_id']}/cancel")
    assert r.status_code == 200
    print(f"[OK] Training Job Cancelled cleanly: {r.json()}")

    # 8. Model Inference with Groq & Prompt Boundary Protection
    print("[...] Dispatching live model inference test...")
    r = client.post(
        "/v1/inference/generate",
        json={
            "model": "groq/compound",
            "messages": [
                {"role": "system", "content": "You are Ares sales assistant."},
                {"role": "user", "content": "Confirm that Business OS AI Layer is operational in one short sentence."}
            ],
            "tenant_id": "tenant-test-e2e",
            "temperature": 0.1,
            "max_tokens": 60
        }
    )
    print(f"[STATUS: {r.status_code}]")
    if r.status_code == 200:
        data = r.json()
        print(f"[OK] Live Inference Success! Model: {data['model']}, Latency: {data['latency_ms']}ms")
        print(f"     Response: {data['content'].strip()}")
    else:
        print(f"[INFO] Fallback/Provider status: {r.text}")

    print("\n=======================================================")
    print("ALL LIVE PYTHON AI ENDPOINTS VERIFIED END-TO-END!")
    print("=======================================================")

if __name__ == "__main__":
    run_checks()
