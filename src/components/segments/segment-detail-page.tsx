"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { UserMultiple1 } from "@tailgrids/icons";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { useSegmentData } from "./segment-data-provider";
import { SegmentDetailHeader } from "./segment-detail-header";
import { SegmentDetailFilters } from "./segment-detail-filters";
import { SegmentStudentTable } from "./segment-student-table";
import { SegmentEditDialog } from "./segment-edit-dialog";
import {
  getMockSegmentStudents,
  MOCK_SEGMENT_OVERVIEWS,
  toSegmentStudent,
} from "./segment-detail-mock-data";
import { getMatchingStudents } from "./segment-filter-matching";
import type { SegmentStudent } from "./segment-detail-types";

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
  const [students, setStudents] = useState<SegmentStudent[]>(() =>
    getMockSegmentStudents(segmentId, segment?.size ?? 0),
  );
  const overview = MOCK_SEGMENT_OVERVIEWS[segmentId];

  const hasFilterConditions = Boolean(
    overview?.groups.some((group) => group.conditions.length > 0),
  );

  const handleAddMatchingStudents = () => {
    if (!overview) return;
    const matches = getMatchingStudents(overview.groups, overview.groupLogic);

    if (matches.length === 0) {
      toast.info("Không có học sinh nào khớp với bộ lọc.");
      return;
    }

    setStudents(matches.map(toSegmentStudent));
    setSegments((current) =>
      current.map((item) =>
        item.id === segmentId ? { ...item, size: matches.length } : item,
      ),
    );
    toast.success(`Đã thêm ${matches.length} học sinh khớp bộ lọc vào segment`);
  };

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
            { id: "next-action", label: "Hành động tiếp theo" },
            { id: "tasks", label: "Task" },
            { id: "activity-log", label: "Ghi chú nhật ký" },
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
        <TabPanel
          id="overview"
          className="scrollbar-thin flex min-h-0 min-w-0 flex-col gap-6 pt-5 outline-none lg:flex-1 lg:overflow-y-auto lg:overscroll-contain"
        >
          <SegmentDetailFilters overview={overview} />
          <section
            aria-label="Tổng quan học sinh trong segment"
            className="min-w-0 shrink-0"
          >
            <SegmentStudentTable
              key={segmentId}
              students={students}
              headerAction={
                <Button
                  size="sm"
                  appearance="outline"
                  isDisabled={!hasFilterConditions}
                  onPress={handleAddMatchingStudents}
                >
                  <UserMultiple1 size={16} aria-hidden="true" />
                  Thêm học sinh khớp bộ lọc
                </Button>
              }
            />
          </section>
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
