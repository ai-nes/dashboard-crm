/**
 * Student list against the NestJS backend, reshaped into the
 * `DirectorStudentsResponse` the dashboard already renders.
 */
import { nestRequest } from "../nest/nest-client";
import type {
  DirectorStudentsParams,
  DirectorStudentsResponse,
  StudentJourneyStage,
  StudentLifecycleStatus,
  StudentListItem,
  StudentPriority,
  StudentStatus,
} from "./types";

interface NestStudent {
  id: string;
  studentCode: string;
  sourceLeadId: string | null;
  fullName: string;
  studentStage: string;
  qualityBucket: string | null;
  ownerUserId: string | null;
  owner: string;
  province: string;
  provinceId: string | null;
  school: string;
  major: string;
  source: string;
  latestScore: string | null;
  revision: number;
  ownershipRevision?: number;
  modifiedAt: string;
}

interface NestStudentList {
  data: NestStudent[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

const STUDENT_STAGES = new Set([
  "New",
  "Attempting",
  "Connected",
  "Qualified",
  "Registration",
  "New Enter",
  "Disqualified",
]);

const JOURNEY: Record<string, StudentJourneyStage> = {
  New: "Quan tâm",
  Attempting: "Tìm hiểu",
  Qualified: "Ứng tuyển",
  Registration: "Đăng ký",
  Connected: "Nhập học",
  "New Enter": "New Enter",
  Disqualified: "Quan tâm",
};

const LIFECYCLE: Record<string, StudentLifecycleStatus> = {
  New: "Lead",
  Attempting: "MQL",
  Qualified: "Applicant",
  Registration: "Registration",
  Connected: "Enrolled",
  "New Enter": "New Enter",
  Disqualified: "Lost",
};

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = [words[0]?.[0], words.at(-1)?.[0]].filter(Boolean);
  return letters.join("").toUpperCase() || "?";
}

function priority(bucket: string | null): StudentPriority {
  if (bucket === "Hot") return "Cao";
  if (bucket === "Warm") return "Trung bình";
  return "Thấp";
}

function toListItem(student: NestStudent): StudentListItem {
  const score = Number(student.latestScore);
  return {
    id: student.id,
    studentId: student.id,
    initials: initials(student.fullName),
    name: student.fullName,
    code: student.studentCode,
    school: student.school,
    province: student.province,
    provinceId: student.provinceId,
    major: student.major,
    stage: JOURNEY[student.studentStage] ?? "Quan tâm",
    studentStage: student.studentStage as StudentStatus,
    sourceLead: student.sourceLeadId,
    recordType: "student",
    assignmentStatus: student.ownerUserId ? "assigned" : "unassigned",
    lifecycleStatus: LIFECYCLE[student.studentStage] ?? null,
    score: Number.isFinite(score) ? score : 0,
    scoreDelta: 0,
    lastActivity: student.modifiedAt,
    nextAction: "",
    owner: student.owner,
    // The list revision is the ownership compare-and-set token.
    revision: student.ownershipRevision ?? student.revision,
    source: student.source,
    priority: priority(student.qualityBucket),
  };
}

export async function nestDirectorStudents(
  params: DirectorStudentsParams = {},
): Promise<DirectorStudentsResponse> {
  const stage =
    params.stage && STUDENT_STAGES.has(params.stage) ? params.stage : undefined;
  const result = await nestRequest<NestStudentList>("/api/v1/students", {
    query: {
      admissionYear: params.admissionYear,
      page: params.page,
      pageSize: params.pageSize,
      q: params.q,
      stage,
      ownerId: params.ownerId,
      provinceId: params.provinceId,
      campaignId:
        params.campaign && params.campaign !== "all"
          ? params.campaign
          : undefined,
      order: params.order,
    },
  });
  return {
    data: result.data.map(toListItem),
    summary: { trackedStudents: result.meta.total },
    actionSummary: {},
    meta: {
      total: result.meta.total,
      totalAll: result.meta.total,
      page: result.meta.page,
      pageSize: result.meta.pageSize,
      totalPages: result.meta.totalPages,
      hasNextPage: result.meta.hasNextPage,
      admissionYear: params.admissionYear ?? new Date().getFullYear(),
      query: params.q,
      asOf: new Date().toISOString(),
    },
  };
}
