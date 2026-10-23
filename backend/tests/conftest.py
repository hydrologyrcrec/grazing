import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.db.base import Base
from app.main import create_app


@pytest.fixture
def app():
    settings = Settings(
        environment="test",
        database_url=os.getenv("TEST_DATABASE_URL", "sqlite+pysqlite://"),
        auth_jwt_secret="a-test-secret-that-is-long-enough-and-not-production",
        allowed_origins=["http://localhost:4200"],
        allowed_hosts=["testserver", "localhost"],
        geocoder_user_agent="GrazingApiTests/1.0 (test@example.org)",
    )
    application = create_app(settings)
    Base.metadata.create_all(application.state.database.engine)
    yield application
    Base.metadata.drop_all(application.state.database.engine)


@pytest.fixture
def client(app) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


def csrf_headers(client: TestClient) -> dict[str, str]:
    token = client.get("/api/auth/csrf").json()["token"]
    return {"Origin": "http://localhost:4200", "X-CSRF-Token": token}


def signup(client: TestClient, email: str = "researcher@example.org") -> dict:
    response = client.post(
        "/api/auth/signup",
        headers=csrf_headers(client),
        json={"email": email, "password": "example-password-1234", "firstName": "Akhil"},
    )
    assert response.status_code == 201, response.text
    return response.json()["user"]
