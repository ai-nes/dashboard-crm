"use client";

import { Eye, Sparkle } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertContent, AlertDescription, AlertIndicator } from "@/components/tailgrids/core/alert";
import { Button } from "@/components/tailgrids/core/button";
import { Dialog, DialogBody, DialogClose, DialogFooter } from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useNbaActionsQuery } from "@/hooks/use-nba-actions-queries";
import {
  useArchiveNbaRuleMutation,
  useCreateNbaRuleMutation,
  useDeleteNbaRuleMutation,
  useNbaConditionFieldsQuery,
  useNbaRuleQuery,
  useNbaTimingPoliciesQuery,
  usePublishNbaRuleMutation,
  useUpdateNbaRuleMutation,
} from "@/hooks/use-nba-admin-queries";
import { previewRecommendationRule, type NbaRecommendationRule, type RecommendationRulePayload, type RuleConditions, type RulePreviewResult } from "@/services/api/nba-admin";

import { RuleStatusBadge } from "./status-badges";
import NbaAdminDialogHeader from "../../nba-actions/_components/nba-admin-dialog-header";
import RuleConditionBuilder from "../../nba-actions/_components/rule-condition-builder";

interface RuleEditorDialogProps {
  rule: NbaRecommendationRule | null;
  canEdit: boolean;
  onClose: () => void;
}

interface RuleFormState {
  ruleKey: string;
  displayName: string;
  description: string;
  actionCode: string;
  priority: NbaRecommendationRule["priority"];
  triggerType: NbaRecommendationRule["triggerType"];
  triggerEvent: string;
  timingPolicy: string;
  cooldownValue: string;
  cooldownUnit: NbaRecommendationRule["cooldownUnit"];
  maxOccurrences: string;
  expiresAfterHours: string;
  conditions: RuleConditions;
  stopConditions: string;
}

const priorityOptions = [
  { id: "high", label: "Cao" },
  { id: "medium", label: "Trung bình" },
  { id: "low", label: "Thấp" },
] as const;

const triggerOptions = [
  { id: "event", label: "Theo sự kiện" },
  { id: "state", label: "Theo trạng thái" },
  { id: "inactivity", label: "Khi không tương tác" },
  { id: "deadline", label: "Trước hạn" },
  { id: "manual", label: "Kích hoạt thủ công" },
] as const;

const unitOptions = [
  { id: "minutes", label: "Phút" },
  { id: "hours", label: "Giờ" },
  { id: "days", label: "Ngày" },
] as const;

function emptyConditions(): RuleConditions {
  return { all: [], any: [] };
}

function formFromRule(rule: NbaRecommendationRule | null): RuleFormState {
  return {
    ruleKey: rule?.ruleKey ?? "",
    displayName: rule?.displayName ?? "",
    description: rule?.description ?? "",
    actionCode: rule?.actionCode ?? "",
    priority: rule?.priority ?? "medium",
    triggerType: rule?.triggerType ?? "event",
    triggerEvent: rule?.triggerEvent ?? "",
    timingPolicy: rule?.timingPolicy ?? "",
    cooldownValue: String(rule?.cooldownValue ?? 0),
    cooldownUnit: rule?.cooldownUnit ?? "days",
    maxOccurrences: String(rule?.maxOccurrences ?? 1),
    expiresAfterHours: rule?.expiresAfterHours === null || rule?.expiresAfterHours === undefined ? "" : String(rule.expiresAfterHours),
    conditions: rule?.conditions ?? emptyConditions(),
    stopConditions: rule?.stopConditions.join("\n") ?? "",
  };
}

function FormSelect({ label, value, options, onChange, disabled }: { label: string; value: string; options: readonly { id: string; label: string }[]; onChange: (value: string) => void; disabled?: boolean }) {
  return <div className="space-y-1"><span className="text-xs font-medium text-input-label-text">{label}</span><Select value={value} onChange={(next) => onChange(String(next))} isDisabled={disabled} aria-label={label}><SelectTrigger className="h-9 w-full text-sm"><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.id} id={option.id}>{option.label}</SelectItem>)}</SelectContent></Select></div>;
}

function payloadFromForm(form: RuleFormState, isNew: boolean): RecommendationRulePayload {
  return {
    ...(isNew ? { ruleKey: form.ruleKey.trim() } : {}),
    displayName: form.displayName.trim(),
    description: form.description.trim(),
    actionCode: form.actionCode,
    priority: form.priority,
    triggerType: form.triggerType,
    triggerEvent: form.triggerEvent.trim(),
    timingPolicy: form.timingPolicy || null,
    cooldownValue: Number(form.cooldownValue) || 0,
    cooldownUnit: form.cooldownUnit,
    maxOccurrences: Number(form.maxOccurrences) || 1,
    expiresAfterHours: form.expiresAfterHours.trim() ? Number(form.expiresAfterHours) : null,
    conditions: form.conditions,
    stopConditions: form.stopConditions.split("\n").map((item) => item.trim()).filter(Boolean),
  };
}

