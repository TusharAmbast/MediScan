"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ScanLine, Search, AlertCircle,
  CheckCircle, Package, Pill, FileQuestion
} from "lucide-react";
import { MedicineCard } from "@/components/MedicineCard";
import Spinner from "@/components/ui/Spinner";

// Types mirroring backend responses
interface MedicineInfo {
  name: string;
  generic_name?: string;
  brand_names?: string[];
  dosage?: string | string[];
  warnings?: string[];
  side_effects?: string[];
  drug_interactions?: string[];
  alternatives?: string[];
  manufacturer?: string;
  drug_class?: string;
  purpose?: string;
  active_ingredients?: string[];
  route?: string | string[];
  pregnancy_category?: string;
  otc_or_rx?: string;
  source?: string;
}

// Backend response shapes (may use different field names)
interface BackendMedicineInfo {
  brand_name?: string;
  generic_name?: string;
  manufacturer?: string;
  dosage_form?: string;
  route?: string;
  purpose?: string[];
  dosage?: string;
  warnings?: string[];
  inactive_ingredients?: string[];
  alternatives?: string[];
  // Frontend-style fields (in case data is already normalized)
  name?: string;
  brand_names?: string[];
  side_effects?: string[];
  drug_interactions?: string[];
  drug_class?: string;
  active_ingredients?: string[];
  pregnancy_category?: string;
  otc_or_rx?: string;
  source?: string;
}

interface ScanResponse {
  success?: boolean;
  extracted_text?: string;
  medicine_name?: string;
  medicine_info?: BackendMedicineInfo;
  medicines?: BackendMedicineInfo[];
  message?: string;
  confidence?: number;
  ocr_confidence?: number;
  ocr_method?: string;
  translated?: boolean;
  language?: string;
  error?: string;
}

interface SearchResponse {
  success?: boolean;
  symptoms?: string | string[];
  results?: BackendMedicineInfo[];
  medicines?: BackendMedicineInfo[];
  message?: string;
  language?: string;
  translated?: boolean;
  error?: string;
}

type ResultData = ScanResponse | SearchResponse | BackendMedicineInfo;

/**
 * Normalize backend MedicineInfo fields to what MedicineCard expects.
 * The backend uses brand_name (singular), purpose (array), etc.
 * The frontend MedicineCard expects name, purpose (string), etc.
 */
function normalizeMedicine(raw: BackendMedicineInfo): MedicineInfo {
  // If it already has 'name', it may already be normalized
  const name = raw.name || raw.brand_name || raw.generic_name || "Unknown Medicine";
  
  // purpose: backend sends string[], frontend expects string
  let purpose: string | undefined;
  if (Array.isArray(raw.purpose) && raw.purpose.length > 0) {
    purpose = raw.purpose.join("; ");
  } else if (typeof raw.purpose === "string") {
    purpose = raw.purpose;
  }

  // route: backend sends string, frontend can handle string | string[]
  let route: string | string[] | undefined;
  if (raw.route) {
    route = raw.route;
  }

  return {
    name,
    generic_name: raw.generic_name,
    brand_names: raw.brand_names || (raw.brand_name ? [raw.brand_name] : undefined),
    dosage: raw.dosage,
    warnings: raw.warnings,
    side_effects: raw.side_effects,
    drug_interactions: raw.drug_interactions,
    alternatives: raw.alternatives,
    manufacturer: raw.manufacturer,
    drug_class: raw.drug_class || raw.dosage_form,
    purpose,
    active_ingredients: raw.active_ingredients || raw.inactive_ingredients,
    route,
    pregnancy_category: raw.pregnancy_category,
    otc_or_rx: raw.otc_or_rx,
    source: raw.source,
  };
}

function extractMedicines(data: ResultData, mode: string): MedicineInfo[] {
  if (!data) return [];

  // Single medicine from name lookup — check if it's a ScanResponse wrapper
  if (mode === "name") {
    const d = data as ScanResponse;
    if (d.medicine_info) return [normalizeMedicine(d.medicine_info)];
    // Might be a raw MedicineInfo
    const raw = data as BackendMedicineInfo;
    if (raw.brand_name || raw.generic_name || raw.name) return [normalizeMedicine(raw)];
  }

  // Scan response
  if (mode === "scan" || !mode) {
    const d = data as ScanResponse;
    if (d.medicines && d.medicines.length > 0) return d.medicines.map(normalizeMedicine);
    if (d.medicine_info) return [normalizeMedicine(d.medicine_info)];
  }

  // Symptom search — backend returns 'results', not 'medicines'
  if (mode === "symptom") {
    const d = data as SearchResponse;
    if (d.results && d.results.length > 0) return d.results.map(normalizeMedicine);
    if (d.medicines && d.medicines.length > 0) return d.medicines.map(normalizeMedicine);
  }

  // Fallback: try all possible fields
  const any = data as any;
  if (any.results?.length > 0) return any.results.map(normalizeMedicine);
  if (any.medicines?.length > 0) return any.medicines.map(normalizeMedicine);
  if (any.medicine_info) return [normalizeMedicine(any.medicine_info)];
  if (any.brand_name || any.generic_name || any.name) return [normalizeMedicine(any as BackendMedicineInfo)];

  return [];
}

function getExtractedText(data: ResultData, mode: string): string | null {
  if (mode === "scan") {
    const d = data as ScanResponse;
    return d.extracted_text || d.medicine_name || null;
  }
  return null;
}

