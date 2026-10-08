import { NestApiError, nestRequest } from "../nest/nest-client";
import { NOT_HANDLED, type Body, type Params } from "../nest/nest-handler";
import { nestFieldOptions, nestSchools } from "../nest/nest-directory";
import { nestStudentSchoolHandler } from "../nest/nest-student-school-router";
import {
  nestReadStudent,
  nestStudentStage,
  nestUpdateStudent,
} from "../nest/nest-student-profile";
import {
  getStudentStudyStageForPayload,
  normalizeStudentStudyStage,
} from "./student-study-stage";
import type { StudentStatus } from "@/services/api/students/types";

export type StudentUpdateFieldValue = string | null;

export interface StudentStageTransitionRequest {
  student: string;
  target_stage: StudentStatus;
}

export type StudentUpdateFields = Partial<{
  student_name: StudentUpdateFieldValue;
  phone: StudentUpdateFieldValue;
  email: StudentUpdateFieldValue;
  other_phone: StudentUpdateFieldValue;
  other_email: StudentUpdateFieldValue;
  parent_other_phone: StudentUpdateFieldValue;
  parent_email: StudentUpdateFieldValue;
  bank_name: StudentUpdateFieldValue;
  account_number: StudentUpdateFieldValue;
  account_holder: StudentUpdateFieldValue;
  father_name: StudentUpdateFieldValue;
  father_phone: StudentUpdateFieldValue;
  father_email: StudentUpdateFieldValue;
  father_occupation: StudentUpdateFieldValue;
  mother_name: StudentUpdateFieldValue;
  mother_phone: StudentUpdateFieldValue;
  mother_email: StudentUpdateFieldValue;
  mother_occupation: StudentUpdateFieldValue;
  gender: StudentUpdateFieldValue;
  date_of_birth: StudentUpdateFieldValue;
  birth_place: StudentUpdateFieldValue;
  ethnicity: StudentUpdateFieldValue;
  religion: StudentUpdateFieldValue;
  nationality: StudentUpdateFieldValue;
  province: StudentUpdateFieldValue;
  ward: StudentUpdateFieldValue;
  contact_address: StudentUpdateFieldValue;
  high_school: StudentUpdateFieldValue;
  current_grade: StudentUpdateFieldValue;
  study_stage: StudentUpdateFieldValue;
  branch: StudentUpdateFieldValue;
  major: StudentUpdateFieldValue;
  aspiration: StudentUpdateFieldValue;
  advertising_channel: StudentUpdateFieldValue;
  conversion_potential: StudentUpdateFieldValue;
  segments: StudentUpdateFieldValue;
  admission_year: StudentUpdateFieldValue;
  alt_name: StudentUpdateFieldValue;
  alt_phone: StudentUpdateFieldValue;
  alt_address: StudentUpdateFieldValue;
  notes: StudentUpdateFieldValue;
  id_number: StudentUpdateFieldValue;
  id_issued_date: StudentUpdateFieldValue;
  id_issued_place: StudentUpdateFieldValue;
}>;

export type StudentCreateFields = StudentUpdateFields & {
  student_name: string;
};

export type LeadCreateFields = {
  student_name: string;
  phone: string;
  id_number?: string | null;
  province: string;
  campaign: string;
  email?: string | null;
  other_email?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  high_school?: string | null;
  major?: string | null;
  current_grade?: string | null;
  study_stage?: string | null;
  advertising_channel?: string | null;
  segments?: string | null;
  admission_year?: string | null;
  conversion_potential?: string | null;
  assigned_to?: string | null;
  branch?: string | null;
  tags?: string | null;
  aspiration?: string | null;
  event_participated?: string | null;
  description?: string | null;
  ward?: string | null;
  alt_name?: string | null;
  alt_phone?: string | null;
  alt_address?: string | null;
};

export type StudentCreateWithLeadFields = Omit<
  LeadCreateFields,
  "assigned_to"
> & {
  assigned_to: string;
};

export type SchoolUpdateFieldValue = string | number | null;

