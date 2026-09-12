import { describe, expect, it } from "vitest";
import {
  assignmentActionCategory,
  assignmentReasonLabel,
  extractUnconfiguredStaffEntries,
} from "./batch-assignment-mappings";
import type { LeadAssignmentBatchItem } from "@/services/api/lead-sale";

describe("assignmentReasonLabel", () => {
  it("translates backend routing codes before rendering them", () => {
    const item = {
      errorCode: "TEAM_NOT_FOUND_FOR_PROVINCE",
      reason: "TEAM_NOT_FOUND_FOR_PROVINCE",
      province: "Hồ Chí Minh",
      branch: "HCM",
    } as LeadAssignmentBatchItem;

    const label = assignmentReasonLabel(item);

    expect(label).toContain(
      "Chưa có Team nào được cấu hình phụ trách tỉnh Hồ Chí Minh.",
    );
    expect(label).not.toContain("TEAM_NOT_FOUND_FOR_PROVINCE");
  });

  it("never exposes an unknown backend code", () => {
    const item = {
      errorCode: "A_NEW_INTERNAL_ROUTING_CODE",
      reason: "A_NEW_INTERNAL_ROUTING_CODE",
      province: "Hồ Chí Minh",
      branch: "HCM",
    } as LeadAssignmentBatchItem;

    const label = assignmentReasonLabel(item);

    expect(label).toBe(
      "Hồ sơ chưa thể xử lý. Vui lòng kiểm tra dữ liệu và cấu hình phân công.",
    );
    expect(label).not.toContain("A_NEW_INTERNAL_ROUTING_CODE");
  });

  it("explains ownership failures using the missing configuration", () => {
    const item = {
      errorCode: "INVALID_CURRENT_OWNERSHIP",
      reason: "INVALID_CURRENT_OWNERSHIP",
      team: "TEAM-HCM",
      queue: null,
      branch: null,
    } as LeadAssignmentBatchItem;

    expect(assignmentReasonLabel(item)).toBe(
      "Chưa thể phân công vì chưa có hàng chờ nhận hồ sơ, cơ sở/campus. Vui lòng bổ sung cấu hình còn thiếu.",
    );
  });

  it("explains when a province has no configured team", () => {
    const item = {
      errorCode: "TEAM_NOT_FOUND_FOR_PROVINCE",
      province: "Hồ Chí Minh",
    } as LeadAssignmentBatchItem;

    expect(assignmentReasonLabel(item)).toContain(
      "Chưa có Team nào được cấu hình phụ trách tỉnh Hồ Chí Minh.",
    );
  });

  it("prefers the backend's specific reason over the generic status label", () => {
    // The backend's errorCode for a closed Lead is the bare resolution status
    // (INVALID/DUPLICATE/SPAM/FAILED), which has its own generic entry in
    // reasonLabels. The specific prose reason must still win so two Leads
    // closed for different data problems don't render the same message.
    const item = {
      errorCode: "INVALID",
      reason: "Đã đóng hồ sơ vì: Thiếu số điện thoại.",
      province: "Hồ Chí Minh",
      branch: "HCM",
    } as LeadAssignmentBatchItem;

    expect(assignmentReasonLabel(item)).toBe(
      "Đã đóng hồ sơ vì: Thiếu số điện thoại.",
    );
  });

  it("falls back to the generic status label when no specific reason is given", () => {
    const item = {
      errorCode: "INVALID",
      reason: "",
      province: "Hồ Chí Minh",
      branch: "HCM",
    } as LeadAssignmentBatchItem;

    expect(assignmentReasonLabel(item)).toBe(
      "Hồ sơ không hợp lệ nên đã đóng, không tiếp tục phân công.",
    );
  });

  it("tells a non-technical operator to raise capacity when every recipient is over their limit", () => {
    // team_routing.py raises this exact prose when candidates exist but are
    // all at/over their configured max_active_students.
    const item = {
      errorCode: "NO_ELIGIBLE_RECIPIENT",
      reason: "Team có Sale/CTV nhưng tất cả đã đạt giới hạn nhận Lead.",
      team: "Đội Bắc",
    } as LeadAssignmentBatchItem;

    const label = assignmentReasonLabel(item);

    expect(label).toContain("đã đạt giới hạn nhận Lead");
    expect(label).toContain("Quản lý người dùng");
    expect(label).toContain("tăng capacity");
  });

  it("tells a non-technical operator to set up capacity when a Sale/CTV has none configured", () => {
    // team_routing.py raises a distinct code, STAFF_CAPACITY_NOT_CONFIGURED,
    // when a Sale/CTV Sale has never had a capacity period set — distinct
    // from NO_ELIGIBLE_RECIPIENT ("full" or "no active staff") both in cause
    // (the person exists and is active, just never configured) and in
    // handling (this one must not silently fall back to the Trưởng nhóm).
    const item = {
      errorCode: "STAFF_CAPACITY_NOT_CONFIGURED",
      reason:
        "Team có Sale/CTV nhưng chưa ai được thiết lập capacity (số Lead tối đa nhận cùng lúc): Nguyễn Minh Khôi (Đội Bắc).",
      team: "Đội Bắc",
    } as LeadAssignmentBatchItem;

    const label = assignmentReasonLabel(item);

    expect(label).toContain("chưa ai được thiết lập capacity");
    expect(label).toContain("Quản lý người dùng");
    expect(label).toContain("thiết lập capacity");
    expect(label).not.toContain("tăng capacity");
  });

  it("tells a non-technical operator to staff the team when no team is ready at all", () => {
    // team_routing.py raises this prose when no team passed the readiness
    // gate (e.g. no active Sale/CTV or team lead), a different cause than
    // capacity — the old fixed sentence claimed "no active staff" for both.
    const item = {
      errorCode: "NO_ELIGIBLE_RECIPIENT",
      reason: "Không có Team đủ điều kiện: Đội Bắc: Team chưa có Sale hoặc CTV Sale đang hoạt động.",
      team: "Đội Bắc",
    } as LeadAssignmentBatchItem;

    const label = assignmentReasonLabel(item);

    expect(label).toContain("Team chưa có Sale hoặc CTV Sale đang hoạt động");
    expect(label).toContain("Quản lý Team");
    expect(label).not.toContain("Quản lý người dùng");
  });
});

