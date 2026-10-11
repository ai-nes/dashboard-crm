import type { AssistantChunk } from "./types";

/** AI SDK UI message SSE, including chunks split inside UTF-8 and CRLF boundaries. */
export async function readAssistantStream(response: Response, onChunk: (chunk: AssistantChunk) => void, signal?: AbortSignal) {
  if (!response.body) throw new Error("Máy chủ không trả về luồng phản hồi.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;
  const abort = () => { void reader.cancel().catch(() => undefined); };
  signal?.addEventListener("abort", abort, { once: true });
  const handle = (block: string) => {
    const payload = block.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n");
    if (!payload || payload === "[DONE]") { if (payload) finished = true; return; }
    let chunk: AssistantChunk;
    try { chunk = JSON.parse(payload) as AssistantChunk; } catch { throw new Error("Không đọc được dữ liệu phản hồi từ trợ lý."); }
    if (!chunk || typeof chunk.type !== "string") throw new Error("Phản hồi trợ lý không hợp lệ.");
    if (chunk.type === "error") throw new Error(chunk.errorText || "Trợ lý gặp lỗi.");
    if (chunk.type === "finish") finished = true;
    onChunk(chunk);
  };
  try {
    signal?.throwIfAborted();
    for (;;) {
      const { value, done } = await reader.read();
      signal?.throwIfAborted();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let match: RegExpExecArray | null;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
        handle(buffer.slice(0, match.index));
        buffer = buffer.slice(match.index + match[0].length);
      }
      if (done) break;
    }
    if (buffer.trim()) handle(buffer);
    if (!finished) throw new Error("Kết nối bị ngắt trước khi trợ lý trả lời xong. Hãy mở lại hội thoại để kiểm tra.");
  } finally {
    signal?.removeEventListener("abort", abort);
    try { await reader.cancel(); } finally { reader.releaseLock(); }
  }
}
