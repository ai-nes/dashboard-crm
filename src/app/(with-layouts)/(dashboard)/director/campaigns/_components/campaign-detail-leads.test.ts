import { describe, expect, it } from "vitest";

import type { LeadListItem } from "@/services/api/lead-sale";

import { toCampaignLeadRow } from "./campaign-detail-leads";

describe("toCampaignLeadRow", () => {
  it("keeps live workflow, contact, and creation fields", () => {
    const lead: LeadListItem = {
      id: "LEAD-1",
      leadCode: "LD-1",
      studentId: "LEAD-1",
      initials: "MA",
      name: "Nguyễn Minh An",
      phone: "0900000000",
      school: "THPT Châu Văn Liêm",
      status: "Đang xử lý",
      statusCode: "PROCESSED",
      processingStatus: "PROCESSED",
      result: "MATCHED",
      source: "Website",
      owner: "Trần Quốc Bảo",
      contactNoAnswer: 2,
      contactSuccess: 3,
      createdAt: "2026-09-07T10:00:00+07:00",
    };

    expect(toCampaignLeadRow(lead)).toMatchObject({
      status: "PROCESSED",
      processingStatus: "PROCESSED",
      result: "MATCHED",
      contactNoAnswer: 2,
      contactSuccess: 3,
      createdAt: "2026-09-07T10:00:00+07:00",
    });
  });
});
