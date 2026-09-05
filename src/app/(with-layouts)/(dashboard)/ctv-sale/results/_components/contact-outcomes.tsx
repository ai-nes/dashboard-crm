import { CheckCircle1, ClockThree, Message1, Phone } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { ContactOutcome } from "./data";

const outcomeIcons = {
  missed: Phone,
  "follow-up": ClockThree,
  qualified: CheckCircle1,
  "not-interested": Message1,
} as const;

interface ContactOutcomesProps {
  outcomes: ContactOutcome[];
}

export default function ContactOutcomes({ outcomes }: ContactOutcomesProps) {
  const maxValue = Math.max(...outcomes.map((item) => item.value));
  const total = outcomes.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Kết quả liên hệ</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">{total} kết quả đã được ghi nhận.</p>
        </div>
        <span className="rounded-full bg-background-soft-50 px-2.5 py-1 text-[11px] font-medium text-text-secondary">Theo trạng thái</span>
      </CardHeader>

      <div className="mt-6 space-y-4">
        {outcomes.map((outcome) => {
          const Icon = outcomeIcons[outcome.id as keyof typeof outcomeIcons];

          return (
            <div key={outcome.id} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-3">
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-text-secondary">
                    <Icon size={15} aria-hidden="true" className="shrink-0" style={{ color: outcome.color }} />
                    <span className="truncate">{outcome.label}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-text-primary">{outcome.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background-soft-100">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(outcome.value / maxValue) * 100}%`, backgroundColor: outcome.color }} />
                </div>
              </div>
              <span className="text-right text-[11px] text-text-tertiary">{Math.round((outcome.value / total) * 100)}%</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
