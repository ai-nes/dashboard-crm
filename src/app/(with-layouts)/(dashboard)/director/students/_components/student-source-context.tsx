import { MapMarker5, Shield1Check, Target3 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDateTime } from "@/utils/format-date";

import type { Student360SectionProps } from "./types";

export default function StudentSourceContext({ data }: Student360SectionProps) {
  const { acquisition, segmentation } = data;

  return (
    <Card className="mt-5 p-5">
      <CardHeader className="mb-4 items-start">
        <CardTitle>Học sinh đến từ đâu</CardTitle>
        <Badge color="success"><Shield1Check size={13} aria-hidden="true" />Nguồn rõ</Badge>
      </CardHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-badge-sky-background p-4" aria-labelledby="student-source-heading">
          <div className="flex items-center gap-2"><Target3 size={17} className="text-primary-500" aria-hidden="true" /><h3 id="student-source-heading" className="text-sm font-semibold text-text-primary">Kênh và thời điểm tiếp cận</h3></div>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <SourceItem label="Lần đầu biết đến trường" value={acquisition.firstTouch} />
            <SourceItem label="Nhóm nguồn" value={acquisition.sourceGroup} />
            <SourceItem label="Ghi nhận" value={formatDateTime(acquisition.capturedAt)} />
            <SourceItem label="Chiến dịch" value={acquisition.campaign} />
          </dl>
        </section>

        <section className="rounded-xl bg-badge-primary-background p-4" aria-labelledby="student-segment-heading">
          <div className="flex items-center gap-2"><MapMarker5 size={17} className="text-info-500" aria-hidden="true" /><h3 id="student-segment-heading" className="text-sm font-semibold text-text-primary">Nhóm đối tượng</h3></div>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <SourceItem label="Giai đoạn" value={segmentation.learningStage} />
            <SourceItem label="Mục tiêu tiếp cận" value={segmentation.approachGoal} />
            <SourceItem label="Địa bàn" value={segmentation.geographyTier} />
            <SourceItem label="Nhóm trường" value={segmentation.schoolTier} />
            <SourceItem label="Điều kiện kinh tế" value={segmentation.economicContext} />
          </dl>
        </section>
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-text-tertiary"><Shield1Check size={14} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" />Đồng ý liên hệ: {acquisition.consent || "-"}</p>
    </Card>
  );
}

function SourceItem({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-[11px] text-text-tertiary">{label}</dt><dd className="mt-1 text-sm font-medium text-text-primary" title={value || "-"}>{value || "-"}</dd></div>;
}
