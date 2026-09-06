"""
Agent Catalog Router: GET /v1/agents and GET /v1/agents/{id}.
Exposes centralized definitions for all 10 Business OS AI Agents.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from ..agents.registry import central_agent_registry
from ..agents.schemas import AgentDefinition
from ..security import verify_service_auth, TenantContext

router = APIRouter(prefix="/v1/agents", tags=["Agents"])


@router.get("", response_model=List[AgentDefinition])
async def list_agents(
    context: TenantContext = Depends(verify_service_auth),
):
    """
    Returns definitions for all 10 configured Business OS agents:
    Ares, Athena, Midas, Hermes, Vesta, Lead Qualification, Customer Support,
    Recruitment, E-Commerce, and Content Optimization.
    """
    return central_agent_registry.list_agents()


@router.get("/{agent_id}", response_model=AgentDefinition)
async def get_agent(
    agent_id: str,
    context: TenantContext = Depends(verify_service_auth),
):
    """
    Retrieves full configuration, prompts, allowed tools, trigger rules, and safety approval policies for an agent.
    """
    agent = central_agent_registry.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found in registry.")
    return agent
