"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";
import { AcquisitionAttributionPanels } from "./acquisition-attribution-panels";
import { AcquisitionCohortPanels } from "./acquisition-cohort-panels";
import { AcquisitionFormPanels } from "./acquisition-form-panels";
import { AcquisitionPlatformPanels } from "./acquisition-platform-panels";
import { AcquisitionQualityPanels } from "./acquisition-quality-panels";

export default function AcquisitionMapWorkspace() {
  return (
    <section className="space-y-4" aria-labelledby="acquisition-map-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="acquisition-map-heading" className="text-lg font-semibold text-text-primary">Acquisition Map</h2>
            <Badge color="warning">UI đề xuất</Badge>
          </div>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-text-tertiary">
            Bộ 24 chart được chia theo câu hỏi vận hành. Dữ liệu bên dưới là trình diễn để chốt cách hiển thị trước khi nối API.
          </p>
        </div>
        <span className="text-xs text-text-tertiary">5 nhóm · 24 chart</span>
      </div>

      <TabRoot defaultValue="platform" className="overflow-hidden">
        <TabList className="px-2 sm:px-4">
          <TabTrigger value="platform" badge="5">Nguồn & ngân sách</TabTrigger>
          <TabTrigger value="forms" badge="4">Form</TabTrigger>
          <TabTrigger value="quality" badge="4">Chất lượng</TabTrigger>
          <TabTrigger value="attribution" badge="4">Attribution</TabTrigger>
          <TabTrigger value="operations" badge="7">Cohort & vận hành</TabTrigger>
        </TabList>

        <TabContent value="platform" className="px-3 py-5 sm:px-5">
          <AcquisitionPlatformPanels />
        </TabContent>
        <TabContent value="forms" className="px-3 py-5 sm:px-5">
          <AcquisitionFormPanels />
        </TabContent>
        <TabContent value="quality" className="px-3 py-5 sm:px-5">
          <AcquisitionQualityPanels />
        </TabContent>
        <TabContent value="attribution" className="px-3 py-5 sm:px-5">
          <AcquisitionAttributionPanels />
        </TabContent>
        <TabContent value="operations" className="px-3 py-5 sm:px-5">
          <AcquisitionCohortPanels />
        </TabContent>
      </TabRoot>
    </section>
  );
}
