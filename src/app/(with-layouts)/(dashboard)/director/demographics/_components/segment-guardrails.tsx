import { InfoTriangle, Shield1Check } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { defaultGuardrails } from "@/services/api/demographics/data";
import type { SegmentGuardrail } from "@/services/api/demographics/types";

interface SegmentGuardrailsProps {
  guardrails?: SegmentGuardrail[];
}

export default function SegmentGuardrails({ guardrails = defaultGuardrails }: SegmentGuardrailsProps) {
  return (
    <Card className="min-w-0 overflow-hidden bg-background-gray-primary p-0">
      <CardHeader className="border-b border-card-border p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Giới hạn dữ liệu phân tích</CardTitle>
            <Badge color="success">
              <Shield1Check size={13} aria-hidden="true" />
              Tối thiểu 30 học sinh
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Một số tiêu chí không dùng để tránh suy luận sai.
          </p>
        </div>
      </CardHeader>
      <div className="hidden border-b border-card-border bg-background-gray-primary px-5 py-2 text-[10px] font-semibold tracking-wide text-text-tertiary uppercase md:grid md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_90px] md:gap-2">
        <span>Tiêu chí</span>
        <span>Không dùng vì</span>
        <span>Dùng thay thế</span>
        <span className="md:text-right">Trạng thái</span>
      </div>
      <div className="divide-y divide-card-border">
        {guardrails.map((item) => (
          <div
            key={item.criterion}
            className="grid gap-2 px-5 py-4 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_90px] md:items-center"
          >
            <p className="text-sm font-semibold text-text-primary">{item.criterion}</p>
            <p className="text-xs leading-5 text-text-secondary">{item.issue}</p>
            <p className="text-xs leading-5 text-text-tertiary">{item.replacement}</p>
            <div className="md:text-right">
              <Badge color={item.tone}>{item.status}</Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 border-t border-card-border bg-card-background px-5 py-3 text-xs leading-5 text-text-tertiary">
        <InfoTriangle size={15} className="mt-0.5 shrink-0 text-warning-500" aria-hidden="true" />
        Tiêu chí bị giới hạn vẫn có cách phân tích thay thế.
      </div>
    </Card>
  );
}
