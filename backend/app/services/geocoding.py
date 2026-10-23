import threading
import time
from collections import OrderedDict
from typing import cast

import httpx

from app.core.config import Settings
from app.core.errors import ApiError
from app.schemas.geocode import GeocodeResult


class GeocodingService:
    """Submit-only search with bounded cache, timeout, and one upstream request per second.

    One API process is required with public Nominatim. Multiple replicas must use a shared
    limiter/cache or an approved private provider before enabling geocoding (see deployment docs).
    """

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = httpx.Client(
            timeout=settings.geocoder_timeout_seconds, follow_redirects=False
        )
        self._lock = threading.Lock()
        self._last_request = 0.0
        self._cache: OrderedDict[str, tuple[float, list[GeocodeResult]]] = OrderedDict()

    def close(self) -> None:
        self.client.close()

    def search(self, query: str) -> list[GeocodeResult]:
        if not self.settings.geocoder_user_agent:
            raise ApiError(
                503, "GEOCODER_NOT_CONFIGURED", "Address search has not been configured."
            )
        key = query.casefold()
        with self._lock:
            now = time.monotonic()
            cached = self._cache.get(key)
            if cached and cached[0] > now:
                self._cache.move_to_end(key)
                return cached[1]
            delay = 1.05 - (now - self._last_request)
            if delay > 0:
                time.sleep(delay)
            self._last_request = time.monotonic()
            try:
                response = self.client.get(
                    self.settings.geocoder_url,
                    params={"q": query, "format": "jsonv2", "limit": "5", "addressdetails": "1"},
                    headers={
                        "Accept": "application/json",
                        "Accept-Language": "en",
                        "User-Agent": self.settings.geocoder_user_agent,
                    },
                )
                response.raise_for_status()
                data = response.json()
                if not isinstance(data, list):
                    raise ValueError("Invalid geocoder response")
                results = [
                    GeocodeResult(
                        lat=float(item["lat"]),
                        lng=float(item["lon"]),
                        label=item["display_name"],
                        bounding_box=cast(
                            tuple[float, float, float, float],
                            tuple(map(float, item["boundingbox"])),
                        )
                        if item.get("boundingbox")
                        else None,
                    )
                    for item in data[:5]
                ]
            except (httpx.HTTPError, ValueError, KeyError, TypeError) as error:
                raise ApiError(
                    502, "GEOCODER_UNAVAILABLE", "Address search is unavailable."
                ) from error
            self._cache[key] = (time.monotonic() + self.settings.geocoder_cache_seconds, results)
            self._cache.move_to_end(key)
            while len(self._cache) > 500:
                self._cache.popitem(last=False)
            return results
