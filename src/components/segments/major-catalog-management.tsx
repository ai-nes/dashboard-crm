"use client";

import { Pencil1, Trash1 } from "@tailgrids/icons";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import {
  useDeleteMajorGroupMutation,
  useDeleteMajorMutation,
  useMajorGroupsQuery,
  useMajorsQuery,
  useUpdateMajorGroupMutation,
} from "@/hooks/use-major-catalog-queries";
import type {
  MajorGroupOption,
  MajorOption,
} from "@/services/api/major-catalog";

import { AdmissionCatalogPanel } from "./admission-catalog-panel";
import { CatalogOrderingPanel } from "./catalog-ordering-panel";
import { MajorEditorDialog } from "./major-editor-dialog";
import { MajorGroupEditorDialog } from "./major-group-editor-dialog";

const PAGE_SIZE = 8;
const GROUP_FILTER_ALL = "all";
const STATUS_FILTERS = ["all", "enabled", "disabled"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function statusLabel(value: StatusFilter): string {
  if (value === "enabled") return "Đang dùng";
  if (value === "disabled") return "Đã tắt";
  return "Tất cả trạng thái";
}

export function MajorCatalogManagement({
  canManage,
  groupId,
  groupName,
  enabled = true,
}: {
  canManage: boolean;
  groupId?: string;
  groupName?: string;
  enabled?: boolean;
}) {
  const isGroupDetail = Boolean(groupId);
  const [groupSearch, setGroupSearch] = useState("");
  const deferredGroupSearch = useDeferredValue(groupSearch);
  const [majorSearch, setMajorSearch] = useState("");
  const deferredMajorSearch = useDeferredValue(majorSearch);
  const [groupStatus, setGroupStatus] = useState<StatusFilter>("all");
  const [isOrderingGroups, setIsOrderingGroups] = useState(false);
  const [majorStatus, setMajorStatus] = useState<StatusFilter>("all");
  const [majorGroupFilter, setMajorGroupFilter] = useState(
    groupId ?? GROUP_FILTER_ALL,
  );
  const [groupPage, setGroupPage] = useState(1);
  const [majorPage, setMajorPage] = useState(1);
  const [groupEditorOpen, setGroupEditorOpen] = useState(false);
  const [majorEditorOpen, setMajorEditorOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [selectedGroupRecord, setSelectedGroupRecord] =
    useState<MajorGroupOption | null>(null);
  const [selectedMajorRecord, setSelectedMajorRecord] =
    useState<MajorOption | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<MajorGroupOption | null>(
    null,
  );
  const [majorToDelete, setMajorToDelete] = useState<MajorOption | null>(null);

  const groupsQuery = useMajorGroupsQuery({
    search: deferredGroupSearch,
    includeDisabled: true,
    enabled: groupStatus === "all" ? undefined : groupStatus === "enabled",
    start: (groupPage - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
    queryEnabled: enabled,
  });
  const groups = groupsQuery.data?.groups ?? [];
  const groupOptionsQuery = useMajorGroupsQuery({
    includeDisabled: true,
    start: 0,
    pageLength: 100,
    queryEnabled: enabled,
  });
  const groupOptions = groupOptionsQuery.data?.groups ?? groups;
  const enabledGroupCount = groupOptions.filter(
    (group) => group.enabled,
  ).length;
  const canCreateMajor = groupId
    ? groupOptions.some((group) => group.id === groupId && group.enabled)
    : enabledGroupCount > 0;
  const majorsQuery = useMajorsQuery({
    search: deferredMajorSearch,
    group:
      groupId ??
      (majorGroupFilter === GROUP_FILTER_ALL ? undefined : majorGroupFilter),
    includeInactive: true,
    isActive: majorStatus === "all" ? undefined : majorStatus === "enabled",
    start: (majorPage - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
    enabled: enabled && isGroupDetail,
  });
  const majors = majorsQuery.data?.majors ?? [];
  const deleteGroupMutation = useDeleteMajorGroupMutation();
  const deleteMajorMutation = useDeleteMajorMutation();
  const updateGroupMutation = useUpdateMajorGroupMutation();

  const openCreateGroup = () => {
    setSelectedGroupRecord(null);
    setEditorKey((current) => current + 1);
    setGroupEditorOpen(true);
  };

  const openEditGroup = (group: MajorGroupOption) => {
    setSelectedGroupRecord(group);
    setEditorKey((current) => current + 1);
    setGroupEditorOpen(true);
  };

  const openCreateMajor = () => {
    if (!canCreateMajor) {
      toast.error("Hãy tạo hoặc bật một Major Group trước khi thêm ngành.");
      return;
    }
    setSelectedMajorRecord(null);
    setEditorKey((current) => current + 1);
    setMajorEditorOpen(true);
  };

  const openEditMajor = (major: MajorOption) => {
    setSelectedMajorRecord(major);
    setEditorKey((current) => current + 1);
    setMajorEditorOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      await deleteGroupMutation.mutateAsync({
        name: groupToDelete.id,
        expectedModified: groupToDelete.modified,
      });
      toast.success(`Đã xóa nhóm ${groupToDelete.name}.`);
      setGroupPage(1);
      setGroupToDelete(null);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa nhóm ngành."));
    }
  };

  const confirmDeleteMajor = async () => {
    if (!majorToDelete) return;
    try {
      await deleteMajorMutation.mutateAsync({
        name: majorToDelete.id,
        expectedModified: majorToDelete.modified,
      });
      toast.success(`Đã xóa ngành ${majorToDelete.name}.`);
      setMajorPage(1);
      setMajorToDelete(null);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa ngành học."));
    }
  };

  const saveGroupOrder = async (items: readonly { id: string }[]) => {
    const recordsById = new Map(groupOptions.map((group) => [group.id, group]));
    try {
      await Promise.all(
        items.map((item, index) => {
          const group = recordsById.get(item.id);
          if (!group) return Promise.resolve();
          return updateGroupMutation.mutateAsync({
            name: group.id,
            data: {
              code: group.code,
              display_name: group.name,
              description: group.description,
              enabled: group.enabled,
              sort_order: index + 1,
            },
            expectedModified: group.modified,
          });
        }),
      );
      toast.success("Đã cập nhật thứ tự nhóm ngành.");
      setIsOrderingGroups(false);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể cập nhật thứ tự nhóm ngành."));
    }
  };

  const groupTotal = groupsQuery.data?.total ?? groups.length;
  const majorTotal = majorsQuery.data?.total ?? majors.length;
  const effectiveMajorGroup =
    groupId ??
    (majorGroupFilter === GROUP_FILTER_ALL ? undefined : majorGroupFilter);
  const groupHasFilter =
    Boolean(deferredGroupSearch.trim()) || groupStatus !== "all";
  const majorHasFilter =
    Boolean(deferredMajorSearch.trim()) ||
    majorStatus !== "all" ||
    (!isGroupDetail && majorGroupFilter !== GROUP_FILTER_ALL);
  const defaultMajorGroup =
    effectiveMajorGroup &&
    groupOptions.some(
      (group) => group.id === effectiveMajorGroup && group.enabled,
    )
      ? effectiveMajorGroup
      : "";

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4">
        {!isGroupDetail && (
          <AdmissionCatalogPanel
            className="flex-none"
            title="Major Group"
            description="Danh mục nhóm ngành dùng để phân loại các ngành học con."
            count={groupTotal}
            countLabel="nhóm"
            canManage={canManage}
            createLabel="Thêm nhóm ngành"
            onCreate={openCreateGroup}
            isBusy={
              groupsQuery.isPending ||
              deleteGroupMutation.isPending ||
              groupOptionsQuery.isPending ||
              updateGroupMutation.isPending
            }
          >
            <div className="border-b border-card-border px-4 py-3 sm:px-5">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
                <Input
                  value={groupSearch}
                  onChange={(event) => {
                    setGroupSearch(event.target.value);
                    setGroupPage(1);
                  }}
                  placeholder="Tìm mã hoặc tên nhóm"
                  aria-label="Tìm nhóm ngành"
                  className="h-9 w-full"
                />
                <Select
                  value={groupStatus}
                  onChange={(value) => {
                    setGroupStatus(String(value) as StatusFilter);
                    setGroupPage(1);
                  }}
                  aria-label="Lọc trạng thái nhóm ngành"
                  className="w-full gap-0"
                >
                  <SelectTrigger size="sm" className="w-full justify-between">
                    <SelectValue />
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent className="min-w-(--trigger-width)">
                    {STATUS_FILTERS.map((value) => (
                      <SelectItem
                        key={value}
                        id={value}
                        textValue={statusLabel(value)}
                      >
                        {statusLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {canManage && (
                  <Button
                    size="sm"
                    appearance="outline"
                    isDisabled={Boolean(groupSearch.trim()) || groupStatus !== "all"}
                    onPress={() => setIsOrderingGroups(true)}
                  >
                    Sắp xếp
                  </Button>
                )}
              </div>
            </div>
            {isOrderingGroups ? (
              groupOptionsQuery.isPending ? (
                <CatalogLoading label="Đang tải danh sách để sắp xếp…" />
              ) : groupOptionsQuery.error ? (
                <CatalogError
                  message={errorMessage(groupOptionsQuery.error, "Không thể tải danh sách sắp xếp.")}
                  onRetry={() => void groupOptionsQuery.refetch()}
                />
              ) : (
                <CatalogOrderingPanel
                  title="nhóm ngành"
                  items={groupOptions.map((group) => ({
                    id: group.id,
                    code: group.code,
                    label: group.name,
                    description: group.description,
                  }))}
                  isSaving={updateGroupMutation.isPending}
                  onCancel={() => setIsOrderingGroups(false)}
                  onSave={saveGroupOrder}
                />
              )
            ) : groupsQuery.isPending ? (
              <CatalogLoading label="Đang tải nhóm ngành…" />
            ) : groupsQuery.error ? (
              <CatalogError
                message={errorMessage(
                  groupsQuery.error,
                  "Không thể tải nhóm ngành.",
                )}
                onRetry={() => void groupsQuery.refetch()}
              />
            ) : groups.length === 0 ? (
              <CatalogEmpty
                title={
                  groupHasFilter
                    ? "Không tìm thấy nhóm phù hợp"
                    : "Chưa có nhóm ngành"
                }
                description={
                  groupHasFilter
                    ? "Thử đổi từ khóa hoặc trạng thái."
                    : "Tạo nhóm đầu tiên để thêm các ngành học con."
                }
                action={
                  !groupHasFilter && canManage ? openCreateGroup : undefined
                }
              />
            ) : (
              <TableRoot fullBleed className="w-full min-w-[760px] border-0">
                <TableHeader className="bg-background-gray-secondary/35">
                  <TableRow>
                    <TableHead>Mã nhóm</TableHead>
                    <TableHead>Tên nhóm</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-24 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow
                      key={group.id}
                      className="group hover:bg-background-gray-secondary/30"
                    >
                      <TableCell className="align-top">
                        <span className="font-mono text-xs font-bold tracking-wide text-text-secondary">
                          {group.code}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[18rem] align-top">
                        <Link
                          href={`/director/admin/majors/${encodeURIComponent(group.id)}`}
                          title={`Xem các Major thuộc ${group.name}`}
                          className="block rounded font-medium text-text-primary outline-none hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          {group.name}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[28rem] align-top text-sm text-text-secondary">
                        <span className="line-clamp-2">
                          {group.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          color={group.enabled ? "success" : "gray"}
                          size="sm"
                        >
                          {group.enabled ? "Đang dùng" : "Đã tắt"}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-end gap-1">
                          {canManage && (
                            <>
                              <Button
                                aria-label={`Sửa ${group.name}`}
                                iconOnly
                                size="sm"
                                appearance="ghost"
                                onPress={() => openEditGroup(group)}
                              >
                                <Pencil1 size={16} aria-hidden="true" />
                              </Button>
                              <Button
                                aria-label={`Xóa ${group.name}`}
                                iconOnly
                                size="sm"
                                appearance="ghost"
                                variant="danger"
                                onPress={() => setGroupToDelete(group)}
                              >
                                <Trash1 size={16} aria-hidden="true" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            )}
            {!isOrderingGroups && groups.length > 0 && Math.ceil(groupTotal / PAGE_SIZE) > 1 && (
              <div className="border-t border-card-border px-4 py-3 sm:px-5">
                <Pagination
                  currentPage={groupPage}
                  totalPages={Math.ceil(groupTotal / PAGE_SIZE)}
                  onPageChange={setGroupPage}
                  variant="compact"
                  align="end"
                  isDisabled={groupsQuery.isFetching}
                />
              </div>
            )}
          </AdmissionCatalogPanel>
        )}

        {isGroupDetail && (
          <AdmissionCatalogPanel
            className="flex-none"
            title={`Major của ${groupName || "Major Group"}`}
            description="Danh sách các ngành học thuộc Major Group này."
            count={majorTotal}
            countLabel="ngành"
            canManage={canManage}
            createLabel="Thêm ngành"
            onCreate={openCreateMajor}
            isCreateDisabled={!canCreateMajor}
            isBusy={
              majorsQuery.isPending ||
              deleteMajorMutation.isPending ||
              groupOptionsQuery.isPending
            }
          >
            <div className="border-b border-card-border px-4 py-3 sm:px-5">
              <div
                className={
                  isGroupDetail
                    ? "grid gap-2 lg:grid-cols-[minmax(0,1fr)_12rem]"
                    : "grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,0.35fr)_12rem]"
                }
              >
                <Input
                  value={majorSearch}
                  onChange={(event) => {
                    setMajorSearch(event.target.value);
                    setMajorPage(1);
                  }}
                  placeholder="Tìm mã hoặc tên ngành"
                  aria-label="Tìm ngành học"
                  className="h-9 w-full"
                />
                {!isGroupDetail && (
                  <Select
                    value={majorGroupFilter}
                    onChange={(value) => {
                      setMajorGroupFilter(String(value));
                      setMajorPage(1);
                    }}
                    aria-label="Lọc theo nhóm ngành"
                    className="w-full gap-0"
                  >
                    <SelectTrigger size="sm" className="w-full justify-between">
                      <SelectValue />
                      <SelectIndicator />
                    </SelectTrigger>
                    <SelectContent className="min-w-(--trigger-width)">
                      <SelectItem
                        id={GROUP_FILTER_ALL}
                        textValue="Tất cả nhóm ngành"
                      >
                        Tất cả nhóm ngành
                      </SelectItem>
                      {groupOptions.map((group) => (
                        <SelectItem key={group.id} id={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select
                  value={majorStatus}
                  onChange={(value) => {
                    setMajorStatus(String(value) as StatusFilter);
                    setMajorPage(1);
                  }}
                  aria-label="Lọc trạng thái ngành học"
                  className="w-full gap-0"
                >
                  <SelectTrigger size="sm" className="w-full justify-between">
                    <SelectValue />
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent className="min-w-(--trigger-width)">
                    {STATUS_FILTERS.map((value) => (
                      <SelectItem
                        key={value}
                        id={value}
                        textValue={statusLabel(value)}
                      >
                        {statusLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {majorsQuery.isPending ? (
              <CatalogLoading label="Đang tải ngành học…" />
            ) : majorsQuery.error ? (
              <CatalogError
                message={errorMessage(
                  majorsQuery.error,
                  "Không thể tải ngành học.",
                )}
                onRetry={() => void majorsQuery.refetch()}
              />
            ) : majors.length === 0 ? (
              <CatalogEmpty
                title={
                  majorHasFilter
                    ? "Không tìm thấy ngành phù hợp"
                    : "Chưa có ngành học"
                }
                description={
                  majorHasFilter
                    ? "Thử đổi từ khóa, nhóm ngành hoặc trạng thái."
                    : !canCreateMajor
                      ? "Tạo hoặc bật một Major Group trước khi thêm ngành."
                      : "Tạo ngành học đầu tiên để dùng trong hồ sơ tuyển sinh."
                }
                action={
                  !majorHasFilter && canManage && canCreateMajor
                    ? openCreateMajor
                    : undefined
                }
                actionLabel="Thêm ngành"
              />
            ) : (
              <TableRoot fullBleed className="w-full min-w-[760px] border-0">
                <TableHeader className="bg-background-gray-secondary/35">
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên ngành</TableHead>
                    <TableHead>Major Group</TableHead>
                    <TableHead>Bậc / bằng cấp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-24 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {majors.map((major) => (
                    <TableRow
                      key={major.id}
                      className="group hover:bg-background-gray-secondary/30"
                    >
                      <TableCell className="align-top">
                        <span className="font-mono text-xs font-bold tracking-wide text-text-secondary">
                          {major.code || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[22rem] align-top">
                        <span className="block font-medium text-text-primary">
                          {major.name}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[18rem] align-top text-sm text-text-secondary">
                        {major.majorGroupName || "Chưa phân nhóm"}
                      </TableCell>
                      <TableCell className="align-top text-sm text-text-secondary">
                        {major.degreeName || "—"}
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          color={major.isActive ? "success" : "gray"}
                          size="sm"
                        >
                          {major.isActive ? "Đang dùng" : "Đã tắt"}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-end gap-1">
                          {canManage && (
                            <>
                              <Button
                                aria-label={`Sửa ${major.name}`}
                                iconOnly
                                size="sm"
                                appearance="ghost"
                                onPress={() => openEditMajor(major)}
                              >
                                <Pencil1 size={16} aria-hidden="true" />
                              </Button>
                              <Button
                                aria-label={`Xóa ${major.name}`}
                                iconOnly
                                size="sm"
                                appearance="ghost"
                                variant="danger"
                                onPress={() => setMajorToDelete(major)}
                              >
                                <Trash1 size={16} aria-hidden="true" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            )}
            {majors.length > 0 && Math.ceil(majorTotal / PAGE_SIZE) > 1 && (
              <div className="border-t border-card-border px-4 py-3 sm:px-5">
                <Pagination
                  currentPage={majorPage}
                  totalPages={Math.ceil(majorTotal / PAGE_SIZE)}
                  onPageChange={setMajorPage}
                  variant="compact"
                  align="end"
                  isDisabled={majorsQuery.isFetching}
                />
              </div>
            )}
          </AdmissionCatalogPanel>
        )}
      </div>

      <MajorGroupEditorDialog
        key={`group-${editorKey}`}
        isOpen={groupEditorOpen}
        record={selectedGroupRecord}
        onOpenChange={(open) => {
          setGroupEditorOpen(open);
          if (!open) setSelectedGroupRecord(null);
        }}
      />
      <MajorEditorDialog
        key={`major-${editorKey}`}
        isOpen={majorEditorOpen}
        record={selectedMajorRecord}
        groups={groupOptions}
        defaultGroup={defaultMajorGroup}
        onOpenChange={(open) => {
          setMajorEditorOpen(open);
          if (!open) setSelectedMajorRecord(null);
        }}
      />
      <DeleteRecordDialog
        isOpen={Boolean(groupToDelete)}
        recordType="nhóm ngành"
        recordName={groupToDelete?.name ?? ""}
        isDeleting={deleteGroupMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteGroupMutation.isPending) setGroupToDelete(null);
        }}
        onConfirm={confirmDeleteGroup}
      >
        <p className="text-sm text-text-secondary">
          Chỉ nhóm chưa được Major nào tham chiếu mới có thể xóa. Nếu đang được
          dùng, hãy tắt nhóm thay vì xóa.
        </p>
      </DeleteRecordDialog>
      <DeleteRecordDialog
        isOpen={Boolean(majorToDelete)}
        recordType="ngành học"
        recordName={majorToDelete?.name ?? ""}
        isDeleting={deleteMajorMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMajorMutation.isPending) setMajorToDelete(null);
        }}
        onConfirm={confirmDeleteMajor}
      />
    </>
  );
}

function CatalogLoading({ label }: { label: string }) {
  return (
    <div className="space-y-3 px-5 py-8" role="status" aria-label={label}>
      <p className="text-sm text-text-tertiary">{label}</p>
      {["one", "two", "three"].map((item) => (
        <div
          key={item}
          className="h-10 animate-pulse rounded-lg bg-background-gray-secondary motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function CatalogError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center"
      role="alert"
    >
      <p className="text-sm text-text-secondary">{message}</p>
      <Button size="sm" appearance="outline" onPress={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}

function CatalogEmpty({
  title,
  description,
  action,
  actionLabel = "Thêm nhóm ngành",
}: {
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="text-sm text-text-tertiary">{description}</p>
      {action && (
        <Button size="sm" className="mt-2" onPress={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
