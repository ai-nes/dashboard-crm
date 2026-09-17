"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/delete-record-dialog";
import {
  useDeleteScoreTemplateMutation,
  useScoreTemplateMutation,
  useScoreTemplatesQuery,
} from "@/hooks/use-admin-catalog-queries";
import {
  getScoreTemplate,
  normalizeCatalogError,
  type ScoreRule,
  type ScoreTemplate,
} from "@/services/api/admin-catalog";

import {
  CatalogListToolbar,
  CatalogPagination,
  CatalogEditorDialog,
  EmptyState,
  ErrorState,
  DateTimePickerField,
  Field,
  LoadingState,
  Panel,
  PanelHeaderActions,
  RowActions,
  SelectInput,
  StatusBadge,
  Table,
  TextInput,
} from "./admin-catalog-ui";
import { ScoreRulesEditor } from "./structured-editors";

const PAGE_SIZE = 10;

type ScoreForm = {
  name?: string;
  template_name: string;
  status: ScoreTemplate["status"];
  start_time: string;
  end_time: string;
  fit_weight: string;
  engagement_weight: string;
  intent_weight: string;
  rules: ScoreRule[];
};

const emptyForm: ScoreForm = {
  template_name: "",
  status: "Draft",
  start_time: "",
  end_time: "",
  fit_weight: "",
  engagement_weight: "",
  intent_weight: "",
  rules: [],
};

