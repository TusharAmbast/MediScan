"""
services/cache_service.py
──────────────────────────
Caching layer using Upstash Redis.

If 100 users search "Paracetamol" today, without cache we make 100 OpenFDA calls.
With cache we make 1. Every other request returns instantly from memory.

Cache TTLs:
  Medicine info  → 24 hours (drug info rarely changes)
  Symptom search → 6 hours
"""

import json
import redis.asyncio as aioredis
from app.core.config import get_settings
from app.core.logger import logger

settings = get_settings()

MEDICINE_CACHE_TTL = 60 * 60 * 24    # 24 hours in seconds
SYMPTOM_CACHE_TTL  = 60 * 60 * 6     # 6 hours in seconds

_redis_client = None


async def get_redis() -> aioredis.Redis:
    """Returns (or creates) the Redis connection."""
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                settings.REDIS_URL,
                password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
                decode_responses=True,
                socket_timeout=5.0
            )
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            _redis_client = None
    return _redis_client


async def get_cached(key: str) -> dict | None:
    """Retrieve a cached value. Returns None if not found or Redis is down."""
    try:
        redis = await get_redis()
        if not redis:
            return None
        value = await redis.get(key)
        if value:
            logger.info(f"Cache HIT: {key}")
            return json.loads(value)
        logger.info(f"Cache MISS: {key}")
        return None
    except Exception as e:
        logger.warning(f"Cache get failed for '{key}': {e}")
        return None


async def set_cached(key: str, data: dict, ttl: int = MEDICINE_CACHE_TTL) -> None:
    """Store a value in cache. Silently fails if Redis is down."""
    try:
        redis = await get_redis()
        if not redis:
            return
        await redis.setex(key, ttl, json.dumps(data))
        logger.info(f"Cached: {key} (TTL: {ttl}s)")
    except Exception as e:
        logger.warning(f"Cache set failed for '{key}': {e}")


def medicine_cache_key(name: str) -> str:
    return f"medicine:{name.lower().strip()}"


def symptom_cache_key(symptom: str) -> str:
    return f"symptom:{symptom.lower().strip()}"