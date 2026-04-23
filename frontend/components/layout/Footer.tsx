import { Activity, ShieldCheck, Lock, Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 mt-auto overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-brand-500/3 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Medical Disclaimer — prominent, trust-building */}
        <div className="py-8 border-b border-white/5">
          <div className="glass-card rounded-2xl p-5 sm:p-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Medical Disclaimer</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  MediScan provides general health information only and is{" "}
                  <span className="text-slate-300 font-medium">not a substitute for professional medical advice</span>.
                  Always consult a qualified healthcare provider before taking any medication.
                  Do not disregard or delay seeking medical advice based on information from this application.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer content */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/20">
              <Activity className="w-3.5 h-3.5 text-slate-950" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-white">
              Medi<span className="gradient-text">Scan</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            <Link href="/scan" className="text-xs text-slate-500 hover:text-brand-400 transition-colors duration-200">
              Scan Medicine
            </Link>
            <Link href="/search" className="text-xs text-slate-500 hover:text-brand-400 transition-colors duration-200">
              Search Symptoms
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Lock className="w-3 h-3" />
              <span>No data collected</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Heart className="w-3 h-3" />
              <span>Made in India</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4 border-t border-white/5 flex items-center justify-center">
          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} MediScan · For informational purposes only · Always consult a licensed physician
          </p>
        </div>
      </div>
    </footer>
  );
}