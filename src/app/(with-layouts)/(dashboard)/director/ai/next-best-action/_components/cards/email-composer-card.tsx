import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** EMAIL — thư tư vấn gửi học viên. */
export default function EmailComposerCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.EMAIL}
      seed={action.packageSeed}
      emptyHint="Chưa có bản nháp email. Soạn nội dung dựa trên bối cảnh học viên ở trên."
    />
  );
}
