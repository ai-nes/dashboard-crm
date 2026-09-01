"use client";

import {
  CheckCircle1,
  ChevronDown,
  InfoTriangle,
  Shield1Check,
  Sparkle,
} from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type { AnalysisClaim } from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import { claimKindMeta, formatClaimConfidence } from "./analysis-run-meta";

interface AnalysisClaimCardProps {
  claim: AnalysisClaim;
}

export default function AnalysisClaimCard({ claim }: AnalysisClaimCardProps) {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const meta = claimKindMeta[claim.claimKind];
  const confidenceInfo = formatClaimConfidence(claim.confidence);
  const isRecommendation = claim.claimKind === "recommendation";

  const handleCopy = () => {
    navigator.clipboard.writeText(claim.statement);
    setCopied(true);
    toast.success("Đã sao chép đề xuất.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="border-b border-card-border py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <ClaimIcon kind={claim.claimKind} />
          <span>{meta.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {confidenceInfo && (
            <Badge color={confidenceInfo.color} size="sm">
              {confidenceInfo.label}
            </Badge>
          )}
          {claim.visibilityLabel === "source_scoped" && (
            <Badge color="gray" size="sm">
              Theo phạm vi nguồn
            </Badge>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm leading-6 text-text-primary text-pretty">
        {claim.statement}
      </p>

      {(claim.provenanceIds.length > 0 || isRecommendation) && (
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {claim.provenanceIds.length > 0 && (
            <Button
              size="xs"
              appearance="ghost"
              onPress={() => setShowSources((current) => !current)}
              aria-expanded={showSources}
              className="text-text-secondary hover:text-text-primary"
            >
              <Shield1Check
                size={14}
                className="text-success-500"
                aria-hidden="true"
              />
              {claim.provenanceIds.length} nguồn
              <ChevronDown
                size={13}
                className={cn(
                  "transition-transform duration-200",
                  showSources && "rotate-180",
                )}
                aria-hidden="true"
              />
            </Button>
          )}
          {isRecommendation && (
            <Button
              size="xs"
              appearance="ghost"
              onPress={handleCopy}
              className="text-text-secondary hover:text-text-primary"
            >
              {copied ? (
                <CheckCircle1
                  size={14}
                  className="text-success-500"
                  aria-hidden="true"
                />
              ) : null}
              {copied ? "Đã chép" : "Sao chép"}
            </Button>
          )}
        </div>
      )}

      {showSources && claim.provenanceIds.length > 0 && (
        <div className="mt-3 rounded-lg bg-background-soft-50 p-3 text-xs text-text-secondary">
          <p className="font-medium text-text-primary">Nguồn đối soát</p>
          <ul className="mt-2 space-y-1 font-mono text-[11px] text-text-secondary">
            {claim.provenanceIds.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function ClaimIcon({ kind }: { kind: AnalysisClaim["claimKind"] }) {
  if (kind === "fact")
    return (
      <Shield1Check size={15} className="text-success-500" aria-hidden="true" />
    );
  if (kind === "inference")
    return (
      <CheckCircle1 size={15} className="text-info-500" aria-hidden="true" />
    );
  if (kind === "uncertainty")
    return (
      <InfoTriangle size={15} className="text-warning-500" aria-hidden="true" />
    );
  return <Sparkle size={15} className="text-primary-500" aria-hidden="true" />;
}
