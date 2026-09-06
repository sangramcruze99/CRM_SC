"""
Training Router: POST/GET /v1/training/jobs.
Manages asynchronous LoRA / QLoRA fine-tuning workflows.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from ..training.manager import training_job_manager, TrainingJobConfig, TrainingJobRecord
from ..security import verify_service_auth, TenantContext

router = APIRouter(prefix="/v1/training", tags=["Training"])


@router.post("/jobs", response_model=TrainingJobRecord)
async def submit_training_job(
    config: TrainingJobConfig,
    context: TenantContext = Depends(verify_service_auth),
):
    """Submit an asynchronous model fine-tuning job."""
    return training_job_manager.create_job(config)


@router.get("/jobs", response_model=List[TrainingJobRecord])
async def list_training_jobs(
    context: TenantContext = Depends(verify_service_auth),
):
    """List all submitted model training jobs."""
    return training_job_manager.list_jobs()


@router.get("/jobs/{job_id}", response_model=TrainingJobRecord)
async def get_training_job(
    job_id: str,
    context: TenantContext = Depends(verify_service_auth),
):
    """Retrieve status and evaluation scores for a training job."""
    job = training_job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Training job '{job_id}' not found.")
    return job


@router.post("/jobs/{job_id}/cancel")
async def cancel_training_job(
    job_id: str,
    context: TenantContext = Depends(verify_service_auth),
):
    """Cancel an active or queued training job."""
    success = training_job_manager.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=400, detail=f"Cannot cancel job '{job_id}'. It may have already finished.")
    return {"message": f"Training job '{job_id}' successfully cancelled."}
