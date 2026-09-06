"""
Asynchronous LoRA / QLoRA Training Job Pipeline & Model Lifecycle Manager.
"""

import time
import uuid
import asyncio
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class TrainingJobConfig(BaseModel):
    base_model: str = "Qwen/Qwen2.5-7B-Instruct"
    dataset_id: str = "ares"
    method: str = "lora"  # 'lora' or 'qlora'
    epochs: int = 3
    learning_rate: float = 0.0002
    lora_r: int = 16
    lora_alpha: int = 32
    batch_size: int = 4


class TrainingJobRecord(BaseModel):
    job_id: str
    base_model: str
    dataset_id: str
    method: str
    epochs: int
    learning_rate: float
    status: str = "PENDING"  # 'PENDING', 'TRAINING', 'EVALUATING', 'APPROVED', 'CANARY', 'PRODUCTION', 'FAILED', 'CANCELLED'
    progress_percent: int = 0
    created_at: float = Field(default_factory=time.time)
    completed_at: Optional[float] = None
    output_model_id: Optional[str] = None
    evaluation_score: Optional[float] = None
    logs: List[str] = Field(default_factory=list)


class TrainingJobManager:
    def __init__(self):
        self._jobs: Dict[str, TrainingJobRecord] = {}

    def create_job(self, config: TrainingJobConfig) -> TrainingJobRecord:
        job_id = f"train_{uuid.uuid4().hex[:10]}"
        record = TrainingJobRecord(
            job_id=job_id,
            base_model=config.base_model,
            dataset_id=config.dataset_id,
            method=config.method,
            epochs=config.epochs,
            learning_rate=config.learning_rate,
            status="PENDING",
            logs=[f"Job initialized with base model '{config.base_model}' and method '{config.method}'"],
        )
        self._jobs[job_id] = record

        # Launch async task in background if event loop is active
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._execute_training_harness(job_id, config))
        except RuntimeError:
            pass
        return record

    async def _execute_training_harness(self, job_id: str, config: TrainingJobConfig):
        """Asynchronous simulated execution loop for SFT LoRA training."""
        job = self._jobs.get(job_id)
        if not job:
            return

        try:
            job.status = "TRAINING"
            job.logs.append("Phase 1: Validating dataset JSONL integrity and token distributions...")
            job.progress_percent = 15
            await asyncio.sleep(1.0)

            if job.status == "CANCELLED":
                return

            job.logs.append(f"Phase 2: Initializing PEFT {config.method.upper()} adapter (r={config.lora_r}, alpha={config.lora_alpha})...")
            job.progress_percent = 40
            await asyncio.sleep(1.5)

            if job.status == "CANCELLED":
                return

            job.logs.append(f"Phase 3: Running gradient descent across {config.epochs} epochs (lr={config.learning_rate})...")
            job.progress_percent = 75
            await asyncio.sleep(1.5)

            if job.status == "CANCELLED":
                return

            job.status = "EVALUATING"
            job.logs.append("Phase 4: Running automated benchmark evaluation against test split...")
            job.progress_percent = 90
            await asyncio.sleep(1.0)

            # Mark approved
            job.status = "APPROVED"
            job.progress_percent = 100
            job.completed_at = time.time()
            job.output_model_id = f"lora/{config.dataset_id}_v{int(time.time())}"
            job.evaluation_score = 92.5
            job.logs.append(f"Training successfully completed. Model adapter published to '{job.output_model_id}' (Score: 92.5%)")

        except Exception as exc:
            job.status = "FAILED"
            job.logs.append(f"Training failed with error: {exc}")

    def get_job(self, job_id: str) -> Optional[TrainingJobRecord]:
        return self._jobs.get(job_id)

    def cancel_job(self, job_id: str) -> bool:
        job = self._jobs.get(job_id)
        if job and job.status in ("PENDING", "TRAINING"):
            job.status = "CANCELLED"
            job.logs.append("Job cancelled by user request.")
            return True
        return False

    def list_jobs(self) -> List[TrainingJobRecord]:
        return list(self._jobs.values())


training_job_manager = TrainingJobManager()
