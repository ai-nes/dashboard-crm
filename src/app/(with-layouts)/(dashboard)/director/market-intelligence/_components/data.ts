import type {
  FptuCampusLocation,
  ProvinceMetrics,
  RegionConfig,
  RegionKey,
} from "./types";

export const REGION_CONFIGS: Record<RegionKey, RegionConfig> = {
  all: {
    key: "all",
    label: "Toàn quốc",
    shortLabel: "Tất cả",
    bounds: {
      minLongitude: 102.1,
      maxLongitude: 109.8,
      minLatitude: 8.3,
      maxLatitude: 23.5,
    },
  },
  north: {
    key: "north",
    label: "Bắc Bộ & Hà Nội",
    shortLabel: "Miền Bắc",
    bounds: {
      minLongitude: 102.1,
      maxLongitude: 108.2,
      minLatitude: 19.8,
      maxLatitude: 23.5,
    },
  },
  central: {
    key: "central",
    label: "Duyên hải Miền Trung",
    shortLabel: "Miền Trung",
    bounds: {
      minLongitude: 105.0,
      maxLongitude: 109.6,
      minLatitude: 13.5,
      maxLatitude: 20.2,
    },
  },
  highlands: {
    key: "highlands",
    label: "Tây Nguyên",
    shortLabel: "Tây Nguyên",
    bounds: {
      minLongitude: 107.0,
      maxLongitude: 109.4,
      minLatitude: 11.4,
      maxLatitude: 15.6,
    },
  },
  south: {
    key: "south",
    label: "Đông Nam Bộ & TP.HCM",
    shortLabel: "Đông Nam Bộ",
    bounds: {
      minLongitude: 105.8,
      maxLongitude: 107.9,
      minLatitude: 10.2,
      maxLatitude: 12.3,
    },
  },
  mekong: {
    key: "mekong",
    label: "Đồng bằng Sông Cửu Long",
    shortLabel: "ĐBSCL",
    bounds: {
      minLongitude: 104.3,
      maxLongitude: 106.9,
      minLatitude: 8.5,
      maxLatitude: 11.1,
    },
  },
};

/**
 * No live API for FPT University campus enrollment yet — coordinates and
 * campus identity are real reference data (used to place map markers), but
 * enrollment figures are left at 0 rather than fabricated until a live
 * source is wired in. `campus-marker-layer.tsx` guards the 0/0 case.
 */
export const FPTU_CAMPUS_LOCATIONS: FptuCampusLocation[] = [
  {
    id: "campus-hn",
    name: "FPT University Hà Nội (Hòa Lạc)",
    shortName: "FPTU Hòa Lạc",
    region: "Miền Bắc",
    city: "Hà Nội",
    coordinates: [21.0132, 105.5262],
    currentEnrolled: 0,
    target: 0,
    highlightMajor: "Kỹ thuật phần mềm & AI",
  },
  {
    id: "campus-hcm",
    name: "FPT University TP. Hồ Chí Minh (Q.9)",
    shortName: "FPTU TP.HCM",
    region: "Đông Nam Bộ",
    city: "TP. Hồ Chí Minh",
    coordinates: [10.8411, 106.8099],
    currentEnrolled: 0,
    target: 0,
    highlightMajor: "AI, Thiết kế Mỹ thuật số & QTKD",
  },
  {
    id: "campus-dn",
    name: "FPT University Đà Nẵng",
    shortName: "FPTU Đà Nẵng",
    region: "Miền Trung",
    city: "Đà Nẵng",
    coordinates: [15.9868, 108.2612],
    currentEnrolled: 0,
    target: 0,
    highlightMajor: "Thiết kế Vi mạch bán dẫn & IoT",
  },
  {
    id: "campus-ct",
    name: "FPT University Cần Thơ",
    shortName: "FPTU Cần Thơ",
    region: "ĐBSCL",
    city: "Cần Thơ",
    coordinates: [10.0125, 105.7325],
    currentEnrolled: 0,
    target: 0,
    highlightMajor: "Công nghệ thông tin & Du lịch",
  },
  {
    id: "campus-qn",
    name: "FPT University Quy Nhơn (AI Campus)",
    shortName: "FPTU Quy Nhơn",
    region: "Miền Trung",
    city: "Bình Định",
    coordinates: [13.7915, 109.2185],
    currentEnrolled: 0,
    target: 0,
    highlightMajor: "Trí tuệ nhân tạo (AI Specialist)",
  },
];

export function opportunityLabel(score: number | null) {
  if (score === null) return "-";
  if (score >= 80) return "Cơ hội rất cao";
  if (score >= 65) return "Tiềm năng lớn";
  if (score >= 50) return "Đang tăng trưởng";
  return "Cần kích cầu";
}

export function getProvinceHeatScore(
  province: Pick<ProvinceMetrics, "schoolCount" | "highSchools">,
): number | null {
  const totalSchools = province.schoolCount ?? province.highSchools.length;
  if (totalSchools <= 0) return null;

  const keySchoolCount = province.highSchools.filter(
    (school) => school.classification === "Trọng điểm",
  ).length;

  return Number(((keySchoolCount / totalSchools) * 100).toFixed(2));
}

export function formatHeatScore(score: number | null) {
  if (score === null) return "-";
  return `${Number.isInteger(score) ? score : score.toFixed(2)}%`;
}

export function getOpportunityBadgeVariant(score: number | null): "success" | "primary" | "warning" | "error" | "gray" {
  if (score === null) return "gray";
  if (score >= 80) return "success";
  if (score >= 65) return "primary";
  if (score >= 50) return "warning";
  return "error";
}

/**
 * Uses four ordered status colours so low and high opportunity are immediately
 * recognisable, while the middle range remains easy to compare.
 */
export function getHeatColor(value: number | null, isHovered: boolean = false): string {
  if (value === null) return isHovered ? "var(--text-200)" : "var(--background-gray-tertiary)";

  // Heat score is normalized to 0..100 before it reaches this function.
  if (value >= 76) return isHovered ? "var(--green-600)" : "var(--success-500)";
  if (value >= 58) return "var(--info-500)";
  if (value >= 42) return isHovered ? "var(--brand-500)" : "var(--warning-500)";
  return isHovered ? "var(--red-600)" : "var(--error-500)";
}

