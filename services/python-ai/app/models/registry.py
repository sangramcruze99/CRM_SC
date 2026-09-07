"""
Centralized Model Registry Abstraction.
Maintains model metadata, capabilities, window sizes, and cost/latency profiles.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ModelMetadata(BaseModel):
    id: str
    provider: str
    model_name: str
    capabilities: List[str] = Field(default_factory=list)
    context_window: int
    supports_tools: bool = True
    supports_vision: bool = False
    supports_json: bool = True
    supports_streaming: bool = True
    cost_profile: str  # 'FREE', 'LOW', 'MEDIUM', 'HIGH'
    latency_profile: str  # 'ULTRA_FAST', 'FAST', 'STANDARD', 'REASONING'
    status: str = "PRODUCTION"  # 'TRAINING', 'EVALUATING', 'APPROVED', 'CANARY', 'PRODUCTION', 'DEPRECATED'
    version: str = "1.0.0"


class ModelRegistry:
    def __init__(self):
        self._models: Dict[str, ModelMetadata] = {}
        self._register_default_models()

    def _register_default_models(self):
        # Groq LPU Models (Ultra-Fast)
        self.register(
            ModelMetadata(
                id="groq/compound",
                provider="groq",
                model_name="llama-3.3-70b-versatile",
                capabilities=["chat", "tool_calling", "fast_reasoning"],
                context_window=128000,
                supports_tools=True,
                supports_vision=False,
                supports_json=True,
                cost_profile="LOW",
                latency_profile="ULTRA_FAST",
                status="PRODUCTION",
                version="3.3.0",
            )
        )
        self.register(
            ModelMetadata(
                id="groq/llama-3.1-8b-instant",
                provider="groq",
                model_name="llama-3.1-8b-instant",
                capabilities=["chat", "classification", "summarization"],
                context_window=128000,
                supports_tools=True,
                supports_vision=False,
                supports_json=True,
                cost_profile="LOW",
                latency_profile="ULTRA_FAST",
                status="PRODUCTION",
                version="3.1.0",
            )
        )

        # Google Gemini Frontier Models
        self.register(
            ModelMetadata(
                id="gemini/gemini-3.6-flash",
                provider="gemini",
                model_name="gemini-3.6-flash",
                capabilities=["chat", "multimodal", "fast_reasoning", "tool_calling"],
                context_window=1048576,
                supports_tools=True,
                supports_vision=True,
                supports_json=True,
                cost_profile="LOW",
                latency_profile="ULTRA_FAST",
                status="PRODUCTION",
                version="3.6.0",
            )
        )
        self.register(
            ModelMetadata(
                id="gemini/gemini-3-flash-preview",
                provider="gemini",
                model_name="gemini-3-flash-preview",
                capabilities=["chat", "deep_research", "fast_reasoning"],
                context_window=1048576,
                supports_tools=True,
                supports_vision=True,
                supports_json=True,
                cost_profile="LOW",
                latency_profile="ULTRA_FAST",
                status="PRODUCTION",
                version="3.0.0",
            )
        )

        # OpenRouter Frontier Models
        self.register(
            ModelMetadata(
                id="openrouter/openai/gpt-4o",
                provider="openrouter",
                model_name="openai/gpt-4o",
                capabilities=["chat", "complex_reasoning", "multimodal", "tool_calling"],
                context_window=128000,
                supports_tools=True,
                supports_vision=True,
                supports_json=True,
                cost_profile="MEDIUM",
                latency_profile="STANDARD",
                status="PRODUCTION",
                version="4.0.0",
            )
        )
        self.register(
            ModelMetadata(
                id="openrouter/anthropic/claude-3.5-sonnet",
                provider="openrouter",
                model_name="anthropic/claude-3.5-sonnet",
                capabilities=["chat", "code_architecture", "contract_review"],
                context_window=200000,
                supports_tools=True,
                supports_vision=True,
                supports_json=True,
                cost_profile="HIGH",
                latency_profile="STANDARD",
                status="PRODUCTION",
                version="3.5.0",
            )
        )
        self.register(
            ModelMetadata(
                id="openrouter/deepseek/deepseek-chat",
                provider="openrouter",
                model_name="deepseek/deepseek-chat",
                capabilities=["chat", "math", "reasoning"],
                context_window=64000,
                supports_tools=True,
                supports_vision=False,
                supports_json=True,
                cost_profile="LOW",
                latency_profile="FAST",
                status="PRODUCTION",
                version="3.0.0",
            )
        )

        # OpenAI Direct Models
        self.register(
            ModelMetadata(
                id="openai/gpt-4o",
                provider="openai",
                model_name="gpt-4o",
                capabilities=["chat", "vision", "tool_calling", "ocr"],
                context_window=128000,
                supports_tools=True,
                supports_vision=True,
                supports_json=True,
                cost_profile="MEDIUM",
                latency_profile="STANDARD",
                status="PRODUCTION",
                version="4.0.0",
            )
        )
        self.register(
            ModelMetadata(
                id="openai/gpt-4o-mini",
                provider="openai",
                model_name="gpt-4o-mini",
                capabilities=["chat", "fast_classification", "tool_calling"],
                context_window=128000,
                supports_tools=True,
                supports_vision=True,
                supports_json=True,
                cost_profile="LOW",
                latency_profile="FAST",
                status="PRODUCTION",
                version="4.0.0",
            )
        )

        # Local & On-Premise Models
        self.register(
            ModelMetadata(
                id="local/qwen-2.5-7b",
                provider="local",
                model_name="Qwen/Qwen2.5-7B-Instruct",
                capabilities=["chat", "private_inference", "tool_calling"],
                context_window=32768,
                supports_tools=True,
                supports_vision=False,
                supports_json=True,
                cost_profile="FREE",
                latency_profile="FAST",
                status="APPROVED",
                version="2.5.0",
            )
        )
        self.register(
            ModelMetadata(
                id="local/business-os",
                provider="local",
                model_name="business-os-deterministic",
                capabilities=["chat", "fallback", "offline_safety"],
                context_window=16384,
                supports_tools=True,
                supports_vision=False,
                supports_json=True,
                cost_profile="FREE",
                latency_profile="ULTRA_FAST",
                status="PRODUCTION",
                version="1.0.0",
            )
        )

        # Embedding Models
        self.register(
            ModelMetadata(
                id="embedding/all-MiniLM-L6-v2",
                provider="embedding",
                model_name="all-MiniLM-L6-v2",
                capabilities=["embeddings", "dense_vectors", "similarity"],
                context_window=512,
                supports_tools=False,
                supports_vision=False,
                supports_json=False,
                cost_profile="FREE",
                latency_profile="ULTRA_FAST",
                status="PRODUCTION",
                version="2.0.0",
            )
        )

    def register(self, model: ModelMetadata):
        self._models[model.id] = model

    def get(self, model_id: str) -> Optional[ModelMetadata]:
        if model_id in self._models:
            return self._models[model_id]
        # Check alias
        for m in self._models.values():
            if m.model_name == model_id or m.id.endswith(f"/{model_id}"):
                return m
        return None

    def list_models(self) -> List[ModelMetadata]:
        return list(self._models.values())

    def list_by_provider(self, provider: str) -> List[ModelMetadata]:
        return [m for m in self._models.values() if m.provider == provider]


model_registry = ModelRegistry()
