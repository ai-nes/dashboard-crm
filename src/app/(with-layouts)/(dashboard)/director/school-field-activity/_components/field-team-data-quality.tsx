import type { FieldDataQuality } from "@/services/api/director-school-field-activity";

const formatRate = (value: number | null) => value === null ? "—" : `${value.toFixed(1).replace(".", ",")}%`;

interface FieldTeamDataQualityProps {
  data: FieldDataQuality;
}

export default function FieldTeamDataQuality({ data }: FieldTeamDataQualityProps) {
  return (
    <div className="min-w-0">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Đội ngũ nhập dữ liệu</h3>
        <p className="mt-1 text-xs leading-5 text-text-tertiary">Theo dõi dữ liệu trùng và thiếu theo từng người nhập.</p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-text-tertiary">
            <tr>
              <th className="pb-3 font-medium">Nhân sự</th>
              <th className="pb-3 text-right font-medium">Hồ sơ nhập</th>
              <th className="pb-3 text-right font-medium">Giây/hồ sơ</th>
              <th className="pb-3 text-right font-medium">Trùng dữ liệu</th>
              <th className="pb-3 text-right font-medium">Thiếu thông tin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {data.team.map((person) => (
              <tr key={person.userId}>
                <td className="py-3 font-medium text-text-primary">{person.name}</td>
                <td className="py-3 text-right text-text-secondary">{person.records}</td>
                <td className="py-3 text-right text-text-secondary">{person.secondsPerRecord ?? "—"}</td>
                <td className={`py-3 text-right font-medium ${person.duplicateRate !== null && person.duplicateRate > 5 ? "text-error-500" : "text-text-secondary"}`}>{formatRate(person.duplicateRate)}</td>
                <td className={`py-3 text-right font-medium ${person.missingRate !== null && person.missingRate > 10 ? "text-error-500" : "text-text-secondary"}`}>{formatRate(person.missingRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.attention ? (
        <div className="mt-4 rounded-lg bg-badge-warning-background p-3.5">
          <p className="text-sm font-semibold text-badge-warning-text">Cần hướng dẫn lại quy trình nhập</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{data.attention.name} có tỷ lệ trùng {formatRate(data.attention.duplicateRate)} và thiếu thông tin {formatRate(data.attention.missingRate)}.</p>
        </div>
      ) : null}

      <div className="mt-5 border-t-[0.5px] border-card-border pt-5">
        <h3 className="text-sm font-semibold text-text-primary">Chất lượng dữ liệu toàn mùa</h3>
        <div className="mt-4 space-y-4">
          {data.seasonMetrics.map((metric) => {
            const meetsTarget = metric.status === "meets_target";

            return (
              <div key={metric.label}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-text-secondary">{metric.label}</span>
                  <span className={`font-semibold ${meetsTarget ? "text-success-500" : "text-warning-500"}`}>{formatRate(metric.value)}</span>
                </div>
                <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-background-soft-100" role="progressbar" aria-label={metric.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={metric.value ?? undefined}>
                  <div className={`h-full rounded-full ${meetsTarget ? "bg-success-500" : "bg-warning-500"}`} style={{ width: `${metric.value ?? 0}%` }} />
                  <span className="absolute inset-y-[-2px] w-0.5 bg-text-secondary" style={{ left: `${metric.target ?? 0}%` }} aria-hidden="true" />
                </div>
                <p className="mt-1 text-[11px] text-text-tertiary">Mục tiêu {formatRate(metric.target)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
