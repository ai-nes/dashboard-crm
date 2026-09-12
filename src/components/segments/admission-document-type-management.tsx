"use client";

import { Pencil1, Trash1 } from "@tailgrids/icons";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { Input } from "@/components/tailgrids/core/input";
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
  useAdmissionDocumentTypesQuery,
  useDeleteAdmissionDocumentTypeMutation,
} from "@/hooks/use-admission-catalog-queries";
import type {
  AdmissionDocumentTypeOption,
  AdmissionDocumentTypeStatus,
} from "@/services/api/admission-profile-catalog";

import { AdmissionCatalogPanel } from "./admission-catalog-panel";
import { AdmissionDocumentTypeEditorDialog } from "./admission-document-type-editor-dialog";

const EMPTY_DOCUMENT_TYPES: AdmissionDocumentTypeOption[] = [];
const PAGE_SIZE = 8;
const CATEGORY_LABELS: Record<string, string> = {
  identity: "Giấy tờ định danh",
  education: "Học tập",
  photo: "Ảnh",
  payment: "Thanh toán",
  scholarship: "Học bổng",
  language: "Ngoại ngữ",
  special_program: "Chương trình đặc biệt",
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function statusColor(
  status: AdmissionDocumentTypeStatus | undefined,
): "gray" | "success" {
  return status === "Active" ? "success" : "gray";
}

export function AdmissionDocumentTypeManagement({
  canManage,
  canDelete,
}: {
  canManage: boolean;
  canDelete: boolean;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<
    AdmissionDocumentTypeStatus | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [selected, setSelected] = useState<AdmissionDocumentTypeOption | null>(
    null,
  );
  const [toDelete, setToDelete] = useState<AdmissionDocumentTypeOption | null>(
    null,
  );
  const query = useAdmissionDocumentTypesQuery({
    search: deferredSearch,
    includeArchived: true,
    status: statusFilter,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const deleteMutation = useDeleteAdmissionDocumentTypeMutation();
  const documentTypes = query.data?.documentTypes ?? EMPTY_DOCUMENT_TYPES;

  const visibleDocumentTypes = documentTypes;
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasDocumentTypeFilter =
    Boolean(deferredSearch.trim()) || statusFilter !== "all";

  const openCreate = () => {
    setSelected(null);
    setEditorKey((current) => current + 1);
    setIsEditorOpen(true);
  };

  const openEdit = (record: AdmissionDocumentTypeOption) => {
    setSelected(record);
    setEditorKey((current) => current + 1);
    setIsEditorOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync({
        name: toDelete.id,
        expectedModified: toDelete.modified,
      });
      toast.success(`Đã xóa loại tài liệu ${toDelete.name}.`);
      setToDelete(null);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa loại tài liệu."));
    }
  };

  return (
    <>
      <AdmissionCatalogPanel
        title="Loại tài liệu"
        description="Danh mục giấy tờ dùng để xây dựng checklist hồ sơ nhập học."
        count={query.data?.total ?? documentTypes.length}
        canManage={canManage}
        createLabel="Thêm loại tài liệu"
        onCreate={openCreate}
        isBusy={query.isPending || deleteMutation.isPending}
      >
        {query.isPending ? (
          <CatalogLoading label="Đang tải danh mục loại tài liệu…" />
        ) : query.error ? (
          <CatalogError
            message={errorMessage(
              query.error,
              "Không thể tải danh mục loại tài liệu.",
            )}
            onRetry={() => void query.refetch()}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-card-border px-4 py-3 sm:flex-row sm:items-center sm:px-5">
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo mã hoặc tên tài liệu"
                aria-label="Tìm loại tài liệu"
                className="h-9 min-w-0 flex-1 sm:max-w-md"
              />
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(
                    String(value) as AdmissionDocumentTypeStatus | "all",
                  );
                  setPage(1);
                }}
                aria-label="Lọc theo trạng thái loại tài liệu"
                className="w-auto gap-0"
              >
                <SelectTrigger
                  size="sm"
                  className="min-w-40 justify-between whitespace-nowrap"
                >
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent className="min-w-(--trigger-width)">
                  <SelectItem id="all" textValue="Tất cả trạng thái">
                    Tất cả trạng thái
                  </SelectItem>
                  <SelectItem id="Active" textValue="Đang dùng">
                    Đang dùng
                  </SelectItem>
                  <SelectItem id="Archived" textValue="Lưu trữ">
                    Lưu trữ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {visibleDocumentTypes.length === 0 ? (
              <CatalogEmpty
                title={
                  !hasDocumentTypeFilter && documentTypes.length === 0
                    ? "Chưa có loại tài liệu"
                    : "Không tìm thấy loại tài liệu phù hợp"
                }
                description={
                  !hasDocumentTypeFilter && documentTypes.length === 0
                    ? "Tạo loại tài liệu đầu tiên để dùng trong checklist hồ sơ."
                    : "Thử đổi từ khóa hoặc bộ lọc trạng thái."
                }
                action={
                  !hasDocumentTypeFilter && documentTypes.length === 0 && canManage
                    ? openCreate
                    : undefined
                }
                actionLabel="Thêm loại tài liệu"
              />
            ) : (
              <TableRoot fullBleed className="w-full min-w-[760px] border-0">
                <TableHeader className="bg-background-gray-secondary/35">
                  <TableRow>
                    <TableHead className="w-44">Mã</TableHead>
                    <TableHead>Tên loại tài liệu</TableHead>
                    <TableHead>Nhóm</TableHead>
                    <TableHead>Điều kiện</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-24 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleDocumentTypes.map((documentType) => (
                    <TableRow
                      key={documentType.id}
                      className="group hover:bg-background-gray-secondary/30"
                    >
                      <TableCell className="align-top">
                        <span className="font-mono text-xs font-bold tracking-wide text-text-secondary">
                          {documentType.code}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[22rem] align-top">
                        <span className="block font-medium text-text-primary">
                          {documentType.name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-text-tertiary">
                          {documentType.description || "Chưa có mô tả"}
                        </span>
                      </TableCell>
                      <TableCell className="align-top text-sm text-text-secondary">
                        {CATEGORY_LABELS[documentType.category] ||
                          documentType.category}
                      </TableCell>
                      <TableCell className="align-top text-sm text-text-secondary">
                        {documentType.conditionalKey || "Không điều kiện"}
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          color={statusColor(documentType.status)}
                          size="sm"
                        >
                          {documentType.status === "Active" &&
                          documentType.isActive
                            ? "Đang dùng"
                            : "Lưu trữ"}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-end gap-1">
                          {canManage && (
                            <Button
                              aria-label={`Sửa ${documentType.name}`}
                              iconOnly
                              size="sm"
                              appearance="ghost"
                              onPress={() => openEdit(documentType)}
                            >
                              <Pencil1 size={16} aria-hidden="true" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              aria-label={`Xóa ${documentType.name}`}
                              iconOnly
                              size="sm"
                              appearance="ghost"
                              variant="danger"
                              onPress={() => setToDelete(documentType)}
                            >
                              <Trash1 size={16} aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            )}
            {totalPages > 1 && (
              <div className="border-t border-card-border px-5 py-3">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  variant="compact"
                  isDisabled={query.isFetching || deleteMutation.isPending}
                />
              </div>
            )}
          </>
        )}
      </AdmissionCatalogPanel>

      <AdmissionDocumentTypeEditorDialog
        key={`${selected?.id ?? "new"}-${editorKey}`}
        isOpen={isEditorOpen}
        record={selected}
        onOpenChange={(open) => {
          setIsEditorOpen(open);
          if (!open) setSelected(null);
        }}
      />
      <DeleteRecordDialog
        isOpen={Boolean(toDelete)}
        recordType="loại tài liệu"
        recordName={toDelete?.name ?? ""}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setToDelete(null);
        }}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-text-secondary">
          Chỉ loại tài liệu chưa được sử dụng mới có thể xóa. Nếu đang được
          dùng, hãy lưu trữ thay vì xóa.
        </p>
      </DeleteRecordDialog>
    </>
  );
}

function CatalogLoading({ label }: { label: string }) {
  return (
    <div className="space-y-3 px-5 py-8" aria-label={label}>
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
  actionLabel,
}: {
  title: string;
  description: string;
  action?: () => void;
  actionLabel: string;
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
