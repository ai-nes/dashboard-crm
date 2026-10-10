import type { AssistantChunk, AssistantMessage } from "@/services/api/assistant";

export function applyAssistantChunk(message: AssistantMessage, chunk: AssistantChunk): AssistantMessage {
  const parts = message.parts.map(part => ({ ...part }));
  if (chunk.type === "text-delta") {
    const last = parts.at(-1);
    if (last?.type === "text") last.text = (last.text ?? "") + (chunk.delta ?? "");
    else parts.push({ type: "text", text: chunk.delta ?? "" });
  } else if (chunk.type === "tool-input-available") {
    parts.push({ type: `tool-${chunk.toolName}`, toolCallId: chunk.toolCallId, input: chunk.input, state: "input-available" });
  } else if (chunk.type === "tool-output-available" || chunk.type === "tool-output-error") {
    const tool = parts.find(part => part.toolCallId === chunk.toolCallId);
    if (tool) { tool.output = chunk.output; tool.errorText = chunk.errorText; tool.state = chunk.type === "tool-output-error" ? "output-error" : "output-available"; }
  } else if (chunk.type === "data-approval" && chunk.data?.tool_call_id) {
    let tool = parts.find(part => part.toolCallId === chunk.data?.tool_call_id);
    if (!tool) { tool = { type: `tool-${chunk.data.tool_name}`, toolCallId: chunk.data.tool_call_id }; parts.push(tool); }
    tool.state = "approval-requested";
    tool.approval = { id: chunk.data.tool_call_id };
    tool.summary = chunk.data.summary; tool.diff = chunk.data.diff;
  } else if ((chunk.type === "data-memory" || chunk.type === "data-compaction") && chunk.data?.text) {
    parts.push({ type: "notice", text: chunk.data.text });
  }
  return { ...message, parts };
}