describe("assignmentActionCategory", () => {
  // The "process" drawer must not show a Lead-data edit form (or hide the
  // right admin-page link) for a cause that form can never fix — this is the
  // exact bug reported live: opening a STAFF_CAPACITY_NOT_CONFIGURED item
  // showed only irrelevant phone/school/major fields, nothing pointing at
  // Quản lý người dùng, the one place that actually resolves it.
  it("routes a missing-capacity-setup failure to Quản lý người dùng", () => {
    const item = {
      errorCode: "STAFF_CAPACITY_NOT_CONFIGURED",
      reason: "Team có Sale/CTV nhưng chưa ai được thiết lập capacity: Nguyễn Minh Khôi.",
    } as LeadAssignmentBatchItem;

    expect(assignmentActionCategory(item)).toBe("staff-capacity");
  });

  it("routes a capacity-full NO_ELIGIBLE_RECIPIENT failure to Quản lý người dùng", () => {
    const item = {
      errorCode: "NO_ELIGIBLE_RECIPIENT",
      reason: "Team có Sale/CTV nhưng tất cả đã đạt giới hạn nhận Lead.",
    } as LeadAssignmentBatchItem;

    expect(assignmentActionCategory(item)).toBe("staff-capacity");
  });

  it("routes a no-active-staff NO_ELIGIBLE_RECIPIENT failure to Quản lý Team", () => {
    const item = {
      errorCode: "NO_ELIGIBLE_RECIPIENT",
      reason: "Không có Team đủ điều kiện: Đội Bắc: Team chưa có Sale hoặc CTV Sale đang hoạt động.",
    } as LeadAssignmentBatchItem;

    expect(assignmentActionCategory(item)).toBe("team-config");
  });

  it("routes TEAM_NOT_FOUND_FOR_PROVINCE to Quản lý Team", () => {
    const item = {
      errorCode: "TEAM_NOT_FOUND_FOR_PROVINCE",
      province: "Hồ Chí Minh",
    } as LeadAssignmentBatchItem;

    expect(assignmentActionCategory(item)).toBe("team-config");
  });

  it("keeps the Lead-data edit form for missing province/campus", () => {
    expect(
      assignmentActionCategory({ errorCode: "MISSING_PROVINCE" } as LeadAssignmentBatchItem),
    ).toBe("lead-data");
    expect(
      assignmentActionCategory({ errorCode: "MISSING_CAMPUS" } as LeadAssignmentBatchItem),
    ).toBe("lead-data");
  });

  it("treats a stale/transient routing code as system-level, not a data or admin fix", () => {
    expect(
      assignmentActionCategory({ errorCode: "LEASE_LOST" } as LeadAssignmentBatchItem),
    ).toBe("system");
  });

  it("falls back to unknown (keeps the edit form as a safety net) for an unrecognized code", () => {
    expect(
      assignmentActionCategory({ errorCode: "SOME_FUTURE_CODE" } as LeadAssignmentBatchItem),
    ).toBe("unknown");
  });
});

