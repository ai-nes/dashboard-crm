"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  CreateDialogField,
  CreateDialogInput,
  CreateDialogSelect,
  CreateDialogTextArea,
} from "@/components/common/create-dialog-field";
import { MultiStepDialog } from "@/components/common/multi-step-dialog";
import { Button } from "@/components/tailgrids/core/button";
import type { SchoolCreateFields } from "@/services/api/student-school-update";

interface SchoolCreateDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (fields: SchoolCreateFields) => Promise<void>;
}

interface SchoolCreateForm {
  school_name: string;
  school_code: string;
  school_type: string;
  school_area: string;
  school_tier: string;
  boarding_type: string;
  province: string;
  ward: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
}

const steps = ["Nhận diện", "Địa điểm", "Liên hệ"];

const schoolTierOptions = [
  { id: "A", label: "A" },
  { id: "B", label: "B" },
  { id: "C", label: "C" },
  { id: "Unclassified", label: "Chưa phân loại" },
];

const boardingTypeOptions = [
  { id: "Day School", label: "Bán trú / học ban ngày" },
  { id: "Boarding School", label: "Nội trú" },
  { id: "Mixed", label: "Kết hợp" },
  { id: "Unknown", label: "Chưa xác định" },
];

const initialForm: SchoolCreateForm = {
  school_name: "",
  school_code: "",
  school_type: "",
  school_area: "",
  school_tier: "",
  boarding_type: "",
  province: "",
  ward: "",
  address: "",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
};

