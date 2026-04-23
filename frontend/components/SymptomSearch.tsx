"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Plus, AlertCircle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

const COMMON_SYMPTOMS = [
  "fever", "headache", "cold", "cough", "sore throat", "body pain",
  "nausea", "vomiting", "diarrhea", "stomach pain", "acidity", "constipation",
  "allergies", "skin rash", "itching", "runny nose", "sneezing", "congestion",
  "muscle pain", "joint pain", "back pain", "fatigue", "dizziness", "anxiety",
  "insomnia", "high blood pressure", "diabetes", "asthma", "indigestion",
  "eye irritation", "ear pain", "toothache", "chest pain", "shortness of breath",
];

interface SymptomSearchProps {
  onSearch: (symptoms: string[]) => Promise<void>;
  isSearching: boolean;
  error?: string | null;
}

export function SymptomSearch({ onSearch, isSearching, error }: SymptomSearchProps) {
  const [input, setInput] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const query = input.toLowerCase().trim();
    const filtered = COMMON_SYMPTOMS.filter(
      (s) => s.includes(query) && !selectedSymptoms.includes(s)
    ).slice(0, 6);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveSuggestion(-1);
  }, [input, selectedSymptoms]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addSymptom = useCallback((symptom: string) => {
    const cleaned = symptom.trim().toLowerCase();
    if (!cleaned || selectedSymptoms.includes(cleaned)) return;
    setSelectedSymptoms((prev) => [...prev, cleaned]);
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [selectedSymptoms]);

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        addSymptom(suggestions[activeSuggestion]);
      } else if (input.trim()) {
        addSymptom(input.trim());
      } else if (selectedSymptoms.length > 0) {
        handleSearch();
      }
    } else if (e.key === "Backspace" && !input && selectedSymptoms.length > 0) {
      setSelectedSymptoms((prev) => prev.slice(0, -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "," || e.key === ";") {
      e.preventDefault();
      if (input.trim()) addSymptom(input.trim());
    }
  };

  const handleSearch = async () => {
    if (selectedSymptoms.length === 0) return;
    await onSearch(selectedSymptoms);
  };

  const highlightMatch = (text: string, query: string) => {
    const idx = text.indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-brand-400 font-semibold">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Input with tags */}
      <div className="relative">
        <div
          className={`
            flex flex-wrap items-center gap-2 min-h-[54px] px-3 py-2.5 rounded-xl
            bg-white/3 border transition-all duration-200 cursor-text
            ${showSuggestions
              ? "border-brand-500/50 ring-1 ring-brand-500/15"
              : "border-white/8 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/15"
            }
          `}
          onClick={() => inputRef.current?.focus()}
        >
          {selectedSymptoms.map((symptom) => (
            <span
              key={symptom}
              className="inline-flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {symptom}
              <button
                onClick={(e) => { e.stopPropagation(); removeSymptom(symptom); }}
                className="hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => input.length > 0 && setShowSuggestions(true)}
            placeholder={selectedSymptoms.length === 0 ? "Type a symptom (e.g. fever, headache)…" : "Add more symptoms…"}
            className="flex-1 min-w-[140px] bg-transparent text-white text-sm placeholder-slate-600 outline-none"
          />
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1.5 glass-strong rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden"
          >
            {suggestions.map((s, i) => (
              <button
                key={s}
                onMouseDown={(e) => { e.preventDefault(); addSymptom(s); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors
                  ${i === activeSuggestion ? "bg-brand-500/10 text-white" : "text-slate-300 hover:bg-white/5"}
                `}
              >
                <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{highlightMatch(s, input.trim())}</span>
                <Plus className="w-3.5 h-3.5 text-slate-600 ml-auto shrink-0" />
              </button>
            ))}
            {input.trim() && !COMMON_SYMPTOMS.includes(input.trim().toLowerCase()) && (
              <button
                onMouseDown={(e) => { e.preventDefault(); addSymptom(input.trim()); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left border-t border-white/5 text-slate-400 hover:bg-white/5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span>Add <span className="text-brand-400 font-medium">&quot;{input.trim()}&quot;</span></span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-slate-600 -mt-1">
        Press <kbd className="bg-white/5 border border-white/8 rounded px-1 py-0.5 font-mono text-slate-400">Enter</kbd> or <kbd className="bg-white/5 border border-white/8 rounded px-1 py-0.5 font-mono text-slate-400">,</kbd> to add · <kbd className="bg-white/5 border border-white/8 rounded px-1 py-0.5 font-mono text-slate-400">Backspace</kbd> to remove
      </p>

      {/* Quick-add */}
      {selectedSymptoms.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Common symptoms</p>
          <div className="flex flex-wrap gap-2">
            {["fever", "headache", "cold", "cough", "nausea", "body pain", "acidity", "allergies", "diarrhea", "fatigue"].map((s) => (
              <button
                key={s}
                onClick={() => addSymptom(s)}
                className="lang-chip text-xs px-3 py-1.5 rounded-full border border-white/8 bg-white/3 text-slate-400 hover:border-brand-500/30 hover:text-brand-400 hover:bg-brand-500/5 transition-all duration-200"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Search button */}
      <button
        onClick={handleSearch}
        disabled={selectedSymptoms.length === 0 || isSearching}
        className={`
          w-full relative py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
          flex items-center justify-center gap-2.5 overflow-hidden
          ${selectedSymptoms.length > 0 && !isSearching
            ? "bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-slate-950 shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 active:translate-y-0"
            : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
          }
        `}
      >
        {isSearching ? (
          <>
            <Spinner size="sm" />
            <span>Searching medicines…</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            <span>
              {selectedSymptoms.length > 0
                ? `Search for ${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? "s" : ""}`
                : "Add symptoms to search"}
            </span>
          </>
        )}
      </button>
    </div>
  );
}