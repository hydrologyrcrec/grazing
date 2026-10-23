from fastapi import APIRouter

from app.api.routes import auth, geocode, health, pastures

api_router = APIRouter(prefix="/api")
for router in (auth.router, pastures.router, geocode.router, health.router):
    api_router.include_router(router)
