import asyncio
import httpx
import json
import time

AGENTS_TEST_DATA = [
    {
        "id": "ares",
        "name": "Ares Sales Intelligence Sentinel",
        "entity_type": "deal",
        "entity_id": "deal_acme_001",
        "event_type": "crm:deal_inactive",
        "context": {
            "title": "Acme Corp Cloud Expansion",
            "value": 35000,
            "stage": "PROPOSAL",
            "inactive_days": 10
        }
    },
    {
        "id": "lead_qualification",
        "name": "Inbound SDR & Lead Qualification Agent",
        "entity_type": "contact",
        "entity_id": "contact_lead_002",
        "event_type": "crm:new_lead",
        "context": {
            "name": "Sarah Jenkins",
            "company": "Nexus Logistics",
            "role": "VP of Operations",
            "company_size": "250-500",
            "source": "inbound_form"
        }
    },
    {
        "id": "athena",
        "name": "Athena Legal & Compliance Sentinel",
        "entity_type": "contract",
        "entity_id": "doc_nda_003",
        "event_type": "documents:uploaded",
        "context": {
            "title": "Master Services Agreement - FinTech Corp",
            "jurisdiction": "Delaware",
            "governing_law": "US-DE",
            "unusual_indemnity_clause": True
        }
    },
    {
        "id": "midas",
        "name": "Midas Finance & Revenue Controller",
        "entity_type": "invoice",
        "entity_id": "inv_2026_004",
        "event_type": "finance:invoice_overdue",
        "context": {
            "invoiceNumber": "INV-2026-004",
            "clientName": "Global Media Partners",
            "amount": 14250,
            "daysOverdue": 18
        }
    },
    {
        "id": "hermes",
        "name": "Hermes Operations & Fulfillment Sentinel",
        "entity_type": "order",
        "entity_id": "ord_fulfillment_005",
        "event_type": "operations:order_delayed",
        "context": {
            "orderId": "ORD-9921",
            "origin": "Dallas Hub",
            "destination": "Seattle Tech Center",
            "carrierStatus": "WEATHER_HOLD"
        }
    },
    {
        "id": "vesta",
        "name": "Vesta People & HR Sentinel",
        "entity_type": "employee",
        "entity_id": "emp_review_006",
        "event_type": "hr:onboarding_milestone",
        "context": {
            "employeeName": "David Chen",
            "department": "Engineering",
            "milestone": "Day 30 Review",
            "manager": "Alex Mercer"
        }
    },
    {
        "id": "customer_support",
        "name": "Customer Support Sentinel",
        "entity_type": "ticket",
        "entity_id": "tkt_help_007",
        "event_type": "support:ticket_escalated",
        "context": {
            "ticketId": "TKT-4401",
            "subject": "SSO Login Failure for Azure AD",
            "priority": "HIGH",
            "slaRemainingMinutes": 45
        }
    },
    {
        "id": "recruitment",
        "name": "Talent Acquisition Specialist",
        "entity_type": "candidate",
        "entity_id": "cand_eng_008",
        "event_type": "recruitment:candidate_interviewed",
        "context": {
            "candidateName": "Elena Rostova",
            "position": "Principal Distributed Systems Engineer",
            "yearsExperience": 9,
            "techStackScore": "9.5/10"
        }
    },
    {
        "id": "ecommerce",
        "name": "Merchant & Catalog Sentinel",
        "entity_type": "inventory",
        "entity_id": "sku_stock_009",
        "event_type": "inventory:stock_critical",
        "context": {
            "sku": "PRO-ENTERPRISE-GATEWAY-V2",
            "currentStock": 3,
            "reorderPoint": 15,
            "vendorLeadDays": 5
        }
    },
    {
        "id": "content",
        "name": "Content & Marketing Strategist",
        "entity_type": "campaign",
        "entity_id": "cmp_marketing_010",
        "event_type": "marketing:brief_submitted",
        "context": {
            "campaignName": "Q4 AI Productivity Benchmark Launch",
            "targetAudience": "Enterprise CIOs and CTOs",
            "primaryValueProp": "Sub-second autonomous pipeline orchestration"
        }
    }
]

async def run_audit():
    print("=" * 80)
    print("  ALL 10 BUSINESS OS AI AGENTS — GEMMA 4 (CUDA) EXECUTION AUDIT")
    print("=" * 80)
    
    results = []
    headers = {
        "Content-Type": "application/json",
        "X-Service-Key": "business-os-internal-ai-key-secret",
        "X-Tenant-ID": "default-tenant"
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        for idx, agent in enumerate(AGENTS_TEST_DATA, 1):
            agent_id = agent["id"]
            url = f"http://127.0.0.1:3030/v1/agents/{agent_id}/decide"
            body = {
                "tenant_id": "default-tenant",
                "entity_type": agent["entity_type"],
                "entity_id": agent["entity_id"],
                "event_type": agent["event_type"],
                "context": agent["context"]
            }
            
            t0 = time.time()
            try:
                resp = await client.post(url, headers=headers, json=body)
                elapsed = round((time.time() - t0) * 1000)
                if resp.status_code == 200:
                    data = resp.json()
                    meta = data.get("metadata", {})
                    is_real_gemma = not meta.get("offlineExecution", True)
                    model_used = meta.get("agentModel", "unknown")
                    decision = data.get("decision", "")
                    risk = data.get("riskLevel", "")
                    status = data.get("status", "")
                    
                    results.append({
                        "index": idx,
                        "id": agent_id,
                        "name": agent["name"],
                        "http_status": 200,
                        "model": model_used,
                        "real_llm": is_real_gemma,
                        "risk": risk,
                        "status": status,
                        "latency_ms": elapsed,
                        "decision": decision[:80] + "..." if len(decision) > 80 else decision
                    })
                    print(f"[{idx}/10] {agent_id:20} -> HTTP 200 | Model: {model_used} | Real Gemma: {is_real_gemma} | {elapsed}ms")
                    print(f"       Decision: {decision[:100]}")
                else:
                    results.append({
                        "index": idx,
                        "id": agent_id,
                        "name": agent["name"],
                        "http_status": resp.status_code,
                        "model": "FAILED",
                        "real_llm": False,
                        "latency_ms": elapsed,
                        "error": resp.text[:100]
                    })
                    print(f"[{idx}/10] {agent_id:20} -> HTTP {resp.status_code} | Error: {resp.text[:100]}")
            except Exception as e:
                elapsed = round((time.time() - t0) * 1000)
                results.append({
                    "index": idx,
                    "id": agent_id,
                    "name": agent["name"],
                    "http_status": 500,
                    "model": "EXCEPTION",
                    "real_llm": False,
                    "latency_ms": elapsed,
                    "error": str(e)
                })
                print(f"[{idx}/10] {agent_id:20} -> EXCEPTION: {e}")

    print("\n" + "=" * 80)
    print("  SUMMARY AUDIT REPORT")
    print("=" * 80)
    success_count = sum(1 for r in results if r.get("real_llm") is True)
    print(f"Total Agents Tested: {len(results)}")
    print(f"Active with Gemma 4 (Real LLM Inference): {success_count} / {len(results)}")
    print("-" * 80)
    for r in results:
        status_flag = "ONLINE (Gemma 4)" if r.get("real_llm") else "FALLBACK/OFFLINE"
        print(f"  - {r['id']:20} : {status_flag:20} | Latency: {r.get('latency_ms', 0)}ms | Risk: {r.get('risk', 'N/A')}")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_audit())
