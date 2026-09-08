"use client";

import { InfoTriangle } from "@tailgrids/icons";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  leadAssignmentBatchKeys,
  useRetryLeadAssignmentBatchMutation,
} from "@/hooks/use-lead-assignment-batch-queries";
import {
  useReopenLeadMutation,
  useUpdateLeadMutation,
} from "@/hooks/use-lead-sale-leads-queries";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type {
  LeadAssignmentHistoryItem,
  LeadUpdateFields,
} from "@/services/api/lead-sale";

import {
  assignmentReasonLabel,
  itemStatusColors,
  itemStatusLabels,
} from "./batch-assignment-mappings";
import DetailDrawer from "../student-assignment/detail-drawer";

const emptyOption: EditableDetailOption = { id: "", label: "Chưa cập nhật" };

function toOptions(
  options: Array<{ value: string; label: string }> | undefined,
  currentValue: string,
): EditableDetailOption[] {
  const mapped =
    options?.map(({ value, label }) => ({ id: value, label })) ?? [];
  if (currentValue && !mapped.some((option) => option.id === currentValue)) {
    mapped.unshift({ id: currentValue, label: currentValue });
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
  const [province, setProvince] = useState(item.province ?? "");
  const [branch, setBranch] = useState(item.branch ?? "");
  const [step, setStep] = useState<string | null>(null);

  const updateMutation = useUpdateLeadMutation();
  const reopenMutation = useReopenLeadMutation();
  const retryMutation = useRetryLeadAssignmentBatchMutation();

  const provinceOptionsQuery = useStudentSchoolFieldOptions({
    doctype: "CRM Lead",
    fieldname: "province",
  });
  const branchOptionsQuery = useStudentSchoolFieldOptions({
    doctype: "CRM Lead",
    fieldname: "branch",
  });

  const isClosed = item.processingStatus === "CLOSED";
  const isDirty =
    province !== (item.province ?? "") || branch !== (item.branch ?? "");
  const isBusy = step !== null;

  async function handleResolve() {
    try {
      if (isDirty) {
        setStep("Đang lưu thông tin hồ sơ…");
        const fields: LeadUpdateFields = {};
        if (province !== (item.province ?? "")) {
          fields.province = province || null;
        }
        if (branch !== (item.branch ?? "")) {
          fields.branch = branch || null;
        }
        await updateMutation.mutateAsync({ leadId: item.leadId, fields });
      }

      if (isClosed) {
        setStep("Đang mở lại hồ sơ…");
        const reopened = await reopenMutation.mutateAsync({
          lead: item.leadId,
          reason: "Mở lại hồ sơ sau khi bổ sung thông tin phân công.",
        });
        // Reopening replays intake validation. A record still missing CCCD,
        // trường THPT or ngành quan tâm closes again instead of moving on.
        if (reopened.status !== "PROCESSED") {
          await queryClient.invalidateQueries({
            queryKey: leadAssignmentBatchKeys.all,
          });
          toast.error(
            "Hồ sơ vẫn chưa qua được bước kiểm tra dữ liệu: cần đủ CCCD, trường THPT và ngành quan tâm.",
          );
          return;
        }
      }

      setStep("Đang phân công lại…");
      await retryMutation.mutateAsync({
        batchId: item.batchId,
        itemIds: [item.id],
      });
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
      subtitle={`XỬ LÝ HỒ SƠ LEAD · ${item.leadId}`}
      onClose={onClose}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge color={itemStatusColors[item.status]}>
          {itemStatusLabels[item.status]}
        </Badge>
        {isClosed && (
          <span className="text-xs text-text-tertiary">Hồ sơ đang đóng</span>
        )}
      </div>

      <div className="mt-5 rounded-xl bg-badge-warning-background p-4 text-badge-warning-text">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <InfoTriangle size={17} aria-hidden="true" />
          Lý do chưa phân công được
        </p>
        <p className="mt-2 text-sm leading-6">{assignmentReasonLabel(item)}</p>
        {item.errorCode === "TEAM_NOT_FOUND_FOR_PROVINCE" && (
          <p className="mt-2 text-sm leading-6">
            Tỉnh này chưa được Team nào phụ trách. Hãy thêm tỉnh cho một Team ở{" "}
            <Link
              href="/lead-sale/team-management"
              className="font-semibold underline"
            >
              Quản lý Team
            </Link>
            , rồi quay lại bấm phân công lại.
          </p>
        )}
      </div>

      <section className="mt-6" aria-labelledby="routing-fix-heading">
        <h2
          id="routing-fix-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Bổ sung thông tin định tuyến
        </h2>
        <p className="mt-1 text-xs leading-5 text-text-tertiary">
          Hệ thống tìm Team theo tỉnh của Lead. Sửa tỉnh hoặc campus rồi bấm xử
          lý lại.
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
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
            label="Campus"
            onChange={setBranch}
            options={toOptions(branchOptionsQuery.data?.options, branch)}
            searchable
            searchPlaceholder="Tìm campus…"
            value={branch}
          />
        </dl>
      </section>

      <section className="mt-6" aria-labelledby="lead-context-heading">
        <h2
          id="lead-context-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Thông tin hồ sơ
        </h2>
        <dl className="mt-3 grid grid-cols-[126px_1fr] gap-x-3 gap-y-3 text-sm">
          <dt className="text-text-tertiary">Số điện thoại</dt>
          <dd className="text-text-primary">{item.phone ?? "—"}</dd>
          <dt className="text-text-tertiary">CCCD</dt>
          <dd className="text-text-primary">{item.idNumber ?? "—"}</dd>
          <dt className="text-text-tertiary">Trường THPT</dt>
          <dd className="text-text-primary">{item.highSchool ?? "—"}</dd>
          <dt className="text-text-tertiary">Ngành quan tâm</dt>
          <dd className="text-text-primary">{item.major ?? "—"}</dd>
          <dt className="text-text-tertiary">Team</dt>
          <dd className="text-text-primary">
            {item.team ?? "Chưa tìm được Team"}
          </dd>
          <dt className="text-text-tertiary">Người phụ trách</dt>
          <dd className="text-text-primary">{item.ownerStaff ?? "Chưa có"}</dd>
        </dl>
      </section>

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
          <Button isDisabled={isBusy} onPress={handleResolve} size="sm">
            {isBusy ? "Đang xử lý…" : "Lưu và phân công lại"}
          </Button>
        </div>
      </div>
    </DetailDrawer>
  );
}
