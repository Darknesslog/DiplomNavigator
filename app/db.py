"""Подключение к базе: движок, фабрика сессий, зависимость FastAPI."""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import DATABASE_URL, DEBUG
from app.models.base import Base

# pool_pre_ping: перед выдачей соединения из пула проверяет, что оно живо.
# Без этого после простоя Postgres (или рестарта контейнера) первый запрос
# падает с OperationalError.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=DEBUG,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db() -> Iterator[Session]:
    """FastAPI-зависимость: сессия на запрос, гарантированное закрытие."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


__all__ = ["Base", "SessionLocal", "engine", "get_db"]