export type SchoolUpdateFields = Partial<{
  school_name: SchoolUpdateFieldValue;
  school_type: SchoolUpdateFieldValue;
  school_area: SchoolUpdateFieldValue;
  school_tier: SchoolUpdateFieldValue;
  boarding_type: SchoolUpdateFieldValue;
  province: SchoolUpdateFieldValue;
  ward: SchoolUpdateFieldValue;
  latitude: SchoolUpdateFieldValue;
  longitude: SchoolUpdateFieldValue;
  address: SchoolUpdateFieldValue;
  phone: SchoolUpdateFieldValue;
  email: SchoolUpdateFieldValue;
}>;

export type SchoolCreateFields = SchoolUpdateFields & {
  school_name: string;
  school_code: string;
  province: string;
  ward: string;
};

export type CrudFieldValue = string | number | boolean | null;

export interface StudentSchoolRecord<TFields = Record<string, unknown>> {
  doctype: "CRM Lead" | "CRM Student" | "CRM High School";
  name: string;
  fields: TFields;
}

export type StudentScoreDetails = Record<string, unknown> | unknown[];

export interface StudentHighSchoolScoreFields {
  graduation_score: number | null;
  transcript_score: number | null;
  total_score: number | null;
  is_high_school_graduate: boolean | null;
  graduation_year: number | null;
  academic_rank: string | null;
  priority_group: string | null;
  graduation_classification: string | null;
  conduct_rank: string | null;
  grade_12_gpa: number | null;
  exam_candidate_number: string | null;
  score_details: StudentScoreDetails | null;
  encouragement_type: string | null;
  encouragement_score: number | null;
  priority_type: string | null;
  priority_score: number | null;
}

export type StudentHighSchoolScoreUpdateFields =
  Partial<StudentHighSchoolScoreFields>;

export interface StudentHighSchoolScoreResponse {
  doctype: "CRM Student";
  name: string;
  admission_profile: string | null;
  admission_year: string | null;
  fields: StudentHighSchoolScoreFields;
}

export interface UpdateStudentHighSchoolScoreResponse extends StudentHighSchoolScoreResponse {
  updated_fields: StudentHighSchoolScoreUpdateFields;
}

export interface SchoolListRecord {
  name: string;
  fields: Record<string, unknown>;
}

export interface GetSchoolsResponse {
  doctype: "CRM High School";
  filters: Record<string, unknown>;
  schools: SchoolListRecord[];
}

export interface FieldOption {
  value: string;
  label: string;
  groupName?: string | null;
  groupLabel?: string | null;
}

export interface GetFieldOptionsResponse {
  doctype: "CRM Lead" | "CRM Student" | "CRM High School";
  fieldname: string;
  fieldtype: "Link" | "Select";
  target_doctype: string | null;
  options: FieldOption[];
}

export interface LeadOption extends FieldOption {
  user?: string | null;
}

export interface GetLeadOptionsResponse {
  staff: LeadOption[];
  segments: LeadOption[];
  events: LeadOption[];
  advertising_channel: FieldOption[];
}

export interface LeadImportError {
  row: number;
  code: string;
  message: string;
}

export interface LeadImportResponse {
  filename: string | null;
  total: number;
  created: number;
  failed: number;
  students: Array<{ row: number; name: string }>;
  errors: LeadImportError[];
}

export interface GetSchoolsParams {
  province?: string;
  ward?: string;
  search?: string;
  limit?: number;
}

export interface GetFieldOptionsParams {
  doctype: "CRM Lead" | "CRM Student" | "CRM High School";
  fieldname: string;
  search?: string;
  filters?: Record<string, CrudFieldValue>;
  province?: string;
  high_school?: string;
  limit?: number;
}

export interface UpdateRecordResponse<TFields> {
  doctype: "CRM Lead" | "CRM Student" | "CRM High School";
  name: string;
  updated_fields: TFields;
}

export interface CreateRecordResponse<TFields> {
  doctype: "CRM Student" | "CRM Lead" | "CRM High School";
  name: string;
  created_fields: TFields;
}

