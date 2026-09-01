"use client";

import type { ReactNode } from "react";

import type { AcquisitionMapData } from "@/services/api/demographics/types";
import { AcquisitionAttributionPanels } from "./acquisition-attribution-panels";
import { AcquisitionMapDataProvider } from "./acquisition-map-context";
import { AcquisitionCohortPanels } from "./acquisition-cohort-panels";
import { AcquisitionFormPanels } from "./acquisition-form-panels";
import { AcquisitionPlatformPanels } from "./acquisition-platform-panels";
import { AcquisitionQualityPanels } from "./acquisition-quality-panels";

interface AcquisitionMapWorkspaceProps {
  data?: AcquisitionMapData;
}

export default function AcquisitionMapWorkspace({ data }: AcquisitionMapWorkspaceProps) {
  return (
    <AcquisitionMapDataProvider data={data}>
      <section className="min-w-0 space-y-8" aria-label="Phân tích thu hút lead">
        <PanelGroup id="sources" title="Nguồn và ngân sách">
          <AcquisitionPlatformPanels />
        </PanelGroup>
        <PanelGroup id="forms" title="Biểu mẫu và chuyển đổi">
          <AcquisitionFormPanels />
        </PanelGroup>
        <PanelGroup id="quality" title="Chất lượng và định danh">
          <AcquisitionQualityPanels />
        </PanelGroup>
        <PanelGroup id="attribution" title="Attribution">
          <AcquisitionAttributionPanels />
        </PanelGroup>
        <PanelGroup id="operations" title="Cohort và vận hành">
          <AcquisitionCohortPanels />
        </PanelGroup>
      </section>
    </AcquisitionMapDataProvider>
  );
}

function PanelGroup({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 space-y-3" aria-labelledby={`acquisition-${id}`}>
      <h2 id={`acquisition-${id}`} className="text-sm font-semibold text-text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}
