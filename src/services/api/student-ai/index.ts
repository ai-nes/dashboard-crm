import { nestRequest } from "../nest/nest-client";
import type {
  AiMemoryEdit,
  AiMemoryItem,
  StudentAiOverview,
  StudentAiState,
} from "./types";

export * from "./types";

const base = (studentId: string) =>
  `/api/v1/students/${encodeURIComponent(studentId)}/ai`;

export function getStudentAi(studentId: string): Promise<StudentAiOverview> {
  return nestRequest<StudentAiOverview>(base(studentId));
}

/** Queues one analysis ("Phân tích"); returns where it stands. */
export function requestStudentAnalysis(
  studentId: string,
): Promise<{ state: StudentAiState; error?: string }> {
  return nestRequest(`${base(studentId)}/analysis`, {
    method: "POST",
    body: {},
  });
}

export async function listStudentMemory(
  studentId: string,
  statuses?: string[],
): Promise<AiMemoryItem[]> {
  const result = await nestRequest<{ items: AiMemoryItem[] }>(
    `${base(studentId)}/memory`,
    { query: { statuses: statuses?.join(",") } },
  );
  return result.items;
}

export function editStudentMemory(
  studentId: string,
  itemId: string,
  edit: AiMemoryEdit & { expectedUpdatedAt?: string },
): Promise<AiMemoryItem> {
  const { expectedUpdatedAt, ...values } = edit;
  return nestRequest(`${base(studentId)}/memory/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: {
      ...values,
      ...(expectedUpdatedAt ? { expected_updated_at: expectedUpdatedAt } : {}),
    },
  });
}

export function closeStudentMemory(
  studentId: string,
  itemId: string,
  status: "done" | "contradicted",
  expectedUpdatedAt?: string,
): Promise<AiMemoryItem> {
  return nestRequest(
    `${base(studentId)}/memory/${encodeURIComponent(itemId)}/close`,
    {
      method: "POST",
      body: {
        status,
        ...(expectedUpdatedAt ? { expected_updated_at: expectedUpdatedAt } : {}),
      },
    },
  );
}

/** Accept a recommended action: the backend makes the task. */
export function acceptNbaCard(
  studentId: string,
  cardId: string,
  due?: string,
): Promise<{ card_id: string; status: string; task_id: string }> {
  return nestRequest(`/cards//accept`, {
    method: "POST",
    body: due ? { due } : {},
  });
}

export function rejectNbaCard(
  studentId: string,
  cardId: string,
  reason?: string,
): Promise<{ card_id: string; status: string }> {
  return nestRequest(`/cards//reject`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
}
