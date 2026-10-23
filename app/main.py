"""Точка входа FastAPI."""

from __future__ import annotations

from fastapi import FastAPI

from app.config import ENVIRONMENT

app = FastAPI(
    title="DiplomNavigator API",
    version="0.1.0",
    description="Сервис выбора и распределения тем выпускных работ",
)


@app.get("/health", tags=["service"])
def health() -> dict[str, str]:
    """Проверка живости для docker healthcheck и мониторинга."""
    return {"status": "ok", "environment": ENVIRONMENT}
