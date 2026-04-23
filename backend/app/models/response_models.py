"""
models/response_models.py
──────────────────────────
Pydantic schemas for all API responses.
These define exactly what shape of data the frontend receives.
If a field is missing from OpenFDA, it safely returns None instead of crashing.
"""

from pydantic import BaseModel
from typing import Optional, List


class MedicineInfo(BaseModel):
    """Core medicine information returned from OpenFDA."""
    brand_name: Optional[str] = None
    generic_name: Optional[str] = None
    manufacturer: Optional[str] = None
    dosage_form: Optional[str] = None
    route: Optional[str] = None
    purpose: Optional[List[str]] = None
    dosage: Optional[str] = None
    warnings: Optional[List[str]] = None
    inactive_ingredients: Optional[List[str]] = None
    alternatives: Optional[List[str]] = None


class ScanResponse(BaseModel):
    """Response returned after scanning a medicine image."""
    success: bool
    extracted_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    ocr_method: Optional[str] = None
    medicine_info: Optional[MedicineInfo] = None
    translated: bool = False
    language: Optional[str] = "en"
    error: Optional[str] = None


class SearchResponse(BaseModel):
    """Response returned from symptom-based search."""
    success: bool
    symptoms: Optional[str] = None
    results: Optional[List[MedicineInfo]] = None
    translated: bool = False
    language: Optional[str] = "en"
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Response for the /health endpoint."""
    status: str
    version: str
    services: dict