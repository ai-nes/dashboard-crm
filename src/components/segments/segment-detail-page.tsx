"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "react-aria-components";
import { toast } from "sonner";

import {
  useDeleteSegmentMutation,
  useSegmentDetailQuery,
  useSegmentFilterOptionsQuery,
  useSegmentPreviewQuery,
} from "@/hooks/use-segment-queries";

import SegmentAuditTab from "./segment-audit-tab";
import { SegmentDetailFilters } from "./segment-detail-filters";
import { SegmentDetailHeader } from "./segment-detail-header";
import { toSegmentStudent } from "./segment-detail-types";
import SegmentTasksTab from "./segment-tasks-tab";
import {
  buildSegmentFilterOptions,
  fromBackendSegmentFilters,
} from "./segment-filter-config";
import { toSegmentListItem } from "./segment-list-types";
import { SegmentStudentTable } from "./segment-student-table";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function SegmentDetailPage({
  segmentId,
  backHref,
  editHref,
}: {
  segmentId: string;
  backHref: string;
  editHref: string;
}) {
  const router = useRouter();
  const segmentQuery = useSegmentDetailQuery(segmentId);
  const previewQuery = useSegmentPreviewQuery(
    { segment: segmentId, pageLength: 100 },
    Boolean(segmentId),
  );
  const optionsQuery = useSegmentFilterOptionsQuery();
  const deleteMutation = useDeleteSegmentMutation();
  const segment = useMemo(
    () =>
      segmentQuery.data
        ? toSegmentListItem(segmentQuery.data, previewQuery.data?.total)
        : null,
    [segmentQuery.data, previewQuery.data?.total],
  );
  const filters = useMemo(
    () => fromBackendSegmentFilters(segmentQuery.data?.filters),
    [segmentQuery.data?.filters],
  );
  const students = (previewQuery.data?.students ?? []).map(toSegmentStudent);
  const filterOptions = useMemo(
    () => buildSegmentFilterOptions(optionsQuery.data),
    [optionsQuery.data],
  );

  if (segmentQuery.isLoading) {
    return (
      <main id="main-content" className="px-2 py-4 lg:px-6">
        <section className="rounded-2xl border border-card-border bg-card-background p-6 text-sm text-text-secondary">
          Đang tải segment từ Frappe CRM…
        </section>
      </main>
    );
  }

  if (segmentQuery.isError || !segment) {
    return (
      <main id="main-content" className="px-2 py-4 lg:px-6">
        <section className="rounded-2xl border border-card-border bg-card-background p-6">
          <h1 className="text-xl font-semibold text-text-primary">
            Không tìm thấy segment
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {errorMessage(
              segmentQuery.error,
              "Segment không tồn tại hoặc bạn không có quyền truy cập.",
            )}
          </p>
          <Link
            href={backHref}
            className="mt-4 inline-block text-sm text-primary-500 hover:underline"
          >
            Quay lại quản lý segments
          </Link>
        </section>
      </main>
    );
  }

  const handleDelete = () => {
    void deleteMutation
      .mutateAsync({ name: segment.id, expectedRevision: segment.revision })
      .then(() => {
        toast.success("Đã xóa segment");
        router.push(backHref);
      })
      .catch((error) => {
        toast.error(errorMessage(error, "Không thể xóa segment."));
      });
  };

  return (
    <main
      id="main-content"
      className="flex min-h-0 min-w-0 flex-col gap-2 px-2 py-4 lg:h-full lg:overflow-hidden lg:px-6"
    >
      <SegmentDetailHeader
        segment={segment}
        createdAt={segment.createdAt}
        backHref={backHref}
        onEdit={() =>
          router.push(
            `${editHref.replace(/\/$/, "")}/${encodeURIComponent(segment.segmentCode)}`,
          )
        }
        onDelete={handleDelete}
      />
      <Tabs
        defaultSelectedKey="overview"
        className="flex min-h-0 flex-col lg:flex-1"
      >
        <TabList
          aria-label="Chi tiết segment"
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-card-border px-1 sm:px-2"
        >
          {[
            { id: "overview", label: "Tổng quan" },
            { id: "next-action", label: "Hành động tiếp theo" },
            { id: "tasks", label: "Task" },
            { id: "activity-log", label: "Ghi chú nhật ký" },
          ].map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              isDisabled={tab.id === "next-action"}
              className="shrink-0 cursor-pointer border-b-2 border-transparent px-4 py-3.5 text-sm font-medium text-text-secondary outline-none data-[selected]:border-primary-500 data-[selected]:text-primary-500 data-[disabled]:cursor-default data-[disabled]:text-text-tertiary data-[disabled]:opacity-60 data-[focus-visible]:outline-2 data-[focus-visible]:outline-primary-500"
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="min-h-0 min-w-0 lg:flex-1">
          <TabPanel
            id="overview"
            className="scrollbar-thin flex min-h-0 min-w-0 flex-col gap-6 pt-5 outline-none lg:h-full lg:overflow-y-auto lg:overscroll-contain"
          >
            <SegmentDetailFilters
              overview={{
                createdAt: segment.createdAt,
                groupLogic: filters.logic,
                groups: filters.groups,
              }}
              options={filterOptions}
            />
            <section
              aria-label="Tổng quan học sinh trong segment"
              className="min-w-0 shrink-0"
            >
              <SegmentStudentTable
                students={students}
                isLoading={previewQuery.isLoading}
                error={previewQuery.error?.message}
              />
            </section>
          </TabPanel>
          <TabPanel
            id="tasks"
            className="scrollbar-thin min-h-0 min-w-0 overflow-y-auto pt-5 outline-none lg:h-full lg:overscroll-contain"
          >
            <SegmentTasksTab segmentId={segment.id} segmentName={segment.name} />
          </TabPanel>
          <TabPanel
            id="activity-log"
            className="scrollbar-thin min-h-0 min-w-0 overflow-y-auto pt-5 outline-none lg:h-full lg:overscroll-contain"
          >
            <SegmentAuditTab segmentId={segment.id} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
}
