"use client";

import { InfoCircle, Locked3 } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { Toggle } from "@/components/tailgrids/core/toggle";
import { cn } from "@/utils/cn";
import type {
  LeadAssignmentWorkflowInputSettings,
  LeadAssignmentWorkflowReviewSettings,
  LeadAssignmentWorkflowStepSnapshot,
  LeadRoutingPolicy,
} from "@/services/api/lead-sale";
import type {
  StepId,
  WorkflowStep,
} from "../../_shared/student-assignment/types";
import LeadRoutingSettings from "./lead-routing-settings";

type Props = {
  step: WorkflowStep;
  configuration: LeadAssignmentWorkflowStepSnapshot;
  canEdit: boolean;
  isSaving: boolean;
  isDirty: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  onSave: () => void;
};

function isEditable(stepId: StepId): boolean {
  return (
    stepId === "input" ||
    stepId === "classification" ||
    stepId === "matching" ||
    stepId === "review"
  );
}

function ReadOnlySetting({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-card-border py-3 last:border-b-0">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

function FieldChips({ fields }: { fields: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {fields.map((field) => (
        <Badge key={field} color="gray" className="text-[11px]">
          {field}
        </Badge>
      ))}
    </div>
  );
}

function LockedNotice() {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-badge-neutral-background px-3 py-2.5 text-xs leading-5 text-text-secondary">
      <Locked3 size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>
        Bước này luôn bật để bảo vệ dữ liệu và không làm thất lạc Lead.
      </span>
    </div>
  );
}

export default function LeadAssignmentWorkflowStepPanel({
  step,
  configuration,
  canEdit,
  isSaving,
  isDirty,
  reason,
  onReasonChange,
  onSettingsChange,
  onSave,
}: Props) {
  const settings = configuration.settings;
  const editable = canEdit && isEditable(step.id);

  const updateInput = (
    values: Partial<LeadAssignmentWorkflowInputSettings>,
  ) => {
    onSettingsChange({ ...settings, ...values });
  };

  const updateReview = (maxRetries: number) => {
    onSettingsChange({ ...settings, maxRetries });
  };

  return (
    <section
      id="lead-assignment-step-detail"
      aria-labelledby="lead-assignment-step-title"
      className="min-w-0 space-y-6 p-5 lg:p-7"
    >
      <CardHeader>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle id="lead-assignment-step-title" className="text-base">
              {step.id === "matching" ? "Bước 4 · Điều phối Lead" : step.title}
            </CardTitle>
            <Badge
              color={
                configuration.canToggle
                  ? configuration.enabled
                    ? "success"
                    : "gray"
                  : "gray"
              }
            >
              {configuration.canToggle
                ? configuration.enabled
                  ? "Đang bật"
                  : "Đang tắt"
                : "Bắt buộc bật"}
            </Badge>
          </div>
          <CardDescription className="mt-2 max-w-2xl text-sm leading-6">
            {step.id === "matching"
              ? "Chọn thứ tự phân tuyến và cách chia Lead cho người phụ trách."
              : step.detail}
          </CardDescription>
        </div>
      </CardHeader>

      {step.id === "input" && (
        <div className="space-y-4">
          {canEdit ? (
            <>
              <Toggle
                label="Cho phép hệ thống tiếp nhận Lead"
                checked={
                  (settings as LeadAssignmentWorkflowInputSettings).enabled
                }
                disabled={isSaving}
                onChange={(event) =>
                  updateInput({ enabled: event.target.checked })
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-input-label-text">
                    Thời gian chờ tự động (phút)
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={1440}
                    value={String(
                      (settings as LeadAssignmentWorkflowInputSettings)
                        .scheduledMinAgeMinutes,
                    )}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateInput({
                        scheduledMinAgeMinutes: Number(event.target.value) || 0,
                      })
                    }
                    aria-label="Thời gian chờ job tự động"
                    className="h-10 w-full text-sm"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-input-label-text">
                    Giới hạn Lead mỗi lần chạy
                  </span>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={String(
                      (settings as LeadAssignmentWorkflowInputSettings)
                        .maxLeadsPerRun,
                    )}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateInput({
                        maxLeadsPerRun: Number(event.target.value) || 1,
                      })
                    }
                    aria-label="Giới hạn Lead mỗi lần chạy"
                    className="h-10 w-full text-sm"
                  />
                </label>
              </div>
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <ReadOnlySetting
                label="Trạng thái"
                value={
                  (settings as LeadAssignmentWorkflowInputSettings).enabled
                    ? "Đang bật"
                    : "Đang tắt"
                }
              />
              <ReadOnlySetting
                label="Chờ job nền"
                value={`${(settings as LeadAssignmentWorkflowInputSettings).scheduledMinAgeMinutes} phút`}
              />
              <ReadOnlySetting
                label="Giới hạn mỗi lượt"
                value={`${(settings as LeadAssignmentWorkflowInputSettings).maxLeadsPerRun} Lead`}
              />
            </div>
          )}
          <p className="flex items-start gap-2 text-xs leading-5 text-text-tertiary">
            <InfoCircle
              size={14}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            Nút chạy thủ công quét ngay Lead đủ điều kiện; ngưỡng thời gian chỉ
            áp dụng cho job nền.
          </p>
        </div>
      )}

      {step.id === "validation" && (
        <div className="space-y-4">
          <LockedNotice />
          <div className="space-y-3">
            <ReadOnlySetting
              label="Trường bắt buộc"
              value="Họ và tên · Số điện thoại · Tỉnh/thành phố"
            />
            <div>
              <p className="mb-2 text-xs text-text-tertiary">
                Trường bổ sung không chặn phân công
              </p>
              <FieldChips
                fields={
                  (settings as { optionalFields: string[] }).optionalFields
                }
              />
            </div>
            <ReadOnlySetting
              label="Khi thiếu dữ liệu"
              value="Chuyển sang Cần lưu ý"
            />
          </div>
        </div>
      )}

      {step.id === "classification" && (
        <div className="space-y-4">
          {canEdit ? (
            <Toggle
              label="Chạy lại bước xác định kết quả xử lý"
              checked={(settings as { enabled: boolean }).enabled}
              disabled={isSaving}
              onChange={(event) =>
                onSettingsChange({ enabled: event.target.checked })
              }
            />
          ) : (
            <ReadOnlySetting
              label="Trạng thái xác định kết quả"
              value={
                (settings as { enabled: boolean }).enabled
                  ? "Đang bật"
                  : "Đang tắt · dùng kết quả đã lưu"
              }
            />
          )}
          <p className="text-xs leading-5 text-text-tertiary">
            Khi tắt, hệ thống dùng trạng thái xử lý đã lưu trên Lead và không
            chạy lại kiểm tra duplicate trong batch.
          </p>
          <ReadOnlySetting
            label="Student"
            value="Không tạo Student ở bước này"
          />
        </div>
      )}

      {step.id === "matching" && (
        <LeadRoutingSettings
          policy={
            (settings as { routingPolicy: LeadRoutingPolicy }).routingPolicy
          }
          canEdit={canEdit}
          isSaving={isSaving}
          onChange={(routingPolicy) => onSettingsChange({ routingPolicy })}
        />
      )}

      {step.id === "review" && (
        <div className="space-y-4">
          <LockedNotice />
          <ReadOnlySetting label="Cách xử lý lại" value="Thủ công" />
          {canEdit ? (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-input-label-text">
                Số lần xử lý lại tối đa
              </span>
              <Input
                type="number"
                min={0}
                max={10}
                value={String(
                  (settings as LeadAssignmentWorkflowReviewSettings).maxRetries,
                )}
                disabled={isSaving}
                onChange={(event) =>
                  updateReview(Number(event.target.value) || 0)
                }
                aria-label="Số lần xử lý lại tối đa"
                className="h-10 w-full text-sm"
              />
            </label>
          ) : (
            <ReadOnlySetting
              label="Số lần xử lý lại tối đa"
              value={`${(settings as LeadAssignmentWorkflowReviewSettings).maxRetries} lần`}
            />
          )}
          <p className="text-xs leading-5 text-text-tertiary">
            Khi đạt giới hạn, hồ sơ vẫn được giữ trong lịch sử với lý do rõ ràng
            và không tự retry vô hạn.
          </p>
        </div>
      )}

      {step.id === "assignment" && (
        <div className="space-y-4">
          <LockedNotice />
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlySetting
              label="Owner hiện có"
              value="Luôn được giữ nguyên"
            />
            <ReadOnlySetting label="Đối tượng nhận" value="Sale / CTV Sale" />
            <ReadOnlySetting label="Tạo Student" value="Không tạo tự động" />
            <ReadOnlySetting
              label="Audit"
              value="Lưu Team, owner, tải và policy version"
            />
          </div>
        </div>
      )}

      {editable && isDirty && (
        <div className="space-y-2 border-t border-card-border pt-4">
          <label
            className="text-xs font-medium text-input-label-text"
            htmlFor={`workflow-reason-${step.id}`}
          >
            Lý do thay đổi{" "}
            <span className="font-normal text-text-secondary">
              (bắt buộc · ít nhất 5 ký tự)
            </span>
          </label>
          <TextArea
            id={`workflow-reason-${step.id}`}
            required
            minLength={5}
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={2}
            disabled={isSaving}
            placeholder={
              step.id === "matching"
                ? "Ví dụ: Ưu tiên phân Lead theo chiến dịch tuyển sinh"
                : "Ví dụ: Giảm giới hạn batch để kiểm soát tải xử lý"
            }
            className="px-3 py-2.5 text-sm"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p role="status" className="text-xs text-text-secondary">
              Thay đổi chưa được áp dụng.
            </p>
            <Button
              type="button"
              size="sm"
              isDisabled={!isDirty || isSaving || reason.trim().length < 5}
              onPress={onSave}
            >
              {isSaving ? "Đang lưu…" : "Lưu và áp dụng"}
            </Button>
          </div>
        </div>
      )}

      {!canEdit && (
        <p
          className={cn(
            "rounded-lg bg-badge-neutral-background px-3 py-2.5 text-xs leading-5 text-text-secondary",
            editable && "border-t border-card-border pt-4",
          )}
        >
          Bạn chỉ có quyền xem cấu hình workflow. Liên hệ quản trị hoặc Lead
          Sale có quyền vận hành để thay đổi.
        </p>
      )}
    </section>
  );
}
