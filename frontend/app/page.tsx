"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Camera, Search, Globe, ShieldCheck, Zap, Pill,
  ArrowRight, ChevronRight, ScanLine, Sparkles,
  Lock, Languages, Eye, Activity,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════ */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || ran.current) return;
        ran.current = true;
        let cur = 0;
        const step = Math.max(1, Math.ceil(to / 50));
        const t = setInterval(() => {
          cur = Math.min(cur + step, to);
          setV(cur);
          if (cur >= to) clearInterval(t);
        }, 20);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {v.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURE CARD — Glass + Shimmer
   ═══════════════════════════════════════════════════════════ */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <div
      className={`group glass-card glass-card-hover shimmer-hover rounded-3xl p-7 sm:p-8 ${className}`}
    >
      <div className="relative z-10">
        <div className="w-11 h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5 group-hover:bg-brand-500/20 group-hover:border-brand-400/30 transition-all duration-500">
          <Icon className="w-5 h-5 text-brand-400 group-hover:text-brand-300 transition-colors duration-500" />
        </div>
        <h3 className="font-sans font-bold text-white text-base mb-2.5 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP — How it works
   ═══════════════════════════════════════════════════════════ */
function Step({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-5 group">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center font-mono text-sm font-bold text-brand-400 group-hover:bg-brand-500/25 group-hover:border-brand-400/40 transition-all duration-300 shrink-0">
          {n}
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-brand-500/20 to-transparent mt-2" />
      </div>
      <div className="pb-10 pt-1">
        <p className="font-semibold text-white text-sm mb-1.5">{title}</p>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 pb-20 px-4">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient pointer-events-none" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

        {/* Top-right glow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-500/8 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-700/6 blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
            {/* ─── Left: Copy ─── */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-brand-500/20 text-brand-400 text-xs font-mono font-medium mb-8 animate-fade-up">
                <Sparkles className="w-3.5 h-3.5" />
                AI-POWERED · FREE · NO LOGIN
              </div>

              <h1
                className="font-display font-semibold text-white leading-[1.05] tracking-tight mb-7"
                style={{ animationDelay: "0.1s" }}
              >
                <span className="text-5xl sm:text-6xl lg:text-7xl animate-fade-up block">
                  Know Your
                </span>
                <span
                  className="text-5xl sm:text-6xl lg:text-7xl gradient-text text-glow animate-fade-up block"
                  style={{ animationDelay: "0.2s" }}
                >
                  Medicine
                </span>
                <span
                  className="text-4xl sm:text-5xl lg:text-6xl italic text-slate-500 animate-fade-up block mt-1"
                  style={{ animationDelay: "0.3s" }}
                >
                  instantly.
                </span>
              </h1>

              <p
                className="text-slate-400 text-lg leading-relaxed mb-9 max-w-md animate-fade-up"
                style={{ animationDelay: "0.4s" }}
              >
                Snap a photo of any medicine or describe your symptoms.
                Get dosage, warnings, side effects and alternatives — in{" "}
                <span className="text-brand-400 font-medium">
                  8 Indian languages
                </span>
                .
              </p>

              <div
                className="flex flex-col sm:flex-row gap-3 animate-fade-up"
                style={{ animationDelay: "0.5s" }}
              >
                <Link
                  href="/scan"
                  className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-slate-950 font-semibold text-sm rounded-2xl transition-all duration-300 shadow-xl shadow-brand-500/25 hover:shadow-brand-400/40 hover:-translate-y-0.5"
                >
                  <Camera className="w-4 h-4" />
                  Scan a Medicine
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 glass hover:bg-white/8 text-slate-300 hover:text-white font-semibold text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  Search by Symptom
                </Link>
              </div>

              <div
                className="flex items-center gap-5 mt-8 animate-fade-up"
                style={{ animationDelay: "0.6s" }}
              >
                {[
                  { icon: Lock, text: "No data collected" },
                  { icon: Eye, text: "No tracking" },
                  { icon: ShieldCheck, text: "100% free" },
                ].map(({ icon: I, text }) => (
                  <span
                    key={text}
                    className="flex items-center gap-1.5 text-xs text-slate-500"
                  >
                    <I className="w-3 h-3" />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* ─── Right: 3D Mockup Card ─── */}
            <div
              className="relative w-full max-w-[360px] mx-auto lg:mx-0 animate-fade-up"
              style={{
                animationDelay: "0.3s",
                perspective: "1200px",
              }}
            >
              {/* Ambient glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-400/15 blur-[80px] animate-glow-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-brand-600/10 blur-[60px] animate-float" />

              {/* Card with 3D perspective */}
              <div
                className="relative glass-card rounded-[2rem] overflow-hidden transition-transform duration-700 hover:[transform:rotateY(0deg)_rotateX(0deg)]"
                style={{
                  transform: "rotateY(-6deg) rotateX(2deg)",
                }}
              >
                {/* Card header */}
                <div className="p-5 pb-0 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 tracking-wider">
                    MEDISCAN V2.0
                  </div>
                </div>

                {/* Scan viewport */}
                <div className="relative bg-slate-950 aspect-[4/3] m-4 rounded-[1.75rem] overflow-hidden group">
                  {/* Subtle pattern */}
                  <div className="absolute inset-0 dot-grid opacity-20" />

                  {/* Corner brackets */}
                  <div className="absolute inset-6 rounded-2xl">
                    <span className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-2 border-l-2 border-brand-400/60 rounded-tl" />
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-2 border-r-2 border-brand-400/60 rounded-tr" />
                    <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-2 border-l-2 border-brand-400/60 rounded-bl" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-2 border-r-2 border-brand-400/60 rounded-br" />
                  </div>

                  {/* Animated scanline */}
                  <div className="absolute animate-scanline w-full h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.8)] z-10" />

                  {/* Abstract pill icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                    <div className="w-20 h-8 rounded-full border-2 border-brand-400 rotate-45 shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
                  </div>
                </div>

                {/* Result panel */}
                <div className="px-6 pb-7 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-white/10 to-white/5 rounded-full" />
                    </div>
                    <div className="h-6 w-12 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center rounded-lg border border-emerald-500/20">
                      98%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-9 bg-white/3 rounded-xl border border-white/5" />
                    <div className="h-9 bg-white/3 rounded-xl border border-white/5" />
                  </div>

                  <div className="flex justify-center gap-2">
                    {["हि", "ത", "বা"].map((l) => (
                      <div
                        key={l}
                        className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500"
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────── */}
      <section className="relative border-y border-white/5 py-12">
        <div className="mesh-gradient-subtle absolute inset-0 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { to: 20000, suffix: "+", label: "Medicines indexed" },
            { to: 8, suffix: "", label: "Indian languages" },
            { to: 100, suffix: "%", label: "Free forever" },
            { to: 0, suffix: "", label: "Data collected" },
          ].map(({ to, suffix, label }) => (
            <div key={label} className="group">
              <p className="font-display text-4xl font-semibold gradient-text mb-1.5 group-hover:text-glow transition-all">
                <Counter to={to} suffix={suffix} />
              </p>
              <p className="text-slate-500 text-xs uppercase tracking-[0.15em] font-mono">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-xs font-mono tracking-[0.2em] uppercase mb-4">
              Capabilities
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight">
              Everything you need,{" "}
              <span className="italic text-slate-500">nothing you don&apos;t.</span>
            </h2>
          </div>

          {/* Asymmetric grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Camera}
              title="Photo Recognition"
              desc="Snap any medicine strip, box, or tablet. Our OCR + AI pipeline extracts and identifies the name in seconds."
              className="lg:col-span-2"
            />
            <FeatureCard
              icon={Search}
              title="Symptom Search"
              desc="Describe what you're feeling — fever, headache, nausea — and get matching medicines instantly."
            />
            <FeatureCard
              icon={Globe}
              title="8 Indian Languages"
              desc="Results in Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, Kannada, or English."
            />
            <FeatureCard
              icon={Pill}
              title="Full Medicine Info"
              desc="Dosage, warnings, side effects, drug interactions, and generic alternatives from a single scan."
              className="lg:col-span-2"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Private by Design"
              desc="No account. No cookies. No tracking. Your health queries are yours alone."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Results"
              desc="Results cached via Redis for lightning-fast repeat queries. Most lookups return in under a second."
            />
            <FeatureCard
              icon={Languages}
              title="Smart Translation"
              desc="Powered by LibreTranslate. Accurate medical terminology in your preferred language."
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 relative">
        <div className="absolute inset-0 mesh-gradient-subtle pointer-events-none" />
        <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-20 items-start">
          <div>
            <p className="text-brand-400 text-xs font-mono tracking-[0.2em] uppercase mb-4">
              How it works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-12 leading-snug">
              Three steps to{" "}
              <span className="italic text-slate-500">clarity.</span>
            </h2>

            <div>
              <Step
                n="01"
                title="Upload or describe"
                desc="Take a photo of the medicine or type your symptoms into the search box."
              />
              <Step
                n="02"
                title="AI identifies it"
                desc="Our pipeline runs OCR, queries OpenFDA, and fetches full medicine data in real time."
              />
              <Step
                n="03"
                title="Read in your language"
                desc="Get dosage, warnings, side effects and alternatives — translated to your preferred Indian language."
              />
            </div>

            <div className="flex gap-5 mt-2">
              <Link
                href="/scan"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Start scanning
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <span className="text-slate-700">·</span>
              <Link
                href="/search"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-300 transition-colors"
              >
                Search symptoms
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Decorative stacked card */}
          <div className="relative h-80 hidden md:block mt-12">
            <div className="absolute top-5 left-5 right-0 bottom-0 rounded-2xl glass opacity-30" />
            <div className="absolute top-2.5 left-2.5 right-2.5 bottom-2.5 rounded-2xl glass opacity-50" />
            <div className="absolute inset-0 rounded-2xl glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/20">
                  <Pill className="w-4 h-4 text-slate-950" />
                </div>
                <div>
                  <div className="h-3.5 w-28 bg-white/10 rounded-full mb-1.5" />
                  <div className="h-2.5 w-16 bg-white/5 rounded-full" />
                </div>
                <span className="ml-auto text-xs bg-brand-500/10 border border-brand-500/20 text-brand-400 px-2.5 py-0.5 rounded-full font-mono">
                  OTC
                </span>
              </div>
              <div className="rounded-xl bg-brand-500/5 border border-brand-500/15 p-3.5 space-y-2">
                <p className="text-brand-400 text-xs font-mono font-medium tracking-wider">
                  DOSAGE
                </p>
                <div className="h-2 w-full bg-brand-500/10 rounded-full" />
                <div className="h-2 w-5/6 bg-brand-500/8 rounded-full" />
                <div className="h-2 w-4/6 bg-brand-500/5 rounded-full" />
              </div>
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3.5 space-y-2">
                <p className="text-amber-400 text-xs font-mono font-medium tracking-wider">
                  WARNINGS
                </p>
                <div className="h-2 w-full bg-amber-500/10 rounded-full" />
                <div className="h-2 w-3/4 bg-amber-500/8 rounded-full" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {["EN", "हि", "த", "বা"].map((l) => (
                  <span
                    key={l}
                    className="text-xs px-2 py-0.5 rounded-lg bg-white/5 border border-white/8 text-slate-500 font-mono"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LANGUAGES ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-slate-500 text-sm mb-8 font-medium">
            Results available in your language
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { code: "EN", name: "English" },
              { code: "हि", name: "Hindi" },
              { code: "த", name: "Tamil" },
              { code: "বা", name: "Bengali" },
              { code: "తె", name: "Telugu" },
              { code: "म", name: "Marathi" },
              { code: "ગ", name: "Gujarati" },
              { code: "ಕ", name: "Kannada" },
            ].map(({ code, name }) => (
              <div
                key={code}
                className="lang-chip flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/3 border border-white/8 cursor-default group"
              >
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 text-slate-950 flex items-center justify-center text-xs font-bold shadow-sm">
                  {code}
                </span>
                <span className="text-sm text-slate-400 group-hover:text-white font-medium transition-colors duration-200">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-brand-500/30" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-brand-500/5 blur-[120px]" />

        <div className="relative max-w-xl mx-auto text-center">
          {/* Pulsing icon */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-8">
            <span className="absolute w-full h-full rounded-full bg-brand-400/20 animate-pulse-ring" />
            <span
              className="absolute w-full h-full rounded-full bg-brand-400/10 animate-pulse-ring"
              style={{ animationDelay: "0.8s" }}
            />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 shadow-xl shadow-brand-500/30 flex items-center justify-center">
              <ScanLine className="w-6 h-6 text-slate-950" />
            </div>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-5 leading-tight">
            Start for free,{" "}
            <span className="italic text-slate-500">right now.</span>
          </h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed max-w-md mx-auto">
            No sign-up. No cost. Just point your camera at a medicine or type
            what you&apos;re feeling.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/scan"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-slate-950 font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-brand-500/25 hover:shadow-brand-400/40 hover:-translate-y-0.5 text-sm"
            >
              <Camera className="w-4 h-4" />
              Scan a Medicine
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 glass hover:bg-white/8 text-slate-300 hover:text-white font-semibold rounded-2xl transition-all duration-300 hover:-translate-y-0.5 text-sm"
            >
              <Search className="w-4 h-4 text-slate-500" />
              Search by Symptom
            </Link>
          </div>

          <p className="mt-10 text-slate-600 text-xs leading-relaxed">
            MediScan is for informational purposes only. Always consult a
            qualified doctor before taking medication.
          </p>
        </div>
      </section>
    </div>
  );
}