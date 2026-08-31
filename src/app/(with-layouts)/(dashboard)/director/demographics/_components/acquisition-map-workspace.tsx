"use client";

import { ContactLatencyChart } from "./acquisition-cohort-panels";
import { FormFunnelChart } from "./acquisition-form-panels";
import { PlatformLeadCostChart } from "./acquisition-platform-panels";
import { QualityBySourceChart } from "./acquisition-quality-panels";

export default function AcquisitionMapWorkspace() {
  return (
    <section className="grid min-w-0 grid-cols-1 gap-8 xl:grid-cols-2" aria-label="Phân tích thu hút lead">
      <PlatformLeadCostChart />
      <FormFunnelChart />
      <QualityBySourceChart />
      <ContactLatencyChart />
    </section>
  );
}
