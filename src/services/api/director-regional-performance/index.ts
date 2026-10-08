import { NestApiError, nestRequest } from "../nest/nest-client";
import type {
  DirectorRegionalPerformanceParams,
  RegionalPerformanceData,
} from "./types";

export type * from "./types";

export class DirectorRegionalPerformanceApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "DirectorRegionalPerformanceApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export async function getDirectorRegionalPerformance(
  params: DirectorRegionalPerformanceParams = {},
): Promise<RegionalPerformanceData> {
  let data: unknown;
  try {
    data = await nestRequest<unknown>("/api/v1/director/regional-performance", {
      query: { admissionYear: params.admissionYear, scope: params.scope },
    });
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new DirectorRegionalPerformanceApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw new DirectorRegionalPerformanceApiError(
      503,
      "REGIONAL_PERFORMANCE_DATA_UNAVAILABLE",
      "Không thể kết nối tới dữ liệu hiệu suất theo địa bàn.",
    );
  }
  if (!isRegionalPerformanceData(data)) {
    throw new DirectorRegionalPerformanceApiError(
      502,
      "INVALID_REGIONAL_PERFORMANCE_RESPONSE",
      "Phản hồi hiệu suất theo địa bàn không hợp lệ.",
    );
  }
  return data;
}

function isRegionalPerformanceData(
  value: unknown,
): value is RegionalPerformanceData {
  const data = asRecord(value);
  return (
    !!data &&
    Array.isArray(data.provinces) &&
    Array.isArray(data.capabilityColumns) &&
    Array.isArray(data.priorityActions) &&
    !!asRecord(data.meta)
  );
}
