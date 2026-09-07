"use client";

import { MapMarker5, Shield1Check, Target3 } from "@tailgrids/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { EditableCard } from "@/components/common/editable-card";
import { EditableDetailField } from "@/components/common/editable-detail-field";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  updateStudent,
  type StudentUpdateFields,
} from "@/services/api/student-school-update";
import { studentsKeys } from "@/hooks/use-students-queries";
import { formatDateTime } from "@/utils/format-date";

import type { Student360SectionProps } from "./types";

interface StudentSourceContextProps extends Student360SectionProps {
  studentId: string;
  canEdit?: boolean;
}

export default function StudentSourceContext({
  data,
  studentId,
  canEdit = true,
}: StudentSourceContextProps) {
  const { acquisition, segmentation } = data;
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [advertisingChannel, setAdvertisingChannel] = useState(
    acquisition.firstTouch || "",
  );

  const updateMutation = useMutation({
    mutationFn: (fields: StudentUpdateFields) =>
      updateStudent(studentId, fields),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: studentsKeys.student360(studentId),
      });
      setIsEditing(false);
      toast.success("Đã cập nhật nguồn tiếp cận.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Chưa thể lưu nguồn tiếp cận.",
      );
    },
  });

  const startEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setAdvertisingChannel(acquisition.firstTouch || "");
    setIsEditing(true);
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (advertisingChannel === (acquisition.firstTouch || "")) {
      setIsEditing(false);
      return;
    }
    updateMutation.mutate({
      advertising_channel: nullable(advertisingChannel),
    });
  };

  return (
    <EditableCard
      canEdit={canEdit}
      className="p-5"
      editLabel="Chỉnh sửa nguồn tiếp cận"
      headerContent={
        <Badge color="success">
          <Shield1Check size={13} aria-hidden="true" />
          Nguồn rõ
        </Badge>
      }
      isEditing={isEditing}
      isSaving={updateMutation.isPending}
      onCancel={() => {
        if (!updateMutation.isPending) setIsEditing(false);
      }}
      onEdit={startEditing}
      onSave={save}
      title="Học sinh đến từ đâu"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="student-source-heading"
          className="rounded-xl bg-badge-sky-background p-4"
        >
          <div className="flex items-center gap-2">
            <Target3
              size={17}
              className="text-primary-500"
              aria-hidden="true"
            />
            <h3
              id="student-source-heading"
              className="text-sm font-semibold text-text-primary"
            >
              Kênh và thời điểm tiếp cận
            </h3>
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <EditableDetailField
              isEditing={isEditing}
              label="Lần đầu biết đến trường"
              onChange={setAdvertisingChannel}
              value={isEditing ? advertisingChannel : acquisition.firstTouch}
            />
            <SourceItem label="Nhóm nguồn" value={acquisition.sourceGroup} />
            <SourceItem
              label="Ghi nhận"
              value={formatDateTime(acquisition.capturedAt)}
            />
            <SourceItem label="Chiến dịch" value={acquisition.campaign} />
          </dl>
        </section>

        <section
          aria-labelledby="student-segment-heading"
          className="rounded-xl bg-badge-primary-background p-4"
        >
          <div className="flex items-center gap-2">
            <MapMarker5
              size={17}
              className="text-info-500"
              aria-hidden="true"
            />
            <h3
              id="student-segment-heading"
              className="text-sm font-semibold text-text-primary"
            >
              Nhóm đối tượng
            </h3>
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <SourceItem label="Giai đoạn" value={segmentation.learningStage} />
            <SourceItem
              label="Mục tiêu tiếp cận"
              value={segmentation.approachGoal}
            />
            <SourceItem label="Địa bàn" value={segmentation.geographyTier} />
            <SourceItem label="Nhóm trường" value={segmentation.schoolTier} />
            <SourceItem
              label="Điều kiện kinh tế"
              value={segmentation.economicContext}
            />
          </dl>
        </section>
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-text-tertiary">
        <Shield1Check
          size={14}
          className="mt-0.5 shrink-0 text-success-500"
          aria-hidden="true"
        />
        Đồng ý liên hệ: {acquisition.consent || "-"}
      </p>
    </EditableCard>
  );
}

function SourceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-text-tertiary">{label}</dt>
      <dd
        className="mt-1 text-sm font-medium text-text-primary"
        title={value || "-"}
      >
        {value || "-"}
      </dd>
    </div>
  );
}

function nullable(value: string) {
  return value.trim() || null;
}
