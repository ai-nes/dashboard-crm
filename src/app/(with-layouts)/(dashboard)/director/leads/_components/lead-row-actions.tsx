"use client";

import { TableRowActions } from "@/components/common/table-row-actions";
import { leadEditHref } from "./lead-source-navigation";

interface LeadRowActionsProps {
  label: string;
  detailHref: string;
  canEdit: boolean;
  onDelete?: () => void;
  isDeleting: boolean;
}

export default function LeadRowActions({
  label,
  detailHref,
  canEdit,
  onDelete,
  isDeleting,
}: LeadRowActionsProps) {
  return (
    <TableRowActions
      label={`Lead ${label}`}
      actions={[
        { id: "view", label: "Xem chi tiết", href: detailHref },
        {
          id: "edit",
          label: "Chỉnh sửa",
          href: leadEditHref(detailHref),
          isVisible: canEdit,
        },
        {
          id: "delete",
          label: "Xóa",
          onAction: onDelete,
          variant: "danger",
          isDisabled: isDeleting,
        },
      ]}
    />
  );
}
