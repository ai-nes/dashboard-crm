"use client";

import { ChevronDown, ChevronRight } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";

import StudentInteractionDetail from "./student-interaction-detail";

interface StudentActivityAiInsightProps {
  interactionIds: string[];
}

export default function StudentActivityAiInsight({
  interactionIds,
}: StudentActivityAiInsightProps) {
  const [expanded, setExpanded] = useState(false);

  if (interactionIds.length === 0) return null;

  return (
    <section className="mt-4 rounded-lg border border-card-border bg-background-gray-secondary/25">
      <Button
        type="button"
        appearance="ghost"
        size="sm"
        className="min-h-11 w-full justify-start gap-2 rounded-lg px-3 text-left font-medium text-text-primary"
        aria-expanded={expanded}
        onPress={() => setExpanded((current) => !current)}
      >
        {expanded ? (
          <ChevronDown size={16} aria-hidden="true" />
        ) : (
          <ChevronRight size={16} aria-hidden="true" />
        )}
        Nhận định tuyển sinh
        <span className="text-xs font-normal text-text-tertiary">
          {interactionIds.length > 1
            ? `${interactionIds.length} hoạt động liên quan`
            : "Mở để xem nhận định"}
        </span>
      </Button>

      {expanded ? (
        <div className="border-t border-card-border">
          {interactionIds.map((interactionId) => (
            <StudentInteractionDetail
              key={interactionId}
              interactionId={interactionId}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
