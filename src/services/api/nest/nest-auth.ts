import type { CurrentUser } from "../auth/types";
import { NestApiError, nestRequest } from "./nest-client";

interface NestMe {
  data: {
    id: string;
    email: string;
    name: string;
    identityRole: "admin" | "user";
    crmProfile: string | null;
    crmCapabilities: { key: string }[];
  };
}

/** Backend CRM profile -> the dashboard's canonical role names (see rbac.ts). */
const PROFILE_ROLES: Record<string, string[]> = {
  sales: ["Sale"],
  ctv_sale: ["CTV Sale"],
  lead_sales: ["Lead Sale"],
  pr: ["Promoter"],
  pr_manager: ["Lead Promoter"],
  marketing: ["Marketing"],
  lead_marketing: ["Lead Marketing"],
  admissions_director: ["Admissions Director"],
  ceo: ["Administrator", "System Manager"],
};

const PROFILE_LABELS: Record<string, string> = {
  sales: "Sale",
  ctv_sale: "CTV Sale",
  lead_sales: "Lead Sale",
  pr: "Promoter",
  pr_manager: "Lead Promoter",
  marketing: "Marketing",
  lead_marketing: "Lead Marketing",
  admissions_director: "Admissions Director",
  ceo: "CEO",
};

export function rolesForProfile(
  profile: string | null,
  identityRole: "admin" | "user",
): string[] {
  const roles = profile ? [...(PROFILE_ROLES[profile] ?? [])] : [];
  if (identityRole === "admin" && !roles.includes("Administrator")) {
    roles.push("Administrator", "System Manager");
  }
  return roles;
}

/** Current Better Auth session as the dashboard's `CurrentUser`, or null when signed out. */
export async function nestGetCurrentUser(): Promise<CurrentUser | null> {
  try {
    const me = await nestRequest<NestMe>("/api/v1/me");
    const { data } = me;
    return {
      user: data.email,
      email: data.email,
      full_name: data.name,
      user_image: null,
      roles: rolesForProfile(data.crmProfile, data.identityRole),
      crm_profile: data.crmProfile,
      crm_role: data.crmProfile
        ? (PROFILE_LABELS[data.crmProfile] ?? data.crmProfile)
        : null,
      crm_capabilities: data.crmCapabilities.map(
        (capability) => capability.key,
      ),
      csrf_token: null,
    };
  } catch (error) {
    if (
      error instanceof NestApiError &&
      (error.status === 401 || error.status === 403 || error.status === 503)
    ) {
      return null;
    }
    throw error;
  }
}

export async function nestLoginWithPassword(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await nestRequest("/api/auth/sign-in/email", {
      method: "POST",
      body: { email, password },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof NestApiError) {
      if (error.status === 401 || error.status === 400) {
        return { ok: false, error: "Email hoặc mật khẩu không đúng." };
      }
      if (error.status === 429) {
        return {
          ok: false,
          error: "Thử đăng nhập quá nhiều lần. Vui lòng đợi rồi thử lại.",
        };
      }
      if (error.code === "API_UNAVAILABLE") {
        return {
          ok: false,
          error: "Không kết nối được máy chủ. Vui lòng thử lại.",
        };
      }
    }
    return { ok: false, error: "Đăng nhập thất bại. Vui lòng thử lại." };
  }
}

export async function nestLogout(): Promise<void> {
  try {
    await nestRequest("/api/auth/sign-out", { method: "POST", body: {} });
  } catch {
    // The session may already be gone; the caller routes to /login regardless.
  }
}
