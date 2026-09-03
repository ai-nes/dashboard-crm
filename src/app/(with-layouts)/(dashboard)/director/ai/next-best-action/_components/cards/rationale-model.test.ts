import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "../types";
import { buildRationaleRows } from "./rationale-model";
import { scrubCopy } from "./sanitize";

const base: RecommendedAction = {
  id: "REC-1",
  studentName: "Nguyễn Văn A",
  initials: "NA",
  school: "THPT X",
  interest: "CNTT",
  recommendation: "Gửi yêu cầu bổ sung hồ sơ",
  summary: "Hồ sơ thiếu CCCD.",
  dueLabel: "Hôm nay",
  status: "today",
  priority: "high",
  impact: "Đưa hồ sơ sang bước tiếp theo",
  confidence: 70,
  suggestedAssignee: "Trần B",
  evidence: [],
  talkingPoints: [],
  recentActivity: [],
};

describe("buildRationaleRows", () => {
  it("emits why → approach → outcome in reading order when data is present", () => {
    const rows = buildRationaleRows({
      ...base,
      whyNow: "Deadline còn 2 ngày",
      approach: "Nhắn tin kèm checklist",
      expectedOutcome: "Nhận đủ giấy tờ",
    });
    expect(rows.map((row) => row.id)).toEqual(["whyNow", "approach", "outcome"]);
  });

  it("drops every row whose source value is missing", () => {
    // No whyNow/approach/expectedOutcome on the base action: the block is empty
    // rather than echoing the recommendation summary (which is the card title).
    expect(buildRationaleRows(base)).toEqual([]);
  });

  it("does not fall back to the summary for 'why now'", () => {
    const rows = buildRationaleRows({ ...base, summary: "Hồ sơ thiếu CCCD." });
    expect(rows.find((row) => row.id === "whyNow")).toBeUndefined();
  });

  it("scrubs internal system nouns from rendered copy", () => {
    const rows = buildRationaleRows({
      ...base,
      whyNow: "Liên hệ học viên do Frappe xác định và cần theo dõi",
    });
    const value = rows.find((row) => row.id === "whyNow")?.value ?? "";
    expect(value).not.toMatch(/Frappe/i);
  });
});

describe("scrubCopy", () => {
  it("replaces or removes internal identifiers", () => {
    expect(scrubCopy("Bộ phận phù hợp do Frappe định tuyến")).toBe(
      "Bộ phận phù hợp",
    );
    expect(scrubCopy("Ghi vào CRM Action")).toBe("Ghi vào hành động");
  });
});
