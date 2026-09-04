"use client";

import { ErrorCircle1, InfoCircle } from "@tailgrids/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { useDirectorNextBestActionQuery } from "@/hooks/use-director-next-best-action-queries";
import { useDirectorNbaRecommendationsQuery } from "@/hooks/use-director-nba-recommendations-queries";
import type { DirectorNbaRecommendation } from "@/services/api/nba";

import DirectorRecommendationDetail from "./director-recommendation-detail";
import DirectorRecommendationList, {
  DirectorRecommendationListSkeleton,
} from "./director-recommendation-list";
import DirectorOperationalOverview from "./director-operational-overview";
import NextBestActionHeader from "./next-best-action-header";

const RECOMMENDATION_LIMIT = 50;

export default function NextBestActionWorkspace() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useDirectorNbaRecommendationsQuery({
    limit: RECOMMENDATION_LIMIT,
  });
  const operationalQuery = useDirectorNextBestActionQuery({
    queueFilter: "all",
    page: 1,
    pageSize: 8,
    outcomePeriod: "30d",
  });
  const recommendations = query.data?.recommendations ?? [];
  const selectedRecommendation: DirectorNbaRecommendation | null =
    recommendations.find(
      (recommendation) => recommendation.id === selectedId,
    ) ??
    recommendations[0] ??
    null;

  useEffect(() => {
    if (query.error) toast.error(query.error.message);
  }, [query.error]);

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-4 px-2 py-4 pb-8 lg:px-6"
    >
      <NextBestActionHeader
        meta={query.data?.meta}
        recommendationCount={recommendations.length}
      />

      {query.isLoading && <RecommendationWorkspaceSkeleton />}

      {!query.isLoading && query.isError && (
        <Card
          className="flex items-start gap-3 border-error-200 bg-badge-error-background p-5"
          role="alert"
        >
          <ErrorCircle1
            size={18}
            className="mt-0.5 shrink-0 text-error-600"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Chưa thể tải hàng đợi đề xuất
            </p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {query.error.message}
            </p>
            <Button
              appearance="outline"
              size="sm"
              className="mt-3"
              onPress={() => void query.refetch()}
            >
              Thử lại
            </Button>
          </div>
        </Card>
      )}

      {!query.isLoading && !query.isError && recommendations.length === 0 && (
        <EmptyRecommendationState />
      )}

      {!query.isLoading && !query.isError && recommendations.length > 0 && (
        <Card className="grid min-w-0 overflow-hidden p-0 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
          <section
            className="min-w-0 border-b border-card-border xl:border-r xl:border-b-0"
            aria-labelledby="recommendation-queue-heading"
          >
            <div className="flex items-start justify-between gap-3 border-b border-card-border px-5 py-4">
              <div>
                <h2
                  id="recommendation-queue-heading"
                  className="text-sm font-semibold text-text-primary"
                >
                  Đề xuất cần xem xét
                </h2>
                <p className="mt-1 text-xs leading-5 text-text-tertiary">
                  Thứ tự do bộ quyết định NBA tính theo tín hiệu hồ sơ.
                </p>
              </div>
              <span className="shrink-0 text-xs text-text-tertiary">
                {recommendations.length} đề xuất
              </span>
            </div>
            <DirectorRecommendationList
              recommendations={recommendations}
              selectedId={selectedRecommendation?.id ?? null}
              onSelect={setSelectedId}
            />
          </section>

          <DirectorRecommendationDetail
            recommendation={selectedRecommendation}
          />
        </Card>
      )}

      <DirectorOperationalOverview
        data={operationalQuery.data}
        isLoading={operationalQuery.isLoading}
        isError={operationalQuery.isError}
      />
    </main>
  );
}

function EmptyRecommendationState() {
  return (
    <Card className="flex min-h-72 items-start gap-3 p-5 sm:p-6">
      <InfoCircle
        size={18}
        className="mt-0.5 shrink-0 text-primary-500"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-semibold text-text-primary">
          Chưa có đề xuất cần xem xét
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
          Hiện chưa có đề xuất NBA nào ở trạng thái cần được xem xét. Hàng đợi
          sẽ cập nhật khi một lần đánh giá hoàn tất và tạo đề xuất mới.
        </p>
      </div>
    </Card>
  );
}

function RecommendationWorkspaceSkeleton() {
  return (
    <Card className="grid min-h-[520px] min-w-0 overflow-hidden p-0 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
      <section className="border-b border-card-border xl:border-r xl:border-b-0">
        <div className="border-b border-card-border px-5 py-4">
          <div className="h-4 w-40 animate-pulse-custom rounded-full bg-skeleton-gradient-50" />
          <div className="mt-2 h-3 w-56 animate-pulse-custom rounded-full bg-skeleton-gradient-50" />
        </div>
        <DirectorRecommendationListSkeleton />
      </section>
      <div className="hidden xl:block" aria-hidden="true" />
    </Card>
  );
}
