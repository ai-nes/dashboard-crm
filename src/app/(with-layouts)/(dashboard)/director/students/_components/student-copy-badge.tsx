"use client";

import { CheckCircle1, Copy1 } from "@tailgrids/icons";
import { useState, type ComponentType, type ReactNode } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";

interface StudentCopyBadgeProps {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  children: ReactNode;
  className?: string;
  showLeadingIcon?: boolean;
}

export default function StudentCopyBadge({
  label,
  value,
  icon: Icon,
  children,
  className,
  showLeadingIcon = true,
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
      className={cn(
        "h-6 max-w-full rounded-full bg-background-soft-50 px-2 text-xs text-text-secondary",
        className,
      )}
      onPress={() => void copyValue()}
      size="xs"
      variant="primary"
    >
      {showLeadingIcon && <Icon size={13} aria-hidden />}
      <span className="truncate">{isCopied ? "Đã sao chép" : children}</span>
      {isCopied ? (
        <CheckCircle1 size={13} aria-hidden />
      ) : (
        <Copy1 size={13} aria-hidden />
      )}
    </Button>
  );
}
