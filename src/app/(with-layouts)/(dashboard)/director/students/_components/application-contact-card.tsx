import { UserMultiple1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

const involvementTone = { Cao: "success", "Trung bình": "warning", Thấp: "gray", "Chưa xác định": "gray" } as const;

export default function ApplicationContactCard({ data }: Student360SectionProps) {
  const parent = data.parentProfile;

  return (
    <Card className="h-full border-primary-200/70 p-3.5">
      <CardHeader className="mb-3 items-start">
        <div>
          <CardTitle className="text-base">Liên hệ ưu tiên</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Người cần có mặt ở bước quyết định tiếp theo.</p>
        </div>
        <Badge color={involvementTone[parent.involvement]}>Tham gia {parent.involvement.toLowerCase()}</Badge>
      </CardHeader>

      <div className="flex items-center gap-3 rounded-xl bg-badge-primary-background p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card-background text-primary-500" aria-hidden="true"><UserMultiple1 size={17} /></span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary" title={`${parent.name} · ${parent.relation}`}>{parent.name} · {parent.relation}</p>
          <p className="mt-0.5 truncate text-xs text-text-secondary" title={parent.role}>{parent.role}</p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-text-tertiary">Kênh liên hệ</dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">{parent.preferredChannel}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-tertiary">Khung giờ</dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">{parent.bestContactTime}</dd>
        </div>
      </dl>

    </Card>
  );
}