export default function SchoolCreateDialog({
  isOpen,
  isSubmitting = false,
  onOpenChange,
  onCreate,
}: SchoolCreateDialogProps) {
  const [form, setForm] = useState<SchoolCreateForm>(initialForm);
  const [currentStep, setCurrentStep] = useState(0);

  const setField = <TField extends keyof SchoolCreateForm>(
    field: TField,
    value: SchoolCreateForm[TField],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setForm(initialForm);
    setCurrentStep(0);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep === 0) {
      if (!form.school_name.trim()) {
        toast.error("Tên trường là bắt buộc.");
        return;
      }
      if (!form.school_code.trim()) {
        toast.error("Mã trường là bắt buộc.");
        return;
      }
    }

    if (currentStep === 1) {
      if (!form.province.trim() || !form.ward.trim()) {
        toast.error("Tỉnh / thành phố và phường / xã là bắt buộc.");
        return;
      }
      const coordinateError = validateCoordinates(form);
      if (coordinateError) {
        toast.error(coordinateError);
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }

    await onCreate(toSchoolCreateFields(form));
    reset();
  };

  return (
    <MultiStepDialog
      ariaLabel="Tạo hồ sơ trường học"
      currentStep={currentStep}
      description="Nhập thông tin theo từng bước để tạo hồ sơ CRM High School đầy đủ và dễ kiểm tra."
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <div>
            {currentStep > 0 && (
              <Button
                appearance="outline"
                isDisabled={isSubmitting}
                onPress={() => setCurrentStep((step) => step - 1)}
                type="button"
              >
                Quay lại
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              appearance="outline"
              isDisabled={isSubmitting}
              onPress={() => handleOpenChange(false)}
              type="button"
            >
              Hủy
            </Button>
            <Button isDisabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Đang tạo…"
                : currentStep === steps.length - 1
                  ? "Tạo trường"
                  : "Tiếp tục"}
            </Button>
          </div>
        </div>
      }
      isBusy={isSubmitting}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      steps={steps}
      title="Thêm trường THPT"
    >
      {currentStep === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CreateDialogField
            className="sm:col-span-2"
            label="Tên trường"
            required
          >
            <CreateDialogInput
              autoFocus
              label="Tên trường"
              placeholder="THPT Nguyễn Huệ"
              value={form.school_name}
              onChange={(event) => setField("school_name", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Mã trường" required>
            <CreateDialogInput
              label="Mã trường"
              placeholder="NH-001"
              value={form.school_code}
              onChange={(event) => setField("school_code", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Loại trường">
            <CreateDialogInput
              label="Loại trường"
              placeholder="Tên CRM School Type"
              value={form.school_type}
              onChange={(event) => setField("school_type", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Khu vực trường">
            <CreateDialogInput
              label="Khu vực trường"
              placeholder="Tên CRM School Area"
              value={form.school_area}
              onChange={(event) => setField("school_area", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Bậc trường">
            <CreateDialogSelect
              label="Bậc trường"
              options={schoolTierOptions}
              value={form.school_tier}
              onChange={(value) => setField("school_tier", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Mô hình học">
            <CreateDialogSelect
              label="Mô hình học"
              options={boardingTypeOptions}
              value={form.boarding_type}
              onChange={(value) => setField("boarding_type", value)}
            />
          </CreateDialogField>
        </div>
      )}

      {currentStep === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CreateDialogField label="Tỉnh / thành phố" required>
            <CreateDialogInput
              label="Tỉnh / thành phố"
              placeholder="Tên CRM Province"
              value={form.province}
              onChange={(event) => setField("province", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Phường / xã" required>
            <CreateDialogInput
              label="Phường / xã"
              placeholder="Tên CRM Ward"
              value={form.ward}
              onChange={(event) => setField("ward", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField className="sm:col-span-2" label="Địa chỉ">
            <CreateDialogTextArea
              label="Địa chỉ"
              placeholder="123 Nguyễn Huệ, Cần Thơ"
              rows={2}
              value={form.address}
              onChange={(event) => setField("address", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Vĩ độ">
            <CreateDialogInput
              label="Vĩ độ"
              max={90}
              min={-90}
              placeholder="10.123"
              step="any"
              type="number"
              value={form.latitude}
              onChange={(event) => setField("latitude", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Kinh độ">
            <CreateDialogInput
              label="Kinh độ"
              max={180}
              min={-180}
              placeholder="105.456"
              step="any"
              type="number"
              value={form.longitude}
              onChange={(event) => setField("longitude", event.target.value)}
            />
          </CreateDialogField>
        </div>
      )}

      {currentStep === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CreateDialogField label="Số điện thoại">
            <CreateDialogInput
              label="Số điện thoại"
              placeholder="0292000000"
              type="tel"
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Email">
            <CreateDialogInput
              label="Email"
              placeholder="contact@nguyenhue.edu.vn"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
            />
          </CreateDialogField>
          <p className="sm:col-span-2 text-xs leading-5 text-text-tertiary">
            Bạn có thể cập nhật thông tin liên hệ và tọa độ sau khi tạo trong
            tab “Thông tin trường”.
          </p>
        </div>
      )}
    </MultiStepDialog>
  );
}

function validateCoordinates(form: SchoolCreateForm) {
  const latitude = parseCoordinate(form.latitude);
  const longitude = parseCoordinate(form.longitude);
  if (form.latitude.trim() && latitude === null) return "Vĩ độ không hợp lệ.";
  if (form.longitude.trim() && longitude === null)
    return "Kinh độ không hợp lệ.";
  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    return "Vĩ độ phải nằm trong khoảng -90 đến 90.";
  }
  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    return "Kinh độ phải nằm trong khoảng -180 đến 180.";
  }
  return null;
}

function toSchoolCreateFields(form: SchoolCreateForm): SchoolCreateFields {
  const fields: SchoolCreateFields = {
    school_name: form.school_name.trim(),
    school_code: form.school_code.trim(),
    province: form.province.trim(),
    ward: form.ward.trim(),
    ...compactFields({
      school_type: form.school_type,
      school_area: form.school_area,
      school_tier: form.school_tier,
      boarding_type: form.boarding_type,
      address: form.address,
      phone: form.phone,
      email: form.email,
    }),
  };
  const latitude = parseCoordinate(form.latitude);
  const longitude = parseCoordinate(form.longitude);
  if (latitude !== null) fields.latitude = latitude;
  if (longitude !== null) fields.longitude = longitude;
  return fields;
}

function parseCoordinate(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function compactFields(fields: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value.length > 0),
  );
}
