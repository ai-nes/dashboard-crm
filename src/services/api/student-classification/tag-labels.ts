import {
  TAG_CATEGORY_LABEL,
  TAG_SUBTYPE_LABEL,
  TagSubtype,
} from "./classification-types";

export {
  TAG_CATEGORY_LABEL,
  TAG_SUBTYPE_LABEL,
  TagCategory,
  TagSubtype,
} from "./classification-types";

// Backward-compatible alias; Frappe record names remain the IDs sent to the API.
export { TagSubtype as StudentTagCode } from "./classification-types";

export const STUDENT_TAG_LABELS: Record<TagSubtype, string> = TAG_SUBTYPE_LABEL;
export const STUDENT_TAG_GROUP_LABELS: Record<string, string> =
  TAG_CATEGORY_LABEL;

export function getKnownStudentTagLabel(value: string): string | undefined {
  const code = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  return Object.hasOwn(STUDENT_TAG_LABELS, code)
    ? STUDENT_TAG_LABELS[code as TagSubtype]
    : undefined;
}

export function getStudentTagLabel(tag: {
  code?: string | null;
  label?: string | null;
}): string {
  return (
    getKnownStudentTagLabel(tag.code ?? "") ??
    getKnownStudentTagLabel(tag.label ?? "") ??
    (tag.label?.trim() || undefined) ??
    "Tag chưa đặt tên"
  );
}

export function getStudentTagGroupLabel(group: string): string {
  return STUDENT_TAG_GROUP_LABELS[group] ?? group;
}

export function normalizeTagSearch(value: string): string {
  return value
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}
