import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StudentExportAction } from "./student-export-action";
import StudentList from "./student-list";

describe("Student list export entry", () => {
  it("opens directly without requiring row selection and is hidden without export grant", () => {
    const allowed = renderToStaticMarkup(
      <StudentExportAction canExport onOpen={vi.fn()} />,
    );
    expect(allowed).toContain("Xuất Excel");
    expect(allowed).not.toMatch(/\sdisabled(?:=|\s|>)/);
    expect(
      renderToStaticMarkup(
        <StudentExportAction canExport={false} onOpen={vi.fn()} />,
      ),
    ).toBe("");
  });
  it("no longer renders student-row selection checkboxes", () => {
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <StudentList
          students={[
            {
              id: "student-1",
              code: "HS-1",
              name: "Test",
              score: 80,
              studentStage: "New",
              recordType: "student",
              studentId: "student-1",
              owner: "",
            } as Parameters<typeof StudentList>[0]["students"][number],
          ]}
        />
      </QueryClientProvider>,
    );
    expect(html).not.toContain("checkbox");
    expect(html).toContain("HS-1");
  });
});
