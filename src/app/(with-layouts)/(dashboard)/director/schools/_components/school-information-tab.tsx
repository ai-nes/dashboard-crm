"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { CopyableId } from "@/components/common/copyable-id";
import { EditableCard } from "@/components/common/editable-card";
import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  updateSchool,
  type SchoolUpdateFields,
} from "@/services/api/student-school-update";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolInformationTabProps {
  data: SchoolIntelligenceData;
  onUpdated: (fields: SchoolUpdateFields) => void;
}

interface SchoolForm {
  school_name: string;
  school_type: string;
  school_area: string;
  school_tier: string;
  boarding_type: string;
  province: string;
  ward: string;
  latitude: string;
  longitude: string;
  address: string;
  phone: string;
  email: string;
}

type EditableSchoolCard = "identity" | "location";

const schoolTierOptions: EditableDetailOption[] = [
  { id: "", label: "Chưa phân loại" },
  { id: "A", label: "A" },
  { id: "B", label: "B" },
  { id: "C", label: "C" },
  { id: "Unclassified", label: "Chưa phân loại" },
];

const boardingTypeOptions: EditableDetailOption[] = [
  { id: "", label: "Chưa xác định" },
  { id: "Day School", label: "Trường ngày" },
  { id: "Boarding School", label: "Nội trú" },
  { id: "Mixed", label: "Bán trú & nội trú" },
  { id: "Unknown", label: "Chưa xác định" },
];

export default function SchoolInformationTab({
  data,
  onUpdated,
}: SchoolInformationTabProps) {
  const [editingCard, setEditingCard] = useState<EditableSchoolCard | null>(
    null,
  );
  const [form, setForm] = useState<SchoolForm>(() => getSchoolForm(data));

  const updateMutation = useMutation({
    mutationFn: (variables: { fields: SchoolUpdateFields }) =>
      updateSchool(data.school.id, variables.fields),
    onSuccess: (response) => {
      onUpdated(response.updated_fields);
      setEditingCard(null);
      toast.success("Đã cập nhật thông tin trường học.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu thông tin trường.",
      );
    },
  });

  const startEditing = (card: EditableSchoolCard) => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setForm(getSchoolForm(data));
    setEditingCard(card);
  };

  const cancelEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setEditingCard(null);
  };

  const saveIdentity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.school_name.trim()) {
      toast.error("Tên trường không được để trống.");
      return;
    }

    const initial = getSchoolForm(data);
    const fields: SchoolUpdateFields = {};
    addChangedTextField(
      fields,
      "school_name",
      form.school_name,
      initial.school_name,
    );
    addChangedTextField(
      fields,
      "school_type",
      form.school_type,
      initial.school_type,
    );
    addChangedTextField(
      fields,
      "school_area",
      form.school_area,
      initial.school_area,
    );
    addChangedTextField(
      fields,
      "school_tier",
      form.school_tier,
      initial.school_tier,
    );
    addChangedTextField(
      fields,
      "boarding_type",
      form.boarding_type,
      initial.boarding_type,
    );

    save(fields);
  };

  const saveLocation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const initial = getSchoolForm(data);
    const fields: SchoolUpdateFields = {};
    addChangedTextField(fields, "province", form.province, initial.province);
    addChangedTextField(fields, "ward", form.ward, initial.ward);
    addChangedTextField(fields, "address", form.address, initial.address);
    addChangedTextField(fields, "phone", form.phone, initial.phone);
    addChangedTextField(fields, "email", form.email, initial.email);

    const latitude = coordinateValue(form.latitude, "Vĩ độ");
    const longitude = coordinateValue(form.longitude, "Kinh độ");
    if (latitude.error || longitude.error) {
      toast.error(latitude.error ?? longitude.error);
      return;
    }
    if (form.latitude !== initial.latitude) fields.latitude = latitude.value;
    if (form.longitude !== initial.longitude)
      fields.longitude = longitude.value;

    save(fields);
  };

  const save = (fields: SchoolUpdateFields) => {
    if (Object.keys(fields).length === 0) {
      setEditingCard(null);
      return;
    }
    updateMutation.mutate({ fields });
  };

  const identityEditing = editingCard === "identity";
  const locationEditing = editingCard === "location";

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-2">
      <EditableCard
        editLabel="Chỉnh sửa thông tin nhận diện trường"
        headerContent={<Badge color="gray">Thông tin cơ bản</Badge>}
        isEditing={identityEditing}
        isSaving={updateMutation.isPending}
        onCancel={cancelEditing}
        onEdit={() => startEditing("identity")}
        onSave={saveIdentity}
        title="Thông tin nhận diện"
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <EditableDetailField
            className="sm:col-span-2"
            isEditing={identityEditing}
            label="Tên trường"
            onChange={(value) =>
              setForm((current) => ({ ...current, school_name: value }))
            }
            value={identityEditing ? form.school_name : data.school.name}
          />
          <div className="min-w-0">
            <dt className="text-xs text-text-tertiary">Mã trường</dt>
            <CopyableId
              className="mt-1"
              label="mã trường"
              value={data.school.schoolCode}
            />
          </div>
          <EditableDetailField
            isEditing={identityEditing}
            label="Loại trường"
            onChange={(value) =>
              setForm((current) => ({ ...current, school_type: value }))
            }
            value={
              identityEditing
                ? form.school_type
                : (data.school.schoolType ?? "-")
            }
          />
          <EditableDetailField
            isEditing={identityEditing}
            label="Khu vực trường"
            onChange={(value) =>
              setForm((current) => ({ ...current, school_area: value }))
            }
            value={identityEditing ? form.school_area : data.school.area}
          />
          <EditableDetailField
            isEditing={identityEditing}
            label="Bậc trường"
            onChange={(value) =>
              setForm((current) => ({ ...current, school_tier: value }))
            }
            options={schoolTierOptions}
            value={
              identityEditing
                ? form.school_tier
                : (data.school.schoolTier ?? "-")
            }
          />
          <EditableDetailField
            isEditing={identityEditing}
            label="Mô hình học"
            onChange={(value) =>
              setForm((current) => ({ ...current, boarding_type: value }))
            }
            options={boardingTypeOptions}
            value={
              identityEditing
                ? form.boarding_type
                : boardingTypeLabel(getSchoolForm(data).boarding_type)
            }
          />
          <EditableDetailField
            label="Phân loại CRM"
            readOnly
            value={data.classification.group}
          />
        </dl>
        {identityEditing && (
          <p className="mt-4 text-xs leading-5 text-text-tertiary">
            Mã trường và phân loại CRM do hệ thống quản trị, chỉ có thể xem tại
            đây.
          </p>
        )}
      </EditableCard>

      <EditableCard
        editLabel="Chỉnh sửa vị trí và liên hệ trường"
        headerContent={<Badge color="sky">Vị trí & liên hệ</Badge>}
        isEditing={locationEditing}
        isSaving={updateMutation.isPending}
        onCancel={cancelEditing}
        onEdit={() => startEditing("location")}
        onSave={saveLocation}
        title="Vị trí & liên hệ"
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <EditableDetailField
            isEditing={locationEditing}
            label="Tỉnh / thành phố"
            onChange={(value) =>
              setForm((current) => ({ ...current, province: value }))
            }
            value={locationEditing ? form.province : data.school.province}
          />
          <EditableDetailField
            isEditing={locationEditing}
            label="Phường / xã"
            onChange={(value) =>
              setForm((current) => ({ ...current, ward: value }))
            }
            value={locationEditing ? form.ward : data.school.district}
          />
          <EditableDetailField
            className="sm:col-span-2"
            isEditing={locationEditing}
            label="Địa chỉ"
            onChange={(value) =>
              setForm((current) => ({ ...current, address: value }))
            }
            value={locationEditing ? form.address : data.school.address}
          />
          <EditableDetailField
            isEditing={locationEditing}
            label="Số điện thoại"
            onChange={(value) =>
              setForm((current) => ({ ...current, phone: value }))
            }
            type="tel"
            value={locationEditing ? form.phone : (data.school.phone ?? "-")}
          />
          <EditableDetailField
            isEditing={locationEditing}
            label="Email"
            onChange={(value) =>
              setForm((current) => ({ ...current, email: value }))
            }
            type="email"
            value={locationEditing ? form.email : (data.school.email ?? "-")}
          />
          <EditableDetailField
            isEditing={locationEditing}
            label="Vĩ độ"
            max={90}
            min={-90}
            onChange={(value) =>
              setForm((current) => ({ ...current, latitude: value }))
            }
            type="number"
            value={locationEditing ? form.latitude : form.latitude || "-"}
          />
          <EditableDetailField
            isEditing={locationEditing}
            label="Kinh độ"
            max={180}
            min={-180}
            onChange={(value) =>
              setForm((current) => ({ ...current, longitude: value }))
            }
            type="number"
            value={locationEditing ? form.longitude : form.longitude || "-"}
          />
        </dl>
      </EditableCard>
    </div>
  );
}

