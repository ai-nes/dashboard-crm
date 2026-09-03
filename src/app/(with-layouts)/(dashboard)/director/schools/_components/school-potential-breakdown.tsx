import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type {
  SchoolClassification,
  SchoolIntelligenceData,
} from "@/services/api/schools/types";

import SchoolPriorityOutcome from "./school-priority-outcome";
import SchoolRelationshipStage from "./school-relationship-stage";

interface SchoolPotentialBreakdownProps {
  data: SchoolIntelligenceData;
}

const groupBadge: Record<
  SchoolClassification,
  "success" | "primary" | "warning" | "gray"
> = {
  "Trọng điểm": "success",
  "Mở rộng": "primary",
  "Duy trì": "warning",
  "Sàng lọc": "gray",
};

export default function SchoolPotentialBreakdown({
  data,
}: SchoolPotentialBreakdownProps) {
  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="border-b border-card-border px-4 py-3 lg:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <CardTitle>Mức độ ưu tiên của trường</CardTitle>
            <p className="mt-1 text-xs text-text-tertiary">
              Kết luận đầu tư và bước cần làm để tăng mức hợp tác
            </p>
          </div>
        </div>
        <Badge color={groupBadge[data.classification.group]}>
          {data.classification.group}
        </Badge>
      </CardHeader>

      <div className="grid min-w-0 divide-y divide-card-border lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:divide-x lg:divide-y-0">
        <div className="p-4 lg:p-5">
          <SchoolPriorityOutcome data={data} />
        </div>
        <div className="p-4 lg:p-5">
          <SchoolRelationshipStage data={data} />
        </div>
      </div>
    </Card>
  );
}
