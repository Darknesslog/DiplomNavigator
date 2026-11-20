"""JWT login and the authenticated user's profile."""

from datetime import UTC, datetime, timedelta
from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app import config
from backend.app.models import User
from backend.app.schemas.accounts import TokenResponse
from backend.app.security import DUMMY_HASH, create_access_token, signing_key, verify_password


def cooldown_error(seconds: int) -> HTTPException:
    """Return a retryable login denial with a standard countdown header."""
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail="Too many failed login attempts; try again later",
        headers={"Retry-After": str(max(1, seconds))},
    )


def authenticate(db: Session, username: str, password: str) -> TokenResponse:
    """Authenticate with email in username; lock the account after three failed attempts."""
    signing_key()
    if len(username) > 255:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # A row lock serializes failed attempts across workers; errors must commit the counter.
    user = db.scalar(
        select(User).where(func.lower(User.email) == username.strip().lower()).with_for_update()
    )
    now = datetime.now(UTC)
    if user is not None and user.is_active and user.locked_until is not None:
        locked_until = user.locked_until
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=UTC)
        if locked_until > now:
            raise cooldown_error(ceil((locked_until - now).total_seconds()))
        user.failed_login_attempts = 0
        user.locked_until = None
    # Bound hashing work, but still count an oversized wrong password for a known account.
    valid = len(password) <= 128 and verify_password(
        password, user.password_hash if user else DUMMY_HASH
    )
    if user is None or not valid or not user.is_active:
        if user is not None and user.is_active:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= config.LOGIN_MAX_ATTEMPTS:
                user.locked_until = now + timedelta(minutes=config.LOGIN_COOLDOWN_MINUTES)
                db.commit()
                raise cooldown_error(config.LOGIN_COOLDOWN_MINUTES * 60)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user.id)
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = now
    db.commit()
    return TokenResponse(access_token=token, expires_in=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
