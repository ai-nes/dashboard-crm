export interface AssistantThread { id: string; title: string | null; updated_at: string }
export interface ApprovalDiff { field: string; label?: string; before: unknown; after: unknown }
export interface AssistantPart {
  type: string;
  text?: string;
  toolCallId?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  state?: string;
  approval?: { id: string; approved?: boolean; reason?: string };
  summary?: string;
  diff?: ApprovalDiff[];
}
export interface AssistantMessage { id: string; role: "user" | "assistant" | "system"; parts: AssistantPart[] }
export interface AssistantChunk {
  type: string; delta?: string; errorText?: string; toolCallId?: string; toolName?: string; input?: unknown; output?: unknown;
  data?: { tool_call_id?: string; tool_name?: string; summary?: string; diff?: ApprovalDiff[]; text?: string };
}
