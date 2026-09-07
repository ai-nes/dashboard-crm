"use client";

import { CheckCircle1, Copy1 } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";

interface CopyableIdProps {
  label: string;
  value?: string | null;
  maxLength?: number;
  className?: string;
}

function shortenId(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export function CopyableId({
  label,
  value,
  maxLength = 25,
  className,
}: CopyableIdProps) {
  const [isCopied, setIsCopied] = useState(false);
  const fullValue = value?.trim() || "-";
  const canCopy = fullValue !== "-";
  const displayValue = shortenId(fullValue, maxLength);

  const copyValue = async () => {
    if (!canCopy || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(fullValue);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <span
        className="min-w-0 truncate text-sm font-medium text-text-primary"
        title={fullValue}
      >
        {displayValue}
      </span>
      <Button
        aria-label={`Sao chép ${label}`}
        className="shrink-0 text-text-tertiary"
        iconOnly
        isDisabled={!canCopy}
        onPress={() => void copyValue()}
        size="xs"
        variant="ghost"
      >
        {isCopied ? (
          <CheckCircle1 size={14} aria-hidden="true" />
        ) : (
          <Copy1 size={14} aria-hidden="true" />
        )}
      </Button>
      {isCopied && <span className="sr-only">Đã sao chép {label}</span>}
    </div>
  );
}
