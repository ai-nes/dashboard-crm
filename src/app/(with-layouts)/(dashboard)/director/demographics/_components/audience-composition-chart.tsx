import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { audienceCompositionData as defaultAudience } from "@/services/api/demographics/data";
import type { AudienceComposition } from "@/services/api/demographics/types";
import ChartEmptyState from "./chart-empty-state";

interface AudienceCompositionChartProps {
  audience?: AudienceComposition;
}

const GENDER_COLORS: Record<string, string> = {
  female: "var(--brand-500)",
  male: "var(--info-500)",
  unknown: "var(--background-soft-300)",
};

export default function AudienceCompositionChart({ audience = defaultAudience }: AudienceCompositionChartProps) {
  const total = audience.total;
  const gender = audience.gender ?? [];
  const profiles = audience.profiles ?? [];
  const hasGenderData = gender.length > 0;
  const hasProfileData = profiles.length > 0;

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-card-background">
      <CardHeader className="mb-3 items-start">
        <div>
          <CardTitle>Cơ cấu học sinh theo giới tính</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Phân bổ giới tính và các đặc điểm nổi bật của học sinh.</p>
        </div>
        <span className="text-xs font-medium text-text-tertiary">{total.toLocaleString("vi-VN")} học sinh</span>
      </CardHeader>
      {hasGenderData ? (
        <div className="space-y-3">
          <div className="h-3 overflow-hidden rounded-full bg-background-gray-secondary" aria-label="Phân bổ giới tính">
            <div className="flex h-full w-full">
              {gender.map((item) => (
                <div
                  key={item.id}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ backgroundColor: getGenderColor(item.id, item.fill), width: `${Math.max(0, item.value)}%` }}
                  title={`${item.name}: ${item.value}%`}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {gender.map((item) => (
              <div key={item.id} className="rounded-xl bg-background-gray-primary p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                  <span className="size-2 rounded-full" style={{ backgroundColor: getGenderColor(item.id, item.fill) }} />
                  {item.name}
                </div>
                <p className="mt-1 text-sm font-semibold text-text-primary">{item.value}%</p>
                <p className="mt-0.5 text-[10px] text-text-tertiary">{getCount(item.value, total).toLocaleString("vi-VN")} học sinh</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ChartEmptyState message="Chưa có dữ liệu giới tính" detail="Cần dữ liệu học sinh để phân tích cơ cấu giới tính." />
      )}
      {hasProfileData ? (
        <div className="mt-4 space-y-3 border-t border-card-border pt-4">
          <p className="text-xs font-semibold text-text-primary">Đặc điểm nổi bật</p>
          {profiles.map((profile) => (
            <div key={profile.label}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-text-secondary">{profile.label}</span>
                <span className="shrink-0 font-semibold text-text-primary">
                  {profile.value}% <span className="font-normal text-text-tertiary">· {profile.detail || `${profile.count?.toLocaleString("vi-VN") ?? 0} học sinh`}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function getCount(percentage: number, total: number): number {
  return Math.round((percentage / 100) * total);
}

function getGenderColor(id: string, color?: string): string {
  return color || GENDER_COLORS[id] || "var(--brand-500)";
}
