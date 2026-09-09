"use client";

import { Plus, Search1 } from "@tailgrids/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Header as ListBoxHeader,
  ListBox,
  ListBoxSection,
  type Selection,
} from "react-aria-components";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Popover } from "@/components/tailgrids/core/popover";
import { SelectItem } from "@/components/tailgrids/core/select";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
import {
  studentClassificationKeys,
  useAddStudentTagMutation,
  useRemoveStudentTagMutation,
  useStudentClassificationQuery,
  useStudentTagCatalogueQuery,
} from "@/hooks/use-student-classification-queries";
import type {
  StudentClassificationsResponse,
  StudentTagMutationRequest,
} from "@/services/api/student-classification";
import { TagCategory } from "@/services/api/student-classification/classification-types";
import {
  getStudentTagLabel,
  getStudentTagGroupLabel,
  normalizeTagSearch,
} from "@/services/api/student-classification/tag-labels";

interface StudentTagsCellProps {
  studentId: string;
  editable: boolean;
}

type StudentTagBadgeColor = "gray" | "cyan" | "violet" | "rose" | "orange";
const MAX_VISIBLE_TAGS = 3;

const TAG_GROUP_BADGE_COLORS: Record<TagCategory, StudentTagBadgeColor> = {
  [TagCategory.ATTENTION]: "rose",
  [TagCategory.RELATIONSHIP]: "violet",
  [TagCategory.CONTEXT]: "cyan",
  [TagCategory.OPERATIONAL]: "orange",
};

