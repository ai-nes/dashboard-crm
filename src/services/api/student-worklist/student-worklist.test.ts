import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  completeActionManually,
  getStudentWorklistActions,
  startAction,
  StudentWorklistApiError,
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

describe("student worklist API contract", () => {
  it("calls the student actions endpoint and extracts objectives", async () => {
    fetchMock.mockResolvedValue(
      json({
        items: [
          {
            name: "action-1",
            student: "STU-001",
            action_type: "CALL",
            objective: "Tư vấn học bổng",
            state: "pending",
            execution_status: "pending",
            priority: "high",
            due_at: "2026-09-03 10:00:00",
            action_owner: "Trần Minh Anh",
            origin: "AI",
            revision: 2,
            is_today: true,
            is_overdue: false,
          },
          { name: "action-2", objective: "" },
        ],
      }),
    );

    const result = await getStudentWorklistActions("STU-001");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/students/STU-001/actions?page_size=50`,
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
    expect(result.items).toEqual([
      expect.objectContaining({
        name: "action-1",
        actionType: "CALL",
        objective: "Tư vấn học bổng",
        priority: "high",
        actionOwner: "Trần Minh Anh",
        isToday: true,
      }),
    ]);
  });

  it("throws a typed error for an invalid response", async () => {
    fetchMock.mockResolvedValue(json({ items: null }));

    await expect(getStudentWorklistActions("STU-001")).rejects.toEqual(
      expect.objectContaining<Partial<StudentWorklistApiError>>({
        status: 502,
        code: "INVALID_STUDENT_WORKLIST_RESPONSE",
      }),
    );
  });

  it("requires a student id before calling the API", async () => {
    await expect(getStudentWorklistActions("  ")).rejects.toMatchObject({
      status: 400,
      code: "INVALID_STUDENT_ID",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("starts an action by moving it to in progress", async () => {
    fetchMock.mockResolvedValue(
      json({ action: "action-1", status: "in_progress", revision: 3 }),
    );

    const result = await startAction({
      action: "action-1",
      expectedActionRevision: 2,
      idempotencyKey: "start-1",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/student-actions/action-1/transition`);
    expect(init).toMatchObject({ method: "POST" });
    expect(JSON.parse(init.body)).toEqual({ status: "in_progress" });
    expect(result).toEqual({
      name: "action-1",
      executionStatus: "in_progress",
      revision: 3,
    });
  });

  it("completes an action manually with its outcome", async () => {
    fetchMock.mockResolvedValue(
      json({ action: "action-1", status: "completed", revision: 4 }),
    );

    const result = await completeActionManually({
      action: "action-1",
      idempotencyKey: "done-1",
      expectedActionRevision: 3,
      expectedPackageRevision: 1,
      outcomeCode: "CONNECTED",
      outcomeNotes: "Phụ huynh đồng ý.",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/student-actions/action-1/complete`);
    expect(JSON.parse(init.body)).toEqual({
      outcome_code: "CONNECTED",
      outcome_notes: "Phụ huynh đồng ý.",
    });
    expect(result).toEqual({
      name: "action-1",
      executionStatus: "completed",
      revision: 4,
    });
  });

  it("reports an upstream failure as a worklist error", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "STALE_REVISION", message: "Đã thay đổi." } }, 409),
    );

    await expect(
      startAction({
        action: "action-1",
        expectedActionRevision: 1,
        idempotencyKey: "start-2",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<StudentWorklistApiError>>({
        status: 409,
        code: "STALE_REVISION",
      }),
    );
  });
});
