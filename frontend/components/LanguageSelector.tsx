"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { code: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  /** "dropdown" = floating panel (default), "inline" = full-width select-style list */
  variant?: "dropdown" | "inline";
  /** Size of the trigger button */
  size?: "sm" | "md";
}

export function LanguageSelector({
  value,
  onChange,
  variant = "dropdown",
  size = "md",
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  if (variant === "inline") {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left ${
              lang.code === value
                ? "bg-cyan-500/15 border border-cyan-500/30 text-white"
                : "bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800"
            }`}
          >
            <span className="text-base leading-none">{lang.flag}</span>
            <div className="min-w-0">
              <p className="font-medium truncate leading-tight">{lang.native}</p>
              <p className="text-xs text-gray-500 truncate leading-tight">{lang.label}</p>
            </div>
            {lang.code === value && (
              <Check className="w-3.5 h-3.5 text-cyan-400 ml-auto shrink-0" />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  const triggerSizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-sm gap-2",
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          inline-flex items-center rounded-xl border transition-all duration-200 font-medium
          ${triggerSizes[size]}
          ${open
            ? "bg-gray-800 border-cyan-500/50 text-white"
            : "bg-gray-800/70 border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white"
          }
        `}
      >
        <Globe className={`shrink-0 text-cyan-400 ${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
        <span className="hidden sm:inline">{selected.native}</span>
        <span className="sm:hidden">{selected.flag}</span>
        <ChevronDown
          className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""} ${size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Response language
            </p>
          </div>

          {/* Options */}
          <div className="p-1.5 space-y-0.5 max-h-72 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={lang.code === value}
                onClick={() => handleSelect(lang.code)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-colors duration-150
                  ${lang.code === value
                    ? "bg-cyan-500/15 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <span className="text-base leading-none w-5 text-center">{lang.flag}</span>
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{lang.native}</span>
                  <span className="text-gray-500 text-xs ml-1.5">{lang.label}</span>
                </div>
                {lang.code === value && (
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}