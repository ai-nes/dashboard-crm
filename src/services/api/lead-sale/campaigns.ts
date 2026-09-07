export interface LeadSaleCampaign {
  name: string;
  stableCode: string;
  title: string;
  status: string;
  campus?: string;
  startDate?: string;
  endDate?: string;
  channelBoundary?: string;
  channelType?: string;
  channelUrl?: string;
}

export interface CampaignListResponse {
  campaigns: LeadSaleCampaign[];
  total: number;
}

export interface CampaignListParams {
  search?: string;
  start?: number;
  pageLength?: number;
  leadOnly?: boolean;
  channelType?: string;
}

export interface CreateCampaignPayload {
  title: string;
  campus: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  channelBoundary?: string;
  channelType?: string;
  channelUrl?: string;
}

export interface UpdateCampaignPayload {
  name: string;
  stableCode?: string;
  title?: string;
  campus?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  channelBoundary?: string;
  channelType?: string;
  channelUrl?: string;
}

export interface CampaignApiRequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export class CampaignApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CampaignApiError";
  }
}

const METHODS = {
  LIST: "crm.api.campaign.list_campaigns",
  DETAIL: "crm.api.campaign.get_campaign",
  CREATE: "crm.api.campaign.create_campaign",
  UPDATE: "crm.api.campaign.update_campaign",
} as const;
const DEFAULT_PAGE_LENGTH = 100;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message !== undefined ? root.message : value;
}

function normalizeCampaign(value: unknown): LeadSaleCampaign | null {
  const row = asRecord(value);
  const name = text(row?.name);
  if (!name) return null;
  const startDate = text(row?.startDate ?? row?.start_date);
  const endDate = text(row?.endDate ?? row?.end_date);
  const channelBoundary = text(row?.channelBoundary ?? row?.channel_boundary);
  const channelType = text(row?.channelType ?? row?.channel_type);
  const channelUrl = text(row?.channelUrl ?? row?.channel_url);
  return {
    name,
    stableCode: text(row?.stableCode ?? row?.stable_code),
    title: text(row?.title, name),
    status: text(row?.status),
    ...(text(row?.campus) ? { campus: text(row?.campus) } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(channelBoundary ? { channelBoundary } : {}),
    ...(channelType ? { channelType } : {}),
    ...(channelUrl ? { channelUrl } : {}),
  };
}

export function normalizeCampaignList(value: unknown): CampaignListResponse {
  const payload = asRecord(unwrapMessage(value));
  if (!payload || !Array.isArray(payload.campaigns)) {
    throw new Error("Invalid Campaign list response");
  }

  const campaigns = payload.campaigns
    .map(normalizeCampaign)
    .filter((campaign): campaign is LeadSaleCampaign => campaign !== null);

  if (campaigns.length !== payload.campaigns.length) {
    throw new Error("Invalid Campaign list response");
  }

  return {
    campaigns,
    total: count(payload.total),
  };
}

function resolveBaseUrl(options: CampaignApiRequestOptions): string {
  return (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );
}

function frappeCookieHeader(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function requestHeaders(
  options: CampaignApiRequestOptions,
  isWrite = false,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(isWrite ? { "Content-Type": "application/json" } : {}),
    ...(options.headers ?? {}),
  };
  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Contract tests and non-request contexts do not have Next headers.
    }
  }

  if (typeof window !== "undefined" && isWrite) {
    const cookieToken = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="))
      ?.split("=")
      .slice(1)
      .join("=");
    if (cookieToken) {
      headers["X-Frappe-CSRF-Token"] = decodeURIComponent(cookieToken);
    } else {
      try {
        const sessionResponse = await fetch(
          `${resolveBaseUrl(options)}/api/method/crm.api.session.me`,
          { credentials: "include", headers: { Accept: "application/json" } },
        );
        const sessionPayload = (await sessionResponse
          .json()
          .catch(() => null)) as {
          message?: { csrf_token?: unknown };
        } | null;
        const csrfToken = sessionPayload?.message?.csrf_token;
        if (typeof csrfToken === "string" && csrfToken) {
          headers["X-Frappe-CSRF-Token"] = csrfToken;
        }
      } catch {
        // Fallback to cookie-only authentication.
      }
    }
  }

  return headers;
}

