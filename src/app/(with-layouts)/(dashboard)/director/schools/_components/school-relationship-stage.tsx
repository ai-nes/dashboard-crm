import { ArrowRight, User2 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type {
  SchoolIntelligenceData,
  SchoolRelationshipLevel,
} from "@/services/api/schools/types";

interface SchoolRelationshipStageProps {
  data: SchoolIntelligenceData;
}

const relationshipSteps: SchoolRelationshipLevel[] = [
  "Chưa tiếp xúc",
  "Đã tiếp xúc",
  "Có đầu mối",
  "Hợp tác thường xuyên",
  "Đối tác chiến lược",
];

export default function SchoolRelationshipStage({
  data,
}: SchoolRelationshipStageProps) {
  const currentIndex = relationshipSteps.indexOf(data.relationship.level);
  const nextStep = relationshipSteps[currentIndex + 1];
  const hasContact = Boolean(
    data.relationship.contact && data.relationship.contact !== "-",
  );

  return (
    <section className="min-w-0" aria-labelledby="school-relationship-stage">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-text-tertiary">
            Hành trình hợp tác
          </p>
          <h3
            id="school-relationship-stage"
            className="mt-0.5 text-lg font-semibold leading-6 text-text-primary"
          >
            {data.relationship.level}
          </h3>
        </div>
        <Badge
          color={
            currentIndex >= 3
              ? "success"
              : currentIndex >= 1
                ? "primary"
                : "warning"
          }
        >
          {data.relationship.score}/100
        </Badge>
      </div>

      <ol
        className="mt-4 flex items-start"
        aria-label={`Mức quan hệ hiện tại: ${data.relationship.level}`}
      >
        {relationshipSteps.map((step, index) => (
          <li key={step} className="min-w-0 flex-1">
            <span
              className={
                "block h-2 rounded-full " +
                (index <= currentIndex
                  ? "bg-primary-500"
                  : "bg-background-soft-200")
              }
              aria-hidden="true"
            />
            <span
              className={
                "mt-2 block pr-1 text-[11px] leading-4 " +
                (index === currentIndex
                  ? "font-semibold text-text-primary"
                  : "text-text-tertiary")
              }
            >
              {index === 0 ||
              index === currentIndex ||
              index === relationshipSteps.length - 1
                ? step
                : ""}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-3 border-t border-card-border pt-3 sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <User2
            size={16}
            className="mt-0.5 shrink-0 text-icon-tertiary"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-xs text-text-tertiary">Đầu mối hiện tại</p>
            <p
              className="mt-0.5 truncate text-sm font-semibold text-text-primary"
              title={data.relationship.contact}
            >
              {hasContact ? data.relationship.contact : "Chưa có đầu mối"}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2.5">
          <ArrowRight
            size={16}
            className="mt-0.5 shrink-0 text-primary-500"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-xs text-text-tertiary">Bước hợp tác tiếp theo</p>
            <p className="mt-0.5 text-sm font-semibold leading-5 text-text-primary">
              {nextStep
                ? `Tiến tới ${nextStep.toLocaleLowerCase("vi-VN")}`
                : "Duy trì quan hệ đối tác"}
            </p>
            <p className="sr-only">
              {data.relationship.nextTouch ||
                "Chốt lịch làm việc tiếp theo với trường."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
