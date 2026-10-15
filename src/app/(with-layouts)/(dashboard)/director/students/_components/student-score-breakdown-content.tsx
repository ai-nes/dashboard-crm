import type { StudentScoreBreakdown } from "./student-score-breakdown";
import { formatDateTime } from "@/utils/format-date";

const formatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const number = (value: number | null) =>
  value === null ? "—" : formatter.format(value);

export default function StudentScoreBreakdownContent({
  breakdown,
}: {
  breakdown: StudentScoreBreakdown;
}) {
  const deductions = breakdown.deductions ?? [];
  return (
    <div className="text-tooltip-text-color">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Vì sao có điểm này?</p>
        <p className="shrink-0 text-lg font-bold tabular-nums text-primary-500">
          {number(breakdown.overallScore)}
          <span className="text-xs font-normal text-tooltip-text-color/70">
            {" "}
            / 100
          </span>
        </p>
      </div>
      <div className="mt-3 divide-y divide-card-border">
        {breakdown.items.map((item) => (
          <section key={item.id} className="py-2.5 first:pt-0">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                {item.description}
              </p>
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {number(item.score)}
                <span className="font-normal text-tooltip-text-color/60">
                  {" "}
                  / 100
                </span>
              </span>
            </div>
            {item.reasons?.length ? (
              <ul className="mt-2 space-y-1.5">
                {item.reasons.map((reason, index) => (
                  <li
                    key={reason.ruleId ?? index}
                    className="flex justify-between gap-3 text-xs"
                  >
                    <span className="text-tooltip-text-color/80">
                      {reason.label ?? "Tiêu chí phù hợp đã ghi nhận"}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-badge-success-text">
                      +{number(reason.score)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-tooltip-text-color/70">
                {item.score === 0 && item.weight !== null
                  ? "Chưa ghi nhận tín hiệu được cộng điểm."
                  : "Lịch sử chưa lưu chi tiết tiêu chí."}
              </p>
            )}
            {item.contribution !== null && (
              <p className="mt-2 text-[11px] text-tooltip-text-color/60">
                Đóng góp {number(item.contribution)} điểm vào tổng · trọng số{" "}
                {number(item.weight)}%
              </p>
            )}
          </section>
        ))}
      </div>
      <section className="mt-1 border-t border-card-border pt-2.5">
        <p className="text-xs font-semibold">Điểm bị trừ</p>
        {deductions.length ? (
          <ul className="mt-2 space-y-1.5">
            {deductions.map((reason, index) => (
              <li
                key={reason.ruleId ?? index}
                className="flex justify-between gap-3 text-xs"
              >
                <span className="text-tooltip-text-color/80">
                  {reason.label ?? "Tín hiệu bất lợi đã ghi nhận"}
                </span>
                <span className="shrink-0 font-medium tabular-nums text-badge-error-text">
                  −{number(Math.abs(reason.score))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-tooltip-text-color/70">
            {breakdown.negativeScore === 0 && breakdown.timeDecayScore === 0
              ? "Không có khoản trừ điểm."
              : "Lịch sử chưa lưu chi tiết khoản trừ."}
          </p>
        )}
        {(breakdown.negativeScore ?? 0) + (breakdown.timeDecayScore ?? 0) >
          0 && (
          <p className="mt-2 text-[11px] text-tooltip-text-color/60">
            Trừ{" "}
            {number(
              (breakdown.negativeScore ?? 0) + (breakdown.timeDecayScore ?? 0),
            )}{" "}
            điểm vào tổng sau trọng số.
          </p>
        )}
      </section>
      {(breakdown.templateName || breakdown.scoringTime) && (
        <p className="mt-3 border-t border-card-border pt-2 text-[10px] leading-4 text-tooltip-text-color/60">
          {breakdown.templateName}
          {breakdown.scoringTime && (
            <> · {formatDateTime(breakdown.scoringTime)}</>
          )}
        </p>
      )}
    </div>
  );
}
