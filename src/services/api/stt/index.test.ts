import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSttJobStatus,
  isSttCallUuid,
  triggerSttTranscription,
} from ".";

describe("STT API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts only Worldfone call UUIDs", () => {
    expect(isSttCallUuid("1788077950.625384")).toBe(true);
    expect(isSttCallUuid("CALL-1")).toBe(false);
  });

  it("triggers transcription through the dashboard proxy", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("OK", { status: 200 }));

    await triggerSttTranscription(" 1788077950.625384 ");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/stt/transcribe/1788077950.625384",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("treats an unknown STT job as not started", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Unknown calluuid", { status: 404 }));

    await expect(getSttJobStatus("1788077950.625384")).resolves.toBeNull();
  });
});
