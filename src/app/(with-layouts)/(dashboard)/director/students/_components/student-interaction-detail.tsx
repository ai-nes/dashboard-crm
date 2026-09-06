"use client";

import {
  Eye,
  EyeDisabled,
  InfoCircle,
  Locked3,
  RefreshCircle1Clockwise,
} from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import {
  useInteractionCatalogQuery,
  useInteractionDetailQuery,
  useInteractionEvidenceQuery,
} from "@/hooks/use-interaction-intelligence-queries";

import {
  formatScore,
  getChannelLabel,
  getDirectionLabel,
  getEpisodeStateLabel,
  getImportanceLabel,
  getInteractionStateColor,
  getInteractionStateLabel,
  getIntentLabel,
} from "./student-interaction-utils";

interface StudentInteractionDetailProps {
  interactionId: string;
}

export default function StudentInteractionDetail({
  interactionId,
}: StudentInteractionDetailProps) {
  const [evidenceRequested, setEvidenceRequested] = useState(false);
  const catalogQuery = useInteractionCatalogQuery();
  const detailQuery = useInteractionDetailQuery(interactionId);
  const intentCatalog = useMemo(
    () =>
      new Map(
        (catalogQuery.data?.intentTypes ?? []).map((item) => [item.code, item]),
      ),
    [catalogQuery.data?.intentTypes],
  );
  const evidenceId =
    detailQuery.data?.evidence_ref ||
    detailQuery.data?.evidence_refs[0]?.id ||
    null;
  const evidenceQuery = useInteractionEvidenceQuery(
    evidenceId,
    evidenceRequested,
  );

  if (detailQuery.isPending) return <InteractionDetailSkeleton />;

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="border-t border-card-border bg-background-gray-secondary/30 p-4 sm:p-5">
        <div className="flex items-start gap-3 rounded-lg border border-error-500/30 bg-badge-error-background p-4 text-error-600">
          <InfoCircle
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Không thể tải nhận định tuyển sinh</p>
            <p className="mt-1 text-sm">
              {detailQuery.error?.message || "Hãy thử tải lại chi tiết này."}
            </p>
            <Button
              type="button"
              variant="danger"
              appearance="ghost"
              size="sm"
              className="mt-3 min-h-11 px-0"
              onPress={() => detailQuery.refetch()}
            >
              <RefreshCircle1Clockwise size={16} />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const detail = detailQuery.data;
  const analysisState =
    detail.analysis?.state || detail.interaction.analysis_state;
  const hasIntent = detail.intents.length > 0;
  const hasScore = detail.score_effects.length > 0;

  return (
    <div className="border-t border-card-border bg-background-gray-secondary/30 p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
        <div className="space-y-5">
          <section aria-labelledby={`interaction-summary-${interactionId}`}>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                id={`interaction-summary-${interactionId}`}
                className="text-sm font-semibold text-text-primary"
              >
                Nhận định từ hoạt động
              </h3>
              <Badge color={getInteractionStateColor(analysisState)} size="sm">
                {getInteractionStateLabel(analysisState)}
              </Badge>
            </div>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <DetailField
                label="Kênh liên hệ"
                value={getChannelLabel(detail.interaction.channel)}
              />
              <DetailField
                label="Chiều liên hệ"
                value={getDirectionLabel(detail.interaction.direction)}
              />
              <DetailField
                label="Trạng thái theo dõi"
                value={getEpisodeStateLabel(detail.interaction.episode_state)}
              />
              <DetailField
                label="Lần cập nhật dữ liệu"
                value={
                  detail.revision?.source_revision ??
                  detail.interaction.source_revision ??
                  "—"
                }
              />
            </dl>
          </section>

          <section aria-labelledby={`interaction-intent-${interactionId}`}>
            <h3
              id={`interaction-intent-${interactionId}`}
              className="text-sm font-semibold text-text-primary"
            >
              Nhu cầu tuyển sinh
            </h3>
            {hasIntent ? (
              <div className="mt-3 space-y-2">
                {detail.intents.map((intent, index) => (
                  <div
                    key={intent.id || `${intent.semantic_key}-${index}`}
                    className="rounded-lg border border-card-border bg-card-background p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-text-primary">
                        {getIntentLabel(
                          intent.semantic_key,
                          intent.display_name,
                          intent.term_id,
                          intentCatalog,
                        )}
                      </span>
                      {typeof intent.confidence === "number" ? (
                        <Badge color="sky" size="sm">
                          Độ tin cậy {formatScore(intent.confidence)}%
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-tertiary">
                      {intent.role ? <span>Vai trò: {intent.role}</span> : null}
                      {intent.polarity ? (
                        <span>Xu hướng: {intent.polarity}</span>
                      ) : null}
                      {intent.importance ? (
                        <span>
                          Mức độ quan tâm:{" "}
                          {getImportanceLabel(intent.importance)}
                        </span>
                      ) : null}
                    </div>
                    {intent.notes ? (
                      <p className="mt-2 text-sm leading-5 text-text-secondary">
                        {intent.notes}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-text-secondary">
                <InfoCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-text-tertiary"
                  aria-hidden="true"
                />
                {analysisState === "unknown"
                  ? "Chưa đủ thông tin để xác định nhu cầu tuyển sinh."
                  : analysisState === "failed"
                    ? "Hệ thống chưa hoàn tất việc phân tích hoạt động này."
                    : "Chưa ghi nhận nhu cầu tuyển sinh rõ ràng từ hoạt động này."}
              </p>
            )}
          </section>

          <section aria-labelledby={`interaction-score-${interactionId}`}>
            <div className="flex items-center justify-between gap-3">
              <h3
                id={`interaction-score-${interactionId}`}
                className="text-sm font-semibold text-text-primary"
              >
                Ảnh hưởng đến điểm đánh giá
              </h3>
              {detail.analysis?.policy_revision ? (
                <span className="text-xs text-text-tertiary">
                  Policy {detail.analysis.policy_revision}
                </span>
              ) : null}
            </div>
            {hasScore ? (
              <div className="mt-3 space-y-2">
                {detail.score_effects.map((effect, index) => {
                  const delta = effect.delta ?? effect.score_change;
                  return (
                    <div
                      key={effect.id || `${effect.source_key}-${index}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 border-b border-card-border/70 pb-2 last:border-b-0 last:pb-0"
                    >
                      <span className="min-w-0 text-sm text-text-secondary">
                        {effect.display_reason ||
                          "Ảnh hưởng từ hoạt động tuyển sinh"}
                      </span>
                      <span
                        className={
                          typeof delta === "number" && delta < 0
                            ? "shrink-0 font-semibold text-error-600"
                            : "shrink-0 font-semibold text-success-600"
                        }
                      >
                        {typeof delta === "number" && delta > 0 ? "+" : ""}
                        {formatScore(delta)}
                      </span>
                      {effect.final_score !== null &&
                      effect.final_score !== undefined ? (
                        <span className="w-full text-xs text-text-tertiary">
                          Điểm sau cập nhật: {formatScore(effect.final_score)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-text-secondary">
                Chưa có thay đổi điểm đánh giá từ hoạt động này.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4 rounded-lg border border-card-border bg-card-background p-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Nội dung tham chiếu
            </h3>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Nội dung trao đổi gốc chỉ hiển thị khi bạn yêu cầu và theo quyền
              CRM.
            </p>
          </div>

          {detail.evidence_refs.length > 0 ? (
            <div
              className="space-y-2"
              aria-label="Danh sách nội dung tham chiếu"
            >
              {detail.evidence_refs.map((reference) => (
                <div
                  key={reference.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="min-w-0 truncate text-text-secondary">
                    {reference.id}
                  </span>
                  <span className="shrink-0 text-text-tertiary">
                    {reference.speaker_role || "Không rõ vai trò"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              Hoạt động này chưa có nội dung tham chiếu.
            </p>
          )}

          {evidenceId ? (
            <Button
              type="button"
              appearance="outline"
              size="sm"
              className="min-h-11 w-full"
              onPress={() => {
                if (evidenceQuery.isError) {
                  void evidenceQuery.refetch();
                  return;
                }
                setEvidenceRequested(true);
              }}
              isDisabled={evidenceRequested && evidenceQuery.isPending}
            >
              {evidenceQuery.isError ? (
                <RefreshCircle1Clockwise size={16} />
              ) : evidenceRequested ? (
                <EyeDisabled size={16} />
              ) : (
                <Eye size={16} />
              )}
              {evidenceQuery.isError
                ? "Thử tải nội dung tham chiếu"
                : evidenceRequested
                  ? "Đã yêu cầu nội dung tham chiếu"
                  : "Xem nội dung trao đổi gốc"}
            </Button>
          ) : null}

          {evidenceRequested ? <EvidenceResult query={evidenceQuery} /> : null}
        </aside>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="mt-0.5 font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function EvidenceResult({
  query,
}: {
  query: ReturnType<typeof useInteractionEvidenceQuery>;
}) {
  if (query.isPending) {
    return <Skeleton className="h-24 w-full rounded-lg" />;
  }

  if (query.isError) {
    return (
      <p className="text-sm leading-5 text-error-600">
        Không thể tải nội dung tham chiếu. {query.error.message}
      </p>
    );
  }

  const evidence = query.data;
  if (!evidence) return null;

  if (
    evidence.content_redacted ||
    evidence.content === null ||
    evidence.content === undefined
  ) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-badge-neutral-background p-3 text-sm leading-5 text-text-secondary">
        <Locked3 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        Nội dung trao đổi gốc không khả dụng với quyền hiện tại. Thông tin mô tả
        vẫn được giữ lại.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-background-gray-secondary p-3">
      <p className="mb-1 flex items-center gap-1 text-xs font-medium text-text-tertiary">
        <Eye size={14} aria-hidden="true" /> Nội dung trao đổi gốc
      </p>
      <p className="whitespace-pre-wrap text-sm leading-5 text-text-primary">
        {evidence.content}
      </p>
    </div>
  );
}

function InteractionDetailSkeleton() {
  return (
    <div
      className="border-t border-card-border bg-background-gray-secondary/30 p-5"
      aria-busy="true"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}
