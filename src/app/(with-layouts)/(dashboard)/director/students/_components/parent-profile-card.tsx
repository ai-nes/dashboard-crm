import { UserMultiple1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDateTime } from "@/utils/format-date";

import type { Student360SectionProps } from "./types";

const involvementTone = { Cao: "success", "Trung bình": "warning", Thấp: "gray", "Chưa xác định": "gray" } as const;

export default function ParentProfileCard({ data }: Student360SectionProps) {
  const parent = data.parentProfile;
  const parentTitle = [parent.name, parent.relation].filter(Boolean).join(" · ") || "-";

  return (
    <Card className="h-full p-5">
      <CardHeader className="mb-5 items-start">
        <CardTitle>Hồ sơ phụ huynh</CardTitle>
        <Badge color={involvementTone[parent.involvement] ?? "gray"}>Tham gia {(parent.involvement || "Chưa xác định").toLowerCase()}</Badge>
      </CardHeader>

      <div className="flex items-start gap-3 rounded-xl border border-primary-200 bg-badge-primary-background p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><UserMultiple1 size={18} /></span>
        <div className="min-w-0"><p className="text-sm font-semibold text-text-primary">{parentTitle}</p><p className="mt-1 text-xs leading-5 text-text-secondary">{parent.role || "-"}</p></div>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div><dt className="text-xs text-text-tertiary">Kênh liên hệ ưa thích</dt><dd className="mt-1 text-sm font-medium text-text-primary">{parent.preferredChannel || "-"}</dd></div>
        <div><dt className="text-xs text-text-tertiary">Khung giờ phù hợp</dt><dd className="mt-1 text-sm font-medium text-text-primary">{parent.bestContactTime || "-"}</dd></div>
        <div><dt className="text-xs text-text-tertiary">Tương tác gần nhất</dt><dd className="mt-1 text-sm font-medium text-text-primary">{formatDateTime(parent.lastInteraction)}</dd></div>
        <div><dt className="text-xs text-text-tertiary">Quyền liên hệ</dt><dd className="mt-1 text-sm font-medium text-success-500">{parent.consentStatus || "-"}</dd></div>
      </dl>

      <div className="mt-5">
        <p className="text-xs font-medium text-text-tertiary">Băn khoăn</p>
        {parent.concerns?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">{parent.concerns.map((concern) => <Badge key={concern} color="warning">{concern}</Badge>)}</div>
        ) : (
          <p className="mt-1 text-xs text-text-tertiary">-</p>
        )}
      </div>
    </Card>
  );
}
