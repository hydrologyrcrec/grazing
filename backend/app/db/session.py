from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import Settings


class Database:
    def __init__(self, settings: Settings) -> None:
        url = settings.database_url.get_secret_value()
        options: dict[str, Any] = {"pool_pre_ping": True}
        if url.startswith("sqlite"):
            options.update({"connect_args": {"check_same_thread": False}, "poolclass": StaticPool})
        else:
            options.update({"pool_size": 10, "max_overflow": 10, "pool_recycle": 1800})
        self.engine = create_engine(url, **options)
        self.session_factory = sessionmaker(
            bind=self.engine, class_=Session, expire_on_commit=False
        )
