"use client";

import { useState } from "react";
import { Pencil1 } from "@tailgrids/icons";
import { Menu, MenuTrigger } from "react-aria-components";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { DropdownMenuItem } from "@/components/tailgrids/core/dropdown";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Popover } from "@/components/tailgrids/core/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
import {
  useArchiveCrmRuleVersionMutation,
  useCloneCrmRuleVersionMutation,
  useCreateCrmRuleVersionMutation,
  usePublishCrmRuleVersionMutation,
  useUpdateCrmRuleVersionMutation,
} from "@/hooks/use-rules-config-queries";
import type { CrmRuleVersion } from "@/services/api/rules-config";

const inputClass =
  "h-10 w-full rounded-lg border border-card-border bg-input-background px-3 text-sm text-title-50 outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed disabled:bg-background-gray-secondary";
const textAreaClass =
  "min-h-20 w-full resize-y rounded-lg border border-card-border bg-input-background px-3 py-2.5 text-sm text-title-50 outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Thao tác Version thất bại.";
}

export default function RuleVersionActions({
  version,
  canEdit,
  iconButtonAppearance = "outline",
  showEmptyCreateButton = true,
  openCreate = false,
  onCreateOpenChange,
  onCreated,
  onChanged,
}: {
  version: CrmRuleVersion | null;
  canEdit: boolean;
  iconButtonAppearance?: "outline" | "ghost";
  showEmptyCreateButton?: boolean;
  openCreate?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
  onCreated: (version: CrmRuleVersion) => void;
  onChanged: (version: CrmRuleVersion) => void;
}) {
  const [mode, setMode] = useState<"create" | "clone" | "edit" | null>(() =>
    openCreate && canEdit ? "create" : null,
  );
  const [versionId, setVersionId] = useState("");
  const [versionName, setVersionName] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreateCrmRuleVersionMutation();
  const cloneMutation = useCloneCrmRuleVersionMutation();
  const updateMutation = useUpdateCrmRuleVersionMutation();
  const publishMutation = usePublishCrmRuleVersionMutation();
  const archiveMutation = useArchiveCrmRuleVersionMutation();

  const openEdit = () => {
    if (!version) return;
    setMode("edit");
    setVersionId(version.versionId);
    setVersionName(version.versionName);
    setDescription(version.description ?? "");
  };

  const busy =
    createMutation.isPending ||
    cloneMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    archiveMutation.isPending;
  const openCreateForm = () => {
    setMode("create");
    setVersionId("");
    setVersionName("");
    setDescription("");
  };
  const openClone = () => {
    if (!version) return;
    setMode("clone");
    setVersionId("");
    setVersionName("Copy of " + version.versionName);
    setDescription(version.description ?? "");
  };
  const closeForm = () => {
    setMode(null);
    if (openCreate) onCreateOpenChange?.(false);
  };

  const save = async () => {
    if (!versionId.trim() || !versionName.trim()) {
      toast.error("Vui lòng nhập Version ID và tên Version.");
      return;
    }
    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync({
          versionId: versionId.trim(),
          versionName: versionName.trim(),
          description,
        });
        toast.success("Đã tạo Version bản nháp.");
        onCreated(created);
      } else if (mode === "clone" && version) {
        const cloned = await cloneMutation.mutateAsync({
          sourceName: version.name,
          versionId: versionId.trim(),
          versionName: versionName.trim(),
          description,
        });
        toast.success("Đã clone Version thành bản nháp.");
        onCreated(cloned);
      } else if (mode === "edit" && version) {
        const updated = await updateMutation.mutateAsync({
          name: version.name,
          expectedRevision: version.revision,
          versionName: versionName.trim(),
          description,
        });
        toast.success("Đã cập nhật metadata Version.");
        onChanged(updated);
      }
      setMode(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const publish = async () => {
    if (!version) return;
    try {
      const updated = await publishMutation.mutateAsync({
        name: version.name,
        expectedRevision: version.revision,
      });
      toast.success("Đã phát hành toàn bộ Version.");
      onChanged(updated);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const archive = async () => {
    if (
      !version ||
      version.isActive ||
      !window.confirm("Lưu trữ Version này và các Rule bên trong?")
    )
      return;
    const reason = window.prompt("Nhập lý do lưu trữ Version:")?.trim();
    if (!reason) {
      toast.error("Cần nhập lý do lưu trữ Version.");
      return;
    }
    try {
      const updated = await archiveMutation.mutateAsync({
        name: version.name,
        expectedRevision: version.revision,
        reason,
      });
      toast.success("Đã lưu trữ Version.");
      onChanged(updated);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const canShowEdit = version?.status === "draft";
  const canShowPublish = version?.status === "draft";
  const canShowClone = Boolean(canEdit && version && version.rulesCount > 0);
  const canShowArchive = Boolean(
    canEdit && version && version.status !== "archived" && !version.isActive,
  );
  const hasAnyAction =
    canShowEdit || canShowPublish || canShowClone || canShowArchive;

  return (
    <div className="space-y-3">
      {canEdit && !version && showEmptyCreateButton ? (
        <Button
          type="button"
          variant="primary"
          appearance="fill"
          size="md"
          className="whitespace-nowrap"
          onPress={openCreateForm}
        >
          + Tạo Version đầu tiên
        </Button>
      ) : null}
      {version && hasAnyAction ? (
        <MenuTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                iconOnly
                variant={iconButtonAppearance === "ghost" ? "ghost" : "primary"}
                appearance={iconButtonAppearance}
                size="sm"
                isDisabled={busy}
                className={
                  iconButtonAppearance === "ghost"
                    ? "text-text-tertiary hover:text-primary-500"
                    : undefined
                }
                aria-label="Chỉnh sửa Version"
              >
                <Pencil1 size={16} aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chỉnh sửa Version</p>
            </TooltipContent>
          </Tooltip>
          <Popover placement="bottom end" className="min-w-56 p-1.5 shadow-md">
            <Menu aria-label="Thao tác Version" className="outline-none">
              {canShowEdit ? (
                <DropdownMenuItem
                  id="edit"
                  textValue="Sửa metadata"
                  onAction={openEdit}
                >
                  Sửa metadata
                </DropdownMenuItem>
              ) : null}
              {canShowPublish ? (
                <DropdownMenuItem
                  id="publish"
                  textValue="Phát hành Version"
                  isDisabled={version.rulesCount === 0}
                  onAction={() => void publish()}
                >
                  Phát hành Version
                </DropdownMenuItem>
              ) : null}
              {canShowClone ? (
                <DropdownMenuItem
                  id="clone"
                  textValue="Clone thành bản nháp"
                  onAction={openClone}
                >
                  Clone thành bản nháp
                </DropdownMenuItem>
              ) : null}
              {canShowArchive ? (
                <DropdownMenuItem
                  id="archive"
                  textValue="Lưu trữ"
                  onAction={() => void archive()}
                  className="text-error-500 data-[focused]:text-error-500"
                >
                  Lưu trữ
                </DropdownMenuItem>
              ) : null}
            </Menu>
          </Popover>
        </MenuTrigger>
      ) : null}
      {mode ? (
        <Backdrop isOpen onOpenChange={(open) => !open && !busy && closeForm()}>
          <Dialog
            aria-label={
              mode === "create"
                ? "Tạo Version"
                : mode === "clone"
                  ? "Clone Version"
                  : "Sửa Version"
            }
            className="max-h-[calc(100vh-2rem)] max-w-xl overflow-hidden p-0"
          >
            <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
              <DialogTitle>
                {mode === "create"
                  ? "Tạo Version mới"
                  : mode === "clone"
                    ? "Clone Version"
                    : "Sửa metadata Version"}
              </DialogTitle>
              <p className="text-sm text-text-tertiary">
                Version mới luôn bắt đầu ở trạng thái bản nháp.
              </p>
            </DialogHeader>
            <DialogBody className="max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-title-50">
                  Version ID
                  <input
                    className={inputClass}
                    disabled={mode === "edit" || busy}
                    value={versionId}
                    onChange={(event) =>
                      setVersionId(event.target.value.toUpperCase())
                    }
                    placeholder="NBA-V2"
                  />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-title-50">
                  Tên Version
                  <input
                    className={inputClass}
                    disabled={busy}
                    value={versionName}
                    onChange={(event) => setVersionName(event.target.value)}
                    placeholder="Bộ Rule tuyển sinh"
                  />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-title-50 md:col-span-2">
                  Mô tả
                  <textarea
                    className={textAreaClass}
                    disabled={busy}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Phạm vi áp dụng của Version"
                  />
                </label>
              </div>
            </DialogBody>
            <DialogFooter className="border-t border-card-border px-5 py-3">
              <DialogClose appearance="outline" size="sm" isDisabled={busy}>
                Huỷ
              </DialogClose>
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                isDisabled={busy}
                onPress={() => void save()}
              >
                {busy ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      ) : null}
    </div>
  );
}
