"""
core/config.py
──────────────
Loads all environment variables from .env into a single typed Settings object.
Every other file imports from here — never use os.environ directly elsewhere.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── App ────────────────────────────────────────────────────
    APP_NAME: str = "MediScan"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── Supabase ───────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # ── Redis (Upstash) ────────────────────────────────────────
    REDIS_URL: str
    REDIS_PASSWORD: str = ""

    # ── HuggingFace ────────────────────────────────────────────
    HUGGINGFACE_API_KEY: str

    # ── LibreTranslate ─────────────────────────────────────────
    LIBRETRANSLATE_URL: str = "https://libretranslate.com"
    LIBRETRANSLATE_API_KEY: str = ""

    # ── OpenFDA ────────────────────────────────────────────────
    OPENFDA_API_KEY: str = ""

    # ── OCR ────────────────────────────────────────────────────
    OCR_CONFIDENCE_THRESHOLD: float = 0.6
    MAX_IMAGE_SIZE_MB: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# lru_cache ensures Settings is only created ONCE and reused everywhere
@lru_cache()
def get_settings() -> Settings:
    return Settings()