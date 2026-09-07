import type { StudentTaskItem } from "@/services/api/students/types";

import StudentInlineEditableRichText from "../student-inline-editable-rich-text";

interface TaskCardContextProps {
  notes?: string;
  onCommit: (updates: Partial<StudentTaskItem>) => void;
}

export default function TaskCardContext({
  notes,
  onCommit,
}: TaskCardContextProps) {
  return (
    <section
      className="border-t border-border-primary pt-5"
      aria-label="Ghi chú"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-primary">Ghi chú</h3>
        <span className="text-xs text-text-tertiary">Thông tin liên quan</span>
      </div>
      <StudentInlineEditableRichText
        value={notes ?? ""}
        onCommit={(nextNotes) => onCommit({ notes: nextNotes })}
        placeholder="Thêm ghi chú cho task..."
      />
    </section>
  );
}
