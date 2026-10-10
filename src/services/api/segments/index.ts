import { NestApiError } from "../nest/nest-client";
import { nestSegmentRequest } from "../nest/nest-segment-router";
import type {
  CreateSegmentPayload,
  DeleteSegmentPayload,
  ListSegmentsParams,
  ListSegmentsResponse,
  ClassificationGroupListResponse,
  ClassificationTermListResponse,
  SegmentFieldDefinition,
  SegmentAnalysisResponse,
  SegmentFilterOptionsResponse,
  SegmentPreviewParams,
  SegmentPreviewResponse,
  SegmentRecord,
  SegmentStatus,
  SegmentTermRecord,
  UpdateSegmentPayload,
  TransitionSegmentPayload,
  ClassificationGroupPayload,
  ClassificationGroupRecord,
  DeleteClassificationGroupPayload,
  TransitionClassificationGroupPayload,
  UpdateClassificationGroupPayload,
  ClassificationTermPayload,
  DeleteClassificationTermPayload,
  TransitionClassificationTermPayload,
  UpdateClassificationTermPayload,
} from "./types";

export type * from "./types";

const METHODS = {
  FIELDS: "crm.api.student_segment.get_fields",
  LIST: "crm.api.student_segment.list_segments",
  LIST_PAGE: "crm.api.student_segment.list_segments_page",
  GET: "crm.api.student_segment.get_segment",
  GET_BY_CODE: "crm.api.student_segment.get_segment_by_code",
  ANALYSIS: "crm.api.student_segment.get_segment_analysis",
  PREVIEW: "crm.api.student_segment.preview_segment",
  CREATE: "crm.api.student_segment.create_segment",
  UPDATE: "crm.api.student_segment.update_segment",
  TRANSITION: "crm.api.student_segment.transition_segment",
  DELETE: "crm.api.student_segment.delete_segment",
  NEEDS: "crm.api.student_classification.list_needs",
  NEEDS_PAGE: "crm.api.student_classification.list_needs_page",
  TAGS: "crm.api.student_classification.list_tags",
  TAGS_PAGE: "crm.api.student_classification.list_tags_page",
  NEED_GROUPS: "crm.api.student_classification.list_need_groups",
  NEED_GROUPS_PAGE: "crm.api.student_classification.list_need_groups_page",
  TAG_GROUPS: "crm.api.student_classification.list_tag_group_definitions",
  TAG_GROUPS_PAGE: "crm.api.student_classification.list_tag_groups_page",
  CREATE_NEED_GROUP: "crm.api.student_classification.create_need_group",
  UPDATE_NEED_GROUP: "crm.api.student_classification.update_need_group",
  TRANSITION_NEED_GROUP: "crm.api.student_classification.transition_need_group",
  DELETE_NEED_GROUP: "crm.api.student_classification.delete_need_group",
  CREATE_TAG_GROUP: "crm.api.student_classification.create_tag_group",
  UPDATE_TAG_GROUP: "crm.api.student_classification.update_tag_group",
  TRANSITION_TAG_GROUP: "crm.api.student_classification.transition_tag_group",
  DELETE_TAG_GROUP: "crm.api.student_classification.delete_tag_group",
  CREATE_NEED: "crm.api.student_classification.create_need",
  UPDATE_NEED: "crm.api.student_classification.update_need",
  TRANSITION_NEED: "crm.api.student_classification.transition_need",
  DELETE_NEED: "crm.api.student_classification.delete_need",
  CREATE_TAG: "crm.api.student_classification.create_tag",
  UPDATE_TAG: "crm.api.student_classification.update_tag",
  TRANSITION_TAG: "crm.api.student_classification.transition_tag",
  DELETE_TAG: "crm.api.student_classification.delete_tag",
} as const;

export class SegmentApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "SegmentApiError";
  }
}

