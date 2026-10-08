import { NestApiError, nestRequest } from "../nest/nest-client";
import type { RevenueForecastResponse } from "./types";

export type * from "./types";

export class RevenueForecastApiError extends Error {}

function isForecast(value: unknown): value is RevenueForecastResponse {
  return !!value && typeof value === "object" && "summary" in value;
}

export async function getRevenueForecast(): Promise<RevenueForecastResponse> {
  try {
    const data = await nestRequest<unknown>(
      "/api/v1/director/revenue-forecast",
    );
    if (!isForecast(data)) {
      throw new RevenueForecastApiError(
        "Phản hồi revenue forecast không hợp lệ.",
      );
    }
    return data;
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new RevenueForecastApiError(error.message);
    }
    throw error;
  }
}
