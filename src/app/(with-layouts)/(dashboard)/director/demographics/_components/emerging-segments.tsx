"use client";

import { ArrowRight, ArrowUpward } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { demographicSegments as defaultSegments } from "@/services/api/demographics/data";
import type { DemographicSegment } from "@/services/api/demographics/types";

interface EmergingSegmentsProps {
  segments?: DemographicSegment[];
  onOpenSegment: (segmentId: string) => void;
}

export default function EmergingSegments({
  segments = defaultSegments,
  onOpenSegment,
}: EmergingSegmentsProps) {
  return (
    <Card className="min-w-0 overflow-hidden bg-background-gray-primary p-0">
      <CardHeader className="border-b border-card-border p-5">
        <div>
          <CardTitle>Nhóm học sinh nên xem</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Xếp theo số lượng, tỷ lệ nhập học và tăng trưởng.</p>
        </div>
        <Badge color="success">
          <ArrowUpward size={13} aria-hidden="true" />
          {segments.length} nhóm nổi bật
        </Badge>
      </CardHeader>
      <div className="divide-y divide-card-border">
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="grid items-center gap-3 px-4 py-4 sm:grid-cols-[28px_minmax(220px,1fr)_88px_86px_78px_auto] sm:px-5"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-card-background text-xs font-semibold text-text-tertiary">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{segment.name}</p>
              <p className="mt-1 truncate text-xs text-text-tertiary">{segment.description}</p>
            </div>
            <Summary label="Số học sinh" value={segment.prospects != null ? segment.prospects.toLocaleString("vi-VN") : "-"} />
            <Summary label="Tỷ lệ nhập học" value={segment.conversion != null ? `${segment.conversion}%` : "-"} />
            <Summary
              label="Tăng trưởng tháng"
              value={segment.growth != null ? `+${segment.growth}%` : "-"}
              tone={(segment.growth ?? 0) >= 20 ? "text-success-500" : "text-text-primary"}
            />
            <Button size="xs" appearance="ghost" onPress={() => onOpenSegment(segment.id)}>
              Xem nhóm
              <ArrowRight size={14} aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Summary({ label, value, tone = "text-text-primary" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="hidden sm:block">
      <p className="text-[10px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-xs font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
