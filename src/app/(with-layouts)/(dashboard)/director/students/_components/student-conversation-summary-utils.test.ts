import { describe, expect, it } from "vitest";

import type { InteractionIntelligence } from "@/services/api/interaction-intelligence/types";

import {
  buildStudentConversationSummaryModel,
  getResolutionStatusLabel,
} from "./student-conversation-summary-utils";

describe("buildStudentConversationSummaryModel", () => {
  it("keeps the structured outcome separate from a flat call summary", () => {
    const model = buildStudentConversationSummaryModel(
      {
        summary: "Tóm tắt chung lặp lại vấn đề học sinh.",
        conversation_summary: {
          problem: {
            identified: true,
            description: "Học sinh cần đăng ký học lại môn.",
            evidence_refs: [],
          },
          resolution: {
            status: "partially_resolved",
            description: "Tư vấn viên giải thích quy trình đăng ký.",
            evidence_refs: [],
          },
          result: {
            status: "follow_up_required",
            description: "Hồ sơ đang chờ nhà trường xử lý.",
            next_action: "Sale kiểm tra tình trạng hồ sơ.",
            evidence_refs: [],
          },
        },
      },
      "Tóm tắt cuộc gọi khác.",
    );

    expect(model).toEqual({
      kind: "structured",
      studentDescription: "Học sinh cần đăng ký học lại môn.",
      advisorDescription: "Tư vấn viên giải thích quy trình đăng ký.",
      resolutionStatus: "Đã xử lý một phần",
      resultDescription: "Hồ sơ đang chờ nhà trường xử lý.",
      nextAction: "Sale kiểm tra tình trạng hồ sơ.",
    });
  });

  it("labels a flat summary as generic when structured analysis is absent", () => {
    expect(
      buildStudentConversationSummaryModel(
        { summary: "Học sinh đang tìm hiểu thủ tục." },
        "Tóm tắt từ cuộc gọi.",
      ),
    ).toEqual({
      kind: "fallback",
      description: "Học sinh đang tìm hiểu thủ tục.",
    });
  });

  it("uses the generic fallback for an incomplete structured object", () => {
    const intelligence = {
      summary: "Tóm tắt chung của cuộc trò chuyện.",
      conversation_summary: {},
    } as unknown as InteractionIntelligence;

    expect(buildStudentConversationSummaryModel(intelligence)).toEqual({
      kind: "fallback",
      description: "Tóm tắt chung của cuộc trò chuyện.",
    });
  });

  it("uses the generic fallback when structured fields are blank", () => {
    const intelligence = {
      summary: "Tóm tắt chung của cuộc trò chuyện.",
      conversation_summary: {
        problem: { identified: false, description: " ", evidence_refs: [] },
        resolution: { status: "unknown", description: "", evidence_refs: [] },
        result: { status: "unknown", description: "", next_action: "", evidence_refs: [] },
      },
    } satisfies InteractionIntelligence;

    expect(buildStudentConversationSummaryModel(intelligence)).toEqual({
      kind: "fallback",
      description: "Tóm tắt chung của cuộc trò chuyện.",
    });
  });

  it("uses the call summary when no analysis summary exists", () => {
    expect(
      buildStudentConversationSummaryModel(null, "Tóm tắt từ cuộc gọi."),
    ).toEqual({ kind: "fallback", description: "Tóm tắt từ cuộc gọi." });
  });

  it("returns no summary when all sources are empty", () => {
    expect(buildStudentConversationSummaryModel({ summary: "  " }, " ")).toBeNull();
  });
});

describe("getResolutionStatusLabel", () => {
  it.each([
    ["resolved", "Đã giải quyết"],
    ["partially_resolved", "Đã xử lý một phần"],
    ["unresolved", "Chưa giải quyết"],
    ["unknown", "Chưa đủ thông tin"],
    ["unexpected", "Chưa đủ thông tin"],
    [undefined, "Chưa đủ thông tin"],
  ])("maps %s to %s", (status, expected) => {
    expect(getResolutionStatusLabel(status)).toBe(expected);
  });
});
