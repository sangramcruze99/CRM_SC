"""
Google Gemini High-Performance Cloud Model Provider.
Native multimodal and ultra-fast generation using Google Generative Language API.
"""

import time
import json
import uuid
import os
from typing import Dict, Any, List
import httpx
from .base import BaseModelProvider, GenerateRequest, GenerateResponse, ToolCallItem, UsageMetrics
from ...config import settings


class GeminiProvider(BaseModelProvider):
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.gemini_api_key or os.getenv("GOOGLE_API_KEY")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    @property
    def provider_name(self) -> str:
        return "gemini"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate(self, request: GenerateRequest) -> GenerateResponse:
        if not self.is_configured():
            raise RuntimeError("GEMINI_API_KEY is not configured.")

        start_time = time.time()
        req_id = request.request_id or f"req_{uuid.uuid4().hex[:12]}"

        # Normalize model identifier
        model_name = request.model
        if model_name.startswith("gemini/"):
            model_name = model_name.replace("gemini/", "")
        if not model_name.startswith("models/"):
            model_name = f"models/{model_name}"

        # Default to stable 3.6 / preview flash if generic model requested
        if model_name in ("models/gemini", "models/default", "models/compound"):
            model_name = "models/gemini-3.6-flash"

        # Split system instructions and user/assistant turns
        system_instruction = None
        contents: List[Dict[str, Any]] = []

        for m in request.messages:
            if m.role == "system":
                system_instruction = {"parts": [{"text": m.content}]}
            elif m.role == "assistant":
                contents.append({"role": "model", "parts": [{"text": m.content}]})
            else:
                contents.append({"role": "user", "parts": [{"text": m.content}]})

        # Ensure at least one content turn
        if not contents:
            contents.append({"role": "user", "parts": [{"text": "Hello"}]})

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": request.temperature,
                "maxOutputTokens": request.max_tokens or 2048,
            }
        }

        if system_instruction:
            payload["systemInstruction"] = system_instruction

        headers = {
            "Content-Type": "application/json",
        }

        # Try candidate models if the requested one is retired
        candidate_models = [model_name, "models/gemini-3.6-flash", "models/gemini-3-flash-preview"]
        last_error = None

        timeout = httpx.Timeout(settings.fast_inference_timeout_sec)
        async with httpx.AsyncClient(timeout=timeout) as client:
            for m in candidate_models:
                url = f"{self.base_url}/{m}:generateContent?key={self.api_key}"
                try:
                    resp = await client.post(url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        content = ""
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            content = "".join([p.get("text", "") for p in parts if "text" in p])

                        usage_meta = data.get("usageMetadata", {})
                        usage = UsageMetrics(
                            input_tokens=usage_meta.get("promptTokenCount", 0),
                            output_tokens=usage_meta.get("candidatesTokenCount", 0),
                            total_tokens=usage_meta.get("totalTokenCount", 0),
                        )

                        latency_ms = int((time.time() - start_time) * 1000)

                        return GenerateResponse(
                            request_id=req_id,
                            model=m.replace("models/", ""),
                            provider=self.provider_name,
                            content=content,
                            tool_calls=[],
                            usage=usage,
                            latency_ms=latency_ms,
                        )
                    else:
                        last_error = f"Gemini API error {resp.status_code}: {resp.text}"
                except Exception as ex:
                    last_error = str(ex)

        raise RuntimeError(f"All Gemini model candidates failed: {last_error}")
