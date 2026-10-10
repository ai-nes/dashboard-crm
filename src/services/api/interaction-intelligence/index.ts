import { NestApiError, nestRequest } from "../nest/nest-client";
import type {
  CreateInteractionInput,
  InteractionCatalog,
  InteractionCatalogItem,
  InteractionDetailResponse,
  InteractionFeedFilters,
  InteractionFeedResponse,
  InteractionNpsPoint,
  InteractionNpsPointResponse,
  NpsSaleSummaryResponse,
  InteractionSummary,
  InteractionTarget,
  InteractionType,
  IntentImportance,
  IntentType,
} from "./types";

export type * from "./types";
export class InteractionIntelligenceApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "InteractionIntelligenceApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeNpsPoint(value: unknown): InteractionNpsPoint | null {
  const item = asRecord(value);
  const name = normalizeString(item?.name);
  const interaction = normalizeString(item?.interaction);
  const status = normalizeString(item?.status);
  if (!name || !interaction || !status) return null;
  return {
    name,
    interaction,
    analysis_run: normalizeString(item?.analysis_run),
    student: normalizeString(item?.student),
    sale: normalizeString(item?.sale),
    sale_user: normalizeString(item?.sale_user),
    agent_id: normalizeString(item?.agent_id),
    interaction_datetime: normalizeString(item?.interaction_datetime),
    source_revision:
      typeof item?.source_revision === "number" ? item.source_revision : null,
    status,
    terminal_reason: normalizeString(item?.terminal_reason),
    satisfaction_score:
      typeof item?.satisfaction_score === "number"
        ? item.satisfaction_score
        : null,
    resolution_score:
      typeof item?.resolution_score === "number" ? item.resolution_score : null,
    friction_score:
      typeof item?.friction_score === "number" ? item.friction_score : null,
    complaint_score:
      typeof item?.complaint_score === "number" ? item.complaint_score : null,
    total_score:
      typeof item?.total_score === "number" ? item.total_score : null,
    normalized_score:
      typeof item?.normalized_score === "number" ? item.normalized_score : null,
    confidence: normalizeString(item?.confidence),
    evidence_refs: asRecord(item?.evidence_refs),
    explanation: normalizeString(item?.explanation),
    policy_revision: normalizeString(item?.policy_revision),
    model_revision: normalizeString(item?.model_revision),
    contract_version: normalizeString(item?.contract_version),
    supersedes: normalizeString(item?.supersedes),
    superseded_by: normalizeString(item?.superseded_by),
  };
}

function normalizeSummary(value: unknown): InteractionSummary | null {
  const item = asRecord(value);
  const id = normalizeString(item?.id);
  const interactionType = normalizeString(item?.interaction_type);
  if (!id || !interactionType) return null;
  const hasEvidence =
    typeof item?.has_evidence === "boolean"
      ? item.has_evidence
      : typeof item?.evidence_available === "boolean"
        ? item.evidence_available
        : false;

  return {
    id,
    occurred_at: normalizeString(item?.occurred_at),
    interaction_type: interactionType,
    interaction_label: normalizeString(item?.interaction_label),
    channel: normalizeString(item?.channel),
    direction: normalizeString(item?.direction),
    outcome: normalizeString(item?.outcome),
    summary: normalizeString(item?.summary),
    episode_state: normalizeString(item?.episode_state),
    analysis_state: normalizeString(item?.analysis_state),
    semantic: asRecord(item?.semantic) as InteractionSummary["semantic"],
    source_type:
      normalizeString(item?.source_type) ??
      normalizeString(item?.reference_doctype),
    source_id:
      normalizeString(item?.source_id) ??
      normalizeString(item?.reference_docname),
    source_revision:
      typeof item?.source_revision === "number" ? item.source_revision : null,
    has_evidence: hasEvidence,
    evidence_available: hasEvidence,
  };
}

function normalizeFeed(value: unknown): InteractionFeedResponse {
  const payload = asRecord(value);
  const rawItems = Array.isArray(payload?.items) ? payload.items : [];
  const items = rawItems
    .map(normalizeSummary)
    .filter((item): item is InteractionSummary => item !== null);

  if (!Array.isArray(payload?.items)) {
    throw new InteractionIntelligenceApiError(
      502,
      "INVALID_INTERACTION_FEED_RESPONSE",
      "Phản hồi danh sách tương tác không hợp lệ.",
    );
  }

  return {
    contract_version: normalizeString(payload?.contract_version) ?? undefined,
    items,
    next_cursor: normalizeString(payload?.next_cursor),
  };
}

