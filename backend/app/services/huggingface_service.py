"""
services/huggingface_service.py
────────────────────────────────
TrOCR fallback via HuggingFace Inference API.

Called ONLY when EasyOCR confidence is below the threshold.
Microsoft's TrOCR is trained specifically on printed documents
and labels — perfect for medicine packaging.
"""

import httpx
import cv2
import numpy as np
from app.core.config import get_settings
from app.core.logger import logger
from app.utils.text_utils import clean_medicine_name

settings = get_settings()

TROCR_URL = "https://api-inference.huggingface.co/models/microsoft/trocr-large-printed"


async def extract_text_fallback(preprocessed_image: np.ndarray) -> dict:
    """
    Calls HuggingFace TrOCR API with the preprocessed image.

    Returns:
        text       — cleaned medicine name
        raw_text   — raw TrOCR output
        confidence — None (TrOCR API doesn't return confidence scores)
        method     — "trocr"
    """
    try:
        logger.info("Calling HuggingFace TrOCR fallback...")

        # Convert numpy array → JPEG bytes for API transmission
        _, buffer = cv2.imencode(".jpg", preprocessed_image)
        image_bytes = buffer.tobytes()

        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/octet-stream"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(TROCR_URL, headers=headers, content=image_bytes)

        if response.status_code == 200:
            result = response.json()
            raw_text = ""
            if isinstance(result, list) and len(result) > 0:
                raw_text = result[0].get("generated_text", "")
            elif isinstance(result, dict):
                raw_text = result.get("generated_text", "")

            cleaned_text = clean_medicine_name(raw_text)
            logger.info(f"TrOCR result: '{raw_text}' → '{cleaned_text}'")

            return {
                "text": cleaned_text, "raw_text": raw_text,
                "confidence": None, "method": "trocr", "use_fallback": False
            }

        elif response.status_code == 503:
            # Model is cold-starting on HuggingFace free tier
            logger.warning("TrOCR model is warming up on HuggingFace")
            return _failed("TrOCR model is warming up. Please try again in 20 seconds.")

        else:
            logger.error(f"TrOCR API error: {response.status_code}")
            return _failed(f"TrOCR API returned status {response.status_code}")

    except httpx.TimeoutException:
        logger.error("TrOCR request timed out")
        return _failed("Request timed out. Please try again.")
    except Exception as e:
        logger.error(f"TrOCR fallback failed: {e}")
        return _failed(str(e))


def _failed(error_message: str) -> dict:
    return {
        "text": "", "raw_text": "", "confidence": 0.0,
        "method": "trocr", "use_fallback": False, "error": error_message
    }