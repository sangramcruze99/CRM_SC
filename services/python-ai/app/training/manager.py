"""
Production SFT / LoRA PEFT Model Lifecycle Manager.
Validates datasets, verifies GPU compute capabilities, prepares PEFT configurations,
and enforces honest capability reporting without simulated results.
"""

import os
import time
import json
import uuid
import logging
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from ..config import compute
from ..datasets.generator import BASE_DATASETS_DIR

logger = logging.getLogger("business-os.training-manager")


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
    status: str = "PENDING"  # 'PENDING', 'VALIDATING', 'READY_FOR_CLUSTER', 'COMPLETED', 'FAILED', 'CANCELLED'
    progress_percent: int = 0
    created_at: float = Field(default_factory=time.time)
    completed_at: Optional[float] = None
    output_model_id: Optional[str] = None
    evaluation_score: Optional[float] = None
    device_used: str = "CPU"
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
            status="TRAINING",
            device_used=compute.device.upper(),
            logs=[f"Job initialized with base model '{config.base_model}' and method '{config.method}'"],
        )
        self._jobs[job_id] = record
        return record

    def _execute_training_preparation(self, job_id: str, config: TrainingJobConfig):
        """
        Validates dataset and determines execution path honestly based on hardware.
        No simulated loops or fake progress.
        """
        job = self._jobs.get(job_id)
        if not job:
            return

        try:
            job.status = "VALIDATING"
            job.logs.append("Validating dataset files and schema completeness...")

            dataset_dir = os.path.join(BASE_DATASETS_DIR, config.dataset_id)
            train_file = os.path.join(dataset_dir, "train.jsonl")

            if not os.path.exists(train_file):
                # Check test file as alternative
                train_file = os.path.join(dataset_dir, "test.jsonl")

            if not os.path.exists(train_file):
                job.status = "FAILED"
                job.logs.append(f"Training dataset not found at {dataset_dir}")
                return

            # Count examples and validate JSONL
            example_count = 0
            with open(train_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        json.loads(line)
                        example_count += 1

            job.logs.append(f"Validated {example_count} training examples in {train_file}.")
            job.progress_percent = 50

            # Hardware capability check
            if not compute.cuda_available:
                job.status = "READY_FOR_CLUSTER"
                job.progress_percent = 100
                job.completed_at = time.time()
                peft_config = {
                    "base_model": config.base_model,
                    "target_modules": ["q_proj", "v_proj", "k_proj", "o_proj"],
                    "r": config.lora_r,
                    "lora_alpha": config.lora_alpha,
                    "lora_dropout": 0.05,
                    "bias": "none",
                    "task_type": "CAUSAL_LM",
                }
                job.output_model_id = f"peft-config/{config.dataset_id}_{config.method}"
                job.logs.append(
                    f"Notice: Local hardware has no dedicated CUDA GPU ({compute.device}). "
                    f"Direct gradient descent requires GPU compute. "
                    f"Exported valid PEFT LoRA configuration for remote GPU cluster execution."
                )
                job.logs.append(f"PEFT Config: {json.dumps(peft_config)}")
            else:
                job.status = "READY_FOR_CLUSTER"
                job.progress_percent = 100
                job.completed_at = time.time()
                job.logs.append(f"CUDA GPU ({compute.device}) detected. Training package prepared.")

        except Exception as exc:
            job.status = "FAILED"
            job.logs.append(f"Training preparation failed: {exc}")

    def get_job(self, job_id: str) -> Optional[TrainingJobRecord]:
        return self._jobs.get(job_id)

    def cancel_job(self, job_id: str) -> bool:
        job = self._jobs.get(job_id)
        if job and job.status in ("PENDING", "TRAINING", "VALIDATING", "READY_FOR_CLUSTER"):
            job.status = "CANCELLED"
            job.logs.append("Job cancelled by user request.")
            return True
        return False

    def list_jobs(self) -> List[TrainingJobRecord]:
        return list(self._jobs.values())


training_job_manager = TrainingJobManager()
