import { NestApiError, nestRequest } from "../nest/nest-client";
import type { LicenseState, LicenseStatus } from "./types";

export type * from "./types";

export const LICENSE_QUERY_KEY = ["license", "status"] as const;
export const ACTIVATE_PATH = "/activate";

/** Whether the backend lets the CRM APIs answer (DISABLED = enforcement off in dev). */
export function isLicenseUsable(state: LicenseState | undefined): boolean {
  return state === "ACTIVE" || state === "DISABLED";
}

/** A 403 the backend's license guard answered with, e.g. LICENSE_REQUIRED. */
export function isLicenseApiError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { status, code } = error as { status?: unknown; code?: unknown };
  return (
    status === 403 &&
    typeof code === "string" &&
    (code.startsWith("LICENSE_") || code === "LEASE_EXPIRED")
  );
}

/** Public: answers even before activation. */
export async function getLicenseStatus(): Promise<LicenseStatus> {
  try {
    return await nestRequest<LicenseStatus>("/api/v1/license/status");
  } catch (error) {
    // A backend without the license module has nothing to enforce.
    if (error instanceof NestApiError && error.status === 404) {
      return { status: "DISABLED" };
    }
    throw error;
  }
}

/** Requires an administrator session; the backend checks the key with the License Hub. */
export function activateLicense(licenseKey: string): Promise<LicenseStatus> {
  return nestRequest<LicenseStatus>("/api/v1/license/activate", {
    method: "POST",
    body: { licenseKey },
  });
}

const ACTIVATION_MESSAGES: Record<string, string> = {
  INVALID_LICENSE_KEY: "License key không hợp lệ.",
  INVALID_REQUEST: "Vui lòng nhập license key.",
  ACTIVATION_LIMIT_REACHED:
    "License key đã được kích hoạt trên số máy chủ tối đa cho phép.",
  LICENSE_REVOKED: "License key đã bị thu hồi.",
  LICENSE_SUSPENDED: "License key đang bị tạm khóa.",
  LICENSE_EXPIRED: "License key đã hết hạn.",
  RATE_LIMITED: "Thử quá nhiều lần. Vui lòng đợi rồi thử lại.",
  LICENSE_SERVER_UNREACHABLE:
    "Không kết nối được máy chủ license. Kiểm tra Internet của máy chủ CRM rồi thử lại.",
  LICENSE_OPERATION_IN_PROGRESS: "Đang kích hoạt, vui lòng đợi.",
  FORBIDDEN: "Chỉ quản trị viên mới được kích hoạt license.",
  API_UNAVAILABLE: "Không kết nối được máy chủ CRM.",
};

/** User-facing message for a failed activation. */
export function activationErrorMessage(error: unknown): string {
  if (error instanceof NestApiError) {
    return (
      ACTIVATION_MESSAGES[error.code] ??
      "Kích hoạt thất bại. Vui lòng thử lại hoặc liên hệ nhà cung cấp."
    );
  }
  return "Kích hoạt thất bại. Vui lòng thử lại.";
}

/** Shown on the activation screen when the license stopped working. */
export const LICENSE_STATE_MESSAGES: Partial<Record<LicenseState, string>> = {
  LEASE_EXPIRED:
    "Máy chủ CRM chưa xác nhận lại được license. Kiểm tra kết nối Internet hoặc nhập lại key.",
  LICENSE_REVOKED: "License đã bị thu hồi. Vui lòng liên hệ nhà cung cấp.",
  LICENSE_SUSPENDED: "License đang bị tạm khóa. Vui lòng liên hệ nhà cung cấp.",
  LICENSE_EXPIRED: "License đã hết hạn. Vui lòng gia hạn hoặc nhập key mới.",
};
