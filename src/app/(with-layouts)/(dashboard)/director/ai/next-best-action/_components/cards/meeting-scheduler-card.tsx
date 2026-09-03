import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** MEETING — cuộc gặp trực tiếp. */
export default function MeetingSchedulerCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.MEETING}
      seed={action.packageSeed}
      emptyHint="Chưa có nội dung cuộc gặp. Chuẩn bị dựa trên bối cảnh học viên ở trên."
    />
  );
}