function errorDetails(
  value: unknown,
  status: number,
): { code: string; message: string } {
  const root = asRecord(value);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);
  const serverMessage = parseFrappeServerMessage(root?._server_messages);
  const fallbackMessage =
    status === 401
      ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      : status === 403
        ? "Bạn không có quyền thực hiện thao tác này với chiến dịch."
        : status === 417
          ? "Thông tin chiến dịch chưa hợp lệ."
          : `Không thể tải danh sách campaign (${status}).`;
  return {
    code:
      text(error?.code) ||
      (status === 401
        ? "UNAUTHENTICATED"
        : status === 403
          ? "FORBIDDEN"
          : `HTTP_${status}`),
    message:
      text(error?.message) ||
      text(message?.message) ||
      (status === 403 ? fallbackMessage : serverMessage) ||
      text(root?._error_message) ||
      text(root?.message) ||
      text(root?.exception) ||
      fallbackMessage,
  };
}

function parseFrappeServerMessage(value: unknown): string {
  if (typeof value !== "string") return "";

  try {
    const messages = JSON.parse(value);
    if (!Array.isArray(messages)) return "";
    const message = messages.find(
      (item): item is Record<string, unknown> =>
        item && typeof item === "object" && typeof item.message === "string",
    )?.message;
    return typeof message === "string"
      ? message.replace(/<[^>]*>/g, "").trim()
      : "";
  } catch {
    return "";
  }
}

