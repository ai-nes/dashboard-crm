import {
  isNestApiEnabled,
  NestApiError,
  nestRequest,
} from "../nest/nest-client";
import type { RevenueForecastResponse } from "./types";

const METHOD =
  "crm.api.director_revenue_forecast.get_director_revenue_forecast";

export type * from "./types";

export class RevenueForecastApiError extends Error {}

function isForecast(value: unknown): value is RevenueForecastResponse {
  return !!value && typeof value === "object" && "summary" in value;
}

async function getNestRevenueForecast(): Promise<RevenueForecastResponse> {
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

export async function getRevenueForecast(): Promise<RevenueForecastResponse> {
  if (isNestApiEnabled()) return getNestRevenueForecast();
  const baseUrl = (process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );
  if (!baseUrl)
    throw new RevenueForecastApiError("Chưa cấu hình địa chỉ máy chủ CRM.");
  const response = await fetch(`${baseUrl}/api/method/${METHOD}`, {
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  }).catch(() => null);
  if (!response)
    throw new RevenueForecastApiError(
      "Không thể kết nối tới dữ liệu revenue forecast.",
    );
  const payload = await response.json().catch(() => null);
  const data =
    payload && typeof payload === "object" && "message" in payload
      ? (payload as { message: unknown }).message
      : null;
  if (!response.ok || !data || typeof data !== "object")
    throw new RevenueForecastApiError(
      "Phản hồi revenue forecast không hợp lệ.",
    );
  return data as RevenueForecastResponse;
}
