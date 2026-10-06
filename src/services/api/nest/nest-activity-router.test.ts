import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("notes and tasks with the Nest backend", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("lists and creates notes in the dashboard shape", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      json(
        init?.method === "POST"
          ? {
              name: "n1",
              content: "Hi",
              reference_doctype: "CRM Student",
              reference_docname: "s1",
              owner_full_name: "An",
            }
          : {
              total: 1,
              start: 0,
              page_length: 20,
              notes: [
                {
                  name: "n1",
                  content: "Hi",
                  reference_doctype: "CRM Student",
                  reference_docname: "s1",
                },
              ],
            },
      ),
    );
    const { listNotes, createNote } = await import("../crm-notes");
    const list = await listNotes({
      referenceDoctype: "CRM Student",
      referenceDocname: "s1",
      search: "hi",
    });
    expect(list.notes[0]).toMatchObject({ name: "n1", referenceDocname: "s1" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/notes?referenceDoctype=CRM+Student&referenceDocname=s1&search=hi&start=0&pageLength=20",
    );
    const created = await createNote({
      referenceDoctype: "CRM Student",
      referenceDocname: "s1",
      content: "Hi",
    });
    expect(created.ownerFullName).toBe("An");
    const body = JSON.parse(
      (fetchMock.mock.calls[1][1] as RequestInit).body as string,
    );
    expect(body).toEqual({
      referenceDoctype: "CRM Student",
      referenceDocname: "s1",
      content: "Hi",
    });
  });

  it("maps task fields both ways and surfaces errors", async () => {
    fetchMock.mockImplementation(() =>
      json({
        name: "t1",
        title: "Gọi",
        status: "Todo",
        priority: "High",
        due_date: "2030-01-02T09:00:00.000Z",
        reference_doctype: "CRM Student",
        reference_docname: "s1",
      }),
    );
    const { createTask, updateTask } = await import("../crm-tasks");
    const task = await createTask({
      referenceDoctype: "CRM Student",
      referenceDocname: "s1",
      title: "Gọi",
      priority: "High",
      dueDate: "2030-01-02T09:00:00.000Z",
      assignedTo: "a@example.test",
    });
    expect(task).toMatchObject({
      name: "t1",
      priority: "High",
      status: "Todo",
    });
    const created = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(created).toEqual({
      referenceDoctype: "CRM Student",
      referenceDocname: "s1",
      title: "Gọi",
      priority: "High",
      dueDate: "2030-01-02T09:00:00.000Z",
      assignedTo: "a@example.test",
    });

    await updateTask({ name: "t1", status: "Done" });
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/tasks/t1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ status: "Done" });

    fetchMock.mockImplementationOnce(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền." } }, 403),
    );
    await expect(
      updateTask({ name: "t1", status: "Done" }),
    ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
  });

  it("keeps segment task references on the Nest transport", async () => {
    fetchMock.mockImplementation(() =>
      json({
        total: 1,
        start: 0,
        page_length: 20,
        tasks: [
          {
            name: "segment-task-1",
            title: "Gọi lại nhóm tuyển sinh",
            reference_doctype: "CRM Segment",
            reference_docname: "segment-1",
            status: "Todo",
            priority: "Medium",
          },
        ],
      }),
    );
    const { listTasks } = await import("../crm-tasks");
    const result = await listTasks({
      referenceDoctype: "CRM Segment",
      referenceDocname: "segment-1",
    });
    expect(result.tasks[0]).toMatchObject({
      referenceDoctype: "CRM Segment",
      referenceDocname: "segment-1",
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/v1/tasks?referenceDoctype=CRM+Segment&referenceDocname=segment-1",
    );
  });
});
