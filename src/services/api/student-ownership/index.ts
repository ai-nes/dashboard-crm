import { NestApiError } from "../nest/nest-client";
import {
  nestAssignableOwners,
  nestAssignOwner,
} from "../nest/nest-student-ownership";

export interface AssignableSale {
  name: string;
  label: string;
  profile: string;
  role: string;
  function: string;
  team: string;
  /** Team id when the backend distinguishes it from the display name. */
  teamId?: string;
  campus: string;
}

export interface AssignableSalesResponse {
  studentId: string;
  sales: AssignableSale[];
}

export interface AssignStudentToSalesRequest {
  studentId: string;
  ownerId: string;
  reason: string;
  expectedRevision: number;
  idempotencyKey: string;
  correlationId: string;
  targetTeamId: string;
}

export type AssignStudentToSalesResponse = Record<string, unknown>;

export class StudentOwnershipApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "StudentOwnershipApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function withNestErrors<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new StudentOwnershipApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

function normalizeAssignableSale(
  value: unknown,
  index: number,
): AssignableSale {
  const source = asRecord(value);
  const sale = {
    name: text(source?.name).trim(),
    label: text(source?.label).trim(),
    profile: text(source?.profile).trim(),
    role: text(source?.role).trim(),
    function: text(source?.function).trim(),
    team: text(source?.team).trim(),
    ...(text(source?.teamId).trim()
      ? { teamId: text(source?.teamId).trim() }
      : {}),
    campus: text(source?.campus).trim(),
  };

  if (!sale.name || !sale.label) {
    throw new Error(`sales[${index}] thiếu name hoặc label`);
  }

  return sale;
}

function normalizeAssignableSales(
  studentId: string,
  value: unknown,
): AssignableSalesResponse {
  const source = asRecord(value);
  const sales = Array.isArray(source?.owners)
    ? source.owners.map((sale, index) => normalizeAssignableSale(sale, index))
    : null;

  if (!sales) {
    throw new Error("Phản hồi danh sách người phụ trách không hợp lệ");
  }

  return { studentId, sales };
}

export async function getAssignableSales(
  studentId: string,
  search = "",
): Promise<AssignableSalesResponse> {
  const normalizedStudentId = studentId.trim();
  if (!normalizedStudentId) {
    throw new StudentOwnershipApiError(
      400,
      "INVALID_STUDENT_ID",
      "studentId là bắt buộc.",
    );
  }

  const payload = await withNestErrors(() =>
    nestAssignableOwners(normalizedStudentId),
  );

  try {
    const result = normalizeAssignableSales(normalizedStudentId, payload);
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return normalizedSearch
      ? {
          ...result,
          sales: result.sales.filter((sale) =>
            [sale.label, sale.team, sale.campus, sale.role, sale.profile]
              .join(" ")
              .toLocaleLowerCase()
              .includes(normalizedSearch),
          ),
        }
      : result;
  } catch {
    throw new StudentOwnershipApiError(
      502,
      "INVALID_ASSIGNABLE_SALES_RESPONSE",
      "Phản hồi danh sách Sale/CTV Sale không hợp lệ.",
    );
  }
}

export async function assignStudentToSales(
  requestBody: AssignStudentToSalesRequest,
): Promise<AssignStudentToSalesResponse> {
  const studentId = requestBody.studentId.trim();
  const ownerId = requestBody.ownerId.trim();
  const reason = requestBody.reason.trim();
  const idempotencyKey = requestBody.idempotencyKey.trim();
  const correlationId = requestBody.correlationId.trim();
  const targetTeamId = requestBody.targetTeamId.trim();

  if (
    !studentId ||
    !ownerId ||
    !reason ||
    !idempotencyKey ||
    !correlationId ||
    !targetTeamId ||
    !Number.isInteger(requestBody.expectedRevision) ||
    requestBody.expectedRevision < 0
  ) {
    throw new StudentOwnershipApiError(
      400,
      "INVALID_PAYLOAD",
      "studentId, ownerId, targetTeamId, expectedRevision, reason, idempotencyKey và correlationId là bắt buộc.",
    );
  }

  return withNestErrors(() =>
    nestAssignOwner({
      studentId,
      ownerId,
      targetTeamId,
      reason,
      expectedRevision: requestBody.expectedRevision,
      idempotencyKey,
    }),
  );
}
