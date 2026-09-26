"""
Ollama Local Model Provider.
Routes inference to a locally running Ollama daemon (http://localhost:11434).
Supports Gemma4, Llama3.2, and any model stored in E:/ollama-models.
"""

import json
import time
import uuid
from typing import Dict, Any

import httpx

from .base import (
    BaseModelProvider,
    GenerateRequest,
    GenerateResponse,
    ToolCallItem,
    UsageMetrics,
)
from ...config import settings


class OllamaProvider(BaseModelProvider):
    """
    Connects to a locally running Ollama server.
    Primary brain for all 10 Business OS agents.
    Falls back gracefully if Ollama daemon is unreachable.
    """

    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.default_model = settings.ollama_default_model

    @property
    def provider_name(self) -> str:
        return "ollama"

    def is_configured(self) -> bool:
        return bool(self.base_url)

    def _resolve_model_name(self, model_id: str) -> str:
        """Strip the 'ollama/' prefix to get the raw Ollama model tag."""
        if model_id.startswith("ollama/"):
            return model_id[len("ollama/"):]
        return model_id or self.default_model

    async def health_check(self) -> bool:
        """Ping the Ollama daemon. Returns True if it is alive."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False

    async def generate(self, request: GenerateRequest) -> GenerateResponse:
        if not self.is_configured():
            raise RuntimeError("Ollama base URL is not configured (OLLAMA_BASE_URL).")

        start_time = time.time()
        req_id = request.request_id or f"req_{uuid.uuid4().hex[:12]}"
        model_name = self._resolve_model_name(request.model)

        # Build the system prompt + user message into Ollama's chat format
        messages_payload = []
        for m in request.messages:
            messages_payload.append({"role": m.role, "content": m.content})

        # Build tool definitions if provided (Ollama >=0.3 supports OpenAI-compat tools)
        payload: Dict[str, Any] = {
            "model": model_name,
            "messages": messages_payload,
            "stream": False,
            "options": {
                "temperature": request.temperature,
                "num_predict": request.max_tokens,
            },
        }

        if request.tools:
            payload["tools"] = [
                {
                    "type": "function",
                    "function": {
                        "name": t.name,
                        "description": t.description,
                        "parameters": t.parameters,
                    },
                }
                for t in request.tools
            ]

        timeout = httpx.Timeout(settings.long_inference_timeout_sec)

        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json=payload,
            )

        if resp.status_code != 200:
            raise RuntimeError(
                f"Ollama returned HTTP {resp.status_code}: {resp.text[:400]}"
            )

        data = resp.json()
        message_obj = data.get("message", {})
        content = message_obj.get("content", "").strip()
        if not content and message_obj.get("thinking"):
            content = message_obj.get("thinking", "").strip()

        # Parse tool_calls if Ollama returned structured calls
        tool_calls: list[ToolCallItem] = []
        raw_tool_calls = message_obj.get("tool_calls") or []
        for tc in raw_tool_calls:
            fn = tc.get("function", {})
            fn_name = fn.get("name", "")
            fn_args = fn.get("arguments", {})
            if isinstance(fn_args, str):
                try:
                    fn_args = json.loads(fn_args)
                except Exception:
                    fn_args = {"raw": fn_args}
            tool_calls.append(
                ToolCallItem(
                    id=f"call_{uuid.uuid4().hex[:8]}",
                    name=fn_name,
                    arguments=fn_args,
                )
            )

        # Ollama provides token counts in eval_count / prompt_eval_count
        input_tokens = data.get("prompt_eval_count", 0)
        output_tokens = data.get("eval_count", 0)
        latency_ms = int((time.time() - start_time) * 1000)

        return GenerateResponse(
            request_id=req_id,
            model=f"ollama/{model_name}",
            provider=self.provider_name,
            content=content,
            tool_calls=tool_calls,
            usage=UsageMetrics(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=input_tokens + output_tokens,
            ),
            latency_ms=latency_ms,
        )
