export type CopilotContextHandle = {
  contract_version: "copilot-context-handle-v1";
  handle: string;
  expires_in: number;
  mode: "chat" | "consultation";
};

export async function issueCopilotContextHandle(
  studentId: string,
  options: { baseUrl: string; origin?: string; mode?: "chat" | "consultation" },
): Promise<CopilotContextHandle> {
  if (!studentId.trim()) throw new Error("studentId is required");
  const response = await fetch(`${options.baseUrl.replace(/\/+$/, "")}/api/method/crm.api.copilot_context.issue_context_handle`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student: studentId.trim(), mode: options.mode ?? "chat", origin: options.origin }),
  });
  if (!response.ok) throw new Error(`Unable to issue Copilot context handle (${response.status})`);
  const body = (await response.json()) as { message?: CopilotContextHandle };
  if (!body.message?.handle) throw new Error("Copilot context handle response is invalid");
  return body.message;
}

export async function redeemCopilotContextHandle(
  handle: string,
  options: { agentBaseUrl: string; origin?: string },
): Promise<{ subject: { kind: "student"; id: string }; context_revision: string; mode: "chat" | "consultation" }> {
  const response = await fetch(`${options.agentBaseUrl.replace(/\/+$/, "")}/api/v1/chat/context/redeem`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, origin: options.origin }),
  });
  if (!response.ok) throw new Error(`Unable to redeem Copilot context handle (${response.status})`);
  const body = (await response.json()) as { data?: { subject?: { kind: "student"; id: string }; context_revision?: string; mode?: "chat" | "consultation" } };
  if (!body.data?.subject?.id || !body.data.context_revision || !body.data.mode) throw new Error("Copilot context response is invalid");
  return body.data as { subject: { kind: "student"; id: string }; context_revision: string; mode: "chat" | "consultation" };
}
