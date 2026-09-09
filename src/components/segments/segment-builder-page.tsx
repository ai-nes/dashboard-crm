"use client";

import { ArrowLeft, Filter, Pencil1 } from "@tailgrids/icons";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
import {
  useCreateSegmentMutation,
  useSegmentFilterOptionsQuery,
  useSegmentPreviewQuery,
  useTransitionSegmentMutation,
  useUpdateSegmentMutation,
} from "@/hooks/use-segment-queries";
import { cn } from "@/utils/cn";

import {
  SegmentCreateDialog,
  type SegmentCreateDetails,
} from "./segment-create-dialog";
import { SegmentFilterBuilder } from "./segment-filter-builder";
import {
  isConditionComplete,
  buildSegmentFilterOptions,
  StudentSegmentProperty,
  toBackendSegmentFilters,
  type SegmentFilterLogic,
  type SegmentFilterGroup,
} from "./segment-filter-config";
import { SegmentFilterPreview } from "./segment-filter-preview";
import { toSegmentStudent } from "./segment-detail-types";

export function defaultCategory(groups: SegmentFilterGroup[]) {
  const property = groups[0]?.conditions[0]?.property;
  if (property === StudentSegmentProperty.JOURNEY_STAGE)
    return "admission_stage" as const;
  if (property === StudentSegmentProperty.POTENTIAL)
    return "potential" as const;
  if (property === StudentSegmentProperty.INTENT) return "intent" as const;
  return "need" as const;
}

