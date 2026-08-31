"use client";

import { RefreshCircle1Clockwise } from "@tailgrids/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";

interface RefreshButtonProps {
  showLabel?: boolean;
}

export default function RefreshButton({ showLabel = false }: RefreshButtonProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      await queryClient.refetchQueries({ type: "active" }, { throwOnError: true });
      router.refresh();
      toast.success("Đã làm mới dữ liệu.");
    } catch {
      toast.error("Không thể làm mới dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      type="button"
      iconOnly={!showLabel}
      size="sm"
      appearance="outline"
      aria-label="Làm mới dữ liệu"
      isDisabled={isRefreshing}
      onPress={handleRefresh}
      className={showLabel
        ? "rounded-lg border border-card-border bg-card-background px-3 text-icon-primary shadow-xs focus-visible:border-input-primary-focus-border focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 [&>svg]:size-4"
        : "size-8.5 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs focus-visible:border-input-primary-focus-border focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 [&>svg]:size-4"}
    >
      <RefreshCircle1Clockwise className={isRefreshing ? "animate-spin" : undefined} />
      {showLabel ? "Làm mới" : null}
    </Button>
  );
}
