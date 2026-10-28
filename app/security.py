"""Password hashing and strictly validated access tokens."""

from datetime import UTC, datetime, timedelta
from secrets import token_urlsafe

import jwt
from fastapi import HTTPException, status
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError
from pwdlib.hashers.argon2 import Argon2Hasher
from pwdlib.hashers.bcrypt import BcryptHasher

from app import config

ALGORITHM = "HS256"
password_hash = PasswordHash((Argon2Hasher(), BcryptHasher()))
DUMMY_HASH = password_hash.hash(token_urlsafe(32))


def signing_key() -> str:
    """Fail closed when the deployment has no sufficiently long signing secret."""
    if len(config.SECRET_KEY.encode()) < 32:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication requires a SECRET_KEY of at least 32 bytes",
        )
    return config.SECRET_KEY


def hash_password(password: str) -> str:
    """Hash a new password with Argon2id."""
    return password_hash.hash(password)


def verify_password(password: str, encoded: str) -> bool:
    """Verify supported hashes; malformed or unsupported hashes never authenticate."""
    try:
        return password_hash.verify(password, encoded)
    except (UnknownHashError, ValueError):
        return False


def create_access_token(user_id: int) -> str:
    """Issue an expiring token containing identity, not cached authorization roles."""
    now = datetime.now(UTC)
    return jwt.encode(
        {
            "sub": str(user_id),
            "iat": now,
            "exp": now + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES),
            "iss": config.JWT_ISSUER,
            "aud": config.JWT_AUDIENCE,
        },
        signing_key(),
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> int:
    """Validate signature, algorithm, required claims, issuer, audience and subject."""
    payload = jwt.decode(
        token,
        signing_key(),
        algorithms=[ALGORITHM],
        issuer=config.JWT_ISSUER,
        audience=config.JWT_AUDIENCE,
        options={"require": ["sub", "exp", "iat", "iss", "aud"]},
    )
    subject = payload["sub"]
    if not isinstance(subject, str) or not subject.isascii() or not subject.isdecimal():
        raise jwt.InvalidTokenError("Invalid subject")
    if len(subject) > 19 or not 0 < int(subject) <= 2**63 - 1:
        raise jwt.InvalidTokenError("Invalid user ID")
    return int(subject)
