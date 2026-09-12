import type { ReactNode } from "react";

import { Skeleton } from "@/components/tailgrids/core/skeleton";

interface SkeletonStateProps {
  label: string;
  children: ReactNode;
}

interface SkeletonGroupProps {
  children: ReactNode;
  labelWidth?: string;
}

function SkeletonState({ label, children }: SkeletonStateProps) {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

function SkeletonGroup({ children, labelWidth = "w-24" }: SkeletonGroupProps) {
  return (
    <section className="space-y-3" aria-hidden="true">
      <div className="flex items-center gap-2">
        <Skeleton className={`h-4 ${labelWidth}`} />
        <Skeleton className="h-5 w-7" />
        <span className="h-px flex-1 bg-card-border" />
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ActivityCardSkeleton({ children }: { children: ReactNode }) {
  return (
    <article
      className="overflow-hidden rounded-xl border border-card-border bg-card-background shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-3 bg-background-gray-secondary/30 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Skeleton className="size-4 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-40 max-w-[60%]" />
        </div>
        <Skeleton className="h-3 w-28 shrink-0" />
      </div>
      <div className="space-y-4 border-t border-card-border px-4 py-4 sm:px-5">
        {children}
      </div>
    </article>
  );
}

function NoteCardSkeleton() {
  return (
    <ActivityCardSkeleton>
      <Skeleton className="h-4 w-full max-w-3xl" />
      <Skeleton className="h-4 w-4/5 max-w-2xl" />
      <Skeleton className="h-4 w-2/5 max-w-sm" />
    </ActivityCardSkeleton>
  );
}

function CallCardSkeleton() {
  return (
    <ActivityCardSkeleton>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["w-24", "w-28", "w-32", "w-20"].map((width) => (
          <div key={width} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className={`h-4 ${width}`} />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-card-border pt-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </ActivityCardSkeleton>
  );
}

function TaskCardSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-3 bg-background-gray-secondary/30 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Skeleton className="size-4 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-48 max-w-[65%]" />
        </div>
        <Skeleton className="h-3 w-24 shrink-0" />
      </div>
      <div className="space-y-4 border-t border-border-primary px-4 py-4 sm:px-5">
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/5 max-w-lg" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-4/5 max-w-xl" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </article>
  );
}

function ZaloConversationSkeleton() {
  return (
    <section className="space-y-3" aria-hidden="true">
      <div className="flex items-center justify-between gap-3 border-b border-card-border pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-4 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-44 max-w-[60%]" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-28 shrink-0" />
      </div>
      <div className="relative ml-3 space-y-5 border-l border-card-border pl-6">
        <ZaloMessageSkeleton align="left" />
        <ZaloMessageSkeleton align="right" />
      </div>
    </section>
  );
}

function ZaloMessageSkeleton({ align }: { align: "left" | "right" }) {
  return (
    <div className={`relative flex ${align === "right" ? "justify-end" : ""}`}>
      <Skeleton className="absolute -left-[2.05rem] top-0 size-7 rounded-full" />
      <div className="w-full max-w-xl space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton
          className={`h-16 w-4/5 rounded-2xl ${align === "right" ? "ml-auto" : ""}`}
        />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StudentTaskListSkeleton() {
  return (
    <SkeletonState label="Đang tải task">
      <SkeletonGroup labelWidth="w-20">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </SkeletonGroup>
    </SkeletonState>
  );
}

export function StudentNotesSkeleton() {
  return (
    <SkeletonState label="Đang tải ghi chú">
      <SkeletonGroup>
        <NoteCardSkeleton />
        <NoteCardSkeleton />
      </SkeletonGroup>
    </SkeletonState>
  );
}

export function StudentCallsSkeleton() {
  return (
    <SkeletonState label="Đang tải lịch sử cuộc gọi">
      <SkeletonGroup labelWidth="w-28">
        <CallCardSkeleton />
        <CallCardSkeleton />
      </SkeletonGroup>
    </SkeletonState>
  );
}

export function StudentZaloSkeleton() {
  return (
    <SkeletonState label="Đang tải tin nhắn Zalo">
      <ZaloConversationSkeleton />
      <ZaloConversationSkeleton />
    </SkeletonState>
  );
}

export function CallLogPopoverSkeleton() {
  return (
    <div
      className="mt-4 space-y-3 border-t border-card-border pt-3"
      role="status"
      aria-label="Đang tải ghi âm cuộc gọi"
    >
      <span className="sr-only">Đang tải ghi âm cuộc gọi</span>
      <Skeleton className="h-3 w-36" />
      <div className="space-y-2" aria-hidden="true">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
