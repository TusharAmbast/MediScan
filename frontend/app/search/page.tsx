"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Pill, ScanLine, ChevronDown, X, Sparkles } from "lucide-react";
import { SymptomSearch } from "@/components/SymptomSearch";
import { searchBySymptom, getMedicineByName } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

const LANGUAGES = [
  { code: "en", label: "English", native: "EN" },
  { code: "hi", label: "Hindi", native: "हि" },
  { code: "ta", label: "Tamil", native: "த" },
  { code: "bn", label: "Bengali", native: "বা" },
  { code: "te", label: "Telugu", native: "తె" },
  { code: "mr", label: "Marathi", native: "म" },
  { code: "gu", label: "Gujarati", native: "ગ" },
  { code: "kn", label: "Kannada", native: "ಕ" },
];

type ActiveTab = "symptom" | "name";

export default function SearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("symptom");
  const [language, setLanguage] = useState("en");

  const [isSearching, setIsSearching] = useState(false);
  const [symptomError, setSymptomError] = useState<string | null>(null);

  const [medicineName, setMedicineName] = useState("");
  const [isNameSearching, setIsNameSearching] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSymptomSearch = async (symptoms: string[]) => {
    setIsSearching(true);
    setSymptomError(null);
    try {
      const result = await searchBySymptom(symptoms.join(", "), language);
      sessionStorage.setItem("mediscan_result", JSON.stringify(result));
      const params = new URLSearchParams();
      params.set("lang", language);
      params.set("mode", "symptom");
      router.push(`/result?${params.toString()}`);
    } catch (err: unknown) {
      setSymptomError(err instanceof Error ? err.message : "Search failed. Please try again.");
      setIsSearching(false);
    }
  };

  const handleNameSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!medicineName.trim()) return;
    setIsNameSearching(true);
    setNameError(null);
    try {
      const result = await getMedicineByName(medicineName.trim(), language);
      sessionStorage.setItem("mediscan_result", JSON.stringify(result));
      const params = new URLSearchParams();
      params.set("lang", language);
      params.set("mode", "name");
      params.set("query", medicineName.trim());
      router.push(`/result?${params.toString()}`);
    } catch (err: unknown) {
      setNameError(err instanceof Error ? err.message : "Medicine not found. Try a generic name like 'Ibuprofen'.");
      setIsNameSearching(false);
    }
  };

  return (
    <main className="min-h-screen pt-20 pb-16 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 mesh-gradient-subtle" />
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-brand-500/5 blur-[120px]" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-5 shadow-lg shadow-brand-500/5">
            <Search className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
            Search Medicines
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Describe your symptoms or search by medicine name to get dosage info, side effects, and more.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-6 space-y-6 relative">
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-brand-500/10 to-transparent opacity-50 -z-10 blur-sm" />

          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-brand-400" />
              Response Language
            </label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full appearance-none bg-white/3 border border-white/8 text-white rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all cursor-pointer hover:bg-white/5"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900">
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-white/3 rounded-xl p-1 gap-1 border border-white/5">
            <button
              onClick={() => setActiveTab("symptom")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "symptom"
                  ? "bg-white/8 text-white shadow-sm border border-white/10"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Search className="w-4 h-4" />
              By Symptom
            </button>
            <button
              onClick={() => setActiveTab("name")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "name"
                  ? "bg-white/8 text-white shadow-sm border border-white/10"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Pill className="w-4 h-4" />
              By Name
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* Tab content */}
          {activeTab === "symptom" ? (
            <SymptomSearch
              onSearch={handleSymptomSearch}
              isSearching={isSearching}
              error={symptomError}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                  Medicine or ingredient name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSearch()}
                    placeholder="e.g. Ibuprofen, Cetirizine, Paracetamol…"
                    className="w-full bg-white/3 border border-white/8 text-white rounded-xl px-4 py-3 pr-10 text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all hover:bg-white/5"
                  />
                  {medicineName && (
                    <button
                      onClick={() => setMedicineName("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1.5">
                  Tip: Indian brand names (Crocin, Dolo) may not be found. Use generic names for better results.
                </p>
              </div>

              {/* Suggestions */}
              {!medicineName && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Try searching for</p>
                  <div className="flex flex-wrap gap-2">
                    {["Ibuprofen", "Paracetamol", "Cetirizine", "Amoxicillin", "Omeprazole", "Metformin", "Atorvastatin", "Azithromycin"].map((name) => (
                      <button
                        key={name}
                        onClick={() => setMedicineName(name)}
                        className="lang-chip text-xs px-3 py-1.5 rounded-full border border-white/8 bg-white/3 text-slate-400 hover:border-brand-500/30 hover:text-brand-400 hover:bg-brand-500/5 transition-all duration-200"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {nameError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <span className="text-red-400 text-sm">{nameError}</span>
                </div>
              )}

              {/* Search button */}
              <button
                onClick={() => handleNameSearch()}
                disabled={!medicineName.trim() || isNameSearching}
                className={`
                  w-full relative py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
                  flex items-center justify-center gap-2.5
                  ${medicineName.trim() && !isNameSearching
                    ? "bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-slate-950 shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
                  }
                `}
              >
                {isNameSearching ? (
                  <><Spinner size="sm" /><span>Looking up medicine…</span></>
                ) : (
                  <><Search className="w-4 h-4" /><span>Look Up Medicine</span></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* CTA to scan */}
        <div className="mt-5 text-center">
          <p className="text-slate-500 text-sm">
            Have the medicine in hand?{" "}
            <a
              href="/scan"
              className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
            >
              <ScanLine className="w-3.5 h-3.5" />
              Scan it instead →
            </a>
          </p>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-slate-600 text-xs leading-relaxed">
          MediScan provides general information only. Always consult a doctor or pharmacist before taking any medication.
        </p>
      </div>
    </main>
  );
}