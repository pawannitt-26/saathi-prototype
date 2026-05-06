from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from app.models import CallPhase


@dataclass
class LeadConversationContext:
    """Running context object merged into each LLM turn (concept Section 03)."""

    beliefs: list[str] = field(default_factory=list)
    admissions: list[str] = field(default_factory=list)
    objections_raised: list[dict[str, Any]] = field(default_factory=list)
    resolution_accepted: list[str] = field(default_factory=list)
    language_preference: str = "dynamic"
    network_size_hint: str | None = None
    stated_other_broker: bool = False

    def to_prompt_block(self) -> str:
        import json

        return json.dumps(
            {
                "beliefs": self.beliefs,
                "admissions": self.admissions,
                "objections_raised": self.objections_raised,
                "resolution_accepted": self.resolution_accepted,
                "language_preference": self.language_preference,
                "network_size_hint": self.network_size_hint,
                "stated_other_broker": self.stated_other_broker,
            },
            ensure_ascii=False,
        )

    @classmethod
    def from_dict(cls, data: dict | None) -> LeadConversationContext:
        if not data:
            return cls()
        return cls(
            beliefs=list(data.get("beliefs") or []),
            admissions=list(data.get("admissions") or []),
            objections_raised=list(data.get("objections_raised") or []),
            resolution_accepted=list(data.get("resolution_accepted") or []),
            language_preference=data.get("language_preference") or "dynamic",
            network_size_hint=data.get("network_size_hint"),
            stated_other_broker=bool(data.get("stated_other_broker")),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "beliefs": self.beliefs,
            "admissions": self.admissions,
            "objections_raised": self.objections_raised,
            "resolution_accepted": self.resolution_accepted,
            "language_preference": self.language_preference,
            "network_size_hint": self.network_size_hint,
            "stated_other_broker": self.stated_other_broker,
        }


def default_context_json() -> dict[str, Any]:
    return LeadConversationContext().to_dict()


# Phase order for transitions
_PHASE_ORDER = list(CallPhase)


def next_phase(current: str) -> str | None:
    try:
        idx = _PHASE_ORDER.index(CallPhase(current))
    except ValueError:
        return None
    if idx + 1 < len(_PHASE_ORDER):
        return _PHASE_ORDER[idx + 1].value
    return None


def phase_instruction(phase: str) -> str:
    instr = {
        CallPhase.OPENER.value: "Introduce as AI. Bilingual greeting (Hindi+English). Confirm they have a minute; listen for language.",
        CallPhase.PITCH.value: "Deliver three benefits: zero joining fee, 100% brokerage share, daily RISE payouts. Pause for reactions.",
        CallPhase.OBJECTION.value: "Address one objection using context; confirm understanding before moving on.",
        CallPhase.QUALIFICATION.value: "Ask network size, timeline, remaining concerns. Score signals mentally.",
        CallPhase.CLOSE.value: "CTA: sign-up link, RM transfer, or WhatsApp follow-up based on warmth.",
    }
    return instr.get(phase, "Continue helpfully within fact sheet.")
