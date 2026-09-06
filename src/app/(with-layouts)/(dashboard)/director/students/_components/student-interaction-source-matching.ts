import type { InteractionSummary } from "@/services/api/interaction-intelligence";
import type { StudentZaloMessage } from "@/services/api/students/types";

export type ZaloMessageIndex = ReadonlyMap<string, StudentZaloMessage>;

export function createZaloMessageIndex(
  messages: StudentZaloMessage[],
): ZaloMessageIndex {
  return new Map(messages.map((message) => [message.id, message]));
}

export function findZaloMessageForInteraction(
  interaction: InteractionSummary,
  messagesById: ZaloMessageIndex,
): StudentZaloMessage | null {
  const candidateIds = [interaction.source_id, interaction.id]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return candidateIds.map((id) => messagesById.get(id)).find(Boolean) ?? null;
}
