import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** CAMPUS_VISIT — mời học viên tham quan cơ sở. */
export default function CampusVisitCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.CAMPUS_VISIT}
      seed={action.packageSeed}
      emptyHint="Chưa có kế hoạch tham quan. Chuẩn bị dựa trên bối cảnh học viên ở trên."
    />
  );
}
