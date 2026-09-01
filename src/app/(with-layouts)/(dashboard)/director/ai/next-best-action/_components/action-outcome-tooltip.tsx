import type { ActionOutcome } from "./types";

interface ActionOutcomeTooltipProps {
  active?: boolean;
  payload?: { payload?: ActionOutcome }[];
}

export default function ActionOutcomeTooltip({
  active,
  payload,
}: ActionOutcomeTooltipProps) {
  const outcome = payload?.[0]?.payload;

  if (!active || !outcome) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-sm">
      <p className="font-semibold text-text-primary">{outcome.label}</p>
      <p className="mt-2 text-text-secondary">
        Đã thực hiện: {outcome.executed.toLocaleString("vi-VN")}
      </p>
      <p className="mt-1 text-text-secondary">
        Sang bước tiếp theo: {outcome.progressed.toLocaleString("vi-VN")}
      </p>
      <p className="mt-1 font-semibold text-primary-500">
        Tỷ lệ sang bước tiếp theo:{" "}
        {outcome.transitionRate === null
          ? "—"
          : `${outcome.transitionRate.toLocaleString("vi-VN")} %`}
      </p>
    </div>
  );
}
