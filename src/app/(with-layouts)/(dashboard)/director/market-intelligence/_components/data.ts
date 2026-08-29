import type {
  FptuCampusLocation,
  HighSchoolItem,
  MetricKey,
  ProvinceGeometryDocument,
  ProvinceMetrics,
  RegionConfig,
  RegionKey,
} from "./types";

interface DirectorySchoolSeed {
  id: string;
  name: string;
  district: string;
}

export const PERIOD_LABEL = "30 ngày gần nhất";

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

export const METRICS_CONFIG: Record<
  MetricKey,
  {
    label: string;
    shortLabel: string;
    unit: string;
    description: string;
    min: number;
    max: number;
  }
> = {
  opportunity: {
    label: "Điểm cơ hội",
    shortLabel: "Cơ hội",
    unit: "/100",
    description: "Tổng hợp dung lượng lớp 12 & khoảng trống thị trường",
    min: 40,
    max: 95,
  },
  leads: {
    label: "Quy mô Leads",
    shortLabel: "Leads",
    unit: "leads",
    description: "Số lượng học sinh quan tâm thu thập trong kỳ",
    min: 1000,
    max: 30000,
  },
  conversion: {
    label: "Tỷ lệ chuyển đổi",
    shortLabel: "Chuyển đổi",
    unit: "%",
    description: "Tỷ lệ học sinh nộp hồ sơ xét tuyển / tổng lead",
    min: 4,
    max: 28,
  },
  competition: {
    label: "Áp lực cạnh tranh",
    shortLabel: "Cạnh tranh",
    unit: "/100",
    description: "Mật độ cạnh tranh từ các trường ĐH trong khu vực",
    min: 20,
    max: 90,
  },
  revenue: {
    label: "Doanh thu tiềm năng",
    shortLabel: "Doanh thu",
    unit: "tỷ",
    description: "Dự phóng giá trị học phí nhập học tiềm năng",
    min: 10,
    max: 220,
  },
};

export const FPTU_CAMPUS_LOCATIONS: FptuCampusLocation[] = [
  {
    id: "campus-hn",
    name: "FPT University Hà Nội (Hòa Lạc)",
    shortName: "FPTU Hòa Lạc",
    region: "Miền Bắc",
    city: "Hà Nội",
    coordinates: [21.0132, 105.5262],
    currentEnrolled: 4350,
    target: 4800,
    highlightMajor: "Kỹ thuật phần mềm & AI",
  },
  {
    id: "campus-hcm",
    name: "FPT University TP. Hồ Chí Minh (Q.9)",
    shortName: "FPTU TP.HCM",
    region: "Đông Nam Bộ",
    city: "TP. Hồ Chí Minh",
    coordinates: [10.8411, 106.8099],
    currentEnrolled: 5120,
    target: 5500,
    highlightMajor: "AI, Thiết kế Mỹ thuật số & QTKD",
  },
  {
    id: "campus-dn",
    name: "FPT University Đà Nẵng",
    shortName: "FPTU Đà Nẵng",
    region: "Miền Trung",
    city: "Đà Nẵng",
    coordinates: [15.9868, 108.2612],
    currentEnrolled: 2450,
    target: 2800,
    highlightMajor: "Thiết kế Vi mạch bán dẫn & IoT",
  },
  {
    id: "campus-ct",
    name: "FPT University Cần Thơ",
    shortName: "FPTU Cần Thơ",
    region: "ĐBSCL",
    city: "Cần Thơ",
    coordinates: [10.0125, 105.7325],
    currentEnrolled: 1890,
    target: 2400,
    highlightMajor: "Công nghệ thông tin & Du lịch",
  },
  {
    id: "campus-qn",
    name: "FPT University Quy Nhơn (AI Campus)",
    shortName: "FPTU Quy Nhơn",
    region: "Miền Trung",
    city: "Bình Định",
    coordinates: [13.7915, 109.2185],
    currentEnrolled: 1180,
    target: 1500,
    highlightMajor: "Trí tuệ nhân tạo (AI Specialist)",
  },
];

