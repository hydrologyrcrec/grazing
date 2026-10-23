"""Disposable API for Playwright; never use this entry point in deployment."""

import tempfile
from pathlib import Path

import httpx

from app.core.config import Settings
from app.db.base import Base
from app.main import create_app

_temp_directory = tempfile.TemporaryDirectory(prefix="grazing-e2e-")
app = create_app(
    Settings(
        environment="test",
        database_url=f"sqlite+pysqlite:///{Path(_temp_directory.name) / 'e2e.sqlite'}",
        auth_jwt_secret="e2e-only-generated-test-secret-never-use-for-production",
        allowed_origins=["http://localhost:4200"],
        allowed_hosts=["localhost", "127.0.0.1"],
        geocoder_user_agent="GrazingTests/1.0 (test@example.org)",
    )
)
Base.metadata.create_all(app.state.database.engine)
app.state.geocoding.client.close()
app.state.geocoding.client = httpx.Client(
    transport=httpx.MockTransport(
        lambda request: httpx.Response(
            200,
            json=[
                {
                    "lat": "27.48",
                    "lon": "-81.92",
                    "display_name": "Ona, Florida",
                    "boundingbox": ["27.475", "27.485", "-81.925", "-81.915"],
                }
            ],
        )
    )
)
