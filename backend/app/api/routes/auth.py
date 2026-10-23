from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from app.api.dependencies import ActiveUser, Config, Db
from app.core.cookies import clear_auth_cookies, set_auth_cookies
from app.core.errors import ApiError
from app.core.security import create_csrf_token, valid_csrf_token
from app.schemas.auth import (
    AuthResponse,
    CsrfResponse,
    LoginRequest,
    PublicUser,
    SignupRequest,
    SuccessResponse,
)
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/csrf", response_model=CsrfResponse)
def csrf(request: Request, response: Response, settings: Config) -> CsrfResponse:
    existing = request.cookies.get(settings.cookie_name("csrf"), "")
    token = (
        existing if valid_csrf_token(existing, existing, settings) else create_csrf_token(settings)
    )
    response.set_cookie(
        settings.cookie_name("csrf"),
        token,
        httponly=False,
        secure=settings.secure_cookies,
        samesite="lax",
        path="/",
    )
    return CsrfResponse(token=token)


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(payload: SignupRequest, response: Response, db: Db, settings: Config) -> AuthResponse:
    user, tokens = AuthService(db, settings).signup(payload)
    set_auth_cookies(response, tokens, settings)
    return AuthResponse(user=user)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Db, settings: Config) -> AuthResponse:
    user, tokens = AuthService(db, settings).login(payload)
    set_auth_cookies(response, tokens, settings)
    return AuthResponse(user=user)


@router.get("/session", response_model=AuthResponse)
def session(user: ActiveUser) -> AuthResponse:
    # GET stays read-only. The Angular auth service handles refresh via POST.
    return AuthResponse(user=PublicUser.model_validate(user))


@router.post("/refresh", response_model=AuthResponse)
def refresh(
    request: Request, response: Response, db: Db, settings: Config
) -> AuthResponse | JSONResponse:
    try:
        user, tokens = AuthService(db, settings).refresh(
            request.cookies.get(settings.cookie_name("refresh"))
        )
        set_auth_cookies(response, tokens, settings)
        return AuthResponse(user=user)
    except ApiError as error:
        failure = JSONResponse(
            {"error": error.code, "message": error.message}, status_code=error.status
        )
        clear_auth_cookies(failure, settings)
        return failure


@router.post("/logout", response_model=SuccessResponse)
def logout(request: Request, response: Response, db: Db, settings: Config) -> SuccessResponse:
    AuthService(db, settings).logout(request.cookies.get(settings.cookie_name("refresh")))
    clear_auth_cookies(response, settings)
    return SuccessResponse()
