import { Fragment } from "react";
import {
  conditionValueLabel,
  SEGMENT_OPERATOR_LABEL,
  STUDENT_SEGMENT_PROPERTY_LABEL,
} from "./segment-filter-config";
import type { SegmentOverviewData } from "./segment-detail-types";

export function SegmentDetailFilters({
  overview,
}: {
  overview: SegmentOverviewData;
}) {
  return (
    <aside
      aria-labelledby="segment-filters-heading"
      className="flex max-h-[60dvh] min-h-0 flex-col overflow-hidden rounded-2xl border border-card-border bg-card-background p-5 shadow-xs lg:max-h-none"
    >
      <h2
        id="segment-filters-heading"
        className="mb-5 shrink-0 text-base font-semibold text-text-primary"
      >
        Bộ lọc
      </h2>
      <div className="scrollbar-thin min-h-0 overflow-y-auto overscroll-contain">
        {overview.groups.length === 0 && (
          <p className="text-sm text-text-tertiary">Segment chưa có bộ lọc.</p>
        )}
        {overview.groups.map((group, index) => (
          <Fragment key={group.id}>
            {index > 0 && (
              <div
                className="ml-6 flex w-fit flex-col items-center"
                aria-label="Điều kiện nối nhóm"
              >
                <span className="h-4 w-px bg-card-border" />
                <span className="rounded-lg border border-card-border bg-card-background px-3 py-1.5 text-xs font-semibold text-text-secondary">
                  {overview.groupLogic === "AND" ? "VÀ" : "HOẶC"}
                </span>
                <span className="h-4 w-px bg-card-border" />
              </div>
            )}
            <section className="rounded-xl border border-card-border p-3.5">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                {group.name}
              </h3>
              {group.conditions.map((condition, conditionIndex) => (
                <Fragment key={condition.id}>
                  {conditionIndex > 0 && (
                    <p className="my-2 px-2 text-[11px] font-semibold text-text-tertiary">
                      {group.logic === "AND" ? "VÀ" : "HOẶC"}
                    </p>
                  )}
                  <p className="rounded-lg bg-background-gray-secondary px-3 py-2.5 text-sm leading-6 text-text-secondary">
                    <strong className="font-semibold text-text-primary">
                      {STUDENT_SEGMENT_PROPERTY_LABEL[condition.property]}
                    </strong>{" "}
                    {SEGMENT_OPERATOR_LABEL[
                      condition.operator
                    ].toLocaleLowerCase("vi-VN")}{" "}
                    <strong className="font-semibold text-text-primary">
                      {conditionValueLabel(condition)}
                    </strong>
                  </p>
                </Fragment>
              ))}
            </section>
          </Fragment>
        ))}
      </div>
    </aside>
  );
}
