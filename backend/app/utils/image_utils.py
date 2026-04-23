"""
utils/image_utils.py
─────────────────────
Helper functions for image validation and format handling.
These run BEFORE the image enters the OCR pipeline to
catch bad inputs early and give clear error messages.
"""

import io
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.core.config import get_settings
from app.core.logger import logger

settings = get_settings()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}


async def validate_image(file: UploadFile) -> bytes:
    """
    Validates an uploaded image file.
    Returns raw bytes if valid, raises HTTPException if not.
    """
    # Check content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. "
                   f"Please upload a JPG, PNG, or WebP image."
        )

    image_bytes = await file.read()

    # Check not empty
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty. Please upload a valid image."
        )

    # Check file size
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"Image too large ({size_mb:.1f}MB). "
                   f"Maximum allowed size is {settings.MAX_IMAGE_SIZE_MB}MB."
        )

    # Verify it's actually a readable image
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the image file. "
                   "It may be corrupted. Please try a different photo."
        )

    logger.info(f"Image validated: {file.filename} | {size_mb:.2f}MB | {file.content_type}")
    return image_bytes


def bytes_to_pil(image_bytes: bytes) -> Image.Image:
    """Convert raw bytes to a PIL Image object for OpenCV processing."""
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")