export interface DeleteRecordResponse {
  doctype: "CRM Lead" | "CRM High School";
  name: string;
  deleted: true;
}

export class StudentSchoolUpdateApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "StudentSchoolUpdateApiError";
  }
}

/**
 * Keeps the CRUD payload aligned with CRM Student's grade/study-stage contract.
 * The backend deliberately does not infer study_stage, so the client must
 * remove an unknown or incompatible stage instead of sending a wrong value.
 */
export function normalizeStudentFields<TFields extends StudentUpdateFields>(
  fields: TFields,
): TFields {
  const normalizedFields = { ...fields } as TFields;

  if (
    "study_stage" in normalizedFields &&
    !("current_grade" in normalizedFields)
  ) {
    const normalizedStage = normalizeStudentStudyStage(
      normalizedFields.study_stage,
    );
    if (normalizedStage) {
      normalizedFields.study_stage = normalizedStage;
    } else {
      delete normalizedFields.study_stage;
    }
    return normalizedFields;
  }

  if ("current_grade" in normalizedFields) {
    const normalizedGrade =
      typeof normalizedFields.current_grade === "string"
        ? normalizedFields.current_grade.trim()
        : normalizedFields.current_grade;
    if (normalizedGrade !== normalizedFields.current_grade) {
      normalizedFields.current_grade = normalizedGrade;
    }

    const studyStage = getStudentStudyStageForPayload(
      normalizedGrade,
      normalizedFields.study_stage,
    );
    if (studyStage) {
      normalizedFields.study_stage = studyStage;
    } else {
      delete normalizedFields.study_stage;
    }
  }

  return normalizedFields;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function viaNest<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new StudentSchoolUpdateApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

/** Runs an operation owned by the student/school adapter. */
function callSchoolApi<T>(
  method: string,
  params: Params,
  body?: Body,
): Promise<T> {
  return viaNest(async () => {
    const result = await nestStudentSchoolHandler(method, params, body);
    if (result === NOT_HANDLED) {
      throw new StudentSchoolUpdateApiError(
        501,
        "FEATURE_NOT_MIGRATED",
        "Chức năng này chưa có trên máy chủ CRM.",
      );
    }
    return result as T;
  });
}

function assertObject(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new StudentSchoolUpdateApiError(
      502,
      "INVALID_API_RESPONSE",
      "Phản hồi từ CRM không hợp lệ.",
    );
  }
}

export async function getStudent<TFields = Record<string, unknown>>(
  name: string,
) {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new StudentSchoolUpdateApiError(
      400,
      "INVALID_NAME",
      "Thiếu tên bản ghi cần tải.",
    );
  }
  return viaNest(() => nestReadStudent(normalizedName)) as unknown as Promise<
    StudentSchoolRecord<TFields>
  >;
}

export async function getStudentHighSchoolScore(
  name: string,
  admissionYear?: string,
): Promise<StudentHighSchoolScoreResponse> {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new StudentSchoolUpdateApiError(
      400,
      "INVALID_NAME",
      "Thiếu tên bản ghi cần tải điểm THPT.",
    );
  }

  return viaNest(async () => {
    const result = await nestRequest<{
      data: StudentHighSchoolScoreResponse;
    }>(
      `/api/v1/students/${encodeURIComponent(normalizedName)}/high-school-score`,
      {
        query: { admission_year: admissionYear?.trim() || undefined },
      },
    );
    return result.data;
  });
}

export async function updateStudentHighSchoolScore(
  name: string,
  fields: StudentHighSchoolScoreUpdateFields,
): Promise<UpdateStudentHighSchoolScoreResponse> {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new StudentSchoolUpdateApiError(
      400,
      "INVALID_NAME",
      "Thiếu tên bản ghi cần cập nhật điểm THPT.",
    );
  }
  if (!fields || Object.keys(fields).length === 0) {
    throw new StudentSchoolUpdateApiError(
      400,
      "INVALID_FIELDS",
      "Vui lòng thay đổi ít nhất một trường điểm THPT.",
    );
  }

  return viaNest(async () => {
    const current = await nestRequest<{
      data: { revision: number };
    }>(`/api/v1/students/${encodeURIComponent(normalizedName)}`);
    const result = await nestRequest<{
      data: UpdateStudentHighSchoolScoreResponse;
    }>(
      `/api/v1/students/${encodeURIComponent(normalizedName)}/high-school-score`,
      {
        method: "PUT",
        body: {
          ...fields,
          expectedRevision: current.data.revision,
        },
      },
    );
    return result.data;
  });
}

