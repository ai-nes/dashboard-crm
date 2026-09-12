import type { Student360Data } from "@/services/api/students/types";

export function getSelectedAdmissionMethodCode(data: Student360Data): string {
  const profile = data.admissionProfiles?.[0];

  return (
    profile?.admissionMethodCode ||
    data.student.admissionMethod ||
    data.academics.find((item) => item.label === "Phương thức xét tuyển")
      ?.value ||
    ""
  );
}

export function isHighSchoolAdmissionMethod(data: Student360Data): boolean {
  const profile = data.admissionProfiles?.[0];

  return isHighSchoolAdmissionMethodValue(
    getSelectedAdmissionMethodCode(data),
    profile?.admissionMethodName,
  );
}

export function isHighSchoolAdmissionMethodValue(
  code?: string | null,
  name?: string | null,
): boolean {
  return [code, name].some((value) => {
    const normalized = normalizeAdmissionMethodValue(value);
    return (
      normalized === "THPT_SCORE" ||
      normalized.includes("THPT") ||
      normalized.includes("TRUNG HOC PHO THONG")
    );
  });
}

function normalizeAdmissionMethodValue(value?: string | null): string {
  return (value ?? "")
    .trim()
    .toLocaleUpperCase("vi-VN")
    .normalize("NFD")
    .replace(/Đ/g, "D")
    .replace(/[\u0300-\u036f]/g, "");
}
