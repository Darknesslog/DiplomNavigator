"""Public account contracts; password hashes and lock counters are never returned."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr, field_validator

from app.models.enums import UserRole


class UserResponse(BaseModel):
    """Public identity and the user's current department."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: str
    last_name: str
    middle_name: str | None
    role: UserRole
    is_active: bool
    department_id: int | None
    last_login_at: datetime | None


class TokenResponse(BaseModel):
    """Short-lived bearer token returned after a successful login."""

    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int


class AccountCreate(BaseModel):
    """Identity fields shared by managed student and supervisor creation."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: EmailStr = Field(max_length=255)
    password: SecretStr = Field(min_length=12, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, min_length=1, max_length=100)
    department_id: int = Field(gt=0)

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        """Match the database's case-insensitive login uniqueness."""
        return value.lower()


class StudentCreate(AccountCreate):
    """Create a student account with a study group and department."""

    group_id: int = Field(gt=0)
    record_book_number: str | None = Field(default=None, min_length=1, max_length=20)
    admission_year: int | None = Field(default=None, ge=1900, le=2200)


class SupervisorCreate(AccountCreate):
    """Create a supervisor account and teaching profile."""

    position: str | None = Field(default=None, max_length=100)
    academic_degree: str | None = Field(default=None, max_length=100)
    max_students: int = Field(default=5, ge=1, le=32767)


class RoleUpdate(BaseModel):
    """Assign one supported role; only administrators may grant elevated roles."""

    model_config = ConfigDict(extra="forbid")
    role: UserRole


class DepartmentUpdate(BaseModel):
    """Move a student or supervisor profile into a department."""

    model_config = ConfigDict(extra="forbid")
    department_id: int = Field(gt=0)


class DepartmentResponse(BaseModel):
    """Public department-directory entry."""

    model_config = ConfigDict(from_attributes=True)
    id: int
    faculty_id: int
    name: str
    short_name: str
