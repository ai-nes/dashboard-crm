import type { StudentListItem } from "@/services/api/students/types";

import {
  JourneyStage,
  LeadNeedCategory,
  LeadNeedSubtype,
  SegmentLevel,
  SegmentOperator,
  StudentSegmentProperty,
} from "./segment-filter-config";
import type {
  SegmentOverviewData,
  SegmentStudent,
} from "./segment-detail-types";
import { studentJourneyStage } from "./segment-filter-matching";

export const MOCK_SEGMENT_OVERVIEWS: Record<string, SegmentOverviewData> = {
  "hoc-sinh-quan-tam-cntt": {
    createdAt: "2026-09-01T08:00:00+07:00",
    groupLogic: "OR",
    groups: [
      {
        id: "intent-high",
        name: "Nhóm 1",
        logic: "AND",
        conditions: [
          {
            id: "intent",
            property: StudentSegmentProperty.INTENT,
            operator: SegmentOperator.IS_ANY_OF,
            value: [SegmentLevel.HIGH],
          },
        ],
      },
      {
        id: "need-information",
        name: "Nhóm 2",
        logic: "AND",
        conditions: [
          {
            id: "need",
            property: StudentSegmentProperty.NEED,
            operator: SegmentOperator.IS_ANY_OF,
            category: LeadNeedCategory.NEED_INFORMATION,
            value: [LeadNeedSubtype.PROGRAM_INFORMATION],
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
            id: "potential",
            property: StudentSegmentProperty.POTENTIAL,
            operator: SegmentOperator.IS_ANY_OF,
            value: [SegmentLevel.HIGH],
          },
          {
            id: "stage",
            property: StudentSegmentProperty.JOURNEY_STAGE,
            operator: SegmentOperator.IS_ANY_OF,
            value: [JourneyStage.QUALIFIED],
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
        id: "need-engagement",
        name: "Nhóm 1",
        logic: "AND",
        conditions: [
          {
            id: "need",
            property: StudentSegmentProperty.NEED,
            operator: SegmentOperator.IS_ANY_OF,
            category: LeadNeedCategory.NEED_ENGAGEMENT,
            value: [LeadNeedSubtype.EVENT_ENGAGEMENT],
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
const STAGES = [
  JourneyStage.NEW,
  JourneyStage.ATTEMPTING,
  JourneyStage.CONNECTED,
  JourneyStage.QUALIFIED,
];
const MAJORS = [
  "Kỹ thuật phần mềm",
  "Khoa học máy tính",
  "Quản trị kinh doanh",
  "Marketing số",
];
const OWNERS = [
  "Nguyễn Thị Hạnh",
  "Trần Văn Khoa",
  "Lê Minh Thư",
  "Phạm Đức Anh",
];
const NEXT_ACTIONS = [
  "Gọi tư vấn",
  "Gửi thông tin học phí",
  "Mời tham dự Open Day",
  "Theo dõi hồ sơ",
];

// Deterministic UI fixtures: the table total matches the existing segment size.
export function getMockSegmentStudents(
  segmentId: string,
  size: number,
): SegmentStudent[] {
  return Array.from({ length: size }, (_, index) => ({
    id: `${segmentId}-${String(index + 1).padStart(4, "0")}`,
    name: `${FAMILY_NAMES[Math.floor(index / GIVEN_NAMES.length) % FAMILY_NAMES.length]} ${GIVEN_NAMES[index % GIVEN_NAMES.length]}`,
    phone: `090100${String(index + 1).padStart(4, "0")}`,
    stage: STAGES[index % STAGES.length],
    major: MAJORS[index % MAJORS.length],
    potentialScore: 40 + ((index * 7) % 61),
    owner: OWNERS[index % OWNERS.length],
    nextAction: NEXT_ACTIONS[index % NEXT_ACTIONS.length],
  }));
}

// StudentListItem has no phone field yet; derive a stable mock number from
// the student's own id so the same student always shows the same phone.
function mockPhoneForStudent(student: StudentListItem): string {
  const hash = Array.from(student.id).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return `09${String(10000000 + (hash % 90000000))}`;
}

// Maps a real matched student (from the filter engine) into the shape the
// segment detail table renders.
export function toSegmentStudent(student: StudentListItem): SegmentStudent {
  return {
    id: student.id,
    name: student.name,
    phone: mockPhoneForStudent(student),
    stage: (studentJourneyStage(student) as JourneyStage) ?? JourneyStage.NEW,
    major: student.major,
    potentialScore: student.score,
    owner: student.owner,
    nextAction: student.nextAction,
  };
}
