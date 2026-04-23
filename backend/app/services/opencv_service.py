"""
services/opencv_service.py
───────────────────────────
Image preprocessing using OpenCV.
Cleans the image before EasyOCR tries to read it.

Pipeline:
  Raw photo → Grayscale → Denoise → Sharpen → Contrast Boost → Deskew → Clean image
"""

import cv2
import numpy as np
from PIL import Image
from app.core.logger import logger


def preprocess_image(pil_image: Image.Image) -> np.ndarray:
    """
    Full preprocessing pipeline.
    Takes a PIL Image, returns a cleaned numpy array ready for EasyOCR.
    """
    img = np.array(pil_image)

    logger.info("Starting OpenCV preprocessing pipeline")

    img = _to_grayscale(img)
    img = _denoise(img)
    img = _sharpen(img)
    img = _boost_contrast(img)
    img = _deskew(img)

    logger.info("OpenCV preprocessing complete")
    return img


def _to_grayscale(img: np.ndarray) -> np.ndarray:
    """Convert to grayscale — OCR works on shapes not colors."""
    if len(img.shape) == 3:
        return cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    return img


def _denoise(img: np.ndarray) -> np.ndarray:
    """Remove noise/grain from low-light phone photos."""
    return cv2.fastNlMeansDenoising(img, h=10, templateWindowSize=7, searchWindowSize=21)


def _sharpen(img: np.ndarray) -> np.ndarray:
    """Sharpen text edges so OCR can distinguish similar characters."""
    kernel = np.array([
        [ 0, -1,  0],
        [-1,  5, -1],
        [ 0, -1,  0]
    ])
    return cv2.filter2D(img, -1, kernel)


def _boost_contrast(img: np.ndarray) -> np.ndarray:
    """
    Boost contrast using CLAHE — works in local patches,
    handles uneven lighting across the image.
    """
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(img)


def _deskew(img: np.ndarray) -> np.ndarray:
    """Straighten tilted images — users never hold phones perfectly flat."""
    _, binary = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(binary > 0))

    if len(coords) == 0:
        return img

    angle = cv2.minAreaRect(coords)[-1]

    if angle < -45:
        angle = 90 + angle

    # Skip if tilt is tiny or suspiciously large
    if abs(angle) < 1.0 or abs(angle) > 45:
        return img

    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        img, rotation_matrix, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE
    )

    logger.info(f"Image deskewed by {angle:.2f} degrees")
    return rotated