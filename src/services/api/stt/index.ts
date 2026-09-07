const CALL_UUID_PATTERN = /^\d+\.\d+$/;
const TERMINAL_STATUSES = new Set(["COMPLETED", "COMPLETED_LOCAL_ONLY", "FAILED"]);
const TERMINAL_SUMMARY_STATUSES = new Set(["COMPLETED", "FAILED"]);

export interface SttJobStatus {
  status?: string;
  updated_at?: string;
  completed_at?: string;
  error_type?: string;
  summary_status?: string;
  summary_error_type?: string;
}

export class SttApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "SttApiError";
  }
}

export function isSttCallUuid(value: string): boolean {
  return CALL_UUID_PATTERN.test(value.trim());
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function responseMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const data = payload as Record<string, unknown>;
    if (typeof data.error === "string") return data.error;
    if (typeof data.detail === "string") return data.detail;
  }
  return fallback;
}

async function sttRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/stt/${path}`, {
    ...init,
    headers: { Accept: "application/json, text/plain", ...init?.headers },
    cache: "no-store",
  });
  const payload = await readResponse(response);
  if (!response.ok) {
    throw new SttApiError(
      response.status,
      responseMessage(payload, `STT Bridge trả về HTTP ${response.status}.`),
    );
  }
  return payload as T;
}

export async function triggerSttTranscription(callUuid: string): Promise<void> {
  const normalized = callUuid.trim();
  if (!isSttCallUuid(normalized)) throw new SttApiError(400, "Call UUID không hợp lệ.");
  await sttRequest<string>(`transcribe/${encodeURIComponent(normalized)}`, { method: "POST" });
}

export async function triggerSttSummary(callUuid: string): Promise<void> {
  const normalized = callUuid.trim();
  if (!isSttCallUuid(normalized)) throw new SttApiError(400, "Call UUID không hợp lệ.");
  await sttRequest<string>(`summarize/${encodeURIComponent(normalized)}`, { method: "POST" });
}

export async function getSttJobStatus(callUuid: string): Promise<SttJobStatus | null> {
  const normalized = callUuid.trim();
  if (!isSttCallUuid(normalized)) return null;
  try {
    const payload = await sttRequest<unknown>(`status/${encodeURIComponent(normalized)}`);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new SttApiError(502, "Phản hồi trạng thái STT không hợp lệ.");
    }
    return payload as SttJobStatus;
  } catch (error) {
    if (error instanceof SttApiError && error.status === 404) return null;
    throw error;
  }
}

export function isSttTerminalStatus(status?: string): boolean {
  return Boolean(status && TERMINAL_STATUSES.has(status));
}

export function isSttSummaryTerminalStatus(status?: string): boolean {
  return Boolean(status && TERMINAL_SUMMARY_STATUSES.has(status));
}
