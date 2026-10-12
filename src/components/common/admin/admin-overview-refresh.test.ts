import { beforeEach, describe, expect, it, vi } from "vitest";

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

import { refreshAdminOverviewQueries } from "./admin-overview-refresh";

describe("refreshAdminOverviewQueries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reports success after every overview source has refreshed", async () => {
    const refetch = vi.fn().mockResolvedValue({ isError: false });
    const result = await refreshAdminOverviewQueries([
      { refetch },
      { refetch },
    ]);

    expect(refetch).toHaveBeenCalledTimes(2);
    expect(result).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Đã làm mới dữ liệu.");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("reports failure when any query resolves with an error", async () => {
    const result = await refreshAdminOverviewQueries([
      { refetch: vi.fn().mockResolvedValue({ isError: false }) },
      { refetch: vi.fn().mockResolvedValue({ isError: true }) },
    ]);

    expect(result).toBe(false);
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "Không thể làm mới dữ liệu. Vui lòng thử lại.",
    );
  });
});