async function callCampaignApi<T>(
  method: string,
  requestMethod: "GET" | "POST" | "PUT",
  options: CampaignApiRequestOptions,
  body?: Record<string, unknown>,
  queryParams?: URLSearchParams,
): Promise<T> {
  const baseUrl = resolveBaseUrl(options);
  if (!baseUrl) {
    throw new CampaignApiError(
      503,
      "CAMPAIGN_API_UNAVAILABLE",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }

  let response: Response;
  try {
    const query = queryParams?.toString();
    response = await fetch(
      `${baseUrl}/api/method/${method}${query ? `?${query}` : ""}`,
      {
        method: requestMethod,
        headers: await requestHeaders(options, requestMethod !== "GET"),
        ...(typeof window !== "undefined"
          ? { credentials: "include" as RequestCredentials }
          : {}),
        cache: "no-store",
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
  } catch {
    throw new CampaignApiError(
      503,
      "CAMPAIGN_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ campaign.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload, response.status);
    throw new CampaignApiError(response.status, details.code, details.message);
  }
  return (asRecord(payload)?.message ?? payload) as T;
}

function normalizeCampaignRecord(value: unknown): LeadSaleCampaign {
  const campaign = normalizeCampaign(value);
  if (!campaign) throw new Error("Invalid campaign response");
  return campaign;
}

function toCreateBody(payload: CreateCampaignPayload): Record<string, unknown> {
  return {
    title: payload.title,
    campus: payload.campus,
    ...(payload.status ? { status: payload.status } : {}),
    ...(payload.startDate ? { start_date: payload.startDate } : {}),
    ...(payload.endDate ? { end_date: payload.endDate } : {}),
    ...(payload.channelBoundary
      ? { channel_boundary: payload.channelBoundary }
      : {}),
    ...(payload.channelType ? { channel_type: payload.channelType } : {}),
    ...(payload.channelUrl ? { channel_url: payload.channelUrl } : {}),
  };
}

function toUpdateBody(payload: UpdateCampaignPayload): Record<string, unknown> {
  return {
    name: payload.name,
    ...(payload.stableCode !== undefined
      ? { stable_code: payload.stableCode }
      : {}),
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.campus !== undefined ? { campus: payload.campus } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.startDate !== undefined
      ? { start_date: payload.startDate }
      : {}),
    ...(payload.endDate !== undefined ? { end_date: payload.endDate } : {}),
    ...(payload.channelBoundary !== undefined
      ? { channel_boundary: payload.channelBoundary }
      : {}),
    ...(payload.channelType !== undefined
      ? { channel_type: payload.channelType }
      : {}),
    ...(payload.channelUrl !== undefined
      ? { channel_url: payload.channelUrl }
      : {}),
  };
}

export async function getCampaignList(
  params: CampaignListParams = {},
  options: CampaignApiRequestOptions = {},
): Promise<CampaignListResponse> {
  const baseUrl = resolveBaseUrl(options);
  if (!baseUrl) {
    throw new CampaignApiError(
      503,
      "CAMPAIGN_API_UNAVAILABLE",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }

  const search = params.search?.trim();
  const pageLength = Math.max(
    1,
    Math.floor(
      Number.isFinite(params.pageLength)
        ? params.pageLength!
        : DEFAULT_PAGE_LENGTH,
    ),
  );
  let nextStart = Math.max(
    0,
    Math.floor(Number.isFinite(params.start) ? params.start! : 0),
  );
  const campaigns: LeadSaleCampaign[] = [];
  let total = 0;

  while (true) {
    const searchParams = new URLSearchParams({
      start: String(nextStart),
      page_length: String(pageLength),
    });
    if (search) searchParams.set("search", search);
    if (params.leadOnly) searchParams.set("lead_only", "1");
    if (params.channelType)
      searchParams.set("channel_type", params.channelType);

    const url = `${baseUrl}/api/method/${METHODS.LIST}?${searchParams.toString()}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: await requestHeaders(options),
        ...(typeof window !== "undefined"
          ? { credentials: "include" as RequestCredentials }
          : {}),
        cache: "no-store",
      });
    } catch {
      throw new CampaignApiError(
        503,
        "CAMPAIGN_API_UNAVAILABLE",
        "Không thể kết nối đến máy chủ campaign.",
      );
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = errorDetails(payload, response.status);
      throw new CampaignApiError(
        response.status,
        details.code,
        details.message,
      );
    }

    let page: CampaignListResponse;
    try {
      page = normalizeCampaignList(payload);
    } catch {
      throw new CampaignApiError(
        502,
        "INVALID_CAMPAIGN_LIST_RESPONSE",
        "Phản hồi danh sách campaign không hợp lệ.",
      );
    }

    campaigns.push(...page.campaigns);
    total = page.total;
    if (
      page.campaigns.length < pageLength ||
      nextStart + page.campaigns.length >= total
    ) {
      break;
    }
    nextStart += page.campaigns.length;
  }

  return { campaigns, total };
}

export async function createCampaign(
  payload: CreateCampaignPayload,
  options: CampaignApiRequestOptions = {},
): Promise<LeadSaleCampaign> {
  try {
    const raw = await callCampaignApi<unknown>(
      METHODS.CREATE,
      "POST",
      options,
      toCreateBody(payload),
    );
    return normalizeCampaignRecord(raw);
  } catch (error) {
    if (error instanceof CampaignApiError) throw error;
    throw new CampaignApiError(
      502,
      "INVALID_CAMPAIGN_RESPONSE",
      "Phản hồi campaign vừa tạo không hợp lệ.",
    );
  }
}

export async function getCampaign(
  name: string,
  options: CampaignApiRequestOptions = {},
): Promise<LeadSaleCampaign | null> {
  const campaignName = name.trim();
  if (!campaignName) {
    throw new CampaignApiError(
      400,
      "INVALID_CAMPAIGN_NAME",
      "Mã campaign không được để trống.",
    );
  }

  try {
    const raw = await callCampaignApi<unknown>(
      METHODS.DETAIL,
      "GET",
      options,
      undefined,
      new URLSearchParams({ name: campaignName }),
    );
    return normalizeCampaignRecord(raw);
  } catch (error) {
    if (error instanceof CampaignApiError && error.status === 404) return null;
    if (error instanceof CampaignApiError) throw error;
    throw new CampaignApiError(
      502,
      "INVALID_CAMPAIGN_RESPONSE",
      "Phản hồi chi tiết campaign không hợp lệ.",
    );
  }
}

export async function updateCampaign(
  payload: UpdateCampaignPayload,
  options: CampaignApiRequestOptions = {},
): Promise<LeadSaleCampaign> {
  try {
    const raw = await callCampaignApi<unknown>(
      METHODS.UPDATE,
      "PUT",
      options,
      toUpdateBody(payload),
    );
    return normalizeCampaignRecord(raw);
  } catch (error) {
    if (error instanceof CampaignApiError) throw error;
    throw new CampaignApiError(
      502,
      "INVALID_CAMPAIGN_RESPONSE",
      "Phản hồi campaign vừa cập nhật không hợp lệ.",
    );
  }
}
