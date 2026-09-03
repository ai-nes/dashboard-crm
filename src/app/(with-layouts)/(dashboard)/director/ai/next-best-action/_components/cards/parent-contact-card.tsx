import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** PARENT_CONTACT — trao đổi với phụ huynh. */
export default function ParentContactCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.PARENT_CONTACT}
      seed={action.packageSeed}
      emptyHint="Chưa có nội dung trao đổi với phụ huynh. Chuẩn bị dựa trên bối cảnh học viên ở trên."
    />
  );
}
