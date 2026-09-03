import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** COUNSELING — buổi tư vấn chuyên sâu. */
export default function CounselingCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.COUNSELING}
      seed={action.packageSeed}
      emptyHint="Chưa có dàn ý buổi tư vấn. Chuẩn bị dựa trên bối cảnh học viên ở trên."
    />
  );
}
