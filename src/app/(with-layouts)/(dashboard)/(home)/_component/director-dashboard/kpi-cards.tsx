import { directorKpis } from "./data";
import CompactKpiStrip from "./compact-kpi-strip";
import DirectorKpiCard from "./kpi-card";

export default function DirectorKpiCards() {
  return (
    <section aria-labelledby="director-kpi-heading">
      <div className="sr-only" id="director-kpi-heading">
        Bộ chỉ số Admission Command Center
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {directorKpis.slice(0, 5).map((kpi) => (
          <DirectorKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <div className="mt-4">
        <CompactKpiStrip kpis={directorKpis.slice(5)} />
      </div>
    </section>
  );
}
