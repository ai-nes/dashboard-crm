import { afterEach, describe, expect, it, vi } from "vitest";

import { getStudentInteractions } from "@/services/api/students";

import { getLeadCallLogs } from "./call-logs";

vi.mock("@/services/api/students", () => ({
  getStudentInteractions: vi.fn(),
}));

const getStudentInteractionsMock = vi.mocked(getStudentInteractions);

afterEach(() => {
  getStudentInteractionsMock.mockReset();
});

describe("lead call logs API", () => {
  it("maps the Lead-aware Frappe interaction response to dashboard fields", async () => {
    getStudentInteractionsMock.mockResolvedValue({
      student_id: "LEAD-1",
      zalo_messages: [],
      calls: [
        {
          id: "CALL-1",
          time: "07/09/2026 · 09:00",
          direction: "outbound",
          outcome: "connected",
          callerName: "Tư vấn viên",
          receiverName: "Nguyễn An",
          phoneNumber: "0900000000",
          durationSeconds: 120,
          summary: "Quan tâm học phí",
          transcript: "TƯ VẤN VIÊN: Em quan tâm học phí.",
          recordingUrl: "/api/method/crm.integrations.api.get_recording_url?call_log_name=CALL-1",
        },
      ],
      total_interactions: 1,
    });

    await expect(getLeadCallLogs(" LEAD-1 ")).resolves.toMatchObject({
      leadId: "LEAD-1",
      total: 1,
      calls: [{ id: "CALL-1", transcript: "TƯ VẤN VIÊN: Em quan tâm học phí." }],
    });
    expect(getStudentInteractionsMock).toHaveBeenCalledWith("LEAD-1");
  });

  it("does not call Frappe for an empty Lead id", async () => {
    await expect(getLeadCallLogs("  ")).resolves.toBeNull();
    expect(getStudentInteractionsMock).not.toHaveBeenCalled();
  });
});
