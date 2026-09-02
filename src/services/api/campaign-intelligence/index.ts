import type { CampaignIntelligenceResponse, CampaignRecord } from "./types";

const METHOD =
  "crm.api.director_campaign_intelligence.get_director_campaign_intelligence";

export type * from "./types";

export class CampaignIntelligenceApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CampaignIntelligenceApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function displayChannel(value: unknown): string {
  const channel = textValue(value);
  const normalized = channel.toLowerCase();
  if (normalized.includes("facebook")) return "Facebook";
  if (normalized.includes("google")) return "Google";
  if (normalized.includes("tiktok")) return "TikTok";
  if (normalized.includes("zalo")) return "Zalo";
  return channel;
}

function getError(payload: unknown): { code?: string; message?: string } {
  const root = asRecord(payload);
  const error =
    asRecord(root?.error) ?? asRecord(asRecord(root?.message)?.error);
  return {
    code: typeof error?.code === "string" ? error.code : undefined,
    message:
      typeof error?.message === "string"
        ? error.message
        : typeof root?.message === "string"
          ? root.message
          : undefined,
  };
}

function normalizeCampaign(row: unknown): CampaignRecord | null {
  const value = asRecord(row);
  if (
    !value ||
    !textValue(value.id) ||
    !textValue(value.name) ||
    !textValue(value.channel)
  )
    return null;
  const health = value.health;
  const confidence = value.attributionConfidence;
  if (
    !["on_track", "watch", "reallocate"].includes(String(health)) ||
    !["high", "medium", "low"].includes(String(confidence))
  )
    return null;
  return {
    id: textValue(value.id),
    name: textValue(value.name),
    channel: displayChannel(value.channel),
    spend: numberValue(value.spend),
    qualifiedLeads: numberValue(value.qualifiedLeads),
    applications: numberValue(value.applications),
    enrollments: numberValue(value.enrollments),
    confirmedRevenue: numberValue(value.confirmedRevenue),
    pipelineRevenue: numberValue(value.pipelineRevenue),
    roas: numberValue(value.roas),
    cpql: numberValue(value.cpql),
    enrollmentRate: numberValue(value.enrollmentRate),
    attributionConfidence:
      confidence as CampaignRecord["attributionConfidence"],
    health: health as CampaignRecord["health"],
  };
}

function normalizeResponse(
  value: unknown,
): CampaignIntelligenceResponse | null {
  const data = asRecord(value);
  const summary = asRecord(data?.summary);
  const recommendation = asRecord(data?.recommendation);
  if (
    !data ||
    !summary ||
    !recommendation ||
    !Array.isArray(data.trend) ||
    !Array.isArray(data.funnel) ||
    !Array.isArray(data.campaigns)
  )
    return null;
  const campaigns = data.campaigns
    .map(normalizeCampaign)
    .filter((row): row is CampaignRecord => row !== null);
  if (campaigns.length !== data.campaigns.length) return null;
  return {
    generatedAt: textValue(data.generatedAt),
    summary: {
      spend: numberValue(summary.spend),
      qualifiedLeads: numberValue(summary.qualifiedLeads),
      applications: numberValue(summary.applications),
      enrollments: numberValue(summary.enrollments),
      confirmedRevenue: numberValue(summary.confirmedRevenue),
      roas: numberValue(summary.roas),
    },
    trend: data.trend.map((row) => {
      const item = asRecord(row);
      return {
        label: textValue(item?.label),
        spend: numberValue(item?.spend),
        confirmedRevenue: numberValue(item?.confirmedRevenue),
      };
    }),
    funnel: data.funnel.map((row) => {
      const item = asRecord(row);
      return {
        label: textValue(item?.label),
        count: numberValue(item?.value),
        ...(typeof item?.rate === "number" && Number.isFinite(item.rate)
          ? { conversionRate: item.rate }
          : {}),
      };
    }),
    campaigns,
    recommendation: {
      title: textValue(recommendation.title),
      impact: numberValue(recommendation.impact),
      confidence: ["high", "medium", "low"].includes(
        String(recommendation.confidence),
      )
        ? (recommendation.confidence as CampaignRecord["attributionConfidence"])
        : "low",
      evidence: Array.isArray(recommendation.evidence)
        ? recommendation.evidence.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
    },
  };
}

export async function getCampaignIntelligence(): Promise<CampaignIntelligenceResponse> {
  const baseUrl = (process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );
  if (!baseUrl)
    throw new CampaignIntelligenceApiError(
      0,
      "FRAPPE_URL_MISSING",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/method/${METHOD}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new CampaignIntelligenceApiError(
      503,
      "CAMPAIGN_INTELLIGENCE_DATA_UNAVAILABLE",
      "Không thể kết nối tới dữ liệu campaign intelligence.",
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = getError(payload);
    throw new CampaignIntelligenceApiError(
      response.status,
      error.code ?? "CAMPAIGN_INTELLIGENCE_DATA_UNAVAILABLE",
      error.message ?? `Lỗi HTTP ${response.status}: ${response.statusText}`,
    );
  }
  const data = normalizeResponse(asRecord(payload)?.message);
  if (!data)
    throw new CampaignIntelligenceApiError(
      502,
      "INVALID_CAMPAIGN_RESPONSE",
      "Phản hồi campaign intelligence không hợp lệ.",
    );
  return data;
}
