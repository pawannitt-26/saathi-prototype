import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class LeadStatus(str, enum.Enum):
    HOT = "HOT"
    WARM = "WARM"
    COLD = "COLD"


class CallPhase(str, enum.Enum):
    OPENER = "OPENER"
    PITCH = "PITCH"
    OBJECTION = "OBJECTION"
    QUALIFICATION = "QUALIFICATION"
    CLOSE = "CLOSE"


class CallStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ObjectionStatus(str, enum.Enum):
    RESOLVED = "RESOLVED"
    PARTIAL = "PARTIAL"
    UNRESOLVED = "UNRESOLVED"


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)
    location: Mapped[str] = mapped_column(String(128), default="")
    profession: Mapped[str] = mapped_column(String(128), default="")
    score: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(16), default=LeadStatus.COLD.value)
    last_interaction_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lead_context_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    opted_in: Mapped[bool] = mapped_column(Boolean, default=True)
    dnd_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    calls: Mapped[list["Call"]] = relationship("Call", back_populates="lead")


class Call(Base):
    __tablename__ = "calls"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    phase: Mapped[str] = mapped_column(String(32), default=CallPhase.OPENER.value)
    language: Mapped[str] = mapped_column(String(32), default="unknown")
    status: Mapped[str] = mapped_column(String(32), default=CallStatus.ACTIVE.value)
    consent_recording: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    score_final: Mapped[int | None] = mapped_column(Integer, nullable=True)
    score_breakdown_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    lead: Mapped[Lead] = relationship("Lead", back_populates="calls")
    turns: Mapped[list["TranscriptTurn"]] = relationship(
        "TranscriptTurn", back_populates="call", order_by="TranscriptTurn.created_at"
    )
    rm_brief: Mapped["RMBrief | None"] = relationship("RMBrief", back_populates="call", uselist=False)


class TranscriptTurn(Base):
    __tablename__ = "transcript_turns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("calls.id"), nullable=False)
    speaker: Mapped[str] = mapped_column(String(32), nullable=False)  # ai | user | system
    text: Mapped[str] = mapped_column(Text, nullable=False)
    phase: Mapped[str | None] = mapped_column(String(32), nullable=True)
    extra_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    call: Mapped[Call] = relationship("Call", back_populates="turns")


class RMBrief(Base):
    __tablename__ = "rm_briefs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("calls.id"), unique=True)
    lead_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"))
    payload_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    recommended_opener: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    call: Mapped[Call] = relationship("Call", back_populates="rm_brief")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    lead_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    call_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("calls.id"), nullable=True)
    meta_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
