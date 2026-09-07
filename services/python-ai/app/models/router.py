"""
Smart Model Router with Capability-Based Selection & Fallback Cascade.
"""

import logging
from typing import Optional, List
from .providers.base import BaseModelProvider, GenerateRequest, GenerateResponse
from .providers.groq_provider import GroqProvider
from .providers.gemini_provider import GeminiProvider
from .providers.openrouter_provider import OpenRouterProvider
from .providers.openai_provider import OpenAIProvider
from .providers.local_provider import LocalModelProvider
from .registry import model_registry

logger = logging.getLogger(__name__)


class ModelRouter:
    def __init__(self):
        self.groq_provider = GroqProvider()
        self.gemini_provider = GeminiProvider()
        self.openrouter_provider = OpenRouterProvider()
        self.openai_provider = OpenAIProvider()
        self.local_provider = LocalModelProvider()

    def get_provider(self, provider_name: str) -> Optional[BaseModelProvider]:
        mapping = {
            "groq": self.groq_provider,
            "gemini": self.gemini_provider,
            "openrouter": self.openrouter_provider,
            "openai": self.openai_provider,
            "local": self.local_provider,
        }
        return mapping.get(provider_name.lower())

    def resolve_provider_for_model(self, model_id: str) -> BaseModelProvider:
        """Resolve which provider natively owns the requested model."""
        meta = model_registry.get(model_id)
        if meta:
            provider = self.get_provider(meta.provider)
            if provider and provider.is_configured():
                return provider

        # Prefix resolution
        if model_id.startswith("groq/") and self.groq_provider.is_configured():
            return self.groq_provider
        if model_id.startswith("gemini/") and self.gemini_provider.is_configured():
            return self.gemini_provider
        if model_id.startswith("openrouter/") and self.openrouter_provider.is_configured():
            return self.openrouter_provider
        if model_id.startswith("openai/") and self.openai_provider.is_configured():
            return self.openai_provider

        # Default to configured cloud providers or local
        if self.groq_provider.is_configured():
            return self.groq_provider
        if self.gemini_provider.is_configured():
            return self.gemini_provider
        if self.openrouter_provider.is_configured():
            return self.openrouter_provider
        if self.openai_provider.is_configured():
            return self.openai_provider

        return self.local_provider

    def resolve_model(
        self,
        task: Optional[str] = None,
        quality_tier: Optional[str] = None,
        require_local: bool = False,
    ):
        """
        Route to best model based on task, quality tier, latency, and privacy constraints.
        Section 9 Requirements:
          - simple classification -> fast/cheap model
          - sales reasoning -> high-quality model
          - offline/private inference -> local model
          - document OCR / vision -> vision model
        """
        if require_local:
            local_models = [m for m in model_registry.list_models() if m.provider == "local"]
            return local_models[0] if local_models else None

        task_lower = (task or "").lower()
        if "classification" in task_lower or quality_tier == "fast":
            return model_registry.get("groq/compound") or model_registry.list_models()[0]
        elif "sales" in task_lower or "reasoning" in task_lower or quality_tier == "high":
            return (
                model_registry.get("openrouter/deepseek/deepseek-chat")
                or model_registry.get("groq/compound")
                or model_registry.list_models()[0]
            )
        elif "ocr" in task_lower or "vision" in task_lower:
            return model_registry.get("openai/gpt-4o") or model_registry.list_models()[0]

        return model_registry.get("groq/compound") or model_registry.list_models()[0]

    async def route_and_generate(self, request: GenerateRequest) -> GenerateResponse:
        """
        Executes request using primary provider with automatic multi-tier fallback:
        Primary -> Secondary -> Third -> Fail Safely.
        """
        primary = self.resolve_provider_for_model(request.model)

        fallback_chain: List[BaseModelProvider] = [primary]
        for candidate in [self.groq_provider, self.gemini_provider, self.openrouter_provider, self.openai_provider, self.local_provider]:
            if candidate != primary and candidate.is_configured():
                fallback_chain.append(candidate)

        last_error = None

        for idx, provider in enumerate(fallback_chain):
            try:
                logger.info(
                    f"[ModelRouter] Attempt {idx + 1}/{len(fallback_chain)} using provider '{provider.provider_name}' "
                    f"for model '{request.model}' (Tenant: {request.tenant_id})"
                )
                response = await provider.generate(request)
                return response
            except Exception as exc:
                last_error = exc
                logger.warning(
                    f"[ModelRouter] Provider '{provider.provider_name}' failed: {exc}. Attempting next fallback..."
                )

        # Fail safely: Never invent fabricated responses
        raise RuntimeError(
            f"All AI model providers failed or are unconfigured. Last error: {last_error}"
        )

    # Alias for generate
    generate = route_and_generate


model_router = ModelRouter()
