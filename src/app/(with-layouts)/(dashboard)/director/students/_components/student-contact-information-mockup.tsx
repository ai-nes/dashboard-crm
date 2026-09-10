"use client";

import { UserMultiple1 } from "@tailgrids/icons";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { EditableDetailField } from "@/components/common/editable-detail-field";
import { Card } from "@/components/tailgrids/core/card";
import type {
  StudentUpdateFields,
  StudentUpdateFieldValue,
} from "@/services/api/student-school-update";
import type {
  Student360Data,
  StudentProfileContactDetails,
} from "@/services/api/students/types";

import StudentCardHeader from "./student-card-header";
import StudentProfileCardActions from "./student-profile-card-actions";
import { useStudentProfileUpdate } from "./use-student-profile-update";

interface ContactForm {
  alt_name: string;
  alt_phone: string;
  parent_other_phone: string;
  parent_email: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  father_email: string;
  father_name: string;
  father_phone: string;
  father_occupation: string;
  mother_phone: string;
  mother_name: string;
  mother_email: string;
  mother_occupation: string;
}

interface ContactInformationField {
  label: string;
  value?: string | null;
  editKey?: keyof ContactForm;
  type?: "email" | "tel" | "text";
}

interface StudentContactInformationMockupProps {
  data: Student360Data;
  studentId: string;
  canEdit?: boolean;
}

const contactFormKeys = [
  "alt_name",
  "alt_phone",
  "parent_other_phone",
  "parent_email",
  "bank_name",
  "account_number",
  "account_holder",
  "father_email",
  "father_name",
  "father_phone",
  "father_occupation",
  "mother_phone",
  "mother_name",
  "mother_email",
  "mother_occupation",
] as const satisfies ReadonlyArray<keyof ContactForm>;

export default function StudentContactInformationMockup({
  data,
  studentId,
  canEdit = true,
}: StudentContactInformationMockupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ContactForm>(() => getContactForm(data));
  const updateMutation = useStudentProfileUpdate(studentId);
  const details = data.student.profileDetails?.contact;
  const contactInformationFields = getContactInformationFields(data, details);

  const startEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setForm(getContactForm(data));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setForm(getContactForm(data));
    setIsEditing(false);
  };

  const saveContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const initial = getContactForm(data);
    const fields: StudentUpdateFields = {};
    for (const key of contactFormKeys) {
      if (form[key] !== initial[key]) fields[key] = nullable(form[key]);
    }

    if (Object.keys(fields).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateMutation.mutateAsync(fields);
      setIsEditing(false);
      toast.success("Đã cập nhật thông tin người liên hệ.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu thông tin người liên hệ.",
      );
    }
  };

  const content = (
    <>
      <StudentCardHeader
        description="Thông tin phụ huynh và người liên hệ của học sinh."
        icon={<UserMultiple1 size={18} aria-hidden="true" />}
        rightAction={
          <StudentProfileCardActions
            canEdit={canEdit}
            isEditing={isEditing}
            isSaving={updateMutation.isPending}
            onCancel={cancelEditing}
            onEdit={startEditing}
          />
        }
        title="Thông tin người liên hệ"
      />

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {contactInformationFields.map((field) => {
          if (isEditing && field.editKey) {
            const editKey = field.editKey;
            return (
              <EditableDetailField
                key={field.label}
                isEditing
                label={field.label}
                onChange={(value) =>
                  setForm((current) => ({ ...current, [editKey]: value }))
                }
                type={field.type}
                value={form[editKey]}
              />
            );
          }

          return (
            <div key={field.label} className="min-w-0">
              <dt className="text-xs text-text-tertiary">{field.label}</dt>
              <dd className="mt-1 break-words text-sm font-medium text-text-primary">
                {field.value || "-"}
              </dd>
            </div>
          );
        })}
      </dl>
    </>
  );

  return (
    <Card className="p-5">
      {isEditing ? <form onSubmit={saveContact}>{content}</form> : content}
    </Card>
  );
}

function getContactForm(data: Student360Data): ContactForm {
  const details = data.student.profileDetails?.contact;
  const familyValue = (label: string) =>
    data.family?.find((item) => item.label === label)?.value || "";

  return {
    alt_name: details?.name || familyValue("Người liên hệ"),
    alt_phone: details?.phone || "",
    parent_other_phone: details?.otherPhone || "",
    parent_email: details?.email || "",
    bank_name: details?.bankName || "",
    account_number: details?.accountNumber || "",
    account_holder: details?.accountHolder || "",
    father_email: details?.fatherEmail || "",
    father_name: details?.fatherName || "",
    father_phone: details?.fatherPhone || "",
    father_occupation: details?.fatherOccupation || "",
    mother_phone: details?.motherPhone || "",
    mother_name: details?.motherName || "",
    mother_email: details?.motherEmail || "",
    mother_occupation: details?.motherOccupation || "",
  };
}

function getContactInformationFields(
  data: Student360Data,
  details?: StudentProfileContactDetails | null,
): ContactInformationField[] {
  const familyValue = (label: string) =>
    data.family?.find((item) => item.label === label)?.value;

  return [
    {
      label: "Họ và tên người liên hệ",
      value: details?.name || familyValue("Người liên hệ"),
      editKey: "alt_name",
    },
    {
      label: "Số điện thoại",
      value: details?.phone,
      editKey: "alt_phone",
      type: "tel",
    },
    {
      label: "Số điện thoại khác (nếu có)",
      value: details?.otherPhone,
      editKey: "parent_other_phone",
      type: "tel",
    },
    {
      label: "Email",
      value: details?.email,
      editKey: "parent_email",
      type: "email",
    },
    {
      label: "Tên ngân hàng",
      value: details?.bankName,
      editKey: "bank_name",
    },
    {
      label: "Số tài khoản",
      value: details?.accountNumber,
      editKey: "account_number",
    },
    {
      label: "Tên chủ tài khoản",
      value: details?.accountHolder,
      editKey: "account_holder",
    },
    {
      label: "Email cha",
      value: details?.fatherEmail,
      editKey: "father_email",
      type: "email",
    },
    {
      label: "Họ tên cha",
      value: details?.fatherName,
      editKey: "father_name",
    },
    {
      label: "SĐT cha",
      value: details?.fatherPhone,
      editKey: "father_phone",
      type: "tel",
    },
    {
      label: "Nghề nghiệp cha",
      value: details?.fatherOccupation,
      editKey: "father_occupation",
    },
    {
      label: "SĐT mẹ",
      value: details?.motherPhone,
      editKey: "mother_phone",
      type: "tel",
    },
    {
      label: "Họ tên mẹ",
      value: details?.motherName,
      editKey: "mother_name",
    },
    {
      label: "Email mẹ",
      value: details?.motherEmail,
      editKey: "mother_email",
      type: "email",
    },
    {
      label: "Nghề nghiệp mẹ",
      value: details?.motherOccupation,
      editKey: "mother_occupation",
    },
  ];
}

function nullable(value: string): StudentUpdateFieldValue {
  const trimmed = value.trim();
  return trimmed || null;
}
