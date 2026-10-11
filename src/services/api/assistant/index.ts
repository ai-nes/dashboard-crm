import { getApiUrl, NestApiError } from "../nest/nest-client";
import { redirectToAccessDenied } from "../forbidden-redirect";
import { readAssistantStream } from "./stream";
import type { AssistantChunk, AssistantMessage, AssistantThread } from "./types";
export type * from "./types";

async function request(path: string, studentId: string, signal: AbortSignal, messages?: AssistantMessage[], threadId?: string) {
  if (!studentId.trim()) throw new Error("Hồ sơ chưa có mã học sinh để mở Chat AI.");
  const response = await fetch(`${getApiUrl()}/api/v1/assistant${path}?${new URLSearchParams({ student_id: studentId })}`, {
    method: messages ? "POST" : "GET", credentials: "include", signal,
    headers: messages ? { "Content-Type": "application/json" } : undefined,
    body: messages ? JSON.stringify({ trigger: "submit-message", id: threadId, messages }) : undefined,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { detail?: unknown; message?: unknown; error?: { message?: string } } | null;
    const detail = payload?.detail ?? payload?.message ?? payload?.error?.message;
    if (!messages && response.status === 403) redirectToAccessDenied();
    throw new NestApiError(response.status, "ASSISTANT_REQUEST_FAILED", typeof detail === "string" ? detail : `Không thể kết nối trợ lý (${response.status}).`);
  }
  return response;
}
export async function listAssistantThreads(studentId: string, signal: AbortSignal): Promise<AssistantThread[]> {
  return (await request("/threads", studentId, signal)).json();
}
export async function getAssistantHistory(studentId: string, threadId: string, signal: AbortSignal): Promise<AssistantMessage[]> {
  return (await request(`/threads/${encodeURIComponent(threadId)}`, studentId, signal)).json();
}
export async function sendAssistantMessage(studentId: string, threadId: string, messages: AssistantMessage[], signal: AbortSignal, onChunk: (chunk: AssistantChunk) => void) {
  await readAssistantStream(await request("/chat", studentId, signal, messages, threadId), onChunk, signal);
}
