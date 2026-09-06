"""
Health, Readiness, Metrics & Model Catalog Endpoints.
"""

from fastapi import APIRouter
from ..config import settings, compute
from ..models.registry import model_registry
from ..models.router import model_router

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Liveness probe checking process and hardware capabilities."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.version,
        "environment": settings.environment,
        "compute": {
            "device": compute.device,
            "cuda_available": compute.cuda_available,
            "gpu_name": compute.gpu_name,
            "total_vram_gb": compute.total_vram_gb,
        },
    }


@router.get("/ready")
async def readiness_check():
    """Readiness probe checking active provider configurations."""
    providers_status = {
        "groq": model_router.groq_provider.is_configured(),
        "openrouter": model_router.openrouter_provider.is_configured(),
        "openai": model_router.openai_provider.is_configured(),
        "local": model_router.local_provider.is_configured(),
    }
    has_any_provider = any(providers_status.values())

    return {
        "status": "ready" if has_any_provider else "degraded",
        "providers": providers_status,
        "default_model": settings.default_model,
    }


@router.get("/metrics")
async def telemetry_metrics():
    """Service telemetry and operational metrics."""
    return {
        "active_models_count": len(model_registry.list_models()),
        "compute_device": compute.device,
        "embedding_dimensions": settings.embedding_dimension,
        "uptime": "operational",
    }


@router.get("/v1/models")
async def list_available_models():
    """List all registered models across Groq, OpenRouter, OpenAI, and Local providers."""
    return {"models": model_registry.list_models()}
