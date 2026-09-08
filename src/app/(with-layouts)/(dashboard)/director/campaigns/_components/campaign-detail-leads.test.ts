import { describe, expect, it } from "vitest";

import type { LeadListItem } from "@/services/api/lead-sale";

import {
  countCampaignLeadsByStatus,
  filterCampaignLeads,
  toCampaignLeadRow,
  type CampaignLeadRow,
} from "./campaign-detail-leads";

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

describe("campaign detail lead filters", () => {
  const leads: CampaignLeadRow[] = [
    {
      id: "LEAD-1",
      name: "Nguyễn Minh An",
      initials: "MA",
      phone: "0900000000",
      school: "THPT Châu Văn Liêm",
      status: "PROCESSED",
      processingStatus: "PROCESSED",
      result: "MATCHED",
      source: "Website",
      owner: "Trần Quốc Bảo",
      contactNoAnswer: 0,
      contactSuccess: 1,
      createdAt: "2026-09-07",
    },
    {
      id: "LEAD-2",
      name: "Trần Minh Khang",
      initials: "MK",
      phone: "0911111111",
      school: "THPT Lê Quý Đôn",
      status: "CLOSED",
      processingStatus: "CLOSED",
      result: "FAILED",
      source: "Facebook",
      owner: "Lê Minh Tuấn",
      contactNoAnswer: 2,
      contactSuccess: 0,
      createdAt: "2026-09-08",
    },
  ];

  it("filters by lead text and status", () => {
    expect(filterCampaignLeads(leads, "  châu văn  ", "all")).toHaveLength(1);
    expect(filterCampaignLeads(leads, "", "CLOSED").map((lead) => lead.id)).toEqual(["LEAD-2"]);
  });

  it("counts statuses from the unfiltered campaign leads", () => {
    expect(countCampaignLeadsByStatus(leads)).toEqual({
      all: 2,
      NEW: 0,
      PROCESSED: 1,
      ASSIGNED: 0,
      CLOSED: 1,
    });
  });
});
