"""Общая база моделей: правила именования ограничений и типовые миксины.

Все имена ограничений и индексов в БД формируются по единым правилам.
Это нужно, чтобы Alembic мог уверенно менять их в следующих миграциях:
безымянное ограничение в Postgres почти невозможно изменить, его можно
только удалить и создать заново, а без имени его не найти.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Identity, MetaData, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_N_name)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Базовый класс всех ORM-моделей проекта."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class IdMixin:
    """Суррогатный первичный ключ.

    bigint + identity выбран вместо serial: serial оставляет «висящую»
    последовательность и устарел, а identity — стандартный способ в Postgres 10+.
    """

    id: Mapped[int] = mapped_column(
        BigInteger,
        Identity(),
        primary_key=True,
        sort_order=-100,
        comment="Первичный ключ",
    )


class TimestampMixin:
    """Даты создания и изменения записи.

    Время всегда с часовым поясом (timestamptz): иначе при переводе сервера
    на другой часовой пояс или при работе с UTC-фронтендом появляются сдвиги.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        sort_order=90,
        comment="Когда запись создана",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        sort_order=91,
        comment="Когда запись последний раз менялась",
    )
