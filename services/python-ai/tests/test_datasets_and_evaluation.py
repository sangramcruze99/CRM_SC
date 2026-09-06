"""
Unit tests for Dataset Processing, PII Cleaning, Evaluation Benchmarks & Training Manager.
"""

import json
import pytest
from app.datasets.cleaner import DatasetCleaner
from app.datasets.generator import DatasetGenerator
from app.evaluation.benchmarks import EvaluationEngine
from app.training.manager import TrainingJobConfig, training_job_manager


def test_pii_scrubbing():
    dirty_text = (
        "Client John Doe can be reached at john.doe@acme-corp.com or by calling 555-123-4567. "
        "His corporate card is 4532-1234-5678-9012 and SSN is 000-12-3456."
    )
    
    cleaned = DatasetCleaner.anonymize_text(dirty_text)
    assert "john.doe@acme-corp.com" not in cleaned
    assert "4532-1234-5678-9012" not in cleaned
    assert "[FILTERED_PAYMENT_CARD]" in cleaned
    assert "000-12-3456" not in cleaned
    assert "[FILTERED_SSN]" in cleaned


def test_dataset_train_val_test_split(tmp_path):
    generator = DatasetGenerator(output_dir=str(tmp_path))
    
    # Export 20 sample items for an agent
    logs = [
        {
            "task": f"task_{i}",
            "context": {"deal_id": f"deal_{i}"},
            "input": f"Stalled deal #{i} in proposal stage.",
            "expected_decision": {"action": "CREATE_TASK", "risk": "LOW"},
            "expected_tools": [{"name": "search_crm_deals"}],
            "final_response": f"Action plan for deal {i}"
        }
        for i in range(20)
    ]
    
    counts = generator.export_agent_dataset("ares", logs)
    assert counts["total_cleaned"] == 20
    assert counts["train_count"] == 16  # 80%
    assert counts["validation_count"] == 2  # 10%
    assert counts["test_count"] == 2  # 10%
    
    train_file = tmp_path / "ares" / "train.jsonl"
    assert train_file.exists()
    with open(train_file, "r", encoding="utf-8") as f:
        lines = f.readlines()
        assert len(lines) == 16
        first_record = json.loads(lines[0])
        assert "expected_decision" in first_record


@pytest.mark.asyncio
async def test_evaluation_benchmark_engine():
    engine = EvaluationEngine()
    result = await engine.run_agent_benchmark("ares")
    
    assert result.agent_id == "ares"
    assert result.total_examples > 0
    assert result.tool_accuracy >= 0.90
    assert result.policy_compliance >= 0.95
    assert result.passed is True


def test_training_job_lifecycle():
    # Submit job
    cfg = TrainingJobConfig(
        base_model="Qwen/Qwen2.5-7B-Instruct",
        dataset_id="ares",
        method="lora",
        epochs=1,
        learning_rate=0.0002
    )
    
    job = training_job_manager.create_job(cfg)
    assert job.status in ("PENDING", "TRAINING")
    assert job.job_id.startswith("train_")
    
    # Fetch job status
    fetched = training_job_manager.get_job(job.job_id)
    assert fetched is not None
    assert fetched.job_id == job.job_id
    
    # Cancel job
    canceled = training_job_manager.cancel_job(job.job_id)
    assert canceled is True
    assert training_job_manager.get_job(job.job_id).status == "CANCELLED"
