"use client";

import { InfoTriangle } from "@tailgrids/icons";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/common/auth/auth-provider";
import { canAccessDashboardPath } from "@/components/common/auth/rbac";
import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  useCreateLeadAssignmentBatchMutation,
  useRetryLeadAssignmentBatchMutation,
  useRunLeadAssignmentBatchMutation,
} from "@/hooks/use-lead-assignment-batch-queries";
import {
  leadSaleLeadsKeys,
  useUpdateLeadMutation,
} from "@/hooks/use-lead-sale-leads-queries";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type {
  LeadAssignmentHistoryItem,
  LeadUpdateFields,
} from "@/services/api/lead-sale";

import {
  assignmentActionCategory,
  assignmentActionLinks,
  assignmentReasonLabel,
  extractUnconfiguredStaffEntries,
  itemStatusColors,
  itemStatusLabels,
} from "./batch-assignment-mappings";
import DetailDrawer from "../student-assignment/detail-drawer";

const emptyOption: EditableDetailOption = { id: "", label: "Chưa cập nhật" };

function toOptions(
  options: Array<{ value: string; label: string }> | undefined,
  currentValue: string,
  currentLabel = currentValue,
): EditableDetailOption[] {
  const mapped =
    options?.map(({ value, label }) => ({ id: value, label })) ?? [];
  if (currentValue && !mapped.some((option) => option.id === currentValue)) {
    mapped.unshift({ id: currentValue, label: currentLabel });
  }
  return [emptyOption, ...mapped];
}

interface AssignmentHistoryItemDrawerProps {
  item: LeadAssignmentHistoryItem;
  onClose: () => void;
}

