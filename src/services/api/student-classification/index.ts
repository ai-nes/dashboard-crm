const METHODS = {
  GET: "crm.api.student_classification.get_classifications",
  TAG_GROUPS: "crm.api.student_classification.list_tag_groups",
  ADD_TAG: "crm.api.student_classification.add_student_tag",
  REMOVE_TAG: "crm.api.student_classification.remove_student_tag",
  UPDATE_TAG: "crm.api.student_classification.update_student_tag",
} as const;

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

export type StudentClassificationRequestOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message !== undefined ? root.message : value;
}

function resolveBaseUrl(
  options: StudentClassificationRequestOptions = {},
): string {
  const baseUrl = (
    options.baseUrl ??
    process.env.NEXT_PUBLIC_FRAPPE_URL ??
    ""
  ).replace(/\/+$/, "");
  if (!baseUrl) {
    throw new StudentClassificationApiError(
      0,
      "FRAPPE_URL_MISSING",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }
  return baseUrl;
}

function frappeCookieHeader(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function requestHeaders(
  options: StudentClassificationRequestOptions,
  isWrite: boolean,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(isWrite ? { "Content-Type": "application/json" } : {}),
    ...(options.headers ?? {}),
  };

  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Service tests and non-request contexts do not have Next headers.
    }
  }

  if (typeof window !== "undefined" && isWrite) {
    const csrfToken = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="))
      ?.split("=")
      .slice(1)
      .join("=");

    if (csrfToken) {
      headers["X-Frappe-CSRF-Token"] = decodeURIComponent(csrfToken);
    } else {
      try {
        const response = await fetch(
          `${resolveBaseUrl(options)}/api/method/crm.api.session.me`,
          { credentials: "include", headers: { Accept: "application/json" } },
        );
        const payload = (await response.json().catch(() => null)) as {
          message?: { csrf_token?: unknown };
        } | null;
        if (typeof payload?.message?.csrf_token === "string") {
          headers["X-Frappe-CSRF-Token"] = payload.message.csrf_token;
        }
      } catch {
        // The write request returns the authoritative CSRF error if needed.
      }
    }
  }

  return headers;
}

function getErrorDetails(
  value: unknown,
  status: number,
): { code: string; message: string } {
  const root = asRecord(value);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);

  if (
    error?.code === "REVISION_CONFLICT" ||
    text(root?.exception).includes("REVISION_CONFLICT:")
  ) {
    return {
      code: "REVISION_CONFLICT",
      message: "Hồ sơ vừa được cập nhật. Đã tải lại tag, vui lòng chọn lại.",
    };
  }

  return {
    code:
      text(error?.code) ||
      text(message?.code) ||
      (status === 401
        ? "UNAUTHENTICATED"
        : status === 403
          ? "FORBIDDEN"
          : `HTTP_${status}`),
    message:
      text(error?.message) ||
      text(message?.message) ||
      text(root?.exception) ||
      text(root?.message) ||
      `Không thể gọi API tag học sinh (${status}).`,
  };
}

async function request(
  url: string,
  options: StudentClassificationRequestOptions,
  init: RequestInit,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: await requestHeaders(options, init.method === "POST"),
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      cache: "no-store",
    });
  } catch {
    throw new StudentClassificationApiError(
      503,
      "STUDENT_CLASSIFICATION_UNAVAILABLE",
      "Không thể kết nối tới dịch vụ tag học sinh.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = getErrorDetails(payload, response.status);
    throw new StudentClassificationApiError(
      response.status,
      details.code,
      details.message,
    );
  }

  return payload;
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
  const source = asRecord(unwrapMessage(value));
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
  const source = unwrapMessage(value);
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
  options: StudentClassificationRequestOptions = {},
): Promise<StudentClassificationsResponse> {
  const normalizedStudentId = requireStudentId(studentId);
  const url = new URL(`${resolveBaseUrl(options)}/api/method/${METHODS.GET}`);
  url.searchParams.set("student", normalizedStudentId);
  const payload = await request(url.toString(), options, { method: "GET" });
  return normalizeClassifications(payload);
}

export async function listStudentTagGroups(
  params: StudentTagGroupsParams = {},
  options: StudentClassificationRequestOptions = {},
): Promise<StudentTagGroup[]> {
  const url = new URL(
    `${resolveBaseUrl(options)}/api/method/${METHODS.TAG_GROUPS}`,
  );
  url.searchParams.set("status", params.status ?? "active");
  url.searchParams.set("start", String(params.start ?? 0));
  url.searchParams.set("page_length", String(params.pageLength ?? 100));
  const payload = await request(url.toString(), options, { method: "GET" });
  return normalizeTagGroups(payload);
}

/** Fetch all pages so selected historical tags also have catalogue labels. */
export async function getStudentTagCatalogue(): Promise<StudentTagGroup[]> {
  const groups = new Map<string, StudentTagRecord[]>();
  const pageLength = 100;
  for (let start = 0; ; start += pageLength) {
    const page = await listStudentTagGroups({ status: "", start, pageLength });
    for (const group of page) {
      groups.set(group.group_name, [
        ...(groups.get(group.group_name) ?? []),
        ...group.tags,
      ]);
    }
    if (
      page.reduce((count, group) => count + group.tags.length, 0) < pageLength
    )
      break;
  }
  return Array.from(groups, ([group_name, tags]) => ({ group_name, tags }));
}

async function mutateStudentTag(
  method: (typeof METHODS)["ADD_TAG" | "REMOVE_TAG"],
  requestBody: StudentTagMutationRequest,
  options: StudentClassificationRequestOptions,
): Promise<StudentClassificationsResponse> {
  const student = requireStudentId(requestBody.studentId);
  const tag = requireTag(requestBody.tag);
  const expectedModified = requireModified(requestBody.expectedModified);
  const payload = await request(
    `${resolveBaseUrl(options)}/api/method/${method}`,
    options,
    {
      method: "POST",
      body: JSON.stringify({
        student,
        tag,
        expected_modified: expectedModified,
      }),
    },
  );
  return normalizeClassifications(payload);
}

export function addStudentTag(
  requestBody: StudentTagMutationRequest,
  options: StudentClassificationRequestOptions = {},
) {
  return mutateStudentTag(METHODS.ADD_TAG, requestBody, options);
}

export function removeStudentTag(
  requestBody: StudentTagMutationRequest,
  options: StudentClassificationRequestOptions = {},
) {
  return mutateStudentTag(METHODS.REMOVE_TAG, requestBody, options);
}

export async function updateStudentTag(
  requestBody: UpdateStudentTagRequest,
  options: StudentClassificationRequestOptions = {},
): Promise<StudentClassificationsResponse> {
  const student = requireStudentId(requestBody.studentId);
  const tag = requireTag(requestBody.tag);
  const newTag = requireTag(requestBody.newTag, "newTag");
  const expectedModified = requireModified(requestBody.expectedModified);
  const payload = await request(
    `${resolveBaseUrl(options)}/api/method/${METHODS.UPDATE_TAG}`,
    options,
    {
      method: "POST",
      body: JSON.stringify({
        student,
        tag,
        new_tag: newTag,
        expected_modified: expectedModified,
      }),
    },
  );
  return normalizeClassifications(payload);
}
