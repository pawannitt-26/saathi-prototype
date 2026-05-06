from app.conversation.context import LeadConversationContext
from app.scoring import compute_final_score


def test_hot_score():
    ctx = LeadConversationContext()
    ctx.network_size_hint = "60"
    ctx.objections_raised.append({"x": 1})
    ctx.resolution_accepted.append("r")
    user = "I want to sign up and get the link please"
    total, breakdown, label = compute_final_score(
        transcript_user_blob=user,
        ctx=ctx,
        duration_seconds=300,
        has_prior_calls=True,
    )
    assert total >= 40
    assert label in ("HOT", "WARM", "COLD")
