"use client";

import { ArrowDownward, ArrowUpward } from "@tailgrids/icons";

import type { DirectorKpi } from "./types";

export default function CompactKpiStrip({ kpis }: { kpis: DirectorKpi[] }) {
  return (
    <div className="rounded-2xl border border-card-border bg-background-gray-primary px-4 py-4" aria-label="Các chỉ số bổ sung">
      <div className="grid min-w-0 grid-cols-2 gap-y-4 sm:grid-cols-5 sm:divide-x sm:divide-card-border">
        {kpis.map((kpi) => {
          const isPositive = !kpi.change.startsWith("-");

          return (
            <div key={kpi.id} className="min-w-0 px-3 first:pl-0 last:pr-0 sm:px-4">
              <p className="truncate text-xs text-text-tertiary">{kpi.label}</p>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <p className="truncate text-lg font-semibold text-text-primary">{kpi.value}</p>
                <span className="shrink-0 text-[11px] font-medium text-text-tertiary">MT {kpi.target}</span>
              </div>
              <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${isPositive ? "text-success-500" : "text-error-500"}`}>
                {kpi.change}
                {isPositive ? <ArrowUpward size={13} aria-hidden="true" /> : <ArrowDownward size={13} aria-hidden="true" />}
                <span className="truncate font-normal text-text-tertiary">{kpi.helper}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
