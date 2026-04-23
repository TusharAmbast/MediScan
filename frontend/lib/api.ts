/**
 * lib/api.ts
 * ──────────
 * All API calls to the FastAPI backend live here.
 * No component or page should ever call fetch() directly.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types (mirror your backend response_models.py) ──────────────

export interface MedicineInfo {
  brand_name: string | null;
  generic_name: string | null;
  manufacturer: string | null;
  dosage_form: string | null;
  route: string | null;
  purpose: string[] | null;
  dosage: string | null;
  warnings: string[] | null;
  inactive_ingredients: string[] | null;
  alternatives: string[] | null;
}

export interface ScanResponse {
  success: boolean;
  extracted_text: string | null;
  ocr_confidence: number | null;
  ocr_method: string | null;
  medicine_info: MedicineInfo | null;
  translated: boolean;
  language: string;
  error: string | null;
}

export interface SearchResponse {
  success: boolean;
  symptoms: string | null;
  results: MedicineInfo[] | null;
  translated: boolean;
  language: string;
  error: string | null;
}

export interface HealthResponse {
  status: string;
  version: string;
  services: {
    redis: string;
    openfda: string;
    libretranslate: string;
  };
}

// ── API call functions ───────────────────────────────────────────

/**
 * POST /scan
 * Upload a medicine image and get medicine info back.
 */
export async function scanMedicine(
  file: File,
  language: string = "en"
): Promise<ScanResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/scan`, {
    method: "POST",
    headers: {
      "accept-language": language,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to scan medicine");
  }

  return response.json();
}

/**
 * POST /search
 * Search for medicines by symptom description.
 */
export async function searchBySymptom(
  symptoms: string,
  language: string = "en"
): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept-language": language,
    },
    body: JSON.stringify({ symptoms, language }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to search symptoms");
  }

  return response.json();
}

/**
 * GET /medicine?name=...
 * Direct medicine name lookup — used as fallback when OCR fails.
 */
export async function getMedicineByName(
  name: string,
  language: string = "en"
): Promise<ScanResponse> {
  const response = await fetch(
    `${API_BASE_URL}/medicine?name=${encodeURIComponent(name)}`,
    {
      headers: {
        "accept-language": language,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Medicine not found");
  }

  return response.json();
}

/**
 * GET /health
 * Check if backend and all services are running.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error("Backend is unreachable");
  return response.json();
}