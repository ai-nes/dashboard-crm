/**
 * Lead operations against the NestJS backend. Each function returns a payload
 * shaped for the existing `normalizeLead*` helpers in `leads.ts`, so the UI
 * keeps its types and only the transport changes.
 */
import { nestRequest } from "../nest/nest-client";

interface Envelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

type LeadRecord = Record<string, unknown> & { id: string };

interface TimelineItem {
  id: string;
  type: "note" | "call" | "interaction" | "status" | "ownership";
  occurredAt: string;
  author: string;
  title: string;
  content: string;
  channel: string | null;
  outcome: string | null;
}

const POTENTIAL_TO_API: Record<string, string> = {
  cao: "high",
  "trung bình": "medium",
  thấp: "low",
  "chưa xác định": "unknown",
  high: "high",
  medium: "medium",
  low: "low",
  unknown: "unknown",
};

/** Frappe-style snake_case lead fields -> Nest request body. Empty values are omitted. */
const FIELD_MAP: Record<string, string> = {
  student_name: "studentName",
  phone: "phone",
  email: "email",
  other_email: "otherEmail",
  province: "provinceId",
  ward: "wardId",
  high_school: "highSchoolId",
  major: "majorId",
  aspiration: "aspirationId",
  admission_year: "admissionYearId",
  branch: "campusId",
  advertising_channel: "advertisingChannel",
  notes: "notes",
  campaign: "campaignId",
};

function parseSegments(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    // Fall through to comma-separated text.
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toNestLeadBody(
  fields: Record<string, string | null | undefined>,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value.trim() === "") continue;
    if (key === "conversion_potential") {
      const mapped = POTENTIAL_TO_API[value.trim().toLowerCase()];
      if (mapped) body.conversionPotential = mapped;
    } else if (key === "segments") {
      body.segments = parseSegments(value);
    } else if (FIELD_MAP[key]) {
      body[FIELD_MAP[key]] = value.trim();
    }
  }
  return body;
}

function logEntries(items: TimelineItem[]) {
  return items.map((item) => ({
    id: item.id,
    type: item.type === "note" ? "note" : "activity",
    title: item.title,
    author: item.author,
    date: item.occurredAt,
    content: item.content,
    eventType: item.type,
    category: item.channel,
    reason: item.type === "status" ? item.content : null,
  }));
}

export async function nestLeadList(params: {
  admissionYear?: number;
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  resolution?: string;
  campaign?: string;
  order?: string;
}): Promise<unknown> {
  return nestRequest("/api/v1/leads", {
    query: {
      admissionYear: params.admissionYear,
      page: params.page,
      pageSize: params.pageSize,
      q: params.q,
      status: params.status,
      resolution: params.resolution,
      campaign: params.campaign,
      order: params.order,
    },
  });
}

export async function nestLeadDetail(id: string): Promise<unknown> {
  const [lead, timeline] = await Promise.all([
    nestRequest<Envelope<LeadRecord>>(
      `/api/v1/leads/${encodeURIComponent(id)}`,
    ),
    nestRequest<Envelope<TimelineItem[]>>(
      `/api/v1/leads/${encodeURIComponent(id)}/timeline`,
    ),
  ]);
  return {
    lead: lead.data,
    log: logEntries(timeline.data),
    meta: { asOf: lead.data.modifiedAt ?? null },
  };
}

export async function nestCreateLead(
  fields: Record<string, string | null | undefined>,
): Promise<unknown> {
  const created = await nestRequest<Envelope<LeadRecord>>("/api/v1/leads", {
    method: "POST",
    body: toNestLeadBody(fields),
  });
  return nestLeadDetail(created.data.id);
}