export default function RuleEditorDialog({ rule, canEdit, onClose }: RuleEditorDialogProps) {
  const detailQuery = useNbaRuleQuery(rule?.name ?? "");
  const actionsQuery = useNbaActionsQuery({ pageLength: 100 });
  const timingQuery = useNbaTimingPoliciesQuery({ pageLength: 100 });
  const fieldsQuery = useNbaConditionFieldsQuery();
  const createMutation = useCreateNbaRuleMutation();
  const updateMutation = useUpdateNbaRuleMutation();
  const publishMutation = usePublishNbaRuleMutation();
  const archiveMutation = useArchiveNbaRuleMutation();
  const deleteMutation = useDeleteNbaRuleMutation();
  const actualRule = detailQuery.data ?? rule;
  const [form, setForm] = useState(() => formFromRule(rule));
  const [student, setStudent] = useState("STU-0001");
  const [lifecycleStage, setLifecycleStage] = useState("Lead");
  const [ownerStaff, setOwnerStaff] = useState("");
  const [preview, setPreview] = useState<RulePreviewResult | null>(null);
  const isNew = !actualRule;
  const isPublished = actualRule?.status === "published";
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const actions = actionsQuery.data?.actions ?? [];
  const policies = timingQuery.data?.policies ?? [];

  const setField = <K extends keyof RuleFormState>(field: K, value: RuleFormState[K]) => setForm((current) => ({ ...current, [field]: value }));

  const validate = () => {
    if (isNew && !form.ruleKey.trim()) return "Vui lòng nhập mã quy tắc.";
    if (!form.displayName.trim()) return "Vui lòng nhập tên quy tắc.";
    if (!form.actionCode) return "Hãy chọn hành động được đề xuất.";
    if (form.triggerType === "event" && !form.triggerEvent.trim()) return "Quy tắc theo sự kiện cần có mã sự kiện.";
    if (Number(form.cooldownValue) < 0 || Number(form.maxOccurrences) < 1) return "Giá trị giới hạn lặp chưa hợp lệ.";
    return null;
  };

  const saveDraft = async (closeAfterSave = true): Promise<NbaRecommendationRule | null> => {
    const error = validate();
    if (error) {
      toast.error(error);
      return null;
    }
    try {
      const payload = payloadFromForm(form, isNew);
      const saved = actualRule ? await updateMutation.mutateAsync({ name: actualRule.name, payload }) : await createMutation.mutateAsync(payload);
      toast.success("Đã lưu bản nháp quy tắc đề xuất.");
      if (closeAfterSave) onClose();
      return saved;
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Chưa thể lưu quy tắc đề xuất.");
      return null;
    }
  };

  const handlePublish = async () => {
    const saved = await saveDraft(false);
    const target = saved ?? actualRule;
    if (!target) return;
    try {
      await publishMutation.mutateAsync({ name: target.name, expectedVersion: target.version });
      toast.success("Đã phát hành quy tắc đề xuất.");
      onClose();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Chưa thể phát hành quy tắc.");
    }
  };

  const handleArchive = async () => {
    if (!actualRule || !window.confirm(`Lưu trữ quy tắc ${actualRule.ruleKey}?`)) return;
    const reason = window.prompt("Lý do lưu trữ quy tắc:", "Thay bằng quy tắc mới")?.trim();
    if (!reason) return;
    try {
      await archiveMutation.mutateAsync({ name: actualRule.name, reason });
      toast.success("Đã lưu trữ quy tắc.");
      onClose();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Chưa thể lưu trữ quy tắc.");
    }
  };

  const handleDelete = async () => {
    if (!actualRule || actualRule.status !== "draft" || !window.confirm(`Xóa bản nháp ${actualRule.ruleKey}?`)) return;
    try {
      await deleteMutation.mutateAsync(actualRule.name);
      toast.success("Đã xóa bản nháp quy tắc.");
      onClose();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Chưa thể xóa bản nháp quy tắc.");
    }
  };

  const handlePreview = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    try {
      const result = await previewRecommendationRule({ rule: payloadFromForm(form, isNew), context: { student: student.trim(), lifecycleStage: lifecycleStage.trim(), ownerStaff: ownerStaff.trim() } });
      setPreview(result);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Chưa thể xem trước quy tắc.");
    }
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog aria-label={isNew ? "Tạo quy tắc đề xuất" : `Chỉnh sửa ${actualRule?.displayName}`} className="max-h-[calc(100vh-2rem)] max-w-160 overflow-hidden p-0">
        <NbaAdminDialogHeader
          code={actualRule?.ruleKey ?? "RULE_MỚI"}
          title={isNew ? "Tạo quy tắc đề xuất" : isPublished ? "Tạo bản nháp từ quy tắc đã phát hành" : "Chỉnh sửa quy tắc đề xuất"}
          description="Thiết lập điều kiện để hệ thống gợi ý việc phù hợp cho từng hồ sơ tuyển sinh."
          canEdit={canEdit}
          status={actualRule && <RuleStatusBadge status={actualRule.status} />}
        />

        <DialogBody className="max-h-[min(44rem,calc(100vh-10rem))] space-y-3 overflow-y-auto px-5 py-3.5">
          {!canEdit && <Alert status="info"><AlertIndicator /><AlertContent><AlertDescription>Bạn có thể xem quy tắc. Chỉ System Manager được thay đổi cấu hình.</AlertDescription></AlertContent></Alert>}
          {isPublished && <Alert status="info"><AlertIndicator><Sparkle aria-hidden="true" /></AlertIndicator><AlertContent><AlertDescription>Quy tắc đã phát hành sẽ chuyển về bản nháp và tắt khi bạn lưu thay đổi.</AlertDescription></AlertContent></Alert>}

          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2"><span className="text-xs font-medium text-input-label-text">Mã quy tắc</span><Input value={form.ruleKey} onChange={(event) => setField("ruleKey", event.target.value)} readOnly={!isNew} disabled={!canEdit || !isNew} placeholder="Ví dụ: unaddressed_intent" className="h-9 w-full px-3 py-2 text-sm" /></label>
            <label className="space-y-1 sm:col-span-2"><span className="text-xs font-medium text-input-label-text">Tên quy tắc</span><Input value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} disabled={!canEdit} placeholder="Ví dụ: Xử lý nhu cầu chưa được phản hồi" className="h-9 w-full px-3 py-2 text-sm" /></label>
            <label className="space-y-1 sm:col-span-2"><span className="text-xs font-medium text-input-label-text">Mô tả</span><TextArea value={form.description} onChange={(event) => setField("description", event.target.value)} disabled={!canEdit} rows={2} placeholder="Mô tả ngắn về tình huống áp dụng" className="px-3 py-2.5 text-sm" /></label>
            <FormSelect label="Hành động được đề xuất" value={form.actionCode} options={actions.map((action) => ({ id: action.code, label: `${action.displayName} · ${action.code}` }))} onChange={(value) => setField("actionCode", value)} disabled={!canEdit || actionsQuery.isPending} />
            <FormSelect label="Mức ưu tiên" value={form.priority} options={priorityOptions} onChange={(value) => setField("priority", value as RuleFormState["priority"])} disabled={!canEdit} />
            <FormSelect label="Loại kích hoạt" value={form.triggerType} options={triggerOptions} onChange={(value) => setField("triggerType", value as RuleFormState["triggerType"])} disabled={!canEdit} />
            <label className="space-y-1"><span className="text-xs font-medium text-input-label-text">Sự kiện kích hoạt</span><Input value={form.triggerEvent} onChange={(event) => setField("triggerEvent", event.target.value)} disabled={!canEdit} placeholder="Ví dụ: intent.created" className="h-9 w-full px-3 py-2 text-sm" /></label>
            <FormSelect label="Chính sách thời gian" value={form.timingPolicy || "none"} options={[{ id: "none", label: "Không gắn chính sách" }, ...policies.map((policy) => ({ id: policy.policyKey, label: policy.policyKey }))]} onChange={(value) => setField("timingPolicy", value === "none" ? "" : value)} disabled={!canEdit || timingQuery.isPending} />
            <div className="grid grid-cols-2 gap-2"><label className="space-y-1"><span className="text-xs font-medium text-input-label-text">Giới hạn lặp</span><Input type="number" min="0" value={form.cooldownValue} onChange={(event) => setField("cooldownValue", event.target.value)} disabled={!canEdit} className="h-9 w-full px-3 py-2 text-sm" /></label><FormSelect label="Đơn vị" value={form.cooldownUnit} options={unitOptions} onChange={(value) => setField("cooldownUnit", value as RuleFormState["cooldownUnit"])} disabled={!canEdit} /></div>
            <label className="space-y-1"><span className="text-xs font-medium text-input-label-text">Số lần tối đa</span><Input type="number" min="1" value={form.maxOccurrences} onChange={(event) => setField("maxOccurrences", event.target.value)} disabled={!canEdit} className="h-9 w-full px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium text-input-label-text">Hết hạn sau (giờ)</span><Input type="number" min="0" value={form.expiresAfterHours} onChange={(event) => setField("expiresAfterHours", event.target.value)} disabled={!canEdit} placeholder="Không đặt" className="h-9 w-full px-3 py-2 text-sm" /></label>
          </div>

          <RuleConditionBuilder title="Tất cả điều kiện phải đúng" conditions={form.conditions.all} metadata={fieldsQuery.data ?? []} disabled={!canEdit || fieldsQuery.isPending} onChange={(all) => setField("conditions", { ...form.conditions, all })} />
          <RuleConditionBuilder title="Ít nhất một điều kiện phải đúng" conditions={form.conditions.any} metadata={fieldsQuery.data ?? []} disabled={!canEdit || fieldsQuery.isPending} onChange={(any) => setField("conditions", { ...form.conditions, any })} />
          {fieldsQuery.error && <Alert status="error"><AlertIndicator /><AlertContent><AlertDescription>Không tải được danh sách trường điều kiện. Hãy thử lại trước khi lưu.</AlertDescription></AlertContent></Alert>}

          <label className="block space-y-1"><span className="text-xs font-medium text-input-label-text">Điều kiện dừng</span><TextArea value={form.stopConditions} onChange={(event) => setField("stopConditions", event.target.value)} disabled={!canEdit} rows={2} placeholder="Mỗi điều kiện một dòng, ví dụ: student_converted" className="px-3 py-2.5 text-sm" /></label>

          <section className="space-y-2.5 rounded-lg border border-card-border bg-background-gray-secondary_alt p-3"><div><h3 className="text-[13px] font-semibold text-text-primary">Thử trên hồ sơ tuyển sinh</h3><p className="mt-0.5 text-[11px] leading-4 text-text-secondary">Preview trả kết quả đủ điều kiện và cảnh báo, không tạo Recommendation thật.</p></div><div className="grid gap-2 sm:grid-cols-3"><label className="space-y-1"><span className="text-[11px] font-medium text-input-label-text">Mã hồ sơ</span><Input value={student} onChange={(event) => setStudent(event.target.value)} className="h-9 w-full px-3 py-2 text-sm" /></label><label className="space-y-1"><span className="text-[11px] font-medium text-input-label-text">Giai đoạn</span><Input value={lifecycleStage} onChange={(event) => setLifecycleStage(event.target.value)} className="h-9 w-full px-3 py-2 text-sm" /></label><label className="space-y-1"><span className="text-[11px] font-medium text-input-label-text">Nhân viên phụ trách</span><Input value={ownerStaff} onChange={(event) => setOwnerStaff(event.target.value)} className="h-9 w-full px-3 py-2 text-sm" /></label></div><Button size="sm" appearance="outline" onPress={() => void handlePreview()} isDisabled={fieldsQuery.isPending}><Eye size={16} aria-hidden="true" />Xem trước</Button>{preview && <PreviewResult result={preview} />}</section>
        </DialogBody>

        <DialogFooter className="border-t border-card-border px-5 py-3 sm:justify-between">
          <div className="flex gap-2">{canEdit && actualRule?.status === "draft" && <Button variant="danger" appearance="ghost" size="sm" onPress={() => void handleDelete()} isDisabled={deleteMutation.isPending}>Xóa bản nháp</Button>}{canEdit && actualRule?.status === "published" && <Button variant="danger" appearance="ghost" size="sm" onPress={() => void handleArchive()} isDisabled={archiveMutation.isPending}>Lưu trữ</Button>}</div>
          <div className="flex flex-wrap justify-end gap-2"><DialogClose appearance="outline" size="sm">Đóng</DialogClose>{canEdit && <Button appearance="outline" size="sm" onPress={() => void saveDraft()} isDisabled={isSaving}>{isSaving ? "Đang lưu…" : isPublished ? "Lưu bản nháp" : "Lưu bản nháp"}</Button>}{canEdit && <Button size="sm" onPress={() => void handlePublish()} isDisabled={isSaving || publishMutation.isPending}>{publishMutation.isPending ? "Đang phát hành…" : "Phát hành"}</Button>}</div>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}

function PreviewResult({ result }: { result: RulePreviewResult }) {
  return <Alert status={result.eligible ? "success" : "warning"}><AlertIndicator /><AlertContent><AlertDescription><p className="font-medium">{result.eligible ? "Hồ sơ đủ điều kiện" : result.reason ?? "Hồ sơ chưa đủ điều kiện"}</p>{result.action && <p className="mt-1">Hành động: <strong>{result.action.displayName}</strong> · {result.action.available ? "có thể thực hiện" : "chưa sẵn sàng"}</p>}{result.timing?.nextAt && <p className="mt-1">Dự kiến: {result.timing.nextAt}</p>}{result.warnings.length > 0 && <ul className="mt-2 list-disc pl-4">{result.warnings.map((warning) => <li key={warning.code}>{warning.message}</li>)}</ul>}</AlertDescription></AlertContent></Alert>;
}
