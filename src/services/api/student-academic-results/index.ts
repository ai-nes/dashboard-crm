import { NestApiError, nestRequest } from "../nest/nest-client";

export interface StudentAcademicResult {
  id: string;
  school_year: string;
  grade: string | null;
  academic_rank: string | null;
  gpa: number | null;
}
export interface StudentAcademicResultEdit {
  grade: "10" | "11" | "12" | null;
  academicRank: "Giỏi" | "Khá" | "Trung bình" | "Yếu" | null;
  gpa: number | null;
}
export function createStudentAcademicResult(
  studentId: string,
  edit: StudentAcademicResultEdit & { schoolYear: string },
) {
  return nestRequest<{ data: StudentAcademicResult }>(
    `/api/v1/students/${encodeURIComponent(studentId)}/academic-results`,
    { method: "POST", body: edit },
  );
}
export function updateStudentAcademicResult(
  studentId: string,
  resultId: string,
  edit: StudentAcademicResultEdit,
) {
  return nestRequest<{ data: StudentAcademicResult }>(
    `/api/v1/students/${encodeURIComponent(studentId)}/academic-results/${encodeURIComponent(resultId)}`,
    { method: "PATCH", body: edit },
  );
}
export function deleteStudentAcademicResult(
  studentId: string,
  resultId: string,
) {
  return nestRequest<void>(
    `/api/v1/students/${encodeURIComponent(studentId)}/academic-results/${encodeURIComponent(resultId)}`,
    { method: "DELETE" },
  );
}
export async function getStudentAcademicResults(
  studentId: string,
): Promise<StudentAcademicResult[]> {
  const response = await nestRequest<{
    data?: { results?: StudentAcademicResult[] };
  }>(`/api/v1/students/${encodeURIComponent(studentId)}/academic-results`);
  if (!Array.isArray(response?.data?.results))
    throw new NestApiError(
      502,
      "INVALID_ACADEMIC_RESULTS",
      "Phản hồi học bạ không hợp lệ.",
    );
  return response.data.results;
}
