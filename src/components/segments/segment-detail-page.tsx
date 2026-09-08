"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { toast } from "sonner";
import { useSegmentData } from "./segment-data-provider";
import { SegmentDetailHeader } from "./segment-detail-header";
import { SegmentDetailFilters } from "./segment-detail-filters";
import { SegmentStudentTable } from "./segment-student-table";
import { SegmentEditDialog } from "./segment-edit-dialog";
import {
  getMockSegmentStudents,
  MOCK_SEGMENT_OVERVIEWS,
} from "./segment-detail-mock-data";

export function SegmentDetailPage({
  segmentId,
  backHref,
}: {
  segmentId: string;
  backHref: string;
}) {
  const router = useRouter();
  const { segments, setSegments } = useSegmentData();
  const segment = segments.find((item) => item.id === segmentId);
  const [isEditing, setIsEditing] = useState(false);
  const students = useMemo(
    () => getMockSegmentStudents(segmentId, segment?.size ?? 0),
    [segmentId, segment?.size],
  );
  const overview = MOCK_SEGMENT_OVERVIEWS[segmentId];

  if (!segment || !overview)
    return (
      <main id="main-content" className="px-2 py-4 lg:px-6">
        <section className="rounded-2xl border border-card-border bg-card-background p-6">
          <h1 className="text-xl font-semibold text-text-primary">
            Không tìm thấy segment
          </h1>
          <Link
            href={backHref}
            className="mt-4 inline-block text-sm text-primary-500 hover:underline"
          >
            Quay lại quản lý segments
          </Link>
        </section>
      </main>
    );

  return (
    <main
      id="main-content"
      className="flex min-h-0 min-w-0 flex-col gap-2 px-2 py-4 lg:h-full lg:overflow-hidden lg:px-6"
    >
      <SegmentDetailHeader
        segment={segment}
        createdAt={overview.createdAt}
        backHref={backHref}
        onEdit={() => setIsEditing(true)}
        onDelete={() => {
          setSegments((current) =>
            current.filter((item) => item.id !== segmentId),
          );
          toast.success("Đã xóa segment", {
            action: {
              label: "Hoàn tác",
              onClick: () =>
                setSegments((current) =>
                  current.some((item) => item.id === segmentId)
                    ? current
                    : [...current, segment],
                ),
            },
          });
          router.push(backHref);
        }}
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
            { id: "performance", label: "Hiệu quả" },
            { id: "activity", label: "Hoạt động" },
            { id: "settings", label: "Cài đặt" },
          ].map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              isDisabled={tab.id !== "overview"}
              className="shrink-0 cursor-pointer border-b-2 border-transparent px-4 py-3.5 text-sm font-medium text-text-secondary outline-none data-[selected]:border-primary-500 data-[selected]:text-primary-500 data-[disabled]:cursor-default data-[disabled]:text-text-tertiary data-[disabled]:opacity-60 data-[focus-visible]:outline-2 data-[focus-visible]:outline-primary-500"
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanel id="overview" className="min-h-0 pt-5 outline-none lg:flex-1">
          <div className="grid items-stretch gap-5 lg:h-full lg:min-h-0 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]">
            <SegmentDetailFilters overview={overview} />
            <section
              aria-label="Tổng quan học sinh trong segment"
              className="scrollbar-thin flex h-[85dvh] min-h-0 min-w-0 flex-col overflow-y-auto overscroll-contain rounded-2xl border border-card-border bg-card-background p-4 shadow-xs sm:p-5 lg:h-full"
            >
              <SegmentStudentTable key={segmentId} students={students} />
            </section>
          </div>
        </TabPanel>
      </Tabs>
      {isEditing && (
        <SegmentEditDialog
          segment={segment}
          onClose={() => setIsEditing(false)}
          onSave={(updated) => {
            setSegments((current) =>
              current.map((item) => (item.id === segmentId ? updated : item)),
            );
            setIsEditing(false);
            toast.success("Đã cập nhật segment");
          }}
        />
      )}
    </main>
  );
}
