import { NestApiError } from "../nest/nest-client";
import { NOT_HANDLED } from "../nest/nest-handler";
import { nestStudentActionsHandler } from "../nest/nest-student-actions-router";
import type {
  CompleteActionParams,
  CompleteActionResponse,
  StartActionParams,
  StartActionResponse,
  StudentWorklistActionsResponse,
  StudentWorklistItem,
} from "./types";

export type * from "./types";

const METHOD = "crm.api.student_worklist.list_actions_for_record";
const TRANSITION_METHOD = "crm.api.student_decision.transition_action";
const COMPLETE_METHOD = "crm.api.action_workbench.complete_action_manually";

export class StudentWorklistApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "StudentWorklistApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Run a worklist operation through the Nest adapter and type its failures. */
async function callWorklistApi(
  method: string,
  params: Record<string, string | undefined>,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const result = await nestStudentActionsHandler(method, params, body);
    if (result === NOT_HANDLED) {
      throw new NestApiError(501, "NOT_PORTED", `${method} is not available.`);
    }
    return asRecord(result) ?? {};
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new StudentWorklistApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizeStudentWorklistActions(
  value: unknown,
): StudentWorklistActionsResponse {
  const payload = asRecord(value) ?? {};
  if (!Array.isArray(payload.items)) {
    throw new Error("Invalid student worklist response");
  }

  const items: StudentWorklistItem[] = payload.items.flatMap((item, index) => {
    const action = asRecord(item);
    const objective = textValue(action?.objective);
    if (!objective) return [];

    const outcomeCodes = Array.isArray(action?.outcome_codes)
      ? action.outcome_codes.flatMap((entry) => {
          const option = asRecord(entry);
          const value = textValue(option?.value);
          if (!value) return [];
          return [{ value, label: textValue(option?.label) ?? value }];
        })
      : [];

    return [
      {
        name: textValue(action?.name) ?? `student-action-${index}`,
        student: textValue(action?.student),
        actionType: textValue(action?.action_type),
        objective,
        state: textValue(action?.state) ?? "pending",
        executionStatus: textValue(action?.execution_status),
        priority: textValue(action?.priority) ?? "medium",
        dueAt: textValue(action?.due_at),
        actionOwner: textValue(action?.action_owner),
        origin: textValue(action?.origin),
        revision: numberValue(action?.revision, 1),
        packageRevision: numberValue(action?.package_revision, 0),
        outcome: textValue(action?.outcome),
        outcomeCodes,
        linkedInteraction: textValue(action?.linked_interaction),
        permittedTransitions: Array.isArray(action?.permitted_transitions)
          ? action.permitted_transitions.filter(
              (value): value is string => typeof value === "string",
            )
          : [],
        isToday: action?.is_today === true,
        isOverdue: action?.is_overdue === true,
      },
    ];
  });

  return { items };
}

function generateIdempotencyKey(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getStudentWorklistActions(
  studentId: string,
): Promise<StudentWorklistActionsResponse> {
  const normalizedStudentId = studentId.trim();
  if (!normalizedStudentId) {
    throw new StudentWorklistApiError(
      400,
      "INVALID_STUDENT_ID",
      "Thiếu mã học sinh để tải NBA.",
    );
  }

  const payload = await callWorklistApi(METHOD, {
    doctype: "CRM Student",
    name: normalizedStudentId,
    page_size: "50",
  });

  try {
    return normalizeStudentWorklistActions(payload);
  } catch {
    throw new StudentWorklistApiError(
      502,
      "INVALID_STUDENT_WORKLIST_RESPONSE",
      "Phản hồi danh sách NBA của học sinh không hợp lệ.",
    );
  }
}

export async function startAction(
  params: StartActionParams,
): Promise<StartActionResponse> {
  const raw = await callWorklistApi(
    TRANSITION_METHOD,
    {},
    {
      name: params.action,
      expected_revision: params.expectedActionRevision,
      status: "in_progress",
      idempotency_key: params.idempotencyKey,
    },
  );

  return {
    name: textValue(raw.action) ?? params.action,
    executionStatus: textValue(raw.status) ?? "in_progress",
    revision: numberValue(raw.revision, params.expectedActionRevision + 1),
  };
}

export async function completeActionManually(
  params: CompleteActionParams,
): Promise<CompleteActionResponse> {
  const raw = await callWorklistApi(
    COMPLETE_METHOD,
    {},
    {
      action: params.action,
      idempotency_key: params.idempotencyKey,
      expected_action_revision: params.expectedActionRevision,
      expected_package_revision: params.expectedPackageRevision,
      outcome_code: params.outcomeCode,
      ...(params.outcomeEvidence
        ? { outcome_evidence: params.outcomeEvidence }
        : {}),
      ...(params.outcomeNotes ? { outcome_notes: params.outcomeNotes } : {}),
    },
  );

  return {
    name: textValue(raw.action) ?? params.action,
    executionStatus: textValue(raw.status) ?? "completed",
    revision: numberValue(raw.revision, params.expectedActionRevision + 1),
  };
}

export { generateIdempotencyKey };
