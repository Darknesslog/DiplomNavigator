"""JWT login and the authenticated user's profile."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from backend.app.dependencies import CurrentUser, DbSession
from backend.app.schemas.accounts import TokenResponse, UserResponse
from backend.app.services.accounts import public_user
from backend.app.services.authentication import authenticate

router = APIRouter(tags=["authentication"])


@router.post("/login", response_model=TokenResponse)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession,
    response: Response,
) -> TokenResponse:
    """Authenticate with email in username; lock the account after three failed attempts."""
    token = authenticate(db, form.username, form.password)
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return token


@router.get("/me", response_model=UserResponse)
def me(user: CurrentUser) -> UserResponse:
    """Return the authenticated account's current role and department, without credentials."""
    return public_user(user)
