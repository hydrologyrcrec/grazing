import pytest
from pydantic import ValidationError

from app.core.config import Settings
from tests.conftest import csrf_headers, signup


def test_csrf_and_origin_required_even_for_login(client):
    body = {"email": "researcher@example.org", "password": "example-password-1234"}
    assert client.post("/api/auth/login", json=body).status_code == 403
    headers = csrf_headers(client)
    assert (
        client.post(
            "/api/auth/login", headers={**headers, "Origin": "https://evil.example.org"}, json=body
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/api/auth/login", headers={**headers, "X-CSRF-Token": "forged"}, json=body
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/api/auth/login", headers={"Origin": "http://localhost:4200"}, json=body
        ).status_code
        == 403
    )


def test_content_type_json_and_body_limits(client):
    signup(client)
    headers = csrf_headers(client)
    assert client.post("/api/pastures", headers=headers, content="plain").status_code == 415
    malformed = client.post(
        "/api/pastures", headers={**headers, "Content-Type": "application/json"}, content="{"
    )
    assert malformed.status_code == 400
    oversized = client.post(
        "/api/pastures",
        headers={**headers, "Content-Type": "application/json"},
        content="x" * 1048577,
    )
    assert oversized.status_code == 413


def test_auth_required_for_all_private_routes(client):
    for route in ["/api/pastures", "/api/geocode?q=Florida", "/api/auth/session"]:
        response = client.get(route)
        assert response.status_code == 401
        assert response.headers["Cache-Control"] == "private, no-store"
        assert response.headers["X-Content-Type-Options"] == "nosniff"


def test_host_and_cors_allowlists(client):
    assert client.get("/api/health/live", headers={"Host": "evil.example.org"}).status_code == 400
    response = client.options(
        "/api/pastures",
        headers={
            "Origin": "http://localhost:4200",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "X-CSRF-Token",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:4200"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_production_settings_reject_insecure_defaults():
    with pytest.raises(ValidationError):
        Settings(
            environment="production",
            database_url="postgresql+psycopg://test:test@localhost/db",
            auth_jwt_secret="short",
        )
    config = Settings(
        environment="production",
        database_url="postgresql+psycopg://test:test@localhost/db",
        auth_jwt_secret="a-generated-strong-test-secret-of-adequate-length",
        allowed_hosts=["pasture.example.org"],
        allowed_origins=["https://pasture.example.org"],
        geocoder_user_agent="Pasture360/1.0 (operator@example.org)",
    )
    assert config.cookie_name("access") == "__Host-grazing_access"
    assert config.secure_cookies
