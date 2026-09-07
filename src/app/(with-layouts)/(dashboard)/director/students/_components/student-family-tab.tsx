"use client";

import { Phone } from "@tailgrids/icons";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { EditableCard } from "@/components/common/editable-card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Input } from "@/components/tailgrids/core/input";
import type { Student360Data } from "@/services/api/students/types";

import ParentProfileCard, {
  type ParentProfileForm,
} from "./parent-profile-card";
import type { Student360SectionProps } from "./types";

interface StudentFamilyTabProps extends Student360SectionProps {
  canEdit?: boolean;
}

export default function StudentFamilyTab({
  data,
  canEdit = true,
}: StudentFamilyTabProps) {
  const [parent, setParent] = useState(data.parentProfile);
  const [parentForm, setParentForm] = useState<ParentProfileForm>(() =>
    parentFormFromProfile(data.parentProfile),
  );
  const [isParentEditing, setIsParentEditing] = useState(false);
  const [isConcernEditing, setIsConcernEditing] = useState(false);
  const [concernsDraft, setConcernsDraft] = useState(() =>
    data.parentProfile.concerns.join(", "),
  );
  const concerns = parent.concerns ?? [];
  const contactInfo =
    [parent.preferredChannel, parent.bestContactTime]
      .filter(Boolean)
      .join(" · ") || "-";

  const startParentEditing = () => {
    setParentForm(parentFormFromProfile(parent));
    setIsParentEditing(true);
  };

  const cancelParentEditing = () => {
    setParentForm(parentFormFromProfile(parent));
    setIsParentEditing(false);
  };

  const saveParent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setParent((current) => ({
      ...current,
      ...parentForm,
      involvement: normalizeInvolvement(parentForm.involvement),
    }));
    setIsParentEditing(false);
    toast.success("Đã cập nhật hồ sơ phụ huynh.");
  };

  const startConcernEditing = () => {
    setConcernsDraft(concerns.join(", "));
    setIsConcernEditing(true);
  };

  const cancelConcernEditing = () => {
    setConcernsDraft(concerns.join(", "));
    setIsConcernEditing(false);
  };

  const saveConcerns = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setParent((current) => ({
      ...current,
      concerns: parseConcerns(concernsDraft),
    }));
    setIsConcernEditing(false);
    toast.success("Đã cập nhật mối quan tâm của gia đình.");
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <ParentProfileCard
        form={parentForm}
        isEditing={isParentEditing}
        onCancel={cancelParentEditing}
        onChange={(field, value) =>
          setParentForm((current) => ({ ...current, [field]: value }))
        }
        onEdit={startParentEditing}
        onSave={saveParent}
        parent={parent}
        canEdit={canEdit}
      />

      <EditableCard
        canEdit={canEdit}
        editLabel="Chỉnh sửa mối quan tâm"
        headerContent={<Badge color="warning">{concerns.length} nhóm</Badge>}
        isEditing={isConcernEditing}
        onCancel={cancelConcernEditing}
        onEdit={startConcernEditing}
        onSave={saveConcerns}
        title="Mối quan tâm"
      >
        {isConcernEditing ? (
          <div className="space-y-2">
            <label
              className="text-xs font-medium text-text-secondary"
              htmlFor="family-concerns"
            >
              Danh sách mối quan tâm
            </label>
            <Input
              id="family-concerns"
              aria-label="Danh sách mối quan tâm"
              className="w-full"
              onChange={(event) => setConcernsDraft(event.target.value)}
              placeholder="Ví dụ: Học phí, học bổng"
              value={concernsDraft}
            />
            <p className="text-xs leading-5 text-text-tertiary">
              Phân tách nhiều mối quan tâm bằng dấu phẩy.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {concerns.length > 0 ? (
              <>
                <div className="rounded-lg border border-warning-200 bg-badge-warning-background p-4">
                  <p className="text-sm font-semibold text-badge-warning-text">
                    {concerns[0]}
                  </p>
                </div>
                {concerns.slice(1).map((concern) => (
                  <div
                    key={concern}
                    className="rounded-lg border border-card-border p-4"
                  >
                    <p className="text-sm font-semibold text-text-primary">
                      {concern}
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <div className="rounded-lg border border-card-border p-4">
                <p className="text-sm text-text-tertiary">
                  Chưa ghi nhận mối quan tâm cụ thể
                </p>
              </div>
            )}
          </div>
        )}
        <div className="mt-5 flex items-start gap-2 border-t border-card-border pt-4 text-xs leading-5 text-text-secondary">
          <Phone
            size={15}
            className="mt-0.5 shrink-0 text-primary-500"
            aria-hidden="true"
          />
          <span>{contactInfo}</span>
        </div>
      </EditableCard>
    </div>
  );
}

function parentFormFromProfile(
  parent: Student360Data["parentProfile"],
): ParentProfileForm {
  return {
    name: parent.name || "",
    relation: parent.relation || "",
    involvement: parent.involvement || "Chưa xác định",
    role: parent.role || "",
    preferredChannel: parent.preferredChannel || "",
    bestContactTime: parent.bestContactTime || "",
    consentStatus: parent.consentStatus || "",
  };
}

function normalizeInvolvement(
  value: string,
): "Cao" | "Trung bình" | "Thấp" | "Chưa xác định" {
  if (
    value === "Cao" ||
    value === "Trung bình" ||
    value === "Thấp" ||
    value === "Chưa xác định"
  ) {
    return value;
  }
  return "Chưa xác định";
}

function parseConcerns(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}
