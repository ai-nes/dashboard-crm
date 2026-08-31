import { SCHOOL_EXAM_SCORE_BAND_LABELS } from "./types";
import type {
  DataAvailabilityStatus,
  DirectorSchoolActivity,
  DirectorSchoolContact,
  DirectorSchoolDetailData,
  SchoolExamScoreBand,
  SchoolClassification,
} from "./types";

type GetSchoolOptions = { admissionYear?: number; baseUrl?: string };

function frappeCookieHeader(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

function hasSchoolEnvelope(value: unknown): boolean {
  const root = record(value);
  const message = record(root.message);
  const school = record(message.school);
  const availability = record(message.dataAvailability);
  const meta = record(message.meta);
	return typeof school.id === "string" && !!school.id.trim() && typeof school.name === "string" && !!availability.sections && !!meta.admissionYear;
}

const statuses = new Set(["available", "partial", "unavailable"]);
const classifications = new Set(["Trọng điểm", "Mở rộng", "Duy trì", "Sàng lọc"]);

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function boolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeAvailability(value: unknown): DirectorSchoolDetailData["dataAvailability"] {
  const source = record(value);
  const normalizeMap = (candidate: unknown) =>
    Object.fromEntries(
      Object.entries(record(candidate)).filter(([, status]) => statuses.has(String(status))),
    ) as Record<string, DataAvailabilityStatus>;
  const sections = normalizeMap(source.sections);
  const fields = normalizeMap(source.fields);
  const values = [...Object.values(sections), ...Object.values(fields)];
  const status = statuses.has(String(source.status))
    ? (source.status as DataAvailabilityStatus)
    : values.length === 0
      ? undefined
      : values.every((item) => item === "unavailable")
        ? "unavailable"
        : values.some((item) => item === "unavailable" || item === "partial")
          ? "partial"
          : "available";
  return { status, sections, fields };
}

function normalizeContact(value: unknown): DirectorSchoolContact | null {
  const source = record(value);
  const role = text(source.role);
  const fullName = text(source.full_name ?? source.fullName);
  if (!role && !fullName) return null;
  return {
    fullName,
    role,
    position: text(source.position),
    relationshipStatus: text(source.relationship_status ?? source.relationshipStatus),
    lastTouch: text(source.last_touch ?? source.lastTouch),
    nextTouch: text(source.next_touch ?? source.nextTouch),
  };
}

function normalizeActivity(value: unknown): DirectorSchoolActivity | null {
  const source = record(value);
  const activityType = text(source.activity_type ?? source.activityType ?? source.type);
  const status = text(source.status);
  if (!activityType && !status) return null;
  return {
    activityType,
    occurredAt: text(source.occurred_at ?? source.occurredAt ?? source.date),
    scheduledAt: text(source.scheduled_at ?? source.scheduledAt),
    status,
    outcome: text(source.outcome),
    attendance: number(source.attendance),
  };
}

function normalizeExamScoreBands(value: unknown): SchoolExamScoreBand[] {
  const bands = (Array.isArray(value) ? value : [])
    .map((item) => {
      const source = record(item);
      const label = normalizeExamScoreBandLabel(source.label ?? source.range ?? source.scoreRange ?? source.score_range);
      const students = number(source.students ?? source.studentCount ?? source.student_count ?? source.count);
      const share = number(source.share ?? source.sharePercent ?? source.share_percent);

      if (!label || students === null) return null;
      return {
        label,
        students: Math.max(0, Math.round(students)),
        share: share === null ? 0 : Math.min(100, Math.max(0, share)),
      } satisfies SchoolExamScoreBand;
    })
    .filter((item): item is SchoolExamScoreBand => item !== null);

  const bandsByLabel = new Map(bands.map((band) => [band.label, band]));
  const completeBands = SCHOOL_EXAM_SCORE_BAND_LABELS.map(
    (label) => bandsByLabel.get(label) ?? { label, students: 0, share: 0 },
  );
  const totalStudents = completeBands.reduce((total, band) => total + band.students, 0);
  if (!totalStudents) return completeBands;

  const shares = completeBands.map((band) => band.share || Math.round((band.students / totalStudents) * 100));
  shares[shares.length - 1] += 100 - shares.reduce((total, share) => total + share, 0);

  return completeBands.map((band, index) => ({
    ...band,
    share: shares[index],
  }));
}

function normalizeExamScoreBandLabel(value: unknown): SchoolExamScoreBand["label"] | null {
  const label = text(value);
  if (!label) return null;

  return SCHOOL_EXAM_SCORE_BAND_LABELS.find((item) => item === label || item.replace("–", "-") === label) ?? null;
}

export function normalizeSchoolIntelligence(value: unknown): DirectorSchoolDetailData {
  const root = record(value);
  const data = record(root.data && !Array.isArray(root.data) ? root.data : root);
  const school = record(data.school ?? data.identity);
  const relationship = record(data.relationship);
  const classification = record(data.classification);
  const locality = record(data.locality);
  const coordinates = record(locality.coordinates ?? record(locality.source).coordinates ?? school.coordinates);
  const contacts = Array.isArray(data.contacts ?? data.stakeholders ?? relationship.contacts)
    ? ((data.contacts ?? data.stakeholders ?? relationship.contacts) as unknown[])
    : [];
  const activities = Array.isArray(data.activities) ? data.activities : [];
	const id = text(school.id ?? school.externalId ?? data.schoolId);
  const name = text(school.name);
  if (!id || !name) throw new Error("Phản hồi trường học thiếu định danh bắt buộc.");
  const group = text(classification.group);

  return {
    school: {
      id,
      provinceCode: text(school.provinceCode ?? school.province_code),
      province: text(school.province),
      wardCode: text(school.wardCode ?? school.ward_code ?? school.districtCode),
      ward: text(school.ward ?? school.district),
      schoolCode: text(school.schoolCode ?? school.school_code),
      name,
      address: text(school.address),
      area: text(school.area),
      isBoardingSchool: boolean(school.isBoardingSchool ?? school.is_boarding_school),
    },
    potentialScore: number(data.potentialScore),
    grade12Students: number(data.grade12Students),
    availableStudents: number(data.availableStudents),
    prospects: number(data.prospects),
    applications: number(data.applications),
    enrollment: number(data.enrollment),
    relationship: {
      level: text(relationship.level),
      score: number(relationship.score),
      contact: text(relationship.contact),
      contactRole: text(relationship.contactRole ?? relationship.contact_role),
      lastTouch: text(relationship.lastTouch ?? relationship.last_touch),
      nextTouch: text(relationship.nextTouch ?? relationship.next_touch),
    },
    classification: {
      group: classifications.has(group ?? "") ? (group as SchoolClassification) : null,
      isKeyAccount: boolean(classification.isKeyAccount ?? classification.is_key_account),
      label: text(classification.label),
    },
    locality: {
      latitude: number(coordinates.latitude ?? locality.latitude),
      longitude: number(coordinates.longitude ?? locality.longitude),
    },
    contacts: contacts.map(normalizeContact).filter((item): item is DirectorSchoolContact => item !== null),
    activities: activities.map(normalizeActivity).filter((item): item is DirectorSchoolActivity => item !== null),
    examScoreBands: normalizeExamScoreBands(
      data.examScoreBands ?? data.exam_score_bands ?? data.scoreDistribution ?? data.score_distribution,
    ),
    asOf: text(record(root.meta).asOf ?? data.asOf),
    dataAvailability: {
      ...normalizeAvailability(data.dataAvailability ?? root.dataAvailability),
      status: statuses.has(String(root.status))
        ? (root.status as DataAvailabilityStatus)
        : normalizeAvailability(data.dataAvailability ?? root.dataAvailability).status,
    },
  };
}

export class DirectorApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "DirectorApiError";
  }
}

