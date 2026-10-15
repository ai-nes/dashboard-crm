"use client";
import { useInteractionDetailQuery } from "@/hooks/use-interaction-intelligence-queries";
import type { InteractionIntent } from "@/services/api/interaction-intelligence";

export function StudentInteractionIntents({
  intents,
}: {
  intents: InteractionIntent[];
}) {
  if (!intents.length) return null;
  return (
    <section
      className="mt-4 space-y-2 border-t border-card-border pt-3"
      aria-label="Ý định đã ghi nhận"
    >
      <h4 className="text-sm font-semibold text-text-primary">
        Ý định đã ghi nhận
      </h4>
      <ul className="space-y-2 text-sm leading-6 text-text-secondary">
        {intents.map((intent, index) => (
          <li key={intent.id ?? index}>
            {intent.notes || intent.display_name || intent.semantic_key}
          </li>
        ))}
      </ul>
    </section>
  );
}
export default function StudentRecordedInteractionIntents({
  interactionId,
}: {
  interactionId: string;
}) {
  const query = useInteractionDetailQuery(interactionId);
  if (query.isPending)
    return <p className="mt-3 text-xs text-text-secondary">Đang tải ý định…</p>;
  if (query.isError)
    return (
      <p className="mt-3 text-xs text-text-secondary" role="alert">
        Không thể tải ý định của tương tác.
      </p>
    );
  return <StudentInteractionIntents intents={query.data?.intents ?? []} />;
}
