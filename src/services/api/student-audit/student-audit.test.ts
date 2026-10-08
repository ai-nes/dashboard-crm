import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getLeadAuditLogs,
  getSegmentAuditLogs,
  getStudentAuditLogs,
  StudentAuditApiError,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("student audit API contract", () => {
  it("reads a student history and normalizes its envelope", async () => {
    fetchMock.mockResolvedValue(
      json({
        student: "ENR-2026-00001",
        logs: [
          {
            eventId: "abc123:0",
            action: "updated",
            changeType: "changed",
            doctype: "CRM Student",
            docname: "ENR-2026-00001",
            fieldname: "student_name",
            fieldLabel: "Student Name",
            oldValue: "Nguyen Van A",
            newValue: "Nguyen Van An",
            owner: "sale@example.com",
            ownerFullName: "Nguyễn Văn Sale",
            occurredAt: "2026-09-04T10:30:00.000Z",
            source: "Version",
            sourceName: "abc123",
            eventType: "status_changed",
            category: "status",
            content: "Nội dung audit",
            subject: "Chủ đề audit",
            reason: "Phụ huynh xác nhận tiếp tục quan tâm",
            metadata: { old_code: "NEW", new_code: "PROSPECT" },
          },
        ],
        total: 1,
        start: 0,
        pageLength: 20,
        readOnly: true,
      }),
    );

    const result = await getStudentAuditLogs({
      student: "ENR-2026-00001",
      pageLength: 20,
    });

    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(url.pathname).toBe("/api/v1/students/ENR-2026-00001/audit-logs");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      start: "0",
      pageLength: "20",
    });
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
    expect(result).toMatchObject({
      student: "ENR-2026-00001",
      total: 1,
      readOnly: true,
    });
    expect(result.logs[0]).toMatchObject({
      eventId: "abc123:0",
      changeType: "changed",
      fieldLabel: "Student Name",
      ownerFullName: "Nguyễn Văn Sale",
      occurredAt: "2026-09-04T10:30:00.000Z",
      oldValue: "Nguyen Van A",
      newValue: "Nguyen Van An",
      eventType: "status_changed",
      category: "status",
      content: "Nội dung audit",
      subject: "Chủ đề audit",
      reason: "Phụ huynh xác nhận tiếp tục quan tâm",
      metadata: { old_code: "NEW", new_code: "PROSPECT" },
    });
  });

  it("maps authorization failures to stable errors", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "FORBIDDEN", message: "Not permitted" } }, 403),
    );

    await expect(
      getStudentAuditLogs({ student: "ENR-2026-00001" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<StudentAuditApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });

  it("treats a response without logs as an empty history", async () => {
    fetchMock.mockResolvedValue(json({}));

    await expect(
      getStudentAuditLogs({ student: "ENR-2026-00001" }),
    ).resolves.toMatchObject({
      student: "ENR-2026-00001",
      logs: [],
      total: 0,
      start: 0,
      pageLength: 100,
      readOnly: true,
    });
  });

  it("requires an entity id before calling the API", async () => {
    await expect(getStudentAuditLogs({ student: "  " })).rejects.toMatchObject({
      status: 417,
      code: "INVALID_STUDENT",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads the Lead audit history", async () => {
    fetchMock.mockResolvedValue(
      json({ lead: "LEAD-1", logs: [], total: 0, start: 0, pageLength: 100 }),
    );

    await expect(
      getLeadAuditLogs({ lead: "LEAD-1", pageLength: 100 }),
    ).resolves.toMatchObject({ student: "LEAD-1", readOnly: true });

    expect(new URL(String(fetchMock.mock.calls[0]![0])).pathname).toBe(
      "/api/v1/leads/LEAD-1/audit-logs",
    );
  });

  it("reads the Segment audit history", async () => {
    fetchMock.mockResolvedValue(
      json({
        segment: "SEGMENT-1",
        logs: [],
        total: 0,
        start: 0,
        pageLength: 50,
      }),
    );

    await expect(
      getSegmentAuditLogs({ segment: "SEGMENT-1", pageLength: 50 }),
    ).resolves.toMatchObject({ segment: "SEGMENT-1", readOnly: true });

    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(url.pathname).toBe("/api/v1/segments/SEGMENT-1/audit-logs");
    expect(url.searchParams.get("pageLength")).toBe("50");
  });
});
