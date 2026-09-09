import { describe, expect, it } from "vitest";
import { assignmentReasonLabel } from "./batch-assignment-mappings";
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
});
