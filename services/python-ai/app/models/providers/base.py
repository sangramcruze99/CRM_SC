"""
Base Model Provider Interface & Common DTO Schemas.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ToolDefinitionSchema(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ToolCallItem(BaseModel):
    id: str
    name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)


class UsageMetrics(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0


class ChatMessage(BaseModel):
    role: str  # 'system', 'user', 'assistant', 'tool'
    content: str
    name: Optional[str] = None
    tool_calls: Optional[List[ToolCallItem]] = None


class GenerateRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    temperature: float = 0.7
    max_tokens: int = 2048
    tools: Optional[List[ToolDefinitionSchema]] = None
    stream: bool = False
    tenant_id: str
    agent_id: Optional[str] = None
    user_id: Optional[str] = None
    request_id: Optional[str] = None


class GenerateResponse(BaseModel):
    request_id: str
    model: str
    provider: str
    content: str
    tool_calls: List[ToolCallItem] = Field(default_factory=list)
    usage: UsageMetrics = Field(default_factory=UsageMetrics)
    latency_ms: int = 0
    cached: bool = False


class BaseModelProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        pass

    @abstractmethod
    async def generate(self, request: GenerateRequest) -> GenerateResponse:
        pass
