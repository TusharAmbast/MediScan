"""
services/openfda_service.py
────────────────────────────
Fetches medicine information from the OpenFDA API.
Completely free — no key required for basic usage.
"""

import httpx
from app.core.config import get_settings
from app.core.logger import logger
from app.models.response_models import MedicineInfo

settings = get_settings()

OPENFDA_BASE_URL = "https://api.fda.gov/drug/label.json"


async def get_medicine_info(medicine_name: str) -> MedicineInfo | None:
    """
    Queries OpenFDA for a medicine name using 3 progressively broader searches.
    Returns MedicineInfo if found, None if not found.
    """
    if not medicine_name or len(medicine_name) < 2:
        return None

    logger.info(f"Querying OpenFDA for: '{medicine_name}'")

    params = {"limit": 1}
    if settings.OPENFDA_API_KEY:
        params["api_key"] = settings.OPENFDA_API_KEY

    search_queries = [
        f'openfda.brand_name:"{medicine_name}"',
        f'openfda.generic_name:"{medicine_name}"',
        f'openfda.substance_name:"{medicine_name}"',
    ]

    async with httpx.AsyncClient(timeout=15.0) as client:
        for query in search_queries:
            result = await _query_openfda(client, query, params)
            if result:
                logger.info(f"OpenFDA match found for '{medicine_name}'")
                return result

    logger.warning(f"No OpenFDA results found for '{medicine_name}'")
    return None


async def _query_openfda(client: httpx.AsyncClient, search: str, params: dict) -> MedicineInfo | None:
    """Makes a single OpenFDA API call and parses the response."""
    try:
        print(f"DEBUG >>> Querying OpenFDA: search={search} params={params}")
        response = await client.get(
            OPENFDA_BASE_URL,
            params={"search": search, **params}
        )

        if response.status_code == 404:
            return None
        if response.status_code == 429:
            logger.warning("OpenFDA rate limit hit")
            return None

        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])

        if not results:
            return None

        return _parse_openfda_result(results[0])

    except httpx.TimeoutException:
        logger.error("OpenFDA request timed out")
        return None
    except Exception as e:
        logger.error(f"OpenFDA query failed: {e}")
        return None


def _parse_openfda_result(result: dict) -> MedicineInfo:
    """Parses a raw OpenFDA result into a clean MedicineInfo object."""
    openfda = result.get("openfda", {})

    def first(field):
        if field and isinstance(field, list) and len(field) > 0:
            return field[0]
        return None

    def all_items(field):
        if field and isinstance(field, list) and len(field) > 0:
            return field
        return None

    return MedicineInfo(
        brand_name=first(openfda.get("brand_name")),
        generic_name=first(openfda.get("generic_name")),
        manufacturer=first(openfda.get("manufacturer_name")),
        dosage_form=first(openfda.get("dosage_form")),
        route=first(openfda.get("route")),
        purpose=all_items(result.get("purpose")),
        dosage=first(result.get("dosage_and_administration")),
        warnings=all_items(result.get("warnings")),
        inactive_ingredients=all_items(result.get("inactive_ingredient")),
        alternatives=all_items(openfda.get("generic_name"))
    )


async def search_by_symptom(symptom: str) -> list[MedicineInfo]:
    """Searches OpenFDA for medicines related to a symptom. Returns up to 5."""
    if not symptom:
        return []

    logger.info(f"Searching OpenFDA by symptom: '{symptom}'")

    params = {
        "search": f"indications_and_usage:{symptom}",
        "limit": 5
    }
    if settings.OPENFDA_API_KEY:
        params["api_key"] = settings.OPENFDA_API_KEY

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(OPENFDA_BASE_URL, params=params)
            if response.status_code in (404, 429):
                return []
            response.raise_for_status()
            data = response.json()
            return [_parse_openfda_result(r) for r in data.get("results", [])]
    except Exception as e:
        logger.error(f"Symptom search failed: {e}")
        return []