export async function nestUpdateLead(
  id: string,
  fields: Record<string, string | null | undefined>,
): Promise<unknown> {
  const current = await nestRequest<Envelope<LeadRecord>>(
    `/api/v1/leads/${encodeURIComponent(id)}`,
  );
  await nestRequest(`/api/v1/leads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: {
      ...toNestLeadBody(fields),
      expectedRevision: current.data.revision,
    },
  });
  return nestLeadDetail(id);
}

export async function nestDeleteLead(id: string): Promise<void> {
  await nestRequest(`/api/v1/leads/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

interface ProcessData {
  id: string;
  status: string;
  resolution: string;
  validation?: Record<string, boolean>;
}

function processPayload(data: ProcessData) {
  return {
    status: data.status,
    resolution: data.resolution,
    lead: data.id,
    targetStudent: null,
    validation: data.validation ?? {},
  };
}

export async function nestProcessLead(id: string): Promise<unknown> {
  const result = await nestRequest<Envelope<ProcessData>>(
    `/api/v1/leads/${encodeURIComponent(id)}/process`,
    { method: "POST" },
  );
  return processPayload(result.data);
}

export async function nestSetLeadStatus(
  id: string,
  status: string,
  reason?: string,
): Promise<unknown> {
  const result = await nestRequest<Envelope<ProcessData>>(
    `/api/v1/leads/${encodeURIComponent(id)}/status`,
    { method: "POST", body: { status, ...(reason ? { reason } : {}) } },
  );
  return processPayload(result.data);
}

export async function nestReopenLead(
  id: string,
  reason?: string,
): Promise<unknown> {
  const result = await nestRequest<Envelope<ProcessData>>(
    `/api/v1/leads/${encodeURIComponent(id)}/reopen`,
    { method: "POST", body: reason ? { reason } : {} },
  );
  return processPayload(result.data);
}

export async function nestAssignmentTargets(id: string): Promise<unknown> {
  const result = await nestRequest<Envelope<Record<string, unknown>>>(
    `/api/v1/leads/${encodeURIComponent(id)}/assignment-targets`,
  );
  return result.data;
}

export async function nestAssignLead(request: {
  lead: string;
  ownerStaff: string;
  targetTeamId: string;
  expectedRevision: number;
  reason?: string;
}): Promise<unknown> {
  const result = await nestRequest<Envelope<LeadRecord>>(
    `/api/v1/leads/${encodeURIComponent(request.lead)}/assign`,
    {
      method: "POST",
      body: {
        ownerUserId: request.ownerStaff,
        ...(request.targetTeamId && request.targetTeamId !== "none"
          ? { owningTeamId: request.targetTeamId }
          : {}),
        reason: request.reason ?? "Phân công thủ công.",
        expectedRevision: request.expectedRevision,
      },
    },
  );
  return {
    status: "ASSIGNED",
    resolution: "PENDING",
    lead: request.lead,
    ownership: {
      ownerStaff: result.data.ownerUserId ?? null,
      owningTeam: result.data.owningTeamId ?? null,
      revision: result.data.revision ?? 0,
    },
  };
}

export async function nestInspectLeadImport(file: File): Promise<unknown> {
  const body = new FormData();
  body.append("file", file, file.name);
  return nestRequest("/api/v1/leads/import/inspect", { method: "POST", body });
}

export async function nestPreviewLeadImport(
  file: File,
  campaignCode: string | undefined,
  mapping: unknown,
): Promise<unknown> {
  const body = new FormData();
  body.append("file", file, file.name);
  if (campaignCode) body.append("campaign_code", campaignCode);
  if (mapping) body.append("column_mapping", JSON.stringify(mapping));
  return nestRequest("/api/v1/leads/import/preview", { method: "POST", body });
}

export async function nestImportLeadFile(
  file: File,
  campaignCode: string,
  mapping: unknown,
): Promise<unknown> {
  const body = new FormData();
  body.append("file", file, file.name);
  body.append("campaign_code", campaignCode);
  body.append("column_mapping", JSON.stringify(mapping));
  return nestRequest("/api/v1/leads/import", { method: "POST", body });
}

export async function nestImportLeadRows(
  rows: Record<string, unknown>[],
  filename: string,
  campaignCode: string,
): Promise<unknown> {
  return nestRequest("/api/v1/leads/import", {
    method: "POST",
    body: { rows, filename, campaign_code: campaignCode },
  });
}
