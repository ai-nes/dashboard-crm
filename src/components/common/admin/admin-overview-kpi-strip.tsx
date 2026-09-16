import { Card } from "@/components/tailgrids/core/card";

interface AdminOverviewKpi {
  label: string;
  value: string;
  detail: string;
  tone: "primary" | "success" | "warning" | "info";
}

const TONE_STYLES: Record<
  AdminOverviewKpi["tone"],
  { marker: string; value: string }
> = {
  primary: { marker: "bg-primary-500", value: "text-primary-600" },
  success: { marker: "bg-success-500", value: "text-success-500" },
  warning: { marker: "bg-warning-500", value: "text-warning-500" },
  info: { marker: "bg-info-500", value: "text-info-500" },
};

export default function AdminOverviewKpiStrip({
  items,
}: {
  items: readonly AdminOverviewKpi[];
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid divide-y divide-card-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {items.map((item) => {
          const tone = TONE_STYLES[item.tone];

          return (
            <div key={item.label} className="min-w-0 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-text-tertiary">
                <span
                  className={`size-2 rounded-full ${tone.marker}`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </div>
              <p
                className={`mt-2 text-2xl font-semibold tracking-[-0.5px] ${tone.value}`}
              >
                {item.value}
              </p>
              <p className="mt-1 truncate text-xs text-text-tertiary">
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
