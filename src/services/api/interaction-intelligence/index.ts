import { nestRequest, toServiceError } from "../nest/nest-client";
import type {
  CreateInteractionInput,
  InteractionCatalog,
  InteractionCatalogItem,
  InteractionDetailResponse,
  InteractionFeedFilters,
  InteractionFeedResponse,
  InteractionNpsPoint,
  InteractionNpsPointResponse,
  NpsHistoryFilters,
  NpsHistoryPoint,
  NpsHistoryResponse,
  NpsSaleSummary,
  NpsSummaryFilters,
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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isScore(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 1 && value <= 10;
}

function isNormalizedScore(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 100;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function isIsoDateTime(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function isConfidence(
  value: unknown,
): value is "low" | "medium" | "high" | null {
  return (
    value === null ||
    value === "low" ||
    value === "medium" ||
    value === "high"
  );
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function invalidNpsResponse(code: string): never {
  throw new InteractionIntelligenceApiError(
    502,
    code,
    "Phản hồi điểm chất lượng cuộc gọi không hợp lệ.",
  );
}

function normalizeNpsScope(value: unknown): "own" | "team" | "all" | null {
  return value === "own" || value === "team" || value === "all" ? value : null;
}

function readNpsFilters(
  filters: NpsSummaryFilters | NpsHistoryFilters,
): Record<string, string> {
  const query: Record<string, string> = {};
  for (const key of ["sale", "from_date", "to_date"] as const) {
    const value = filters[key];
    if (value?.trim()) query[key] = value.trim();
  }
  return query;
}

function normalizeNpsPoint(value: unknown): InteractionNpsPoint | null {
  const item = asRecord(value);
  const name = normalizeString(item?.name);
  const interaction = normalizeString(item?.interaction);
  const sale = normalizeString(item?.sale);
  const saleUser = normalizeString(item?.sale_user);
  const interactionDatetime = item?.interaction_datetime;
  const status = normalizeString(item?.status);
  if (
    !item ||
    !name ||
    !interaction ||
    !sale ||
    !saleUser ||
    !isIsoDateTime(interactionDatetime) ||
    !isNonNegativeInteger(item.source_revision) ||
    !isConfidence(item.confidence) ||
    (status !== "scored" && status !== "abstained") ||
    ![
      "satisfaction_score",
      "resolution_score",
      "friction_score",
      "complaint_score",
      "total_score",
      "normalized_score",
    ].every((key) => hasOwn(item, key))
  ) {
    return null;
  }

  const scores = [
    item.satisfaction_score,
    item.resolution_score,
    item.friction_score,
    item.complaint_score,
    item.total_score,
  ];
  const normalizedScore = item.normalized_score;
  const scored = status === "scored";
  if (
    (scored && (!scores.every(isScore) || !isNormalizedScore(normalizedScore))) ||
    (!scored &&
      (!scores.every((score) => score === null) || normalizedScore !== null))
  ) {
    return null;
  }

  return {
    name,
    interaction,
    sale,
    sale_user: saleUser,
    interaction_datetime: interactionDatetime,
    source_revision: item.source_revision,
    status,
    satisfaction_score: item.satisfaction_score as number | null,
    resolution_score: item.resolution_score as number | null,
    friction_score: item.friction_score as number | null,
    complaint_score: item.complaint_score as number | null,
    total_score: item.total_score as number | null,
    normalized_score: normalizedScore as number | null,
    confidence: item.confidence,
  };
}

function normalizeNpsSummary(value: unknown): NpsSaleSummaryResponse {
  const payload = asRecord(value);
  const scope = normalizeNpsScope(payload?.scope);
  const averageScore = payload?.average_score;
  const averageNormalizedScore = payload?.average_normalized_score;
  if (
    !payload ||
    !Array.isArray(payload.records) ||
    !isNonNegativeInteger(payload.total_points) ||
    (averageScore !== null && !isScore(averageScore)) ||
    (averageNormalizedScore !== null &&
      !isNormalizedScore(averageNormalizedScore)) ||
    !scope ||
    payload.timezone !== "Asia/Ho_Chi_Minh"
  ) {
    return invalidNpsResponse("INVALID_INTERACTION_NPS_SUMMARY_RESPONSE");
  }

  const records: NpsSaleSummary[] = payload.records.map((value) => {
    const item = asRecord(value);
    const sale = normalizeString(item?.sale);
    const saleUser = normalizeString(item?.sale_user);
    const count = item?.count;
    const average = item?.average_score;
    const normalizedAverage = item?.average_normalized_score;
    if (
      !item ||
      !sale ||
      !isPositiveInteger(count) ||
      !isScore(average) ||
      !isNormalizedScore(normalizedAverage) ||
      !saleUser
    ) {
      return invalidNpsResponse("INVALID_INTERACTION_NPS_SUMMARY_RESPONSE");
    }
    return {
      sale,
      sale_user: saleUser,
      count,
      average_score: average,
      average_normalized_score: normalizedAverage,
    };
  });

  if (
    records.reduce((total, record) => total + record.count, 0) !==
      payload.total_points ||
    (payload.total_points === 0) !== (payload.average_score === null) ||
    (payload.total_points === 0) !==
      (payload.average_normalized_score === null)
  ) {
    return invalidNpsResponse("INVALID_INTERACTION_NPS_SUMMARY_RESPONSE");
  }

  return {
    records,
    total_points: payload.total_points,
    average_score: averageScore,
    average_normalized_score: averageNormalizedScore,
    scope,
    timezone: "Asia/Ho_Chi_Minh",
  };
}

function normalizeNpsHistoryPoint(value: unknown): NpsHistoryPoint | null {
  const item = asRecord(value);
  const name = normalizeString(item?.name);
  const interaction = normalizeString(item?.interaction);
  const interactionDatetime = item?.interaction_datetime;
  const sale = normalizeString(item?.sale);
  const saleUser = normalizeString(item?.sale_user);
  if (
    !name ||
    !interaction ||
    !isIsoDateTime(interactionDatetime) ||
    !sale ||
    !saleUser ||
    item?.status !== "scored" ||
    !isNonNegativeInteger(item.source_revision) ||
    !isScore(item.satisfaction_score) ||
    !isScore(item.resolution_score) ||
    !isScore(item.friction_score) ||
    !isScore(item.complaint_score) ||
    !isScore(item.total_score) ||
    !isNormalizedScore(item.normalized_score) ||
    !isConfidence(item.confidence)
  ) {
    return null;
  }

  return {
    name,
    interaction,
    interaction_datetime: interactionDatetime,
    source_revision: item.source_revision,
    sale,
    sale_user: saleUser,
    status: "scored",
    satisfaction_score: item.satisfaction_score,
    resolution_score: item.resolution_score,
    friction_score: item.friction_score,
    complaint_score: item.complaint_score,
    total_score: item.total_score,
    normalized_score: item.normalized_score,
    confidence: item.confidence,
  };
}

function normalizeNpsHistory(value: unknown): NpsHistoryResponse {
  const payload = asRecord(value);
  const scope = normalizeNpsScope(payload?.scope);
  if (
    !payload ||
    !Array.isArray(payload.items) ||
    (payload.next_cursor !== null && typeof payload.next_cursor !== "string") ||
    !scope ||
    payload.timezone !== "Asia/Ho_Chi_Minh"
  ) {
    return invalidNpsResponse("INVALID_INTERACTION_NPS_HISTORY_RESPONSE");
  }
  const items = payload.items.map(normalizeNpsHistoryPoint);
  if (items.some((item) => item === null)) {
    return invalidNpsResponse("INVALID_INTERACTION_NPS_HISTORY_RESPONSE");
  }
  return {
    items: items as NpsHistoryPoint[],
    next_cursor: normalizeString(payload.next_cursor),
    scope,
    timezone: "Asia/Ho_Chi_Minh",
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
    throw toServiceError(error, InteractionIntelligenceApiError);
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
  if (!payload || !hasOwn(payload, "point") || payload.point === undefined) {
    return invalidNpsResponse("INVALID_INTERACTION_NPS_RESPONSE");
  }
  if (payload.point === null)
    return { point: null };
  const point = normalizeNpsPoint(payload.point);
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
  filters: NpsSummaryFilters = {},
): Promise<NpsSaleSummaryResponse> {
  const payload = await nestInteractionRequest<unknown>(
    "/api/v1/interactions/nps-summary",
    { query: readNpsFilters(filters) },
  );
  return normalizeNpsSummary(payload);
}

export async function getNpsHistory(
  filters: NpsHistoryFilters = {},
): Promise<NpsHistoryResponse> {
  const limit = Number.isFinite(filters.limit)
    ? Math.min(Math.max(Math.floor(filters.limit ?? 10), 1), 100)
    : 10;
  const query = {
    ...readNpsFilters(filters),
    limit: String(limit),
    ...(filters.cursor?.trim() ? { cursor: filters.cursor.trim() } : {}),
  };
  const payload = await nestInteractionRequest<unknown>(
    "/api/v1/interactions/nps-history",
    { query },
  );
  return normalizeNpsHistory(payload);
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
      throw toServiceError(error, InteractionIntelligenceApiError);
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
