import { CARD_SPECS } from "./card-specs";
import type { ActionCardProps } from "./card-types";
import { TypedPackageCard } from "./typed-package-card";

/** APPLICATION_SUPPORT — hỗ trợ học viên hoàn thiện hồ sơ ứng tuyển. */
export default function ApplicationSupportCard({ action }: ActionCardProps) {
  return (
    <TypedPackageCard
      fields={CARD_SPECS.APPLICATION_SUPPORT}
      seed={action.packageSeed}
      emptyHint="Chưa có chi tiết hỗ trợ. Rà soát các bước hồ sơ còn dở của học viên."
    />
  );
}
