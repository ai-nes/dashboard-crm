import { NestApiError, nestRequest } from "../nest/nest-client";
import { normalizeMarketOverview } from "./normalizers";
import type { DirectorMarketOverview, DirectorMarketParams } from "./types";

function hasMarketEnvelope(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const message = (value as { message?: unknown }).message;
  if (!message || typeof message !== "object" || Array.isArray(message))
    return false;
  const data = (message as { data?: unknown }).data;
  return (
    !!data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    Array.isArray((data as { provinces?: unknown }).provinces)
  );
}

export * from "./normalizers";
export type * from "./types";

export class DirectorMarketApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "DirectorMarketApiError";
  }
}

export async function getDirectorMarketIntelligence(
  params: DirectorMarketParams = {},
): Promise<DirectorMarketOverview> {
  try {
    const payload = await nestRequest<unknown>(
      "/api/v1/director/market-intelligence",
      {
        query: {
          admissionYear: params.admissionYear,
          period: params.period,
          region: params.region,
          metric: params.metric,
          includeSchools:
            params.includeSchools === undefined
              ? undefined
              : String(params.includeSchools),
          schoolLimit: params.schoolLimit,
        },
      },
    );
    if (!hasMarketEnvelope({ message: payload })) {
      throw new DirectorMarketApiError(
        502,
        "INVALID_MARKET_RESPONSE",
        "Phản hồi dữ liệu thị trường không hợp lệ.",
      );
    }
    return normalizeMarketOverview(payload);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new DirectorMarketApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}
