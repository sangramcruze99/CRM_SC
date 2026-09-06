"""
Centralized Agent Definition & Policy Schemas.
Enforces multi-tier risk classification, trigger rules, and structured decision traces.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AutonomyMode(str, Enum):
    AUTONOMOUS = "AUTONOMOUS"
    HYBRID = "HYBRID"
    MONITOR_ONLY = "MONITOR_ONLY"


class TriggerRule(BaseModel):
    event_type: str
    condition: str
    description: str


class ApprovalRule(BaseModel):
    action_type: str
    risk_level: RiskLevel
    requires_human_approval: bool = True
    max_auto_value: Optional[float] = None
    reason: str


class ModelPolicy(BaseModel):
    primary_model: str
    fallback_model: str
    max_iterations: int = 5
    temperature: float = 0.7
    timeout_seconds: float = 30.0


class StructuredDecisionTrace(BaseModel):
    """
    Structured reasoning record used for audit, debugging, evaluation, and analytics.
    Replaces hidden raw chain-of-thought.
    """
    decision: str
    reason_codes: List[str]
    confidence: float
    risk: RiskLevel
    target_entity: Optional[str] = None
    target_id: Optional[str] = None
    action_parameters: Dict[str, Any] = Field(default_factory=dict)
    requires_approval: bool = False


class AgentDefinition(BaseModel):
    id: str
    name: str
    description: str
    persona: str
    system_prompt: str
    domain: str
    allowed_tools: List[str]
    forbidden_tools: List[str] = Field(default_factory=list)
    knowledge_scopes: List[str] = Field(default_factory=list)
    trigger_rules: List[TriggerRule] = Field(default_factory=list)
    approval_rules: List[ApprovalRule] = Field(default_factory=list)
    model_policy: ModelPolicy
    autonomy_mode: AutonomyMode = AutonomyMode.HYBRID
    max_steps: int = 8
    enabled: bool = True
