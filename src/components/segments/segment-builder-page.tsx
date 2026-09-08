"use client";

import { Filter, Pencil1 } from "@tailgrids/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";

import { SegmentFilterBuilder } from "./segment-filter-builder";
import {
  isConditionComplete,
  type SegmentFilterGroup,
} from "./segment-filter-config";
import { SegmentCreateDialog } from "./segment-create-dialog";
import { estimateSegmentSize } from "./segment-filter-matching";
import { SegmentFilterPreview } from "./segment-filter-preview";

const DEFAULT_SEGMENT_NAME = "Segment chưa đặt tên · 08/09/2026 04:24:15";

export default function SegmentBuilderPage({ backHref }: { backHref: string }) {
  const router = useRouter();
  const [segmentName, setSegmentName] = useState(DEFAULT_SEGMENT_NAME);
  const [draftName, setDraftName] = useState(DEFAULT_SEGMENT_NAME);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groups, setGroups] = useState<SegmentFilterGroup[]>([]);
  const [groupLogic, setGroupLogic] = useState<"AND" | "OR">("OR");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const previewReady =
    groups.length > 0 &&
    groups.every(
      (group) =>
        group.conditions.length > 0 &&
        group.conditions.every(isConditionComplete),
    );
  const studentSize = estimateSegmentSize(groups, groupLogic);

  const startEditingName = () => {
    setDraftName(segmentName);
    setIsEditingName(true);
  };

  const saveName = () => {
    const nextName = draftName.trim();
    if (nextName) setSegmentName(nextName);
    setIsEditingName(false);
  };

  const cancelEditingName = () => {
    setDraftName(segmentName);
    setIsEditingName(false);
  };

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-card-background text-text-primary">
      <header className="relative flex h-[72px] shrink-0 items-center justify-between border-b border-card-border bg-card-surface-area px-2 text-text-primary sm:px-4">
        <Button
          variant="primary"
          appearance="ghost"
          size="lg"
          className="border border-card-border bg-transparent text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
          onPress={() => router.push(backHref)}
        >
          Thoát
        </Button>

        <div className="absolute inset-x-20 flex min-w-0 items-center justify-center sm:inset-x-32">
          {isEditingName ? (
            <Input
              autoFocus
              aria-label="Tên segment"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={saveName}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveName();
                if (event.key === "Escape") cancelEditingName();
              }}
              className="h-auto w-[min(70vw,32rem)] rounded-none border-0 bg-transparent px-2 py-1 text-center text-base leading-8 font-semibold text-text-primary shadow-none outline-none ring-0 focus:border-0 focus:ring-0 sm:text-xl"
            />
          ) : (
            <Button
              variant="ghost"
              appearance="ghost"
              size="md"
              aria-label="Đổi tên segment"
              className="group/title max-w-full min-w-0 gap-2 px-2 text-text-primary hover:bg-background-gray-primary hover:text-text-primary"
              onPress={startEditingName}
            >
              <span className="truncate text-center text-base font-semibold text-text-primary sm:text-xl">
                {segmentName}
              </span>
              <Pencil1
                size={17}
                aria-hidden="true"
                className="shrink-0 text-text-tertiary opacity-60 transition-opacity sm:opacity-0 sm:group-hover/title:opacity-100 sm:group-focus-visible/title:opacity-100"
              />
            </Button>
          )}
        </div>

        <Button
          variant="primary"
          appearance="fill"
          size="lg"
          onPress={() => setIsCreateDialogOpen(true)}
        >
          Tiếp theo
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="min-w-0 flex-1 overflow-y-auto bg-card-background">
          <SegmentFilterBuilder
            groups={groups}
            setGroups={setGroups}
            groupLogic={groupLogic}
            setGroupLogic={setGroupLogic}
          />
        </section>

        <aside className="relative hidden w-[min(34vw,34rem)] shrink-0 border-l border-card-border bg-card-background lg:flex lg:items-center lg:justify-center">
          {previewReady ? (
            <SegmentFilterPreview />
          ) : (
            <div className="flex max-w-72 flex-col items-center px-6 text-center">
              <div className="relative mb-7 flex size-36 items-center justify-center rounded-[2rem] bg-badge-sky-background text-badge-sky-icon-color">
                <div className="absolute top-7 left-7 flex size-16 rotate-[-8deg] items-center justify-center rounded-xl border-2 border-current bg-card-background/70">
                  <Filter size={34} aria-hidden="true" />
                </div>
                <div className="absolute right-6 bottom-6 h-2 w-14 rounded-full bg-badge-primary-background" />
                <div className="absolute right-9 bottom-11 h-2 w-9 rounded-full bg-badge-warning-background" />
              </div>
              <h2 className="text-lg leading-7 font-semibold text-text-primary sm:text-xl">
                Thêm bộ lọc để bắt đầu tạo segment
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Kết quả sau khi lọc sẽ hiển thị tại đây.
              </p>
            </div>
          )}
        </aside>
      </div>

      <SegmentCreateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        segmentName={segmentName}
        studentSize={studentSize}
        onCreate={() => router.push(backHref)}
      />
    </main>
  );
}
