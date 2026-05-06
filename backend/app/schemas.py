from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    phone: str
    location: str
    profession: str
    score: int
    status: str
    last_interaction: str | None = None


class TranscriptRow(BaseModel):
    speaker: str
    time: str
    text: str
    type: str | None = "user"


class LeadDetailOut(BaseModel):
    lead: LeadOut
    summary: str | None
    recommended_opener: str | None
    objections: list[dict]
    transcript: list[TranscriptRow]


class DashboardMetricsOut(BaseModel):
    conversion_rate: str
    active_calls: int
    hot_leads_today: int
    funnel: list[dict]
    sentiment: dict[str, str]


class ActivityOut(BaseModel):
    title: str
    description: str
    time: str
    event_type: str


class AnalyticsOut(BaseModel):
    funnel_steps: list[dict]
    attrition: list[dict]
    objections: list[dict]
    language_split: list[dict]


class HotLeadRMRow(BaseModel):
    name: str
    time: str
    source: str
    value: str
    lead_id: UUID
