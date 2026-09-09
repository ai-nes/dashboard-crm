export type SegmentStatus = "draft" | "active" | "inactive" | "archive";
export type SegmentType = "dynamic" | "static";
export type SegmentFilterLogic = "AND" | "OR";
export type SegmentCategory =
  | ""
  | "admission_stage"
  | "potential"
  | "intent"
  | "need";

export interface SegmentFilterConditionPayload {
  field: "student_stage" | "potential" | "intent" | "need" | "tag";
  operator: "=" | "!=" | "in" | "not in";
  value: string | string[];
}

export interface SegmentFilterGroupPayload {
  logic: SegmentFilterLogic;
  name?: string;
  conditions: SegmentFilterConditionPayload[];
}

export interface SegmentFilterPayload {
  logic: SegmentFilterLogic;
  groups: SegmentFilterGroupPayload[];
}

export interface SegmentRecord {
  name: string;
  segment_code: string;
  title: string;
  purpose?: string | null;
  status: SegmentStatus;
  category?: SegmentCategory | string | null;
  segment_type?: SegmentType;
  responsible_user?: string | null;
  is_public?: 0 | 1 | boolean;
  revision: number;
  filters?: SegmentFilterPayload | string | null;
  snapshot_at?: string | null;
  snapshot_by?: string | null;
  owner?: string | null;
  creation?: string | null;
  modified?: string | null;
  member_count?: number;
}

export type SegmentAnalysisSegment = SegmentRecord & {
  member_count: number;
  member_change_7d: number | null;
};

export interface SegmentAnalysisSummary {
  total: number;
  active: number;
  inactive: number;
  archive: number;
  draft: number;
}

export interface SegmentOverlapCell {
  row_segment_code: string;
  column_segment_code: string;
  count: number;
}

export interface SegmentAnalysisResponse {
  summary: SegmentAnalysisSummary;
  segments: SegmentAnalysisSegment[];
  selected_segments: SegmentAnalysisSegment[];
  overlap: {
    cells: SegmentOverlapCell[];
  };
  attention: SegmentAnalysisSegment[];
}

export interface SegmentStudentRecord {
  name: string;
  full_name?: string | null;
  phone?: string | null;
  student_stage?: string | null;
  major?: string | null;
  assigned_to?: string | null;
  potential?: string | null;
  intent?: string | null;
}

export interface SegmentPreviewResponse {
  total: number;
  total_students: number;
  start: number;
  page_length: number;
  students: SegmentStudentRecord[];
}

export interface SegmentFieldDefinition {
  fieldname: "student_stage" | "potential" | "intent" | "need" | "tag";
  label: string;
  fieldtype: "Select" | "Term";
  options?: string;
  operators: string[];
}

export interface SegmentTermRecord {
  name: string;
  code?: string | null;
  label?: string | null;
  group_name?: string | null;
  description?: string | null;
  status?: string | null;
  revision?: number;
}

export interface SegmentFilterOptionsResponse {
  fields: SegmentFieldDefinition[];
  needs: SegmentTermRecord[];
  tags: SegmentTermRecord[];
}

export interface ListSegmentsParams {
  status?: SegmentStatus;
  category?: SegmentCategory;
  start?: number;
  pageLength?: number;
}

export interface CreateSegmentPayload {
  title: string;
  purpose?: string;
  responsible_user?: string;
  segment_type: SegmentType;
  category: Exclude<SegmentCategory, "">;
  is_public?: 0 | 1;
  filters: SegmentFilterPayload;
}

export interface UpdateSegmentPayload {
  name: string;
  expectedRevision: number;
  data: Partial<
    Pick<
      CreateSegmentPayload,
      | "title"
      | "purpose"
      | "responsible_user"
      | "segment_type"
      | "category"
      | "is_public"
      | "filters"
    >
  >;
}

export interface TransitionSegmentPayload {
  name: string;
  status: SegmentStatus;
  expectedRevision: number;
}

export interface DeleteSegmentPayload {
  name: string;
  expectedRevision: number;
}

export interface SegmentPreviewParams {
  segment?: string;
  filters?: SegmentFilterPayload;
  start?: number;
  pageLength?: number;
}
