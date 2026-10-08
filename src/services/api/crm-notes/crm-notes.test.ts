import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNote,
  CrmNoteApiError,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("CRM Notes API Service", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  describe("listNotes", () => {
    it("gọi GET /notes với tham số chuẩn xác và trả về danh sách đã chuẩn hóa", async () => {
      fetchMock.mockResolvedValue(
        json({
          total: 1,
          start: 0,
          page_length: 20,
          notes: [
            {
              name: "NOTE-001",
              content: "<p>Đã trao đổi về học bổng 30%</p>",
              reference_doctype: "CRM Lead",
              reference_docname: "STU-0001",
              modified: "2026-09-04 10:00:00",
              creation: "2026-09-04 09:30:00",
              owner: "tu-van-vien@fpt.edu.vn",
              owner_full_name: "Trần Quốc Bảo",
            },
          ],
        }),
      );

      const result = await listNotes({
        referenceDoctype: "CRM Lead",
        referenceDocname: "STU-0001",
        search: "học bổng",
      });

      const url = new URL(String(fetchMock.mock.calls[0]![0]));
      expect(url.pathname).toBe("/api/v1/notes");
      expect(Object.fromEntries(url.searchParams)).toEqual({
        referenceDoctype: "CRM Lead",
        referenceDocname: "STU-0001",
        search: "học bổng",
        start: "0",
        pageLength: "20",
      });
      expect(fetchMock.mock.calls[0]![1]).toMatchObject({
        method: "GET",
        credentials: "include",
      });
      expect(result.total).toBe(1);
      expect(result.notes[0]?.name).toBe("NOTE-001");
      expect(result.notes[0]?.ownerFullName).toBe("Trần Quốc Bảo");
      expect(result.notes[0]?.referenceDoctype).toBe("CRM Lead");
    });
  });

  describe("createNote", () => {
    it("gọi POST /notes và trả về ghi chú mới được tạo", async () => {
      fetchMock.mockResolvedValue(
        json({
          name: "NOTE-002",
          content: "<p>Phụ huynh đồng ý nộp hồ sơ</p>",
          reference_doctype: "CRM Lead",
          reference_docname: "STU-0001",
        }),
      );

      const result = await createNote({
        referenceDoctype: "CRM Lead",
        referenceDocname: "STU-0001",
        content: "<p>Phụ huynh đồng ý nộp hồ sơ</p>",
      });

      const [url, init] = fetchMock.mock.calls[0]!;
      expect(url).toBe(`${API}/api/v1/notes`);
      expect(init).toMatchObject({ method: "POST" });
      expect(JSON.parse(init.body)).toEqual({
        referenceDoctype: "CRM Lead",
        referenceDocname: "STU-0001",
        content: "<p>Phụ huynh đồng ý nộp hồ sơ</p>",
      });
      expect(result.name).toBe("NOTE-002");
    });
  });

  describe("updateNote", () => {
    it("gọi PATCH /notes/{id} để cập nhật content", async () => {
      fetchMock.mockResolvedValue(
        json({
          name: "NOTE-002",
          content: "<p>Đã nộp hồ sơ</p>",
          reference_doctype: "CRM Lead",
          reference_docname: "STU-0001",
        }),
      );

      const result = await updateNote({
        name: "NOTE-002",
        content: "<p>Đã nộp hồ sơ</p>",
      });

      const [url, init] = fetchMock.mock.calls[0]!;
      expect(url).toBe(`${API}/api/v1/notes/NOTE-002`);
      expect(init).toMatchObject({ method: "PATCH" });
      expect(JSON.parse(init.body)).toEqual({ content: "<p>Đã nộp hồ sơ</p>" });
      expect(result.content).toBe("<p>Đã nộp hồ sơ</p>");
    });
  });

  describe("deleteNote", () => {
    it("gọi DELETE /notes/{id} thành công", async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      const result = await deleteNote("NOTE-002");

      expect(result.success).toBe(true);
      expect(fetchMock.mock.calls[0]![0]).toBe(`${API}/api/v1/notes/NOTE-002`);
      expect(fetchMock.mock.calls[0]![1]).toMatchObject({ method: "DELETE" });
    });
  });

  describe("getNote", () => {
    it("lấy chi tiết ghi chú theo name", async () => {
      fetchMock.mockResolvedValue(
        json({
          name: "NOTE-001",
          content: "Nội dung",
          reference_doctype: "CRM Lead",
          reference_docname: "STU-0001",
        }),
      );

      const result = await getNote("NOTE-001");

      expect(fetchMock.mock.calls[0]![0]).toBe(`${API}/api/v1/notes/NOTE-001`);
      expect(result.name).toBe("NOTE-001");
      expect(result.content).toBe("Nội dung");
    });
  });

  describe("error handling", () => {
    it("ném CrmNoteApiError mang mã lỗi của API khi bị từ chối quyền", async () => {
      fetchMock.mockResolvedValue(
        json(
          {
            error: {
              code: "PERMISSION_DENIED",
              message: "Không có quyền sửa ghi chú này.",
            },
          },
          403,
        ),
      );

      await expect(
        updateNote({ name: "NOTE-001", content: "Test" }),
      ).rejects.toEqual(
        expect.objectContaining<Partial<CrmNoteApiError>>({
          status: 403,
          code: "PERMISSION_DENIED",
          message: "Không có quyền sửa ghi chú này.",
        }),
      );
    });

    it("ném CrmNoteApiError khi không thể kết nối mạng", async () => {
      fetchMock.mockRejectedValue(new TypeError("Network Error"));

      await expect(
        listNotes({
          referenceDoctype: "CRM Lead",
          referenceDocname: "STU-0001",
        }),
      ).rejects.toThrow(CrmNoteApiError);
    });
  });
});
