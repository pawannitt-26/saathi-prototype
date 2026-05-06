"""Real-time and final qualification scoring (concept Section 04)."""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.conversation.context import LeadConversationContext
from app.models import LeadStatus


@dataclass
class ScoreBreakdown:
    verbal_intent: int
    objection_pattern: int
    engagement_duration: int
    network_size_stated: int
    prior_interaction: int

    def total(self) -> int:
        return min(
            100,
            self.verbal_intent
            + self.objection_pattern
            + self.engagement_duration
            + self.network_size_stated
            + self.prior_interaction,
        )

    def to_dict(self) -> dict:
        return {
            "verbal_intent": self.verbal_intent,
            "objection_pattern": self.objection_pattern,
            "engagement_duration": self.engagement_duration,
            "network_size_stated": self.network_size_stated,
            "prior_interaction": self.prior_interaction,
            "total": self.total(),
        }


_VERBAL = re.compile(
    r"sign|register|join|start|process|link|how do i|kab|when|ready",
    re.IGNORECASE,
)


def score_verbal_intent(transcript_user_blob: str) -> int:
    if _VERBAL.search(transcript_user_blob):
        return 28
    if len(transcript_user_blob) > 80:
        return 15
    return 5


def score_objection_pattern(ctx: LeadConversationContext) -> int:
    n = len(ctx.objections_raised)
    resolved = len(ctx.resolution_accepted)
    if n == 0:
        return 25
    if resolved >= 2:
        return 12
    if resolved == 1:
        return 18
    return 0


def score_engagement_duration(seconds: int) -> int:
    if seconds >= 240:
        return 20
    if seconds >= 120:
        return 14
    if seconds >= 60:
        return 7
    return 0


def score_network(ctx: LeadConversationContext, transcript_user_blob: str) -> int:
    if ctx.network_size_hint:
        try:
            n = int(ctx.network_size_hint)
            if n > 50:
                return 15
            if n >= 10:
                return 10
            return 5
        except ValueError:
            pass
    if re.search(r"clients|network|followers|logo", transcript_user_blob, re.I):
        return 8
    return 2


def score_prior(has_prior_calls: bool) -> int:
    return 10 if has_prior_calls else 0


def compute_final_score(
    *,
    transcript_user_blob: str,
    ctx: LeadConversationContext,
    duration_seconds: int,
    has_prior_calls: bool,
) -> tuple[int, ScoreBreakdown, str]:
    b = ScoreBreakdown(
        verbal_intent=score_verbal_intent(transcript_user_blob),
        objection_pattern=score_objection_pattern(ctx),
        engagement_duration=score_engagement_duration(duration_seconds),
        network_size_stated=score_network(ctx, transcript_user_blob),
        prior_interaction=score_prior(has_prior_calls),
    )
    total = b.total()
    if total >= 75:
        label = LeadStatus.HOT.value
    elif total >= 40:
        label = LeadStatus.WARM.value
    else:
        label = LeadStatus.COLD.value
    return total, b, label
