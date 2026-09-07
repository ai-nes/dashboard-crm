import { UserMultiple1 } from "@tailgrids/icons";
import type { FormEvent } from "react";

import { EditableCard } from "@/components/common/editable-card";
import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { Badge } from "@/components/tailgrids/core/badge";
import type { Student360Data } from "@/services/api/students/types";
import { formatDateTime } from "@/utils/format-date";

export interface ParentProfileForm {
  name: string;
  relation: string;
  involvement: string;
  role: string;
  preferredChannel: string;
  bestContactTime: string;
  consentStatus: string;
}

type ParentProfileField = keyof ParentProfileForm;

interface ParentProfileCardProps {
  parent: Student360Data["parentProfile"];
  form: ParentProfileForm;
  isEditing: boolean;
  canEdit?: boolean;
  isSaving?: boolean;
  onChange: (field: ParentProfileField, value: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}

const involvementTone = {
  Cao: "success",
  "Trung bình": "warning",
  Thấp: "gray",
  "Chưa xác định": "gray",
} as const;

const relationOptions: EditableDetailOption[] = [
  { id: "Bố", label: "Bố" },
  { id: "Mẹ", label: "Mẹ" },
  { id: "Người giám hộ", label: "Người giám hộ" },
  { id: "Khác", label: "Khác" },
];

const involvementOptions: EditableDetailOption[] = [
  { id: "Cao", label: "Cao" },
  { id: "Trung bình", label: "Trung bình" },
  { id: "Thấp", label: "Thấp" },
  { id: "Chưa xác định", label: "Chưa xác định" },
];

const channelOptions: EditableDetailOption[] = [
  { id: "Cuộc gọi", label: "Cuộc gọi" },
  { id: "Zalo", label: "Zalo" },
  { id: "Email", label: "Email" },
];

const consentOptions: EditableDetailOption[] = [
  { id: "Đã đồng ý nhận tư vấn", label: "Đã đồng ý nhận tư vấn" },
  { id: "Chưa đồng ý", label: "Chưa đồng ý" },
  { id: "Đã rút lại", label: "Đã rút lại" },
  { id: "Chưa xác định", label: "Chưa xác định" },
];

export default function ParentProfileCard({
  parent,
  form,
  isEditing,
  isSaving = false,
  onChange,
  onEdit,
  onCancel,
  onSave,
  canEdit = true,
}: ParentProfileCardProps) {
  const involvement = parent.involvement || "Chưa xác định";

  return (
    <EditableCard
      canEdit={canEdit}
      editLabel="Chỉnh sửa hồ sơ phụ huynh"
      headerContent={
        !isEditing && (
          <Badge color={involvementTone[involvement] ?? "gray"}>
            Tham gia {involvement.toLowerCase()}
          </Badge>
        )
      }
      isEditing={isEditing}
      isSaving={isSaving}
      onCancel={onCancel}
      onEdit={onEdit}
      onSave={onSave}
      title="Hồ sơ phụ huynh"
    >
      <ParentIdentity
        form={form}
        isEditing={isEditing}
        onChange={onChange}
        parent={parent}
      />

      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <EditableDetailField
          isEditing={isEditing}
          label="Mức độ tham gia"
          onChange={(value) => onChange("involvement", value)}
          options={involvementOptions}
          value={isEditing ? form.involvement : involvement}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Vai trò quyết định"
          onChange={(value) => onChange("role", value)}
          value={isEditing ? form.role : parent.role}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Kênh liên hệ ưa thích"
          onChange={(value) => onChange("preferredChannel", value)}
          options={channelOptions}
          value={isEditing ? form.preferredChannel : parent.preferredChannel}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Khung giờ phù hợp"
          onChange={(value) => onChange("bestContactTime", value)}
          value={isEditing ? form.bestContactTime : parent.bestContactTime}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Tương tác gần nhất"
          readOnly
          value={formatDateTime(parent.lastInteraction)}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Quyền liên hệ"
          onChange={(value) => onChange("consentStatus", value)}
          options={consentOptions}
          value={isEditing ? form.consentStatus : parent.consentStatus}
        />
      </dl>
    </EditableCard>
  );
}

interface ParentIdentityProps {
  parent: Student360Data["parentProfile"];
  form: ParentProfileForm;
  isEditing: boolean;
  onChange: (field: ParentProfileField, value: string) => void;
}

function ParentIdentity({
  parent,
  form,
  isEditing,
  onChange,
}: ParentIdentityProps) {
  const parentTitle =
    [parent.name, parent.relation].filter(Boolean).join(" · ") || "-";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary-200 bg-badge-primary-background p-4">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary-200 bg-background-white-secondary text-primary-500"
        aria-hidden="true"
      >
        <UserMultiple1 size={18} />
      </span>
      {isEditing ? (
        <dl className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <EditableDetailField
            isEditing
            label="Họ và tên"
            onChange={(value) => onChange("name", value)}
            value={form.name}
          />
          <EditableDetailField
            isEditing
            label="Quan hệ"
            onChange={(value) => onChange("relation", value)}
            options={relationOptions}
            value={form.relation}
          />
        </dl>
      ) : (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {parentTitle}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {parent.role || "-"}
          </p>
        </div>
      )}
    </div>
  );
}
