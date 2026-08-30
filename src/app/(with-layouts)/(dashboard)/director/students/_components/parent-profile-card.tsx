import { UserMultiple1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

const involvementTone = { Cao: "success", "Trung bình": "warning", Thấp: "gray", "Chưa xác định": "gray" } as const;

export default function ParentProfileCard({ data }: Student360SectionProps) {
  const parent = data.parentProfile;

  return (
    <Card className="h-full p-5">
      <CardHeader className="mb-5 items-start">
        <div><CardTitle>Hồ sơ phụ huynh</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Theo dõi phụ huynh như một người đồng quyết định độc lập.</p></div>
        <Badge color={involvementTone[parent.involvement]}>Tham gia {parent.involvement.toLowerCase()}</Badge>
      </CardHeader>

      <div className="flex items-start gap-3 rounded-xl bg-background-gray-primary p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><UserMultiple1 size={18} /></span>
        <div className="min-w-0"><p className="text-sm font-semibold text-text-primary">{parent.name} · {parent.relation}</p><p className="mt-1 text-xs leading-5 text-text-secondary">{parent.role}</p></div>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div><dt className="text-xs text-text-tertiary">Kênh liên hệ ưa thích</dt><dd className="mt-1 text-sm font-medium text-text-primary">{parent.preferredChannel}</dd></div>
        <div><dt className="text-xs text-text-tertiary">Khung giờ phù hợp</dt><dd className="mt-1 text-sm font-medium text-text-primary">{parent.bestContactTime}</dd></div>
        <div><dt className="text-xs text-text-tertiary">Tương tác gần nhất</dt><dd className="mt-1 text-sm font-medium text-text-primary">{parent.lastInteraction}</dd></div>
        <div><dt className="text-xs text-text-tertiary">Quyền liên hệ</dt><dd className="mt-1 text-sm font-medium text-success-500">{parent.consentStatus}</dd></div>
      </dl>

      <div className="mt-5"><p className="text-xs font-medium text-text-tertiary">Mối quan tâm riêng của phụ huynh</p><div className="mt-2 flex flex-wrap gap-2">{parent.concerns.map((concern) => <Badge key={concern} color="warning">{concern}</Badge>)}</div></div>
    </Card>
  );
}