function getSymptoms(data: ResultData, mode: string): string | string[] | null {
  if (mode === "symptom") {
    const d = data as SearchResponse;
    return d.symptoms || null;
  }
  return null;
}

function getError(data: ResultData): string | null {
  const any = data as any;
  return any.error || null;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [medicines, setMedicines] = useState<MedicineInfo[]>([]);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string | string[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [mode, setMode] = useState<string>("scan");
  const [query, setQuery] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("mediscan_result");
      const raw = searchParams.get("data");
      const m = searchParams.get("mode") || "scan";
      const q = searchParams.get("query");

      setMode(m);
      setQuery(q);

      let decoded: ResultData;
      
      if (stored) {
        decoded = JSON.parse(stored) as ResultData;
      } else if (raw) {
        decoded = JSON.parse(decodeURIComponent(raw)) as ResultData;
      } else {
        setParseError("No result data found. Please try your search again.");
        setIsLoading(false);
        return;
      }

      // Check for backend error responses
      const backendError = getError(decoded);
      const any = decoded as any;
      if (any.success === false && backendError) {
        setParseError(backendError);
        setIsLoading(false);
        return;
      }

      const extracted = extractMedicines(decoded, m);
      const text = getExtractedText(decoded, m);
      const syms = getSymptoms(decoded, m);

      setMedicines(extracted);
      setExtractedText(text);
      setSymptoms(syms);
    } catch {
      setParseError("Failed to parse result data. Please try your search again.");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  const modeConfig = {
    scan: {
      icon: <ScanLine className="w-5 h-5 text-cyan-400" />,
      label: "Scan Result",
      backHref: "/scan",
      backLabel: "Scan again",
    },
    symptom: {
      icon: <Search className="w-5 h-5 text-cyan-400" />,
      label: "Symptom Search",
      backHref: "/search",
      backLabel: "Search again",
    },
    name: {
      icon: <Pill className="w-5 h-5 text-cyan-400" />,
      label: query ? `Results for "${query}"` : "Medicine Lookup",
      backHref: "/search",
      backLabel: "Search again",
    },
  }[mode] || {
    icon: <Search className="w-5 h-5 text-cyan-400" />,
    label: "Results",
    backHref: "/search",
    backLabel: "Back",
  };

  return (
    <main className="min-h-screen bg-gray-950 pt-20 pb-16">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-cyan-500/4 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {modeConfig.backLabel}
        </button>

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            {modeConfig.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{modeConfig.label}</h1>
            {medicines.length > 0 && (
              <p className="text-sm text-gray-400 mt-0.5">
                {medicines.length} medicine{medicines.length > 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner size="lg" label="Loading results…" />
          </div>
        )}

        {/* Parse error */}
        {!isLoading && parseError && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 flex flex-col items-center text-center gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <div>
              <p className="text-white font-semibold mb-1">Something went wrong</p>
              <p className="text-gray-400 text-sm">{parseError}</p>
            </div>
            <button
              onClick={() => router.push(modeConfig.backHref)}
              className="mt-1 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !parseError && (
          <div className="space-y-6">

            {/* Scan metadata */}
            {mode === "scan" && extractedText && (
              <div className="flex items-start gap-3 rounded-xl bg-gray-900 border border-gray-800 px-4 py-3">
                <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Text extracted from image</p>
                  <p className="text-sm text-gray-300 break-words">{extractedText}</p>
                </div>
              </div>
            )}

            {/* Symptom search metadata */}
            {mode === "symptom" && symptoms && symptoms.length > 0 && (
              <div className="flex items-start gap-3 rounded-xl bg-gray-900 border border-gray-800 px-4 py-3">
                <Search className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Symptoms searched</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(symptoms) ? symptoms : symptoms.split(",")).map((s) => (
                      <span key={s.trim()} className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Success badge */}
            {medicines.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>
                  {medicines.length > 1
                    ? `Found ${medicines.length} medicines`
                    : "Medicine identified successfully"}
                </span>
              </div>
            )}

            {/* Medicine cards */}
            {medicines.length > 0 ? (
              <div className="space-y-4">
                {medicines.map((med, i) => (
                  <MedicineCard key={`${med.name}-${i}`} medicine={med} index={i} />
                ))}
              </div>
            ) : (
              /* Empty state */
              !isLoading && !parseError && (
                <div className="flex flex-col items-center text-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <FileQuestion className="w-7 h-7 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">No medicines found</p>
                    <p className="text-gray-400 text-sm max-w-xs">
                      {mode === "scan"
                        ? "We couldn't identify a medicine from the image. Try a clearer photo with the medicine name visible."
                        : mode === "symptom"
                        ? "No medicines matched those symptoms. Try different or fewer symptoms."
                        : "This medicine wasn't found in our database. Try a generic name like 'Ibuprofen' instead."}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(modeConfig.backHref)}
                    className="px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-sm rounded-xl transition-colors"
                  >
                    {modeConfig.backLabel}
                  </button>
                </div>
              )
            )}

            {/* Disclaimer */}
            <p className="text-center text-gray-600 text-xs leading-relaxed pt-4 border-t border-gray-800">
              MediScan provides general information only. Always consult a qualified doctor or pharmacist before taking any medication. Do not self-medicate.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense 
      fallback={
        <main className="min-h-screen bg-gray-950 pt-20 pb-16 flex items-center justify-center">
          <Spinner size="lg" label="Loading results…" />
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}