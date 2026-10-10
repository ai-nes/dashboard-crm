import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import NextBestActionWorkspace from "./next-best-action-workspace";

const session = vi.hoisted(() => ({
  user: null as Record<string, unknown> | null,
  options: {} as { enabled?: boolean },
}));

vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: session.user, isLoading: false }),
}));
vi.mock("@/hooks/use-director-nba-recommendations-queries", () => ({
  useDirectorNbaRecommendationsQuery: (
    _params: unknown,
    options?: { enabled?: boolean },
  ) => {
    session.options = options ?? {};
    return {
      data: undefined,
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    };
  },
}));
vi.mock("./use-recommendation-student-names", () => ({
  useRecommendationStudentNames: () => new Map(),
}));

function userWithPermissions(
  studentRead: boolean,
  recommendationRead: boolean,
) {
  return {
    user: "director@example.test",
    email: "director@example.test",
    full_name: "Director",
    user_image: null,
    roles: ["Admissions Director"],
    crm_profile: "admissions_director",
    crm_role: "Admissions Director",
    crm_capabilities: [],
    crm_doctype_permissions: {
      "CRM Student": {
        read: studentRead,
        write: false,
        create: false,
        delete: false,
        export: false,
        row_scope: "all",
      },
      "CRM Recommendation": {
        read: recommendationRead,
        write: false,
        create: false,
        delete: false,
        export: false,
        row_scope: "all",
      },
    },
  };
}

describe("Director next-best-action permissions", () => {
  it("does not query or render recommendations without Student.read", () => {
    session.user = userWithPermissions(false, true);

    const html = renderToStaticMarkup(<NextBestActionWorkspace />);

    expect(session.options.enabled).toBe(false);
    expect(html).toContain("Bạn không có quyền xem đề xuất hành động.");
    expect(html).not.toContain("Hàng đợi sẽ cập nhật");
  });

  it("does not query recommendations without CRM Recommendation.read", () => {
    session.user = userWithPermissions(true, false);

    const html = renderToStaticMarkup(<NextBestActionWorkspace />);

    expect(session.options.enabled).toBe(false);
    expect(html).toContain("Bạn không có quyền xem đề xuất hành động.");
  });

  it("loads recommendations when both Student.read and Recommendation.read are granted", () => {
    session.user = userWithPermissions(true, true);

    const html = renderToStaticMarkup(<NextBestActionWorkspace />);

    expect(session.options.enabled).toBe(true);
    expect(html).toContain("Hàng đợi sẽ cập nhật");
  });
});
