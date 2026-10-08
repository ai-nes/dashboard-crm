import { NestApiError, nestRequest } from "../nest/nest-client";
import {
  hasFieldActivityEnvelope,
  normalizeDirectorSchoolFieldActivity,
} from "./normalizers";
import type {
  DirectorSchoolFieldActivityData,
  DirectorSchoolFieldActivityParams,
} from "./types";

export type * from "./types";
export * from "./normalizers";

export class DirectorSchoolFieldActivityApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "DirectorSchoolFieldActivityApiError";
  }
}

/** Field activity from the Nest backend; the session cookie is forwarded on the server. */
export async function getDirectorSchoolFieldActivity(
  params: DirectorSchoolFieldActivityParams = {},
): Promise<DirectorSchoolFieldActivityData> {
  const headers: Record<string, string> = {};
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = (await cookies()).toString();
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Outside a Next request context, for example in contract tests.
    }
  }
  let payload: unknown;
  try {
    payload = await nestRequest("/api/v1/director/school-field-activity", {
      headers,
      query: {
        admissionYear: params.admissionYear,
        scope: params.scope,
        period: params.period,
        activityLimit: params.activityLimit,
        upcomingLimit: params.upcomingLimit,
        includeDevices:
          params.includeDevices === undefined
            ? undefined
            : String(params.includeDevices),
      },
    });
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new DirectorSchoolFieldActivityApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
  if (!hasFieldActivityEnvelope(payload)) {
    throw new DirectorSchoolFieldActivityApiError(
      502,
      "INVALID_FIELD_ACTIVITY_RESPONSE",
      "Phản hồi dữ liệu hoạt động trường và thực địa không hợp lệ.",
    );
  }
  return normalizeDirectorSchoolFieldActivity(payload);
}
