"""initial schema

Revision ID: 202505050001
Revises:
Create Date: 2026-05-05
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "202505050001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(64), nullable=False),
        sa.Column("location", sa.String(128), server_default=""),
        sa.Column("profession", sa.String(128), server_default=""),
        sa.Column("score", sa.Integer(), server_default="0"),
        sa.Column("status", sa.String(16), server_default="COLD"),
        sa.Column("last_interaction_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lead_context_json", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("opted_in", sa.Boolean(), server_default="true"),
        sa.Column("dnd_flag", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "calls",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id"), nullable=False),
        sa.Column("phase", sa.String(32), server_default="OPENER"),
        sa.Column("language", sa.String(32), server_default="unknown"),
        sa.Column("status", sa.String(32), server_default="ACTIVE"),
        sa.Column("consent_recording", sa.Boolean(), server_default="false"),
        sa.Column("consent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("score_final", sa.Integer(), nullable=True),
        sa.Column("score_breakdown_json", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_table(
        "transcript_turns",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("call_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("calls.id"), nullable=False),
        sa.Column("speaker", sa.String(32), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("phase", sa.String(32), nullable=True),
        sa.Column("extra_json", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "rm_briefs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("call_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("calls.id"), unique=True),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id")),
        sa.Column("payload_json", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("recommended_opener", sa.Text(), server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("event_type", sa.String(64), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text(), server_default=""),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id"), nullable=True),
        sa.Column("call_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("calls.id"), nullable=True),
        sa.Column("meta_json", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("audit_events")
    op.drop_table("rm_briefs")
    op.drop_table("transcript_turns")
    op.drop_table("calls")
    op.drop_table("leads")
