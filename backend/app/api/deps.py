"""
api/deps.py
────────────
Shared FastAPI dependency injections.
Provides: language detection + Supabase client for route handlers.
"""

from fastapi import Header, Depends
from supabase import Client
from typing import Optional
from app.core.database import get_supabase_client

SUPPORTED_LANGUAGES = {"en", "hi", "ta", "bn", "te", "mr"}


async def get_language(accept_language: Optional[str] = Header(default="en")) -> str:
    """
    Reads Accept-Language header from browser request.
    Browser sends something like: "hi-IN,en;q=0.9"
    We extract "hi" and return it if supported, else "en".
    """
    if not accept_language:
        return "en"

    primary = accept_language.split(",")[0].split(";")[0].strip().lower()
    lang_code = primary.split("-")[0]

    return lang_code if lang_code in SUPPORTED_LANGUAGES else "en"


async def get_db() -> Client:
    """
    FastAPI dependency that provides the Supabase client to any route.
    
    Usage in a route:
        async def my_route(db: Client = Depends(get_db)):
            db.table("search_history").insert({...}).execute()
    """
    return get_supabase_client()