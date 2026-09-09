"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useSegmentByCodeQuery } from "@/hooks/use-segment-queries";

import SegmentBuilderPage, { defaultCategory } from "./segment-builder-page";
import { fromBackendSegmentFilters } from "./segment-filter-config";
import {
  SEGMENT_STATUS_LABELS,
  toSegmentListItem,
  type SegmentStatus,
} from "./segment-list-types";
import type { SegmentCreateDetails } from "./segment-create-dialog";

const EDITABLE_CATEGORIES: SegmentCreateDetails["category"][] = [
  "admission_stage",
  "potential",
  "intent",
  "need",
];

function getSegmentCategory(
  category: string | undefined,
  groups: ReturnType<typeof fromBackendSegmentFilters>["groups"],
): SegmentCreateDetails["category"] {
  return EDITABLE_CATEGORIES.includes(
    category as SegmentCreateDetails["category"],
  )
    ? (category as SegmentCreateDetails["category"])
    : defaultCategory(groups);
}

function getEditableStatus(status: SegmentStatus): "draft" | "active" {
  return status === "active" ? "active" : "draft";
}

export default function SegmentEditPage({
  segmentCode,
  backHref,
}: {
  segmentCode: string;
  backHref: string;
}) {
  const segmentQuery = useSegmentByCodeQuery(segmentCode);
  const segment = useMemo(
    () => (segmentQuery.data ? toSegmentListItem(segmentQuery.data) : null),
    [segmentQuery.data],
  );
  const filters = useMemo(
    () => fromBackendSegmentFilters(segmentQuery.data?.filters),
    [segmentQuery.data?.filters],
  );

  if (segmentQuery.isLoading) {
    return (
      <main className="flex h-full min-h-0 items-center justify-center bg-card-background px-6">
        <p className="text-sm text-text-secondary">Đang tải segment…</p>
      </main>
    );
  }

  if (segmentQuery.isError || !segment) {
    return (
      <main className="flex h-full min-h-0 items-center justify-center bg-card-background px-6">
        <section className="w-full max-w-md rounded-2xl border border-card-border bg-card-surface-area p-6 text-center">
          <h1 className="text-xl font-semibold text-text-primary">
            Không thể tải segment
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {segmentQuery.error instanceof Error
              ? segmentQuery.error.message
              : "Segment không tồn tại hoặc bạn không có quyền truy cập."}
          </p>
          <Link
            href={backHref}
            className="mt-5 inline-flex rounded-lg border border-card-border px-3.5 py-2 text-sm font-medium text-text-primary hover:bg-background-gray-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Quay lại quản lý segments
          </Link>
        </section>
      </main>
    );
  }

  return (
    <SegmentBuilderPage
      key={`${segment.id}-${segment.revision}`}
      backHref={backHref}
      managementHref={backHref}
      initialSegmentName={segment.name}
      initialGroups={filters.groups}
      initialLogic={filters.logic}
      initialPurpose={segment.description}
      initialCategory={getSegmentCategory(segment.category, filters.groups)}
      mode="edit"
      segmentId={segment.id}
      expectedRevision={segment.revision}
      initialStatus={getEditableStatus(segment.status)}
      currentStatus={segment.status}
      statusLabel={SEGMENT_STATUS_LABELS[segment.status]}
    />
  );
}