export default function AssignmentHistoryItemDrawer({
  item,
  onClose,
}: AssignmentHistoryItemDrawerProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [province, setProvince] = useState(item.province ?? "");
  const [branch, setBranch] = useState(item.branch ?? "");
  const [phone, setPhone] = useState(item.phone ?? "");
  const [highSchool, setHighSchool] = useState(item.highSchool ?? "");
  const [major, setMajor] = useState(item.major ?? "");
  const [step, setStep] = useState<string | null>(null);

  const updateMutation = useUpdateLeadMutation();
  const retryMutation = useRetryLeadAssignmentBatchMutation();
  const createBatchMutation = useCreateLeadAssignmentBatchMutation();
  const runBatchMutation = useRunLeadAssignmentBatchMutation();

  const provinceOptionsQuery = useStudentSchoolFieldOptions({
    doctype: "CRM Lead",
    fieldname: "province",
  });
  const branchOptionsQuery = useStudentSchoolFieldOptions({
    doctype: "CRM Lead",
    fieldname: "branch",
  });
  const highSchoolOptionsQuery = useStudentSchoolFieldOptions({
    doctype: "CRM Lead",
    fieldname: "high_school",
    province: province || undefined,
  });
  const majorOptionsQuery = useStudentSchoolFieldOptions({
    doctype: "CRM Lead",
    fieldname: "major",
  });

  const isClosed = item.status === "skipped";
  // A Lead that IS assigned must never show a "why it wasn't assigned" panel —
  // `item.reason` is a stale snapshot from whenever the batch last ran (e.g. an
  // earlier manual_review reason), while `item.status` reflects the Lead's
  // live, current outcome; once assigned, the old reason is no longer relevant.
  const isAssigned = item.status === "assigned";
  // What actually fixes this failure — a Team/capacity problem is never
  // resolved by editing the Lead's own phone/province/school, so the drawer
  // must not show that form (or imply it's the fix) for those categories.
  const actionCategory = assignmentActionCategory(item);
  const actionLink =
    actionCategory === "team-config" || actionCategory === "staff-capacity"
      ? assignmentActionLinks[actionCategory]
      : null;
  // Quản lý người dùng is Admin/System Manager-only — a Sale/CTV Sale viewer
  // can never open it, so a clickable link would be a dead end. Point them
  // at an Admin instead of a route their own role can't reach.
  const canOpenActionLink = Boolean(
    actionLink && canAccessDashboardPath(actionLink.href, user?.roles),
  );
  const unconfiguredStaff =
    actionCategory === "staff-capacity" ? extractUnconfiguredStaffEntries(item.reason) : [];
  const isLiveReview = !item.batchId;
  const isDirty =
    phone !== (item.phone ?? "") ||
    province !== (item.province ?? "") ||
    highSchool !== (item.highSchool ?? "") ||
    major !== (item.major ?? "") ||
    branch !== (item.branch ?? "");
  const isBusy = step !== null;

  async function handleResolve() {
    if (isClosed || isAssigned) return;

    try {
      if (isDirty) {
        setStep("Đang lưu thông tin hồ sơ…");
        const fields: LeadUpdateFields = {};
        if (phone !== (item.phone ?? "")) {
          fields.phone = phone || null;
        }
        if (province !== (item.province ?? "")) {
          fields.province = province || null;
        }
        if (highSchool !== (item.highSchool ?? "")) {
          fields.high_school = highSchool || null;
        }
        if (major !== (item.major ?? "")) {
          fields.major = major || null;
        }
        if (branch !== (item.branch ?? "")) {
          fields.branch = branch || null;
        }
        await updateMutation.mutateAsync({ leadId: item.leadId, fields });
      }

      setStep("Đang phân công lại…");
      if (isLiveReview) {
        const created = await createBatchMutation.mutateAsync({
          batchName: `Phân công lại ${item.leadId} ${Date.now()}`,
          leadIds: [item.leadId],
          description: "Xử lý lại hồ sơ từ danh sách cần kiểm tra.",
        });
        setStep("Đang ghi nhận người phụ trách…");
        await runBatchMutation.mutateAsync({ batchId: created.batch.id });
      } else {
        await retryMutation.mutateAsync({
          batchId: item.batchId,
          itemIds: [item.id],
        });
      }
      // The assignment run changes the Lead from CLOSED/PROCESSED to ASSIGNED.
      // Refresh the Lead list cache so the status is updated immediately,
      // without requiring a full page reload.
      await queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all });
      toast.success(`Đã xử lý lại hồ sơ ${item.studentName}.`);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xử lý lại hồ sơ.",
      );
    } finally {
      setStep(null);
    }
  }

  return (
    <DetailDrawer
      title={item.studentName}
      subtitle="XỬ LÝ HỒ SƠ LEAD"
      onClose={onClose}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge color={itemStatusColors[isClosed ? "skipped" : item.status]}>
          {itemStatusLabels[isClosed ? "skipped" : item.status]}
        </Badge>
        {isClosed && (
          <span className="text-xs text-text-tertiary">
            Hồ sơ đã bị loại khỏi luồng phân công
          </span>
        )}
      </div>

      {isAssigned ? (
        <p className="mt-5 rounded-xl bg-badge-success-background p-4 text-sm leading-6 text-badge-success-text">
          Hồ sơ đã được phân công thành công cho người phụ trách hiện tại.
        </p>
      ) : (
        <div className="mt-5 rounded-xl bg-badge-warning-background p-4 text-badge-warning-text">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <InfoTriangle size={17} aria-hidden="true" />
            {isClosed ? "Lý do hồ sơ đã bị loại" : "Lý do chưa phân công được"}
          </p>
          {unconfiguredStaff.length > 0 ? (
            <>
              <p className="mt-2 text-sm leading-6">Chưa thiết lập capacity:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm leading-6">
                {unconfiguredStaff.map((entry) => (
                  <li key={`${entry.name}-${entry.team}`}>
                    <span className="font-semibold">{entry.name}</span> — {entry.team}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm leading-6">{assignmentReasonLabel(item)}</p>
          )}
          {!isClosed && actionLink && (
            <p className="mt-2 text-sm leading-6">
              {canOpenActionLink ? (
                <>
                  Vào{" "}
                  <Link href={actionLink.href} className="font-semibold underline">
                    {actionLink.label}
                  </Link>{" "}
                  để xử lý.
                </>
              ) : (
                <>Liên hệ Admin để xử lý ở {actionLink.label}.</>
              )}
            </p>
          )}
        </div>
      )}

      {!isClosed && !isAssigned && actionCategory === "system" && (
        <p className="mt-4 text-xs leading-5 text-text-tertiary">
          Sự cố này chỉ mang tính tạm thời, không cần chỉnh sửa gì thêm. Bấm
          &quot;Phân công lại&quot; bên dưới để hệ thống thử lại.
        </p>
      )}

      {!isClosed &&
        !isAssigned &&
        (actionCategory === "lead-data" || actionCategory === "unknown") && (
        <section className="mt-6" aria-labelledby="routing-fix-heading">
        <h2
          id="routing-fix-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Bổ sung thông tin định tuyến
        </h2>
        <p className="mt-1 text-xs leading-5 text-text-tertiary">
          Bổ sung đủ họ tên, số điện thoại và tỉnh/thành phố. Sau đó
          hệ thống sẽ tìm Team theo tỉnh và phân công lại.
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <EditableDetailField
            isEditing
            isDisabled={isBusy}
            label="Số điện thoại"
            onChange={setPhone}
            type="tel"
            value={phone}
          />
          <EditableDetailField
            isEditing
            isDisabled={isBusy}
            label="Tỉnh/Thành phố"
            onChange={setProvince}
            options={toOptions(provinceOptionsQuery.data?.options, province)}
            searchable
            searchPlaceholder="Tìm tỉnh/thành phố…"
            value={province}
          />
          <EditableDetailField
            isEditing
            isDisabled={isBusy}
            label="Trường THPT"
            onChange={setHighSchool}
            options={toOptions(
              highSchoolOptionsQuery.data?.options,
              highSchool,
              item.highSchoolLabel ?? highSchool,
            )}
            searchable
            searchPlaceholder="Tìm trường THPT…"
            value={highSchool}
          />
          <EditableDetailField
            isEditing
            isDisabled={isBusy}
            label="Ngành quan tâm"
            onChange={setMajor}
            options={toOptions(majorOptionsQuery.data?.options, major)}
            searchable
            searchPlaceholder="Tìm ngành…"
            value={major}
          />
          <EditableDetailField
            isEditing
            isDisabled={isBusy}
            label="Campus"
            onChange={setBranch}
            options={toOptions(branchOptionsQuery.data?.options, branch)}
            searchable
            searchPlaceholder="Tìm campus…"
            value={branch}
          />
        </dl>
      </section>
      )}

      <div className="mt-8 flex items-center gap-3 border-t border-card-border pt-5">
        {/* Empty until a step starts, so the buttons keep one row to themselves. */}
        <p
          className="min-w-0 flex-1 truncate text-xs text-text-tertiary"
          aria-live="polite"
        >
          {step}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            appearance="outline"
            isDisabled={isBusy}
            onPress={onClose}
            size="sm"
          >
            Đóng
          </Button>
          {!isClosed && !isAssigned && (
            <Button isDisabled={isBusy} onPress={handleResolve} size="sm">
              {isBusy ? "Đang xử lý…" : "Lưu và phân công lại"}
            </Button>
          )}
        </div>
      </div>
    </DetailDrawer>
  );
}
