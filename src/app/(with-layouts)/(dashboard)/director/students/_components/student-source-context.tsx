import { MapMarker5, Shield1Check, Target3 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

export default function StudentSourceContext({ data }: Student360SectionProps) {
  const { acquisition, segmentation } = data;

  return (
    <Card className="mt-5 p-5">
      <CardHeader className="mb-5 items-start">
        <div><CardTitle>Nguồn và bối cảnh tiếp cận</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Nguồn gốc lead, giai đoạn học tập và phân tầng địa bàn dùng để chọn đúng cách chăm sóc.</p></div>
        <Badge color="success"><Shield1Check size={13} aria-hidden="true" />Quy gán hợp lệ</Badge>
      </CardHeader>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section aria-labelledby="student-source-heading" className="rounded-2xl bg-background-gray-primary p-4">
          <div className="flex items-center gap-2"><Target3 size={17} className="text-primary-500" aria-hidden="true" /><h3 id="student-source-heading" className="text-sm font-semibold text-text-primary">Nguồn và quy gán</h3></div>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><dt className="text-[11px] text-text-tertiary">Điểm chạm đầu tiên</dt><dd className="mt-1 text-sm font-semibold text-text-primary">{acquisition.firstTouch}</dd></div>
            <div><dt className="text-[11px] text-text-tertiary">Nhóm nguồn</dt><dd className="mt-1"><Badge color="primary">{acquisition.sourceGroup}</Badge></dd></div>
            <div><dt className="text-[11px] text-text-tertiary">Thời điểm ghi nhận</dt><dd className="mt-1 text-sm font-medium text-text-primary">{acquisition.capturedAt}</dd></div>
            <div className="sm:col-span-2"><dt className="text-[11px] text-text-tertiary">Chiến dịch / điểm thu</dt><dd className="mt-1 text-sm font-medium text-text-primary">{acquisition.campaign}</dd></div>
          </dl>
          <div className="mt-4 rounded-xl bg-card-background p-3"><p className="text-[11px] font-medium text-success-500">{acquisition.attributionModel}</p><p className="mt-1 text-xs leading-5 text-text-secondary">{acquisition.consent}</p></div>
        </section>

        <section aria-labelledby="student-segment-heading" className="rounded-2xl bg-background-gray-primary p-4">
          <div className="flex items-center gap-2"><MapMarker5 size={17} className="text-info-500" aria-hidden="true" /><h3 id="student-segment-heading" className="text-sm font-semibold text-text-primary">Bối cảnh phân tầng</h3></div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-card-background p-3"><dt className="text-[11px] text-text-tertiary">Giai đoạn học tập</dt><dd className="mt-1 text-sm font-semibold text-text-primary">{segmentation.learningStage}</dd><p className="mt-1 text-xs leading-5 text-text-secondary">{segmentation.approachGoal}</p></div>
            <div className="rounded-xl bg-card-background p-3"><dt className="text-[11px] text-text-tertiary">Phân tầng địa bàn</dt><dd className="mt-1 text-sm font-semibold text-text-primary">{segmentation.geographyTier}</dd><p className="mt-1 text-xs leading-5 text-text-secondary">{segmentation.geographyImplication}</p></div>
            <div className="rounded-xl bg-card-background p-3"><dt className="text-[11px] text-text-tertiary">Nhóm trường THPT</dt><dd className="mt-1 text-sm font-semibold text-text-primary">{segmentation.schoolTier}</dd></div>
            <div className="rounded-xl bg-badge-warning-background p-3"><dt className="text-[11px] text-badge-warning-text">Điều kiện kinh tế · tự nguyện chia sẻ</dt><dd className="mt-1 text-sm font-semibold text-text-primary">{segmentation.economicContext}</dd></div>
          </dl>
          <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-text-tertiary"><Shield1Check size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{segmentation.economicUsage}</p>
        </section>
      </div>
    </Card>
  );
}
