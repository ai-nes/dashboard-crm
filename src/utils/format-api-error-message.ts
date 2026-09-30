/** Remove Frappe's exception class while preserving the complete user message. */
export function formatApiErrorMessage(message: string): string {
  return message.replace(/^\s*frappe\.exceptions\.\w+:\s*/, "");
}
