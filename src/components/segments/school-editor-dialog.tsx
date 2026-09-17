"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { DropdownField } from "@/components/common/dropdown-field";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import {
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
} from "@/hooks/use-reference-catalog-queries";
import type {
  GeographyOption,
  SchoolOption,
} from "@/services/api/reference-catalog";

import { ReferenceCatalogEditorDialog } from "./reference-catalog-editor-dialog";
import { validateSchoolEditorRequiredFields } from "./school-editor-validation";

function formFromRecord(record: SchoolOption | null) {
  return {
    code: record?.code ?? "",
    name: record?.name ?? "",
    schoolType: record?.schoolType ?? "",
    schoolArea: record?.schoolArea ?? "",
    isActive: record?.isActive ?? true,
    province: record?.province ?? "",
    ward: record?.ward ?? "",
    address: record?.address ?? "",
    phone: record?.phone ?? "",
    email: record?.email ?? "",
  };
}

export function SchoolEditorDialog({
  isOpen,
  record,
  provinces,
  wards,
  schoolAreas,
  schoolTypes,
  onOpenChange,
}: {
  isOpen: boolean;
  record: SchoolOption | null;
  provinces: readonly GeographyOption[];
  wards: readonly GeographyOption[];
  schoolAreas: readonly GeographyOption[];
  schoolTypes: readonly GeographyOption[];
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(() => formFromRecord(record));
  const createMutation = useCreateSchoolMutation();
  const updateMutation = useUpdateSchoolMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const provinceWards = useMemo(
    () => wards.filter((ward) => !form.province || ward.province === form.province),
    [form.province, wards],
  );

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim();
    const validationMessage = validateSchoolEditorRequiredFields(form);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    const data = {
      school_name: name,
      school_code: code,
      school_type: form.schoolType || null,
      school_area: form.schoolArea || null,
      is_active: form.isActive,
      province: form.province,
      ward: form.ward,
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
    };
    try {
      if (record) {
        await updateMutation.mutateAsync({
          name: record.id,
          data,
          expectedModified: record.modified,
        });
        toast.success(`Đã cập nhật ${name}.`);
      } else {
        await createMutation.mutateAsync(data);
        toast.success(`Đã tạo ${name}.`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu trường học.");
    }
  };

  return (
    <ReferenceCatalogEditorDialog
      isOpen={isOpen}
      title={record ? "Chỉnh sửa trường THPT" : "Tạo trường THPT"}
      description="Thông tin trường được dùng cho hồ sơ học sinh, lead và hoạt động địa bàn."
      isSaving={isSaving}
      submitLabel={record ? "Lưu thay đổi" : "Tạo trường"}
      onOpenChange={onOpenChange}
      onSubmit={save}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">
            Tên trường <span className="text-input-error" aria-hidden="true">*</span>
          </span>
          <Input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            disabled={isSaving}
            placeholder="Ví dụ: THPT Nguyễn Du"
            className="h-10 w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">
            Mã trường <span className="text-input-error" aria-hidden="true">*</span>
          </span>
          <Input
            value={form.code}
            onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            disabled={isSaving}
            maxLength={50}
            placeholder="Ví dụ: 00001"
            className="h-10 w-full"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">
            Tỉnh/thành <span className="text-input-error" aria-hidden="true">*</span>
          </span>
          <DropdownField
            ariaLabel="Tỉnh/thành của trường"
            options={provinces.map((province) => ({
              id: province.id,
              label: province.name,
              searchText: province.code ?? undefined,
            }))}
            value={form.province}
            onChange={(value) =>
              setForm((current) => ({ ...current, province: value ?? "", ward: "" }))
            }
            isSearchable
            searchPlaceholder="Tìm tỉnh/thành..."
            isDisabled={isSaving || provinces.length === 0}
            isRequired
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">
            Xã/phường <span className="text-input-error" aria-hidden="true">*</span>
          </span>
          <DropdownField
            ariaLabel="Xã/phường của trường"
            options={provinceWards.map((ward) => ({
              id: ward.id,
              label: ward.name,
              searchText: ward.code ?? undefined,
            }))}
            value={form.ward}
            onChange={(value) => setForm((current) => ({ ...current, ward: value ?? "" }))}
            isSearchable
            searchPlaceholder="Tìm xã/phường..."
            isDisabled={isSaving || !form.province || provinceWards.length === 0}
            isRequired
            emptyMessage={
              form.province
                ? "Tỉnh/thành này chưa có xã/phường. Hãy tạo xã/phường trước."
                : "Chọn tỉnh/thành trước."
            }
          />
          {form.province && provinceWards.length === 0 && (
            <span className="text-xs text-input-error">
              Tỉnh/thành này chưa có xã/phường để liên kết.
            </span>
          )}
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Loại trường</span>
          <DropdownField
            ariaLabel="Loại trường"
            options={schoolTypes.map((item) => ({ id: item.id, label: item.name }))}
            value={form.schoolType}
            onChange={(value) => setForm((current) => ({ ...current, schoolType: value ?? "" }))}
            isSearchable
            searchPlaceholder="Tìm loại trường..."
            isDisabled={isSaving || schoolTypes.length === 0}
            placeholder="Chưa phân loại"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Khu vực trường</span>
          <DropdownField
            ariaLabel="Khu vực trường"
            options={schoolAreas.map((item) => ({ id: item.id, label: item.name }))}
            value={form.schoolArea}
            onChange={(value) => setForm((current) => ({ ...current, schoolArea: value ?? "" }))}
            isDisabled={isSaving || schoolAreas.length === 0}
            placeholder="Chưa phân khu vực"
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-input-label-text-color">Địa chỉ</span>
        <TextArea
          value={form.address}
          onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
          disabled={isSaving}
          rows={2}
          placeholder="Địa chỉ trường"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Điện thoại</span>
          <Input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            disabled={isSaving}
            className="h-10 w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Email</span>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            disabled={isSaving}
            className="h-10 w-full"
          />
        </label>
      </div>
      <Checkbox
        size="sm"
        isSelected={form.isActive}
        onChange={(selected) => setForm((current) => ({ ...current, isActive: selected }))}
        isDisabled={isSaving}
        className="min-h-10 rounded-lg border border-card-border bg-background-gray-secondary_alt px-3 text-sm text-text-secondary"
      >
        Cho phép dùng trong dữ liệu tuyển sinh
      </Checkbox>
      {provinces.length === 0 && (
        <p className="text-xs text-input-error">Cần có tỉnh/thành trước khi tạo trường.</p>
      )}
    </ReferenceCatalogEditorDialog>
  );
}
