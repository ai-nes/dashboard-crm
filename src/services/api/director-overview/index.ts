import { NestApiError, nestRequest } from "../nest/nest-client";
import { normalizeDirectorOverview } from "./normalizers";
import type {
  DirectorOverviewData,
  DirectorOverviewParams,
  DirectorOverviewResponse,
} from "./types";

export type * from "./types";
export * from "./data";
export * from "./normalizers";

export class DirectorOverviewApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "DirectorOverviewApiError";
  }
}

function hasOverviewEnvelope(
  value: unknown,
): value is { message: DirectorOverviewData } | DirectorOverviewData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const payload =
    "message" in value && value.message && typeof value.message === "object"
      ? (value as { message: Record<string, unknown> }).message
      : (value as Record<string, unknown>);

  return (
    !!payload &&
    typeof payload === "object" &&
    Array.isArray(payload.kpis) &&
    typeof payload.meta === "object" &&
    typeof payload.forecast === "object" &&
    typeof payload.pipeline === "object"
  );
}

export async function getDirectorOverview(
  params?: DirectorOverviewParams,
): Promise<DirectorOverviewResponse> {
  try {
    const payload = await nestRequest("/api/v1/director/overview", {
      query: {
        admissionYear: params?.admissionYear,
        scope: params?.scope,
        trendRange: params?.trendRange,
      },
    });
    if (!hasOverviewEnvelope(payload)) {
      throw new DirectorOverviewApiError(
        502,
        "INVALID_OVERVIEW_RESPONSE",
        "Phản hồi dữ liệu tổng quan tuyển sinh không hợp lệ.",
      );
    }
    return normalizeDirectorOverview(payload);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new DirectorOverviewApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}
