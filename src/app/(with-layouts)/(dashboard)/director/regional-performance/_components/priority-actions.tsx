"use client";

import { memo } from "react";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { priorityActions } from "./data";
import type { RegionPerformance } from "./types";

function PriorityActions({ province }: { province: RegionPerformance }) {
  const actions = priorityActions.filter(
    (action) =>
      action.provinceId === province.id || action.provinceId === "all",
  );
  return (
    <Card className="p-5">
      <CardHeader className="mb-4">
        <div>
          <CardTitle>Hành động ưu tiên</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">
            {province.name} · sắp theo mức độ ưu tiên điều hành.
          </p>
        </div>
      </CardHeader>
      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <li key={action.id} className="rounded-lg bg-background-soft-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-text-primary">
                {action.title}
              </p>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${action.tone === "critical" ? "bg-badge-error-background text-badge-error-text" : action.tone === "watch" ? "bg-badge-warning-background text-badge-warning-text" : "bg-badge-success-background text-badge-success-text"}`}
              >
                {action.priority}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-text-tertiary">
              {action.detail}
            </p>
          </li>
        ))}
        {actions.length === 0 && (
          <li className="py-6 text-sm text-text-secondary">
            Chưa có việc cần xử lý gấp ở tỉnh này.
          </li>
        )}
      </ol>
    </Card>
  );
}

export default memo(PriorityActions);
