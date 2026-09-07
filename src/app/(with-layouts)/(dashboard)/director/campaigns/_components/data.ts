import type { CampaignListItem } from "./types";

export const initialCampaigns: CampaignListItem[] = [
  { id: "camp-001", code: "TS2026-SOM", name: "Tuyển sinh sớm 2026", admissionYear: 2026, startDate: "2025-11-01", endDate: "2026-01-15", status: "ACTIVE", mode: "HYBRID", channelUrl: "https://meet.google.com/ts2026-som" },
  { id: "camp-002", code: "TS2026-D1", name: "Đợt 1", admissionYear: 2026, startDate: "2026-01-01", endDate: "2026-03-31", status: "ACTIVE", mode: "OFFLINE", channelUrl: "" },
  { id: "camp-003", code: "TS2026-D2", name: "Đợt 2", admissionYear: 2026, startDate: "2026-04-01", endDate: "2026-06-30", status: "UPCOMING", mode: "ONLINE", channelUrl: "https://zoom.us/j/ts2026-d2" },
  { id: "camp-004", code: "TS2026-HE", name: "Chiến dịch hè 2026", admissionYear: 2026, startDate: "2026-05-01", endDate: "2026-08-31", status: "UPCOMING", mode: "HYBRID", channelUrl: "https://meet.google.com/ts2026-he" },
  { id: "camp-005", code: "TS2026-D3", name: "Đợt 3", admissionYear: 2026, startDate: "2026-07-01", endDate: "2026-09-30", status: "DRAFT", mode: "OFFLINE", channelUrl: "" },
  { id: "camp-006", code: "TS2026-BOSUNG", name: "Đợt bổ sung", admissionYear: 2026, startDate: "2026-09-01", endDate: "2026-10-15", status: "DRAFT", mode: "ONLINE", channelUrl: "https://zoom.us/j/ts2026-bosung" },
  { id: "camp-007", code: "TS2025-D4", name: "Đợt 4", admissionYear: 2025, startDate: "2025-10-01", endDate: "2025-12-31", status: "CLOSED", mode: "OFFLINE", channelUrl: "" },
  { id: "camp-008", code: "TS2025-D3", name: "Đợt 3", admissionYear: 2025, startDate: "2025-07-01", endDate: "2025-09-30", status: "CLOSED", mode: "HYBRID", channelUrl: "https://meet.google.com/ts2025-d3" },
  { id: "camp-009", code: "TS2025-D2", name: "Đợt 2", admissionYear: 2025, startDate: "2025-04-01", endDate: "2025-06-30", status: "CLOSED", mode: "ONLINE", channelUrl: "https://zoom.us/j/ts2025-d2" },
  { id: "camp-010", code: "TS2025-D1", name: "Đợt 1", admissionYear: 2025, startDate: "2025-01-01", endDate: "2025-03-31", status: "CLOSED", mode: "OFFLINE", channelUrl: "" },
];
