import type { FieldOption } from "@/services/api/student-school-update";

const SOUTHERN_PROVINCE_KEYS = [
  "khanh hoa",
  "dak lak",
  "lam dong",
  "ho chi minh",
  "dong nai",
  "dong thap",
  "tay ninh",
] as const;

const southernProvinceKeys = new Set<string>(SOUTHERN_PROVINCE_KEYS);

function normalizeProvinceName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .toLocaleLowerCase("vi-VN")
    .replace(/\b(?:tp|thanh pho|city)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getProvinceKey(option: FieldOption) {
  const labelKey = normalizeProvinceName(option.label);
  if (southernProvinceKeys.has(labelKey)) return labelKey;

  const valueKey = normalizeProvinceName(option.value);
  return southernProvinceKeys.has(valueKey) ? valueKey : null;
}

export function getSouthernProvinceOptions(options: FieldOption[]) {
  const optionsByProvince = new Map<string, FieldOption>();

  for (const option of options) {
    const provinceKey = getProvinceKey(option);
    if (provinceKey && !optionsByProvince.has(provinceKey)) {
      optionsByProvince.set(provinceKey, option);
    }
  }

  return SOUTHERN_PROVINCE_KEYS.flatMap((provinceKey) => {
    const option = optionsByProvince.get(provinceKey);
    return option ? [option] : [];
  });
}
