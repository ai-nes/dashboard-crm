import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  user: null as null | { crm_profile: string; crm_user_id: string },
  query: {
    data: undefined as unknown,
    isPending: false,
    isError: false,
    error: undefined as Error | undefined,
    refetch: vi.fn(),
  },
  usePoint: vi.fn(),
}));

vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: mock.user }),
}));

vi.mock("@/hooks/use-interaction-intelligence-queries", () => ({
  useInteractionNpsPointQuery: mock.usePoint,
}));

import StudentCallQualityScore from "./student-call-quality-score";

describe("call quality in interaction summary", () => {
  beforeEach(() => {
    mock.user = { crm_profile: "admissions_director", crm_user_id: "director-1" };
    mock.query = {
      data: undefined,
      isPending: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    };
    mock.usePoint.mockImplementation(() => mock.query);
  });

  it("shows a scored point beside the call summary with its 1–10 scale", () => {
    mock.query.data = {
      point: { name: "NPS-1", interaction: "INTX-1", status: "scored", total_score: 8.25 },
    };
    const html = renderToStaticMarkup(
      <StudentCallQualityScore interactionId="INTX-1" />,
    );

    expect(html).toContain("Chất lượng cuộc gọi · NPS");
    expect(html).toContain("Thang điểm 1–10");
    expect(html).toContain("Đã chấm");
    expect(html).toContain("8.3");
  });

  it("explains abstained and missing results without displaying fake scores", () => {
    mock.query.data = {
      point: { name: "NPS-2", interaction: "INTX-2", status: "abstained" },
    };
    const abstained = renderToStaticMarkup(
      <StudentCallQualityScore interactionId="INTX-2" />,
    );
    expect(abstained).toContain("Tạm dừng chấm");
    expect(abstained).toContain("Chưa đủ dữ liệu để chấm điểm an toàn");
    expect(abstained).not.toContain("0.0");

    mock.query.data = { point: null };
    const missing = renderToStaticMarkup(
      <StudentCallQualityScore interactionId="INTX-3" />,
    );
    expect(missing).toContain("Cuộc gọi chưa có điểm chất lượng");
  });

  it("hides point data and disables the request for unsupported roles", () => {
    mock.user = { crm_profile: "marketing", crm_user_id: "marketing-1" };
    const html = renderToStaticMarkup(
      <StudentCallQualityScore interactionId="INTX-4" />,
    );

    expect(html).toBe("");
    expect(mock.usePoint).toHaveBeenCalledWith("INTX-4", false, "marketing-1");
  });
});