export default function StudentTagsCell({
  studentId,
  editable,
}: StudentTagsCellProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const mutationInFlight = useRef(false);
  const classificationsQuery = useStudentClassificationQuery(studentId);
  const tagGroupsQuery = useStudentTagCatalogueQuery(Boolean(studentId));
  const addMutation = useAddStudentTagMutation();
  const removeMutation = useRemoveStudentTagMutation();
  const assignedTags = useMemo(
    () => classificationsQuery.data?.tags ?? [],
    [classificationsQuery.data?.tags],
  );
  const allTags = useMemo(
    () => tagGroupsQuery.data?.flatMap((group) => group.tags) ?? [],
    [tagGroupsQuery.data],
  );
  const tagCatalogueByName = useMemo(
    () => new Map(allTags.map((tag) => [tag.name, tag])),
    [allTags],
  );
  const assignedTagIds = useMemo(
    () => new Set(assignedTags.map((assignment) => assignment.tag)),
    [assignedTags],
  );
  const visibleGroups = useMemo(() => {
    const query = normalizeTagSearch(tagSearch);
    return (tagGroupsQuery.data ?? [])
      .map((group) => ({
        ...group,
        tags: group.tags.filter(
          (tag) =>
            (tag.status === "active" || assignedTagIds.has(tag.name)) &&
            normalizeTagSearch(
              [
                tag.code,
                getStudentTagLabel(tag),
                getStudentTagGroupLabel(group.group_name),
                tag.description ?? "",
              ].join(" "),
            ).includes(query),
        ),
      }))
      .filter((group) => group.tags.length > 0);
  }, [tagGroupsQuery.data, tagSearch, assignedTagIds]);
  const isMutating = addMutation.isPending || removeMutation.isPending;
  const visibleAssignedTags = assignedTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = Math.max(
    assignedTags.length - visibleAssignedTags.length,
    0,
  );

  const getTagLabel = (tag: string) => {
    const catalogueTag = tagCatalogueByName.get(tag);
    return catalogueTag ? getStudentTagLabel(catalogueTag) : "Tag chưa đặt tên";
  };

  const getTagBadgeColor = (tag: string): StudentTagBadgeColor => {
    const groupName = tagCatalogueByName.get(tag)?.group_name;
    return groupName
      ? (TAG_GROUP_BADGE_COLORS[groupName as TagCategory] ?? "gray")
      : "gray";
  };

  const handleSelectionChange = async (selection: Selection) => {
    if (!editable || mutationInFlight.current || classificationsQuery.isError)
      return;
    const queryKey = studentClassificationKeys.detail(studentId);
    let classification =
      queryClient.getQueryData<StudentClassificationsResponse>(queryKey);
    if (!classification) return;
    const selected = new Set(classification.tags.map((tag) => tag.tag));
    // Limit changes to visible options; searching must preserve hidden assignments.
    const changes = visibleGroups
      .flatMap((group) => group.tags)
      .filter(
        (tag) =>
          selected.has(tag.name) !==
          (selection === "all" || selection.has(tag.name)),
      );
    if (!changes.length) return;
    mutationInFlight.current = true;

    try {
      await queryClient.cancelQueries({ queryKey });
      // Each write uses the version returned by the preceding write.
      for (const tag of changes) {
        const request: StudentTagMutationRequest = {
          studentId,
          tag: tag.name,
          expectedModified: classification.modified,
        };
        classification = selected.has(tag.name)
          ? await removeMutation.mutateAsync(request)
          : await addMutation.mutateAsync(request);
        queryClient.setQueryData(queryKey, classification);
      }
      toast.success("Đã cập nhật tag học sinh.");
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "REVISION_CONFLICT"
      ) {
        await classificationsQuery.refetch();
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể cập nhật tag học sinh.",
      );
    } finally {
      mutationInFlight.current = false;
    }
  };

  if (!studentId) {
    return <HeaderFact label="Gắn tag" value="Chưa có CRM Student" />;
  }

  return (
    <div className="min-w-0 px-3 py-2">
      <p className="text-[11px] text-text-tertiary">Gắn tag</p>
      <DialogTrigger
        isOpen={isEditing}
        onOpenChange={(open) => {
          setIsEditing(open);
          if (open) setTagSearch("");
        }}
      >
        <Button
          type="button"
          variant="ghost"
          appearance="ghost"
          size="xs"
          isDisabled={!editable || classificationsQuery.isLoading}
          onPress={() => {
            setTagSearch("");
            setIsEditing(true);
          }}
          className="group/tags mt-0.5 flex h-auto min-h-7 min-w-0 max-w-full items-center gap-1.5 rounded border border-card-border bg-card-background px-1.5 py-0.5 text-left text-sm font-medium text-text-primary shadow-xs transition-[border-color,box-shadow,background-color] hover:border-card-border-hover hover:bg-background-soft-50 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label={
            assignedTags.length > 0
              ? `${editable ? "Sửa hoặc thêm tag" : "Xem tag"}: ${assignedTags.map((tag) => getTagLabel(tag.tag)).join(", ")}`
              : "Gắn tag cho học sinh"
          }
        >
          {classificationsQuery.isLoading || tagGroupsQuery.isLoading ? (
            <Skeleton className="h-4 w-28" aria-label="Đang tải tag" />
          ) : classificationsQuery.isError || tagGroupsQuery.isError ? (
            <span className="text-input-error">Không tải được tag</span>
          ) : assignedTags.length > 0 ? (
            <span className="flex min-w-0 flex-1 flex-wrap gap-1">
              {visibleAssignedTags.map((tag) => (
                <Badge
                  key={`${tag.tag}-${tag.name ?? "assignment"}`}
                  color={getTagBadgeColor(tag.tag)}
                  size="sm"
                  className="max-w-full min-w-0 gap-1 rounded-full text-left text-xs leading-4 whitespace-normal"
                >
                  <span
                    className="min-w-0 break-words whitespace-normal"
                    title={getTagLabel(tag.tag)}
                  >
                    {getTagLabel(tag.tag)}
                  </span>
                </Badge>
              ))}
              {hiddenTagCount > 0 && (
                <Tooltip placement="top-start">
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex"
                      aria-label={`Xem đầy đủ ${assignedTags.length} tag`}
                    >
                      <Badge
                        color="primary"
                        size="sm"
                        className="shrink-0 rounded-full text-xs"
                      >
                        +{hiddenTagCount}
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[min(22rem,calc(100vw-2rem))] space-y-1 whitespace-normal">
                    <p className="text-xs text-tooltip-text-color/70">
                      Tất cả tag
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {assignedTags.map((tag) => (
                        <Badge
                          key={`${tag.tag}-${tag.name ?? "tooltip"}`}
                          color={getTagBadgeColor(tag.tag)}
                          size="sm"
                          className="rounded-full text-xs"
                        >
                          {getTagLabel(tag.tag)}
                        </Badge>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
              {editable && (
                <Tooltip placement="top">
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-button-primary-outline-stroke bg-button-primary-outline-background text-button-primary-outline-text hover:bg-button-primary-outline-hover-background"
                      aria-label="Thêm tag"
                    >
                      <Plus size={12} aria-hidden="true" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Thêm tag</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </span>
          ) : (
            editable ? (
              <>
                <Plus size={14} className="shrink-0" aria-hidden="true" />
                <span>Gắn tag</span>
              </>
            ) : (
              <span>Chưa gắn tag</span>
            )
          )}
        </Button>
        <Popover className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-card-border bg-background-white-secondary p-0">
          <Dialog aria-label="Gắn tag học sinh" className="p-2 outline-none">
            <InputGroup className="h-8">
              <InputGroupAddon className="px-2">
                <Search1 size={13} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-8 px-2 py-1.5 text-xs"
                value={tagSearch}
                onChange={(event) => setTagSearch(event.target.value)}
                placeholder="Tìm tag"
                autoFocus
                aria-label="Tìm tag học sinh"
              />
            </InputGroup>
            {classificationsQuery.isError && (
              <div
                className="mt-1 flex items-center justify-between gap-2"
                role="alert"
              >
                <span className="text-xs text-input-error">
                  Không tải được tag của học sinh.
                </span>
                <Button
                  type="button"
                  size="xs"
                  appearance="ghost"
                  onPress={() => void classificationsQuery.refetch()}
                >
                  Thử lại
                </Button>
              </div>
            )}
            {tagGroupsQuery.isError && (
              <div
                className="mt-1 flex items-center justify-between gap-2"
                role="alert"
              >
                <span className="text-xs text-input-error">
                  Không tải được danh sách tag.
                </span>
                <Button
                  type="button"
                  size="xs"
                  appearance="ghost"
                  onPress={() => void tagGroupsQuery.refetch()}
                >
                  Thử lại
                </Button>
              </div>
            )}
            {tagGroupsQuery.isFetching && !tagGroupsQuery.data ? (
              <TagOptionsSkeleton />
            ) : (
              <ListBox
                aria-label={`Danh sách tag của ${studentId}`}
                className="mt-1 max-h-64 overflow-auto p-1 outline-none"
                selectionMode="multiple"
                selectionBehavior="toggle"
                escapeKeyBehavior="none"
                selectedKeys={assignedTagIds}
                onSelectionChange={(selection) =>
                  void handleSelectionChange(selection)
                }
                aria-busy={isMutating}
              >
                {visibleGroups.length > 0 ? (
                  visibleGroups.map((group) => (
                    <ListBoxSection
                      key={group.group_name}
                      aria-label={getStudentTagGroupLabel(group.group_name)}
                    >
                      <ListBoxHeader className="px-1.5 py-1 text-xs font-bold text-text-primary">
                        {getStudentTagGroupLabel(group.group_name)}
                      </ListBoxHeader>
                      {group.tags.map((tag) => (
                        <SelectItem
                          key={tag.name}
                          id={tag.name}
                          textValue={getStudentTagLabel(tag)}
                          isDisabled={
                            isMutating ||
                            classificationsQuery.isError ||
                            !classificationsQuery.data
                          }
                          className="pl-4"
                        >
                          <span className="flex min-w-0 flex-col py-0.5">
                            <span className="truncate text-text-primary">
                              {getStudentTagLabel(tag)}
                              {tag.status !== "active" && (
                                <span className="ml-1 text-xs text-text-tertiary">
                                  (Ngừng sử dụng)
                                </span>
                              )}
                            </span>
                            {tag.description && (
                              <span className="truncate text-xs text-text-tertiary">
                                {tag.description}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </ListBoxSection>
                  ))
                ) : (
                  <SelectItem
                    id="no-student-tags"
                    isDisabled
                    textValue="Không tìm thấy tag"
                  >
                    Không tìm thấy tag
                  </SelectItem>
                )}
              </ListBox>
            )}
            <p className="px-1.5 pt-1 text-[11px] leading-4 text-text-tertiary">
              {isMutating
                ? "Đang lưu tag..."
                : "Có thể chọn nhiều tag. Chọn lại để bỏ tag."}
            </p>
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}

function HeaderFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3 py-2">
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p
        className="mt-0.5 truncate text-sm font-semibold text-text-primary"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function TagOptionsSkeleton() {
  return (
    <div
      className="mt-1 space-y-2 p-2"
      role="status"
      aria-label="Đang tải danh sách tag"
    >
      {["first", "second", "third"].map((row) => (
        <div key={row} className="space-y-2 rounded-md px-1.5 py-1">
          <Skeleton className="h-3 w-40 max-w-full" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
}
