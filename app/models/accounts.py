"""Пользователи и их профили: студент, преподаватель."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, SmallInteger, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin
from app.models.enums import UserRole, db_enum


class User(IdMixin, TimestampMixin, Base):
    """Учётная запись: то, чем человек логинится.

    Профиль студента и профиль преподавателя лежат в отдельных таблицах
    (students / teachers) и ссылаются на users. Так авторизация не зависит от
    того, кем человек является в предметной области, а один пользователь может
    позже стать методистом, не переписывая все внешние ключи.
    """

    __tablename__ = "users"
    __table_args__ = ({"comment": "Учётные записи пользователей"},)

    last_name: Mapped[str] = mapped_column(String(100), nullable=False, comment="Фамилия")
    first_name: Mapped[str] = mapped_column(String(100), nullable=False, comment="Имя")
    middle_name: Mapped[str | None] = mapped_column(
        String(100), nullable=True, comment="Отчество, если есть"
    )
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Логин и адрес для писем"
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Хэш пароля (argon2/bcrypt), не сам пароль"
    )
    role: Mapped[UserRole] = mapped_column(
        db_enum(UserRole, "user_role"),
        nullable=False,
        comment="Роль: student / teacher / admin",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true"), comment="Может ли входить в систему"
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Последний успешный вход"
    )

    student: Mapped[Student | None] = relationship(back_populates="user", uselist=False)
    teacher: Mapped[Teacher | None] = relationship(back_populates="user", uselist=False)
    notifications: Mapped[list[Notification]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User {self.email}>"


# Email сравнивается без учёта регистра (Ivan@mail.ru == ivan@mail.ru).
# citext потребовал бы расширения БД, поэтому проще функциональный уникальный индекс.
Index("uq_users_email_lower", func.lower(User.email), unique=True)


class Student(IdMixin, TimestampMixin, Base):
    """Профиль студента."""

    __tablename__ = "students"
    __table_args__ = ({"comment": "Студенты"},)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        comment="Учётная запись студента",
    )
    group_id: Mapped[int] = mapped_column(
        ForeignKey("study_groups.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Учебная группа",
    )
    record_book_number: Mapped[str | None] = mapped_column(
        String(20), nullable=True, unique=True, comment="Номер зачётной книжки"
    )
    admission_year: Mapped[int | None] = mapped_column(
        SmallInteger, nullable=True, comment="Год поступления"
    )

    user: Mapped[User] = relationship(back_populates="student")
    group: Mapped[StudyGroup] = relationship(back_populates="students")
    applications: Mapped[list[Application]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )
    assignments: Mapped[list[Assignment]] = relationship(back_populates="student")
    proposed_topics: Mapped[list[Topic]] = relationship(back_populates="proposed_by_student")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Student id={self.id}>"


class Teacher(IdMixin, TimestampMixin, Base):
    """Профиль преподавателя — потенциального научного руководителя."""

    __tablename__ = "teachers"
    __table_args__ = ({"comment": "Преподаватели и научные руководители"},)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        comment="Учётная запись преподавателя",
    )
    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Кафедра",
    )
    position: Mapped[str | None] = mapped_column(
        String(100), nullable=True, comment="Должность: доцент, профессор, ассистент"
    )
    academic_degree: Mapped[str | None] = mapped_column(
        String(100), nullable=True, comment="Учёная степень и звание"
    )
    max_students: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        server_default=text("5"),
        comment="Сколько студентов одновременно может вести",
    )
    is_available: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("true"),
        comment="Показывать ли в списке доступных руководителей",
    )

    user: Mapped[User] = relationship(back_populates="teacher")
    department: Mapped[Department] = relationship(back_populates="teachers")
    topics: Mapped[list[Topic]] = relationship(back_populates="supervisor")
    assignments: Mapped[list[Assignment]] = relationship(back_populates="supervisor")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Teacher id={self.id}>"
