import { CheckCircle1, InfoTriangle } from "@tailgrids/icons";

import type { Student360SectionProps } from "./types";

export default function StudentPriorityReasons({ data }: Student360SectionProps) {
  const dimensions = data.classification.dimensions;
  const interest = dimensions.find((dimension) => dimension.id === "interest");
  const fit = dimensions.find((dimension) => dimension.id === "fit");
  const barrier = dimensions.find((dimension) => dimension.id === "barrier");
  const reasons = [
    { label: "Tín hiệu", value: interest?.evidence[0] ?? "Có tín hiệu tương tác gần đây", tone: "success" as const },
    { label: "Mức độ phù hợp", value: fit?.evidence[0] ?? "Ngành đang được quan tâm", tone: "success" as const },
    { label: "Điểm cần gỡ", value: barrier ? `Rào cản chính: ${barrier.value}` : "Cần xác minh thêm điều kiện quyết định", tone: "warning" as const },
  ];

  return (
    <section className="bg-card-background px-5 py-4 lg:px-6" aria-labelledby="priority-reasons-heading">
      <h3 id="priority-reasons-heading" className="text-lg font-semibold text-text-primary">Vì sao ưu tiên xử lý lúc này?</h3>
      <p className="mt-1 text-xs leading-5 text-text-tertiary">Ba tín hiệu ngắn gọn giải thích thứ tự ưu tiên hiện tại.</p>
      <ol className="mt-4 grid gap-3">
        {reasons.map((reason) => <li key={reason.label} className="flex min-w-0 items-start gap-2.5"><span className="mt-0.5 shrink-0">{reason.tone === "warning" ? <InfoTriangle size={15} className="text-warning-500" aria-hidden="true" /> : <CheckCircle1 size={15} className="text-success-500" aria-hidden="true" />}</span><div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"><p className="shrink-0 text-xs font-medium text-text-primary sm:w-36">{reason.label}</p><p className="min-w-0 text-xs leading-5 text-text-secondary">{reason.value}</p></div></li>)}
      </ol>
    </section>
  );
}
