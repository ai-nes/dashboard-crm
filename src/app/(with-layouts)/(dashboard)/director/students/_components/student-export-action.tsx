"use client";
import { Button } from "@/components/tailgrids/core/button";

export function StudentExportAction({
  canExport,
  onOpen,
}: {
  canExport: boolean;
  onOpen: () => void;
}) {
  return canExport ? (
    <Button appearance="outline" onPress={onOpen}>
      Xuất Excel
    </Button>
  ) : null;
}
