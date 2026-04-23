"""
utils/text_utils.py
────────────────────
Cleans and normalizes raw OCR output before querying OpenFDA.

EasyOCR might return "Paracetam0l 500mg Tablets IP"
OpenFDA won't match this — we clean it to "Paracetamol" first.
"""

import re
from app.core.logger import logger

# Words/patterns to strip from OCR output
STRIP_WORDS = [
    r"\d+\s*mg",
    r"\d+\s*ml",
    r"\d+\s*mcg",
    r"\btablets?\b",
    r"\bcapsules?\b",
    r"\bsyrup\b",
    r"\binjection\b",
    r"\bsolution\b",
    r"\bcream\b",
    r"\bointment\b",
    r"\bdrops?\b",
    r"\bip\b",
    r"\bbp\b",
    r"\busp\b",
]


def clean_medicine_name(raw_text: str) -> str:
    """
    Takes raw OCR text and returns a clean medicine name
    suitable for querying OpenFDA.

    Example:
        "  PARACETAMOL 500mg Tablets IP  " → "Paracetamol"
    """
    if not raw_text:
        return ""

    text = raw_text.lower().strip()

    # Remove dosage and form words
    for pattern in STRIP_WORDS:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    # Remove special characters except hyphens and letters
    text = re.sub(r"[^a-z\- ]", "", text)

    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text).strip()

    result = text.title()
    logger.info(f"Text cleaned: '{raw_text}' → '{result}'")
    return result


def extract_best_candidate(ocr_results: list) -> tuple[str, float]:
    """
    EasyOCR returns a list of (bounding_box, text, confidence) tuples.
    Picks the most likely medicine name from all detected text regions.

    Returns: (best_text, confidence_score)
    """
    if not ocr_results:
        return "", 0.0

    # Filter low confidence results
    candidates = [
        (text, conf)
        for (_, text, conf) in ocr_results
        if conf >= 0.3 and len(text.strip()) >= 3
    ]

    if not candidates:
        return "", 0.0

    # Sort by confidence then text length (longer = more likely a medicine name)
    candidates.sort(key=lambda x: (x[1], len(x[0])), reverse=True)

    best_text, best_conf = candidates[0]
    return best_text.strip(), round(best_conf, 3)