import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Student360Data } from "@/services/api/students/types";
import StudentNextBestActions from "./student-next-best-actions";

const mocks = vi.hoisted(() => ({ canCreate: true, cardCount: 1 }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: {}, isLoading: false }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  getCrmPermissions: () => ({ student: {} }),
  getCrmDoctypePermissions: () => ({
    canRead: true,
    canCreate: mocks.canCreate,
    canUpdate: true,
  }),
  canAccessStudent: () => true,
  hasCrmCapability: () => true,
}));
vi.mock("@/hooks/use-student-nba-queries", () => ({
  useStudentNbaWorklistQuery: () => ({
    data: {
      items: Array.from({ length: mocks.cardCount }, (_, index) => ({
        id: `card-${index}`,
        action: { title: "Kiểm tra hồ sơ nhập học" },
      })),
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useDecideNbaRecommendation: () => ({ isPending: false }),
  useRunStudentNbaEvaluation: () => ({ isPending: false }),
}));
vi.mock("./student-nba-recommendation-card", () => ({
  default: ({
    recommendation,
  }: {
    recommendation: { action: { title: string } };
  }) => <div>{recommendation.action.title}</div>,
}));
vi.mock("./student-nba-decision-dialog", () => ({ default: () => null }));

const render = (
  studentStage: string | undefined,
  extra: { showRunButton?: boolean; analysisDisposition?: "NO_ACTION" } = {},
) =>
  renderToStaticMarkup(
    <StudentNextBestActions
      {...extra}
      studentId="STUDENT-1"
      data={{ student: { studentStage } } as Student360Data}
    />,
  );

describe("NBA stage eligibility", () => {
  beforeEach(() => {
    mocks.canCreate = true;
    mocks.cardCount = 1;
  });
  it("allows enrolled students to generate NBA and keeps their pending cards", () => {
    const html = render("New Enter");
    expect(html).toContain("Gợi ý &amp; tải lại NBA");
    expect(html).toContain("Kiểm tra hồ sơ nhập học");
    expect(html).not.toContain("terminal");
  });
  it("hides the separate NBA button in the shared analysis overview", () => {
    const html = render("New Enter", { showRunButton: false });
    expect(html).not.toContain("Gợi ý &amp; tải lại NBA");
    expect(html).toContain("Kiểm tra hồ sơ nhập học");
  });
  it("shows at most three pending NBA cards", () => {
    mocks.cardCount = 4;
    expect(
      render("New Enter").split("Kiểm tra hồ sơ nhập học").length - 1,
    ).toBe(3);
  });
  it("still blocks generation for disqualified students", () => {
    const html = render("Disqualified");
    expect(html).not.toContain("Gợi ý &amp; tải lại NBA");
    expect(html).not.toContain("Kiểm tra hồ sơ nhập học");
  });
  it("does not grant generation without create permission", () => {
    mocks.canCreate = false;
    const html = render("New Enter");
    expect(html).not.toContain("Gợi ý &amp; tải lại NBA");
    expect(html).toContain("Kiểm tra hồ sơ nhập học");
  });
  it("keeps unknown stages blocked", () => {
    expect(render(undefined)).not.toContain("Gợi ý &amp; tải lại NBA");
  });
});
