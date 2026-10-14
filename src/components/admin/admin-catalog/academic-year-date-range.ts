const ADMISSION_YEAR_DATE_RANGE_ERROR =
  "Ngày kết thúc không được trước ngày bắt đầu.";

export function getAdmissionYearDateRangeError(
  startDate: string,
  endDate: string,
): string | null {
  return startDate && endDate && endDate < startDate
    ? ADMISSION_YEAR_DATE_RANGE_ERROR
    : null;
}
