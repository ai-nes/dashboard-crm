import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TaskStudentSelect from "./task-student-select";

const student = {
  id: "student-uuid",
  initials: "NA",
  name: "Nguyễn An",
  code: "HS-2026-001",
  school: "THPT Demo",
  province: "Hồ Chí Minh",
  major: "Công nghệ thông tin",
  stage: "Quan tâm" as const,
  score: 75,
  scoreDelta: 0,
  lastActivity: "2026-10-10",
  nextAction: "",
  owner: "",
  revision: 1,
  source: "Website",
  priority: "Cao" as const,
};

describe("task student selection", () => {
  it("shows the student business code with the selected name", () => {
    const html = renderToStaticMarkup(
      <TaskStudentSelect
        students={[student]}
        value={student.id}
        onChange={() => undefined}
      />,
    );

    expect(html).toContain("Nguyễn An · HS-2026-001");
  });

  it("labels a student whose business code is absent without showing its id", () => {
    const html = renderToStaticMarkup(
      <TaskStudentSelect
        students={[{ ...student, code: "" }]}
        value={student.id}
        onChange={() => undefined}
      />,
    );

    expect(html).toContain("Nguyễn An · Chưa có mã học sinh");
    expect(html).not.toContain(student.id);
  });
});
