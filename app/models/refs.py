"""Справочники: факультеты, кафедры, учебные группы."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, SmallInteger, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.accounts import Student, Teacher
    from app.models.topic import Topic

class Faculty(IdMixin, TimestampMixin, Base):
    """Факультет (институт)."""

    __tablename__ = "faculties"
    __table_args__ = ({"comment": "Факультеты и институты"},)

    name: Mapped[str] = mapped_column(
        String(200), nullable=False, unique=True, comment="Полное название факультета"
    )
    short_name: Mapped[str] = mapped_column(
        String(30), nullable=False, unique=True, comment="Аббревиатура для интерфейса"
    )

    departments: Mapped[list[Department]] = relationship(back_populates="faculty")
    groups: Mapped[list[StudyGroup]] = relationship(back_populates="faculty")

    def __repr__(self) -> str:  # pragma: no cover - только для отладки
        return f"<Faculty {self.short_name}>"


class Department(IdMixin, TimestampMixin, Base):
    """Кафедра — подразделение, к которому относятся научные руководители."""

    __tablename__ = "departments"
    __table_args__ = (
        UniqueConstraint("faculty_id", "name"),
        {"comment": "Кафедры"},
    )

    faculty_id: Mapped[int] = mapped_column(
        ForeignKey("faculties.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Факультет, к которому относится кафедра",
    )
    name: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Полное название кафедры"
    )
    short_name: Mapped[str] = mapped_column(
        String(30), nullable=False, unique=True, comment="Аббревиатура кафедры"
    )

    faculty: Mapped[Faculty] = relationship(back_populates="departments")
    teachers: Mapped[list[Teacher]] = relationship(back_populates="department")
    topics: Mapped[list[Topic]] = relationship(back_populates="department")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Department {self.short_name}>"


class StudyGroup(IdMixin, TimestampMixin, Base):
    """Учебная группа студента."""

    __tablename__ = "study_groups"
    __table_args__ = ({"comment": "Учебные группы"},)

    faculty_id: Mapped[int] = mapped_column(
        ForeignKey("faculties.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Факультет группы",
    )
    name: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True, comment="Название группы, например ИУ7-41Б"
    )
    enrollment_year: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, comment="Год поступления группы"
    )

    faculty: Mapped[Faculty] = relationship(back_populates="groups")
    students: Mapped[list[Student]] = relationship(back_populates="group")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<StudyGroup {self.name}>"
