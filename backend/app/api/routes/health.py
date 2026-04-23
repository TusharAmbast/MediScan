"""
api/routes/health.py
─────────────────────
GET /health — Server and all downstream service health check.

The frontend calls this on startup to verify everything is reachable.
If a service is down, the UI can warn users gracefully instead of
showing a confusing blank error screen.
"""

import httpx
from fastapi import APIRouter
from app.models.response_models import HealthResponse
from app.services.cache_service import get_redis
from app.core.config import get_settings
from app.core.logger import logger

router = APIRouter(prefix="/health", tags=["Health"])
settings = get_settings()


@router.get("", response_model=HealthResponse)
async def health_check():
    """
    Returns status of the server and all connected services.
    Possible statuses: "ok", "degraded", "unavailable"
    """
    services = {}

    # ── Check Redis ────────────────────────────────────────────
    try:
        redis = await get_redis()
        await redis.ping()
        services["redis"] = "ok"
    except Exception:
        services["redis"] = "unavailable"

    # ── Check OpenFDA ──────────────────────────────────────────
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get("https://api.fda.gov/drug/label.json?limit=1")
            services["openfda"] = "ok" if r.status_code == 200 else "degraded"
    except Exception:
        services["openfda"] = "unavailable"

    # ── Check LibreTranslate ───────────────────────────────────
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.LIBRETRANSLATE_URL}/languages")
            services["libretranslate"] = "ok" if r.status_code == 200 else "degraded"
    except Exception:
        services["libretranslate"] = "unavailable"

    # Overall status — "ok" only if ALL services are ok
    overall = "ok" if all(v == "ok" for v in services.values()) else "degraded"

    logger.info(f"Health check: {overall} | {services}")

    return HealthResponse(
        status=overall,
        version=settings.APP_VERSION,
        services=services
    )