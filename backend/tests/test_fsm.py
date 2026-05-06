from app.conversation.context import LeadConversationContext
from app.conversation.fsm import infer_transition, apply_heuristic_context_update
from app.models import CallPhase


def test_opener_to_pitch():
    ctx = LeadConversationContext()
    t = infer_transition(CallPhase.OPENER.value, "haan ji boliye", ctx, 0)
    assert t is not None
    assert t.new_phase == CallPhase.PITCH.value


def test_pitch_to_objection():
    ctx = LeadConversationContext()
    t = infer_transition(
        CallPhase.PITCH.value, "Main pehle se broker ke saath hoon", ctx, 0
    )
    assert t and t.new_phase == CallPhase.OBJECTION.value


def test_ctx_other_broker():
    ctx = LeadConversationContext()
    apply_heuristic_context_update("dusre broker ke paas account hai", ctx)
    assert ctx.stated_other_broker is True
