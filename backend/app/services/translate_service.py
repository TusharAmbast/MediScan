"""
services/translate_service.py
───────────────────────────────
Translates medicine information using LibreTranslate (free, open source).

Important: Medicine names (brand/generic) are NOT translated —
they must stay in English for medical accuracy.
Only human-readable fields (dosage instructions, warnings) are translated.
"""

import httpx
from app.core.config import get_settings
from app.core.logger import logger
from app.models.response_models import MedicineInfo

settings = get_settings()

SUPPORTED_LANGUAGES = {"en", "hi", "ta", "bn", "te", "mr", "gu", "kn", "fr", "es", "ar"}


async def translate_text(text: str, target_language: str) -> str:
    """Translates a single string. Returns original if translation fails."""
    if not text or target_language == "en":
        return text
    if target_language not in SUPPORTED_LANGUAGES:
        logger.warning(f"Unsupported language: {target_language}")
        return text

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://translate.googleapis.com/translate_a/single",
                params={
                    "client": "gtx",
                    "sl": "en",
                    "tl": target_language,
                    "dt": "t",
                    "q": text
                }
            )

        if response.status_code == 200:
            data = response.json()
            # The API returns a nested list. The first item contains lists of translated segments.
            translated_text = "".join([segment[0] for segment in data[0] if segment[0]])
            return translated_text

        logger.warning(f"Translation API returned {response.status_code}")
        return text

    except Exception as e:
        logger.error(f"Translation failed: {e}")
        return text


async def translate_medicine_info(medicine: MedicineInfo, language: str) -> MedicineInfo:
    """
    Translates human-readable fields of MedicineInfo.
    Medicine names stay in English for medical accuracy.
    """
    if language == "en" or not medicine:
        return medicine

    logger.info(f"Translating medicine info to '{language}'")

    async def translate_list(items):
        if not items:
            return items
        return [await translate_text(item, language) for item in items]

    return MedicineInfo(
        # Keep in English
        brand_name=medicine.brand_name,
        generic_name=medicine.generic_name,
        manufacturer=medicine.manufacturer,
        dosage_form=medicine.dosage_form,
        route=medicine.route,
        alternatives=medicine.alternatives,
        inactive_ingredients=medicine.inactive_ingredients,

        # Translate these
        purpose=await translate_list(medicine.purpose),
        dosage=await translate_text(medicine.dosage or "", language) or None,
        warnings=await translate_list(medicine.warnings),
    )