"""Provision the first administrator locally: uv run python -m scripts.create_admin."""

from getpass import getpass

from pydantic import BaseModel, EmailStr, Field, SecretStr, ValidationError
from sqlalchemy.exc import IntegrityError

from app.db import SessionLocal
from app.models import User, UserRole
from app.security import hash_password, signing_key


class AdminInput(BaseModel):
    """Validate bootstrap identity without displaying the password."""

    email: EmailStr = Field(max_length=255)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    password: SecretStr = Field(min_length=12, max_length=128)


def main() -> None:
    """Create one admin interactively, without public admin registration."""
    signing_key()
    email = input("Email: ").strip().lower()
    first_name = input("First name: ").strip()
    last_name = input("Last name: ").strip()
    password = getpass("Password (12–128 characters): ")
    if password != getpass("Repeat password: "):
        raise SystemExit("Passwords do not match")
    try:
        data = AdminInput(
            email=email, first_name=first_name, last_name=last_name, password=password
        )
    except ValidationError as exc:
        # Do not print raw inputs (especially the password) on invalid bootstrap data.
        messages = [
            f"{'.'.join(str(part) for part in error['loc'])}: {error['msg']}"
            for error in exc.errors(include_input=False)
        ]
        raise SystemExit("; ".join(messages)) from None
    with SessionLocal() as db:
        db.add(
            User(
                email=str(data.email),
                first_name=data.first_name,
                last_name=data.last_name,
                password_hash=hash_password(data.password.get_secret_value()),
                role=UserRole.ADMIN,
            )
        )
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise SystemExit("An account with this email already exists") from None
    print("Administrator created")


if __name__ == "__main__":
    main()