describe("extractUnconfiguredStaffEntries", () => {
  // The drawer lists each unconfigured Sale/CTV one per line (name, team,
  // what to set up) instead of one dense sentence — this locks the parsing
  // of team_routing.py's two exact message shapes to those per-person rows.
  it("parses the pure not-configured message (colon-introduced list)", () => {
    const reason =
      "Team có Sale/CTV nhưng chưa ai được thiết lập capacity (số Lead tối đa nhận cùng lúc): " +
      "Đặng Ngọc Hà (Đội Tư vấn Biên Hòa - Đồng Nai), " +
      "Trần Anh Khoa (Đội Tư vấn Long Thành - Đồng Nai), " +
      "Võ Thành Đạt (Đội Tư vấn Trảng Bom - Đồng Nai).";

    expect(extractUnconfiguredStaffEntries(reason)).toEqual([
      { name: "Đặng Ngọc Hà", team: "Đội Tư vấn Biên Hòa - Đồng Nai" },
      { name: "Trần Anh Khoa", team: "Đội Tư vấn Long Thành - Đồng Nai" },
      { name: "Võ Thành Đạt", team: "Đội Tư vấn Trảng Bom - Đồng Nai" },
    ]);
  });

  it("parses the mixed over-capacity + not-configured message (paren-wrapped list)", () => {
    const reason =
      "Team có Sale/CTV nhưng không ai đủ điều kiện nhận Lead: 1 người đã đạt giới hạn, " +
      "2 người chưa thiết lập capacity (Đặng Ngọc Hà (Đội Tư vấn Biên Hòa - Đồng Nai), " +
      "Trần Anh Khoa (Đội Tư vấn Long Thành - Đồng Nai)).";

    expect(extractUnconfiguredStaffEntries(reason)).toEqual([
      { name: "Đặng Ngọc Hà", team: "Đội Tư vấn Biên Hòa - Đồng Nai" },
      { name: "Trần Anh Khoa", team: "Đội Tư vấn Long Thành - Đồng Nai" },
    ]);
  });

  it("returns nothing for a message that never names anyone", () => {
    expect(
      extractUnconfiguredStaffEntries("Team có Sale/CTV nhưng tất cả đã đạt giới hạn nhận Lead."),
    ).toEqual([]);
  });

  it("returns nothing for null/undefined/empty input", () => {
    expect(extractUnconfiguredStaffEntries(null)).toEqual([]);
    expect(extractUnconfiguredStaffEntries(undefined)).toEqual([]);
    expect(extractUnconfiguredStaffEntries("")).toEqual([]);
  });
});
