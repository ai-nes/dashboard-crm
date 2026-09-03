import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** EVENT_INVITE — mời học viên tham dự sự kiện. */
export default function EventInviteCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.EVENT_INVITE}
      seed={action.packageSeed}
      emptyHint="Chưa có nội dung lời mời. Mời dựa trên bối cảnh học viên ở trên."
    />
  );
}
