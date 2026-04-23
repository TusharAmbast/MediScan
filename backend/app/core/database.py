"""
core/database.py
─────────────────
Creates a single reusable Supabase client.
Import get_supabase_client() anywhere you need DB access.
"""

from supabase import create_client, Client
from functools import lru_cache
from app.core.config import get_settings
from app.core.logger import logger


@lru_cache()
def get_supabase_client() -> Client:
    """
    Creates the Supabase client once and reuses it (lru_cache).
    Uses SUPABASE_URL and SUPABASE_KEY from your .env file.
    """
    settings = get_settings()
    
    client: Client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
    )
    
    logger.info("✅ Supabase client initialized successfully")
    return client