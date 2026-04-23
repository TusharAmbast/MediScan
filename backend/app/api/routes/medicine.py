"""
api/routes/medicine.py
───────────────────────
GET /medicine?name=Paracetamol — Direct medicine name lookup.

This is the manual fallback when OCR completely fails.
The frontend shows a text input asking the user to type the
medicine name, which calls this endpoint directly.
"""

from fastapi import APIRouter, Query, Depends, HTTPException
from app.models.response_models import ScanResponse
from app.services.openfda_service import get_medicine_info
from app.services.translate_service import translate_medicine_info
from app.services.cache_service import get_cached, set_cached, medicine_cache_key
from app.api.deps import get_language
from app.core.logger import logger

router = APIRouter(prefix="/medicine", tags=["Medicine"])


@router.get("", response_model=ScanResponse)
async def get_medicine(
    name: str = Query(..., min_length=2, max_length=100, description="Medicine name"),
    language: str = Depends(get_language)
):
    """
    Look up a medicine directly by name — no image needed.
    Used as fallback when user types the medicine name manually.
    """
    logger.info(f"Direct medicine lookup: '{name}' | language: {language}")

    # Check cache first
    cache_key = medicine_cache_key(name)
    cached = await get_cached(cache_key)

    if cached:
        from app.models.response_models import MedicineInfo
        medicine_info = MedicineInfo(**cached)
    else:
        medicine_info = await get_medicine_info(name)
        if medicine_info:
            await set_cached(cache_key, medicine_info.model_dump())

    if not medicine_info:
        raise HTTPException(
            status_code=404,
            detail=f"Medicine '{name}' not found. "
                   "Please check the spelling or consult a pharmacist."
        )

    translated = language != "en"
    if translated:
        medicine_info = await translate_medicine_info(medicine_info, language)

    return ScanResponse(
        success=True,
        extracted_text=name,
        medicine_info=medicine_info,
        translated=translated,
        language=language
    )