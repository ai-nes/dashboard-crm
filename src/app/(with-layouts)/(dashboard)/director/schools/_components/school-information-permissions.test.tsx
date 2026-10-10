import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";
import SchoolInformationTab from "./school-information-tab";

const grants = vi.hoisted(() => ({ read: true, write: false }));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({
    user: {
      crm_doctype_permissions: {
        "CRM High School": { read: grants.read, write: grants.write },
      },
    },
  }),
}));
const data = {
  school: {
    id: "school-1",
    name: "Trường THPT A",
    schoolCode: "001",
    area: "1",
    province: "Hà Nội",
    district: "A",
    address: "Địa chỉ",
    isBoardingSchool: false,
  },
  classification: { group: "Trọng điểm" },
} as SchoolIntelligenceData;
function render() {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <SchoolInformationTab data={data} onUpdated={() => undefined} />
    </QueryClientProvider>,
  );
}
describe("school information effective permissions", () => {
  it("keeps readable school fields but hides edit actions without write", () => {
    grants.read = true;
    grants.write = false;
    const html = render();
    expect(html).toContain("Trường THPT A");
    expect(html).not.toContain("Chỉnh sửa thông tin nhận diện trường");
    expect(html).not.toContain("Chỉnh sửa vị trí và liên hệ trường");
    grants.write = true;
    expect(render()).toContain("Chỉnh sửa thông tin nhận diện trường");
  });
  it("hides fields when read is revoked even if write remains true", () => {
    grants.read = false;
    grants.write = true;
    expect(render()).toBe("");
  });
});