function getRegionForProvince(name: string, code: string): RegionKey {
  const n = name.toLowerCase();
  if (
    n.includes("hà nội") ||
    n.includes("hải phòng") ||
    n.includes("quảng ninh") ||
    n.includes("bắc ninh") ||
    n.includes("hải dương") ||
    n.includes("hưng yên") ||
    n.includes("thái bình") ||
    n.includes("nam định") ||
    n.includes("ninh bình") ||
    n.includes("hà nam") ||
    n.includes("vĩnh phúc") ||
    n.includes("phú thọ") ||
    n.includes("thái nguyên") ||
    n.includes("bắc giang") ||
    n.includes("lạng sơn") ||
    n.includes("tuyên quang") ||
    n.includes("lào cai") ||
    n.includes("yên bái") ||
    n.includes("sơn la") ||
    n.includes("điện biên") ||
    n.includes("lai châu") ||
    n.includes("hà giang") ||
    n.includes("cao bằng") ||
    n.includes("bắc kạn") ||
    n.includes("hòa bình")
  ) {
    return "north";
  }

  if (
    n.includes("hồ chí minh") ||
    n.includes("bình dương") ||
    n.includes("đồng nai") ||
    n.includes("bà rịa") ||
    n.includes("vũng tàu") ||
    n.includes("tây ninh") ||
    n.includes("bình phước")
  ) {
    return "south";
  }

  if (
    n.includes("cần thơ") ||
    n.includes("long an") ||
    n.includes("tiền giang") ||
    n.includes("bến tre") ||
    n.includes("trà vinh") ||
    n.includes("vĩnh long") ||
    n.includes("đồng tháp") ||
    n.includes("an giang") ||
    n.includes("kiên giang") ||
    n.includes("hậu giang") ||
    n.includes("sóc trăng") ||
    n.includes("bạc liêu") ||
    n.includes("cà mau")
  ) {
    return "mekong";
  }

  if (
    n.includes("đắk lắk") ||
    n.includes("dak lak") ||
    n.includes("gia lai") ||
    n.includes("lâm đồng") ||
    n.includes("kon tum") ||
    n.includes("đắk nông")
  ) {
    return "highlands";
  }

  const codeNum = Number.parseInt(code, 10);
  if (codeNum <= 37) return "north";
  if (codeNum <= 60) return "central";
  if (codeNum <= 68) return "highlands";
  if (codeNum <= 79) return "south";
  return "mekong";
}

function generateMockHighSchools(
  provinceName: string,
  seed: number,
  directorySchools: DirectorySchoolSeed[] = [],
): HighSchoolItem[] {
  const schoolPrefixes = [
    { name: `THPT Chuyên ${provinceName}`, tier: "Tier 1" as const, rate: 8.4 },
    { name: `THPT Chu Văn An (${provinceName})`, tier: "Tier 1" as const, rate: 6.8 },
    { name: `THPT Nguyễn Huệ`, tier: "Tier 2" as const, rate: 5.2 },
    { name: `THPT Trần Phú`, tier: "Tier 2" as const, rate: 4.6 },
    { name: `THPT Lê Quý Đôn`, tier: "Tier 2" as const, rate: 4.1 },
    { name: `THPT Nguyễn Khuyến`, tier: "Tier 3" as const, rate: 2.8 },
  ];

  const schoolCount = 4 + (seed % 3);

  return schoolPrefixes.slice(0, schoolCount).map((item, idx) => {
    const directorySchool = directorySchools[idx];
    const students = 450 + ((seed * (idx + 3) * 37) % 650);
    const schoolSeed = seed + idx * 29;
    const penetrationRate = Math.min(12, Number((item.rate + ((schoolSeed % 15) / 10)).toFixed(1)));
    const prospects = Math.round(students * (0.18 + (schoolSeed % 18) / 100));
    const applications = Math.round((students * penetrationRate) / 100);
    const conversionRate = Number(((applications / prospects) * 100).toFixed(1));
    const potentialScore = Math.min(
      98,
      Math.max(58, Math.round(68 + penetrationRate * 2 + (schoolSeed % 14))),
    );
    const enrollmentForecast = Math.max(8, Math.round(applications * (0.42 + (schoolSeed % 13) / 100)));

    let status: HighSchoolItem["status"] = "active";
    if (potentialScore >= 88) status = "high-yield";
    else if (penetrationRate < 3) status = "untapped";
    else if (schoolSeed % 4 === 0) status = "needs-attention";

    const recommendation =
      status === "high-yield"
        ? "Nên ưu tiên khai thác trong 30 ngày tới"
        : status === "needs-attention"
          ? "Có tiềm năng nhưng cần tháo gỡ điểm nghẽn chuyển đổi"
          : status === "untapped"
            ? "Còn nhiều dung lượng chưa tiếp cận"
            : "Duy trì nuôi dưỡng và đo thêm tín hiệu";

    const nextAction =
      status === "high-yield"
        ? "Đặt lịch Career Talk kết hợp Parent Session"
        : status === "needs-attention"
          ? "Gọi lại đầu mối và gửi bộ học bổng theo nhóm ngành"
          : status === "untapped"
            ? "Mở điểm tư vấn lưu động tại trường"
            : "Theo dõi thêm hoạt động và bổ sung prospect";

    return {
      id: directorySchool?.id ?? `hs-${seed}-${idx}`,
      directoryId: directorySchool?.id,
      name: directorySchool?.name ?? item.name,
      district: directorySchool?.district ?? (idx === 0 ? "Trung tâm TP/Thị xã" : `Huyện trọng điểm 0${idx + 1}`),
      tier: item.tier,
      potentialScore,
      grade12Students: students,
      prospects,
      penetrationRate,
      applications,
      enrollmentForecast,
      conversionRate,
      lastActivity: idx === 0 ? "Career Talk · 12 ngày trước" : `${14 + idx * 8} ngày trước`,
      recommendation,
      nextAction,
      status,
    };
  });
}

