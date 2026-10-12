import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { StudentListItem } from "@/services/api/students/types";

import TaskCreateDialog, {
  resolveSelectedTaskStudent,
} from "./task-create-dialog";

vi.mock("./task-create-dialog-shell", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("./task-create-form", () => ({
  default: ({
    studentField,
    externalValid,
  }: {
    studentField: ReactNode;
    externalValid: boolean;
  }) => <div data-valid={externalValid}>{studentField}</div>,
}));
vi.mock("./task-student-select", () => ({
  default: ({ value }: { value: string }) => (
    <span>{value || "blank-selection"}</span>
  ),
}));

const students = [
  {
    id: "student-1",
    initials: "NA",
    name: "Nguyễn An",
    code: "HS-2026-001",
    school: "THPT Demo",
    province: "Hồ Chí Minh",
    major: "Công nghệ thông tin",
    stage: "Quan tâm",
    score: 75,
    scoreDelta: 0,
    lastActivity: "2026-10-10",
    nextAction: "",
    owner: "owner-1",
    revision: 1,
    source: "Website",
    priority: "Cao",
  },
] as StudentListItem[];

describe("generic task student resolution", () => {
  it("renders a blank student choice even when student options are already loaded", () => {
    const html = renderToStaticMarkup(
      <TaskCreateDialog
        isOpen
        onOpenChange={() => undefined}
        students={students}
        admissionYearOptions={[
          { id: "2026", label: "2026", value: 2026 },
        ]}
        selectedAdmissionYear={null}
        onAdmissionYearChange={() => undefined}
        isStudentOptionsReady={false}
        onCreate={() => undefined}
        assignees={[]}
      />,
    );

    expect(html).toContain("blank-selection");
    expect(html).not.toContain("student-1");
    expect(html).toContain('data-valid="false"');
    expect(html).toContain("Chọn năm tuyển sinh");
    expect(html).toContain("Năm tuyển sinh *");
  });

  it("does not choose the first student when selection is blank", () => {
    expect(resolveSelectedTaskStudent(students, "", 2026, 2026)).toBeUndefined();
  });

  it("does not replace a selected student after it disappears from choices", () => {
    expect(resolveSelectedTaskStudent(students, "student-removed", 2026, 2026)).toBeUndefined();
  });

  it("returns only the student whose id was selected", () => {
    expect(resolveSelectedTaskStudent(students, "student-1", 2026, 2026)).toBe(students[0]);
  });

  it("invalidates a selected student when the admission year changes", () => {
    expect(resolveSelectedTaskStudent(students, "student-1", 2025, 2026)).toBeUndefined();
  });
});