async function callSegmentApi<T>(
  method: string,
  query: Record<string, string | number | undefined> = {},
  body?: Record<string, unknown>,
): Promise<T> {
  try {
    return await nestSegmentRequest<T>(method, query, body);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new SegmentApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}
export async function getSegmentFields(): Promise<SegmentFieldDefinition[]> {
  return callSegmentApi<SegmentFieldDefinition[]>(METHODS.FIELDS);
}

export async function listSegmentTerms(
  kind: "need" | "tag",
): Promise<SegmentTermRecord[]> {
  return callSegmentApi<SegmentTermRecord[]>(
    kind === "need" ? METHODS.NEEDS : METHODS.TAGS,
    { status: "active", start: 0, page_length: 100 },
  );
}

export async function getSegmentFilterOptions(): Promise<SegmentFilterOptionsResponse> {
  const [fields, needs, tags] = await Promise.all([
    getSegmentFields(),
    listSegmentTerms("need"),
    listSegmentTerms("tag"),
  ]);
  return { fields, needs, tags };
}

export async function listSegments(
  params: ListSegmentsParams = {},
): Promise<SegmentRecord[]> {
  return callSegmentApi<SegmentRecord[]>(METHODS.LIST, {
    status: params.status,
    category: params.category,
    search: params.search?.trim(),
    start: params.start ?? 0,
    page_length: params.pageLength ?? 20,
  });
}

export async function listSegmentsPage(
  params: ListSegmentsParams = {},
): Promise<ListSegmentsResponse> {
  const raw = await callSegmentApi<Record<string, unknown>>(METHODS.LIST_PAGE, {
    status: params.status,
    category: params.category,
    search: params.search?.trim(),
    start: params.start ?? 0,
    page_length: params.pageLength ?? 20,
  });
  const segments = Array.isArray(raw.segments)
    ? (raw.segments as SegmentRecord[])
    : [];
  return {
    segments,
    total: Number(raw.total ?? segments.length),
    start: Number(raw.start ?? params.start ?? 0),
    pageLength: Number(
      raw.pageLength ?? raw.page_length ?? params.pageLength ?? 20,
    ),
  };
}

export async function getSegment(name: string): Promise<SegmentRecord> {
  return callSegmentApi<SegmentRecord>(METHODS.GET, { name });
}

export async function getSegmentByCode(
  segmentCode: string,
): Promise<SegmentRecord> {
  return callSegmentApi<SegmentRecord>(METHODS.GET_BY_CODE, {
    segment_code: segmentCode,
  });
}

export async function getSegmentAnalysis(
  selectedSegmentCodes: string[] = [],
): Promise<SegmentAnalysisResponse> {
  return callSegmentApi<SegmentAnalysisResponse>(METHODS.ANALYSIS, {
    selected_segment_codes: JSON.stringify(selectedSegmentCodes),
  });
}

export async function previewSegment(
  params: SegmentPreviewParams,
): Promise<SegmentPreviewResponse> {
  return callSegmentApi<SegmentPreviewResponse>(METHODS.PREVIEW, {
    segment: params.segment,
    filters: params.filters ? JSON.stringify(params.filters) : undefined,
    search: params.search?.trim() || undefined,
    start: params.start ?? 0,
    page_length: params.pageLength ?? 25,
  });
}

export async function createSegment(
  payload: CreateSegmentPayload,
): Promise<SegmentRecord> {
  return callSegmentApi<SegmentRecord>(
    METHODS.CREATE,
    {},
    {
      data: payload,
    },
  );
}

export async function updateSegment(
  payload: UpdateSegmentPayload,
): Promise<SegmentRecord> {
  return callSegmentApi<SegmentRecord>(
    METHODS.UPDATE,
    {},
    {
      name: payload.name,
      data: payload.data,
      expected_revision: payload.expectedRevision,
    },
  );
}

export async function transitionSegment(
  payload: TransitionSegmentPayload,
): Promise<SegmentRecord> {
  return callSegmentApi<SegmentRecord>(
    METHODS.TRANSITION,
    {},
    {
      name: payload.name,
      status: payload.status,
      expected_revision: payload.expectedRevision,
    },
  );
}

export async function deleteSegment(
  payload: DeleteSegmentPayload,
): Promise<{ name: string; deleted: boolean }> {
  return callSegmentApi<{ name: string; deleted: boolean }>(
    METHODS.DELETE,
    {},
    {
      name: payload.name,
      expected_revision: payload.expectedRevision,
    },
  );
}

export type ClassificationGroupKind = "need" | "tag";

function groupMethod(
  kind: ClassificationGroupKind,
  action: "list" | "create" | "update" | "transition" | "delete",
) {
  if (action === "list")
    return kind === "need" ? METHODS.NEED_GROUPS : METHODS.TAG_GROUPS;
  if (kind === "need") {
    return {
      create: METHODS.CREATE_NEED_GROUP,
      update: METHODS.UPDATE_NEED_GROUP,
      transition: METHODS.TRANSITION_NEED_GROUP,
      delete: METHODS.DELETE_NEED_GROUP,
    }[action];
  }
  return {
    create: METHODS.CREATE_TAG_GROUP,
    update: METHODS.UPDATE_TAG_GROUP,
    transition: METHODS.TRANSITION_TAG_GROUP,
    delete: METHODS.DELETE_TAG_GROUP,
  }[action];
}

export async function listClassificationGroups(
  kind: ClassificationGroupKind,
): Promise<ClassificationGroupRecord[]> {
  return callSegmentApi<ClassificationGroupRecord[]>(
    groupMethod(kind, "list"),
    { status: "", start: 0, page_length: 100 },
  );
}

export async function listClassificationGroupsPage(
  kind: ClassificationGroupKind,
  params: { status?: string; start?: number; pageLength?: number } = {},
): Promise<ClassificationGroupListResponse> {
  const raw = await callSegmentApi<Record<string, unknown>>(
    kind === "need" ? METHODS.NEED_GROUPS_PAGE : METHODS.TAG_GROUPS_PAGE,
    {
      status: params.status,
      start: params.start ?? 0,
      page_length: params.pageLength ?? 20,
    },
  );
  const groups = Array.isArray(raw.groups)
    ? (raw.groups as ClassificationGroupRecord[])
    : [];
  return {
    groups,
    total: Number(raw.total ?? groups.length),
    start: Number(raw.start ?? params.start ?? 0),
    pageLength: Number(
      raw.pageLength ?? raw.page_length ?? params.pageLength ?? 20,
    ),
  };
}

function termMethod(
  kind: ClassificationGroupKind,
  action: "list" | "create" | "update" | "transition" | "delete",
) {
  if (action === "list") return kind === "need" ? METHODS.NEEDS : METHODS.TAGS;
  if (kind === "need") {
    return {
      create: METHODS.CREATE_NEED,
      update: METHODS.UPDATE_NEED,
      transition: METHODS.TRANSITION_NEED,
      delete: METHODS.DELETE_NEED,
    }[action];
  }
  return {
    create: METHODS.CREATE_TAG,
    update: METHODS.UPDATE_TAG,
    transition: METHODS.TRANSITION_TAG,
    delete: METHODS.DELETE_TAG,
  }[action];
}

export async function listClassificationTerms(
  kind: ClassificationGroupKind,
): Promise<SegmentTermRecord[]> {
  return callSegmentApi<SegmentTermRecord[]>(termMethod(kind, "list"), {
    status: "",
    start: 0,
    page_length: 100,
  });
}

export async function listClassificationTermsPage(
  kind: ClassificationGroupKind,
  params: {
    status?: string;
    group?: string;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<ClassificationTermListResponse> {
  const key = kind === "need" ? "needs" : "tags";
  const raw = await callSegmentApi<Record<string, unknown>>(
    kind === "need" ? METHODS.NEEDS_PAGE : METHODS.TAGS_PAGE,
    {
      status: params.status,
      group: params.group,
      start: params.start ?? 0,
      page_length: params.pageLength ?? 20,
    },
  );
  return {
    [key]: Array.isArray(raw[key]) ? raw[key] : [],
    total: Number(raw.total ?? 0),
    start: Number(raw.start ?? params.start ?? 0),
    pageLength: Number(raw.page_length ?? params.pageLength ?? 20),
  } as ClassificationTermListResponse;
}

export async function createClassificationTerm(
  kind: ClassificationGroupKind,
  payload: ClassificationTermPayload,
): Promise<SegmentTermRecord> {
  return callSegmentApi<SegmentTermRecord>(
    termMethod(kind, "create"),
    {},
    { data: payload },
  );
}

export async function updateClassificationTerm(
  kind: ClassificationGroupKind,
  payload: UpdateClassificationTermPayload,
): Promise<SegmentTermRecord> {
  return callSegmentApi<SegmentTermRecord>(
    termMethod(kind, "update"),
    {},
    {
      name: payload.name,
      data: payload.data,
      expected_revision: payload.expectedRevision,
    },
  );
}

export async function transitionClassificationTerm(
  kind: ClassificationGroupKind,
  payload: TransitionClassificationTermPayload,
): Promise<SegmentTermRecord> {
  return callSegmentApi<SegmentTermRecord>(
    termMethod(kind, "transition"),
    {},
    {
      name: payload.name,
      status: payload.status,
      expected_revision: payload.expectedRevision,
    },
  );
}

export async function deleteClassificationTerm(
  kind: ClassificationGroupKind,
  payload: DeleteClassificationTermPayload,
): Promise<{ name: string; deleted: boolean }> {
  return callSegmentApi<{ name: string; deleted: boolean }>(
    termMethod(kind, "delete"),
    {},
    {
      name: payload.name,
      expected_revision: payload.expectedRevision,
    },
  );
}

export async function createClassificationGroup(
  kind: ClassificationGroupKind,
  payload: ClassificationGroupPayload,
): Promise<ClassificationGroupRecord> {
  return callSegmentApi<ClassificationGroupRecord>(
    groupMethod(kind, "create"),
    {},
    { data: payload },
  );
}

export async function updateClassificationGroup(
  kind: ClassificationGroupKind,
  payload: UpdateClassificationGroupPayload,
): Promise<ClassificationGroupRecord> {
  return callSegmentApi<ClassificationGroupRecord>(
    groupMethod(kind, "update"),
    {},
    {
      name: payload.name,
      data: payload.data,
      expected_revision: payload.expectedRevision,
    },
  );
}

export async function transitionClassificationGroup(
  kind: ClassificationGroupKind,
  payload: TransitionClassificationGroupPayload,
): Promise<ClassificationGroupRecord> {
  return callSegmentApi<ClassificationGroupRecord>(
    groupMethod(kind, "transition"),
    {},
    {
      name: payload.name,
      status: payload.status,
      expected_revision: payload.expectedRevision,
    },
  );
}

export async function deleteClassificationGroup(
  kind: ClassificationGroupKind,
  payload: DeleteClassificationGroupPayload,
): Promise<{ name: string; deleted: boolean }> {
  return callSegmentApi<{ name: string; deleted: boolean }>(
    groupMethod(kind, "delete"),
    {},
    { name: payload.name, expected_revision: payload.expectedRevision },
  );
}

export function segmentStatus(value: unknown): SegmentStatus {
  return value === "active" || value === "inactive" || value === "archive"
    ? value
    : "draft";
}
