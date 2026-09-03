import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** MESSAGE — tin nhắn nhanh qua kênh học viên đang dùng. */
export default function MessageComposerCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.MESSAGE}
      seed={action.packageSeed}
      emptyHint="Chưa có bản nháp tin nhắn. Nhắn dựa trên bối cảnh học viên ở trên."
    />
  );
}
