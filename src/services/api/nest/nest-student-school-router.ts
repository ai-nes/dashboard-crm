/**
 * `crm.api.student_school.*` and `crm.api.lead_mapping.get_lead_options`
 * (student creation and deletion, school writes and the student form lookups)
 * served by the NestJS students, directory and geography modules.
 */
import { nestRequest } from "./nest-client";
import { NOT_HANDLED, type Body, type MethodHandler } from "./nest-handler";

/** Form field (service name) to the student intake API field. */
const STUDENT_FIELDS: Record<string, string> = {
  student_name: "studentName",
  full_name: "studentName",
  phone: "phone",
  id_number: "idNumber",
  id_issued_date: "idIssuedDate",
  id_issued_place: "idIssuedPlace",
  email: "email",
  other_email: "otherEmail",
  gender: "gender",
  province: "provinceId",
  ward: "wardId",
  high_school: "highSchoolId",
  major: "majorId",
  aspiration: "aspirationId",
  admission_year: "admissionYearId",
  branch: "campusId",
  campaign: "campaignId",
  assigned_to: "assignedToUserId",
  advertising_channel: "advertisingChannel",
  conversion_potential: "conversionPotential",
  current_grade: "currentGrade",
  study_stage: "studyStage",
  description: "notes",
  notes: "notes",
  alt_name: "alternateName",
  alt_phone: "alternatePhone",
  alt_address: "alternateAddress",
};

const present = (value: unknown) =>
  value !== undefined && value !== null && value !== "";

function studentPayload(fields: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const [key, target] of Object.entries(STUDENT_FIELDS)) {
    if (present(fields[key])) payload[target] = fields[key];
  }
  const segments = fields.segments;
  if (Array.isArray(segments) && segments.length > 0) {
    payload.segments = segments;
  } else if (typeof segments === "string" && segments.trim()) {
    payload.segments = segments.split(",").map((value) => value.trim());
  }
  return payload;
}

const fieldsOf = (body: Body) =>
  (body?.fields ?? {}) as Record<string, unknown>;

const schoolId = (body: Body) => encodeURIComponent(String(body?.name ?? ""));

export const nestStudentSchoolHandler: MethodHandler = async (
  method,
  params,
  body,
) => {
  switch (method) {
    case "crm.api.lead_mapping.get_lead_options":
      return nestRequest("/api/v1/directory/lead-options", {
        query: { limit: params.limit },
      });
    case "crm.api.student_school.create_student":
    case "crm.api.student_school.create_student_with_lead": {
      const created = await nestRequest<{
        studentCode: string;
        leadCode: string | null;
        fullName: string;
        phone: string | null;
        email: string | null;
        studentStage: string;
        ownerUserId: string | null;
      }>("/api/v1/students", {
        method: "POST",
        body: studentPayload(fieldsOf(body)),
      });
      return {
        doctype: "CRM Student",
        name: created.studentCode,
        student: {
          doctype: "CRM Student",
          name: created.studentCode,
          student_stage: created.studentStage,
          source_lead: created.leadCode,
        },
        created_fields: {
          full_name: created.fullName,
          ...(created.phone ? { phone: created.phone } : {}),
          ...(created.email ? { email: created.email } : {}),
          student_stage: created.studentStage,
        },
        assigned_to_user: created.ownerUserId,
      };
    }
    case "crm.api.student_school.delete_student": {
      await nestRequest(
        `/api/v1/students/${encodeURIComponent(String(body?.name ?? ""))}`,
        { method: "DELETE" },
      );
      return { doctype: "CRM Student", name: body?.name, deleted: true };
    }
    case "crm.api.student_school.create_school": {
      const fields = fieldsOf(body);
      const school = await nestRequest<{ id: string }>(
        "/api/v1/geography-catalog/high-schools",
        { method: "POST", body: { data: fields } },
      );
      return {
        doctype: "CRM High School",
        name: school.id,
        created_fields: fields,
      };
    }
    case "crm.api.student_school.update_school": {
      const fields = fieldsOf(body);
      await nestRequest(
        `/api/v1/geography-catalog/high-schools/${schoolId(body)}`,
        { method: "PATCH", body: { data: fields } },
      );
      return {
        doctype: "CRM High School",
        name: body?.name,
        updated_fields: fields,
      };
    }
    case "crm.api.student_school.delete_school": {
      await nestRequest(
        `/api/v1/geography-catalog/high-schools/${schoolId(body)}`,
        { method: "DELETE" },
      );
      return { doctype: "CRM High School", name: body?.name, deleted: true };
    }
    default:
      return NOT_HANDLED;
  }
};