export function getSchools(
  params: GetSchoolsParams = {},
): Promise<GetSchoolsResponse> {
  return viaNest(() => nestSchools(params));
}

export function getFieldOptions(
  params: GetFieldOptionsParams,
): Promise<GetFieldOptionsResponse> {
  return viaNest(() => nestFieldOptions(params));
}

export async function getLeadOptions(
  limit = 100,
): Promise<GetLeadOptionsResponse> {
  const message = await callSchoolApi<unknown>(
    "crm.api.lead_mapping.get_lead_options",
    { limit: String(limit) },
  );
  assertObject(message);
  if (
    !isLeadOptionArray(message.staff) ||
    !isLeadOptionArray(message.segments) ||
    !isLeadOptionArray(message.events) ||
    !isFieldOptionArray(message.advertising_channel)
  ) {
    throw new StudentSchoolUpdateApiError(
      502,
      "INVALID_LEAD_OPTIONS_RESPONSE",
      "Phản hồi lựa chọn Lead không hợp lệ.",
    );
  }

  return message as unknown as GetLeadOptionsResponse;
}

function isFieldOptionArray(value: unknown): value is FieldOption[] {
  return Array.isArray(value) && value.every(isFieldOption);
}

function isLeadOptionArray(value: unknown): value is LeadOption[] {
  return (
    Array.isArray(value) &&
    value.every((option) => {
      if (!isFieldOption(option)) return false;
      const user = (option as LeadOption).user;
      return user === undefined || user === null || typeof user === "string";
    })
  );
}

function isFieldOption(value: unknown): value is FieldOption {
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).value === "string" &&
    typeof (value as Record<string, unknown>).label === "string",
  );
}

function assertUpdateFields(name: string, fields: unknown) {
  if (!name) {
    throw new StudentSchoolUpdateApiError(
      400,
      "INVALID_NAME",
      "Thiếu tên bản ghi cần cập nhật.",
    );
  }
  if (
    !fields ||
    typeof fields !== "object" ||
    Object.keys(fields).length === 0
  ) {
    throw new StudentSchoolUpdateApiError(
      400,
      "INVALID_FIELDS",
      "Vui lòng thay đổi ít nhất một trường.",
    );
  }
}

export async function updateStudent(name: string, fields: StudentUpdateFields) {
  const normalizedName = name.trim();
  const normalizedFields = normalizeStudentFields(fields);
  assertUpdateFields(normalizedName, normalizedFields);
  return viaNest(() =>
    nestUpdateStudent(
      normalizedName,
      normalizedFields as Record<string, unknown>,
    ),
  ) as unknown as Promise<UpdateRecordResponse<StudentUpdateFields>>;
}

export async function requestStudentStageTransition({
  student,
  target_stage,
}: StudentStageTransitionRequest): Promise<void> {
  const normalizedStudent = text(student);
  if (!normalizedStudent) {
    throw new StudentSchoolUpdateApiError(
      400,
      "INVALID_STUDENT",
      "Thiếu học sinh cần cập nhật trạng thái.",
    );
  }

  await viaNest(() => nestStudentStage(normalizedStudent, target_stage));
}

export async function updateSchool(name: string, fields: SchoolUpdateFields) {
  const normalizedName = name.trim();
  assertUpdateFields(normalizedName, fields);
  const message = await callSchoolApi<unknown>(
    "crm.api.student_school.update_school",
    {},
    { name: normalizedName, fields },
  );
  assertObject(message);
  if (
    typeof message.name !== "string" ||
    !message.updated_fields ||
    typeof message.updated_fields !== "object"
  ) {
    throw new StudentSchoolUpdateApiError(
      502,
      "INVALID_UPDATE_RESPONSE",
      "Phản hồi cập nhật dữ liệu không hợp lệ.",
    );
  }
  return message as unknown as UpdateRecordResponse<SchoolUpdateFields>;
}

