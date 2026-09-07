import LeadLogList from "./lead-log-list";
import type { LeadLogEntry } from "./types";

export default function LeadNotesTab({ entries }: { entries: LeadLogEntry[] }) {
  return (
    <LeadLogList
      entries={entries.filter((entry) => entry.type === "note")}
      groupIdPrefix="lead-notes"
      searchLabel="Tìm ghi chú"
      searchPlaceholder="Tìm ghi chú..."
      emptyMessage="Chưa có ghi chú nào phù hợp."
    />
  );
}
