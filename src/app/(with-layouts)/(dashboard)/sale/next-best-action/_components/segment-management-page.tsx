"use client";

import { Plus } from "@tailgrids/icons";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SegmentList } from "@/components/segments/segment-list";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  TabContent,
  TabList,
  TabRoot,
  TabTrigger,
} from "@/components/tailgrids/core/tabs";

import SegmentAnalysisEmptyState from "./segment-analysis-empty-state";

export default function SegmentManagementPage({
  createHref,
}: {
  createHref: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("manage");

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-2 overflow-x-hidden px-2 py-4 pb-8 lg:px-6"
    >
      <header className="relative isolate overflow-hidden rounded-2xl border border-card-border bg-card-background px-5 py-5 shadow-xs sm:px-6 lg:px-7 lg:py-6">
        <div className="pointer-events-none absolute -top-24 -right-8 -z-10 size-72 rounded-full bg-primary-50/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-60 rounded-full bg-badge-sky-background/50 blur-3xl" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge color="primary">QUẢN LÝ SEGMENTS</Badge>
              <span className="text-xs text-text-tertiary">
                Không gian tuyển sinh
              </span>
            </div>
            <h1 className="mt-4 text-balance text-[26px] leading-8 font-semibold tracking-[-0.5px] text-text-primary sm:text-[30px]">
              Quản lý segments
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Xây dựng, theo dõi và sử dụng các nhóm học sinh trong quy trình
              tuyển sinh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="md"
              className="shrink-0"
              onPress={() => router.push(createHref)}
            >
              <Plus size={16} aria-hidden="true" />
              Tạo segment
            </Button>
          </div>
        </div>
      </header>

      <TabRoot
        defaultValue="manage"
        value={activeTab}
        onValueChange={setActiveTab}
        variant="minimal"
        className="overflow-hidden rounded-none border-0 bg-transparent"
      >
        <TabList className="px-1 sm:px-2">
          <TabTrigger value="manage">Quản lý</TabTrigger>
          <TabTrigger value="analyze">Phân tích</TabTrigger>
        </TabList>

        <TabContent value="manage" className="px-0 pt-5">
          <SegmentList detailBaseHref={pathname} />
        </TabContent>
        <TabContent value="analyze" className="px-0 pt-5">
          <SegmentAnalysisEmptyState
            enabled={activeTab === "analyze"}
            onViewSegments={() => setActiveTab("manage")}
          />
        </TabContent>
      </TabRoot>
    </main>
  );
}
