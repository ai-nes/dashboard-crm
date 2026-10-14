import type {
  ProfileOption,
  ProfileOptionInput,
} from "@/services/api/profile-options";

export function profileOptionChanges(
  input: ProfileOptionInput,
  current: ProfileOption,
): Partial<ProfileOptionInput> {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) =>
      key === "name"
        ? value !== current.name.trim()
        : value !== current[key as keyof ProfileOptionInput],
    ),
  );
}
