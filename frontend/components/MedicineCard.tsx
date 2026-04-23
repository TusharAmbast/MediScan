"use client";

import { useState } from "react";
import {
  Pill, AlertTriangle, Info, ChevronDown, ChevronUp,
  ShieldAlert, Repeat, FlaskConical, Clock, ExternalLink
} from "lucide-react";
import Badge from "@/components/ui/Badge";

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

interface MedicineCardProps {
  medicine: MedicineInfo;
  index?: number;
}

function Section({
  icon,
  title,
  children,
  defaultOpen = true,
  accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border transition-colors ${accent ? "border-amber-500/20 bg-amber-500/5" : "border-gray-800 bg-gray-800/30"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className={accent ? "text-amber-400" : "text-cyan-400"}>{icon}</span>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-500" />
          : <ChevronDown className="w-4 h-4 text-gray-500" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

function BulletList({ items, color = "gray" }: { items: string[]; color?: "gray" | "red" | "amber" | "cyan" }) {
  const dotColor = {
    gray: "bg-gray-500",
    red: "bg-red-400",
    amber: "bg-amber-400",
    cyan: "bg-cyan-400",
  }[color];

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function MedicineCard({ medicine, index = 0 }: MedicineCardProps) {
  const dosageItems = Array.isArray(medicine.dosage)
    ? medicine.dosage
    : medicine.dosage
    ? [medicine.dosage]
    : [];

  const hasWarnings = medicine.warnings && medicine.warnings.length > 0;
  const hasSideEffects = medicine.side_effects && medicine.side_effects.length > 0;
  const hasInteractions = medicine.drug_interactions && medicine.drug_interactions.length > 0;
  const hasAlternatives = medicine.alternatives && medicine.alternatives.length > 0;

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl shadow-black/30"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-800">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white leading-tight truncate">
                {medicine.name}
              </h3>
              {medicine.generic_name && medicine.generic_name !== medicine.name && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Generic: <span className="text-gray-300">{medicine.generic_name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {medicine.otc_or_rx && (
              <Badge variant={medicine.otc_or_rx.toLowerCase().includes("otc") ? "success" : "warning"}>
                {medicine.otc_or_rx}
              </Badge>
            )}
            {medicine.drug_class && (
              <Badge variant="info">{medicine.drug_class}</Badge>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap gap-3">
          {medicine.route && medicine.route.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3 h-3 text-gray-500" />
              {Array.isArray(medicine.route) ? medicine.route.join(", ") : medicine.route}
            </span>
          )}
          {medicine.pregnancy_category && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <ShieldAlert className="w-3 h-3 text-gray-500" />
              Pregnancy: Category {medicine.pregnancy_category}
            </span>
          )}
          {medicine.manufacturer && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <FlaskConical className="w-3 h-3 text-gray-500" />
              {medicine.manufacturer}
            </span>
          )}
        </div>

        {/* Purpose */}
        {medicine.purpose && (
          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            {medicine.purpose}
          </p>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">

        {/* Brand names */}
        {medicine.brand_names && medicine.brand_names.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-gray-500 mr-1">Brand names:</span>
            {medicine.brand_names.slice(0, 6).map((b) => (
              <span key={b} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                {b}
              </span>
            ))}
            {medicine.brand_names.length > 6 && (
              <span className="text-xs text-gray-500">+{medicine.brand_names.length - 6} more</span>
            )}
          </div>
        )}

        {/* Active ingredients */}
        {medicine.active_ingredients && medicine.active_ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-gray-500 mr-1">Active ingredients:</span>
            {medicine.active_ingredients.map((a) => (
              <span key={a} className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Dosage */}
        {dosageItems.length > 0 && (
          <Section icon={<Clock className="w-4 h-4" />} title="Dosage & Administration" defaultOpen={true}>
            <BulletList items={dosageItems} color="cyan" />
          </Section>
        )}

        {/* Warnings */}
        {hasWarnings && (
          <Section
            icon={<AlertTriangle className="w-4 h-4" />}
            title="Warnings"
            defaultOpen={true}
            accent={true}
          >
            <BulletList items={medicine.warnings!} color="amber" />
          </Section>
        )}

        {/* Side effects */}
        {hasSideEffects && (
          <Section icon={<ShieldAlert className="w-4 h-4" />} title="Side Effects" defaultOpen={false}>
            <BulletList items={medicine.side_effects!} color="red" />
          </Section>
        )}

        {/* Drug interactions */}
        {hasInteractions && (
          <Section icon={<Repeat className="w-4 h-4" />} title="Drug Interactions" defaultOpen={false}>
            <BulletList items={medicine.drug_interactions!} color="amber" />
          </Section>
        )}

        {/* Alternatives */}
        {hasAlternatives && (
          <Section icon={<FlaskConical className="w-4 h-4" />} title="Alternatives" defaultOpen={false}>
            <div className="flex flex-wrap gap-2">
              {medicine.alternatives!.map((alt) => (
                <span
                  key={alt}
                  className="text-sm bg-gray-700/60 border border-gray-600/50 text-gray-300 px-3 py-1 rounded-full"
                >
                  {alt}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Source link */}
        {medicine.source && (
          <div className="pt-1">
            <a
              href={medicine.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
            >
              <Info className="w-3 h-3" />
              View source data
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}