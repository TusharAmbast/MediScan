"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanLine, Search, Menu, X, Pill } from "lucide-react";

const LINKS = [
  { href: "/scan",   label: "Scan",   Icon: ScanLine },
  { href: "/search", label: "Search", Icon: Search   },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]     = useState(false);
  const [progress, setProgress]     = useState(0);
  const [open, setOpen]             = useState(false);

  /* Track scroll position for glass effect + progress */
  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 12);

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setProgress(Math.min(window.scrollY / scrollHeight, 1));
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 " +
        (scrolled
          ? "glass-strong shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent")
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-400/40 group-hover:scale-105 transition-all duration-300">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-white tracking-tight">
            Medi<span className="gradient-text">Scan</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 " +
                  (active
                    ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5")
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/scan"
            className="ml-3 flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-slate-950 font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/25 hover:shadow-brand-400/40 hover:-translate-y-px"
          >
            <ScanLine className="w-4 h-4" />
            Scan Now
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
          aria-label="Menu"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Scroll progress indicator */}
      <div
        className="scroll-progress absolute bottom-0 left-0 right-0"
        style={{ transform: `scaleX(${progress})` }}
      />

      {/* Mobile drawer */}
      <div
        className={
          "sm:hidden overflow-hidden transition-all duration-300 border-t border-white/5 " +
          (open ? "max-h-56 bg-slate-900/95 backdrop-blur-xl" : "max-h-0")
        }
      >
        <nav className="px-4 py-3 flex flex-col gap-1">
          {LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors " +
                (pathname === href
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-slate-400 hover:text-white hover:bg-white/5")
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <Link
            href="/scan"
            className="flex items-center justify-center gap-2 mt-1 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors"
          >
            <ScanLine className="w-4 h-4" />
            Scan Now
          </Link>
        </nav>
      </div>
    </header>
  );
}