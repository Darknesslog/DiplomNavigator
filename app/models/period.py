"""Периоды выбора тем: окно, в котором студенты подают заявки."""

from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin
from app.models.enums import PeriodStatus, Semester, db_enum

if TYPE_CHECKING:
    from app.models.topic import Topic

class AcademicPeriod(IdMixin, TimestampMixin, Base):
    """Учебный период, к которому привязаны темы и заявки.

    Без этой таблицы «текущий семестр» приходится держать в коде или в конфиге,
    и каждое следующее полугодие превращается в правку констант.
    """

    __tablename__ = "academic_periods"
    __table_args__ = (
        UniqueConstraint("academic_year", "semester"),
        CheckConstraint("ends_on >= starts_on", name="dates_order"),
        CheckConstraint("application_closes_at > application_opens_at", name="application_window"),
        {"comment": "Периоды учебного года, в рамках которых выбираются темы"},
    )

    name: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, comment="Отображаемое имя, например «Весна 2027»"
    )
    academic_year: Mapped[int] = mapped_column(
        nullable=False, comment="Учебный год, в который входит период (2026 = 2026/2027)"
    )
    semester: Mapped[Semester] = mapped_column(
        db_enum(Semester, "semester", length=16), nullable=False, comment="Осенний или весенний"
    )
    starts_on: Mapped[date] = mapped_column(Date, nullable=False, comment="Первый день периода")
    ends_on: Mapped[date] = mapped_column(Date, nullable=False, comment="Последний день периода")
    application_opens_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, comment="Когда открывается подача заявок"
    )
    application_closes_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, comment="Когда подача заявок закрывается"
    )
    status: Mapped[PeriodStatus] = mapped_column(
        db_enum(PeriodStatus, "period_status"),
        nullable=False,
        server_default="draft",
        comment="draft / open / closed / archived",
    )

    topics: Mapped[list[Topic]] = relationship(back_populates="period")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<AcademicPeriod {self.name}>"
