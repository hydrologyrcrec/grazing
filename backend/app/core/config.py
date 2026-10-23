from functools import lru_cache
from typing import Literal
from urllib.parse import urlparse

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: Literal["development", "test", "production"] = "development"
    database_url: SecretStr
    auth_jwt_secret: SecretStr
    auth_jwt_issuer: str = "grazing-web"
    auth_jwt_audience: str = "grazing-web"
    access_token_ttl_seconds: int = Field(default=900, ge=60, le=900)
    refresh_token_ttl_seconds: int = Field(default=172800, ge=900, le=172800)
    allowed_origins: list[str] = ["http://localhost:4200"]
    allowed_hosts: list[str] = ["localhost", "127.0.0.1", "testserver", "backend"]
    geocoder_url: str = "https://nominatim.openstreetmap.org/search"
    geocoder_user_agent: str = ""
    geocoder_cache_seconds: int = Field(default=86400, ge=60)
    geocoder_timeout_seconds: float = Field(default=10, ge=1, le=30)
    max_request_bytes: int = Field(default=1048576, ge=1024, le=1048576)

    @model_validator(mode="after")
    def validate_security_configuration(self) -> "Settings":
        secret = self.auth_jwt_secret.get_secret_value()
        if len(secret) < 32 or "replace" in secret.lower() or "change-me" in secret.lower():
            raise ValueError(
                "AUTH_JWT_SECRET must be a generated secret of at least 32 characters."
            )
        if (
            not self.database_url.get_secret_value().startswith("postgresql+psycopg://")
            and self.environment != "test"
        ):
            raise ValueError("DATABASE_URL must use the postgresql+psycopg:// driver.")
        if not self.allowed_hosts or "*" in self.allowed_hosts:
            raise ValueError("ALLOWED_HOSTS must be an explicit nonempty host allowlist.")
        if not self.allowed_origins:
            raise ValueError("ALLOWED_ORIGINS must contain at least one frontend origin.")
        for origin in self.allowed_origins:
            parsed = urlparse(origin)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path:
                raise ValueError("ALLOWED_ORIGINS entries must be exact origins without paths.")
            if parsed.username or parsed.password or parsed.query or parsed.fragment:
                raise ValueError(
                    "ALLOWED_ORIGINS must not contain credentials, query, or fragment."
                )
            if self.environment == "production" and parsed.scheme != "https":
                raise ValueError("Production requires HTTPS frontend origins.")
        parsed_geocoder = urlparse(self.geocoder_url)
        if parsed_geocoder.scheme != "https" or not parsed_geocoder.netloc:
            raise ValueError("GEOCODER_URL must be an HTTPS URL.")
        if self.environment == "production" and not self.geocoder_user_agent.strip():
            raise ValueError("Production requires GEOCODER_USER_AGENT with an operator contact.")
        return self

    @property
    def secure_cookies(self) -> bool:
        return self.environment == "production"

    def cookie_name(self, purpose: str) -> str:
        prefix = "__Host-" if self.secure_cookies else ""
        return f"{prefix}grazing_{purpose}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