export function toProvinceMetrics(
  province: ProvinceGeometryDocument,
  directorySchools: DirectorySchoolSeed[] = [],
): ProvinceMetrics {
  const codeNum = Number.parseInt(province.Code, 10) || 1;
  const seed = codeNum * 43 + province.Name.length * 17;
  const regionKey = getRegionForProvince(province.Name, province.Code);

  const isMajorCity =
    province.Name.includes("Hà Nội") ||
    province.Name.includes("Hồ Chí Minh") ||
    province.Name.includes("Đà Nẵng") ||
    province.Name.includes("Cần Thơ") ||
    province.Name.includes("Hải Phòng") ||
    province.Name.includes("Bình Dương") ||
    province.Name.includes("Đồng Nai");

  const opportunity = isMajorCity
    ? Math.min(95, 84 + (seed % 12))
    : Math.max(42, 45 + (seed % 48));

  const grade12Population = isMajorCity
    ? 38000 + (seed % 65000)
    : 11000 + (seed % 26000);

  const leads = Math.round(
    isMajorCity
      ? 12000 + (seed % 18000)
      : 1200 + (seed % 7500),
  );

  const conversion = Number(
    (isMajorCity ? 16 + ((seed % 120) / 10) : 5.5 + ((seed % 140) / 10)).toFixed(1),
  );

  const competition = isMajorCity
    ? 70 + (seed % 25)
    : 25 + (seed % 50);

  const revenue = Number(
    ((leads * (conversion / 100) * 48) / 1000).toFixed(1),
  );

  const penetrationRate = Number(
    (((leads * (conversion / 100)) / grade12Population) * 100).toFixed(1),
  );

  const trend = (seed % 29) - 7; // -7% to +21%

  let recommendation = "Thị trường ổn định, duy trì mức phân bổ kênh trường THPT hiện tại.";
  let keyAction = "Duy trì hoạt động định hướng nghề nghiệp theo lịch trình";

  if (opportunity >= 80) {
    recommendation =
      "Địa bàn trọng điểm ưu tiên tối đa ngân sách marketing & tăng cường 4 workshop AI tại các trường THPT Chuyên.";
    keyAction = "Mở rộng 3 điểm tư vấn lưu động & ký hợp tác ngày hội Open Day";
  } else if (conversion < 8) {
    recommendation =
      "Quy mô Lead tốt nhưng tỷ lệ nộp hồ sơ thấp do vướng tâm lý chọn trường công lập. Cần cử Đại sứ Sinh viên về trường kết nối.";
    keyAction = "Tổ chức chương trình Talkshow Trải nghiệm Học tập 1 ngày";
  } else if (competition >= 75) {
    recommendation =
      "Áp lực cạnh tranh cao từ các trường đối thủ trong vùng. Cần đẩy mạnh học bổng tài năng Talent Scholarship.";
    keyAction = "Kích hoạt gói học bổng Ươm mầm CNTT & Bán dẫn địa phương";
  }

  const highSchools = generateMockHighSchools(province.Name, seed, directorySchools);

  return {
    code: province.Code,
    name: province.Name,
    regionKey,
    opportunity,
    leads,
    conversion,
    competition,
    revenue,
    grade12Population,
    penetrationRate,
    trend,
    recommendation,
    keyAction,
    highSchools,
  };
}

