import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import StudentList from "./student-list";

const student = {
  id: "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
  initials: "NA",
  name: "Nguyễn An",
  code: "",
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

describe("student list code display", () => {
  it("uses a readable placeholder when the student code is missing", () => {
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <StudentList students={[student]} />
      </QueryClientProvider>,
    );

    expect(html).toContain("Chưa có mã học sinh");
    expect(html).toContain(`href="/director/students/${student.id}"`);
    expect(html).not.toContain(`>${student.id}<`);
  });

  it("uses the business code for student navigation", () => {
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <StudentList students={[{ ...student, code: "HS-2026-001" }]} />
      </QueryClientProvider>,
    );

    expect(html).toContain('href="/director/students/HS-2026-001"');
    expect(
      html,
    ).not.toContain(`href="/director/students/${student.id}"`);
  });
});
