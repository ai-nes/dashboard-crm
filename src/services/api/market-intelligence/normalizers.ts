import type {
  DataAvailability,
  DirectorMarketOverview,
  DirectorMarketProvince,
  DirectorMarketSchool,
  MarketRegionKey,
  MarketSchoolClassification,
} from "./types";

const statuses = new Set(["available", "partial", "unavailable"]);
const regions = new Set(["all", "north", "central", "highlands", "south", "mekong"]);
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

function availability(value: unknown): DataAvailability {
  const source = record(value);
  const normalizeMap = (candidate: unknown) =>
    Object.fromEntries(
      Object.entries(record(candidate)).filter(([, status]) => statuses.has(String(status))),
    ) as DataAvailability["sections"];

  return {
    status: statuses.has(String(source.status)) ? (source.status as DataAvailability["status"]) : undefined,
    sections: normalizeMap(source.sections),
    fields: normalizeMap(source.fields),
  };
}

function normalizeSchool(value: unknown, fallbackId: string): DirectorMarketSchool | null {
  const source = record(value);
  const directoryId = text(source.directoryId ?? source.directory_id ?? source.externalId ?? source.id);
  const name = text(source.name);
  if (!name) return null;

  const classificationValue = text(source.classification);
  return {
    id: text(source.id) ?? fallbackId,
    directoryId,
    name,
    district: text(source.district),
    tier: (["Tier 1", "Tier 2", "Tier 3"] as const).find((item) => item === source.tier) ?? null,
    potentialScore: number(source.potentialScore),
    grade12Students: number(source.grade12Students),
    prospects: number(source.prospects),
    penetrationRate: number(source.penetrationRate),
    applications: number(source.applications),
    enrollmentForecast: number(source.enrollmentForecast),
    conversionRate: number(source.conversionRate),
    lastActivity: text(source.lastActivity),
    recommendation: text(source.recommendation),
    nextAction: text(source.nextAction),
    classification: classifications.has(classificationValue ?? "")
      ? (classificationValue as MarketSchoolClassification)
      : null,
  };
}

function normalizeProvince(value: unknown): DirectorMarketProvince | null {
  const source = record(value);
  const code = text(source.code);
  const name = text(source.name);
  if (!code || !name) return null;
  const region = text(source.regionKey ?? source.region_key);
  const schools = Array.isArray(source.highSchools) ? source.highSchools : [];

  return {
    code,
    name,
    regionKey: regions.has(region ?? "") ? (region as MarketRegionKey) : "all",
    opportunity: number(source.opportunity),
    leads: number(source.leads),
    conversion: number(source.conversion),
    competition: number(source.competition),
    revenue: number(source.revenue),
    grade12Population: number(source.grade12Population),
    penetrationRate: number(source.penetrationRate),
    trend: number(source.trend),
    recommendation: text(source.recommendation),
    keyAction: text(source.keyAction),
    highSchools: schools
      .map((school, index) => normalizeSchool(school, `${code}-school-${index}`))
      .filter((item): item is DirectorMarketSchool => item !== null),
  };
}

export function normalizeMarketOverview(value: unknown): DirectorMarketOverview {
  const root = record(value);
  const data = record(root.data && !Array.isArray(root.data) ? root.data : root);
  const meta = record(root.meta);
  const provinces = Array.isArray(data.provinces) ? data.provinces : [];
  const normalizedAvailability = availability(root.dataAvailability ?? data.dataAvailability);

  return {
    provinces: provinces.map(normalizeProvince).filter((item): item is DirectorMarketProvince => item !== null),
    totalProvinces: number(data.totalProvinces),
    totalSchools: number(data.totalSchools),
    admissionYear: number(meta.admissionYear ?? data.admissionYear),
    asOf: text(meta.asOf ?? data.asOf),
    dataAvailability: {
      ...normalizedAvailability,
      status: statuses.has(String(root.status))
        ? (root.status as DataAvailability["status"])
        : normalizedAvailability.status,
    },
  };
}

export function averageAvailable(values: Array<number | null>): number | null {
  const available = values.filter((value): value is number => value !== null);
  if (!available.length) return null;
  return available.reduce((sum, value) => sum + value, 0) / available.length;
}

export function sumAvailable(values: Array<number | null>): number | null {
  const available = values.filter((value): value is number => value !== null);
  return available.length ? available.reduce((sum, value) => sum + value, 0) : null;
}

export function sortByAvailableScore<T, K extends keyof T>(rows: T[], key: K): T[] {
  return [...rows].sort((left, right) => {
    const leftValue = typeof left[key] === "number" ? (left[key] as number) : null;
    const rightValue = typeof right[key] === "number" ? (right[key] as number) : null;
    if (leftValue === null) return rightValue === null ? 0 : 1;
    if (rightValue === null) return -1;
    return rightValue - leftValue;
  });
}
