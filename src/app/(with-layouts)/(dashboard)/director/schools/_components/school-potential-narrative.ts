import type {
  SchoolIntelligenceData,
  SchoolPotentialIndicator,
} from "@/services/api/schools/types";

import { displaySchoolValue } from "./school-analysis-display";

export function buildSchoolPotentialNarrative(
  data: SchoolIntelligenceData,
  statusText: string | undefined,
): string {
  const indicators = (data.potentialIndicators ?? []).filter(
    (
      indicator,
    ): indicator is SchoolPotentialIndicator & {
      score: number;
    } =>
      typeof indicator.score === "number" && Number.isFinite(indicator.score),
  );
  const strongestIndicator = indicators.reduce(
    (strongest, indicator) =>
      !strongest || indicator.score > strongest.score ? indicator : strongest,
    null as (typeof indicators)[number] | null,
  );
  const weakestIndicator = indicators.reduce(
    (weakest, indicator) =>
      !weakest || indicator.score < weakest.score ? indicator : weakest,
    null as (typeof indicators)[number] | null,
  );
  const schoolName = displaySchoolValue(data.school.name) ?? "Trường học";
  const availableStudents = displaySchoolValue(data.availableStudents);
  const grade12Students = displaySchoolValue(data.grade12Students);
  const recommendedMajorGroup = displaySchoolValue(
    data.subjectMix.recommendedMajorGroup,
  );
  const hasPotentialScore =
    typeof data.potentialScore === "number" &&
    Number.isFinite(data.potentialScore);
  const sentences = [
    hasPotentialScore
      ? `${schoolName} đang được đánh giá ở mức ${statusText ?? "chưa xác định"}.`
      : `${schoolName} hiện chưa có dữ liệu điểm tiềm năng.`,
    strongestIndicator
      ? `Động lực nổi bật đến từ ${strongestIndicator.label} (${strongestIndicator.score}/100), cho thấy trường có nền tảng tốt để phát triển thêm các điểm chạm tuyển sinh.`
      : null,
    weakestIndicator && weakestIndicator.id !== strongestIndicator?.id
      ? `Chỉ số cần theo dõi là ${weakestIndicator.label} (${weakestIndicator.score}/100) để tối ưu hiệu quả đầu tư trong giai đoạn tiếp theo.`
      : null,
    availableStudents && grade12Students
      ? `Quy mô hiện có ${availableStudents} học sinh khả dụng trên ${grade12Students} học sinh khối 12.`
      : null,
    recommendedMajorGroup
      ? `Nên ưu tiên nội dung hướng nghiệp xoay quanh nhóm ngành ${recommendedMajorGroup}.`
      : null,
  ];

  return sentences.filter(Boolean).join(" ");
}
