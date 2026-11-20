"""Shared domain profile requirements, independent of workflow commands."""

from fastapi import HTTPException

from backend.app.models import Teacher, User


def require_supervisor_profile(actor: User) -> Teacher:
    """Return the domain profile required by supervisor endpoints."""
    if actor.teacher is None:
        raise HTTPException(status_code=409, detail="Supervisor profile is required")
    return actor.teacher
