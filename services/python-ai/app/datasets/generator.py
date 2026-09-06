"""
JSONL Dataset Generator, Log Exporter & Train/Val/Test Splitter.
"""

import os
import json
import random
from typing import List, Dict, Any
from .cleaner import DatasetCleaner

BASE_DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../datasets"))


class DatasetGenerator:
    def __init__(self, output_dir: str = None):
        self.output_dir = output_dir or BASE_DATASETS_DIR
        os.makedirs(self.output_dir, exist_ok=True)

    def export_agent_dataset(
        self,
        agent_id: str,
        records: List[Dict[str, Any]],
        train_ratio: float = 0.8,
        val_ratio: float = 0.1,
    ) -> Dict[str, int]:
        """
        Cleans and splits records into train.jsonl, validation.jsonl, and test.jsonl.
        """
        agent_dir = os.path.join(self.output_dir, agent_id)
        os.makedirs(agent_dir, exist_ok=True)

        cleaned_records = []
        for r in records:
            valid, clean_r = DatasetCleaner.clean_record(r)
            if valid:
                cleaned_records.append(clean_r)

        # Shuffle for randomized split
        random.seed(42)
        shuffled = list(cleaned_records)
        random.shuffle(shuffled)

        n = len(shuffled)
        train_end = int(n * train_ratio)
        val_end = train_end + int(n * val_ratio)

        train_set = shuffled[:train_end]
        val_set = shuffled[train_end:val_end]
        test_set = shuffled[val_end:]

        # If small sample dataset, ensure all sets have at least representative examples
        if n > 0 and len(test_set) == 0:
            test_set = shuffled[-1:]

        paths = {
            "train": os.path.join(agent_dir, "train.jsonl"),
            "validation": os.path.join(agent_dir, "validation.jsonl"),
            "test": os.path.join(agent_dir, "test.jsonl"),
        }

        with open(paths["train"], "w", encoding="utf-8") as f:
            for item in train_set:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

        with open(paths["validation"], "w", encoding="utf-8") as f:
            for item in val_set:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

        with open(paths["test"], "w", encoding="utf-8") as f:
            for item in test_set:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

        return {
            "total_cleaned": len(cleaned_records),
            "train_count": len(train_set),
            "validation_count": len(val_set),
            "test_count": len(test_set),
            "agent_dir": agent_dir,
        }

    def initialize_default_benchmark_datasets(self):
        """Pre-seeds clean JSONL benchmark samples for all 10 agents."""
        samples_by_agent = {
            "ares": [
                {
                    "agent": "ares",
                    "task": "stalled_deal",
                    "context": {"deal_name": "Hyperion Q3 Expansion", "amount": 85000, "inactive_days": 11, "stage": "PROPOSAL"},
                    "input": "Review stalled proposal for Hyperion Q3 ($85,000) inactive for 11 days.",
                    "expected_decision": {"action": "CREATE_TASK", "risk": "LOW"},
                    "expected_tools": [{"name": "search_crm_deals"}, {"name": "create_crm_task"}],
                    "final_response": "Identified stalled proposal for Hyperion Q3 ($85k). Created high-priority follow-up task.",
                },
                {
                    "agent": "ares",
                    "task": "pipeline_velocity",
                    "context": {"contact_email": "cto@acme.example", "budget": 120000},
                    "input": "Draft consultative value pitch for ACME Corp focusing on SOC2 compliance.",
                    "expected_decision": {"action": "SEARCH_KB", "risk": "LOW"},
                    "expected_tools": [{"name": "search_knowledge_base"}],
                    "final_response": "Retrieved SOC2 compliance guidelines and drafted consultative proposal.",
                },
            ],
            "lead_qualification": [
                {
                    "agent": "lead_qualification",
                    "task": "inbound_qualification",
                    "context": {"company_size": 250, "role": "VP of Engineering", "email": "vp.eng@cloudscale.example"},
                    "input": "Evaluate inbound lead from CloudScale (250 employees, VP of Engineering).",
                    "expected_decision": {"action": "CREATE_DEAL", "risk": "LOW"},
                    "expected_tools": [{"name": "create_crm_contact"}, {"name": "create_crm_deal"}],
                    "final_response": "Lead qualified as HIGH ICP fit (Score: 94). Created opportunity and dispatched calendar booking link.",
                }
            ],
            "athena": [
                {
                    "agent": "athena",
                    "task": "churn_prevention",
                    "context": {"account": "Global Logistics", "tickets_open": 3, "health_score": 52},
                    "input": "Account Global Logistics logged 3 critical tickets in 24 hours. Health score 52%.",
                    "expected_decision": {"action": "ESCALATE_REVIEW", "risk": "HIGH"},
                    "expected_tools": [{"name": "search_knowledge_base"}, {"name": "create_support_ticket"}],
                    "final_response": "Alerted VP Customer Success and prepared executive retention action plan.",
                }
            ],
            "midas": [
                {
                    "agent": "midas",
                    "task": "overdue_invoicing",
                    "context": {"invoice_num": "INV-4091", "amount": 14500.0, "days_overdue": 8},
                    "input": "Audit invoice INV-4091 overdue by 8 days for $14,500.",
                    "expected_decision": {"action": "CREATE_PAYMENT_LINK", "risk": "MEDIUM"},
                    "expected_tools": [{"name": "get_overdue_invoices"}, {"name": "create_payment_link"}, {"name": "send_email"}],
                    "final_response": "Generated Stripe payment link and sent polite Day-8 payment reminder for $14,500.00.",
                }
            ],
            "hermes": [
                {
                    "agent": "hermes",
                    "task": "onboarding_kickoff",
                    "context": {"deal_name": "Fintech Core SaaS", "contract_value": 60000, "stage": "CLOSED_WON"},
                    "input": "Deal 'Fintech Core SaaS' marked CLOSED_WON. Initialize delivery board.",
                    "expected_decision": {"action": "PROVISION_SPRINT", "risk": "LOW"},
                    "expected_tools": [{"name": "create_crm_task"}, {"name": "add_crm_activity"}, {"name": "send_email"}],
                    "final_response": "Created onboarding milestone tasks, verified NDA, and dispatched client welcome package.",
                }
            ],
            "vesta": [
                {
                    "agent": "vesta",
                    "task": "escrow_audit",
                    "context": {"property": "742 Evergreen Terrace", "inspection_days_allowed": 17, "days_elapsed": 14},
                    "input": "Check contingency status for 742 Evergreen Terrace (14 days elapsed of 17-day inspection window).",
                    "expected_decision": {"action": "AUDIT_CONTINGENCY", "risk": "LOW"},
                    "expected_tools": [{"name": "audit_escrow_contingency"}],
                    "final_response": "Contingency notice: 3 days remaining before inspection deadline expires.",
                }
            ],
            "customer_support": [
                {
                    "agent": "customer_support",
                    "task": "faq_resolution",
                    "context": {"ticket_subject": "How to configure custom webhook authentication headers?"},
                    "input": "User asks how to configure custom webhook auth headers in developer settings.",
                    "expected_decision": {"action": "REPLY_TICKET", "risk": "MEDIUM"},
                    "expected_tools": [{"name": "search_knowledge_base"}, {"name": "reply_support_ticket"}],
                    "final_response": "Retrieved developer webhook documentation and provided step-by-step header configuration guide.",
                }
            ],
            "recruitment": [
                {
                    "agent": "recruitment",
                    "task": "technical_screening",
                    "context": {"job": "Senior Distributed Systems Engineer", "candidate": "Elena Rostova", "experience_years": 8},
                    "input": "Screen candidate resume for Senior Distributed Systems Engineer role.",
                    "expected_decision": {"action": "CREATE_CONTACT", "risk": "MEDIUM"},
                    "expected_tools": [{"name": "create_crm_contact"}, {"name": "create_crm_task"}],
                    "final_response": "Evaluated candidate: Fit Score 91. Core strengths: NestJS, Kafka, BullMQ. Generated technical interview scorecard.",
                }
            ],
            "ecommerce": [
                {
                    "agent": "ecommerce",
                    "task": "order_sync",
                    "context": {"order_id": "SHOP-9912", "amount": 420.0, "customer_email": "sarah.connor@example.com"},
                    "input": "Order SHOP-9912 ($420) placed by sarah.connor@example.com.",
                    "expected_decision": {"action": "LOG_TRANSACTION", "risk": "LOW"},
                    "expected_tools": [{"name": "create_crm_contact"}, {"name": "add_crm_activity"}],
                    "final_response": "Synced order to CRM contact timeline and logged transaction ledger credit.",
                }
            ],
            "content": [
                {
                    "agent": "content",
                    "task": "newsletter_generation",
                    "context": {"release_title": "Business OS 2.4 - Unified Event Mesh Release"},
                    "input": "Repurpose Business OS 2.4 release notes into executive LinkedIn newsletter summary.",
                    "expected_decision": {"action": "DRAFT_POST", "risk": "LOW"},
                    "expected_tools": [{"name": "search_knowledge_base"}],
                    "final_response": "Drafted 3 high-impact LinkedIn bullet highlights and key product release notes.",
                }
            ],
        }

        results = {}
        for agent_id, records in samples_by_agent.items():
            res = self.export_agent_dataset(agent_id, records)
            results[agent_id] = res
        return results


dataset_generator = DatasetGenerator()