function normalizeCatalogItem(value: unknown): InteractionCatalogItem | null {
  const item = asRecord(value);
  const code = normalizeString(item?.code) ?? normalizeString(item?.name);
  if (!code) return null;

  return {
    name: normalizeString(item?.name) ?? undefined,
    code,
    display_name: normalizeString(item?.display_name),
    enabled: Boolean(item?.enabled),
    sort_order: typeof item?.sort_order === "number" ? item.sort_order : 0,
    description: normalizeString(item?.description),
  };
}

function normalizeImportance(value: unknown): IntentImportance {
  return value === "High" || value === "Very High" || value === "Medium"
    ? value
    : "Medium";
}

function normalizeInteractionType(value: unknown): InteractionType | null {
  const item = normalizeCatalogItem(value);
  if (!item) return null;
  return { ...item, sort_order: item.sort_order ?? 0 };
}

function normalizeIntentType(value: unknown): IntentType | null {
  const item = normalizeCatalogItem(value);
  if (!item) return null;
  const rawItem = asRecord(value);
  return {
    ...item,
    importance: normalizeImportance(rawItem?.importance),
    sort_order: item.sort_order ?? 0,
  };
}

function normalizeCatalog<T extends InteractionCatalogItem>(
  value: unknown,
  normalizeItem: (value: unknown) => T | null,
): T[] {
  const payload = value;
  if (!Array.isArray(payload)) return [];
  return payload
    .map(normalizeItem)
    .filter((item): item is T => item !== null)
    .filter((item) => item.enabled)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function assertSingleTarget(target: InteractionTarget): void {
  const hasStudent = Boolean(target.student?.trim());
  const hasContact = Boolean(target.contact?.trim());
  if (hasStudent === hasContact) {
    throw new InteractionIntelligenceApiError(
      400,
      "INVALID_INTERACTION_TARGET",
      "Cần truyền đúng một trong student hoặc contact.",
    );
  }
}

async function nestInteractionRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    query?: Record<string, string | undefined>;
    body?: unknown;
  } = {},
): Promise<T> {
  try {
    return await nestRequest<T>(path, options);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new InteractionIntelligenceApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

export async function listInteractions(
  target: InteractionTarget,
  filters: InteractionFeedFilters = {},
): Promise<InteractionFeedResponse> {
  assertSingleTarget(target);

  if (!target.student) {
    throw new InteractionIntelligenceApiError(
      501,
      "FEATURE_NOT_MIGRATED",
      "Chức năng này chưa có trên máy chủ CRM.",
    );
  }

  const query: Record<string, string> = {
    limit: String(Math.min(Math.max(Math.floor(filters.limit ?? 20), 1), 100)),
  };
  for (const key of [
    "channel",
    "direction",
    "status",
    "family",
    "search",
    "interaction_type",
    "outcome",
    "source_type",
    "source_id",
    "from_date",
    "to_date",
    "cursor",
  ] as const) {
    const value = filters[key];
    if (typeof value === "string" && value.trim()) query[key] = value.trim();
  }

  return normalizeFeed(
    await nestInteractionRequest(
      `/api/v1/students/${encodeURIComponent(target.student.trim())}/interactions`,
      { query },
    ),
  );
}

export async function getInteractionDetail(
  interaction: string,
): Promise<InteractionDetailResponse> {
  const id = interaction.trim();
  if (!id) {
    throw new InteractionIntelligenceApiError(
      400,
      "INVALID_INTERACTION_ID",
      "Thiếu mã tương tác.",
    );
  }

  const payload = asRecord(
    await nestInteractionRequest<unknown>(
      `/api/v1/interactions/${encodeURIComponent(id)}`,
    ),
  );
  const summary = normalizeSummary(payload?.interaction);
  if (!summary) {
    throw new InteractionIntelligenceApiError(
      502,
      "INVALID_INTERACTION_DETAIL_RESPONSE",
      "Phản hồi chi tiết tương tác không hợp lệ.",
    );
  }

  return {
    contract_version: normalizeString(payload?.contract_version) ?? undefined,
    interaction: summary,
    revision:
      (asRecord(payload?.revision) as InteractionDetailResponse["revision"]) ??
      null,
    analysis:
      (asRecord(payload?.analysis) as InteractionDetailResponse["analysis"]) ??
      null,
    intents: Array.isArray(payload?.intents)
      ? (payload.intents as InteractionDetailResponse["intents"])
      : [],
    score_effects: Array.isArray(payload?.score_effects)
      ? (payload.score_effects as InteractionDetailResponse["score_effects"])
      : [],
    evidence_ref: normalizeString(payload?.evidence_ref),
    evidence_refs: Array.isArray(payload?.evidence_refs)
      ? (payload.evidence_refs as InteractionDetailResponse["evidence_refs"])
      : [],
  };
}

export async function getInteractionNpsPoint(
  interaction: string,
): Promise<InteractionNpsPointResponse> {
  const id = interaction.trim();
  if (!id) {
    throw new InteractionIntelligenceApiError(
      400,
      "INVALID_INTERACTION_ID",
      "Thiếu mã tương tác.",
    );
  }
  const payload = asRecord(
    await nestInteractionRequest<unknown>(
      `/api/v1/interactions/${encodeURIComponent(id)}/nps-point`,
    ),
  );
  if (payload?.point === null || payload?.point === undefined)
    return { point: null };
  const point = normalizeNpsPoint(payload?.point);
  if (!point) {
    throw new InteractionIntelligenceApiError(
      502,
      "INVALID_INTERACTION_NPS_RESPONSE",
      "Phản hồi điểm chất lượng cuộc gọi không hợp lệ.",
    );
  }
  return { point };
}

export async function getNpsSaleSummary(
  filters: { sale?: string; from_date?: string; to_date?: string } = {},
): Promise<NpsSaleSummaryResponse> {
  const query: Record<string, string> = {};
  for (const key of ["sale", "from_date", "to_date"] as const) {
    const value = filters[key];
    if (value?.trim()) query[key] = value.trim();
  }
  const payload = asRecord(
    await nestInteractionRequest<unknown>("/api/v1/interactions/nps-summary", {
      query,
    }),
  );
  const records = Array.isArray(payload?.records)
    ? payload.records
        .map((value) => {
          const item = asRecord(value);
          const sale = normalizeString(item?.sale);
          if (!sale) return null;
          return {
            sale,
            sale_user: normalizeString(item?.sale_user),
            count: typeof item?.count === "number" ? item.count : 0,
            average_score:
              typeof item?.average_score === "number" ? item.average_score : 0,
            average_normalized_score:
              typeof item?.average_normalized_score === "number"
                ? item.average_normalized_score
                : 0,
          };
        })
        .filter((value): value is NonNullable<typeof value> => value !== null)
    : [];
  return {
    records,
    total_points:
      typeof payload?.total_points === "number" ? payload.total_points : 0,
  };
}

export async function createInteraction(
  input: CreateInteractionInput,
): Promise<Record<string, unknown>> {
  const student = input.student.trim();
  const interactionType = input.interaction_type.trim();
  if (!student || !interactionType) {
    throw new InteractionIntelligenceApiError(
      400,
      "INVALID_INTERACTION_INPUT",
      "Cần chọn học sinh và loại tương tác.",
    );
  }

  const interactionDatetime = input.interaction_datetime?.trim();
  const outcome = input.outcome?.trim();
  const summary = input.summary?.trim();
  const notes = input.notes?.trim();

  const created = asRecord(
    await nestInteractionRequest<unknown>(
      `/api/v1/students/${encodeURIComponent(student)}/interactions`,
      {
        method: "POST",
        body: {
          interaction_type: interactionType,
          ...(interactionDatetime
            ? { interaction_datetime: interactionDatetime }
            : {}),
          ...(outcome ? { outcome } : {}),
          ...(summary ? { summary } : {}),
          ...(notes ? { notes } : {}),
        },
      },
    ),
  );
  if (!created?.name || typeof created.name !== "string") {
    throw new InteractionIntelligenceApiError(
      502,
      "INVALID_CREATED_INTERACTION_RESPONSE",
      "Phản hồi tạo tương tác không hợp lệ.",
    );
  }

  return created;
}
const NEST_CATALOG_PATHS = {
  "CRM Interaction Type": "/api/v1/reference-data/interaction-types",
  "CRM Intent Type": "/api/v1/reference-data/intent-types",
} as const;

async function getNestCatalogItems<T extends InteractionCatalogItem>(
  doctype: keyof typeof NEST_CATALOG_PATHS,
  normalizeItem: (value: unknown) => T | null,
): Promise<T[]> {
  let raw: unknown;
  try {
    raw = await nestRequest<unknown>(NEST_CATALOG_PATHS[doctype], {
      query: { pageSize: 100 },
    });
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new InteractionIntelligenceApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
  const rows = asRecord(raw)?.data;
  if (!Array.isArray(rows)) return [];
  return normalizeCatalog(
    rows.map((row) => {
      const item = asRecord(row);
      return {
        name: item?.id,
        code: item?.code,
        display_name: item?.displayName,
        enabled: item?.enabled,
        sort_order: item?.sortOrder,
        description: item?.description,
      };
    }),
    normalizeItem,
  );
}

export async function getInteractionCatalog(): Promise<InteractionCatalog> {
  const [interactionTypes, intentTypes] = await Promise.all([
    getNestCatalogItems("CRM Interaction Type", normalizeInteractionType),
    getNestCatalogItems("CRM Intent Type", normalizeIntentType),
  ]);

  return {
    interactionTypes,
    intentTypes,
  };
}
