"""
app/main.py
────────────
FastAPI application entry point.
This is the file that starts the entire backend server.

Run locally with:
    uvicorn app.main:app --reload --port 8000

Then visit:
    http://localhost:8000/docs  → Swagger UI (interactive API docs)
    http://localhost:8000/      → Root endpoint
    http://localhost:8000/health → Health check
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.logger import logger
from app.api.routes import scan, search, medicine, health

settings = get_settings()

# ── Create FastAPI app ─────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered medicine information platform. "
        "Upload a medicine image or search by symptom to get "
        "dosage, side effects, and alternatives — free, multilingual."
    ),
    docs_url="/docs",       # Swagger UI at /docs
    redoc_url="/redoc"      # ReDoc UI at /redoc
)

# ── CORS Middleware ────────────────────────────────────────────
# Without this, the browser blocks the frontend from calling this API.
# CORS tells the browser: "requests from these origins are allowed."
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Register all routes ────────────────────────────────────────
app.include_router(health.router)       # GET  /health
app.include_router(scan.router)         # POST /scan
app.include_router(search.router)       # POST /search
app.include_router(medicine.router)     # GET  /medicine?name=...

# ── Root endpoint ──────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }

# ── Startup event ──────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting up...")
    logger.info(f"   Debug mode : {settings.DEBUG}")
    logger.info(f"   Docs URL   : /docs")
    
    # ── Verify Supabase connection on startup ──────────────────
    try:
        from app.core.database import get_supabase_client
        db = get_supabase_client()
        # Quick ping: fetch 1 row from symptom_mappings to confirm connection
        db.table("symptom_mappings").select("id").limit(1).execute()
        logger.info("✅ Supabase database connected successfully")
    except Exception as e:
        logger.error(f"❌ Supabase connection failed: {e}")

# ── Shutdown event ─────────────────────────────────────────────
@app.on_event("shutdown")
async def on_shutdown():
    logger.info(f"👋 {settings.APP_NAME} shutting down...")