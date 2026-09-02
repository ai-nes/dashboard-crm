import { Target3 } from "@tailgrids/icons";

import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import {
  POTENTIAL_THRESHOLD,
  RELATIONSHIP_THRESHOLD,
} from "@/services/api/schools/classification";

interface SchoolPriorityOutcomeProps {
  data: SchoolIntelligenceData;
}

export default function SchoolPriorityOutcome({
  data,
}: SchoolPriorityOutcomeProps) {
  const potentialGap = data.potentialScore - POTENTIAL_THRESHOLD;
  const relationshipGap = data.relationship.score - RELATIONSHIP_THRESHOLD;
  const conclusion = getPriorityConclusion(potentialGap, relationshipGap);

  return (
    <section className="min-w-0" aria-labelledby="school-priority-conclusion">
      <div className="flex items-start gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-badge-primary-background text-badge-primary-text"
          aria-hidden="true"
        >
          <Target3 size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-tertiary">
            Kết luận ưu tiên
          </p>
          <h3
            id="school-priority-conclusion"
            className="mt-1 text-xl font-semibold leading-7 text-text-primary text-pretty"
          >
            {conclusion.title}
          </h3>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary text-pretty">
        {conclusion.detail}
      </p>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <ScoreSignal
          label="Tiềm năng tuyển sinh"
          score={data.potentialScore}
          gap={potentialGap}
          reached={potentialGap >= 0}
          reachedCopy="Vượt mốc"
          pendingCopy="Thiếu so với mốc"
        />
        <ScoreSignal
          label="Quan hệ với trường"
          score={data.relationship.score}
          gap={relationshipGap}
          reached={relationshipGap >= 0}
          reachedCopy={relationshipGap === 0 ? "Vừa đạt mốc" : "Vượt mốc"}
          pendingCopy="Cần củng cố"
          primary={relationshipGap === 0}
        />
      </dl>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-card-border pt-4 text-xs text-text-secondary">
        <span>
          <strong className="font-semibold text-text-primary">
            {data.availableStudents.toLocaleString("vi-VN")} HS
          </strong>{" "}
          phù hợp để tư vấn
        </span>
        <span>
          <strong className="font-semibold text-text-primary">
            {data.grade12Students.toLocaleString("vi-VN")} HS
          </strong>{" "}
          khối 12
        </span>
      </div>
    </section>
  );
}

function ScoreSignal({
  label,
  score,
  gap,
  reached,
  reachedCopy,
  pendingCopy,
  primary = false,
}: {
  label: string;
  score: number;
  gap: number;
  reached: boolean;
  reachedCopy: string;
  pendingCopy: string;
  primary?: boolean;
}) {
  const value = `${gap > 0 ? "+" : ""}${gap} điểm`;
  const toneClass =
    reached && !primary
      ? "bg-badge-success-background text-success-500"
      : primary
        ? "bg-badge-primary-background text-badge-primary-text"
        : "bg-badge-warning-background text-warning-500";

  return (
    <div className="rounded-xl bg-background-soft-50 p-3.5">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="mt-2 flex items-baseline justify-between gap-3">
        <span className="text-lg font-semibold text-text-primary">
          {score}/100
        </span>
        <span className={"text-sm font-semibold " + toneClass}>{value}</span>
      </dd>
      <p className="mt-1 text-xs text-text-secondary">
        {reached ? reachedCopy : pendingCopy}
      </p>
    </div>
  );
}

function getPriorityConclusion(potentialGap: number, relationshipGap: number) {
  if (potentialGap >= 0 && relationshipGap <= 0) {
    return {
      title: "Đáng đầu tư, nhưng cần củng cố quan hệ",
      detail: `Tiềm năng tuyển sinh đã vượt mốc ${Math.abs(potentialGap)} điểm. Quan hệ với trường chỉ ${relationshipGap === 0 ? "vừa chạm mốc" : "chưa đạt mốc"}, nên cần giữ đầu mối và tăng hoạt động trước khi mở rộng đầu tư.`,
    };
  }

  if (potentialGap >= 0 && relationshipGap > 0) {
    return {
      title: "Có thể tăng đầu tư tuyển sinh",
      detail:
        "Tiềm năng và quan hệ đều vượt mốc. Ưu tiên chuyển lợi thế này thành các hoạt động tiếp cận học sinh cụ thể.",
    };
  }

  return {
    title: "Cần kiểm chứng trước khi tăng đầu tư",
    detail:
      "Các điều kiện ưu tiên chưa đồng thời đạt mốc. Tập trung cải thiện tín hiệu còn thiếu trước khi mở rộng hoạt động tuyển sinh.",
  };
}
