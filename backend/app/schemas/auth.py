from uuid import UUID

from pydantic import ConfigDict, EmailStr, Field, field_validator

from app.schemas.base import ApiModel


class LoginRequest(ApiModel):
    model_config = ConfigDict(str_strip_whitespace=False)
    email: EmailStr = Field(max_length=255)
    # Password whitespace is significant and must never be stripped.
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        return value.strip().lower() if isinstance(value, str) else value


class SignupRequest(LoginRequest):
    password: str = Field(min_length=12, max_length=128)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def trim_name(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class PublicUser(ApiModel):
    id: UUID
    email: str
    first_name: str | None
    last_name: str | None


class AuthResponse(ApiModel):
    user: PublicUser


class SuccessResponse(ApiModel):
    success: bool = True


class CsrfResponse(ApiModel):
    token: str
