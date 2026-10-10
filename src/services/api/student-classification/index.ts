import { NestApiError } from "../nest/nest-client";
import { nestStudentClassificationRequest } from "../nest/nest-segment-router";
export interface StudentClassificationAssignment {
  name?: string;
  tag: string;
  term: string;
}

export interface StudentClassificationsResponse {
  student: string;
  modified: string;
  admission_stage?: string | null;
  potential?: string | null;
  intent?: string | null;
  needs: StudentClassificationAssignment[];
  tags: StudentClassificationAssignment[];
}

export interface StudentTagRecord {
  name: string;
  code: string;
  label: string;
  group_name: string;
  description?: string | null;
  status?: string | null;
  revision?: number;
}

export interface StudentTagGroup {
  group_name: string;
  tags: StudentTagRecord[];
}

export interface StudentTagGroupsParams {
  status?: string;
  start?: number;
  pageLength?: number;
}

export interface StudentTagMutationRequest {
  studentId: string;
  tag: string;
  expectedModified: string;
}

export interface UpdateStudentTagRequest extends StudentTagMutationRequest {
  newTag: string;
}

export class StudentClassificationApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "StudentClassificationApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Per-student tag calls go through the classification adapter. */
async function request(
  method: string,
  params: Record<string, string | undefined>,
): Promise<unknown> {
  try {
    return await nestStudentClassificationRequest<unknown>(method, params);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new StudentClassificationApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}
function requireStudentId(studentId: string): string {
  const normalizedStudentId = studentId.trim();
  if (!normalizedStudentId) {
    throw new StudentClassificationApiError(
      400,
      "INVALID_STUDENT_ID",
      "studentId là bắt buộc.",
    );
  }
  return normalizedStudentId;
}

function requireModified(modified: string): string {
  const normalizedModified = modified.trim();
  if (!normalizedModified) {
    throw new StudentClassificationApiError(
      400,
      "INVALID_MODIFIED",
      "Thiếu phiên bản dữ liệu tag; hãy tải lại hồ sơ.",
    );
  }
  return normalizedModified;
}

function requireTag(tag: string, fieldName = "tag"): string {
  const normalizedTag = tag.trim();
  if (!normalizedTag) {
    throw new StudentClassificationApiError(
      400,
      "INVALID_TAG",
      `${fieldName} là bắt buộc.`,
    );
  }
  return normalizedTag;
}

function normalizeAssignment(
  value: unknown,
  index: number,
): StudentClassificationAssignment {
  const source = asRecord(value);
  const tag = text(source?.tag) || text(source?.term);
  if (!tag) {
    throw new Error(`tags[${index}] thiếu tag.`);
  }

  return {
    ...(text(source?.name) ? { name: text(source?.name) } : {}),
    tag,
    term: text(source?.term) || tag,
  };
}

function normalizeClassifications(
  value: unknown,
): StudentClassificationsResponse {
  const source = asRecord(value);
  const tags = Array.isArray(source?.tags)
    ? source.tags.map(normalizeAssignment)
    : null;
  const needs = Array.isArray(source?.needs)
    ? source.needs.map(normalizeAssignment)
    : null;

  if (
    !source ||
    !text(source.student) ||
    !text(source.modified) ||
    !tags ||
    !needs
  ) {
    throw new StudentClassificationApiError(
      502,
      "INVALID_STUDENT_CLASSIFICATIONS_RESPONSE",
      "Phản hồi tag học sinh không hợp lệ.",
    );
  }

  return {
    student: text(source.student),
    modified: text(source.modified),
    admission_stage: text(source.admission_stage) || null,
    potential: text(source.potential) || null,
    intent: text(source.intent) || null,
    needs,
    tags,
  };
}

function normalizeTagRecord(value: unknown, index: number): StudentTagRecord {
  const source = asRecord(value);
  const name = text(source?.name);
  const code = text(source?.code) || name;
  const label = text(source?.label) || code;
  if (!name || !code) {
    throw new Error(`tags[${index}] thiếu name hoặc code.`);
  }

  return {
    name,
    code,
    label,
    group_name: text(source?.group_name) || "Khác",
    description: text(source?.description) || null,
    status: text(source?.status) || null,
    revision:
      typeof source?.revision === "number" ? source.revision : undefined,
  };
}

function normalizeTagGroups(value: unknown): StudentTagGroup[] {
  const source = value;
  if (!Array.isArray(source)) {
    throw new StudentClassificationApiError(
      502,
      "INVALID_STUDENT_TAG_GROUPS_RESPONSE",
      "Phản hồi danh sách nhóm tag không hợp lệ.",
    );
  }

  try {
    return source.map((group, groupIndex) => {
      const record = asRecord(group);
      const tags = Array.isArray(record?.tags)
        ? record.tags.map(normalizeTagRecord)
        : null;
      if (!record || !text(record.group_name) || !tags) {
        throw new Error(`groups[${groupIndex}] không hợp lệ.`);
      }
      return { group_name: text(record.group_name), tags };
    });
  } catch {
    throw new StudentClassificationApiError(
      502,
      "INVALID_STUDENT_TAG_GROUPS_RESPONSE",
      "Phản hồi danh sách nhóm tag không hợp lệ.",
    );
  }
}

export async function getStudentClassifications(
  studentId: string,
): Promise<StudentClassificationsResponse> {
  const student = requireStudentId(studentId);
  return normalizeClassifications(
    await request("get_classifications", { student }),
  );
}

export async function listStudentTagGroups(
  params: StudentTagGroupsParams = {},
): Promise<StudentTagGroup[]> {
  const payload = await request("list_tag_groups", {
    status: params.status ?? "active",
    start: String(params.start ?? 0),
    page_length: String(params.pageLength ?? 100),
  });
  return normalizeTagGroups(payload);
}

/** Fetch all pages so selected historical tags also have catalogue labels. */
export async function getStudentTagCatalogue(): Promise<StudentTagGroup[]> {
  const groups = new Map<string, StudentTagRecord[]>();
  const seen = new Set<string>();
  const pageLength = 100;
  for (let start = 0; ; start += pageLength) {
    const page = await listStudentTagGroups({ status: "", start, pageLength });
    let added = 0;
    for (const group of page) {
      const fresh = group.tags.filter((tag) => !seen.has(tag.name));
      for (const tag of fresh) seen.add(tag.name);
      added += fresh.length;
      groups.set(group.group_name, [
        ...(groups.get(group.group_name) ?? []),
        ...fresh,
      ]);
    }
    // A short page, or a page that repeats earlier tags, is the last one.
    if (
      added === 0 ||
      page.reduce((count, group) => count + group.tags.length, 0) < pageLength
    )
      break;
  }
  return Array.from(groups, ([group_name, tags]) => ({ group_name, tags }));
}

async function mutateStudentTag(
  method: "add_student_tag" | "remove_student_tag",
  requestBody: StudentTagMutationRequest,
): Promise<StudentClassificationsResponse> {
  const student = requireStudentId(requestBody.studentId);
  const tag = requireTag(requestBody.tag);
  const expectedModified = requireModified(requestBody.expectedModified);
  return normalizeClassifications(
    await request(method, {
      student,
      tag,
      expected_modified: expectedModified,
    }),
  );
}

export function addStudentTag(requestBody: StudentTagMutationRequest) {
  return mutateStudentTag("add_student_tag", requestBody);
}

export function removeStudentTag(requestBody: StudentTagMutationRequest) {
  return mutateStudentTag("remove_student_tag", requestBody);
}

export async function updateStudentTag(
  requestBody: UpdateStudentTagRequest,
): Promise<StudentClassificationsResponse> {
  const student = requireStudentId(requestBody.studentId);
  const tag = requireTag(requestBody.tag);
  const newTag = requireTag(requestBody.newTag, "newTag");
  const expectedModified = requireModified(requestBody.expectedModified);
  return normalizeClassifications(
    await request("update_student_tag", {
      student,
      tag,
      new_tag: newTag,
      expected_modified: expectedModified,
    }),
  );
}
