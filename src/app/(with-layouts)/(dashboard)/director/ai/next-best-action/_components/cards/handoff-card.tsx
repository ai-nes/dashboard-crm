import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** HANDOFF — chuyển việc cho bộ phận phù hợp. */
export default function HandoffCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.HANDOFF}
      seed={action.packageSeed}
      emptyHint="Chưa có nội dung bàn giao. Tóm tắt bối cảnh và việc còn dở cho bộ phận tiếp nhận."
    />
  );
}
