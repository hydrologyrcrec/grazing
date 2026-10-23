import base64
import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID
import re

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import Settings
from app.core.errors import ApiError

password_hasher = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
DUMMY_PASSWORD_HASH = password_hasher.hash(secrets.token_urlsafe(32))


def utc_now() -> datetime:
    return datetime.now(UTC)


def hash_password(password: str) -> str:
    return password_hasher.hash(password)

def verify_password(encoded: str, password: str) -> bool:
    # Normalize legacy parameter order without changing the stored hash.
    normalized = re.sub(
        r"^(\$argon2id\$v=\d+\$)m=(\d+),p=(\d+),t=(\d+)(\$)",
        r"\1m=\2,t=\4,p=\3\5",
        encoded,
    )
    try:
        return password_hasher.verify(normalized, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def new_refresh_token() -> str:
    return base64.urlsafe_b64encode(secrets.token_bytes(48)).decode().rstrip("=")


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_access_token(user_id: UUID, email: str, session_id: UUID, settings: Settings) -> str:
    now = utc_now()
    return jwt.encode(
        {
            "sub": str(user_id),
            "email": email,
            "sid": str(session_id),
            "iat": now,
            "exp": now + timedelta(seconds=settings.access_token_ttl_seconds),
            "iss": settings.auth_jwt_issuer,
            "aud": settings.auth_jwt_audience,
        },
        settings.auth_jwt_secret.get_secret_value(),
        algorithm="HS256",
    )


def verify_access_token(token: str, settings: Settings) -> dict[str, object]:
    try:
        claims = jwt.decode(
            token,
            settings.auth_jwt_secret.get_secret_value(),
            algorithms=["HS256"],
            issuer=settings.auth_jwt_issuer,
            audience=settings.auth_jwt_audience,
            options={"require": ["sub", "email", "sid", "iat", "exp", "iss", "aud"]},
        )
        UUID(claims["sub"])
        UUID(claims["sid"])
        if not isinstance(claims["email"], str):
            raise ValueError("Invalid email claim")
        return claims
    except (jwt.PyJWTError, ValueError, TypeError) as error:
        raise ApiError(401, "ACCESS_EXPIRED", "Access token has expired.") from error


def create_csrf_token(settings: Settings) -> str:
    nonce = secrets.token_urlsafe(32)
    signature = hmac.new(
        settings.auth_jwt_secret.get_secret_value().encode(),
        f"csrf:{nonce}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return f"{nonce}.{signature}"


def valid_csrf_token(cookie: str, header: str, settings: Settings) -> bool:
    if not cookie or not header or len(cookie) > 200 or not hmac.compare_digest(cookie, header):
        return False
    nonce, separator, signature = cookie.partition(".")
    if not separator or not nonce:
        return False
    expected = hmac.new(
        settings.auth_jwt_secret.get_secret_value().encode(),
        f"csrf:{nonce}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
