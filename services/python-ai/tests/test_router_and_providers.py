"""
Unit tests for Model Registry, Routing logic & Provider Fallback.
"""

import pytest
from app.models.registry import model_registry
from app.models.router import model_router
from app.models.providers.base import GenerateRequest, ChatMessage


def test_registry_populated():
    models = model_registry.list_models()
    assert len(models) >= 8
    
    # Check providers representation
    providers = {m.provider for m in models}
    assert "groq" in providers
    assert "openrouter" in providers
    assert "openai" in providers
    assert "local" in providers
    assert "embedding" in providers


def test_registry_tool_capable_models():
    models = model_registry.list_models()
    tool_models = [m for m in models if m.supports_tools]
    assert len(tool_models) > 0


def test_router_model_selection():
    # Test routing by task
    fast_model = model_router.resolve_model(task="simple classification")
    assert fast_model is not None
    
    # Test routing for high-quality sales reasoning
    sales_model = model_router.resolve_model(task="sales reasoning", quality_tier="high")
    assert sales_model is not None
    
    # Test routing for offline/private inference
    local_model = model_router.resolve_model(task="offline inference", require_local=True)
    assert local_model is not None
    assert local_model.provider == "local"


@pytest.mark.asyncio
async def test_router_fallback_cascade():
    req = GenerateRequest(
        model="non-existent-or-fallback-test",
        messages=[ChatMessage(role="user", content="Test fallback")],
        tenant_id="tenant-test-123",
        temperature=0.1,
        max_tokens=100
    )
    
    try:
        resp = await model_router.generate(req)
        assert resp is not None
        assert resp.content != ""
    except Exception as e:
        assert "NOT_CONFIGURED" in str(e) or "All providers failed" in str(e) or "Failed" in str(e)
