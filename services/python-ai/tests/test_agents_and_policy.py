"""
Agent Registry, Policy Engine & Structured Decision Trace Unit Tests.
"""

from app.agents.registry import central_agent_registry
from app.agents.schemas import RiskLevel, StructuredDecisionTrace, AutonomyMode


def test_ten_agents_present():
    agents = central_agent_registry.list_agents()
    assert len(agents) == 10
    
    expected_agents = [
        "ares",
        "athena",
        "midas",
        "hermes",
        "vesta",
        "lead-qualification",
        "customer-support",
        "recruitment",
        "ecommerce",
        "content-optimization",
    ]
    
    for agent_id in expected_agents:
        agent = central_agent_registry.get(agent_id)
        assert agent is not None, f"Missing agent definition for {agent_id}"
        assert len(agent.allowed_tools) > 0
        assert agent.system_prompt != ""
        assert agent.max_steps > 0
        assert agent.enabled is True


def test_ares_configuration():
    ares = central_agent_registry.get("ares")
    assert "search_crm_deals" in ares.allowed_tools
    assert "move_crm_deal" in ares.allowed_tools
    assert "create_crm_task" in ares.allowed_tools
    events = [t.event_type for t in ares.trigger_rules]
    assert any("inactive" in ev or "stalled" in ev for ev in events)


def test_midas_high_risk_approval():
    midas = central_agent_registry.get("midas")
    assert "create_payment_link" in midas.allowed_tools
    
    # Verify approval rule for high risk actions
    rule = next((r for r in midas.approval_rules if r.risk_level == RiskLevel.HIGH), None)
    assert rule is not None
    assert rule.requires_human_approval is True


def test_recruitment_agent_safety_policies():
    recruitment = central_agent_registry.get("recruitment")
    assert "protected demographic attributes" in recruitment.system_prompt.lower()
    assert "never make final rejection or hiring decisions" in recruitment.system_prompt.lower()


def test_structured_decision_trace_schema():
    trace = StructuredDecisionTrace(
        decision="CREATE_FOLLOWUP_TASK",
        reason_codes=["DEAL_INACTIVE", "HIGH_VALUE", "NO_RECENT_ACTIVITY"],
        confidence=0.94,
        risk=RiskLevel.LOW,
        target_entity="deal",
        target_id="deal-123",
        action_parameters={"title": "Call VP Sales"}
    )
    
    dumped = trace.model_dump()
    assert dumped["decision"] == "CREATE_FOLLOWUP_TASK"
    assert dumped["confidence"] == 0.94
    assert dumped["risk"] == "LOW"
    assert "thought" not in dumped
    assert "chain_of_thought" not in dumped
