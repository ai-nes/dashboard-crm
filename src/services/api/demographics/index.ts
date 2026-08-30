import {
  computeDirectorDemographicsOverview,
  computeDirectorDemographicsSegment,
} from "./data";
import type {
  DirectorDemographicsOverviewParams,
  DirectorDemographicsOverviewResponse,
  DirectorDemographicsSegmentParams,
  DirectorDemographicsSegmentResponse,
} from "./types";

export type * from "./types";
export * from "./data";

export async function getDirectorDemographicsOverview(
  params?: DirectorDemographicsOverviewParams,
): Promise<DirectorDemographicsOverviewResponse> {
  const searchParams = new URLSearchParams();
  if (params?.admissionYear) searchParams.set("admissionYear", String(params.admissionYear));
  if (params?.period) searchParams.set("period", params.period);
  if (params?.scope) searchParams.set("scope", params.scope);

  const queryStr = searchParams.toString();
  const frappeBase = (process.env.NEXT_PUBLIC_FRAPPE_URL || "").replace(/\/+$/, "");

  if (!frappeBase) {
    return computeDirectorDemographicsOverview(params);
  }

  const url = `${frappeBase}/api/method/crm.api.director_demographics.get_director_demographics_overview${
    queryStr ? `?${queryStr}` : ""
  }`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();
      if (cookieHeader) {
        headers["Cookie"] = cookieHeader;
      }
    } catch {
      // Ignored outside request context
    }
  }

  try {
    const response = await fetch(url, {
      headers,
      ...(typeof window !== "undefined" ? { credentials: "include" as RequestCredentials } : {}),
      cache: "no-store",
    });

    if (response.ok) {
      const json = await response.json();
      return (json.message || json) as DirectorDemographicsOverviewResponse;
    }

    const errorJson = await response.json().catch(() => null);
    const errorMessage =
      errorJson?.exception ||
      errorJson?._server_messages ||
      errorJson?.message ||
      errorJson?.error?.message ||
      `Lỗi HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Lỗi fetch getDirectorDemographicsOverview, fallback sang mock data:", error);
      return computeDirectorDemographicsOverview(params);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Không thể kết nối đến máy chủ Frappe CRM.");
  }
}

export async function getDirectorDemographicsSegment(
  params: DirectorDemographicsSegmentParams,
): Promise<DirectorDemographicsSegmentResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("segment_id", params.segment_id);
  if (params.admissionYear) searchParams.set("admissionYear", String(params.admissionYear));

  const queryStr = searchParams.toString();
  const frappeBase = (process.env.NEXT_PUBLIC_FRAPPE_URL || "").replace(/\/+$/, "");

  if (!frappeBase) {
    const mockResult = computeDirectorDemographicsSegment(params);
    if (!mockResult) {
      throw new Error("Không tìm thấy phân khúc hoặc phân khúc không đủ dữ liệu để hiển thị.");
    }
    return mockResult;
  }

  const url = `${frappeBase}/api/method/crm.api.director_demographics.get_director_demographics_segment${
    queryStr ? `?${queryStr}` : ""
  }`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();
      if (cookieHeader) {
        headers["Cookie"] = cookieHeader;
      }
    } catch {
      // Ignored outside request context
    }
  }

  try {
    const response = await fetch(url, {
      headers,
      ...(typeof window !== "undefined" ? { credentials: "include" as RequestCredentials } : {}),
      cache: "no-store",
    });

    if (response.ok) {
      const json = await response.json();
      return (json.message || json) as DirectorDemographicsSegmentResponse;
    }

    const errorJson = await response.json().catch(() => null);
    const errorMessage =
      errorJson?.exception ||
      errorJson?._server_messages ||
      errorJson?.message ||
      errorJson?.error?.message ||
      `Lỗi HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Lỗi fetch getDirectorDemographicsSegment, fallback sang mock data:", error);
      const mockResult = computeDirectorDemographicsSegment(params);
      if (mockResult) return mockResult;
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Không thể kết nối đến máy chủ Frappe CRM.");
  }
}

