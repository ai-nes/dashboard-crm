import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTask,
  CrmTaskApiError,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const queryOf = (index: number) =>
  Object.fromEntries(
    new URL(String(fetchMock.mock.calls[index]![0])).searchParams,
  );

describe("CRM Tasks API Service", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("list task theo hồ sơ bằng GET và chuẩn hóa field snake_case", async () => {
    fetchMock.mockResolvedValue(
      json({
        total: 1,
        start: 0,
        page_length: 20,
        tasks: [
          {
            name: "1",
            title: "Gọi lại tư vấn viên",
            description: "Xác nhận lịch tư vấn.",
            action_code: "CALL_BACK",
            assigned_to: "sale@example.com",
            status: "Todo",
            priority: "High",
            due_date: "2026-09-05 17:00:00",
            reference_doctype: "CRM Student",
            reference_docname: "STU-2026-00005",
          },
        ],
      }),
    );

    const result = await listTasks({
      referenceDoctype: "CRM Student",
      referenceDocname: "STU-2026-00005",
      status: "Todo",
    });

    expect(new URL(String(fetchMock.mock.calls[0]![0])).pathname).toBe(
      "/api/v1/tasks",
    );
    expect(queryOf(0)).toEqual({
      referenceDoctype: "CRM Student",
      referenceDocname: "STU-2026-00005",
      status: "Todo",
      start: "0",
      pageLength: "20",
    });
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
    expect(result.tasks[0]).toMatchObject({
      name: "1",
      assignedTo: "sale@example.com",
      status: "Todo",
      priority: "High",
      dueDate: "2026-09-05 17:00:00",
      actionCode: "CALL_BACK",
    });
  });

  it("list task riêng của Segment", async () => {
    fetchMock.mockResolvedValue(
      json({
        total: 1,
        start: 0,
        page_length: 100,
        tasks: [
          {
            name: "TASK-SEGMENT-1",
            title: "Rà soát tệp chăm sóc",
            reference_doctype: "CRM Segment",
            reference_docname: "SEG-0001",
            status: "Todo",
          },
        ],
      }),
    );

    const result = await listTasks({
      referenceDoctype: "CRM Segment",
      referenceDocname: "SEG-0001",
      search: "rà soát",
      pageLength: 100,
    });

    expect(queryOf(0)).toEqual({
      referenceDoctype: "CRM Segment",
      referenceDocname: "SEG-0001",
      search: "rà soát",
      start: "0",
      pageLength: "100",
    });
    expect(result.tasks[0]).toMatchObject({
      referenceDoctype: "CRM Segment",
      referenceDocname: "SEG-0001",
      status: "Todo",
    });
  });

  it("list task theo scope session khi không truyền hồ sơ", async () => {
    fetchMock.mockResolvedValue(
      json({ total: 0, start: 0, page_length: 100, tasks: [] }),
    );

    const result = await listTasks({ start: 0, pageLength: 100 });

    expect(queryOf(0)).toEqual({ start: "0", pageLength: "100" });
    expect(result.total).toBe(0);
  });

  it("get task theo name", async () => {
    fetchMock.mockResolvedValue(
      json({
        name: "1",
        title: "Gọi lại tư vấn viên",
        reference_doctype: "CRM Student",
        reference_docname: "STU-2026-00005",
      }),
    );

    const result = await getTask("1");

    expect(fetchMock.mock.calls[0]![0]).toBe(`${API}/api/v1/tasks/1`);
    expect(result.name).toBe("1");
  });

  it("create task bằng POST với payload camelCase", async () => {
    fetchMock.mockResolvedValue(
      json({
        name: "2",
        title: "Gọi lại tư vấn viên",
        reference_doctype: "CRM Student",
        reference_docname: "STU-2026-00005",
      }),
    );

    await createTask({
      referenceDoctype: "CRM Student",
      referenceDocname: "STU-2026-00005",
      title: "Gọi lại tư vấn viên",
      description: "Xác nhận lịch tư vấn.",
      actionCode: "CALL_BACK",
      priority: "High",
      status: "Todo",
      dueDate: "2026-09-05 17:00:00",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/tasks`);
    expect(init).toMatchObject({ method: "POST" });
    expect(JSON.parse(init.body)).toEqual({
      referenceDoctype: "CRM Student",
      referenceDocname: "STU-2026-00005",
      actionCode: "CALL_BACK",
      title: "Gọi lại tư vấn viên",
      description: "Xác nhận lịch tư vấn.",
      priority: "High",
      status: "Todo",
      dueDate: "2026-09-05 17:00:00",
    });
  });

  it("update task bằng PATCH chỉ gửi các trường đã đổi", async () => {
    fetchMock.mockResolvedValue(
      json({
        name: "2",
        title: "Gọi lại lần 2",
        status: "In Progress",
        reference_doctype: "CRM Student",
        reference_docname: "STU-2026-00005",
      }),
    );

    const result = await updateTask({
      name: "2",
      title: "Gọi lại lần 2",
      status: "In Progress",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/tasks/2`);
    expect(init).toMatchObject({ method: "PATCH" });
    expect(JSON.parse(init.body)).toEqual({
      title: "Gọi lại lần 2",
      status: "In Progress",
    });
    expect(result.status).toBe("In Progress");
  });

  it("delete task bằng DELETE", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const result = await deleteTask("2");

    expect(fetchMock.mock.calls[0]![0]).toBe(`${API}/api/v1/tasks/2`);
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ method: "DELETE" });
    expect(result.deleted).toBe("2");
  });

  it("ném CrmTaskApiError mang mã lỗi của API", async () => {
    fetchMock.mockResolvedValue(
      json(
        { error: { code: "NOT_FOUND", message: "Không tìm thấy task." } },
        404,
      ),
    );

    await expect(getTask("missing")).rejects.toEqual(
      expect.objectContaining<Partial<CrmTaskApiError>>({
        status: 404,
        code: "NOT_FOUND",
        message: "Không tìm thấy task.",
      }),
    );
  });
});
