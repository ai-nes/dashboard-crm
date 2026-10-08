import { NestApiError, nestRequest } from "../nest/nest-client";
import type {
  DirectorAdmissionFunnelData,
  DirectorAdmissionFunnelParams,
  DirectorAdmissionFunnelResponse,
} from "./types";
import { normalizeDirectorAdmissionFunnel } from "./normalizers";

export type * from "./types";
export * from "./normalizers";

export class DirectorAdmissionFunnelApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "DirectorAdmissionFunnelApiError";
  }
}

export async function getDirectorAdmissionFunnel(
  params: DirectorAdmissionFunnelParams = {},
): Promise<DirectorAdmissionFunnelResponse> {
  let payload: unknown;
  try {
    payload = await nestRequest<unknown>("/api/v1/director/admission-funnel", {
      query: { admissionYear: params.admissionYear },
    });
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new DirectorAdmissionFunnelApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw new DirectorAdmissionFunnelApiError(
      503,
      "DIRECTOR_ADMISSION_FUNNEL_UNAVAILABLE",
      "Không thể kết nối tới dữ liệu phễu tuyển sinh.",
    );
  }
  try {
    return normalizeDirectorAdmissionFunnel(payload);
  } catch {
    throw new DirectorAdmissionFunnelApiError(
      502,
      "INVALID_FUNNEL_RESPONSE",
      "Phản hồi dữ liệu phễu tuyển sinh không hợp lệ.",
    );
  }
}

export type { DirectorAdmissionFunnelData };