export default function SegmentBuilderPage({
  backHref,
  managementHref,
  initialSegmentName,
  initialGroups = [],
  initialLogic = "OR",
  initialPurpose = "",
  initialCategory,
  mode = "create",
  segmentId,
  expectedRevision,
  initialStatus = "draft",
  statusLabel,
  currentStatus,
}: {
  backHref: string;
  managementHref?: string;
  initialSegmentName: string;
  initialGroups?: SegmentFilterGroup[];
  initialLogic?: SegmentFilterLogic;
  initialPurpose?: string;
  initialCategory?: SegmentCreateDetails["category"];
  mode?: "create" | "edit";
  segmentId?: string;
  expectedRevision?: number;
  initialStatus?: SegmentCreateDetails["status"];
  statusLabel?: string;
  currentStatus?: import("./segment-list-types").SegmentStatus;
}) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const [segmentName, setSegmentName] = useState(initialSegmentName);
  const [draftName, setDraftName] = useState(initialSegmentName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groups, setGroups] = useState<SegmentFilterGroup[]>(initialGroups);
  const [logic, setLogic] = useState<SegmentFilterLogic>(initialLogic);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filterOptionsQuery = useSegmentFilterOptionsQuery();
  const createMutation = useCreateSegmentMutation();
  const transitionMutation = useTransitionSegmentMutation();
  const updateMutation = useUpdateSegmentMutation();
  const filterOptions = useMemo(
    () => buildSegmentFilterOptions(filterOptionsQuery.data),
    [filterOptionsQuery.data],
  );
  const previewReady =
    groups.length > 0 &&
    groups.every(
      (group) =>
        group.conditions.length > 0 &&
        group.conditions.every(isConditionComplete),
    );
  const backendFilters = useMemo(
    () => toBackendSegmentFilters(groups, logic),
    [groups, logic],
  );
  const previewQuery = useSegmentPreviewQuery(
    { filters: backendFilters ?? undefined, pageLength: 25 },
    previewReady && Boolean(backendFilters),
  );
  const studentSize = previewQuery.data?.total ?? 0;
  const totalStudents = previewQuery.data?.total_students ?? 0;
  const previewStudents = useMemo(
    () => (previewQuery.data?.students ?? []).map(toSegmentStudent),
    [previewQuery.data?.students],
  );

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

  const handleSave = async (details: SegmentCreateDetails) => {
    if (!backendFilters) return;
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        if (!segmentId || expectedRevision === undefined) {
          throw new Error("Không đủ thông tin để cập nhật segment.");
        }

        await updateMutation.mutateAsync({
          name: segmentId,
          expectedRevision,
          data: {
            title: segmentName.trim(),
            purpose: details.purpose,
            category: details.category,
            filters: backendFilters,
          },
        });
        setIsCreateDialogOpen(false);
        toast.success("Đã cập nhật segment");
        router.push(backHref);
        return;
      }

      const created = await createMutation.mutateAsync({
        title: segmentName.trim(),
        purpose: details.purpose,
        segment_type: "dynamic",
        category: details.category || defaultCategory(groups),
        is_public: 0,
        filters: backendFilters,
      });

      if (details.status === "active") {
        await transitionMutation.mutateAsync({
          name: created.name,
          status: "active",
          expectedRevision: created.revision,
        });
      }

      setIsCreateDialogOpen(false);
      toast.success("Đã tạo segment từ dữ liệu Frappe CRM");
      router.push(backHref);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Không thể cập nhật segment. Vui lòng thử lại."
            : "Không thể tạo segment. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={cn(
        "flex min-h-0 flex-col overflow-hidden bg-card-background text-text-primary",
        isEditMode ? "h-full" : "h-dvh",
      )}
    >
      <header className="relative flex h-[72px] shrink-0 items-center justify-between border-b border-card-border bg-card-surface-area px-2 text-text-primary sm:px-4">
        <Button
          variant="primary"
          appearance="ghost"
          size="lg"
          className="border border-card-border bg-transparent text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
          onPress={() => router.push(managementHref ?? backHref)}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Quay lại quản lý segments
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex max-w-full min-w-0">
                  <Button
                    variant="ghost"
                    appearance="ghost"
                    size="md"
                    aria-label="Đổi tên segment"
                    className="max-w-full min-w-0 gap-2 px-2 text-text-primary hover:bg-background-gray-primary hover:text-text-primary"
                    onPress={startEditingName}
                  >
                    <span className="truncate text-center text-base font-semibold text-text-primary sm:text-xl">
                      {segmentName}
                    </span>
                    <Pencil1
                      size={17}
                      aria-hidden="true"
                      className="shrink-0 text-text-tertiary"
                    />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đổi tên segment</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <Button
          variant="primary"
          appearance="fill"
          size="lg"
          isDisabled={!previewReady || previewQuery.isLoading || isSubmitting}
          onPress={() => setIsCreateDialogOpen(true)}
        >
          {isEditMode ? "Lưu thay đổi" : "Tiếp theo"}
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="min-w-0 flex-1 overflow-y-auto bg-card-background">
          {filterOptionsQuery.isError && (
            <p className="border-b border-card-border bg-badge-error-background px-4 py-3 text-sm text-badge-error-text sm:px-8">
              Không thể tải danh mục bộ lọc từ CRM. Hãy tải lại trang trước khi
              {isEditMode ? " lưu segment." : " tạo segment."}
            </p>
          )}
          <SegmentFilterBuilder
            groups={groups}
            setGroups={setGroups}
            logic={logic}
            setLogic={setLogic}
            options={filterOptions}
          />
        </section>

        <aside className="relative hidden w-[min(34vw,34rem)] shrink-0 border-l border-card-border bg-card-background lg:flex lg:items-center lg:justify-center">
          {previewReady ? (
            <SegmentFilterPreview
              total={studentSize}
              totalStudents={totalStudents}
              students={previewStudents}
              isLoading={previewQuery.isLoading}
              error={previewQuery.error?.message}
            />
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
                Kết quả từ CRM sẽ hiển thị tại đây.
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
        isSubmitting={isSubmitting}
        mode={mode}
        initialStatus={initialStatus}
        initialPurpose={initialPurpose}
        initialCategory={
          initialCategory ??
          (isEditMode ? defaultCategory(initialGroups) : "potential")
        }
        statusLabel={statusLabel}
        currentStatus={currentStatus}
        onCreate={handleSave}
      />
    </main>
  );
}
