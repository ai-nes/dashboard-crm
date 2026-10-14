"use client";

import { InfoTriangle } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { useCompleteLeadSupportMutation } from "@/hooks/use-lead-support-queue-queries";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type { LeadSupportItem } from "@/services/api/lead-sale";

import DetailDrawer from "../student-assignment/detail-drawer";
import {
  supportOutcomeMessages,
  supportReasonColors,
  supportReasonDetail,
  supportReasonLabels,
  translateIssues,
} from "./lead-support-mappings";

const emptyOption: EditableDetailOption = { id: "", label: "Chưa cập nhật" };

function toOptions(
  options: Array<{ value: string; label: string }> | undefined,
  current: { id: string; name: string } | null,
): EditableDetailOption[] {
  const mapped =
    options?.map(({ value, label }) => ({ id: value, label })) ?? [];
  if (current && !mapped.some((option) => option.id === current.id)) {
    mapped.unshift({ id: current.id, label: current.name });
  }
  return [emptyOption, ...mapped];
}

interface LeadSupportDrawerProps {
  item: LeadSupportItem;
  onClose: () => void;
}

export default function LeadSupportDrawer({
  item,
  onClose,
}: LeadSupportDrawerProps) {
  const [studentName, setStudentName] = useState(item.studentName);
  const [phone, setPhone] = useState(item.phone);
  const [province, setProvince] = useState(item.province?.id ?? "");
  const [campus, setCampus] = useState(item.campus?.id ?? "");
  const [issues, setIssues] = useState<string | null>(null);
  const mutation = useCompleteLeadSupportMutation();

  const provinceOptions = useStudentSchoolFieldOptions({
    doctype: "CRM Lead",
    fieldname: "province",
  });
  const campusOptions = useStudentSchoolFieldOptions({
    doctype: "CRM Lead",
    fieldname: "branch",
  });

  async function handleSubmit() {
    setIssues(null);
    try {
      const result = await mutation.mutateAsync({
        leadId: item.id,
        expectedRevision: item.revision,
        studentName:
          studentName.trim() !== item.studentName
            ? studentName.trim()
            : undefined,
        phone: phone.trim() !== item.phone ? phone.trim() : undefined,
        provinceId:
          province && province !== item.province?.id ? province : undefined,
        campusId: campus && campus !== item.campus?.id ? campus : undefined,
      });
      if (result.outcome === "still_invalid") {
        setIssues(
          `${supportOutcomeMessages.still_invalid}: ${translateIssues(result.issues)}.`,
        );
        return;
      }
      if (result.outcome === "assigned") {
        toast.success(supportOutcomeMessages.assigned);
      } else {
        toast.info(supportOutcomeMessages[result.outcome]);
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể bổ sung Lead.",
      );
    }
  }

  const isBusy = mutation.isPending;

  return (
    <DetailDrawer
      title={item.studentName || item.leadCode}
      subtitle="BỔ SUNG LEAD"
      onClose={onClose}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge color={supportReasonColors[item.reason]}>
          {supportReasonLabels[item.reason]}
        </Badge>
        <span className="text-xs text-text-tertiary">{item.leadCode}</span>
      </div>

      <div className="mt-5 rounded-xl bg-badge-warning-background p-4 text-badge-warning-text">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <InfoTriangle size={17} aria-hidden="true" />
          Cần bổ sung
        </p>
        <p className="mt-2 text-sm leading-6">{supportReasonDetail(item)}</p>
      </div>

      <section className="mt-6" aria-labelledby="lead-support-form">
        <h2
          id="lead-support-form"
          className="text-sm font-semibold text-text-primary"
        >
          Thông tin Lead
        </h2>
        <p className="mt-1 text-xs leading-5 text-text-tertiary">
          Cần đủ họ tên, số điện thoại (10 số, bắt đầu bằng 0), tỉnh/thành và cơ
          sở. Khi lưu, hệ thống kiểm tra lại và tự phân công nếu đang bật phân
          công tự động.
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <EditableDetailField
            isEditing
            isDisabled={isBusy}
            label="Họ tên"
            onChange={setStudentName}
            value={studentName}
          />
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
            pagination={provinceOptions.pagination}
            options={toOptions(provinceOptions.data?.options, item.province)}
            searchable
            searchPlaceholder="Tìm tỉnh/thành phố…"
            value={province}
          />
          <EditableDetailField
            isEditing
            isDisabled={isBusy}
            label="Cơ sở"
            onChange={setCampus}
            pagination={campusOptions.pagination}
            options={toOptions(campusOptions.data?.options, item.campus)}
            searchable
            searchPlaceholder="Tìm cơ sở…"
            value={campus}
          />
        </dl>
        {item.campaign && (
          <p className="mt-4 text-xs text-text-tertiary">
            Chiến dịch: {item.campaign.name}
            {item.campaign.campusName ? ` · ${item.campaign.campusName}` : ""}
          </p>
        )}
        {issues && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-badge-error-background p-3 text-sm text-badge-error-text"
          >
            {issues}
          </p>
        )}
      </section>

      <div className="mt-8 flex justify-end gap-3 border-t border-card-border pt-5">
        <Button
          appearance="outline"
          isDisabled={isBusy}
          onPress={onClose}
          size="sm"
        >
          Đóng
        </Button>
        <Button isDisabled={isBusy} onPress={handleSubmit} size="sm">
          {isBusy ? "Đang xử lý…" : "Lưu và xử lý"}
        </Button>
      </div>
    </DetailDrawer>
  );
}
