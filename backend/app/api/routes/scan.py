"""
api/routes/scan.py
───────────────────
POST /scan — Core endpoint: receives medicine image, returns medicine info.

Orchestrates the full pipeline:
  Image → Validate → OpenCV → EasyOCR → (TrOCR) → OpenFDA → Translate → Save to DB → Response
"""

from fastapi import APIRouter, UploadFile, File, Depends
from supabase import Client
from app.models.response_models import ScanResponse, MedicineInfo
from app.utils.image_utils import validate_image, bytes_to_pil
from app.services.opencv_service import preprocess_image
from app.services.ocr_service import extract_text
from app.services.huggingface_service import extract_text_fallback
from app.services.openfda_service import get_medicine_info
from app.services.translate_service import translate_medicine_info
from app.services.cache_service import get_cached, set_cached, medicine_cache_key
from app.api.deps import get_language, get_db
from app.core.logger import logger

router = APIRouter(prefix="/scan", tags=["Scan"])


@router.post("", response_model=ScanResponse)
async def scan_medicine(
    file: UploadFile = File(..., description="Medicine image (JPG, PNG, WebP)"),
    session_id: str = "anonymous",
    language: str = Depends(get_language),
    db: Client = Depends(get_db)
):
    """Upload a medicine image and get full medicine information."""

    logger.info(f"Scan request | file: {file.filename} | language: {language}")

    # Step 1: Validate image
    image_bytes = await validate_image(file)
    try:
        db.table("image_uploads").insert({
            "session_id": session_id,
            "storage_path": file.filename or "unknown",
            "ocr_result": None,
            "ocr_confidence": None,
            "processed": False
        }).execute()
    except Exception as e:
        logger.warning(f"Failed to insert image_upload telemetry: {e}")

    pil_image = bytes_to_pil(image_bytes)

    # Step 2: OpenCV preprocessing
    preprocessed = preprocess_image(pil_image)

    # Step 3: EasyOCR
    ocr_result = await extract_text(preprocessed)
    # Step 4: TrOCR fallback if confidence is low
    if ocr_result["use_fallback"]:
        logger.info("Low OCR confidence — switching to TrOCR fallback")
        ocr_result = await extract_text_fallback(preprocessed)

    medicine_name = ocr_result.get("text", "")

    # If no text extracted at all
    if not medicine_name:
        try:
            db.table("search_history").insert({
                "session_id": session_id,
                "medicine_name": "",
                "ocr_method": ocr_result.get("method"),
                "ocr_confidence": ocr_result.get("confidence"),
                "language": language,
                "found": False
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to insert search_history telemetry: {e}")

        return ScanResponse(
            success=False,
            extracted_text="",
            ocr_confidence=ocr_result.get("confidence"),
            ocr_method=ocr_result.get("method"),
            error="Could not read any text from the image. "
                  "Please retake the photo with better lighting, "
                  "or try typing the medicine name manually."
        )

    # Step 5: Check cache before hitting OpenFDA
    cache_key = medicine_cache_key(medicine_name)
    cached = await get_cached(cache_key)

    if cached:
        medicine_info = MedicineInfo(**cached)
    else:
        medicine_info = await get_medicine_info(medicine_name)
        if medicine_info:
            await set_cached(cache_key, medicine_info.model_dump())

    try:
        db.table("search_history").insert({
            "session_id": session_id,
            "medicine_name": medicine_name,
            "ocr_method": ocr_result.get("method"),
            "ocr_confidence": ocr_result.get("confidence"),
            "language": language,
            "found": medicine_info is not None
        }).execute()
    except Exception as e:
        logger.warning(f"Failed to insert search_history: {e}")

    if not medicine_info:
        return ScanResponse(
            success=False,
            extracted_text=medicine_name,
            ocr_confidence=ocr_result.get("confidence"),
            ocr_method=ocr_result.get("method"),
            error=f"Medicine '{medicine_name}' was not found in our database. "
                  "It may be a regional brand not listed in OpenFDA. "
                  "Please consult a pharmacist."
        )

    # Step 7: Translate if needed
    translated = language != "en"
    if translated:
        medicine_info = await translate_medicine_info(medicine_info, language)

    logger.info(f"Scan complete for '{medicine_name}' | translated: {translated}")

    return ScanResponse(
        success=True,
        extracted_text=medicine_name,
        ocr_confidence=ocr_result.get("confidence"),
        ocr_method=ocr_result.get("method"),
        medicine_info=medicine_info,
        translated=translated,
        language=language
    )