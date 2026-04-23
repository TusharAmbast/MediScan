"""
models/request_models.py
─────────────────────────
Pydantic schemas for incoming API requests.
FastAPI uses these to automatically validate inputs before
they reach your service logic. Bad data is rejected instantly.
"""

from pydantic import BaseModel, Field
from typing import Optional


class SymptomSearchRequest(BaseModel):
    """Request body for symptom-based medicine search."""
    symptoms: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Symptom description e.g. 'headache and fever'",
        examples=["headache and fever"]
    )
    language: Optional[str] = Field(
        default="en",
        description="Target language code for response translation",
        examples=["en", "hi", "ta", "bn"]
    )


class MedicineQueryRequest(BaseModel):
    """Request body for direct medicine name lookup."""
    medicine_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Name of the medicine to look up",
        examples=["Paracetamol", "Amoxicillin"]
    )
    language: Optional[str] = Field(
        default="en",
        description="Target language code for response",
        examples=["en", "hi"]
    )