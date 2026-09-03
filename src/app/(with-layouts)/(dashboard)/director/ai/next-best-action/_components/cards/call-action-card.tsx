import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** CALL — cuộc gọi tư vấn trực tiếp với học viên. */
export default function CallActionCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.CALL}
      seed={action.packageSeed}
      emptyHint="Chưa có kịch bản chi tiết cho cuộc gọi. Trao đổi dựa trên bối cảnh học viên ở trên."
    />
  );
}
