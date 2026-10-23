"""Настройки приложения из переменных окружения.

Файл `.env` читается только локально (в Docker переменные приходят из compose),
поэтому вызов `load_dotenv()` безопасен и ничего не перетирает: существующие
переменные окружения имеют приоритет.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

DEBUG: bool = os.getenv("DEBUG", "false").lower() in {"1", "true", "yes"}
SECRET_KEY: str = os.getenv("SECRET_KEY", "")
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

DEFAULT_DATABASE_URL = (
    "postgresql+psycopg://diplom_user:diplom_password@localhost:5432/diplom_navigator"
)
DATABASE_URL: str = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)
