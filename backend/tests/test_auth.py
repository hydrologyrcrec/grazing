from datetime import timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import utc_now
from app.models.auth_session import AuthSession
from app.models.enums import UserStatus
from app.models.user import User
from tests.conftest import csrf_headers, signup


def test_signup_login_and_cookie_flags(client, app):
    user = signup(client, "UPPER@example.org")
    assert user["email"] == "upper@example.org"
    assert user["firstName"] == "Akhil"
    assert set(user) == {"id", "email", "firstName", "lastName"}
    assert client.get("/api/auth/session").status_code == 200
    response = client.post(
        "/api/auth/login",
        headers=csrf_headers(client),
        json={"email": "upper@example.org", "password": "example-password-1234"},
    )
    assert response.status_code == 200
    cookies = response.headers.get_list("set-cookie")
    assert all(
        "HttpOnly" in cookie and "SameSite=lax" in cookie and "Path=/" in cookie
        for cookie in cookies
    )
    assert any("Max-Age=900" in cookie for cookie in cookies)
    assert response.headers["cache-control"] == "private, no-store"
    with app.state.database.session_factory() as db:
        stored = db.scalar(select(User))
        assert stored.password_hash.startswith("$argon2id$")
        assert stored.password_hash != "example-password-1234"


def test_duplicate_and_invalid_password_are_rejected(client):
    signup(client)
    headers = csrf_headers(client)
    duplicate = client.post(
        "/api/auth/signup",
        headers=headers,
        json={"email": "researcher@example.org", "password": "different-long-password"},
    )
    assert duplicate.status_code == 409
    invalid = client.post(
        "/api/auth/login",
        headers=headers,
        json={"email": "researcher@example.org", "password": "incorrect"},
    )
    assert invalid.status_code == 401
    assert invalid.json()["error"] == "INVALID_CREDENTIALS"
    short = client.post(
        "/api/auth/signup", headers=headers, json={"email": "new@example.org", "password": "short"}
    )
    assert short.status_code == 400
    assert "short" not in short.text


def test_password_whitespace_preserved(client):
    password = "  password-with-spaces  "
    headers = csrf_headers(client)
    assert (
        client.post(
            "/api/auth/signup",
            headers=headers,
            json={"email": "spaces@example.org", "password": password},
        ).status_code
        == 201
    )
    assert (
        client.post(
            "/api/auth/login",
            headers=headers,
            json={"email": "spaces@example.org", "password": password},
        ).status_code
        == 200
    )
    assert (
        client.post(
            "/api/auth/login",
            headers=headers,
            json={"email": "spaces@example.org", "password": password.strip()},
        ).status_code
        == 401
    )


def test_refresh_rotation_preserves_expiry_and_rejects_replay(client, app):
    signup(client)
    original_token = client.cookies.get("grazing_refresh")
    with app.state.database.session_factory() as db:
        original_expiry = db.scalar(select(AuthSession)).expires_at
    response = client.post("/api/auth/refresh", headers=csrf_headers(client), json={})
    assert response.status_code == 200
    assert client.cookies.get("grazing_refresh") != original_token
    with app.state.database.session_factory() as db:
        stored = db.scalar(select(AuthSession))
        assert stored.expires_at == original_expiry
        assert original_token not in stored.token_hash
    attacker = TestClient(app)
    headers = csrf_headers(attacker)
    attacker.cookies.set("grazing_refresh", original_token)
    assert attacker.post("/api/auth/refresh", headers=headers, json={}).status_code == 401
    assert client.get("/api/auth/session").status_code == 200


def test_logout_revokes_previously_issued_access_cookie(client, app):
    signup(client)
    access = client.cookies.get("grazing_access")
    assert client.post("/api/auth/logout", headers=csrf_headers(client), json={}).status_code == 200
    assert client.get("/api/auth/session").status_code == 401
    attacker = TestClient(app)
    attacker.cookies.set("grazing_access", access)
    response = attacker.get("/api/pastures")
    assert response.status_code == 401
    assert response.json()["error"] == "SESSION_INVALID"


def test_expired_or_disabled_session_is_rejected(client, app):
    signup(client)
    with app.state.database.session_factory() as db:
        stored = db.scalar(select(AuthSession))
        stored.expires_at = utc_now() - timedelta(seconds=1)
        db.commit()
    assert (
        client.post("/api/auth/refresh", headers=csrf_headers(client), json={}).status_code == 401
    )
    assert client.get("/api/pastures").status_code == 401
    signup(client, "disabled@example.org")
    with app.state.database.session_factory() as db:
        user = db.scalar(select(User).where(User.email == "disabled@example.org"))
        user.status = UserStatus.DISABLED
        db.commit()
    assert client.get("/api/auth/session").status_code == 401


def test_session_get_does_not_rotate_refresh(client):
    signup(client)
    token = client.cookies.get("grazing_refresh")
    client.cookies.delete("grazing_access")
    assert client.get("/api/auth/session").status_code == 401
    assert client.cookies.get("grazing_refresh") == token
    assert (
        client.post("/api/auth/refresh", headers=csrf_headers(client), json={}).status_code == 200
    )
