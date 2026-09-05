import type { DirectorSchoolLocality, SchoolDirectoryRecord } from "@/services/api/schools/types";

export type LocalityCoordinate = [number, number];

export interface SchoolLocalityContext {
  isLongAn: boolean;
  source: {
    name: string;
    address: string;
    compactAddress: string;
    coordinates: LocalityCoordinate;
  };
  campus: {
    name: string;
    address: string;
    compactAddress: string;
    coordinates: LocalityCoordinate;
  };
  regionLabel: string;
  routeLabel: string;
  distanceKm: number;
  travelTime: string;
  mockStats: {
    schools: string;
    grade12Students: string;
    outOfProvinceRate: string;
    fptInterestRate: string;
  };
  risks: string[];
  opportunity: string;
  actions: string[];
  recommendation: string;
}

const FPTU_HCM_CAMPUS = {
  name: "Đại học FPT · Campus TP.HCM",
  address: "Lô E2a-7, Đường D1, Khu Công nghệ cao, TP. Hồ Chí Minh",
  compactAddress: "Khu Công nghệ cao, TP.HCM",
  coordinates: [10.8411, 106.8099] as LocalityCoordinate,
};

const LONG_AN_LOCATIONS: Array<{ keywords: string[]; label: string; coordinates: LocalityCoordinate }> = [
  { keywords: ["đức hòa", "hậu nghĩa"], label: "Đức Hòa", coordinates: [10.8862, 106.4254] },
  { keywords: ["bến lức"], label: "Bến Lức", coordinates: [10.6517, 106.4943] },
  { keywords: ["cần giuộc"], label: "Cần Giuộc", coordinates: [10.6082, 106.6718] },
  { keywords: ["cần đước"], label: "Cần Đước", coordinates: [10.5005, 106.6751] },
  { keywords: ["tân an"], label: "Tân An", coordinates: [10.5354, 106.4138] },
  { keywords: ["thủ thừa"], label: "Thủ Thừa", coordinates: [10.6129, 106.3512] },
  { keywords: ["châu thành"], label: "Châu Thành", coordinates: [10.4684, 106.3565] },
  { keywords: ["tân trụ"], label: "Tân Trụ", coordinates: [10.4756, 106.5153] },
  { keywords: ["mộc hóa", "tân hưng", "vĩnh hưng", "kiến tường"], label: "Đồng Tháp Mười", coordinates: [10.7748, 105.9483] },
];

const PROVINCE_CENTERS: Record<string, LocalityCoordinate> = {
  "02": [10.8231, 106.6297],
  "55": [10.0342, 105.7228],
  "48": [10.9453, 108.1001],
  "49": [10.6956, 106.2431],
  "52": [10.346, 107.084],
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .toLocaleLowerCase("vi-VN");
}