export function formatMetricValue(province: ProvinceMetrics, metric: MetricKey) {
  if (metric === "opportunity") return `${province.opportunity} /100`;
  if (metric === "leads") return new Intl.NumberFormat("vi-VN").format(province.leads);
  if (metric === "conversion") return `${province.conversion}%`;
  if (metric === "competition") return `${province.competition} /100`;
  if (metric === "revenue") return `${province.revenue} tỷ`;
  return `${province.opportunity}`;
}

export function opportunityLabel(score: number) {
  if (score >= 80) return "Cơ hội rất cao";
  if (score >= 65) return "Tiềm năng lớn";
  if (score >= 50) return "Đang tăng trưởng";
  return "Cần kích cầu";
}

export function getOpportunityBadgeVariant(score: number): "success" | "primary" | "warning" | "error" {
  if (score >= 80) return "success";
  if (score >= 65) return "primary";
  if (score >= 50) return "warning";
  return "error";
}

/**
 * Returns smooth, professional choropleth hex colors with high visual contrast
 * and elegant saturation, avoiding harsh traffic-light RGB.
 */
export function getMetricColor(
  metric: MetricKey,
  value: number,
  isHovered: boolean = false,
  isSelected: boolean = false,
): string {
  if (isSelected) {
    return "#3b82f6"; // Vibrant Electric Blue when actively selected
  }

  if (metric === "opportunity") {
    // Elegant Emerald & Indigo heat gradient
    if (value >= 82) return isHovered ? "#059669" : "#10b981"; // Vibrant Emerald 500
    if (value >= 70) return isHovered ? "#0d9488" : "#14b8a6"; // Teal 500
    if (value >= 58) return isHovered ? "#2563eb" : "#3b82f6"; // Blue 500
    if (value >= 46) return isHovered ? "#d97706" : "#f59e0b"; // Warm Amber 500
    return isHovered ? "#e11d48" : "#f43f5e"; // Rose 500
  }

  if (metric === "leads") {
    // Deep Royal to Sky Cyan ramp
    if (value >= 15000) return isHovered ? "#1d4ed8" : "#2563eb";
    if (value >= 8000) return isHovered ? "#2563eb" : "#3b82f6";
    if (value >= 4000) return isHovered ? "#0284c7" : "#0ea5e9";
    if (value >= 2000) return isHovered ? "#0891b2" : "#06b6d4";
    return isHovered ? "#64748b" : "#94a3b8";
  }

  if (metric === "conversion") {
    // Mint to Emerald to Indigo ramp
    if (value >= 20) return isHovered ? "#047857" : "#10b981";
    if (value >= 14) return isHovered ? "#059669" : "#34d399";
    if (value >= 10) return isHovered ? "#0d9488" : "#2dd4bf";
    if (value >= 6) return isHovered ? "#d97706" : "#fbbf24";
    return isHovered ? "#e11d48" : "#f87171";
  }

  if (metric === "competition") {
    // Low competition = cool green/slate, High = intense violet/coral
    if (value >= 75) return isHovered ? "#be123c" : "#e11d48";
    if (value >= 60) return isHovered ? "#c2410c" : "#ea580c";
    if (value >= 45) return isHovered ? "#d97706" : "#f59e0b";
    if (value >= 30) return isHovered ? "#0d9488" : "#14b8a6";
    return isHovered ? "#059669" : "#10b981";
  }

  if (metric === "revenue") {
    // Gold, Amber & Violet ramp
    if (value >= 60) return isHovered ? "#7c3aed" : "#8b5cf6";
    if (value >= 30) return isHovered ? "#2563eb" : "#3b82f6";
    if (value >= 15) return isHovered ? "#059669" : "#10b981";
    if (value >= 8) return isHovered ? "#d97706" : "#f59e0b";
    return isHovered ? "#64748b" : "#94a3b8";
  }

  return "#94a3b8";
}
