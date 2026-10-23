import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

logger = logging.getLogger(__name__)


class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str) -> None:
        self.status = status
        self.code = code
        self.message = message
        super().__init__(message)


def install_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def api_error(request: Request, error: ApiError) -> JSONResponse:
        return JSONResponse(
            {"error": error.code, "message": error.message}, status_code=error.status
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, error: RequestValidationError) -> JSONResponse:
        # Do not echo input: validation errors may contain passwords or location information.
        details: dict[str, list[str]] = {}
        for item in error.errors():
            key = ".".join(str(part) for part in item["loc"][1:]) or "request"
            details.setdefault(key, []).append(item["msg"])
        return JSONResponse(
            {
                "error": "VALIDATION_ERROR",
                "message": "Please correct the submitted values.",
                "details": details,
            },
            status_code=400,
        )

    @app.exception_handler(HTTPException)
    async def http_error(request: Request, error: HTTPException) -> JSONResponse:
        return JSONResponse(
            {"error": "HTTP_ERROR", "message": str(error.detail)},
            status_code=error.status_code,
            headers=error.headers,
        )

    @app.exception_handler(Exception)
    async def internal_error(request: Request, error: Exception) -> JSONResponse:
        # Log only a correlation identifier and exception type, never SQL params or cookies.
        logger.error(
            "request_failed id=%s type=%s",
            getattr(request.state, "request_id", ""),
            type(error).__name__,
        )
        return JSONResponse(
            {"error": "INTERNAL_ERROR", "message": "Something went wrong."},
            status_code=500,
        )
