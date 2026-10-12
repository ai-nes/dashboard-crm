import { toast } from "sonner";

interface RefreshableQuery {
  refetch: () => Promise<{ isError: boolean }>;
}

export async function refreshAdminOverviewQueries(
  queries: readonly RefreshableQuery[],
): Promise<boolean> {
  try {
    const results = await Promise.all(queries.map((query) => query.refetch()));
    if (results.some((result) => result.isError)) {
      throw new Error("An overview source failed to refresh.");
    }
    toast.success("Đã làm mới dữ liệu.");
    return true;
  } catch {
    toast.error("Không thể làm mới dữ liệu. Vui lòng thử lại.");
    return false;
  }
}