async function createRecord<TFields>(
  method: "create_student" | "create_student_with_lead" | "create_school",
  fields: TFields,
): Promise<CreateRecordResponse<TFields>> {
  if (
    !fields ||
    typeof fields !== "object" ||
    Object.keys(fields as object).length === 0
  ) {
    throw new StudentSchoolUpdateApiError(
      400,
      "INVALID_FIELDS",
      "Vui lòng nhập thông tin để tạo bản ghi.",
    );
  }

  const message = await callSchoolApi<unknown>(
    `crm.api.student_school.${method}`,
    {},
    { fields },
  );
  assertObject(message);
  if (
    typeof message.name !== "string" ||
    !message.created_fields ||
    typeof message.created_fields !== "object"
  ) {
    throw new StudentSchoolUpdateApiError(
      502,
      "INVALID_CREATE_RESPONSE",
      "Phản hồi tạo bản ghi không hợp lệ.",
    );
  }

  return message as unknown as CreateRecordResponse<TFields>;
}

export function createStudent(fields: StudentCreateFields) {
  return createRecord("create_student", normalizeStudentFields(fields));
}
export function createStudentWithLead(fields: StudentCreateWithLeadFields) {
  const normalizedFields: StudentCreateWithLeadFields = {
    student_name: fields.student_name.trim(),
    phone: fields.phone.trim(),
    province: fields.province.trim(),
    campaign: fields.campaign.trim(),
    assigned_to: fields.assigned_to.trim(),
    ...compactStudentCreateFields({
      id_number: fields.id_number,
      ward: fields.ward,
      high_school: fields.high_school,
      admission_year: fields.admission_year,
      email: fields.email,
      other_email: fields.other_email,
      gender: fields.gender,
      major: fields.major,
      current_grade: fields.current_grade,
      study_stage: fields.study_stage,
      advertising_channel: fields.advertising_channel,
      segments: fields.segments,
      conversion_potential: fields.conversion_potential,
      branch: fields.branch,
      tags: fields.tags,
      aspiration: fields.aspiration,
      event_participated: fields.event_participated,
      description: fields.description,
      alt_name: fields.alt_name,
      alt_phone: fields.alt_phone,
      alt_address: fields.alt_address,
    }),
  };

  return createRecord("create_student_with_lead", normalizedFields);
}

function compactStudentCreateFields(
  fields: Partial<Record<keyof StudentCreateWithLeadFields, string | null>>,
) {
  return Object.fromEntries(
    Object.entries(fields).flatMap(([key, value]) => {
      if (typeof value !== "string") return [];
      const trimmed = value.trim();
      return trimmed ? [[key, trimmed]] : [];
    }),
  ) as Partial<StudentCreateWithLeadFields>;
}

export function createSchool(fields: SchoolCreateFields) {
  return createRecord("create_school", fields);
}

async function deleteRecord(
  name: string,
  method: "delete_student" | "delete_school",
) {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new StudentSchoolUpdateApiError(
      400,
      "INVALID_NAME",
      "Thiếu tên bản ghi cần xóa.",
    );
  }

  const message = await callSchoolApi<unknown>(
    `crm.api.student_school.${method}`,
    {},
    { name: normalizedName },
  );
  assertObject(message);
  if (typeof message.name !== "string" || message.deleted !== true) {
    throw new StudentSchoolUpdateApiError(
      502,
      "INVALID_DELETE_RESPONSE",
      "Phản hồi xóa bản ghi không hợp lệ.",
    );
  }

  return message as unknown as DeleteRecordResponse;
}

export function deleteStudent(name: string) {
  return deleteRecord(name, "delete_student");
}

export function deleteSchool(name: string) {
  return deleteRecord(name, "delete_school");
}