function getSchoolForm(data: SchoolIntelligenceData): SchoolForm {
  const boardingType =
    data.school.boardingType ??
    (data.school.isBoardingSchool ? "Boarding School" : "Day School");
  return {
    school_name: cleanValue(data.school.name),
    school_type: cleanValue(data.school.schoolType),
    school_area: cleanValue(data.school.area),
    school_tier: cleanValue(data.school.schoolTier),
    boarding_type: cleanValue(boardingType),
    province: cleanValue(data.school.province),
    ward: cleanValue(data.school.district),
    latitude: coordinateString(data.school.latitude ?? data.locality?.latitude),
    longitude: coordinateString(
      data.school.longitude ?? data.locality?.longitude,
    ),
    address: cleanValue(data.school.address),
    phone: cleanValue(data.school.phone),
    email: cleanValue(data.school.email),
  };
}

function cleanValue(value: string | null | undefined) {
  return value && value !== "-" ? value : "";
}

function coordinateString(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : "";
}

function addChangedTextField(
  fields: SchoolUpdateFields,
  field: keyof SchoolUpdateFields,
  value: string,
  initialValue: string,
) {
  if (value !== initialValue) fields[field] = value.trim() || null;
}

function coordinateValue(value: string, label: string) {
  if (!value.trim()) return { value: null, error: undefined };
  const parsed = Number(value);
  const limit = label === "Vĩ độ" ? 90 : 180;
  if (!Number.isFinite(parsed) || Math.abs(parsed) > limit) {
    return { value: null, error: `${label} phải nằm trong khoảng hợp lệ.` };
  }
  return { value: parsed, error: undefined };
}

function boardingTypeLabel(value: string) {
  return (
    boardingTypeOptions.find((option) => option.id === value)?.label ??
    (value || "-")
  );
}
