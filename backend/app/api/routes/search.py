"""
api/routes/search.py
─────────────────────
POST /search — Symptom-based medicine search.
"""

from fastapi import APIRouter, Depends
from app.models.request_models import SymptomSearchRequest
from app.models.response_models import SearchResponse
from app.services.openfda_service import search_by_symptom
from app.services.translate_service import translate_medicine_info
from app.services.cache_service import get_cached, set_cached, symptom_cache_key, SYMPTOM_CACHE_TTL
from app.api.deps import get_language
from app.core.logger import logger

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
async def symptom_search(
    body: SymptomSearchRequest,
    language: str = Depends(get_language)
):
    """Search for medicines by symptom. Example: { 'symptoms': 'headache and fever' }"""

    logger.info(f"Symptom search: '{body.symptoms}' | language: {language}")

    cache_key = symptom_cache_key(body.symptoms)
    cached = await get_cached(cache_key)

    if cached:
        from app.models.response_models import MedicineInfo
        results = [MedicineInfo(**r) for r in cached]
    else:
        results = await search_by_symptom(body.symptoms)
        if results:
            await set_cached(cache_key, [r.model_dump() for r in results], ttl=SYMPTOM_CACHE_TTL)

    if not results:
        return SearchResponse(
            success=False,
            symptoms=body.symptoms,
            error="No medicines found for these symptoms. Please consult a doctor."
        )

    target_lang = body.language or language
    translated = target_lang != "en"
    if translated:
        results = [await translate_medicine_info(r, target_lang) for r in results]

    return SearchResponse(
        success=True,
        symptoms=body.symptoms,
        results=results,
        translated=translated,
        language=target_lang
    )