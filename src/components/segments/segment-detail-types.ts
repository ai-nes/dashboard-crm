import type { SegmentStudentRecord } from "@/services/api/segments";

import type {
  SegmentFilterGroup,
  SegmentFilterLogic,
} from "./segment-filter-config";

export interface SegmentStudent {
  id: string;
  code: string;
  name: string;
  phone: string;
  stage: string;
  major: string;
  potential: string;
  intent: string;
  owner: string;
}

export function toSegmentStudent(
  student: SegmentStudentRecord,
): SegmentStudent {
  return {
    id: student.name,
    code: student.name,
    name: student.full_name || student.name,
    phone: student.phone || "",
    stage: student.student_stage || "",
    major: student.major || "",
    potential: student.potential || "",
    intent: student.intent || "",
    owner: student.assigned_to || "",
  };
}

export interface SegmentOverviewData {
  createdAt: string;
  groupLogic: SegmentFilterLogic;
  groups: SegmentFilterGroup[];
}
