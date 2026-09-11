import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

export type TeamManagementSkeletonView = "overview" | "group" | "team";

interface TeamManagementSkeletonProps {
  view?: TeamManagementSkeletonView;
  message?: string;
}

export default function TeamManagementSkeleton({
  view = "overview",
  message = "Đang tải dữ liệu đội ngũ...",
}: TeamManagementSkeletonProps) {
  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
      aria-busy="true"
      aria-label={message}
    >
      {view === "overview" && <OverviewSkeleton />}
      {view === "group" && <GroupSkeleton />}
      {view === "team" && <TeamSkeleton />}
    </main>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <PageHeaderSkeleton
        descriptionLines={2}
        actionWidth="w-32"
        eyebrow
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <OverviewFactSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <GroupCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
}

function GroupSkeleton() {
  return (
    <>
      <PageHeaderSkeleton descriptionLines={1} actionWidth="w-28" withBackLink />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <OverviewFactSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SmallTeamCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
}

function TeamSkeleton() {
  return (
    <>
      <PageHeaderSkeleton descriptionLines={1} actionWidth="w-36" withBackLink />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <OverviewFactSkeleton key={index} />
        ))}
      </div>
      <Card className="overflow-hidden rounded-2xl border border-card-border p-0">
        <div className="flex items-center justify-between gap-4 border-b border-card-border px-6 py-4">
          <SkeletonBlock className="h-5 w-36 rounded-lg" />
          <SkeletonBlock className="h-9 w-44 rounded-lg" />
        </div>
        <div className="space-y-0 divide-y divide-card-border">
          {Array.from({ length: 5 }, (_, index) => (
            <TeamMemberRowSkeleton key={index} />
          ))}
        </div>
      </Card>
    </>
  );
}

function PageHeaderSkeleton({
  actionWidth,
  descriptionLines,
  eyebrow = false,
  withBackLink = false,
}: {
  actionWidth?: string;
  descriptionLines: number;
  eyebrow?: boolean;
  withBackLink?: boolean;
}) {
  return (
    <header className="flex min-h-40 flex-wrap items-start justify-between gap-4 rounded-2xl border border-card-border bg-card-background p-5 lg:p-7">
      <div className="min-w-0 flex-1">
        {eyebrow && <SkeletonBlock className="h-3.5 w-28 rounded-full" />}
        {withBackLink && <SkeletonBlock className="h-3 w-36 rounded-full" />}
        <SkeletonBlock
          className={`${eyebrow || withBackLink ? "mt-3" : "mt-0"} h-8 w-72 max-w-full rounded-lg`}
        />
        {Array.from({ length: descriptionLines }, (_, index) => (
          <SkeletonBlock
            key={index}
            className={`mt-2 h-4 rounded-full ${index === 0 ? "w-64 max-w-full" : "w-48 max-w-full"}`}
          />
        ))}
      </div>
      {actionWidth && <SkeletonBlock className={`h-10 ${actionWidth} rounded-lg`} />}
    </header>
  );
}

function OverviewFactSkeleton() {
  return (
    <Card className="flex min-w-0 items-center gap-4 rounded-2xl border border-card-border p-5">
      <SkeletonBlock className="size-11 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-24 rounded-full" />
        <SkeletonBlock className="h-8 w-16 rounded-lg" />
      </div>
    </Card>
  );
}

function GroupCardSkeleton() {
  return (
    <Card className="flex min-h-56 min-w-0 flex-col rounded-2xl border border-card-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBlock className="h-5 w-40 max-w-full rounded-lg" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <SkeletonBlock className="size-5 rounded-md" />
      </div>
      <div className="mt-5 flex items-center gap-2">
        <SkeletonBlock className="h-3 w-20 rounded-full" />
        <SkeletonBlock className="h-7 w-28 rounded-lg" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <SkeletonBlock className="h-3 w-24 rounded-full" />
        <SkeletonBlock className="h-7 w-32 rounded-lg" />
      </div>
      <SkeletonBlock className="mt-auto h-4 w-24 rounded-full" />
    </Card>
  );
}

function SmallTeamCardSkeleton() {
  return (
    <Card className="flex min-h-56 min-w-0 flex-col rounded-2xl border border-card-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBlock className="h-5 w-40 max-w-full rounded-lg" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <SkeletonBlock className="size-5 rounded-md" />
      </div>
      <div className="mt-5 flex items-center gap-1">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="size-8 rounded-full" />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <SkeletonBlock className="h-3 w-24 rounded-full" />
        <SkeletonBlock className="h-7 w-32 rounded-lg" />
      </div>
      <SkeletonBlock className="mt-auto h-4 w-28 rounded-full" />
    </Card>
  );
}

function TeamMemberRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <SkeletonBlock className="size-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-40 max-w-full rounded-full" />
        <SkeletonBlock className="h-3 w-28 max-w-full rounded-full" />
      </div>
      <SkeletonBlock className="hidden h-4 w-24 rounded-full sm:block" />
      <SkeletonBlock className="hidden h-8 w-16 rounded-lg sm:block" />
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <Skeleton aria-hidden="true" className={className} />;
}
