import { CheckCircle1, ClockThree, MapMarker5, User2 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolHealthOverviewProps {
  data: SchoolIntelligenceData;
}

const relationshipSteps = ["Chưa tiếp xúc", "Đã tiếp xúc", "Có đầu mối", "Hợp tác thường xuyên", "Đối tác chiến lược"];

export default function SchoolHealthOverview({ data }: SchoolHealthOverviewProps) {
  const currentIndex = relationshipSteps.indexOf(data.relationship.level);
  const badgeColor = data.relationship.score >= 75 ? "success" : data.relationship.score >= 45 ? "warning" : "primary";

  return (
    <Card className="min-w-0 p-5 lg:p-6">
      <CardHeader className="mb-5 items-start">
        <div className="min-w-0">
          <CardTitle>Quan hệ với nhà trường</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Quan hệ là một trục độc lập với tiềm năng, dùng để chọn cách tiếp cận.</p>
        </div>
        <Badge color={badgeColor}>{data.relationship.level}</Badge>
      </CardHeader>

      <div className="mb-5">
        <div className="flex items-center gap-1" aria-label={"Đang ở cấp " + data.relationship.level}>
          {relationshipSteps.map((step, index) => <span key={step} className={"h-2 flex-1 rounded-full " + (index <= currentIndex ? "bg-primary-500" : "bg-background-soft-200")} title={step} />)}
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px] leading-4 text-text-tertiary">
          {relationshipSteps.map((step) => <span key={step}>{step}</span>)}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
        <div className="rounded-2xl bg-badge-primary-background p-4">
          <p className="text-xs text-text-tertiary">Mức độ quan hệ</p>
          <p className="mt-1 text-3xl font-semibold text-text-primary">{data.relationship.score}<span className="text-sm font-medium text-text-tertiary">/100</span></p>
          <p className="mt-1 text-sm font-medium text-badge-primary-text">{data.relationship.level}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-card-background" aria-hidden="true"><div className="h-full rounded-full bg-primary-500" style={{ width: data.relationship.score + "%" }} /></div>
        </div>

        <div className="divide-y divide-card-border border-y border-card-border">
          <RelationshipFact icon={<User2 size={15} />} label="Đầu mối" value={data.relationship.contact} />
          <RelationshipFact icon={<MapMarker5 size={15} />} label="Vai trò" value={data.relationship.contactRole} />
          <RelationshipFact icon={<ClockThree size={15} />} label="Điểm chạm gần nhất" value={data.relationship.lastTouch} />
          <RelationshipFact icon={<CheckCircle1 size={15} />} label="Cần kích hoạt tiếp" value={data.relationship.nextTouch} />
        </div>
      </div>

      <p className="mt-5 border-t border-card-border pt-4 text-xs leading-5 text-text-tertiary">Nguồn quan hệ: {data.relationship.source}</p>
    </Card>
  );
}

function RelationshipFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[20px_150px_minmax(0,1fr)] sm:items-start sm:gap-3">
      <span className="mt-0.5 shrink-0 text-icon-tertiary" aria-hidden="true">{icon}</span>
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p className="break-words text-sm font-medium leading-5 text-text-primary">{value}</p>
    </div>
  );
}
