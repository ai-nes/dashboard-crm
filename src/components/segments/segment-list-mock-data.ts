import type { SegmentListItem } from "./segment-list-types";

export const MOCK_SEGMENTS: SegmentListItem[] = [
  {
    id: "hoc-sinh-quan-tam-cntt",
    name: "Học sinh quan tâm Công nghệ thông tin",
    size: 1248,
    type: "AUTOMATIC",
    updatedAt: "2026-09-08T09:30:00+07:00",
    creator: "Nguyễn Minh Anh",
    usedIn: 3,
    description: "Nhóm học sinh quan tâm ngành Công nghệ thông tin.",
  },
  {
    id: "hoc-sinh-tiem-nang-tphcm",
    name: "Học sinh tiềm năng tại TP. Hồ Chí Minh",
    size: 386,
    type: "AUTOMATIC",
    updatedAt: "2026-09-08T08:15:00+07:00",
    creator: "Trần Quốc Bảo",
    usedIn: 2,
    description: "Nhóm học sinh có mức độ quan tâm cao tại TP. Hồ Chí Minh.",
  },
  {
    id: "tham-du-open-day-thang-9",
    name: "Học sinh tham dự Open Day tháng 9",
    size: 152,
    type: "MANUAL",
    updatedAt: "2026-09-07T16:45:00+07:00",
    creator: "Lê Thu Hà",
    usedIn: 0,
    description: "Danh sách học sinh tham dự sự kiện Open Day tháng 9.",
  },
];
