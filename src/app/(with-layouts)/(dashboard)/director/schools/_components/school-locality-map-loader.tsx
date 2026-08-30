"use client";

import dynamic from "next/dynamic";

import type { SchoolLocalityContext } from "./school-locality-data";

const SchoolLocalityMap = dynamic(() => import("./school-locality-map"), {
  ssr: false,
  loading: () => <div className="flex h-80 min-h-80 items-center justify-center rounded-2xl border border-card-border bg-background-soft-50 text-xs text-text-tertiary sm:h-104 sm:min-h-104">Đang tải bản đồ địa bàn…</div>,
});

export default function SchoolLocalityMapLoader({ context, className }: { context: SchoolLocalityContext; className?: string }) {
  return <SchoolLocalityMap className={className} context={context} />;
}
