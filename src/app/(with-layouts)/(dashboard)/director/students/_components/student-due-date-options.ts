export const dueDateQuickOptions = [
  { label: "Ngày mai", daysFromNow: 1 },
  { label: "Trong 2 ngày", daysFromNow: 2 },
  { label: "Trong 3 ngày", daysFromNow: 3 },
] as const;

export function getDateInputValue(daysFromNow: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
