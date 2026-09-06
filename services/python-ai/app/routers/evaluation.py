"""
Evaluation Router: Benchmark execution and Agent Policy inspections.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..evaluation.benchmarks import evaluation_engine, BenchmarkResult
from ..agents.registry import central_agent_registry
from ..agents.schemas import AgentDefinition
from ..security import verify_service_auth, TenantContext

router = APIRouter(prefix="/v1/evaluation", tags=["Evaluation"])


class BenchmarkRequest(BaseModel):
    agent_id: str
    dataset_split: Optional[str] = "test"


@router.post("/benchmark", response_model=BenchmarkResult)
async def run_benchmark(
    request: BenchmarkRequest,
    context: TenantContext = Depends(verify_service_auth),
):
    """
    Run automated benchmarks testing tool selection accuracy, policy compliance,
    and RAG grounding for the specified agent.
    """
    try:
        result = await evaluation_engine.run_agent_benchmark(request.agent_id, request.dataset_split)
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{agent_id}", response_model=BenchmarkResult)
async def run_benchmark_by_id(
    agent_id: str,
    context: TenantContext = Depends(verify_service_auth),
):
    """Run automated benchmark directly by agent ID."""
    try:
        result = await evaluation_engine.run_agent_benchmark(agent_id, "test")
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/agents", response_model=List[AgentDefinition])
async def list_registered_agents(
    context: TenantContext = Depends(verify_service_auth),
):
    """List all 10 centralized agent configurations and policies."""
    return central_agent_registry.list_agents()