export default function ScoreTemplatePanel() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ScoreForm>(emptyForm);
  const [showRuleErrors, setShowRuleErrors] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ScoreTemplate | null>(
    null,
  );
  const query = useScoreTemplatesQuery({
    search,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const save = useScoreTemplateMutation();
  const remove = useDeleteScoreTemplateMutation();

  const editTemplate = async (template: ScoreTemplate) => {
    try {
      const detail = await getScoreTemplate(template.name);
      setForm({
        name: detail.name,
        template_name: detail.template_name,
        status: detail.status,
        start_time: detail.start_time?.slice(0, 16) ?? "",
        end_time: detail.end_time?.slice(0, 16) ?? "",
        fit_weight:
          detail.fit_weight === undefined ? "" : String(detail.fit_weight),
        engagement_weight:
          detail.engagement_weight === undefined
            ? ""
            : String(detail.engagement_weight),
        intent_weight:
          detail.intent_weight === undefined
            ? ""
            : String(detail.intent_weight),
        rules: detail.rules ?? [],
      });
      setShowRuleErrors(false);
      setIsEditorOpen(true);
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể tải Score Template."),
      );
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowRuleErrors(true);
    if (
      !form.template_name.trim() ||
      form.rules.length === 0 ||
      form.rules.some(
        (rule) => rule.rule_kind !== "time_decay" && !rule.signal?.trim(),
      )
    )
      return;
    try {
      const current = query.data?.templates.find(
        (item) => item.name === form.name,
      );
      await save.mutateAsync({
        name: form.name,
        data: {
          template_name: form.template_name.trim(),
          status: form.status,
          start_time: form.start_time || undefined,
          end_time: form.end_time || undefined,
          fit_weight: form.fit_weight ? Number(form.fit_weight) : undefined,
          engagement_weight: form.engagement_weight
            ? Number(form.engagement_weight)
            : undefined,
          intent_weight: form.intent_weight
            ? Number(form.intent_weight)
            : undefined,
          rules: form.rules,
        },
        expectedModified: current?.modified,
      });
      toast.success("Đã lưu Score Template.");
      setForm(emptyForm);
      setShowRuleErrors(false);
      setIsEditorOpen(false);
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể lưu Score Template."),
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync({
        name: pendingDelete.name,
        expectedModified: pendingDelete.modified,
      });
      toast.success("Đã xóa Score Template.");
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể xóa Score Template."),
      );
    }
  };

  const resetEditor = () => {
    setForm(emptyForm);
    setShowRuleErrors(false);
    setIsEditorOpen(false);
  };

  return (
    <Panel
      title="Mẫu chấm điểm"
      description="Thiết lập các mẫu và luật chấm điểm cho lead."
      actions={
        <PanelHeaderActions
          createLabel="Thêm template"
          isDisabled={save.isPending || remove.isPending}
          onCreate={() => {
            setForm(emptyForm);
            setShowRuleErrors(false);
            setIsEditorOpen(true);
          }}
        />
      }
    >
      {isEditorOpen ? (
        <CatalogEditorDialog
          title={form.name ? "Chỉnh sửa Score Template" : "Thêm Score Template"}
          description="Thiết lập trọng số và thêm các luật chấm điểm để tạo policy có thể áp dụng."
          isOpen={isEditorOpen}
          isSaving={save.isPending}
          submitLabel={form.name ? "Cập nhật mẫu" : "Thêm mẫu chấm điểm"}
          onOpenChange={(open) => {
            if (!open) resetEditor();
          }}
          onSubmit={submit}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Tên template">
              <TextInput
                required
                value={form.template_name}
                onChange={(event) =>
                  setForm({ ...form, template_name: event.target.value })
                }
              />
            </Field>
            <Field label="Trạng thái">
              <SelectInput
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as ScoreForm["status"],
                  })
                }
              >
                <option>Draft</option>
                <option>Active</option>
                <option>Inactive</option>
              </SelectInput>
            </Field>
            <div className="xl:col-span-2">
              <Field label="Bắt đầu">
                <DateTimePickerField
                  value={form.start_time}
                  onChange={(value) => setForm({ ...form, start_time: value })}
                  ariaLabel="Thời điểm bắt đầu mẫu chấm điểm"
                  disabled={save.isPending}
                />
              </Field>
            </div>
            <div className="xl:col-span-2">
              <Field label="Kết thúc">
                <DateTimePickerField
                  value={form.end_time}
                  onChange={(value) => setForm({ ...form, end_time: value })}
                  ariaLabel="Thời điểm kết thúc mẫu chấm điểm"
                  disabled={save.isPending}
                />
              </Field>
            </div>
            <Field label="Fit weight">
              <TextInput
                type="number"
                step="0.01"
                value={form.fit_weight}
                onChange={(event) =>
                  setForm({ ...form, fit_weight: event.target.value })
                }
              />
            </Field>
            <Field label="Engagement weight">
              <TextInput
                type="number"
                step="0.01"
                value={form.engagement_weight}
                onChange={(event) =>
                  setForm({ ...form, engagement_weight: event.target.value })
                }
              />
            </Field>
            <Field label="Intent weight">
              <TextInput
                type="number"
                step="0.01"
                value={form.intent_weight}
                onChange={(event) =>
                  setForm({ ...form, intent_weight: event.target.value })
                }
              />
            </Field>
            <ScoreRulesEditor
              rules={form.rules}
              onChange={(rules) => setForm({ ...form, rules })}
              showErrors={showRuleErrors}
            />
            {showRuleErrors && form.rules.length === 0 ? (
              <p
                className="text-xs text-input-error md:col-span-2 xl:col-span-4"
                role="alert"
              >
                Thêm ít nhất một rule cho template.
              </p>
            ) : null}
          </div>
        </CatalogEditorDialog>
      ) : null}
      <div className="mt-0">
        <CatalogListToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          total={query.data?.total ?? 0}
          placeholder="Tìm theo tên Score Template…"
        />
        {query.isPending ? (
          <LoadingState label="Đang tải Score Template…" />
        ) : query.error ? (
          <ErrorState
            message={query.error.message}
            onRetry={() => void query.refetch()}
          />
        ) : query.data?.templates.length ? (
          <>
            <Table
              caption="Danh sách Score Template"
              headers={[
                "Template",
                "Status",
                "Thời gian",
                "Revision",
                "Thao tác",
              ]}
            >
              {query.data.templates.map((template) => (
                <tr key={template.name}>
                  <td className="px-3 py-3 font-medium text-text-primary">
                    {template.template_name}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      tone={
                        template.status === "Active"
                          ? "success"
                          : template.status === "Inactive"
                            ? "danger"
                            : "gray"
                      }
                    >
                      {template.status}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {template.start_time?.slice(0, 16) || "—"} →{" "}
                    {template.end_time?.slice(0, 16) || "—"}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {template.policy_revision ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    <RowActions
                      isDisabled={remove.isPending || save.isPending}
                      onEdit={() => void editTemplate(template)}
                      onDelete={() => setPendingDelete(template)}
                    />
                  </td>
                </tr>
              ))}
            </Table>
            <CatalogPagination
              page={page}
              total={query.data.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              isDisabled={
                query.isFetching || remove.isPending || save.isPending
              }
            />
          </>
        ) : (
          <EmptyState>
            {search
              ? "Không tìm thấy Score Template."
              : "Chưa có Score Template."}
          </EmptyState>
        )}
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        ariaLabel="Xác nhận xóa Score Template"
        title={`Xóa ${pendingDelete?.template_name ?? "template"}?`}
        description="Chỉ xóa template không còn được tham chiếu bởi nghiệp vụ chấm điểm."
        confirmLabel={remove.isPending ? "Đang xóa…" : "Xóa template"}
        confirmVariant="danger"
        isConfirming={remove.isPending}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </Panel>
  );
}
