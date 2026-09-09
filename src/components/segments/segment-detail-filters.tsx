import { Fragment } from "react";

import {
  conditionValueLabel,
  getOperatorLabel,
  STUDENT_SEGMENT_PROPERTY_LABEL,
  type SegmentFilterOptions,
  type SegmentCondition,
} from "./segment-filter-config";
import type { SegmentOverviewData } from "./segment-detail-types";

function conditionPropertyLabel(condition: SegmentCondition): string {
  return STUDENT_SEGMENT_PROPERTY_LABEL[condition.property];
}

export function SegmentDetailFilters({
  overview,
  options,
}: {
  overview: SegmentOverviewData;
  options?: SegmentFilterOptions;
}) {
  return (
    <section
      aria-labelledby="segment-filters-heading"
      className="flex min-w-0 shrink-0 flex-col gap-3"
    >
      <h2
        id="segment-filters-heading"
        className="text-base font-semibold text-text-primary"
      >
        Bộ lọc
      </h2>
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
        {overview.groups.length === 0 && (
          <p className="text-sm text-text-tertiary">Segment chưa có bộ lọc.</p>
        )}
        {overview.groups.map((group, index) => (
          <Fragment key={group.id}>
            {index > 0 && (
              <div
                className="flex shrink-0 items-center gap-2 sm:pt-6"
                aria-label="Điều kiện nối nhóm"
              >
                <span aria-hidden="true" className="h-px w-4 bg-card-border" />
                <span className="text-xs font-semibold text-text-tertiary">
                  HOẶC
                </span>
                <span aria-hidden="true" className="h-px w-4 bg-card-border" />
              </div>
            )}
            <section className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:max-w-full">
              <h3 className="text-xs font-medium text-text-tertiary">
                {group.name}
              </h3>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {group.conditions.map((condition, conditionIndex) => (
                  <Fragment key={condition.id}>
                    {conditionIndex > 0 && (
                      <span className="shrink-0 px-1 text-[11px] font-semibold text-text-tertiary">
                        VÀ
                      </span>
                    )}
                    <p className="min-w-0 rounded-lg bg-background-gray-secondary px-3 py-2 text-sm leading-6 break-words text-text-secondary">
                      <strong className="font-semibold text-text-primary">
                        {conditionPropertyLabel(condition)}
                      </strong>{" "}
                      {getOperatorLabel(
                        condition.property,
                        condition.operator,
                      ).toLocaleLowerCase("vi-VN")}{" "}
                      <strong className="font-semibold text-text-primary">
                        {conditionValueLabel(condition, options)}
                      </strong>
                    </p>
                  </Fragment>
                ))}
              </div>
            </section>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
