import { NestApiError, nestRequest } from "../nest/nest-client";
import type {
  DirectorDemographicsOverviewParams,
  DirectorDemographicsOverviewResponse,
  DirectorDemographicsSegmentParams,
  DirectorDemographicsSegmentResponse,
} from "./types";

export type * from "./types";
export * from "./data";

export class DirectorDemographicsApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "DirectorDemographicsApiError";
  }
}
function hasDemographicsOverviewEnvelope(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  const data = payload.data as Record<string, unknown> | undefined;
  const meta = payload.meta as Record<string, unknown> | undefined;

  return (
    !!data &&
    typeof data === "object" &&
    Array.isArray(data.kpis) &&
    typeof data.demand === "object" &&
    typeof data.audienceComposition === "object" &&
    Array.isArray(data.segments) &&
    !!data.acquisitionMap &&
    typeof data.acquisitionMap === "object" &&
    Array.isArray(data.regionOpportunities) &&
    typeof data.regionalDemand === "object" &&
    Array.isArray(data.dataCoverage) &&
    !!meta &&
    typeof meta === "object" &&
    typeof meta.admissionYear === "number" &&
    typeof meta.page === "number" &&
    Number.isInteger(meta.page) &&
    meta.page >= 1 &&
    typeof meta.pageSize === "number" &&
    Number.isInteger(meta.pageSize) &&
    meta.pageSize >= 1 &&
    typeof meta.total === "number" &&
    Number.isInteger(meta.total) &&
    meta.total >= 0 &&
    typeof meta.totalPages === "number" &&
    Number.isInteger(meta.totalPages) &&
    meta.totalPages >= 1 &&
    meta.totalPages === Math.max(1, Math.ceil(meta.total / meta.pageSize)) &&
    meta.page <= meta.totalPages &&
    data.segments.length <= meta.pageSize &&
    typeof meta.hasNextPage === "boolean" &&
    meta.hasNextPage === meta.page < meta.totalPages
  );
}

function hasDemographicsSegmentEnvelope(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  const data = payload.data as Record<string, unknown> | undefined;
  const meta = payload.meta as Record<string, unknown> | undefined;

  return (
    !!data &&
    typeof data === "object" &&
    typeof data.segment === "object" &&
    data.segment !== null &&
    typeof (data.segment as Record<string, unknown>).id === "string" &&
    typeof data.benchmark === "object" &&
    typeof data.nextAction === "object" &&
    Array.isArray(data.guardrails) &&
    !!meta &&
    typeof meta === "object" &&
    typeof meta.admissionYear === "number"
  );
}

export async function getDirectorDemographicsOverview(
  params?: DirectorDemographicsOverviewParams,
): Promise<DirectorDemographicsOverviewResponse> {
  try {
    const payload = await nestRequest("/api/v1/director/demographics", {
      query: {
        admissionYear: params?.admissionYear,
        period: params?.period,
        scope: params?.scope,
        page: params?.page,
        pageSize: params?.pageSize,
      },
    });
    if (!hasDemographicsOverviewEnvelope(payload)) {
      throw new DirectorDemographicsApiError(
        502,
        "INVALID_DEMOGRAPHICS_RESPONSE",
        "Phản hồi dữ liệu phân tích người học không hợp lệ.",
      );
    }
    return payload as DirectorDemographicsOverviewResponse;
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new DirectorDemographicsApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

export async function getDirectorDemographicsSegment(
  params: DirectorDemographicsSegmentParams,
): Promise<DirectorDemographicsSegmentResponse | null> {
  try {
    const payload = await nestRequest(
      `/api/v1/director/demographics/segments/${encodeURIComponent(params.segment_id)}`,
      { query: { admissionYear: params.admissionYear } },
    );
    if (!hasDemographicsSegmentEnvelope(payload)) {
      throw new DirectorDemographicsApiError(
        502,
        "INVALID_SEGMENT_RESPONSE",
        "Phản hồi dữ liệu phân khúc người học không hợp lệ.",
      );
    }
    return payload as DirectorDemographicsSegmentResponse;
  } catch (error) {
    if (error instanceof NestApiError) {
      if (error.status === 404 && error.code === "SEGMENT_NOT_FOUND") {
        return null;
      }
      throw new DirectorDemographicsApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}
