import type { LeadDetail, LeadUpdateFields } from "@/services/api/lead-sale";

export type LeadConversionField = keyof Pick<
  LeadUpdateFields,
  "phone" | "province" | "high_school" | "major"
>;

export const leadConversionFieldLabels: Record<LeadConversionField, string> = {
  phone: "Số điện thoại",
  province: "Tỉnh / Thành phố",
  high_school: "Trường THPT",
  major: "Ngành quan tâm",
};

type LeadConversionValues = Pick<
  LeadDetail,
  "phone" | "province" | "school" | "interestedMajor"
>;

export function getLeadConversionMissingFields(
  lead: LeadConversionValues,
): LeadConversionField[] {
  const values: Record<LeadConversionField, string> = {
    phone: lead.phone,
    province: lead.province,
    high_school: lead.school,
    major: lead.interestedMajor,
  };

  return (Object.keys(values) as LeadConversionField[]).filter(
    (field) => !values[field]?.trim(),
  );
}
