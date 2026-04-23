"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, Pill, Info, ChevronDown, Sparkles, Shield, Zap, Camera } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { scanMedicine } from "@/lib/api";

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

export default function ScanPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (file: File) => {
    setIsScanning(true);
    setError(null);
    try {
      const result = await scanMedicine(file, language);
      sessionStorage.setItem("mediscan_result", JSON.stringify(result));
      const params = new URLSearchParams();
      params.set("lang", language);
      router.push(`/result?${params.toString()}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setIsScanning(false);
    }
  };

  return (
    <main className="min-h-screen pt-20 pb-16 relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 mesh-gradient-subtle" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-brand-500/5 blur-[150px]" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-5 shadow-lg shadow-brand-500/5">
            <ScanLine className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
            Scan Medicine
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Take or upload a clear photo of your medicine to identify it instantly.
          </p>
        </div>

        {/* Main card with animated border */}
        <div className="glass-card rounded-3xl p-6 space-y-6 relative">
          {/* Subtle glow behind card */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-brand-500/10 to-transparent opacity-50 -z-10 blur-sm" />

          {/* Language selector */}
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

            {/* Language chips - tactile selection */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`lang-chip px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    language === lang.code
                      ? "selected bg-brand-500/15 border border-brand-500/30 text-brand-400"
                      : "bg-white/3 border border-white/8 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* Image uploader */}
          <ImageUploader
            onScan={handleScan}
            isScanning={isScanning}
            error={error}
          />
        </div>

        {/* Tips section */}
        <div className="mt-6 glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-brand-400 shrink-0" />
            <span className="text-sm font-medium text-slate-300">Tips for best results</span>
          </div>
          <ul className="space-y-2.5">
            {[
              "Photograph the medicine name clearly — strip, box, or blister pack",
              "Ensure good lighting and avoid blurry or angled shots",
              "Indian brand names (Crocin, Dolo) may not always be found — try the generic name",
              "Works best with printed text; handwritten labels may not be recognized",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                <span className="w-1 h-1 rounded-full bg-brand-500/50 mt-1.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature badges */}
        <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          {[
            { icon: Shield, text: "Private" },
            { icon: Zap, text: "Instant" },
            { icon: Camera, text: "AI-powered" },
          ].map(({ icon: I, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-xs text-slate-600">
              <I className="w-3 h-3" />
              {text}
            </span>
          ))}
        </div>

        {/* Link to search */}
        <div className="mt-5 text-center">
          <p className="text-slate-500 text-sm">
            Know the medicine name?{" "}
            <a
              href="/search"
              className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
            >
              Search by name or symptom →
            </a>
          </p>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-slate-600 text-xs leading-relaxed">
          <Pill className="inline w-3 h-3 mr-1 text-slate-700" />
          MediScan provides general information only. Always consult a doctor or pharmacist.
        </p>
      </div>
    </main>
  );
}