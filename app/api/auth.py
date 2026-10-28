"""JWT login and the authenticated user's profile."""

from datetime import UTC, datetime, timedelta
from math import ceil
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select

from app import config
from app.dependencies import CurrentUser, DbSession
from app.models import User
from app.schemas.accounts import TokenResponse, UserResponse
from app.security import DUMMY_HASH, create_access_token, signing_key, verify_password
from app.services.accounts import public_user

router = APIRouter(tags=["authentication"])


def cooldown_error(seconds: int) -> HTTPException:
    """Return a retryable login denial with a standard countdown header."""
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail="Too many failed login attempts; try again later",
        headers={"Retry-After": str(max(1, seconds))},
    )


@router.post("/login", response_model=TokenResponse)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession,
    response: Response,
) -> TokenResponse:
    """Authenticate with email in username; lock the account after three failed attempts."""
    signing_key()
    if len(form.username) > 255:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # A row lock serializes failed attempts across workers; errors must commit the counter.
    user = db.scalar(
        select(User)
        .where(func.lower(User.email) == form.username.strip().lower())
        .with_for_update()
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
    valid = len(form.password) <= 128 and verify_password(
        form.password, user.password_hash if user else DUMMY_HASH
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
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return TokenResponse(access_token=token, expires_in=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60)


@router.get("/me", response_model=UserResponse)
def me(user: CurrentUser) -> UserResponse:
    """Return the authenticated account's current role and department, without credentials."""
    return public_user(user)
