"""
Inference Router: POST /v1/inference/generate & /v1/inference/stream.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import json
import asyncio
from ..models.providers.base import GenerateRequest, GenerateResponse
from ..models.router import model_router
from ..security import verify_service_auth, TenantContext, PromptBoundaryManager

router = APIRouter(prefix="/v1/inference", tags=["Inference"])


@router.post("/generate", response_model=GenerateResponse)
async def generate_completion(
    request: GenerateRequest,
    context: TenantContext = Depends(verify_service_auth),
):
    """
    Generate model completion with multi-tenant isolation, prompt boundary protection,
    and automatic provider fallback cascade.
    """
    # Enforce request tenant matches verified header tenant
    request.tenant_id = context.tenant_id
    if context.user_id:
        request.user_id = context.user_id
    if context.agent_id:
        request.agent_id = context.agent_id
    if context.request_id:
        request.request_id = context.request_id

    # Sanitize messages through PromptBoundaryManager
    for msg in request.messages:
        msg.content = PromptBoundaryManager.sanitize_untrusted_input(msg.content)

    try:
        response = await model_router.route_and_generate(request)
        return response
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/stream")
async def stream_completion(
    request: GenerateRequest,
    context: TenantContext = Depends(verify_service_auth),
):
    """
    Stream model completion over Server-Sent Events (SSE).
    """
    request.tenant_id = context.tenant_id
    request.stream = True

    for msg in request.messages:
        msg.content = PromptBoundaryManager.sanitize_untrusted_input(msg.content)

    async def event_generator():
        try:
            response = await model_router.route_and_generate(request)
            chunks = response.content.split(" ")
            for i, chunk in enumerate(chunks):
                data = json.dumps({
                    "id": response.request_id,
                    "delta": chunk + (" " if i < len(chunks) - 1 else ""),
                    "model": response.model,
                })
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.02)
            yield "data: [DONE]\n\n"
        except Exception as exc:
            err = json.dumps({"error": str(exc)})
            yield f"data: {err}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
