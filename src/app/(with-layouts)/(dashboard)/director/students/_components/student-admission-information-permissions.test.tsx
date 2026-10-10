import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { computeStudent360 } from "@/services/api/students";
import StudentAdmissionInformationMockup from "./student-admission-information-mockup";

describe("admission information editing permissions", () => {
  it.each([true, false])("shows edit only when allowed: %s", (allowed) => {
    const data = computeStudent360("nguyen-minh-an");
    if (!data) throw new Error("Missing student fixture");
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <StudentAdmissionInformationMockup data={data} canEdit={allowed} />
      </QueryClientProvider>,
    );
    expect(html.includes('aria-label="Chỉnh sửa thông tin"')).toBe(allowed);
  });
});
