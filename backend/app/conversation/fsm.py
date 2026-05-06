from __future__ import annotations

import re
from dataclasses import dataclass

from app.conversation.context import LeadConversationContext
from app.models import CallPhase


@dataclass
class PhaseTransition:
    new_phase: str
    reason: str


_OBJECTION_PATTERNS = re.compile(
    r"broker|already|pehle|naya|trust|SEBI|risk|time|baad|soch|contacts|network|support|scam",
    re.IGNORECASE,
)
_INTENT_STRONG = re.compile(
    r"sign|register|join|start|process|kaise|link|kab se|ready|abhi|today",
    re.IGNORECASE,
)


def infer_transition(
 phase: str,
 user_text: str,
 ctx: LeadConversationContext,
 turn_index: int,
) -> PhaseTransition | None:
    """Heuristic FSM assists the model; LLM still drives content."""
    t = user_text.strip()
    if not t:
        return None

    if phase == CallPhase.OPENER.value:
        if len(t) >= 1:
            return PhaseTransition(CallPhase.PITCH.value, "lead_engaged")

    if phase == CallPhase.PITCH.value:
        if _OBJECTION_PATTERNS.search(t):
            return PhaseTransition(CallPhase.OBJECTION.value, "objection_cue")

    if phase == CallPhase.OBJECTION.value:
        if _INTENT_STRONG.search(t) or re.search(r"haan|yes|theek|ok|samajh|clear", t, re.I):
            return PhaseTransition(CallPhase.QUALIFICATION.value, "objection_resolved_signal")

    if phase == CallPhase.QUALIFICATION.value:
        if _INTENT_STRONG.search(t) or re.search(
            r"50\+|clients|followers|already have", t, re.I
        ):
            return PhaseTransition(CallPhase.CLOSE.value, "qual_done")

    return None


def apply_heuristic_context_update(user_text: str, ctx: LeadConversationContext) -> None:
    t = user_text.lower()
    if any(
        x in t
        for x in ("broker", "already with", "pehle se", "dusre broker", "another broker")
    ):
        ctx.stated_other_broker = True
    m = re.search(r"(\d+)\s*(client|clients|logo|customers)", t, re.I)
    if m:
        ctx.network_size_hint = m.group(1)


def advance_phase(current: str, transition: PhaseTransition | None) -> str:
    if transition:
        return transition.new_phase
    return current
