import type { SchoolClassification } from "./types";

export const POTENTIAL_THRESHOLD = 82;
export const RELATIONSHIP_THRESHOLD = 60;

export function classifySchool(potentialScore: number, relationshipScore: number): SchoolClassification {
  if (potentialScore >= POTENTIAL_THRESHOLD && relationshipScore >= RELATIONSHIP_THRESHOLD) return "Trọng điểm";
  if (potentialScore >= POTENTIAL_THRESHOLD) return "Mở rộng";
  if (relationshipScore >= RELATIONSHIP_THRESHOLD) return "Duy trì";
  return "Sàng lọc";
}