function haversineDistance([sourceLat, sourceLng]: LocalityCoordinate, [destinationLat, destinationLng]: LocalityCoordinate) {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(destinationLat - sourceLat);
  const longitudeDelta = toRadians(destinationLng - sourceLng);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(toRadians(sourceLat)) * Math.cos(toRadians(destinationLat)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTravelTime(distanceKm: number) {
  const minutes = Math.max(45, Math.round((distanceKm * 1.3) / 45 * 60 / 5) * 5);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours} giờ ${remainingMinutes > 0 ? `${remainingMinutes} phút` : ""}`.trim() : `${minutes} phút`;
}

const EMPTY_LOCALITY_STATS = {
  schools: "-",
  grade12Students: "-",
  outOfProvinceRate: "-",
  fptInterestRate: "-",
};

function getCompactAddress(address: string, fallback: string) {
  const segments = address.split(",").map((segment) => segment.trim()).filter(Boolean);
  return segments.at(-1) ?? fallback;
}

function getLocalityPlan(distanceKm: number, travelTime: string) {
  if (distanceKm >= 70) {
    return {
      risks: [`Di chuyển xa · ${travelTime}`, "Chi phí đi lại và lưu trú"],
      actions: ["Ưu tiên tư vấn online và tại trường", "Tổ chức campus tour theo nhóm", "Đính kèm học bổng hoặc hỗ trợ lưu trú"],
    };
  }

  if (distanceKm >= 35) {
    return {
      risks: [`Cần sắp xếp lịch di chuyển · ${travelTime}`, "Phụ huynh cần thêm thông tin chi phí"],
      actions: ["Kết hợp tư vấn tại trường và online", "Chốt lịch campus tour sớm", "Nêu rõ học bổng và phương án đi lại"],
    };
  }

  return {
    risks: [`Cần chốt lịch campus tour · ${travelTime}`, "Theo dõi chi phí đi lại của gia đình"],
    actions: ["Ưu tiên mời học sinh đến campus", "Gửi thông tin học phí và lộ trình", "Theo dõi nhóm chưa đăng ký trải nghiệm"],
  };
}

export function getSchoolLocalityContext(
  school: SchoolDirectoryRecord,
  coordinates?: LocalityCoordinate,
  locality?: Pick<DirectorSchoolLocality, "distanceKm" | "travelTime" | "marketStats">,
): SchoolLocalityContext {
  const isLongAn = school.provinceCode === "49" || normalize(school.province).includes("long an");
  const normalizedDistrict = normalize(`${school.district} ${school.address}`);
  const matchedLocation = isLongAn ? LONG_AN_LOCATIONS.find((location) => location.keywords.some((keyword) => normalizedDistrict.includes(normalize(keyword)))) : undefined;
  const sourceCoordinates = coordinates ?? matchedLocation?.coordinates ?? PROVINCE_CENTERS[school.provinceCode] ?? [10.8231, 106.6297];
  const sourceLabel = isLongAn ? matchedLocation?.label ?? "Long An" : school.province;
  const distanceKm = locality?.distanceKm ?? Math.max(8, Math.round(haversineDistance(sourceCoordinates, FPTU_HCM_CAMPUS.coordinates) * 1.25));
  const travelTime = locality?.travelTime ?? getTravelTime(distanceKm);
  const hasMarketStats = Object.values(locality?.marketStats ?? {}).some((value) => value !== null && value !== undefined);
  const mockStats = hasMarketStats
    ? {
        schools: locality?.marketStats.schools?.toLocaleString("vi-VN") ?? "-",
        grade12Students: locality?.marketStats.grade12Students?.toLocaleString("vi-VN") ?? "-",
        outOfProvinceRate: locality?.marketStats.outOfProvinceRate ?? "-",
        fptInterestRate: locality?.marketStats.fptInterestRate ?? "-",
      }
    : EMPTY_LOCALITY_STATS;
  const localityPlan = getLocalityPlan(distanceKm, travelTime);
  const sourceName = isLongAn ? `${school.name} · ${sourceLabel}` : school.name;
  const opportunity =
    mockStats.outOfProvinceRate === "-"
      ? "Chưa có dữ liệu để đánh giá cơ hội mở rộng tệp học sinh ngoài tỉnh."
      : `Có thể mở rộng tệp học sinh đi học ngoài tỉnh (${mockStats.outOfProvinceRate}).`;

  return {
    isLongAn,
    source: {
      name: sourceName,
      address: school.address || `${school.district}, ${school.province}`,
      compactAddress: getCompactAddress(school.address || `${school.district}, ${school.province}`, school.district),
      coordinates: sourceCoordinates,
    },
    campus: FPTU_HCM_CAMPUS,
    regionLabel: isLongAn ? "Vùng vệ tinh phía Tây TP.HCM" : `${school.province} · kết nối FPTU TP.HCM`,
    routeLabel: `${isLongAn ? "Long An" : school.province} → FPTU TP.HCM`,
    distanceKm,
    travelTime,
    mockStats,
    risks: localityPlan.risks,
    opportunity,
    actions: localityPlan.actions,
    recommendation: localityPlan.actions[0] ?? "-",
  };
}
