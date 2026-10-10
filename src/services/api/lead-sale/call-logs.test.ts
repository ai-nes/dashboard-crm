import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getLeadCallLogs } from "./call-logs";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://localhost:3001");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("lead call logs API", () => {
  it("maps the Nest call history to dashboard fields", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            leadId: "LEAD-1",
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
                recordingUrl: "/api/v1/calls/CALL-1/recording",
              },
            ],
            total: 1,
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getLeadCallLogs(" LEAD-1 ")).resolves.toMatchObject({
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
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "http://localhost:3001/api/v1/leads/LEAD-1/calls",
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
  });

  it("does not call the API for an empty Lead id", async () => {
    await expect(getLeadCallLogs("  ")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not turn an unknown Lead 404 into an empty history", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: "Không tìm thấy Lead." } }),
        { status: 404 },
      ),
    );

    await expect(getLeadCallLogs("LEAD-MISSING")).rejects.toThrow(
      "Không tìm thấy Lead.",
    );
  });
});
