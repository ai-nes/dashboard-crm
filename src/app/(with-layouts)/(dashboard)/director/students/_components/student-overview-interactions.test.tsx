import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import StudentOverviewInteractions from "./student-overview-interactions";

const query = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/use-interaction-intelligence-queries", () => ({
  useInteractionFeedQuery: query,
}));
beforeEach(() => {
  vi.clearAllMocks();
  query.mockReturnValue({
    data: {
      pages: [
        {
          items: [
            {
              id: "I-1",
              interaction_type: "note",
              summary: "Phụ huynh muốn hỏi học phí.",
              channel: "phone",
              direction: "inbound",
              occurred_at: "2026-10-12T03:00:00Z",
            },
          ],
        },
      ],
    },
    isPending: false,
    isError: false,
  });
});
it("does not fetch or disclose interactions without permission", () => {
  expect(
    renderToStaticMarkup(
      <StudentOverviewInteractions
        studentId="S-1"
        canReadInteractions={false}
      />,
    ),
  ).toBe("");
  expect(query).toHaveBeenCalledWith("S-1", { limit: 3 }, false);
});
it("shows actual inbound and outbound feed rather than analysis points", () => {
  const html = renderToStaticMarkup(
    <StudentOverviewInteractions studentId="S-1" canReadInteractions />,
  );
  expect(query).toHaveBeenCalledWith("S-1", { limit: 3 }, true);
  expect(html).toContain("Phụ huynh muốn hỏi học phí.");
  expect(html).toContain("2026-10-12T03:00:00Z");
});
it("keeps prior interactions visible if updating fails", () => {
  query.mockReturnValue({ ...query.getMockImplementation()!(), isError: true });
  const html = renderToStaticMarkup(
    <StudentOverviewInteractions studentId="S-1" canReadInteractions />,
  );
  expect(html).toContain("Phụ huynh muốn hỏi học phí.");
  expect(html).toContain("Chưa cập nhật được tương tác mới nhất.");
});
it.each(["loading", "empty", "error"])(
  "distinguishes %s feed state",
  (state) => {
    query.mockReturnValue({
      data: undefined,
      isPending: state === "loading",
      isError: state === "error",
    });
    const html = renderToStaticMarkup(
      <StudentOverviewInteractions studentId="S-1" canReadInteractions />,
    );
    expect(html).toContain(
      state === "loading"
        ? "Đang tải tương tác"
        : state === "error"
          ? "Chưa tải được tương tác gần đây."
          : "Chưa có tương tác được ghi nhận.",
    );
  },
);
