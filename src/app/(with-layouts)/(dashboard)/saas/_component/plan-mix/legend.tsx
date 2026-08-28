import { formatNumber } from "@/utils/format-number";
import type { PlanMixSlice } from "./types";

export default function PlanMixLegend({ slices }: { slices: PlanMixSlice[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {slices.map((slice) => (
        <li key={slice.id} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm leading-5 font-medium text-text-primary">{slice.name}</span>
          </div>
          <div className="flex items-center gap-4 text-right">
            <span className="text-sm leading-5 text-text-tertiary">
              {formatNumber({ value: slice.subscribers, notation: "standard" })} users
            </span>
            <span className="w-12 shrink-0 text-sm leading-5 font-semibold text-text-primary">
              {slice.percentage}%
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
