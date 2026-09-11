"use client";

import { BoxArchive1 } from "@tailgrids/icons";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { useArchiveCrmRuleVersionMutation } from "@/hooks/use-rules-config-queries";
import type { CrmRuleVersion } from "@/services/api/rules-config";

interface RuleVersionArchiveButtonProps {
  version: CrmRuleVersion;
  canEdit: boolean;
  onChanged: (version: CrmRuleVersion) => void;
}

export function RuleVersionArchiveButton({
  version,
  canEdit,
  onChanged,
}: RuleVersionArchiveButtonProps) {
  const archiveMutation = useArchiveCrmRuleVersionMutation();
  const isDisabled =
    !canEdit ||
    archiveMutation.isPending ||
    version.status === "archived" ||
    version.isActive;

  const archive = async () => {
    if (
      isDisabled ||
      !window.confirm("Lưu trữ Version này và các Rule bên trong?")
    ) {
      return;
    }

    const reason = window.prompt("Nhập lý do lưu trữ Version:")?.trim();
    if (!reason) {
      toast.error("Cần nhập lý do lưu trữ Version.");
      return;
    }

    try {
      const updated = await archiveMutation.mutateAsync({
        name: version.name,
        expectedRevision: version.revision,
        reason,
      });
      toast.success("Đã lưu trữ Version.");
      onChanged(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu trữ Version.",
      );
    }
  };

  if (version.status === "archived" || version.isActive) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      appearance="ghost"
      iconOnly
      size="sm"
      isDisabled={isDisabled}
      className="gap-1.5 text-text-tertiary hover:text-error-500"
      aria-label={`Lưu trữ Version ${version.versionName}`}
      onPress={() => void archive()}
    >
      <BoxArchive1 size={16} aria-hidden="true" />
    </Button>
  );
}
