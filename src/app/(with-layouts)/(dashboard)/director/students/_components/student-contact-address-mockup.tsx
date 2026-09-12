"use client";

import { MapMarker5 } from "@tailgrids/icons";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { Card } from "@/components/tailgrids/core/card";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type { StudentUpdateFields } from "@/services/api/student-school-update";
import type {
  Student360Data,
  StudentProfileAddressDetails,
} from "@/services/api/students/types";

import StudentCardHeader from "./student-card-header";
import StudentProfileCardActions from "./student-profile-card-actions";
import { useStudentProfileUpdate } from "./use-student-profile-update";

interface AddressForm {
  province: string;
  ward: string;
  contact_address: string;
}

interface ContactAddressField {
  label: string;
  value?: string | null;
  editKey?: keyof AddressForm;
  type?: "text";
  options?: EditableDetailOption[];
  isDisabled?: boolean;
}

interface StudentContactAddressMockupProps {
  data: Student360Data;
  studentId: string;
  canEdit?: boolean;
}

export default function StudentContactAddressMockup({
  data,
  studentId,
  canEdit = true,
}: StudentContactAddressMockupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AddressForm>(() => getAddressForm(data));
  const updateMutation = useStudentProfileUpdate(studentId);
  const details = data.student.profileDetails?.address;
  const provinceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Student", fieldname: "province" },
    isEditing,
  );
  const wardOptionsQuery = useStudentSchoolFieldOptions(
    form.province
      ? {
          doctype: "CRM Student",
          fieldname: "ward",
          province: form.province,
        }
      : null,
    isEditing,
  );
  const provinceOptions = toEditableOptions(provinceOptionsQuery.data?.options);
  const wardOptions = toEditableOptions(wardOptionsQuery.data?.options);
  const contactAddressFields = getContactAddressFields(data, details, {
    province: provinceOptions,
    ward: wardOptions,
    wardDisabled: !form.province || wardOptionsQuery.isPending,
  });

  const startEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setForm(getAddressForm(data));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setForm(getAddressForm(data));
    setIsEditing(false);
  };

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const initial = getAddressForm(data);
    const fields: StudentUpdateFields = {};
    if (form.province !== initial.province)
      fields.province = nullable(form.province);
    if (form.ward !== initial.ward) fields.ward = nullable(form.ward);
    if (form.contact_address !== initial.contact_address)
      fields.contact_address = nullable(form.contact_address);

    if (Object.keys(fields).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateMutation.mutateAsync(fields);
      setIsEditing(false);
      toast.success("Đã cập nhật địa chỉ liên hệ.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu địa chỉ liên hệ.",
      );
    }
  };

  const content = (
    <>
      <StudentCardHeader
        description="Địa chỉ liên hệ hiện tại được lưu trên hồ sơ học sinh."
        icon={<MapMarker5 size={18} aria-hidden="true" />}
        rightAction={
          <StudentProfileCardActions
            canEdit={canEdit}
            isEditing={isEditing}
            isSaving={updateMutation.isPending}
            onCancel={cancelEditing}
            onEdit={startEditing}
          />
        }
        title="Thông tin địa chỉ liên hệ"
      />

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-3">
        {contactAddressFields.map((field) => {
          if (isEditing && field.editKey) {
            const editKey = field.editKey;
            return (
              <EditableDetailField
                key={field.label}
                isDisabled={field.isDisabled}
                isEditing
                label={field.label}
                onChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    [editKey]: value,
                    ...(editKey === "province" ? { ward: "" } : {}),
                  }));
                }}
                options={field.options}
                searchable={editKey === "province" || editKey === "ward"}
                searchPlaceholder={
                  editKey === "province"
                    ? "Tìm tỉnh / thành phố..."
                    : "Tìm xã / phường..."
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
      {isEditing ? <form onSubmit={saveAddress}>{content}</form> : content}
    </Card>
  );
}

function getAddressForm(data: Student360Data): AddressForm {
  const details = data.student.profileDetails?.address;
  return {
    province: details?.provinceId || data.student.provinceId || "",
    ward: details?.wardId || data.student.wardId || "",
    contact_address: details?.fullAddress || "",
  };
}

function getContactAddressFields(
  data: Student360Data,
  details: StudentProfileAddressDetails | null | undefined,
  options: {
    province: EditableDetailOption[];
    ward: EditableDetailOption[];
    wardDisabled: boolean;
  },
): ContactAddressField[] {
  return [
    {
      label: "Tỉnh/ TP",
      value: details?.province || data.student.province,
      editKey: "province",
      options: options.province,
    },
    {
      label: "Phường/Xã",
      value: details?.ward || data.student.ward,
      editKey: "ward",
      options: options.ward,
      isDisabled: options.wardDisabled,
    },
    {
      label: "Địa chỉ liên hệ đầy đủ thí sinh",
      value: details?.fullAddress,
      editKey: "contact_address",
    },
  ];
}

function toEditableOptions(
  options: Array<{ value: string; label: string }> | undefined,
): EditableDetailOption[] {
  return options?.map(({ value, label }) => ({ id: value, label })) ?? [];
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}
