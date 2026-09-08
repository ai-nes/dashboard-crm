import {
  JourneyStage,
  SegmentOperator,
  StudentSegmentProperty,
} from "./segment-filter-config";
import type {
  SegmentOverviewData,
  SegmentStudent,
} from "./segment-detail-types";

export const MOCK_SEGMENT_OVERVIEWS: Record<string, SegmentOverviewData> = {
  "hoc-sinh-quan-tam-cntt": {
    createdAt: "2026-09-01T08:00:00+07:00",
    groupLogic: "OR",
    groups: [
      {
        id: "program-software",
        name: "Nhóm 1",
        logic: "AND",
        conditions: [
          {
            id: "software",
            property: StudentSegmentProperty.PROGRAM_INTEREST,
            operator: SegmentOperator.IS_ANY_OF,
            value: ["SOFTWARE_ENGINEERING"],
          },
        ],
      },
      {
        id: "program-computer",
        name: "Nhóm 2",
        logic: "AND",
        conditions: [
          {
            id: "computer",
            property: StudentSegmentProperty.PROGRAM_INTEREST,
            operator: SegmentOperator.IS_ANY_OF,
            value: ["COMPUTER_SCIENCE"],
          },
        ],
      },
    ],
  },
  "hoc-sinh-tiem-nang-tphcm": {
    createdAt: "2026-09-03T10:00:00+07:00",
    groupLogic: "OR",
    groups: [
      {
        id: "potential",
        name: "Nhóm 1",
        logic: "AND",
        conditions: [
          {
            id: "province",
            property: StudentSegmentProperty.PROVINCE_AREA,
            operator: SegmentOperator.IS_ANY_OF,
            value: ["HO_CHI_MINH"],
          },
          {
            id: "score",
            property: StudentSegmentProperty.LEAD_SCORE,
            operator: SegmentOperator.GREATER_THAN_OR_EQUAL,
            value: "80",
          },
        ],
      },
    ],
  },
  "tham-du-open-day-thang-9": {
    createdAt: "2026-09-05T09:00:00+07:00",
    groupLogic: "OR",
    groups: [
      {
        id: "open-day",
        name: "Nhóm 1",
        logic: "AND",
        conditions: [
          {
            id: "source",
            property: StudentSegmentProperty.SOURCE,
            operator: SegmentOperator.IS_ANY_OF,
            value: ["OPEN_DAY"],
          },
        ],
      },
    ],
  },
};

const FAMILY_NAMES = [
  "Nguyễn",
  "Trần",
  "Lê",
  "Phạm",
  "Hoàng",
  "Vũ",
  "Đặng",
  "Bùi",
  "Đỗ",
  "Huỳnh",
  "Phan",
  "Võ",
];
const GIVEN_NAMES = [
  "Minh Anh",
  "Quốc Bảo",
  "Ngọc Linh",
  "Gia Hân",
  "Đức Minh",
  "Khánh Vy",
  "Anh Tuấn",
  "Thanh Tâm",
  "Bảo Ngọc",
  "Hoàng Nam",
  "Thảo Nhi",
  "Hải Đăng",
];
const SCHOOLS = [
  "THPT chuyên Lê Hồng Phong",
  "THPT Nguyễn Thượng Hiền",
  "THPT chuyên Trần Đại Nghĩa",
  "THPT Gia Định",
];
const STAGES = [
  JourneyStage.NEW,
  JourneyStage.ATTEMPTING,
  JourneyStage.CONNECTED,
  JourneyStage.QUALIFIED,
];

// Deterministic UI fixtures: the table total matches the existing segment size.
export function getMockSegmentStudents(
  segmentId: string,
  size: number,
): SegmentStudent[] {
  return Array.from({ length: size }, (_, index) => ({
    id: `${segmentId}-${String(index + 1).padStart(4, "0")}`,
    name: `${FAMILY_NAMES[Math.floor(index / GIVEN_NAMES.length) % FAMILY_NAMES.length]} ${GIVEN_NAMES[index % GIVEN_NAMES.length]}`,
    school: SCHOOLS[index % SCHOOLS.length],
    phone: `090100${String(index + 1).padStart(4, "0")}`,
    stage: STAGES[index % STAGES.length],
  }));
}
