"use client";

import { ArrowRight, Bolt1, CheckCircle1 } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface AiSchoolInsightProps {
  data: SchoolIntelligenceData;
}

export default function AiSchoolInsight({ data }: AiSchoolInsightProps) {
  return (
    <Card className="flex min-w-0 flex-col border-violet-200/70 bg-badge-violet-background/20 p-5">
      <CardHeader className="mb-4">
        <div className="flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-lg bg-badge-primary-background text-badge-primary-text"
            aria-hidden="true"
          >
            <Bolt1 size={17} />
          </span>
          <CardTitle>Phân tích AI cho trường</CardTitle>
        </div>
        <Badge color="success">Ưu tiên cao</Badge>
      </CardHeader>

      <p className="text-sm leading-6 text-text-secondary">
        {data.insight.summary}
      </p>

      <div className="my-4 rounded-xl border border-violet-200/70 bg-card-background p-4 shadow-xs">
        <p className="text-xs font-medium text-badge-violet-text">
          Khuyến nghị trọng tâm
        </p>
        <p className="mt-1 text-base font-semibold leading-6 text-text-primary">
          {data.insight.recommendation}
        </p>
      </div>

      <ul className="space-y-3" aria-label="Bằng chứng AI phân tích">
        {data.insight.evidence.map((evidence) => (
          <li
            key={evidence}
            className="flex gap-2 text-sm leading-5 text-text-secondary"
          >
            <CheckCircle1
              size={16}
              className="mt-0.5 shrink-0 text-success-500"
              aria-hidden="true"
            />
            {evidence}
          </li>
        ))}
      </ul>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-violet-200/70 pt-4 text-center">
        <InsightStat label="Tác động" value="Cao" tone="text-success-500" />
        <InsightStat
          label="Tin cậy"
          value={`${Math.min(96, data.potentialScore + 2)}%`}
          tone="text-primary-500"
        />
        <InsightStat label="Chi phí" value="Vừa" tone="text-warning-500" />
      </div>

      <Button
        className="mt-5 w-full"
        onPress={() =>
          toast.success("Đã tạo bản nháp kế hoạch hoạt động cho trường.")
        }
      >
        Tạo kế hoạch hoạt động
        <ArrowRight size={16} />
      </Button>
    </Card>
  );
}

function InsightStat({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
