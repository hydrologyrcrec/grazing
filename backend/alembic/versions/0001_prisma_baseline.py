"""Preserve the existing Prisma PostgreSQL schema exactly.

Revision ID: 0001_prisma_baseline
Revises: None
Existing databases must be verified and stamped, not upgraded through this initial revision.
"""

from pathlib import Path

from alembic import op

revision = "0001_prisma_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    baseline = Path(__file__).with_suffix(".sql").read_text(encoding="utf-8")
    # This fixed baseline contains no procedures or semicolons inside strings.
    for statement in baseline.split(";"):
        if statement.strip():
            op.execute(statement)


def downgrade() -> None:
    # Explicitly destructive: only for disposable databases or an approved rollback plan.
    for table in ("AuthSession", "Pasture", "User"):
        op.drop_table(table)
    for enum in ("LandUse", "PastureStatus", "UserStatus"):
        op.execute(f'DROP TYPE "{enum}"')
