import { initialDirectorKpis as defaultKpis } from "@/services/api/director-overview/data";
import DirectorKpiCard from "./kpi-card";
import type { DirectorKpi } from "./types";

interface DirectorKpiCardsProps {
  kpis?: DirectorKpi[];
}

export default function DirectorKpiCards({ kpis = defaultKpis }: DirectorKpiCardsProps) {
  const items = (kpis && kpis.length > 0 ? kpis : defaultKpis).slice(0, 5);

  return (
    <section aria-labelledby="director-kpi-heading">
      <div className="sr-only" id="director-kpi-heading">
        Các chỉ số tuyển sinh chính
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((kpi) => (
          <DirectorKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}
