"""
Groq LPU High-Speed Cloud Model Provider.
Sub-second real-time inference with tool calling support.
"""

import time
import json
import uuid
from typing import Dict, Any
import httpx
from .base import BaseModelProvider, GenerateRequest, GenerateResponse, ToolCallItem, UsageMetrics
from ...config import settings


class GroqProvider(BaseModelProvider):
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.groq_api_key
        self.base_url = "https://api.groq.com/openai/v1"

    @property
    def provider_name(self) -> str:
        return "groq"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate(self, request: GenerateRequest) -> GenerateResponse:
        if not self.is_configured():
            raise RuntimeError("GROQ_API_KEY is not configured.")

        start_time = time.time()
        req_id = request.request_id or f"req_{uuid.uuid4().hex[:12]}"

        messages_payload = []
        for m in request.messages:
            msg: Dict[str, Any] = {"role": m.role, "content": m.content}
            if m.name:
                msg["name"] = m.name
            messages_payload.append(msg)

        payload: Dict[str, Any] = {
            "model": request.model if not request.model.startswith("groq/") else request.model.replace("groq/", ""),
            "messages": messages_payload,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
        }

        # Format tools if provided
        if request.tools and len(request.tools) > 0:
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

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        timeout = httpx.Timeout(settings.fast_inference_timeout_sec)
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", json=payload, headers=headers)

            if resp.status_code != 200:
                raise RuntimeError(f"Groq API returned error {resp.status_code}: {resp.text}")

            data = resp.json()
            choice = data["choices"][0]
            message_obj = choice.get("message", {})
            content = message_obj.get("content") or ""

            # Extract structured tool calls
            tool_calls = []
            if "tool_calls" in message_obj and message_obj["tool_calls"]:
                for tc in message_obj["tool_calls"]:
                    fn = tc.get("function", {})
                    fn_name = fn.get("name", "")
                    fn_args_str = fn.get("arguments", "{}")
                    try:
                        parsed_args = json.loads(fn_args_str) if isinstance(fn_args_str, str) else fn_args_str
                    except Exception:
                        parsed_args = {"raw_arguments": fn_args_str}

                    tool_calls.append(
                        ToolCallItem(
                            id=tc.get("id", f"call_{uuid.uuid4().hex[:8]}"),
                            name=fn_name,
                            arguments=parsed_args,
                        )
                    )

            usage_raw = data.get("usage", {})
            usage = UsageMetrics(
                input_tokens=usage_raw.get("prompt_tokens", 0),
                output_tokens=usage_raw.get("completion_tokens", 0),
                total_tokens=usage_raw.get("total_tokens", 0),
            )

            latency_ms = int((time.time() - start_time) * 1000)

            return GenerateResponse(
                request_id=req_id,
                model=data.get("model", request.model),
                provider=self.provider_name,
                content=content,
                tool_calls=tool_calls,
                usage=usage,
                latency_ms=latency_ms,
            )
