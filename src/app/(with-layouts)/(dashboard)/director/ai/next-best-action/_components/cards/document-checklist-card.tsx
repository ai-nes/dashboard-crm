import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** DOCUMENT_REQUEST — nhắc học viên bổ sung hồ sơ. */
export default function DocumentChecklistCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.DOCUMENT_REQUEST}
      seed={action.packageSeed}
      emptyHint="Chưa có danh sách giấy tờ. Đối chiếu checklist hồ sơ của học viên."
    />
  );
}
