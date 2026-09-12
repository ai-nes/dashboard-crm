import { afterEach, describe, expect, it, vi } from "vitest";

import { getLeadCallLogs } from "./call-logs";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("lead call logs API", () => {
  it("maps the Lead-aware Frappe interaction response to dashboard fields", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            lead_id: "LEAD-1",
            calls: [
              {
                id: "CALL-1",
                interactionId: "INT-CALL-1",
                evidenceId: "EVIDENCE-1",
                time: "07/09/2026 · 09:00",
                direction: "outbound",
                outcome: "connected",
                callerName: "Tư vấn viên",
                receiverName: "Nguyễn An",
                phoneNumber: "0900000000",
                durationSeconds: 120,
                summary: "Quan tâm học phí",
                transcript: "TƯ VẤN VIÊN: Em quan tâm học phí.",
                recordingUrl:
                  "/api/method/crm.integrations.api.get_recording_url?call_log_name=CALL-1",
              },
            ],
            total: 1,
          },
        }),
        { status: 200 },
      ),
    );

    await expect(
      getLeadCallLogs(" LEAD-1 ", { baseUrl: "http://frappe:8000" }),
    ).resolves.toMatchObject({
      leadId: "LEAD-1",
      total: 1,
      calls: [
        {
          id: "CALL-1",
          interactionId: "INT-CALL-1",
          evidenceId: "EVIDENCE-1",
          transcript: "TƯ VẤN VIÊN: Em quan tâm học phí.",
        },
      ],
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.director_students.get_lead_call_logs?lead_id=LEAD-1",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
  });

  it("does not call Frappe for an empty Lead id", async () => {
    await expect(
      getLeadCallLogs("  ", { baseUrl: "http://frappe:8000" }),
    ).resolves.toBeNull();
  });

  it("does not turn an unknown Lead 404 into an empty history", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: "Không tìm thấy Lead." } }),
        { status: 404 },
      ),
    );

    await expect(
      getLeadCallLogs("LEAD-MISSING", { baseUrl: "http://frappe:8000" }),
    ).rejects.toThrow("Không tìm thấy Lead.");
  });
});