export async function getDirectorSchoolDetail(
  schoolId: string,
  options: GetSchoolOptions = {},
): Promise<DirectorSchoolDetailData | null> {
  const query = new URLSearchParams({ school_id: schoolId });
  if (options.admissionYear) query.set("admissionYear", String(options.admissionYear));
  const baseUrl = (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(/\/+$/, "");
  const method = "crm.api.director_school_detail.get_director_school_detail";
  const headers: Record<string, string> = { Accept: "application/json" };

  if (!options.baseUrl) {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Outside a Next request context (for example, contract tests).
    }
  }

  const response = await fetch(`${baseUrl}/api/method/${method}?${query.toString()}`, {
    headers,
    // Client-side the session cookie rides along on the cross-origin request;
    // server-side it is forwarded explicitly via the Cookie header above.
    ...(typeof window !== "undefined" ? { credentials: "include" as RequestCredentials } : {}),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  const error = payload?.error ?? {};
  if (response.status === 404 && error.code === "SCHOOL_NOT_FOUND") return null;
  if (!response.ok) {
    throw new DirectorApiError(
      response.status,
      typeof error.code === "string" ? error.code : "SCHOOL_DATA_UNAVAILABLE",
      typeof error.message === "string" ? error.message : "Không thể tải dữ liệu trường học.",
    );
  }
  if (!hasSchoolEnvelope(payload)) {
    throw new DirectorApiError(502, "INVALID_SCHOOL_RESPONSE", "Phản hồi dữ liệu trường học không hợp lệ.");
  }
	return normalizeSchoolIntelligence(payload?.message ?? payload);
}
