"use client";

import { CheckCircle1 } from "@tailgrids/icons";
import { useState, type ComponentType, type ReactNode } from "react";

import { Button } from "@/components/tailgrids/core/button";

interface StudentCopyBadgeProps {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  children: ReactNode;
}

export default function StudentCopyBadge({
  label,
  value,
  icon: Icon,
  children,
}: StudentCopyBadgeProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyValue = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <Button
      appearance="ghost"
      aria-label={`Sao chép ${label}`}
      className="h-6 max-w-full rounded-full bg-background-soft-50 px-2 text-xs text-text-secondary"
      onPress={() => void copyValue()}
      size="xs"
      title={`${label}: ${value}`}
      variant="primary"
    >
      {isCopied ? (
        <CheckCircle1 size={13} aria-hidden="true" />
      ) : (
        <Icon size={13} aria-hidden="true" />
      )}
      <span className="truncate">{isCopied ? "Đã sao chép" : children}</span>
    </Button>
  );
}
