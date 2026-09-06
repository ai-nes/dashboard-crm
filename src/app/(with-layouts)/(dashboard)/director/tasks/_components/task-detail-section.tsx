"use client";

import { ChevronDown, ChevronRight, Gear1 } from "@tailgrids/icons";
import { useId, useState, type ReactNode } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";

interface TaskDetailSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function TaskDetailSection({
  title,
  children,
  defaultOpen = true,
}: TaskDetailSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="overflow-hidden rounded-lg border border-card-border bg-card-background">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <Button
          variant="ghost"
          appearance="ghost"
          size="sm"
          className="h-8 min-w-0 justify-start gap-2 px-0 font-semibold text-text-primary hover:bg-transparent"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onPress={() => setIsOpen((current) => !current)}
        >
          {isOpen ? (
            <ChevronDown size={16} aria-hidden="true" />
          ) : (
            <ChevronRight size={16} aria-hidden="true" />
          )}
          <span className="truncate">{title}</span>
        </Button>
        <Gear1
          size={16}
          aria-hidden="true"
          className="shrink-0 text-text-tertiary"
        />
      </div>

      <div
        id={contentId}
        className={cn("border-t border-card-border/80", !isOpen && "hidden")}
      >
        {children}
      </div>
    </section>
  );
}
