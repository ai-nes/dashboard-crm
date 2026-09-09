"use client";

import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";

import StudentInteractionDetail from "./student-interaction-detail";

interface CanonicalCallAnalysisProps {
  interactionId?: string | null;
}

export default function StudentCanonicalCallAnalysis({
  interactionId,
}: CanonicalCallAnalysisProps) {
  const [open, setOpen] = useState(false);
  const normalizedInteractionId = interactionId?.trim();

  if (!normalizedInteractionId) return null;

  return (
    <div className="space-y-3 border-t border-card-border pt-4">
      <Button
        type="button"
        appearance="outline"
        size="sm"
        aria-expanded={open}
        onPress={() => setOpen((current) => !current)}
      >
        {open ? "Ẩn phân tích CRM" : "Xem phân tích CRM"}
      </Button>
      {open ? (
        <StudentInteractionDetail interactionId={normalizedInteractionId} />
      ) : null}
    </div>
  );
}
