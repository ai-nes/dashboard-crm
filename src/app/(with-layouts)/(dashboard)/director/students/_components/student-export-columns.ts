export const STUDENT_LIST_COLUMNS = [
  { id: "code", label: "Mã học sinh" },
  { id: "name", label: "Họ và tên" },
  { id: "province", label: "Tỉnh/TP" },
  { id: "major", label: "Ngành quan tâm" },
  { id: "status", label: "Trạng thái" },
  { id: "score", label: "Điểm tiềm năng" },
  { id: "owner", label: "Người phụ trách" },
] as const;
export type StudentExportColumnId = (typeof STUDENT_LIST_COLUMNS)[number]["id"];
