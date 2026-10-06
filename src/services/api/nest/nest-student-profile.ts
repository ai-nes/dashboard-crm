/**
 * Student profile read/update against the Nest backend, translating between
 * the dashboard's Frappe-style snake_case fields and the REST DTO.
 */
import { nestRequest } from "./nest-client";

interface Envelope<T> {
  data: T;
}

type StudentDto = Record<string, unknown> & { id: string; revision: number };

/** Dashboard field -> Nest request key (values are sent as text). */
const WRITE_FIELDS: Record<string, string> = {
  student_name: "fullName",
  phone: "phone",
  email: "email",
  other_phone: "otherPhone",
  other_email: "otherEmail",
  parent_email: "parentEmail",
  father_name: "fatherName",
  father_phone: "fatherPhone",
  mother_name: "motherName",
  mother_phone: "motherPhone",
  gender: "gender",
  date_of_birth: "dateOfBirth",
  birth_place: "birthPlace",
  ethnicity: "ethnicity",
  religion: "religion",
  nationality: "nationality",
  province: "provinceId",
  ward: "wardId",
  contact_address: "alternateAddress",
  high_school: "highSchoolId",
  current_grade: "currentGrade",
  study_stage: "studyStage",
  branch: "campusId",
  major: "majorId",
  aspiration: "aspirationId",
  admission_year: "admissionYearId",
  alt_name: "alternateName",
  alt_phone: "alternatePhone",
  alt_address: "alternateAddress",
  notes: "notes",
  id_number: "idNumber",
  id_issued_date: "idIssuedDate",
  id_issued_place: "idIssuedPlace",
};

/** Nest DTO key -> dashboard field, for reads. */
function readFields(student: StudentDto): Record<string, unknown> {
  return {
    student_name: student.fullName,
    phone: student.phone,
    email: student.email,
    other_phone: student.otherPhone,
    other_email: student.otherEmail,
    parent_email: student.parentEmail,
    father_name: student.fatherName,
    father_phone: student.fatherPhone,
    mother_name: student.motherName,
    mother_phone: student.motherPhone,
    gender: student.gender,
    date_of_birth: student.dateOfBirth,
    birth_place: student.birthPlace,
    ethnicity: student.ethnicity,
    religion: student.religion,
    nationality: student.nationality,
    province: student.province,
    ward: student.ward,
    contact_address: student.contactAddress,
    high_school: student.school,
    current_grade: student.currentGrade,
    study_stage: student.studyStage,
    branch: student.branch,
    major: student.major,
    aspiration: student.aspiration,
    admission_year: student.admissionYear,
    alt_name: student.parentName,
    alt_phone: student.parentPhone,
    notes: student.notes,
    id_number: student.idNumber,
    id_issued_date: student.idIssuedDate,
    id_issued_place: student.idIssuedPlace,
    student_stage: student.studentStage,
    source_lead: student.sourceLeadId,
    student_code: student.studentCode,
  };
}

const path = (id: string) => `/api/v1/students/${encodeURIComponent(id)}`;

export async function nestReadStudent(id: string) {
  const result = await nestRequest<Envelope<StudentDto>>(path(id));
  return {
    doctype: "CRM Student" as const,
    name: result.data.id,
    fields: readFields(result.data),
  };
}

export async function nestUpdateStudent(
  id: string,
  fields: Record<string, unknown>,
) {
  const current = await nestRequest<Envelope<StudentDto>>(path(id));
  const body: Record<string, unknown> = {
    expectedRevision: current.data.revision,
  };
  const applied: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(fields)) {
    const key = WRITE_FIELDS[field];
    if (!key) continue; // e.g. bank account fields are not stored here
    if (value === null || value === "") continue; // clearing is not supported
    body[key] = value;
    applied[field] = value;
  }
  const updated = await nestRequest<Envelope<StudentDto>>(path(id), {
    method: "PATCH",
    body,
  });
  const next = readFields(updated.data);
  return {
    doctype: "CRM Student" as const,
    name: updated.data.id,
    updated_fields: Object.fromEntries(
      Object.keys(applied).map((field) => [
        field,
        next[field] ?? applied[field],
      ]),
    ),
  };
}

export async function nestStudentStage(id: string, stage: string) {
  await nestRequest(`${path(id)}/stage`, { method: "POST", body: { stage } });
}
