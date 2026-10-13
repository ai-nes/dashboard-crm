import type { ProfileOption } from "@/services/api/profile-options";
import type { DropdownOption } from "./dropdown-field";

export function profileOptionItems(
  rows: Pick<ProfileOption, "id" | "name" | "code">[],
  current: string,
): DropdownOption[] {
  const items: DropdownOption[] = [{ id: "", label: "Chưa nhập" }];
  if (current && !rows.some((row) => row.name === current)) {
    items.push({
      id: current,
      label: current,
      description: "Giá trị hiện có trong hồ sơ",
    });
  }
  return [
    ...items,
    ...rows.map((row) => ({
      id: row.name,
      label: row.name,
      searchText: `${row.name} ${row.code}`,
    })),
  ];
}
