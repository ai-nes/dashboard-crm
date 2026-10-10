import type { LeadDetail } from "@/services/api/lead-sale";

export interface ContactForm {
  student_name: string;
  phone: string;
  email: string;
  other_email: string;
  province: string;
  ward: string;
  high_school: string;
}

export interface AdmissionForm {
  major: string;
  aspiration: string;
  admission_year: string;
  branch: string;
  conversion_potential: string;
}

export interface SourceForm {
  source: string;
  advertising_channel: string;
  segments: string;
  notes: string;
}

export function getContactForm(lead: LeadDetail): ContactForm {
  return {
    student_name: lead.name || "",
    phone: lead.phone || "",
    email: lead.email || "",
    other_email: lead.secondaryEmail || "",
    province: lead.provinceId || lead.province || "",
    ward: lead.wardId || lead.ward || "",
    high_school: lead.highSchoolId || lead.school || "",
  };
}

export function getAdmissionForm(lead: LeadDetail): AdmissionForm {
  return {
    major: lead.majorId || lead.interestedMajor || "",
    aspiration: lead.aspirationId || lead.fptAspiration || "",
    admission_year:
      lead.admissionYearId ||
      (lead.enrollmentYear ? String(lead.enrollmentYear) : ""),
    branch: lead.campusId || lead.branch || "",
    conversion_potential: toConversionPotentialCode(lead.conversionPotential),
  };
}

export function getSourceForm(lead: LeadDetail): SourceForm {
  return {
    source: lead.sourceId || lead.source || "",
    advertising_channel: lead.adChannel || "",
    segments: lead.segments.join(", "),
    notes: lead.description || "",
  };
}

function toConversionPotentialCode(
  value: LeadDetail["conversionPotential"],
): string {
  if (value === "Cao") return "High";
  if (value === "Trung bình") return "Medium";
  if (value === "Thấp") return "Low";
  if (value === "Chưa xác định") return "Unknown";
  return "";
}
