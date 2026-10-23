import uuid
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.config import Settings
from app.core.security import valid_csrf_token


async def security_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
    settings: Settings,
) -> Response:
    request.state.request_id = str(uuid.uuid4())
    response: Response | None = None
    unsafe = request.method in {"POST", "PUT", "PATCH", "DELETE"}
    if unsafe and request.url.path.startswith("/api/"):
        if request.headers.get("origin") not in settings.allowed_origins:
            response = JSONResponse(
                {"error": "ORIGIN_REJECTED", "message": "Origin is not allowed."}, status_code=403
            )
        elif not valid_csrf_token(
            request.cookies.get(settings.cookie_name("csrf"), ""),
            request.headers.get("x-csrf-token", ""),
            settings,
        ):
            response = JSONResponse(
                {"error": "CSRF_REJECTED", "message": "Reload and try again."}, status_code=403
            )
        elif (
            request.method in {"POST", "PUT", "PATCH"}
            and request.url.path
            not in {
                "/api/auth/logout",
                "/api/auth/refresh",
            }
            and request.headers.get("content-type", "").split(";")[0].lower() != "application/json"
        ):
            response = JSONResponse(
                {
                    "error": "UNSUPPORTED_MEDIA_TYPE",
                    "message": "Content-Type must be application/json.",
                },
                status_code=415,
            )
    if response is None:
        response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Frame-Options"] = "DENY"
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "private, no-store"
    return response


class RequestSizeLimitMiddleware:
    """Bound streamed bodies as well as Content-Length before any JSON parser runs."""

    def __init__(self, app: ASGIApp, max_bytes: int) -> None:
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        headers = dict(scope["headers"])
        length = headers.get(b"content-length", b"0")
        try:
            too_large = int(length) > self.max_bytes
        except ValueError:
            too_large = True
        body = bytearray()
        if not too_large:
            while True:
                message = await receive()
                if message["type"] == "http.disconnect":
                    return
                body.extend(message.get("body", b""))
                if len(body) > self.max_bytes:
                    too_large = True
                    break
                if not message.get("more_body", False):
                    break
        if too_large:
            response = JSONResponse(
                {"error": "REQUEST_TOO_LARGE", "message": "Request is too large."},
                status_code=413,
                headers={"Cache-Control": "private, no-store"},
            )
            await response(scope, receive, send)
            return
        delivered = False

        async def bounded_receive() -> Message:
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": bytes(body), "more_body": False}
            return await receive()

        await self.app(scope, bounded_receive, send)
