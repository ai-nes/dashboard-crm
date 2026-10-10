import { describe, expect, it, vi, beforeEach } from "vitest";
const request = vi.hoisted(() => vi.fn());
vi.mock("../nest/nest-client", () => ({ nestRequest: request }));
import { getEnglishCertificate, saveEnglishCertificate } from ".";

describe("English certificate persistence", () => {
  beforeEach(() => {
    request.mockReset();
  });
  it("reads the existing English certificate and preserves other languages", async () => {
    const english = {
      id: "c1",
      language: "Tiếng Anh",
      certificate_name: "IELTS",
    };
    request.mockResolvedValue({
      data: { certificates: [{ id: "j1", language: "Tiếng Nhật" }, english] },
    });
    expect(await getEnglishCertificate("s1")).toEqual(english);
    expect(request).toHaveBeenCalledWith(
      "/api/v1/students/s1/language-certificates",
    );
  });
  it.each([undefined, "c1"])(
    "saves with the correct create/update command: %s",
    async (id) => {
      request.mockResolvedValue({
        data: { id: id ?? "new", certificate_name: "IELTS" },
      });
      const fields = {
        certificateName: "IELTS",
        scoreLevel: "0",
        issueDate: null,
        expiryDate: null,
      };
      await saveEnglishCertificate("s1", id, fields);
      expect(request).toHaveBeenCalledWith(
        `/api/v1/students/s1/language-certificates${id ? `/${id}` : ""}`,
        {
          method: id ? "PATCH" : "POST",
          body: { language: "Tiếng Anh", ...fields },
        },
      );
    },
  );
  it("propagates save failures", async () => {
    request.mockRejectedValue(new Error("Denied"));
    await expect(
      saveEnglishCertificate("s1", "c1", {
        certificateName: "IELTS",
        scoreLevel: null,
        issueDate: null,
        expiryDate: null,
      }),
    ).rejects.toThrow("Denied");
  });
});
