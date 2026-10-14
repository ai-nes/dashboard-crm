import { nestRequest } from "./nest/nest-client";

export const PROFILE_OPTION_LABELS = {
  nationality: "Quốc tịch",
  ethnicity: "Dân tộc",
  religion: "Tôn giáo",
  idIssuedPlace: "Nơi cấp giấy tờ",
} as const;
export type ProfileOptionType = keyof typeof PROFILE_OPTION_LABELS;
export interface ProfileOptionInput {
  type: ProfileOptionType;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}
export interface ProfileOption extends ProfileOptionInput {
  id: string;
}
interface CatalogPage {
  data: ProfileOption[];
  meta: { pagination: { page: number; pageSize: number; total: number } };
}
const PATH = "/api/v1/reference-data/profile-options";

export function listProfileOptions(
  query: {
    type: ProfileOptionType;
    page?: number;
    pageSize?: number;
    q?: string;
    isActive?: "true" | "false";
  },
  signal?: AbortSignal,
) {
  return nestRequest<CatalogPage>(PATH, { query, signal });
}

export function getActiveProfileOptions(
  type: ProfileOptionType,
  signal?: AbortSignal,
) {
  return getAllProfileOptions(type, signal, "true");
}

export async function getAllProfileOptions(
  type: ProfileOptionType,
  signal?: AbortSignal,
  isActive?: "true" | "false",
): Promise<ProfileOption[]> {
  const rows: ProfileOption[] = [];
  for (let page = 1; ; page++) {
    const response = await listProfileOptions(
      { type, isActive, page, pageSize: 500 },
      signal,
    );
    rows.push(...response.data);
    if (
      page * 500 >= response.meta.pagination.total ||
      response.data.length === 0
    )
      return rows;
  }
}

export function saveProfileOption(
  input: ProfileOptionInput,
): Promise<ProfileOption>;
export function saveProfileOption(
  input: Partial<ProfileOptionInput>,
  id: string,
): Promise<ProfileOption>;
export async function saveProfileOption(
  input: Partial<ProfileOptionInput>,
  id?: string,
) {
  return (
    await nestRequest<{ data: ProfileOption }>(
      id ? `${PATH}/${encodeURIComponent(id)}` : PATH,
      {
        method: id ? "PATCH" : "POST",
        body: input,
      },
    )
  ).data;
}

export async function deleteProfileOption(id: string) {
  await nestRequest(`${PATH}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function saveProfileOptionsOrder(
  items: readonly Pick<ProfileOption, "id">[],
) {
  const results = await Promise.allSettled(
    items.map((item, index) =>
      saveProfileOption({ sortOrder: index + 1 }, item.id),
    ),
  );
  const failure = results.find((result) => result.status === "rejected");
  if (failure?.status === "rejected") throw failure.reason;
}
