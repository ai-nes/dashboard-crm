"use client";

import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useInteractionFeedQuery } from "@/hooks/use-interaction-intelligence-queries";
import { formatDateTime } from "@/utils/format-date";
import {
  getChannelLabel,
  getDirectionLabel,
  getInteractionActivityTitle,
} from "./student-interaction-utils";

interface Props {
  studentId: string;
  canReadInteractions: boolean;
}

export default function StudentOverviewInteractions({
  studentId,
  canReadInteractions,
}: Props) {
  const query = useInteractionFeedQuery(
    studentId,
    { limit: 3 },
    canReadInteractions,
  );
  if (!canReadInteractions) return null;
  const items =
    query.data?.pages.flatMap((page) => page.items).slice(0, 3) ?? [];
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <h2 className="text-base font-semibold text-text-primary">
        Tương tác gần đây
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Ba hoạt động gần nhất trên các kênh liên hệ.
      </p>
      {query.isPending && !items.length ? (
        <div aria-label="Đang tải tương tác" className="mt-5 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items.length ? (
        <ul className="mt-5 divide-y divide-card-border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <p className="break-words text-sm font-medium text-text-primary">
                  {getInteractionActivityTitle(item)}
                </p>
                {item.summary?.trim() && (
                  <p className="break-words text-sm leading-6 text-text-secondary">
                    {item.summary}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {item.channel && (
                    <Badge color="gray" size="sm">
                      {getChannelLabel(item.channel)}
                    </Badge>
                  )}
                  {item.direction && (
                    <span className="text-xs text-text-secondary">
                      {getDirectionLabel(item.direction)}
                    </span>
                  )}
                </div>
              </div>
              {item.occurred_at && (
                <time
                  dateTime={item.occurred_at}
                  className="text-xs text-text-secondary"
                >
                  {formatDateTime(item.occurred_at)}
                </time>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-text-secondary">
          {query.isError
            ? "Chưa tải được tương tác gần đây."
            : "Chưa có tương tác được ghi nhận."}
        </p>
      )}
      {query.isError && items.length > 0 && (
        <p className="mt-4 text-sm text-text-secondary">
          Chưa cập nhật được tương tác mới nhất.
        </p>
      )}
    </Card>
  );
}
