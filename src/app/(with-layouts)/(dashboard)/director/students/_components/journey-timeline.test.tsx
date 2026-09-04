import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { computeStudent360 } from "@/services/api/students";
import JourneyTimeline from "./journey-timeline";

describe("JourneyTimeline", () => {
  it("hiển thị danh sách điểm chạm khi có tiến độ tuyển sinh", () => {
    const data = computeStudent360("nguyen-minh-an");
    expect(data).not.toBeNull();
    if (!data) return;

    const html = renderToStaticMarkup(<JourneyTimeline data={data} />);
    expect(html).toContain("Tiến độ tuyển sinh");
    expect(html).toContain("Giai đoạn");
    expect(html).not.toContain("Hiện tại chưa có tiến độ tuyển sinh cho học sinh này");
  });

  it("hiển thị thông báo khi tiến độ tuyển sinh bị trống", () => {
    const data = computeStudent360("nguyen-minh-an");
    expect(data).not.toBeNull();
    if (!data) return;

    const emptyData = {
      ...data,
      journey: [],
    };

    const html = renderToStaticMarkup(<JourneyTimeline data={emptyData} />);
    expect(html).toContain("Tiến độ tuyển sinh");
    expect(html).toContain("Giai đoạn");
    expect(html).toContain("Hiện tại chưa có tiến độ tuyển sinh cho học sinh này");
  });
});

