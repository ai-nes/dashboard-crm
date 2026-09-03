"use client";

import type { AcquisitionMapData } from "@/services/api/demographics/types";
import { AcquisitionMapDataProvider } from "./acquisition-map-context";
import { AcquisitionCohortPanels } from "./acquisition-cohort-panels";
import { AcquisitionFormPanels } from "./acquisition-form-panels";
import { AcquisitionPlatformPanels } from "./acquisition-platform-panels";
import { AcquisitionQualityPanels } from "./acquisition-quality-panels";

interface AcquisitionMapWorkspaceProps {
  data?: AcquisitionMapData;
  section: AcquisitionWorkspaceSection;
}

export type AcquisitionWorkspaceSection = "sources" | "forms" | "quality" | "operations";

export default function AcquisitionMapWorkspace({ data, section }: AcquisitionMapWorkspaceProps) {
  const content = {
    sources: <AcquisitionPlatformPanels />,
    forms: <AcquisitionFormPanels />,
    quality: <AcquisitionQualityPanels />,
    operations: <AcquisitionCohortPanels />,
  };

  return (
    <AcquisitionMapDataProvider data={data}>
      <section className="min-w-0" aria-label="Phân tích học sinh">
        {content[section]}
      </section>
    </AcquisitionMapDataProvider>
  );
}
