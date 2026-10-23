from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.errors import install_exception_handlers
from app.core.middleware import RequestSizeLimitMiddleware, security_middleware
from app.db.session import Database
from app.services.geocoding import GeocodingService


def create_app(settings: Settings | None = None) -> FastAPI:
    config = settings or get_settings()
    database = Database(config)
    geocoding = GeocodingService(config)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        yield
        geocoding.close()
        database.engine.dispose()

    app = FastAPI(
        title="Pasture 360 API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/api/docs" if config.environment != "production" else None,
        redoc_url=None,
        openapi_url="/api/openapi.json" if config.environment != "production" else None,
    )
    app.state.settings = config
    app.state.database = database
    app.state.geocoding = geocoding
    install_exception_handlers(app)
    app.include_router(api_router)

    @app.middleware("http")
    async def secure_request(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        return await security_middleware(request, call_next, config)

    app.add_middleware(RequestSizeLimitMiddleware, max_bytes=config.max_request_bytes)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=config.allowed_hosts)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-CSRF-Token"],
        expose_headers=["X-Request-ID"],
    )
    return app
