"""
services/ocr_service.py
────────────────────────
Primary OCR using EasyOCR.

EasyOCR is initialized ONCE when the server starts (not per request)
because loading the model takes ~10 seconds. Reusing the same instance
means every request after the first is fast.
"""

import easyocr
import numpy as np
from app.core.config import get_settings
from app.core.logger import logger
from app.utils.text_utils import extract_best_candidate, clean_medicine_name

settings = get_settings()

# Global reader instance — loaded once, reused forever
_reader = None


def get_reader() -> easyocr.Reader:
    """Lazy initialization — only loads the model on first use."""
    global _reader
    if _reader is None:
        logger.info("Loading EasyOCR model (first time, may take ~10 seconds)...")
        _reader = easyocr.Reader(["en", "hi"], gpu=False)
        logger.info("EasyOCR model loaded successfully")
    return _reader


async def extract_text(preprocessed_image: np.ndarray) -> dict:
    """
    Run EasyOCR on a preprocessed image.

    Returns:
        text          — cleaned medicine name
        raw_text      — original OCR output before cleaning
        confidence    — 0.0 to 1.0
        method        — "easyocr"
        use_fallback  — True if confidence < threshold
    """
    try:
        reader = get_reader()
        logger.info("Running EasyOCR on preprocessed image...")
        results = reader.readtext(preprocessed_image)

        if not results:
            logger.warning("EasyOCR returned no text")
            return {
                "text": "", "raw_text": "", "confidence": 0.0,
                "method": "easyocr", "use_fallback": True
            }

        raw_text, confidence = extract_best_candidate(results)
        cleaned_text = clean_medicine_name(raw_text)
        use_fallback = confidence < settings.OCR_CONFIDENCE_THRESHOLD

        logger.info(
            f"EasyOCR: '{raw_text}' → '{cleaned_text}' "
            f"(confidence: {confidence:.2f}, fallback: {use_fallback})"
        )

        return {
            "text": cleaned_text,
            "raw_text": raw_text,
            "confidence": confidence,
            "method": "easyocr",
            "use_fallback": use_fallback
        }

    except Exception as e:
        logger.error(f"EasyOCR failed: {e}")
        return {
            "text": "", "raw_text": "", "confidence": 0.0,
            "method": "easyocr", "use_fallback": True
        }