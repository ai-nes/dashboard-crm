"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/delete-record-dialog";
import { Button } from "@/components/tailgrids/core/button";
import {
  useApproveGovernedChangeMutation,
  useCreateGovernedValueMutation,
  useGovernedChangesQuery,
  useGovernedValuesQuery,
  useProposeGovernedChangeMutation,
} from "@/hooks/use-admin-catalog-queries";
import {
  normalizeCatalogError,
  type GovernedDoctype,
  type GovernedRecord,
} from "@/services/api/admin-catalog";

import {
  CatalogListToolbar,
  CatalogPagination,
  CatalogEditorDialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Panel,
  PanelHeaderActions,
  RowActions,
  StatusBadge,
  Table,
  TextInput,
} from "./admin-catalog-ui";

const PAGE_SIZE = 10;
const CATALOGS: Array<{
  value: GovernedDoctype;
  label: string;
  field: keyof GovernedRecord;
}> = [
  { value: "CRM Campus", label: "Campus", field: "campus_name" },
  { value: "CRM Lead Source", label: "Nguồn lead", field: "source_name" },
  { value: "CRM Platform", label: "Nền tảng", field: "platform_name" },
];

type Proposal = { record: GovernedRecord; action: "Retire" | "Reactivate" };

export default function GovernedReferencePanel() {
  const [doctype, setDoctype] = useState<GovernedDoctype>("CRM Campus");
  const [value, setValue] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reason, setReason] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingProposal, setPendingProposal] = useState<Proposal | null>(null);
  const recordsQuery = useGovernedValuesQuery(doctype, {
    search,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const changesQuery = useGovernedChangesQuery(doctype);
  const createMutation = useCreateGovernedValueMutation();
  const proposeMutation = useProposeGovernedChangeMutation();
  const approveMutation = useApproveGovernedChangeMutation();
  const catalog = CATALOGS.find((item) => item.value === doctype)!;

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createMutation.mutateAsync({
        doctype,
        data: {
          [catalog.field]: value.trim(),
          ...(doctype === "CRM Platform"
            ? { lead_source: leadSource.trim() }
            : {}),
        },
      });
      toast.success("Đã gửi lệnh thêm danh mục.");
      setValue("");
      setLeadSource("");
      setIsEditorOpen(false);
    } catch (error) {
      toast.error(
        normalizeCatalogError(
          error,
          "Không thể thêm danh mục. Kiểm tra quyền owner và rollout governance.",
        ),
      );
    }
  };

  const propose = async () => {
    if (!pendingProposal || !reason.trim()) return;
    try {
      await proposeMutation.mutateAsync({
        doctype,
        docname: pendingProposal.record.name,
        action: pendingProposal.action,
        reason: reason.trim(),
        expectedVersion: pendingProposal.record.version,
      });
      toast.success("Đã tạo đề xuất governance.");
      setPendingProposal(null);
      setReason("");
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể tạo đề xuất governance."),
      );
    }
  };

  const resetEditor = () => {
    setValue("");
    setLeadSource("");
    setIsEditorOpen(false);
  };

  return (
    <Panel
      title="Danh mục dùng chung"
      description="Quản lý các giá trị dùng chung cho campus, nguồn lead và nền tảng."
      actions={
        <PanelHeaderActions
          createLabel="Thêm giá trị"
          isDisabled={createMutation.isPending}
          onCreate={() => {
            setValue("");
            setLeadSource("");
            setIsEditorOpen(true);
          }}
        />
      }
    >
      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Chọn danh mục governed"
      >
        {CATALOGS.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="sm"
            appearance={item.value === doctype ? "fill" : "outline"}
            aria-pressed={item.value === doctype}
            onPress={() => {
              setDoctype(item.value);
              setPage(1);
              setSearch("");
              setValue("");
              setLeadSource("");
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {isEditorOpen ? (
        <CatalogEditorDialog
          title={`Thêm ${catalog.label}`}
          description="Giá trị mới sẽ được gửi qua quy trình phê duyệt của danh mục này."
          isOpen={isEditorOpen}
          isSaving={createMutation.isPending}
          submitLabel="Thêm giá trị"
          onOpenChange={(open) => {
            if (!open) resetEditor();
          }}
          onSubmit={create}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <Field label={catalog.label}>
              <TextInput
                required
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={`Tên ${catalog.label}`}
              />
            </Field>
            {doctype === "CRM Platform" ? (
              <Field label="Lead Source bắt buộc">
                <TextInput
                  required
                  value={leadSource}
                  onChange={(event) => setLeadSource(event.target.value)}
                  placeholder="Tên Lead Source"
                />
              </Field>
            ) : null}
            <div
              className={
                doctype === "CRM Platform" ? "md:col-span-1" : "md:col-span-2"
              }
            ></div>
          </div>
          <p className="mt-3 text-xs text-text-tertiary">
            Nếu governance write gate đang tắt, backend sẽ từ chối và không tạo
            bản ghi giả.
          </p>
        </CatalogEditorDialog>
      ) : null}
      <div className="mt-5">
        <CatalogListToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          total={recordsQuery.data?.total ?? 0}
          placeholder={`Tìm trong ${catalog.label}…`}
        />
        {recordsQuery.isPending ? (
          <LoadingState label={`Đang tải ${catalog.label}…`} />
        ) : recordsQuery.error ? (
          <ErrorState
            message={recordsQuery.error.message}
            onRetry={() => void recordsQuery.refetch()}
          />
        ) : recordsQuery.data?.records.length ? (
          <>
            <Table
              caption={`Danh sách ${catalog.label}`}
              headers={[
                catalog.label,
                "Trạng thái",
                "Owner",
                "Phiên bản",
                "Thao tác",
              ]}
            >
              {recordsQuery.data.records.map((record) => (
                <tr key={record.name}>
                  <td className="px-3 py-3 font-medium text-text-primary">
                    {String(record[catalog.field] ?? record.name)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      tone={
                        record.approval_state === "Approved" ||
                        record.approval_state === "Active"
                          ? "success"
                          : "warning"
                      }
                    >
                      {record.approval_state === "Approved"
                        ? "Đã duyệt"
                        : record.approval_state === "Active"
                          ? "Đang dùng"
                          : "Chờ duyệt"}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {record.owner_role ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {record.version ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    <RowActions
                      isDisabled={proposeMutation.isPending}
                      onDelete={() => {
                        setPendingProposal({ record, action: "Retire" });
                        setReason("");
                      }}
                      deleteLabel="Đề xuất retire"
                    />
                  </td>
                </tr>
              ))}
            </Table>
            <CatalogPagination
              page={page}
              total={recordsQuery.data.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              isDisabled={recordsQuery.isFetching || proposeMutation.isPending}
            />
          </>
        ) : (
          <EmptyState>
            {search
              ? `Không tìm thấy ${catalog.label}.`
              : "Chưa có giá trị đang hiệu lực."}
          </EmptyState>
        )}
      </div>
      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">
          Đề xuất đang chờ
        </h3>
        {changesQuery.isPending ? (
          <LoadingState label="Đang tải đề xuất governance…" />
        ) : changesQuery.error ? (
          <ErrorState
            message={changesQuery.error.message}
            onRetry={() => void changesQuery.refetch()}
          />
        ) : changesQuery.data?.changes.length ? (
          <Table
            caption="Danh sách đề xuất governance"
            headers={[
              "Bản ghi",
              "Hành động",
              "Trạng thái",
              "Người đề xuất",
              "Thao tác",
            ]}
          >
            {changesQuery.data.changes.map((change) => (
              <tr key={change.name}>
                <td className="px-3 py-3 text-text-primary">
                  {change.reference_docname}
                </td>
                <td className="px-3 py-3 text-text-secondary">
                  {change.action}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge tone="warning">{change.status}</StatusBadge>
                </td>
                <td className="px-3 py-3 text-text-secondary">
                  {change.proposed_by ?? "—"}
                </td>
                <td className="px-3 py-3">
                  <Button
                    size="sm"
                    appearance="outline"
                    isDisabled={approveMutation.isPending}
                    onPress={() =>
                      void approveMutation
                        .mutateAsync(change.name)
                        .then(() => toast.success("Đã phê duyệt đề xuất."))
                        .catch((error) =>
                          toast.error(
                            normalizeCatalogError(
                              error,
                              "Không thể phê duyệt.",
                            ),
                          ),
                        )
                    }
                  >
                    Phê duyệt
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState>Không có đề xuất chờ xử lý.</EmptyState>
        )}
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingProposal)}
        ariaLabel="Tạo đề xuất thay đổi governed"
        title={`${pendingProposal?.action === "Retire" ? "Ngừng dùng" : "Kích hoạt lại"} ${pendingProposal?.record.name ?? "bản ghi"}?`}
        description="Đề xuất sẽ được gửi qua quy trình phê duyệt và chưa thay đổi dữ liệu ngay lập tức."
        confirmLabel={proposeMutation.isPending ? "Đang gửi…" : "Gửi đề xuất"}
        isConfirming={proposeMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !proposeMutation.isPending) setPendingProposal(null);
        }}
        onConfirm={propose}
      >
        <Field
          label="Lý do"
          error={
            pendingProposal && !reason.trim()
              ? "Vui lòng nhập lý do."
              : undefined
          }
        >
          <TextInput
            autoFocus
            required
            value={reason}
            aria-invalid={pendingProposal !== null && !reason.trim()}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Nêu lý do thay đổi catalog"
          />
        </Field>
      </ConfirmDialog>
    </Panel>
  );
}
