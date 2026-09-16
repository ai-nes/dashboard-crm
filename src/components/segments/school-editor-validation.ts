export interface SchoolEditorRequiredFields {
  name: string;
  code: string;
  province: string;
  ward: string;
}

export function validateSchoolEditorRequiredFields(
  fields: SchoolEditorRequiredFields,
): string | null {
  if (!fields.name.trim() || !fields.code.trim()) {
    return "Vui lòng nhập tên và mã trường.";
  }

  if (!fields.province.trim()) {
    return "Vui lòng chọn tỉnh/thành của trường.";
  }

  if (!fields.ward.trim()) {
    return "Vui lòng chọn xã/phường của trường.";
  }

  return null;
}
